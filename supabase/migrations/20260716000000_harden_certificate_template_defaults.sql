-- Keep certificate-template defaults deterministic and switch them atomically.

DROP INDEX IF EXISTS public.uq_certificate_templates_template_name_language;

CREATE UNIQUE INDEX IF NOT EXISTS uq_certificate_templates_global_name_language
  ON public.certificate_templates(lower(template_name), language)
  WHERE attraction_id IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_certificate_templates_attraction_name_language
  ON public.certificate_templates(attraction_id, lower(template_name), language)
  WHERE attraction_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_certificate_templates_active_scope_language
  ON public.certificate_templates(attraction_id, language, is_default)
  WHERE is_active = true;

UPDATE public.certificate_templates
SET
  is_active = true,
  layout_config_json = jsonb_set(
    COALESCE(layout_config_json, '{}'::jsonb),
    '{orientation}',
    COALESCE(layout_config_json -> 'orientation', '"landscape"'::jsonb),
    true
  )
WHERE is_default = true
   OR NOT COALESCE(layout_config_json, '{}'::jsonb) ? 'orientation';

WITH ranked_global AS (
  SELECT
    template_id,
    row_number() OVER (
      PARTITION BY language
      ORDER BY updated_at DESC NULLS LAST, created_at DESC, template_id DESC
    ) AS row_number
  FROM public.certificate_templates
  WHERE is_default = true AND attraction_id IS NULL
)
UPDATE public.certificate_templates AS templates
SET is_default = false, updated_at = now()
FROM ranked_global
WHERE templates.template_id = ranked_global.template_id
  AND ranked_global.row_number > 1;

WITH ranked_attraction AS (
  SELECT
    template_id,
    row_number() OVER (
      PARTITION BY attraction_id, language
      ORDER BY updated_at DESC NULLS LAST, created_at DESC, template_id DESC
    ) AS row_number
  FROM public.certificate_templates
  WHERE is_default = true AND attraction_id IS NOT NULL
)
UPDATE public.certificate_templates AS templates
SET is_default = false, updated_at = now()
FROM ranked_attraction
WHERE templates.template_id = ranked_attraction.template_id
  AND ranked_attraction.row_number > 1;

CREATE UNIQUE INDEX IF NOT EXISTS uq_certificate_templates_global_default_language
  ON public.certificate_templates(language)
  WHERE is_default = true AND attraction_id IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_certificate_templates_attraction_default_language
  ON public.certificate_templates(attraction_id, language)
  WHERE is_default = true AND attraction_id IS NOT NULL;

ALTER TABLE public.certificate_templates
  DROP CONSTRAINT IF EXISTS certificate_templates_default_requires_active;

ALTER TABLE public.certificate_templates
  ADD CONSTRAINT certificate_templates_default_requires_active
  CHECK (NOT is_default OR is_active);

CREATE OR REPLACE FUNCTION public.set_certificate_template_default(
  p_template_id bigint
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_language text;
  v_attraction_id bigint;
  v_is_active boolean;
BEGIN
  SELECT language, attraction_id, is_active
  INTO v_language, v_attraction_id, v_is_active
  FROM public.certificate_templates
  WHERE template_id = p_template_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error_code', 'TEMPLATE_NOT_FOUND');
  END IF;

  IF NOT v_is_active THEN
    RETURN jsonb_build_object('success', false, 'error_code', 'TEMPLATE_INACTIVE');
  END IF;

  UPDATE public.certificate_templates
  SET is_default = false, updated_at = now()
  WHERE language = v_language
    AND is_default = true
    AND (
      (v_attraction_id IS NULL AND attraction_id IS NULL)
      OR attraction_id = v_attraction_id
    );

  UPDATE public.certificate_templates
  SET is_default = true, updated_at = now()
  WHERE template_id = p_template_id;

  RETURN jsonb_build_object('success', true, 'template_id', p_template_id);
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error_code', 'TEMPLATE_DEFAULT_UPDATE_FAILED');
END;
$$;

REVOKE ALL ON FUNCTION public.set_certificate_template_default(bigint)
  FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.set_certificate_template_default(bigint)
  TO service_role;
