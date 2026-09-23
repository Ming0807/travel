BEGIN;

ALTER TABLE public.attraction_improvement_actions
  ADD COLUMN verification_snapshot jsonb;

ALTER TABLE public.attraction_improvement_actions
  ADD CONSTRAINT attraction_improvement_verification_snapshot_shape_check
  CHECK (verification_snapshot IS NULL OR (
    jsonb_typeof(verification_snapshot) = 'object'
    AND verification_snapshot->>'schemaVersion' = '1'
    AND jsonb_typeof(verification_snapshot->'baseline') = 'object'
    AND jsonb_typeof(verification_snapshot->'followUp') = 'object'
  ));

CREATE FUNCTION public.prevent_attraction_improvement_verification_snapshot_mutation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF OLD.verification_snapshot IS NOT NULL
    AND NEW.verification_snapshot IS DISTINCT FROM OLD.verification_snapshot THEN
    RAISE EXCEPTION 'VERIFICATION_SNAPSHOT_IMMUTABLE';
  END IF;
  IF NEW.verification_snapshot IS NOT NULL AND NEW.status <> 'verified' THEN
    RAISE EXCEPTION 'VERIFICATION_SNAPSHOT_REQUIRES_VERIFIED_STATUS';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER prevent_attraction_improvement_verification_snapshot_mutation
BEFORE UPDATE OF verification_snapshot ON public.attraction_improvement_actions
FOR EACH ROW EXECUTE FUNCTION public.prevent_attraction_improvement_verification_snapshot_mutation();

CREATE FUNCTION public.transition_attraction_improvement_action(
  p_action_id uuid,
  p_expected_from_status text,
  p_to_status text,
  p_changed_by uuid,
  p_note text,
  p_completion_evidence_note text,
  p_verification_snapshot jsonb
)
RETURNS public.attraction_improvement_actions
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_action public.attraction_improvement_actions;
  v_evidence text;
BEGIN
  IF p_to_status NOT IN ('planned', 'in_progress', 'completed', 'verified', 'cancelled') THEN
    RAISE EXCEPTION 'INVALID_IMPROVEMENT_ACTION_STATUS';
  END IF;

  SELECT * INTO v_action
  FROM public.attraction_improvement_actions
  WHERE improvement_action_id = p_action_id
  FOR UPDATE;

  IF NOT FOUND OR v_action.status IS DISTINCT FROM p_expected_from_status THEN
    RAISE EXCEPTION 'IMPROVEMENT_ACTION_STATUS_CONFLICT';
  END IF;

  IF NOT (
    (p_expected_from_status = 'planned' AND p_to_status IN ('in_progress', 'cancelled'))
    OR (p_expected_from_status = 'in_progress' AND p_to_status IN ('completed', 'cancelled'))
    OR (p_expected_from_status = 'completed' AND p_to_status = 'verified')
  ) THEN
    RAISE EXCEPTION 'INVALID_IMPROVEMENT_ACTION_TRANSITION';
  END IF;

  v_evidence := coalesce(nullif(trim(p_completion_evidence_note), ''), v_action.completion_evidence_note);

  IF p_to_status = 'completed' AND v_evidence IS NULL THEN
    RAISE EXCEPTION 'COMPLETION_EVIDENCE_REQUIRED';
  END IF;
  IF p_to_status = 'verified' THEN
    IF v_evidence IS NULL OR current_date <= v_action.follow_up_end THEN
      RAISE EXCEPTION 'FOLLOW_UP_NOT_COMPLETE';
    END IF;
    IF p_verification_snapshot IS NULL
      OR jsonb_typeof(p_verification_snapshot) <> 'object'
      OR p_verification_snapshot->>'schemaVersion' <> '1'
      OR p_verification_snapshot->>'sourceIssueId' IS DISTINCT FROM v_action.feedback_issue_id::text
      OR p_verification_snapshot->>'metric' IS DISTINCT FROM v_action.follow_up_metric
      OR p_verification_snapshot#>>'{followUp,start}' IS DISTINCT FROM v_action.follow_up_start::text
      OR p_verification_snapshot#>>'{followUp,end}' IS DISTINCT FROM v_action.follow_up_end::text THEN
      RAISE EXCEPTION 'VERIFICATION_SNAPSHOT_INVALID';
    END IF;
  ELSIF p_verification_snapshot IS NOT NULL THEN
    RAISE EXCEPTION 'VERIFICATION_SNAPSHOT_UNEXPECTED';
  END IF;
  IF p_to_status = 'cancelled' AND length(trim(coalesce(p_note, ''))) = 0 THEN
    RAISE EXCEPTION 'CANCELLATION_NOTE_REQUIRED';
  END IF;

  UPDATE public.attraction_improvement_actions
  SET status = p_to_status,
      completion_evidence_note = v_evidence,
      completion_note = CASE WHEN p_note IS NULL THEN completion_note ELSE p_note END,
      completed_at = CASE WHEN p_to_status = 'completed' THEN now() ELSE completed_at END,
      verified_by = CASE WHEN p_to_status = 'verified' THEN p_changed_by ELSE verified_by END,
      verified_at = CASE WHEN p_to_status = 'verified' THEN now() ELSE verified_at END,
      verification_snapshot = CASE WHEN p_to_status = 'verified' THEN p_verification_snapshot ELSE v_action.verification_snapshot END,
      cancellation_note = CASE WHEN p_to_status = 'cancelled' THEN p_note ELSE cancellation_note END,
      cancelled_at = CASE WHEN p_to_status = 'cancelled' THEN now() ELSE cancelled_at END,
      updated_at = now()
  WHERE improvement_action_id = p_action_id
  RETURNING * INTO v_action;

  INSERT INTO public.attraction_improvement_action_history (
    improvement_action_id, from_status, to_status, changed_by, note
  ) VALUES (p_action_id, p_expected_from_status, p_to_status, p_changed_by, p_note);

  RETURN v_action;
END;
$$;

-- Keep the pre-deployment RPC signature available while old app instances drain.
-- Verification via that signature is rejected because it cannot supply a snapshot.
CREATE OR REPLACE FUNCTION public.transition_attraction_improvement_action(
  p_action_id uuid,
  p_expected_from_status text,
  p_to_status text,
  p_changed_by uuid,
  p_note text DEFAULT NULL,
  p_completion_evidence_note text DEFAULT NULL
)
RETURNS public.attraction_improvement_actions
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT public.transition_attraction_improvement_action(
    p_action_id, p_expected_from_status, p_to_status, p_changed_by,
    p_note, p_completion_evidence_note, NULL
  );
$$;

REVOKE ALL ON FUNCTION public.transition_attraction_improvement_action(uuid, text, text, uuid, text, text, jsonb)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.transition_attraction_improvement_action(uuid, text, text, uuid, text, text, jsonb)
  TO service_role;
REVOKE ALL ON FUNCTION public.transition_attraction_improvement_action(uuid, text, text, uuid, text, text)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.transition_attraction_improvement_action(uuid, text, text, uuid, text, text)
  TO service_role;
REVOKE ALL ON FUNCTION public.prevent_attraction_improvement_verification_snapshot_mutation()
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.prevent_attraction_improvement_verification_snapshot_mutation()
  TO service_role;

COMMIT;
