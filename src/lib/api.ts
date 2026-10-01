import type { Professional, Course, Ad, Plan } from '@/types';

const API_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/airtable-proxy`;

const HEADERS: Record<string, string> = {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
};

async function checkResp(resp: Response): Promise<any> {
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    throw new Error(err?.detail || err?.error || `Error del servidor (${resp.status})`);
  }
  const data = await resp.json();
  if (data?.error) {
    throw new Error(data.error);
  }
  return data;
}

// ── Professionals ──

export async function fetchProfessionals(): Promise<Professional[]> {
  const resp = await fetch(`${API_URL}/Profesionales?estado=Aprobado`, { headers: HEADERS });
  const data = await checkResp(resp);
  return (data.records ?? []) as Professional[];
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
  const resp = await fetch(`${API_URL}/Profesionales`, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify(payload),
  });
  const data = await checkResp(resp);
  if (!data?.success) throw new Error('No se pudo completar el registro');
}

export async function incrementProfessionalClicks(id: string): Promise<void> {
  const resp = await fetch(`${API_URL}/Profesionales/${id}`, {
    method: 'PATCH',
    headers: HEADERS,
    body: JSON.stringify({ incrementClicks: true }),
  });
  await checkResp(resp);
}

// ── Courses ──

export async function fetchCourses(): Promise<Course[]> {
  const resp = await fetch(`${API_URL}/Cursos?estado=Activo`, { headers: HEADERS });
  const data = await checkResp(resp);
  return (data.records ?? []) as Course[];
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
  const resp = await fetch(`${API_URL}/Cursos`, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify(payload),
  });
  const data = await checkResp(resp);
  if (!data?.success) throw new Error('No se pudo completar el registro');
}

export async function incrementCourseClicks(id: string): Promise<void> {
  const resp = await fetch(`${API_URL}/Cursos/${id}`, {
    method: 'PATCH',
    headers: HEADERS,
    body: JSON.stringify({ incrementClicks: true }),
  });
  await checkResp(resp);
}

// ── Ads ──

export async function fetchAds(): Promise<Ad[]> {
  const resp = await fetch(`${API_URL}/Anuncios?estado=Activo`, { headers: HEADERS });
  const data = await checkResp(resp);
  return (data.records ?? []) as Ad[];
}

export async function incrementAdClicks(id: string): Promise<void> {
  const resp = await fetch(`${API_URL}/Anuncios/${id}`, {
    method: 'PATCH',
    headers: HEADERS,
    body: JSON.stringify({ incrementClicks: true }),
  });
  await checkResp(resp);
}

// ── Plans ──

export async function fetchPlans(): Promise<Plan[]> {
  const resp = await fetch(`${API_URL}/PlanesPublicidad`, { headers: HEADERS });
  const data = await checkResp(resp);
  return (data.records ?? []) as Plan[];
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
  const resp = await fetch(`${API_URL}/Anuncios`, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify(payload),
  });
  const data = await checkResp(resp);
  if (!data?.success) throw new Error('No se pudo completar el registro');
}
