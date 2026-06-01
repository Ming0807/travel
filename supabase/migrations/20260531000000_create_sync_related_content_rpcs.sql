-- =============================================
-- Migration: Create sync RPCs with atomic transactions
-- Date: 2026-05-31
--
-- Wraps delete + insert patterns in PL/pgSQL
-- atomic blocks so data isn't lost if insert fails.
-- =============================================

-- =============================================
-- 1. sync_admin_user_roles
--    Replaces all roles for an admin user atomically.
-- =============================================
CREATE OR REPLACE FUNCTION public.sync_admin_user_roles(
    p_admin_id uuid,
    p_role_ids bigint[]
) RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
    v_inserted int;
BEGIN
    DELETE FROM public.admin_user_roles WHERE admin_id = p_admin_id;

    IF array_length(p_role_ids, 1) > 0 THEN
        INSERT INTO public.admin_user_roles (admin_id, role_id)
        SELECT p_admin_id, unnest(p_role_ids);

        GET DIAGNOSTICS v_inserted = ROW_COUNT;
    ELSE
        v_inserted := 0;
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'inserted', v_inserted,
        'assigned_to', p_admin_id::text
    );
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', SQLERRM,
            'error_code', SQLSTATE,
            'hint', 'The transaction was rolled back — no data was lost.'
        );
END;
$$;

-- =============================================
-- 2. sync_role_permissions
--    Replaces all permissions for a role atomically.
-- =============================================
CREATE OR REPLACE FUNCTION public.sync_role_permissions(
    p_role_id bigint,
    p_permission_ids bigint[]
) RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
    v_inserted int;
BEGIN
    DELETE FROM public.role_permissions WHERE role_id = p_role_id;

    IF array_length(p_permission_ids, 1) > 0 THEN
        INSERT INTO public.role_permissions (role_id, permission_id)
        SELECT p_role_id, unnest(p_permission_ids);

        GET DIAGNOSTICS v_inserted = ROW_COUNT;
    ELSE
        v_inserted := 0;
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'inserted', v_inserted,
        'assigned_to_role', p_role_id
    );
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', SQLERRM,
            'error_code', SQLSTATE,
            'hint', 'The transaction was rolled back — no data was lost.'
        );
END;
$$;

-- =============================================
-- 3. sync_attraction_related_content
--    Replaces related content for an attraction
--    (attractions, restaurants, accommodations, stories)
--    atomically using dynamic SQL for 4 junction tables.
-- =============================================
CREATE OR REPLACE FUNCTION public.sync_attraction_related_content(
    p_attraction_id bigint,
    p_entity_type text,
    p_related_ids bigint[]
) RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
    v_table_name text;
    v_fk_column text;
    v_display_order int;
    v_sql text;
    v_inserted int;
BEGIN
    -- Map entity_type to table name and foreign key column
    CASE p_entity_type
        WHEN 'attractions' THEN
            v_table_name := 'attraction_related_attractions';
            v_fk_column := 'related_attraction_id';
        WHEN 'restaurants' THEN
            v_table_name := 'attraction_related_restaurants';
            v_fk_column := 'restaurant_id';
        WHEN 'accommodations' THEN
            v_table_name := 'attraction_related_accommodations';
            v_fk_column := 'accommodation_id';
        WHEN 'stories' THEN
            v_table_name := 'attraction_related_stories';
            v_fk_column := 'story_id';
        ELSE
            RETURN jsonb_build_object(
                'success', false,
                'error', format('Unknown entity_type: %s. Must be attractions, restaurants, accommodations, or stories.', p_entity_type),
                'error_code', 'INVALID_ENTITY_TYPE'
            );
    END CASE;

    -- Delete existing
    v_sql := format('DELETE FROM public.%I WHERE attraction_id = $1', v_table_name);
    EXECUTE v_sql USING p_attraction_id;

    -- Insert new
    IF array_length(p_related_ids, 1) > 0 THEN
        v_sql := format(
            'INSERT INTO public.%I (attraction_id, %I, display_order) ' ||
            'SELECT $1, unnest($2), generate_series(1, array_length($2, 1))',
            v_table_name, v_fk_column
        );
        EXECUTE v_sql USING p_attraction_id, p_related_ids;

        GET DIAGNOSTICS v_inserted = ROW_COUNT;
    ELSE
        v_inserted := 0;
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'inserted', v_inserted,
        'entity_type', p_entity_type,
        'attraction_id', p_attraction_id
    );
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', SQLERRM,
            'error_code', SQLSTATE,
            'hint', 'The transaction was rolled back — no data was lost.'
        );
END;
$$;
