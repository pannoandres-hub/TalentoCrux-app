/*
# Admin auth setup and admin functions

1. Creates admin_profiles table to track admin role
2. Creates SECURITY DEFINER functions for admin operations:
   - is_admin() — checks if current user is admin
   - admin_list_all_professionals() — returns all professionals regardless of estado
   - admin_list_pending_ads() — returns all ads regardless of estado
   - admin_update_professional() — updates professional fields
   - admin_set_professional_estado() — changes estado
   - admin_update_ad() — updates ad fields
   - admin_set_ad_estado() — changes ad estado
   - admin_delete_professional() — deletes professional
   - admin_delete_ad() — deletes ad
   - admin_list_reviews() — returns all reviews
   - admin_set_review_estado() — changes review estado
   - admin_list_contact_logs() — returns contact logs for a professional
   - submit_review() — public submission of a review via token
   - get_professional_reviews() — returns approved reviews for a professional
   - get_professional_rating() — returns rating_avg and review_count
3. Triggers to update professional rating when review estado changes
*/

-- ── admin_profiles ──
CREATE TABLE IF NOT EXISTS admin_profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  is_admin boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_select_own_profile" ON admin_profiles;
CREATE POLICY "admin_select_own_profile"
ON admin_profiles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- ── Helper: is_admin ──
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM admin_profiles
    WHERE user_id = auth.uid() AND is_admin = true
  );
$$;

-- ── Admin: list all professionals ──
CREATE OR REPLACE FUNCTION admin_list_all_professionals()
RETURNS SETOF professionals
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'No autorizado';
  END IF;
  RETURN QUERY SELECT * FROM professionals ORDER BY created_at DESC;
END;
$$;

REVOKE EXECUTE ON FUNCTION admin_list_all_professionals FROM anon;
GRANT EXECUTE ON FUNCTION admin_list_all_professionals TO authenticated;

-- ── Admin: list all ads ──
CREATE OR REPLACE FUNCTION admin_list_all_ads()
RETURNS SETOF ads
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'No autorizado';
  END IF;
  RETURN QUERY SELECT * FROM ads ORDER BY created_at DESC;
END;
$$;

REVOKE EXECUTE ON FUNCTION admin_list_all_ads FROM anon;
GRANT EXECUTE ON FUNCTION admin_list_all_ads TO authenticated;

-- ── Admin: list all courses ──
CREATE OR REPLACE FUNCTION admin_list_all_courses()
RETURNS SETOF courses
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'No autorizado';
  END IF;
  RETURN QUERY SELECT * FROM courses ORDER BY created_at DESC;
END;
$$;

REVOKE EXECUTE ON FUNCTION admin_list_all_courses FROM anon;
GRANT EXECUTE ON FUNCTION admin_list_all_courses TO authenticated;

-- ── Admin: update professional ──
CREATE OR REPLACE FUNCTION admin_update_professional(
  p_id uuid,
  p_name text DEFAULT NULL,
  p_profession text DEFAULT NULL,
  p_neighborhood text DEFAULT NULL,
  p_schedule text DEFAULT NULL,
  p_whatsapp text DEFAULT NULL,
  p_description text DEFAULT NULL,
  p_category text DEFAULT NULL,
  p_photo_url text DEFAULT NULL,
  p_numero_matricula text DEFAULT NULL,
  p_verificado boolean DEFAULT NULL,
  p_dni_frente_path text DEFAULT NULL,
  p_dni_dorso_path text DEFAULT NULL,
  p_foto_matricula_path text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'No autorizado';
  END IF;
  UPDATE professionals SET
    name = COALESCE(p_name, name),
    profession = COALESCE(p_profession, profession),
    neighborhood = COALESCE(p_neighborhood, neighborhood),
    schedule = COALESCE(p_schedule, schedule),
    whatsapp = COALESCE(p_whatsapp, whatsapp),
    description = COALESCE(p_description, description),
    category = COALESCE(p_category, category),
    photo_url = COALESCE(p_photo_url, photo_url),
    numero_matricula = COALESCE(p_numero_matricula, numero_matricula),
    verificado = COALESCE(p_verificado, verificado),
    dni_frente_path = COALESCE(p_dni_frente_path, dni_frente_path),
    dni_dorso_path = COALESCE(p_dni_dorso_path, dni_dorso_path),
    foto_matricula_path = COALESCE(p_foto_matricula_path, foto_matricula_path),
    updated_at = now()
  WHERE id = p_id;

  INSERT INTO admin_audit_log (admin_email, action, target_id, target_type, detail)
  SELECT auth.jwt() ->> 'email', 'update_professional', p_id::text, 'professional', 'Updated professional fields';
END;
$$;

REVOKE EXECUTE ON FUNCTION admin_update_professional FROM anon;
GRANT EXECUTE ON FUNCTION admin_update_professional TO authenticated;

-- ── Admin: set professional estado ──
CREATE OR REPLACE FUNCTION admin_set_professional_estado(
  p_id uuid,
  p_estado text,
  p_detail text DEFAULT ''
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'No autorizado';
  END IF;
  IF p_estado NOT IN ('Pendiente', 'Aprobado', 'Rechazado', 'Pausado') THEN
    RAISE EXCEPTION 'Estado inválido';
  END IF;
  UPDATE professionals SET estado = p_estado, updated_at = now() WHERE id = p_id;

  INSERT INTO admin_audit_log (admin_email, action, target_id, target_type, detail)
  SELECT auth.jwt() ->> 'email', 'set_estado_professional', p_id::text, 'professional',
    'Estado: ' || p_estado || COALESCE(' — ' || p_detail, '');
END;
$$;

REVOKE EXECUTE ON FUNCTION admin_set_professional_estado FROM anon;
GRANT EXECUTE ON FUNCTION admin_set_professional_estado TO authenticated;

-- ── Admin: delete professional ──
CREATE OR REPLACE FUNCTION admin_delete_professional(p_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'No autorizado';
  END IF;
  DELETE FROM professionals WHERE id = p_id;

  INSERT INTO admin_audit_log (admin_email, action, target_id, target_type, detail)
  SELECT auth.jwt() ->> 'email', 'delete_professional', p_id::text, 'professional', 'Deleted professional';
END;
$$;

REVOKE EXECUTE ON FUNCTION admin_delete_professional FROM anon;
GRANT EXECUTE ON FUNCTION admin_delete_professional TO authenticated;

-- ── Admin: update ad ──
CREATE OR REPLACE FUNCTION admin_update_ad(
  p_id uuid,
  p_titulo text DEFAULT NULL,
  p_descripcion text DEFAULT NULL,
  p_link text DEFAULT NULL,
  p_link_video text DEFAULT NULL,
  p_imagen_path text DEFAULT NULL,
  p_plan_nombre text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'No autorizado';
  END IF;
  UPDATE ads SET
    titulo = COALESCE(p_titulo, titulo),
    descripcion = COALESCE(p_descripcion, descripcion),
    link = COALESCE(p_link, link),
    link_video = COALESCE(p_link_video, link_video),
    imagen_path = COALESCE(p_imagen_path, imagen_path),
    plan_nombre = COALESCE(p_plan_nombre, plan_nombre)
  WHERE id = p_id;

  INSERT INTO admin_audit_log (admin_email, action, target_id, target_type, detail)
  SELECT auth.jwt() ->> 'email', 'update_ad', p_id::text, 'ad', 'Updated ad fields';
END;
$$;

REVOKE EXECUTE ON FUNCTION admin_update_ad FROM anon;
GRANT EXECUTE ON FUNCTION admin_update_ad TO authenticated;

-- ── Admin: set ad estado ──
CREATE OR REPLACE FUNCTION admin_set_ad_estado(
  p_id uuid,
  p_estado text,
  p_detail text DEFAULT ''
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'No autorizado';
  END IF;
  IF p_estado NOT IN ('Pendiente', 'Activo', 'Rechazado', 'Pausado') THEN
    RAISE EXCEPTION 'Estado inválido';
  END IF;
  UPDATE ads SET estado = p_estado WHERE id = p_id;

  INSERT INTO admin_audit_log (admin_email, action, target_id, target_type, detail)
  SELECT auth.jwt() ->> 'email', 'set_estado_ad', p_id::text, 'ad',
    'Estado: ' || p_estado || COALESCE(' — ' || p_detail, '');
END;
$$;

REVOKE EXECUTE ON FUNCTION admin_set_ad_estado FROM anon;
GRANT EXECUTE ON FUNCTION admin_set_ad_estado TO authenticated;

-- ── Admin: delete ad ──
CREATE OR REPLACE FUNCTION admin_delete_ad(p_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'No autorizado';
  END IF;
  DELETE FROM ads WHERE id = p_id;

  INSERT INTO admin_audit_log (admin_email, action, target_id, target_type, detail)
  SELECT auth.jwt() ->> 'email', 'delete_ad', p_id::text, 'ad', 'Deleted ad';
END;
$$;

REVOKE EXECUTE ON FUNCTION admin_delete_ad FROM anon;
GRANT EXECUTE ON FUNCTION admin_delete_ad TO authenticated;

-- ── Admin: list all reviews ──
CREATE OR REPLACE FUNCTION admin_list_reviews(p_professional_id uuid DEFAULT NULL)
RETURNS TABLE (
  id uuid,
  professional_id uuid,
  contact_log_id uuid,
  rating integer,
  comment text,
  estado text,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'No autorizado';
  END IF;
  IF p_professional_id IS NOT NULL THEN
    RETURN QUERY SELECT * FROM reviews WHERE professional_id = p_professional_id ORDER BY created_at DESC;
  ELSE
    RETURN QUERY SELECT * FROM reviews ORDER BY created_at DESC;
  END IF;
END;
$$;

REVOKE EXECUTE ON FUNCTION admin_list_reviews FROM anon;
GRANT EXECUTE ON FUNCTION admin_list_reviews TO authenticated;

-- ── Admin: set review estado ──
CREATE OR REPLACE FUNCTION admin_set_review_estado(
  p_id uuid,
  p_estado text,
  p_detail text DEFAULT ''
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_prof_id uuid;
  v_old_estado text;
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'No autorizado';
  END IF;
  IF p_estado NOT IN ('Pendiente', 'Aprobado', 'Rechazado', 'Oculto') THEN
    RAISE EXCEPTION 'Estado inválido';
  END IF;

  SELECT professional_id, estado INTO v_prof_id, v_old_estado FROM reviews WHERE id = p_id;
  UPDATE reviews SET estado = p_estado WHERE id = p_id;

  -- Recalculate professional rating
  IF v_prof_id IS NOT NULL THEN
    PERFORM update_professional_rating(v_prof_id);
  END IF;

  INSERT INTO admin_audit_log (admin_email, action, target_id, target_type, detail)
  SELECT auth.jwt() ->> 'email', 'set_review_estado', p_id::text, 'review',
    'Estado: ' || p_estado || ' (was ' || COALESCE(v_old_estado,'?') || ')' || COALESCE(' — ' || p_detail, '');
END;
$$;

REVOKE EXECUTE ON FUNCTION admin_set_review_estado FROM anon;
GRANT EXECUTE ON FUNCTION admin_set_review_estado TO authenticated;

-- ── Admin: list contact logs ──
CREATE OR REPLACE FUNCTION admin_list_contact_logs(p_professional_id uuid DEFAULT NULL)
RETURNS TABLE (
  id uuid,
  professional_id uuid,
  user_name text,
  user_phone text,
  user_email text,
  verified boolean,
  contacted_at timestamptz,
  invite_sent boolean,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'No autorizado';
  END IF;
  IF p_professional_id IS NOT NULL THEN
    RETURN QUERY SELECT id, professional_id, user_name, user_phone, user_email, verified, contacted_at, invite_sent, created_at
    FROM contact_logs WHERE professional_id = p_professional_id ORDER BY created_at DESC;
  ELSE
    RETURN QUERY SELECT id, professional_id, user_name, user_phone, user_email, verified, contacted_at, invite_sent, created_at
    FROM contact_logs ORDER BY created_at DESC;
  END IF;
END;
$$;

REVOKE EXECUTE ON FUNCTION admin_list_contact_logs FROM anon;
GRANT EXECUTE ON FUNCTION admin_list_contact_logs TO authenticated;

-- ── Public: get professional reviews (approved only) ──
CREATE OR REPLACE FUNCTION get_professional_reviews(p_professional_id uuid)
RETURNS TABLE (
  id uuid,
  rating integer,
  comment text,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  RETURN QUERY SELECT id, rating, comment, created_at
  FROM reviews
  WHERE professional_id = p_professional_id AND estado = 'Aprobado'
  ORDER BY created_at DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION get_professional_reviews TO anon, authenticated;

-- ── Public: submit review via token ──
CREATE OR REPLACE FUNCTION submit_review(
  p_token text,
  p_rating integer,
  p_comment text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_tok record;
  v_review_id uuid;
BEGIN
  -- Atomically claim the token
  UPDATE review_tokens
  SET used_at = now()
  WHERE token = p_token AND used_at IS NULL AND expires_at > now()
  RETURNING id, contact_log_id INTO v_tok;

  IF v_tok IS NULL THEN
    RAISE EXCEPTION 'El enlace no es válido, ya fue utilizado o ha vencido.';
  END IF;

  IF p_rating IS NULL OR p_rating < 1 OR p_rating > 5 THEN
    RAISE EXCEPTION 'La calificación debe ser entre 1 y 5 estrellas.';
  END IF;

  -- Check no existing review for this contact_log
  IF EXISTS (SELECT 1 FROM reviews WHERE contact_log_id = v_tok.contact_log_id) THEN
    RAISE EXCEPTION 'Ya has calificado a este profesional.';
  END IF;

  INSERT INTO reviews (professional_id, contact_log_id, rating, comment, estado)
  SELECT cl.professional_id, cl.id, p_rating, p_comment, 'Pendiente'
  FROM contact_logs cl WHERE cl.id = v_tok.contact_log_id
  RETURNING id INTO v_review_id;

  UPDATE contact_logs SET review_id = v_review_id WHERE id = v_tok.contact_log_id;

  RETURN v_review_id;
END;
$$;

GRANT EXECUTE ON FUNCTION submit_review TO anon, authenticated;

-- ── Helper: update professional rating ──
CREATE OR REPLACE FUNCTION update_professional_rating(p_prof_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_avg numeric(3,1);
  v_count integer;
BEGIN
  SELECT COALESCE(AVG(rating), 0), COUNT(*)
  INTO v_avg, v_count
  FROM reviews
  WHERE professional_id = p_prof_id AND estado = 'Aprobado';

  UPDATE professionals
  SET rating_avg = ROUND(v_avg, 1), review_count = v_count, updated_at = now()
  WHERE id = p_prof_id;
END;
$$;

-- ── Public: verify review token validity ──
CREATE OR REPLACE FUNCTION check_review_token(p_token text)
RETURNS TABLE (
  valid boolean,
  professional_name text,
  professional_profession text
)
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_tok record;
  v_prof record;
BEGIN
  SELECT rt.* INTO v_tok FROM review_tokens rt WHERE rt.token = p_token;
  IF NOT FOUND OR v_tok.used_at IS NOT NULL OR v_tok.expires_at <= now() THEN
    RETURN QUERY SELECT false, NULL::text, NULL::text;
    RETURN;
  END IF;

  SELECT p.name, p.profession INTO v_prof
  FROM contact_logs cl
  JOIN professionals p ON p.id = cl.professional_id
  WHERE cl.id = v_tok.contact_log_id;

  IF NOT EXISTS (SELECT 1 FROM reviews WHERE contact_log_id = v_tok.contact_log_id) THEN
    RETURN QUERY SELECT true, v_prof.name, v_prof.profession;
  ELSE
    RETURN QUERY SELECT false, v_prof.name, v_prof.profession;
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION check_review_token TO anon, authenticated;

-- ── Public: create contact log (called by edge function) ──
CREATE OR REPLACE FUNCTION create_contact_log(
  p_professional_id uuid,
  p_user_name text,
  p_user_phone text,
  p_user_email text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_id uuid;
BEGIN
  INSERT INTO contact_logs (professional_id, user_name, user_phone, user_email, verified, contacted_at)
  VALUES (p_professional_id, p_user_name, p_user_phone, p_user_email, false, now())
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;

-- ── Public: verify contact and create token ──
CREATE OR REPLACE FUNCTION verify_contact_and_create_token(
  p_contact_log_id uuid,
  p_code text
)
RETURNS TABLE (verified boolean, professional_name text, whatsapp text)
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_code record;
  v_prof record;
  v_token text;
BEGIN
  SELECT vc.* INTO v_code FROM verification_codes vc
  WHERE vc.contact_log_id = p_contact_log_id AND vc.code = p_code AND vc.used = false AND vc.expires_at > now();

  IF NOT FOUND THEN
    RETURN QUERY SELECT false, NULL::text, NULL::text;
    RETURN;
  END IF;

  UPDATE verification_codes SET used = true WHERE id = v_code.id;
  UPDATE contact_logs SET verified = true, contacted_at = now() WHERE id = p_contact_log_id;

  SELECT p.name, p.whatsapp INTO v_prof FROM professionals p
  JOIN contact_logs cl ON cl.professional_id = p.id
  WHERE cl.id = p_contact_log_id;

  -- Generate a review token valid for 30 days (invite sent at day 7 by edge function)
  v_token := encode(gen_random_bytes(32), 'hex');
  INSERT INTO review_tokens (contact_log_id, token, expires_at)
  VALUES (p_contact_log_id, v_token, now() + interval '30 days');

  RETURN QUERY SELECT true, v_prof.name, v_prof.whatsapp;
END;
$$;

GRANT EXECUTE ON FUNCTION verify_contact_and_create_token TO anon, authenticated;

-- ── Public: create verification code (called by edge function) ──
CREATE OR REPLACE FUNCTION create_verification_code(
  p_contact_log_id uuid,
  p_phone text,
  p_email text,
  p_code text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO verification_codes (contact_log_id, phone, email, code, expires_at)
  VALUES (p_contact_log_id, p_phone, p_email, p_code, now() + interval '10 minutes');
END;
$$;

-- ── Admin: increment professional clicks ──
CREATE OR REPLACE FUNCTION increment_professional_clicks(p_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  UPDATE professionals SET clicks_contacto = clicks_contacto + 1 WHERE id = p_id;
END;
$$;

GRANT EXECUTE ON FUNCTION increment_professional_clicks TO anon, authenticated;

-- ── Admin: increment ad clicks ──
CREATE OR REPLACE FUNCTION increment_ad_clicks(p_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  UPDATE ads SET clicks_contacto = clicks_contacto + 1 WHERE id = p_id;
END;
$$;

GRANT EXECUTE ON FUNCTION increment_ad_clicks TO anon, authenticated;

-- ── Admin: increment course clicks ──
CREATE OR REPLACE FUNCTION increment_course_clicks(p_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  UPDATE courses SET clicks_contacto = clicks_contacto + 1 WHERE id = p_id;
END;
$$;

GRANT EXECUTE ON FUNCTION increment_course_clicks TO anon, authenticated;

-- ── Admin: list all plans ──
CREATE OR REPLACE FUNCTION admin_list_all_plans()
RETURNS SETOF plans
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'No autorizado';
  END IF;
  RETURN QUERY SELECT * FROM plans ORDER BY created_at DESC;
END;
$$;

REVOKE EXECUTE ON FUNCTION admin_list_all_plans FROM anon;
GRANT EXECUTE ON FUNCTION admin_list_all_plans TO authenticated;

-- ── Admin: update plan ──
CREATE OR REPLACE FUNCTION admin_update_plan(
  p_id uuid,
  p_nombre text DEFAULT NULL,
  p_precio_ars numeric DEFAULT NULL,
  p_descripcion text DEFAULT NULL,
  p_duracion_dias integer DEFAULT NULL,
  p_activo boolean DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'No autorizado';
  END IF;
  UPDATE plans SET
    nombre = COALESCE(p_nombre, nombre),
    precio_ars = COALESCE(p_precio_ars, precio_ars),
    descripcion = COALESCE(p_descripcion, descripcion),
    duracion_dias = COALESCE(p_duracion_dias, duracion_dias),
    activo = COALESCE(p_activo, activo)
  WHERE id = p_id;

  INSERT INTO admin_audit_log (admin_email, action, target_id, target_type, detail)
  SELECT auth.jwt() ->> 'email', 'update_plan', p_id::text, 'plan', 'Updated plan';
END;
$$;

REVOKE EXECUTE ON FUNCTION admin_update_plan FROM anon;
GRANT EXECUTE ON FUNCTION admin_update_plan TO authenticated;

-- ── Admin: delete plan ──
CREATE OR REPLACE FUNCTION admin_delete_plan(p_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'No autorizado';
  END IF;
  DELETE FROM plans WHERE id = p_id;

  INSERT INTO admin_audit_log (admin_email, action, target_id, target_type, detail)
  SELECT auth.jwt() ->> 'email', 'delete_plan', p_id::text, 'plan', 'Deleted plan';
END;
$$;

REVOKE EXECUTE ON FUNCTION admin_delete_plan FROM anon;
GRANT EXECUTE ON FUNCTION admin_delete_plan TO authenticated;
