-- Migration: add_message_permissions
-- Purpose: Add explicit contact message read/manage/export permissions without granting them to viewer or scoped admin roles.
-- Related docs:
--   docs/security/ROLE_PERMISSION_MATRIX.md
--   docs/security/PDPA_PRIVACY_DESIGN.md

INSERT INTO public.permissions (permission_name, description)
VALUES
  ('message.read', 'Read contact message records'),
  ('message.update', 'Update contact message status and reply markers'),
  ('message.delete', 'Delete contact message records'),
  ('export.messages', 'Export contact message records')
ON CONFLICT (permission_name) DO UPDATE
SET description = EXCLUDED.description;

INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.role_id, p.permission_id
FROM public.roles r
JOIN public.permissions p ON p.permission_name IN (
  'message.read',
  'message.update',
  'message.delete',
  'export.messages'
)
WHERE r.role_name IN ('super_admin', 'admin')
ON CONFLICT DO NOTHING;
