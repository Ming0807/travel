-- Migration: 20260521000001_fix_satisfaction_surveys_and_expenses
-- Description: Fix schema mismatches found during Phase 07 audit
--   1. Add missing columns to satisfaction_surveys (accessibility_score, information_score, value_score, completed_at)
--   2. Make visit_expenses.estimated_amount and expense_category_id nullable

-- ==========================================
-- 1. satisfaction_surveys: add missing columns
-- ==========================================

ALTER TABLE public.satisfaction_surveys
  ADD COLUMN IF NOT EXISTS accessibility_score integer CHECK (accessibility_score >= 1 AND accessibility_score <= 5),
  ADD COLUMN IF NOT EXISTS information_score integer CHECK (information_score >= 1 AND information_score <= 5),
  ADD COLUMN IF NOT EXISTS value_score integer CHECK (value_score >= 1 AND value_score <= 5),
  ADD COLUMN IF NOT EXISTS completed_at timestamptz,
  ADD COLUMN IF NOT EXISTS attraction_id bigint REFERENCES public.attractions(attraction_id);

-- ==========================================
-- 2. visit_expenses: relax NOT NULL constraints
-- ==========================================

-- estimated_amount: code passes null, so make it nullable
ALTER TABLE public.visit_expenses
  ALTER COLUMN estimated_amount DROP NOT NULL,
  ALTER COLUMN estimated_amount DROP DEFAULT;

-- Remove the CHECK constraint on estimated_amount >= 0 and re-add allowing NULL
ALTER TABLE public.visit_expenses
  DROP CONSTRAINT IF EXISTS visit_expenses_estimated_amount_check;
ALTER TABLE public.visit_expenses
  ADD CONSTRAINT visit_expenses_estimated_amount_check CHECK (estimated_amount IS NULL OR estimated_amount >= 0);

-- expense_category_id: code passes null, so make it nullable
ALTER TABLE public.visit_expenses
  ALTER COLUMN expense_category_id DROP NOT NULL;
