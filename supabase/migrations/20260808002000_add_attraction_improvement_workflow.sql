-- Bounded, production feedback-to-improvement workflow.
-- These records are operational management data, not research responses.

CREATE TABLE public.attraction_feedback_issues (
  feedback_issue_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  attraction_id bigint NOT NULL REFERENCES public.attractions(attraction_id) ON DELETE RESTRICT,
  issue_dimension text NOT NULL CHECK (issue_dimension IN (
    'overall', 'facility', 'cleanliness', 'safety', 'accessibility', 'information', 'value'
  )),
  issue_category text NOT NULL CHECK (issue_category IN (
    'facilities', 'cleanliness', 'safety', 'accessibility', 'information_signage',
    'value', 'service', 'maintenance', 'other'
  )),
  rule_version varchar(50) NOT NULL CHECK (rule_version ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'dismissed', 'closed')),
  baseline_start date NOT NULL,
  baseline_end date NOT NULL,
  comparison_start date,
  comparison_end date,
  visit_count integer NOT NULL CHECK (visit_count >= 30),
  response_count integer NOT NULL CHECK (response_count >= 30 AND response_count <= visit_count),
  response_coverage numeric(5,4) NOT NULL CHECK (response_coverage >= 0 AND response_coverage <= 1),
  current_score numeric(3,2) NOT NULL CHECK (current_score >= 1 AND current_score <= 5),
  comparison_score numeric(3,2) CHECK (comparison_score IS NULL OR (comparison_score >= 1 AND comparison_score <= 5)),
  structured_recurrence_count integer NOT NULL CHECK (
    structured_recurrence_count >= 3 AND structured_recurrence_count <= response_count
  ),
  evidence_snapshot jsonb NOT NULL CHECK (jsonb_typeof(evidence_snapshot) = 'object'),
  review_note text,
  reviewed_by uuid NOT NULL REFERENCES public.admin_users(admin_id) ON DELETE RESTRICT,
  reviewed_at timestamptz NOT NULL DEFAULT now(),
  closed_by uuid REFERENCES public.admin_users(admin_id) ON DELETE RESTRICT,
  closed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz,
  CONSTRAINT attraction_feedback_issue_baseline_dates_check CHECK (baseline_end >= baseline_start),
  CONSTRAINT attraction_feedback_issue_coverage_check CHECK (
    response_coverage = round(response_count::numeric / visit_count::numeric, 4)
  ),
  CONSTRAINT attraction_feedback_issue_rule_snapshot_check CHECK (
    evidence_snapshot->>'ruleVersion' = rule_version
  ),
  CONSTRAINT attraction_feedback_issue_comparison_dates_check CHECK (
    (comparison_start IS NULL AND comparison_end IS NULL)
    OR (comparison_start IS NOT NULL AND comparison_end IS NOT NULL AND comparison_end >= comparison_start)
  ),
  CONSTRAINT attraction_feedback_issue_dismiss_note_check CHECK (
    status <> 'dismissed' OR length(trim(coalesce(review_note, ''))) > 0
  ),
  CONSTRAINT attraction_feedback_issue_closed_fields_check CHECK (
    (status <> 'closed' AND closed_at IS NULL AND closed_by IS NULL)
    OR (status = 'closed' AND closed_at IS NOT NULL AND closed_by IS NOT NULL)
  )
);

CREATE TABLE public.attraction_improvement_actions (
  improvement_action_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  feedback_issue_id uuid NOT NULL REFERENCES public.attraction_feedback_issues(feedback_issue_id) ON DELETE RESTRICT,
  title varchar(160) NOT NULL CHECK (length(trim(title)) > 0),
  proposed_action text NOT NULL CHECK (length(trim(proposed_action)) > 0),
  owner_admin_id uuid NOT NULL REFERENCES public.admin_users(admin_id) ON DELETE RESTRICT,
  priority text NOT NULL CHECK (priority IN ('low', 'medium', 'high')),
  status text NOT NULL DEFAULT 'planned' CHECK (status IN (
    'planned', 'in_progress', 'completed', 'verified', 'cancelled'
  )),
  due_date date NOT NULL,
  follow_up_metric text NOT NULL CHECK (follow_up_metric IN (
    'overall_score', 'facility_score', 'cleanliness_score', 'safety_score',
    'accessibility_score', 'information_score', 'value_score',
    'response_coverage', 'structured_recurrence_count'
  )),
  follow_up_start date NOT NULL,
  follow_up_end date NOT NULL,
  completion_note text,
  completion_evidence_note text,
  completed_at timestamptz,
  verified_by uuid REFERENCES public.admin_users(admin_id) ON DELETE RESTRICT,
  verified_at timestamptz,
  cancellation_note text,
  cancelled_at timestamptz,
  created_by uuid NOT NULL REFERENCES public.admin_users(admin_id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz,
  CONSTRAINT attraction_improvement_action_follow_up_dates_check CHECK (follow_up_end >= follow_up_start),
  CONSTRAINT attraction_improvement_action_follow_up_due_date_check CHECK (follow_up_start >= due_date),
  CONSTRAINT attraction_improvement_action_completed_fields_check CHECK (
    status NOT IN ('completed', 'verified')
    OR (completed_at IS NOT NULL AND length(trim(coalesce(completion_evidence_note, ''))) > 0)
  ),
  CONSTRAINT attraction_improvement_action_verified_fields_check CHECK (
    status <> 'verified'
    OR (verified_at IS NOT NULL AND verified_by IS NOT NULL AND completed_at IS NOT NULL
      AND length(trim(coalesce(completion_evidence_note, ''))) > 0)
  ),
  CONSTRAINT attraction_improvement_action_cancelled_fields_check CHECK (
    status <> 'cancelled'
    OR (cancelled_at IS NOT NULL AND length(trim(coalesce(cancellation_note, ''))) > 0)
  )
);

CREATE TABLE public.attraction_improvement_action_history (
  history_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  feedback_issue_id uuid REFERENCES public.attraction_feedback_issues(feedback_issue_id) ON DELETE RESTRICT,
  improvement_action_id uuid REFERENCES public.attraction_improvement_actions(improvement_action_id) ON DELETE RESTRICT,
  from_status text,
  to_status text NOT NULL,
  changed_by uuid NOT NULL REFERENCES public.admin_users(admin_id) ON DELETE RESTRICT,
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT attraction_improvement_history_one_target_check CHECK (
    (feedback_issue_id IS NOT NULL AND improvement_action_id IS NULL)
    OR (feedback_issue_id IS NULL AND improvement_action_id IS NOT NULL)
  )
);

CREATE INDEX idx_attraction_feedback_issues_attraction_status
  ON public.attraction_feedback_issues(attraction_id, status, baseline_end DESC);
CREATE INDEX idx_attraction_feedback_issues_reviewed_at
  ON public.attraction_feedback_issues(reviewed_at DESC);
CREATE INDEX idx_attraction_improvement_actions_issue_status
  ON public.attraction_improvement_actions(feedback_issue_id, status);
CREATE INDEX idx_attraction_improvement_actions_owner_due
  ON public.attraction_improvement_actions(owner_admin_id, status, due_date);
CREATE INDEX idx_attraction_improvement_history_issue
  ON public.attraction_improvement_action_history(feedback_issue_id, created_at DESC);
CREATE INDEX idx_attraction_improvement_history_action
  ON public.attraction_improvement_action_history(improvement_action_id, created_at DESC);

CREATE UNIQUE INDEX uq_attraction_feedback_issue_scope
  ON public.attraction_feedback_issues(
    attraction_id, issue_dimension, issue_category, baseline_start, baseline_end
  );

CREATE UNIQUE INDEX uq_attraction_improvement_one_active_action_per_issue
  ON public.attraction_improvement_actions(feedback_issue_id)
  WHERE status IN ('planned', 'in_progress', 'completed');

CREATE OR REPLACE FUNCTION public.validate_attraction_improvement_action_owner()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.admin_users AS admin_user
    WHERE admin_user.admin_id = NEW.owner_admin_id
      AND admin_user.is_active = true
  ) THEN
    RAISE EXCEPTION 'ATTRACTION_IMPROVEMENT_OWNER_INACTIVE';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_attraction_improvement_action_owner
BEFORE INSERT OR UPDATE OF owner_admin_id ON public.attraction_improvement_actions
FOR EACH ROW EXECUTE FUNCTION public.validate_attraction_improvement_action_owner();

CREATE OR REPLACE FUNCTION public.prevent_attraction_improvement_history_mutation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RAISE EXCEPTION 'ATTRACTION_IMPROVEMENT_HISTORY_APPEND_ONLY';
END;
$$;

CREATE TRIGGER attraction_improvement_action_history_append_only
BEFORE UPDATE OR DELETE ON public.attraction_improvement_action_history
FOR EACH ROW EXECUTE FUNCTION public.prevent_attraction_improvement_history_mutation();

CREATE OR REPLACE FUNCTION public.record_attraction_feedback_issue_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.attraction_improvement_action_history (
    feedback_issue_id, from_status, to_status, changed_by, note
  ) VALUES (
    NEW.feedback_issue_id, NULL, NEW.status, NEW.reviewed_by, NEW.review_note
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER attraction_feedback_issue_history_on_insert
AFTER INSERT ON public.attraction_feedback_issues
FOR EACH ROW EXECUTE FUNCTION public.record_attraction_feedback_issue_insert();

CREATE OR REPLACE FUNCTION public.record_attraction_improvement_action_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.attraction_improvement_action_history (
    improvement_action_id, from_status, to_status, changed_by, note
  ) VALUES (
    NEW.improvement_action_id, NULL, NEW.status, NEW.created_by, NULL
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER attraction_improvement_action_history_on_insert
AFTER INSERT ON public.attraction_improvement_actions
FOR EACH ROW EXECUTE FUNCTION public.record_attraction_improvement_action_insert();

CREATE OR REPLACE FUNCTION public.transition_attraction_feedback_issue(
  p_issue_id uuid,
  p_expected_from_status text,
  p_to_status text,
  p_changed_by uuid,
  p_note text DEFAULT NULL
)
RETURNS public.attraction_feedback_issues
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_issue public.attraction_feedback_issues;
BEGIN
  IF p_to_status NOT IN ('open', 'dismissed', 'closed') THEN
    RAISE EXCEPTION 'INVALID_FEEDBACK_ISSUE_STATUS';
  END IF;

  SELECT * INTO v_issue
  FROM public.attraction_feedback_issues
  WHERE feedback_issue_id = p_issue_id
  FOR UPDATE;

  IF NOT FOUND OR v_issue.status IS DISTINCT FROM p_expected_from_status THEN
    RAISE EXCEPTION 'FEEDBACK_ISSUE_STATUS_CONFLICT';
  END IF;

  IF p_to_status = 'dismissed' AND length(trim(coalesce(p_note, ''))) = 0 THEN
    RAISE EXCEPTION 'FEEDBACK_ISSUE_DISMISS_NOTE_REQUIRED';
  END IF;

  IF NOT (
    (p_expected_from_status = 'open' AND p_to_status IN ('dismissed', 'closed'))
  ) THEN
    RAISE EXCEPTION 'INVALID_FEEDBACK_ISSUE_TRANSITION';
  END IF;

  IF p_to_status = 'closed' AND NOT EXISTS (
    SELECT 1
    FROM public.attraction_improvement_actions AS action
    WHERE action.feedback_issue_id = p_issue_id
      AND action.status = 'verified'
  ) THEN
    RAISE EXCEPTION 'ATTRACTION_FEEDBACK_VERIFIED_ACTION_REQUIRED';
  END IF;

  UPDATE public.attraction_feedback_issues
  SET status = p_to_status,
      review_note = CASE WHEN p_note IS NULL THEN review_note ELSE p_note END,
      closed_by = CASE WHEN p_to_status = 'closed' THEN p_changed_by ELSE NULL END,
      closed_at = CASE WHEN p_to_status = 'closed' THEN now() ELSE NULL END,
      updated_at = now()
  WHERE feedback_issue_id = p_issue_id
  RETURNING * INTO v_issue;

  INSERT INTO public.attraction_improvement_action_history (
    feedback_issue_id, from_status, to_status, changed_by, note
  ) VALUES (p_issue_id, p_expected_from_status, p_to_status, p_changed_by, p_note);

  RETURN v_issue;
END;
$$;

CREATE OR REPLACE FUNCTION public.transition_attraction_improvement_action(
  p_action_id uuid,
  p_expected_from_status text,
  p_to_status text,
  p_changed_by uuid,
  p_note text DEFAULT NULL,
  p_completion_evidence_note text DEFAULT NULL
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
  IF p_to_status = 'verified' AND (v_evidence IS NULL OR current_date <= v_action.follow_up_end) THEN
    RAISE EXCEPTION 'FOLLOW_UP_NOT_COMPLETE';
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

ALTER TABLE public.attraction_feedback_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attraction_improvement_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attraction_improvement_action_history ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.attraction_feedback_issues FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.attraction_improvement_actions FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.attraction_improvement_action_history FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT ON TABLE public.attraction_feedback_issues TO service_role;
GRANT SELECT, INSERT ON TABLE public.attraction_improvement_actions TO service_role;
GRANT SELECT ON TABLE public.attraction_improvement_action_history TO service_role;

REVOKE ALL ON FUNCTION public.prevent_attraction_improvement_history_mutation() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.validate_attraction_improvement_action_owner() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.record_attraction_feedback_issue_insert() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.record_attraction_improvement_action_insert() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.prevent_attraction_improvement_history_mutation() TO service_role;
GRANT EXECUTE ON FUNCTION public.validate_attraction_improvement_action_owner() TO service_role;
GRANT EXECUTE ON FUNCTION public.record_attraction_feedback_issue_insert() TO service_role;
GRANT EXECUTE ON FUNCTION public.record_attraction_improvement_action_insert() TO service_role;

REVOKE ALL ON FUNCTION public.transition_attraction_feedback_issue(uuid, text, text, uuid, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.transition_attraction_improvement_action(uuid, text, text, uuid, text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.transition_attraction_feedback_issue(uuid, text, text, uuid, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.transition_attraction_improvement_action(uuid, text, text, uuid, text, text) TO service_role;

INSERT INTO public.permissions (permission_name, description)
VALUES
  ('attraction_feedback.read', 'Read aggregate attraction feedback and reviewed issues'),
  ('attraction_feedback.evidence_read', 'Read privacy-safe attraction feedback evidence'),
  ('attraction_feedback.issue_review', 'Accept or dismiss qualified attraction feedback candidates'),
  ('attraction_improvement.manage', 'Create and manage attraction improvement actions'),
  ('attraction_improvement.verify', 'Verify completed attraction improvement follow-up'),
  ('export.attraction_improvements', 'Export aggregate attraction improvement records')
ON CONFLICT (permission_name) DO UPDATE
SET description = EXCLUDED.description;

INSERT INTO public.role_permissions (role_id, permission_id)
SELECT roles.role_id, permissions.permission_id
FROM public.roles, public.permissions
WHERE role_name IN ('super_admin', 'admin')
  AND permission_name IN (
    'attraction_feedback.read', 'attraction_feedback.evidence_read', 'attraction_feedback.issue_review',
    'attraction_improvement.manage', 'attraction_improvement.verify', 'export.attraction_improvements'
  )
ON CONFLICT DO NOTHING;

INSERT INTO public.role_permissions (role_id, permission_id)
SELECT roles.role_id, permissions.permission_id
FROM public.roles, public.permissions
WHERE role_name = 'viewer'
  AND permission_name = 'attraction_feedback.read'
ON CONFLICT DO NOTHING;
