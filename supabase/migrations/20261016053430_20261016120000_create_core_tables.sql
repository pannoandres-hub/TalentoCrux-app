/*
# Core tables for TalentoCrux — Part 1

Creates professionals, ads, courses, plans, reviews, contact_logs, review_tokens, verification_codes, admin_audit_log.
Moves away from Airtable to Supabase for maximum security.
*/

-- ── professionals ──
CREATE TABLE IF NOT EXISTS professionals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  profession text NOT NULL,
  category text NOT NULL DEFAULT 'hogar',
  neighborhood text NOT NULL,
  schedule text NOT NULL,
  whatsapp text NOT NULL,
  description text DEFAULT '',
  photo_url text DEFAULT '',
  dni_frente_path text DEFAULT '',
  dni_dorso_path text DEFAULT '',
  foto_matricula_path text DEFAULT '',
  numero_matricula text DEFAULT '',
  estado text NOT NULL DEFAULT 'Pendiente',
  verificado boolean NOT NULL DEFAULT false,
  rating_avg numeric(3,1) NOT NULL DEFAULT 0,
  review_count integer NOT NULL DEFAULT 0,
  clicks_contacto integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE professionals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_select_approved_professionals" ON professionals;
CREATE POLICY "public_select_approved_professionals"
ON professionals FOR SELECT
TO anon, authenticated
USING (estado = 'Aprobado');

-- ── ads ──
CREATE TABLE IF NOT EXISTS ads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo text NOT NULL,
  descripcion text DEFAULT '',
  link text DEFAULT '',
  link_video text DEFAULT '',
  imagen_path text DEFAULT '',
  plan_nombre text DEFAULT '',
  estado text NOT NULL DEFAULT 'Pendiente',
  clicks_contacto integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE ads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_select_active_ads" ON ads;
CREATE POLICY "public_select_active_ads"
ON ads FOR SELECT
TO anon, authenticated
USING (estado = 'Activo');

-- ── courses ──
CREATE TABLE IF NOT EXISTS courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre_curso text NOT NULL,
  instructor text NOT NULL,
  whatsapp text NOT NULL,
  email text DEFAULT '',
  descripcion text DEFAULT '',
  duracion_horas text DEFAULT '',
  precio_ars numeric NOT NULL DEFAULT 0,
  estado text NOT NULL DEFAULT 'Pendiente',
  clicks_contacto integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_select_active_courses" ON courses;
CREATE POLICY "public_select_active_courses"
ON courses FOR SELECT
TO anon, authenticated
USING (estado = 'Activo');

-- ── plans ──
CREATE TABLE IF NOT EXISTS plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  precio_ars numeric NOT NULL DEFAULT 0,
  descripcion text DEFAULT '',
  duracion_dias integer NOT NULL DEFAULT 0,
  activo boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_select_active_plans" ON plans;
CREATE POLICY "public_select_active_plans"
ON plans FOR SELECT
TO anon, authenticated
USING (activo = true);

-- ── reviews (must exist before contact_logs references it) ──
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id uuid REFERENCES professionals(id) ON DELETE CASCADE,
  contact_log_id uuid,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text DEFAULT '',
  estado text NOT NULL DEFAULT 'Pendiente',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_select_approved_reviews" ON reviews;
CREATE POLICY "public_select_approved_reviews"
ON reviews FOR SELECT
TO anon, authenticated
USING (estado = 'Aprobado');

-- ── contact_logs ──
CREATE TABLE IF NOT EXISTS contact_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id uuid REFERENCES professionals(id) ON DELETE CASCADE,
  user_name text NOT NULL,
  user_phone text NOT NULL,
  user_email text NOT NULL,
  verified boolean NOT NULL DEFAULT false,
  contacted_at timestamptz DEFAULT now(),
  invite_sent boolean NOT NULL DEFAULT false,
  review_id uuid REFERENCES reviews(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE contact_logs ENABLE ROW LEVEL SECURITY;

-- Add FK from reviews to contact_logs now that contact_logs exists
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'reviews_contact_log_id_fkey'
  ) THEN
    ALTER TABLE reviews
    ADD CONSTRAINT reviews_contact_log_id_fkey
    FOREIGN KEY (contact_log_id) REFERENCES contact_logs(id) ON DELETE SET NULL;
  END IF;
END $$;

-- ── review_tokens ──
CREATE TABLE IF NOT EXISTS review_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_log_id uuid REFERENCES contact_logs(id) ON DELETE CASCADE,
  token text UNIQUE NOT NULL,
  used_at timestamptz,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE review_tokens ENABLE ROW LEVEL SECURITY;

-- ── verification_codes ──
CREATE TABLE IF NOT EXISTS verification_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_log_id uuid REFERENCES contact_logs(id) ON DELETE CASCADE,
  phone text NOT NULL,
  email text NOT NULL,
  code text NOT NULL,
  used boolean NOT NULL DEFAULT false,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE verification_codes ENABLE ROW LEVEL SECURITY;

-- ── admin_audit_log ──
CREATE TABLE IF NOT EXISTS admin_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_email text NOT NULL,
  action text NOT NULL,
  target_id text,
  target_type text,
  detail text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;

-- ── Indexes ──
CREATE INDEX IF NOT EXISTS idx_professionals_estado ON professionals(estado);
CREATE INDEX IF NOT EXISTS idx_professionals_neighborhood ON professionals(neighborhood);
CREATE INDEX IF NOT EXISTS idx_ads_estado ON ads(estado);
CREATE INDEX IF NOT EXISTS idx_courses_estado ON courses(estado);
CREATE INDEX IF NOT EXISTS idx_reviews_professional ON reviews(professional_id);
CREATE INDEX IF NOT EXISTS idx_reviews_estado ON reviews(estado);
CREATE INDEX IF NOT EXISTS idx_contact_logs_professional ON contact_logs(professional_id);
CREATE INDEX IF NOT EXISTS idx_review_tokens_token ON review_tokens(token);

-- ── Storage buckets ──
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-photos', 'profile-photos', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('ad-media', 'ad-media', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('private-docs', 'private-docs', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies: public read on public buckets
DROP POLICY IF EXISTS "public_read_profile_photos" ON storage.objects;
CREATE POLICY "public_read_profile_photos"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'profile-photos');

DROP POLICY IF EXISTS "auth_write_profile_photos" ON storage.objects;
CREATE POLICY "auth_write_profile_photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'profile-photos');

DROP POLICY IF EXISTS "auth_update_profile_photos" ON storage.objects;
CREATE POLICY "auth_update_profile_photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'profile-photos');

DROP POLICY IF EXISTS "auth_delete_profile_photos" ON storage.objects;
CREATE POLICY "auth_delete_profile_photos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'profile-photos');

DROP POLICY IF EXISTS "public_read_ad_media" ON storage.objects;
CREATE POLICY "public_read_ad_media"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'ad-media');

DROP POLICY IF EXISTS "auth_write_ad_media" ON storage.objects;
CREATE POLICY "auth_write_ad_media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'ad-media');

DROP POLICY IF EXISTS "auth_update_ad_media" ON storage.objects;
CREATE POLICY "auth_update_ad_media"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'ad-media');

DROP POLICY IF EXISTS "auth_delete_ad_media" ON storage.objects;
CREATE POLICY "auth_delete_ad_media"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'ad-media');

-- private-docs: NO public read. Only authenticated (admin) can read.
DROP POLICY IF EXISTS "auth_read_private_docs" ON storage.objects;
CREATE POLICY "auth_read_private_docs"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'private-docs');

DROP POLICY IF EXISTS "auth_write_private_docs" ON storage.objects;
CREATE POLICY "auth_write_private_docs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'private-docs');

DROP POLICY IF EXISTS "auth_delete_private_docs" ON storage.objects;
CREATE POLICY "auth_delete_private_docs"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'private-docs');
