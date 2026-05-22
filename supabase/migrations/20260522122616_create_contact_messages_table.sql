-- Create the contact_messages table
CREATE TABLE public.contact_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'archived')),
    is_replied BOOLEAN NOT NULL DEFAULT false,
    read_at TIMESTAMPTZ,
    read_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Comments for documentation
COMMENT ON TABLE public.contact_messages IS 'Stores contact form submissions from tourists';
COMMENT ON COLUMN public.contact_messages.status IS 'unread, read, or archived';
COMMENT ON COLUMN public.contact_messages.is_replied IS 'Whether an admin has replied or marked as replied';

-- Enable RLS
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Policies
-- 1. Service Role can insert (used by our API endpoint)
-- We don't add an anonymous INSERT policy because we want the backend API to handle it, do rate limiting, and insert using Service Role.

-- 2. Only admins can select
CREATE POLICY "Allow admins to read messages" 
ON public.contact_messages
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE admin_users.auth_user_id = auth.uid()
  )
);

-- 3. Only admins can update
CREATE POLICY "Allow admins to update messages" 
ON public.contact_messages
FOR UPDATE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE admin_users.auth_user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE admin_users.auth_user_id = auth.uid()
  )
);

-- 4. Only admins can delete
CREATE POLICY "Allow admins to delete messages" 
ON public.contact_messages
FOR DELETE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE admin_users.auth_user_id = auth.uid()
  )
);
