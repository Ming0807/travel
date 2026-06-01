-- Migration: 20260530000000_create_update_route_stops_rpc
-- Description: Create an RPC function that atomically replaces route stops in a single transaction,
-- preventing data loss if the insert step fails after the delete step succeeds.

CREATE OR REPLACE FUNCTION public.update_route_stops(
    p_route_id bigint,
    p_stops_json jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
    v_stop jsonb;
    v_attraction_id bigint;
    v_day_number integer;
    v_display_order integer;
    v_stop_note_th text;
    v_stop_note_en text;
    v_inserted_count integer := 0;
    v_total_count integer;
BEGIN
    -- Count input stops
    v_total_count := jsonb_array_length(p_stops_json);

    -- Begin atomic transaction block
    -- Delete all existing stops for this route
    DELETE FROM public.suggested_route_stops
    WHERE route_id = p_route_id;

    -- Insert new stops if any
    IF v_total_count > 0 THEN
        FOR v_stop IN SELECT * FROM jsonb_array_elements(p_stops_json)
        LOOP
            v_attraction_id := (v_stop->>'attractionId')::bigint;
            v_day_number := (v_stop->>'dayNumber')::integer;
            v_display_order := (v_stop->>'displayOrder')::integer;
            v_stop_note_th := v_stop->>'stopNoteTh';
            v_stop_note_en := v_stop->>'stopNoteEn';

            -- Convert empty strings to null for optional fields
            IF v_stop_note_th = '' THEN
                v_stop_note_th := NULL;
            END IF;
            IF v_stop_note_en = '' THEN
                v_stop_note_en := NULL;
            END IF;

            INSERT INTO public.suggested_route_stops (
                route_id,
                attraction_id,
                day_number,
                display_order,
                stop_note_th,
                stop_note_en
            ) VALUES (
                p_route_id,
                v_attraction_id,
                v_day_number,
                v_display_order,
                v_stop_note_th,
                v_stop_note_en
            );

            v_inserted_count := v_inserted_count + 1;
        END LOOP;
    END IF;

    -- If we got here, both delete and insert succeeded
    RETURN jsonb_build_object(
        'success', true,
        'inserted', v_inserted_count,
        'deleted_before_insert', true
    );
EXCEPTION
    WHEN OTHERS THEN
        -- The entire transaction rolls back automatically in PL/pgSQL
        -- No data is lost — the delete is also rolled back
        RETURN jsonb_build_object(
            'success', false,
            'error', SQLERRM,
            'error_code', SQLSTATE,
            'detail', 'Transaction rolled back — no route stops were modified.'
        );
END;
$$;
