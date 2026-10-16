import { createClient } from '@supabase/supabase-js';
import type { Professional, Course, Ad, Plan } from '@/types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

const API_URL = `${supabaseUrl}/functions/v1/talentocrux-api`;

const HEADERS: Record<string, string> = {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${supabaseAnonKey}`,
};

async function checkResp(resp: Response): Promise<any> {
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    throw new Error(err?.error || `Error del servidor (${resp.status})`);
  }
  const data = await resp.json();
  if (data?.error) {
    throw new Error(data.error);
  }
  return data;
}

// ── Professionals ──

export async function fetchProfessionals(): Promise<Professional[]> {
  const { data, error } = await supabase
    .from('professionals')
    .select('*')
    .eq('estado', 'Aprobado');
  if (error) throw new Error('No se pudieron cargar los profesionales');
  return (data ?? []).map(mapProfessional);
}

function mapProfessional(r: any): Professional {
  return {
    id: r.id,
    name: r.name,
    profession: r.profession,
    category: r.category ?? 'hogar',
    neighborhood: r.neighborhood,
    rating: r.rating_avg ?? 0,
    reviews: r.review_count ?? 0,
    schedule: r.schedule,
    whatsapp: r.whatsapp,
    photo: r.photo_url ?? '',
    description: r.description ?? '',
    verificado: r.verificado ?? false,
  };
}

export interface RegisterPayload {
  name: string;
  profession: string;
  neighborhood: string;
  schedule: string;
  whatsapp: string;
  description?: string;
  foto?: string | null;
  dniFrente?: string | null;
  dniDorso?: string | null;
  numeroMatricula?: string;
  fotoMatricula?: string | null;
}

export async function registerProfessional(payload: RegisterPayload): Promise<void> {
  const resp = await fetch(`${API_URL}/register-professional`, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify(payload),
  });
  const data = await checkResp(resp);
  if (!data?.success) throw new Error('No se pudo completar el registro');
}

export async function incrementProfessionalClicks(id: string): Promise<void> {
  const { error } = await supabase.rpc('increment_professional_clicks', { p_id: id });
  if (error) { /* best effort */ }
}

// ── Courses ──

export async function fetchCourses(): Promise<Course[]> {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('estado', 'Activo');
  if (error) throw new Error('No se pudieron cargar los cursos');
  return (data ?? []).map((r: any) => ({
    id: r.id,
    nombreCurso: r.nombre_curso,
    instructor: r.instructor,
    whatsapp: r.whatsapp,
    email: r.email ?? '',
    descripcion: r.descripcion ?? '',
    duracionHoras: r.duracion_horas ?? '',
    precioARS: r.precio_ars ?? 0,
    clicksContacto: r.clicks_contacto ?? 0,
  }));
}

export interface CoursePayload {
  instructor: string;
  whatsapp: string;
  email: string;
  nombreCurso: string;
  descripcion: string;
  duracionHoras: string | number;
  precioARS: number;
}

export async function registerCourse(payload: CoursePayload): Promise<void> {
  const resp = await fetch(`${API_URL}/register-course`, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify(payload),
  });
  const data = await checkResp(resp);
  if (!data?.success) throw new Error('No se pudo completar el registro');
}

export async function incrementCourseClicks(id: string): Promise<void> {
  const { error } = await supabase.rpc('increment_course_clicks', { p_id: id });
  if (error) { /* best effort */ }
}

// ── Ads ──

export async function fetchAds(): Promise<Ad[]> {
  const { data, error } = await supabase
    .from('ads')
    .select('*')
    .eq('estado', 'Activo');
  if (error) throw new Error('No se pudieron cargar los anuncios');
  return (data ?? []).map((r: any) => ({
    id: r.id,
    titulo: r.titulo,
    descripcion: r.descripcion ?? '',
    imagenUrl: r.imagen_path ?? '',
    link: r.link ?? '',
    linkVideo: r.link_video ?? '',
    clicksContacto: r.clicks_contacto ?? 0,
  }));
}

export async function incrementAdClicks(id: string): Promise<void> {
  const { error } = await supabase.rpc('increment_ad_clicks', { p_id: id });
  if (error) { /* best effort */ }
}

// ── Plans ──

export async function fetchPlans(): Promise<Plan[]> {
  const { data, error } = await supabase
    .from('plans')
    .select('*')
    .eq('activo', true);
  if (error) throw new Error('No se pudieron cargar los planes');
  return (data ?? []).map((r: any) => ({
    id: r.id,
    nombre: r.nombre,
    precioARS: r.precio_ars ?? 0,
    descripcion: r.descripcion ?? '',
    duracionDias: r.duracion_dias ?? 0,
  }));
}

export interface AdvertisePayload {
  planNombre: string;
  titulo: string;
  descripcion: string;
  link: string;
  imagenUrl?: string | null;
  linkVideo?: string;
}

export async function registerAdvert(payload: AdvertisePayload): Promise<void> {
  const resp = await fetch(`${API_URL}/register-ad`, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify(payload),
  });
  const data = await checkResp(resp);
  if (!data?.success) throw new Error('No se pudo completar el registro');
}

// ── Contact verification ──

export async function startVerification(
  professionalId: string,
  name: string,
  phone: string,
  email: string
): Promise<string> {
  const resp = await fetch(`${API_URL}/start-verification`, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify({ professionalId, name, phone, email }),
  });
  const data = await checkResp(resp);
  if (!data?.success) throw new Error('No se pudo iniciar la verificación');
  return data.contactLogId;
}

export async function verifyCode(
  contactLogId: string,
  code: string
): Promise<{ professionalName: string; whatsapp: string }> {
  const resp = await fetch(`${API_URL}/verify-code`, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify({ contactLogId, code }),
  });
  const data = await checkResp(resp);
  if (!data?.success) throw new Error(data?.error || 'Código incorrecto o vencido');
  return { professionalName: data.professionalName, whatsapp: data.whatsapp };
}

// ── Reviews ──

export interface Review {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
}

export async function fetchProfessionalReviews(professionalId: string): Promise<Review[]> {
  const { data, error } = await supabase.rpc('get_professional_reviews', {
    p_professional_id: professionalId,
  });
  if (error) throw new Error('No se pudieron cargar las opiniones');
  return (data ?? []) as Review[];
}

export async function checkReviewToken(
  token: string
): Promise<{ valid: boolean; professionalName?: string; professionalProfession?: string }> {
  const resp = await fetch(`${API_URL}/check-token`, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify({ token }),
  });
  const data = await checkResp(resp);
  return {
    valid: data.valid,
    professionalName: data.professionalName,
    professionalProfession: data.professionalProfession,
  };
}

export async function submitReview(
  token: string,
  rating: number,
  comment: string
): Promise<void> {
  const resp = await fetch(`${API_URL}/submit-review`, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify({ token, rating, comment }),
  });
  const data = await checkResp(resp);
  if (!data?.success) throw new Error('No se pudo enviar la calificación');
}

// ── Admin auth ──

export async function adminSignIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error('Credenciales incorrectas');
  return data;
}

export async function adminSignOut() {
  await supabase.auth.signOut();
}

export async function adminChangePassword(currentPassword: string, newPassword: string) {
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: (await supabase.auth.getUser()).data.user?.email ?? '',
    password: currentPassword,
  });
  if (signInError) throw new Error('La contraseña actual es incorrecta');
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw new Error('No se pudo cambiar la contraseña');
}

export async function adminResetPassword(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}#/admin`,
  });
  if (error) throw new Error('No se pudo enviar el correo de recuperación');
}

// ── Admin data operations ──

export interface AdminProfessional {
  id: string;
  name: string;
  profession: string;
  category: string;
  neighborhood: string;
  schedule: string;
  whatsapp: string;
  description: string;
  photo_url: string;
  dni_frente_path: string;
  dni_dorso_path: string;
  foto_matricula_path: string;
  numero_matricula: string;
  estado: string;
  verificado: boolean;
  rating_avg: number;
  review_count: number;
  clicks_contacto: number;
  created_at: string;
}

export async function adminListProfessionals(): Promise<AdminProfessional[]> {
  const { data, error } = await supabase.rpc('admin_list_all_professionals');
  if (error) throw new Error('No autorizado o error al cargar');
  return (data ?? []) as AdminProfessional[];
}

export async function adminSetProfessionalEstado(id: string, estado: string, detail?: string) {
  const { error } = await supabase.rpc('admin_set_professional_estado', {
    p_id: id, p_estado: estado, p_detail: detail ?? '',
  });
  if (error) throw new Error('No se pudo cambiar el estado');
}

export async function adminUpdateProfessional(id: string, updates: Record<string, any>) {
  const { error } = await supabase.rpc('admin_update_professional', {
    p_id: id,
    p_name: updates.name ?? null,
    p_profession: updates.profession ?? null,
    p_neighborhood: updates.neighborhood ?? null,
    p_schedule: updates.schedule ?? null,
    p_whatsapp: updates.whatsapp ?? null,
    p_description: updates.description ?? null,
    p_category: updates.category ?? null,
    p_photo_url: updates.photo_url ?? null,
    p_numero_matricula: updates.numero_matricula ?? null,
    p_verificado: updates.verificado ?? null,
    p_dni_frente_path: updates.dni_frente_path ?? null,
    p_dni_dorso_path: updates.dni_dorso_path ?? null,
    p_foto_matricula_path: updates.foto_matricula_path ?? null,
  });
  if (error) throw new Error('No se pudo actualizar el profesional');
}

export async function adminDeleteProfessional(id: string) {
  const { error } = await supabase.rpc('admin_delete_professional', { p_id: id });
  if (error) throw new Error('No se pudo eliminar el profesional');
}

export interface AdminAd {
  id: string;
  titulo: string;
  descripcion: string;
  link: string;
  link_video: string;
  imagen_path: string;
  plan_nombre: string;
  estado: string;
  clicks_contacto: number;
  created_at: string;
}

export async function adminListAds(): Promise<AdminAd[]> {
  const { data, error } = await supabase.rpc('admin_list_all_ads');
  if (error) throw new Error('No autorizado o error al cargar');
  return (data ?? []) as AdminAd[];
}

export async function adminSetAdEstado(id: string, estado: string, detail?: string) {
  const { error } = await supabase.rpc('admin_set_ad_estado', {
    p_id: id, p_estado: estado, p_detail: detail ?? '',
  });
  if (error) throw new Error('No se pudo cambiar el estado del anuncio');
}

export async function adminUpdateAd(id: string, updates: Record<string, any>) {
  const { error } = await supabase.rpc('admin_update_ad', {
    p_id: id,
    p_titulo: updates.titulo ?? null,
    p_descripcion: updates.descripcion ?? null,
    p_link: updates.link ?? null,
    p_link_video: updates.link_video ?? null,
    p_imagen_path: updates.imagen_path ?? null,
    p_plan_nombre: updates.plan_nombre ?? null,
  });
  if (error) throw new Error('No se pudo actualizar el anuncio');
}

export async function adminDeleteAd(id: string) {
  const { error } = await supabase.rpc('admin_delete_ad', { p_id: id });
  if (error) throw new Error('No se pudo eliminar el anuncio');
}

export interface AdminReview {
  id: string;
  professional_id: string;
  contact_log_id: string;
  rating: number;
  comment: string;
  estado: string;
  created_at: string;
}

export async function adminListReviews(professionalId?: string): Promise<AdminReview[]> {
  const { data, error } = await supabase.rpc('admin_list_reviews', {
    p_professional_id: professionalId ?? null,
  });
  if (error) throw new Error('No autorizado o error al cargar');
  return (data ?? []) as AdminReview[];
}

export async function adminSetReviewEstado(id: string, estado: string, detail?: string) {
  const { error } = await supabase.rpc('admin_set_review_estado', {
    p_id: id, p_estado: estado, p_detail: detail ?? '',
  });
  if (error) throw new Error('No se pudo cambiar el estado de la opinión');
}

export async function adminListContactLogs(professionalId?: string) {
  const { data, error } = await supabase.rpc('admin_list_contact_logs', {
    p_professional_id: professionalId ?? null,
  });
  if (error) throw new Error('No autorizado o error al cargar');
  return data ?? [];
}

// ── Private image signed URLs (admin only) ──

export async function getPrivateImageUrl(path: string): Promise<string> {
  const { data, error } = await supabase.storage.from('private-docs').createSignedUrl(path, 300);
  if (error || !data?.signedUrl) return '';
  return data.signedUrl;
}

// ── Admin session check ──

export async function getAdminSession() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from('admin_profiles').select('is_admin').eq('user_id', user.id).maybeSingle();
  if (data?.is_admin) return user;
  return null;
}
