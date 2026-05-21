# PHASE_13_DEPLOYMENT.md

## Status

Completed.

## Objective

Provide the necessary instructions and environment variables required to deploy the Next.js + Supabase application to a production environment (e.g., Vercel).

## Deployment Checklist

### 1. Supabase Production Setup
1. Create a new Supabase Project for Production.
2. Run the SQL migrations from `supabase/migrations` in order, or use the Supabase CLI:
   `npx supabase db push`
3. Ensure the storage buckets are created and policies are applied (handled by `20260521000002_setup_storage.sql`).
4. Generate the `service_role` key and `anon` public key from the Supabase Dashboard.

### 2. Next.js Deployment (Vercel)
1. Push the repository to GitHub.
2. Import the repository into Vercel.
3. Configure the following Environment Variables in Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL` = Your Production Supabase URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = Your Production Supabase Anon Key
   - `SUPABASE_SERVICE_ROLE_KEY` = Your Production Supabase Service Role Key
   - `NEXT_PUBLIC_APP_URL` = Your Vercel Domain (e.g., `https://my-tourism-app.vercel.app`)
   - `NEXT_PUBLIC_LINE_LIFF_ID` = (Optional) Your Production LINE LIFF ID
4. Deploy the application.

### 3. Post-Deployment Verification
- Navigate to the admin dashboard (`/admin`) and log in (or verify the guard redirects correctly).
- Test the QR check-in flow via a generated check-in code.
- Verify photo uploads and certificate generation work in the production environment.
