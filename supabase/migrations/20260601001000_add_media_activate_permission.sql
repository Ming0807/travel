INSERT INTO public.permissions (permission_name, description)
VALUES ('media.activate', 'Restore archived media')
ON CONFLICT (permission_name) DO UPDATE
SET description = EXCLUDED.description;

INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.role_id, p.permission_id
FROM public.roles r
JOIN public.permissions p ON p.permission_name = 'media.activate'
WHERE r.role_name IN ('super_admin', 'admin', 'province_admin', 'attraction_manager')
ON CONFLICT DO NOTHING;
