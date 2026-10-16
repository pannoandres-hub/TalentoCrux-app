/*
# Create admin user in auth.users and admin_profiles

1. Creates an auth user with email admin@cruxtalento.com
2. Assigns admin role in admin_profiles table
3. Default password: TalentoCrux2026! (admin should change this after first login)
*/

-- Insert the admin user into auth.users
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@cruxtalento.com',
  crypt('TalentoCrux2026!', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{}'::jsonb
)
ON CONFLICT DO NOTHING;

-- Insert into admin_profiles
INSERT INTO admin_profiles (user_id, email, is_admin)
SELECT id, 'admin@cruxtalento.com', true
FROM auth.users
WHERE email = 'admin@cruxtalento.com'
ON CONFLICT (user_id) DO UPDATE SET is_admin = true;
