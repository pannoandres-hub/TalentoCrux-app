import { createClient } from '@supabase/supabase-js';
import type { Professional, Course, Ad, Plan } from '@/types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

const hasValidSupabaseConfig = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('http') &&
  !supabaseUrl.includes('your-supabase-project')
);

// Fallback in-memory storage for mock mode
const STORAGE_PREFIX = 'talentocrux_live_';
function getStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function setStorage<T>(key: string, val: T): void {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(val));
  } catch {
    // ignore
  }
}

export function generateRatingCode(): string {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `TC-${num}`;
}

// ── Realistic CABA Initial Mock Data ──

const INITIAL_PROFESSIONALS: AdminProfessional[] = [];

const INITIAL_COURSES: Course[] = [];

const INITIAL_ADS: AdminAd[] = [];

const INITIAL_PLANS: Plan[] = [
  {
    id: 'plan-1',
    nombre: 'Plan Básico',
    precioARS: 15000,
    descripcion: 'Presencia en el listado de anuncios rotativos por 30 días con enlace directo a WhatsApp.',
    duracionDias: 30,
  },
  {
    id: 'plan-2',
    nombre: 'Plan Destacado',
    precioARS: 28000,
    descripcion: 'Banner visual en intermedio de perfiles y página principal con soporte para imagen destacada.',
    duracionDias: 30,
  },
  {
    id: 'plan-3',
    nombre: 'Plan Premium',
    precioARS: 45000,
    descripcion: 'Máxima visibilidad: anuncio intercalado prioritario, interstitial al contactar y duración extendida de 60 días.',
    duracionDias: 60,
  },
];

// Unified reviews: professionals & courses
const INITIAL_REVIEWS: AdminReview[] = [];

export interface ContactLog {
  id: string;
  target_type: 'professional' | 'course';
  professional_id: string;
  professional_name: string;
  professional_profession: string;
  professional_neighborhood: string;
  client_name: string;
  client_phone: string;
  client_email: string;
  rating_code: string;
  code_status: 'activo' | 'usado';
  created_at: string;
  verified: boolean;
}

const INITIAL_CONTACT_LOGS: ContactLog[] = [];

// Helper client or proxy
export const supabase = hasValidSupabaseConfig
  ? createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : ({
      from: () => ({
        select: () => ({
          eq: () => Promise.resolve({ data: [], error: null }),
          order: () => Promise.resolve({ data: [], error: null }),
          maybeSingle: () => Promise.resolve({ data: null, error: null }),
        }),
        insert: () => Promise.resolve({ data: null, error: null }),
        update: () => Promise.resolve({ data: null, error: null }),
        delete: () => Promise.resolve({ data: null, error: null }),
      }),
      rpc: () => Promise.resolve({ data: null, error: null }),
      storage: {
        from: () => ({
          createSignedUrl: () => Promise.resolve({ data: { signedUrl: '' }, error: null }),
        }),
      },
      auth: {
        getUser: () => {
          const u = getStorage<unknown>('admin_user', null);
          return Promise.resolve({ data: { user: u } });
        },
        signInWithPassword: ({ email }: { email: string }) => {
          const user = { id: 'admin-mock-1', email };
          setStorage('admin_user', user);
          return Promise.resolve({ data: { user }, error: null });
        },
        signOut: () => {
          setStorage('admin_user', null);
          return Promise.resolve({ error: null });
        },
        updateUser: () => Promise.resolve({ data: {}, error: null }),
        resetPasswordForEmail: () => Promise.resolve({ data: {}, error: null }),
      },
    } as unknown as ReturnType<typeof createClient>);

const API_URL = hasValidSupabaseConfig
  ? `${supabaseUrl}/functions/v1/talentocrux-api`
  : '/api/mock-talentocrux';

const HEADERS: Record<string, string> = {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${supabaseAnonKey ?? 'mock-key'}`,
};

async function checkResp(resp: Response): Promise<Record<string, unknown>> {
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

// ── In-Memory / Local Storage state helpers ──
function getMockProfessionals(): AdminProfessional[] {
  return getStorage<AdminProfessional[]>('professionals', INITIAL_PROFESSIONALS);
}
function setMockProfessionals(list: AdminProfessional[]): void {
  setStorage('professionals', list);
}

function getMockCourses(): Course[] {
  return getStorage<Course[]>('courses', INITIAL_COURSES);
}
function setMockCourses(list: Course[]): void {
  setStorage('courses', list);
}

function getMockAds(): AdminAd[] {
  return getStorage<AdminAd[]>('ads', INITIAL_ADS);
}
function setMockAds(list: AdminAd[]): void {
  setStorage('ads', list);
}

function getMockPlans(): Plan[] {
  return getStorage<Plan[]>('plans', INITIAL_PLANS);
}

function getMockReviews(): AdminReview[] {
  return getStorage<AdminReview[]>('reviews', INITIAL_REVIEWS);
}
function setMockReviews(list: AdminReview[]): void {
  setStorage('reviews', list);
}

// ── Admin direct creation functions (all fields optional, no terms) ──

export async function adminCreateProfessional(payload: Partial<AdminProfessional>): Promise<AdminProfessional> {
  const list = getMockProfessionals();
  const newProf: AdminProfessional = {
    id: `prof-${Date.now()}`,
    name: payload.name || 'Sin nombre',
    profession: payload.profession || 'Servicios Generales',
    category: payload.category || 'hogar',
    neighborhood: payload.neighborhood || 'Palermo',
    schedule: payload.schedule || 'A convenir',
    whatsapp: payload.whatsapp || '',
    description: payload.description || '',
    photo_url: payload.photo_url || '',
    dni_frente_path: payload.dni_frente_path || '',
    dni_dorso_path: payload.dni_dorso_path || '',
    foto_matricula_path: payload.foto_matricula_path || '',
    numero_matricula: payload.numero_matricula || '',
    estado: payload.estado || 'Aprobado',
    verificado: Boolean(payload.verificado ?? payload.numero_matricula),
    rating_avg: 5.0,
    review_count: 0,
    clicks_contacto: 0,
    created_at: new Date().toISOString(),
  };
  list.unshift(newProf);
  setMockProfessionals(list);
  return newProf;
}

export async function adminCreateCourse(payload: Partial<Course>): Promise<Course> {
  const list = getMockCourses();
  const newCourse: Course = {
    id: `course-${Date.now()}`,
    nombreCurso: payload.nombreCurso || 'Curso sin título',
    instructor: payload.instructor || 'Instructor',
    whatsapp: payload.whatsapp || '',
    email: payload.email || '',
    descripcion: payload.descripcion || '',
    duracionHoras: payload.duracionHoras || 'A convenir',
    precioARS: Number(payload.precioARS ?? 0),
    clicksContacto: 0,
    estado: payload.estado || 'Activo',
    rating_avg: 5.0,
    review_count: 0,
    created_at: new Date().toISOString(),
  };
  list.unshift(newCourse);
  setMockCourses(list);
  return newCourse;
}

export async function adminCreateAd(payload: Partial<AdminAd>): Promise<AdminAd> {
  const list = getMockAds();
  const newAd: AdminAd = {
    id: `ad-${Date.now()}`,
    titulo: payload.titulo || 'Publicidad',
    descripcion: payload.descripcion || '',
    link: payload.link || '',
    link_video: payload.link_video || '',
    imagen_path: payload.imagen_path || '',
    plan_nombre: payload.plan_nombre || 'Plan Básico',
    estado: payload.estado || 'Activo',
    clicks_contacto: 0,
    created_at: new Date().toISOString(),
  };
  list.unshift(newAd);
  setMockAds(list);
  return newAd;
}

// ── Professionals ──

export async function fetchProfessionals(): Promise<Professional[]> {
  if (hasValidSupabaseConfig) {
    try {
      const { data, error } = await supabase
        .from('professionals')
        .select('*')
        .eq('estado', 'Aprobado');
      if (!error && data && data.length > 0) {
        return data.map(mapProfessional);
      }
    } catch {
      // fallback
    }
  }

  const list = getMockProfessionals();
  return list.filter((p) => p.estado === 'Aprobado').map(mapProfessional);
}

function mapProfessional(r: Record<string, unknown>): Professional {
  return {
    id: String(r.id),
    name: String(r.name),
    profession: String(r.profession),
    category: (r.category as Professional['category']) ?? 'hogar',
    neighborhood: String(r.neighborhood),
    rating: Number(r.rating_avg ?? r.rating ?? 0),
    reviews: Number(r.review_count ?? r.reviews ?? 0),
    schedule: String(r.schedule),
    whatsapp: String(r.whatsapp),
    photo: String(r.photo_url ?? r.photo ?? ''),
    description: String(r.description ?? ''),
    verificado: Boolean(r.verificado),
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
  if (hasValidSupabaseConfig) {
    try {
      const resp = await fetch(`${API_URL}/register-professional`, {
        method: 'POST',
        headers: HEADERS,
        body: JSON.stringify(payload),
      });
      const data = await checkResp(resp);
      if (data?.success) return;
    } catch {
      // fallback
    }
  }

  const list = getMockProfessionals();
  const newProf: AdminProfessional = {
    id: `prof-${Date.now()}`,
    name: payload.name,
    profession: payload.profession,
    category: 'hogar',
    neighborhood: payload.neighborhood,
    schedule: payload.schedule,
    whatsapp: payload.whatsapp,
    description: payload.description || '',
    photo_url: payload.foto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80',
    dni_frente_path: payload.dniFrente || '',
    dni_dorso_path: payload.dniDorso || '',
    foto_matricula_path: payload.fotoMatricula || '',
    numero_matricula: payload.numeroMatricula || '',
    estado: 'Pendiente',
    verificado: Boolean(payload.numeroMatricula),
    rating_avg: 5.0,
    review_count: 0,
    clicks_contacto: 0,
    created_at: new Date().toISOString(),
  };
  list.unshift(newProf);
  setMockProfessionals(list);
}

export async function incrementProfessionalClicks(id: string): Promise<void> {
  if (hasValidSupabaseConfig) {
    try {
      const { error } = await supabase.rpc('increment_professional_clicks', { p_id: id });
      if (!error) return;
    } catch {
      // best effort
    }
  }

  const list = getMockProfessionals();
  const idx = list.findIndex((p) => p.id === id);
  if (idx !== -1) {
    list[idx].clicks_contacto = (list[idx].clicks_contacto || 0) + 1;
    setMockProfessionals(list);
  }
}

// ── Courses ──

export async function fetchCourses(): Promise<Course[]> {
  if (hasValidSupabaseConfig) {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('estado', 'Activo');
      if (!error && data && data.length > 0) {
        return (data as Record<string, unknown>[]).map((r) => ({
          id: String(r.id),
          nombreCurso: String(r.nombre_curso),
          instructor: String(r.instructor),
          whatsapp: String(r.whatsapp),
          email: String(r.email ?? ''),
          descripcion: String(r.descripcion ?? ''),
          duracionHoras: String(r.duracion_horas ?? ''),
          precioARS: Number(r.precio_ars ?? 0),
          clicksContacto: Number(r.clicks_contacto ?? 0),
          estado: String(r.estado ?? 'Activo'),
          rating_avg: Number(r.rating_avg ?? 0),
          review_count: Number(r.review_count ?? 0),
        }));
      }
    } catch {
      // fallback
    }
  }

  const list = getMockCourses();
  return list.filter((c) => !c.estado || c.estado === 'Activo');
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
  if (hasValidSupabaseConfig) {
    try {
      const resp = await fetch(`${API_URL}/register-course`, {
        method: 'POST',
        headers: HEADERS,
        body: JSON.stringify(payload),
      });
      const data = await checkResp(resp);
      if (data?.success) return;
    } catch {
      // fallback
    }
  }

  const list = getMockCourses();
  const newCourse: Course = {
    id: `course-${Date.now()}`,
    nombreCurso: payload.nombreCurso,
    instructor: payload.instructor,
    whatsapp: payload.whatsapp,
    email: payload.email,
    descripcion: payload.descripcion,
    duracionHoras: payload.duracionHoras,
    precioARS: payload.precioARS,
    clicksContacto: 0,
    estado: 'Pendiente',
    rating_avg: 5.0,
    review_count: 0,
    created_at: new Date().toISOString(),
  };
  list.unshift(newCourse);
  setMockCourses(list);
}

export async function incrementCourseClicks(id: string): Promise<void> {
  if (hasValidSupabaseConfig) {
    try {
      const { error } = await supabase.rpc('increment_course_clicks', { p_id: id });
      if (!error) return;
    } catch {
      // best effort
    }
  }

  const list = getMockCourses();
  const idx = list.findIndex((c) => c.id === id);
  if (idx !== -1) {
    list[idx].clicksContacto = (list[idx].clicksContacto || 0) + 1;
    setMockCourses(list);
  }
}

// ── Ads ──

export async function fetchAds(): Promise<Ad[]> {
  if (hasValidSupabaseConfig) {
    try {
      const { data, error } = await supabase
        .from('ads')
        .select('*')
        .eq('estado', 'Activo');
      if (!error && data && data.length > 0) {
        return (data as Record<string, unknown>[]).map((r) => ({
          id: String(r.id),
          titulo: String(r.titulo),
          descripcion: String(r.descripcion ?? ''),
          imagenUrl: String(r.imagen_path ?? ''),
          link: String(r.link ?? ''),
          linkVideo: String(r.link_video ?? ''),
          clicksContacto: Number(r.clicks_contacto ?? 0),
        }));
      }
    } catch {
      // fallback
    }
  }

  const list = getMockAds();
  return list.filter((a) => a.estado === 'Activo').map((r) => ({
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
  if (hasValidSupabaseConfig) {
    try {
      const { error } = await supabase.rpc('increment_ad_clicks', { p_id: id });
      if (!error) return;
    } catch {
      // best effort
    }
  }

  const list = getMockAds();
  const idx = list.findIndex((a) => a.id === id);
  if (idx !== -1) {
    list[idx].clicks_contacto = (list[idx].clicks_contacto || 0) + 1;
    setMockAds(list);
  }
}

// ── Plans ──

export async function fetchPlans(): Promise<Plan[]> {
  if (hasValidSupabaseConfig) {
    try {
      const { data, error } = await supabase
        .from('plans')
        .select('*')
        .eq('activo', true);
      if (!error && data && data.length > 0) {
        return (data as Record<string, unknown>[]).map((r) => ({
          id: String(r.id),
          nombre: String(r.nombre),
          precioARS: Number(r.precio_ars ?? 0),
          descripcion: String(r.descripcion ?? ''),
          duracionDias: Number(r.duracion_dias ?? 0),
        }));
      }
    } catch {
      // fallback
    }
  }

  return getMockPlans();
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
  if (hasValidSupabaseConfig) {
    try {
      const resp = await fetch(`${API_URL}/register-ad`, {
        method: 'POST',
        headers: HEADERS,
        body: JSON.stringify(payload),
      });
      const data = await checkResp(resp);
      if (data?.success) return;
    } catch {
      // fallback
    }
  }

  const list = getMockAds();
  const newAd: AdminAd = {
    id: `ad-${Date.now()}`,
    titulo: payload.titulo,
    descripcion: payload.descripcion,
    link: payload.link,
    link_video: payload.linkVideo || '',
    imagen_path: payload.imagenUrl || '',
    plan_nombre: payload.planNombre,
    estado: 'Pendiente',
    clicks_contacto: 0,
    created_at: new Date().toISOString(),
  };
  list.unshift(newAd);
  setMockAds(list);
}

// ── Contact verification & Automatic Unique Code Generation ──

interface ContactSession {
  targetId: string;
  whatsapp: string;
  code: string;
}
const mockVerificationSessions = new Map<string, ContactSession>();

export async function startVerification(
  targetId: string,
  _name: string,
  _phone: string,
  _email: string,
  targetType: 'professional' | 'course' = 'professional'
): Promise<string> {
  if (hasValidSupabaseConfig) {
    try {
      const resp = await fetch(`${API_URL}/start-verification`, {
        method: 'POST',
        headers: HEADERS,
        body: JSON.stringify({ professionalId: targetId, name: _name, phone: _phone, email: _email }),
      });
      const data = await checkResp(resp);
      if (data?.success) return String(data.contactLogId);
    } catch {
      // fallback
    }
  }

  const id = `cl-${Date.now()}`;
  const profs = getMockProfessionals();
  const courses = getMockCourses();

  let targetName = 'Profesional';
  let targetProfession = 'Servicios CABA';
  let targetNeighborhood = 'CABA';
  let wa = '5491155550101';

  if (targetType === 'course' || targetId.startsWith('course-')) {
    const course = courses.find((c) => c.id === targetId);
    if (course) {
      targetName = course.nombreCurso;
      targetProfession = `Curso por ${course.instructor}`;
      targetNeighborhood = 'CABA';
      wa = course.whatsapp || wa;
    }
  } else {
    const prof = profs.find((p) => p.id === targetId);
    if (prof) {
      targetName = prof.name;
      targetProfession = prof.profession;
      targetNeighborhood = prof.neighborhood;
      wa = prof.whatsapp || wa;
    }
  }

  // 6-digit SMS verification code
  mockVerificationSessions.set(id, { targetId, whatsapp: wa, code: '123456' });
  console.info(`[TalentoCrux] Código de verificación inicial: 123456`);

  // Generate unique single-use rating code for 2-week review
  const ratingCode = generateRatingCode();

  // Record contact log
  const contacts = getStorage<ContactLog[]>('contact_logs', INITIAL_CONTACT_LOGS);
  contacts.unshift({
    id,
    target_type: targetType,
    professional_id: targetId,
    professional_name: targetName,
    professional_profession: targetProfession,
    professional_neighborhood: targetNeighborhood,
    client_name: _name || 'Cliente',
    client_phone: _phone || '',
    client_email: _email || '',
    rating_code: ratingCode,
    code_status: 'activo',
    created_at: new Date().toISOString(),
    verified: false,
  });
  setStorage('contact_logs', contacts);

  return id;
}

export async function verifyCode(
  contactLogId: string,
  code: string
): Promise<{ professionalName: string; whatsapp: string; ratingCode: string }> {
  if (hasValidSupabaseConfig) {
    try {
      const resp = await fetch(`${API_URL}/verify-code`, {
        method: 'POST',
        headers: HEADERS,
        body: JSON.stringify({ contactLogId, code }),
      });
      const data = await checkResp(resp);
      if (data?.success) {
        return {
          professionalName: String(data.professionalName),
          whatsapp: String(data.whatsapp),
          ratingCode: String(data.ratingCode ?? 'TC-7421'),
        };
      }
    } catch {
      // fallback
    }
  }

  const session = mockVerificationSessions.get(contactLogId);
  if (session && (session.code === code || code === '123456' || code.length === 6)) {
    // Mark verified in persistent contact logs
    const contacts = getStorage<ContactLog[]>('contact_logs', INITIAL_CONTACT_LOGS);
    const cIdx = contacts.findIndex((c) => c.id === contactLogId);
    let targetName = 'Profesional';
    let ratingCode = 'TC-7421';
    if (cIdx !== -1) {
      contacts[cIdx].verified = true;
      targetName = contacts[cIdx].professional_name;
      ratingCode = contacts[cIdx].rating_code || ratingCode;
      setStorage('contact_logs', contacts);
    }

    return {
      professionalName: targetName,
      whatsapp: session.whatsapp,
      ratingCode,
    };
  }

  throw new Error('Código incorrecto o vencido (código de prueba: 123456)');
}

// ── Reviews & Direct 2-Week Rating Link ──

export interface Review {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
}

export function getProfessionalReviewUrl(targetId: string): string {
  const base = typeof window !== 'undefined' ? window.location.origin : 'https://talentocrux.com';
  return `${base}/#/calificar/${targetId}`;
}

export async function fetchProfessionalReviews(targetId: string): Promise<Review[]> {
  if (hasValidSupabaseConfig) {
    try {
      const { data, error } = await supabase.rpc('get_professional_reviews', {
        p_professional_id: targetId,
      });
      if (!error && data && Array.isArray(data) && data.length > 0) {
        return (data as Record<string, unknown>[]).map((r) => ({
          id: String(r.id),
          rating: Number(r.rating),
          comment: String(r.comment),
          created_at: String(r.created_at),
        }));
      }
    } catch {
      // fallback
    }
  }

  const list = getMockReviews();
  return list
    .filter((r) => r.professional_id === targetId && r.estado === 'Aprobado')
    .map((r) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      created_at: r.created_at,
    }));
}

export async function fetchCourseReviews(courseId: string): Promise<Review[]> {
  const list = getMockReviews();
  return list
    .filter((r) => r.professional_id === courseId && r.estado === 'Aprobado')
    .map((r) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      created_at: r.created_at,
    }));
}

export async function checkReviewToken(
  token: string
): Promise<{
  valid: boolean;
  professionalName?: string;
  professionalProfession?: string;
  professionalId?: string;
  isCourse?: boolean;
}> {
  if (hasValidSupabaseConfig) {
    try {
      const resp = await fetch(`${API_URL}/check-token`, {
        method: 'POST',
        headers: HEADERS,
        body: JSON.stringify({ token }),
      });
      const data = await checkResp(resp);
      if (data?.valid) {
        return {
          valid: Boolean(data.valid),
          professionalName: String(data.professionalName ?? ''),
          professionalProfession: String(data.professionalProfession ?? ''),
          professionalId: String(data.professionalId ?? token),
          isCourse: Boolean(data.isCourse),
        };
      }
    } catch {
      // fallback
    }
  }

  const isCourse = token.startsWith('course-');
  if (isCourse) {
    const courses = getMockCourses();
    const course = courses.find((c) => c.id === token) || courses[0];
    return {
      valid: true,
      professionalName: course.nombreCurso,
      professionalProfession: `Curso por ${course.instructor}`,
      professionalId: course.id,
      isCourse: true,
    };
  }

  const profs = getMockProfessionals();
  const prof = profs.find((p) => p.id === token) || profs[0];
  return {
    valid: true,
    professionalName: prof ? prof.name : 'Carlos Rossi',
    professionalProfession: prof ? prof.profession : 'Electricista Matriculado',
    professionalId: prof ? prof.id : 'prof-1',
    isCourse: false,
  };
}

export async function submitReview(
  token: string,
  rating: number,
  comment: string,
  code: string,
  clientName?: string
): Promise<void> {
  const cleanCode = (code || '').trim().toUpperCase();
  if (!cleanCode) {
    throw new Error('Debés ingresar el código de verificación que te enviamos por WhatsApp o email.');
  }

  const contacts = getStorage<ContactLog[]>('contact_logs', INITIAL_CONTACT_LOGS);

  // Validate single-use code
  const contactIdx = contacts.findIndex(
    (c) => c.rating_code && c.rating_code.toUpperCase() === cleanCode
  );

  if (contactIdx === -1) {
    throw new Error(`Código "${cleanCode}" no encontrado. Verificá el código enviado en el mensaje.`);
  }

  const contact = contacts[contactIdx];

  if (contact.code_status === 'usado') {
    throw new Error('Este código ya fue utilizado. Cada contacto puede calificarse una sola vez a menos que sea reactivado por el administrador.');
  }

  const targetId = contact.professional_id || token;
  const isCourse = contact.target_type === 'course' || targetId.startsWith('course-');

  const profs = getMockProfessionals();
  const courses = getMockCourses();

  const targetProf = profs.find((p) => p.id === targetId);
  const targetCourse = courses.find((c) => c.id === targetId);
  const targetName = isCourse ? (targetCourse?.nombreCurso || 'Curso') : (targetProf?.name || 'Profesional');

  const list = getMockReviews();
  const newReview: AdminReview = {
    id: `rev-${Date.now()}`,
    target_type: isCourse ? 'course' : 'professional',
    professional_id: targetId,
    professional_name: targetName,
    contact_log_id: contact.id,
    client_name: clientName || contact.client_name || 'Cliente Verificado',
    rating,
    comment,
    estado: 'Aprobado',
    rating_code: cleanCode,
    created_at: new Date().toISOString(),
  };

  list.unshift(newReview);
  setMockReviews(list);

  // Deactivate single-use code
  contacts[contactIdx].code_status = 'usado';
  setStorage('contact_logs', contacts);

  // Recalculate average rating & review count
  if (isCourse && targetCourse) {
    const courseReviews = list.filter((r) => r.professional_id === targetId && r.estado === 'Aprobado');
    const totalRating = courseReviews.reduce((sum, r) => sum + r.rating, 0);
    targetCourse.review_count = courseReviews.length;
    targetCourse.rating_avg = Number((totalRating / courseReviews.length).toFixed(1));
    setMockCourses(courses);
  } else if (targetProf) {
    const profReviews = list.filter((r) => r.professional_id === targetId && r.estado === 'Aprobado');
    const totalRating = profReviews.reduce((sum, r) => sum + r.rating, 0);
    targetProf.review_count = profReviews.length;
    targetProf.rating_avg = Number((totalRating / profReviews.length).toFixed(1));
    setMockProfessionals(profs);
  }
}

// ── Admin auth & simple credentials ──

const DEFAULT_ADMIN_EMAIL = 'admin@cruxtalento.com';
const DEFAULT_ADMIN_PASS = 'admin123';

export function adminGetAdminEmail(): string {
  return getStorage<string>('admin_email', DEFAULT_ADMIN_EMAIL);
}

export async function adminSignIn(email: string, password: string) {
  if (hasValidSupabaseConfig) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (!error && data?.user) return data;
    } catch {
      // fallback
    }
  }

  const currentEmail = getStorage<string>('admin_email', DEFAULT_ADMIN_EMAIL);
  const currentPass = getStorage<string>('admin_password', DEFAULT_ADMIN_PASS);

  if (email.trim().toLowerCase() !== currentEmail.trim().toLowerCase()) {
    throw new Error(`Email incorrecto. El correo configurado es ${currentEmail}`);
  }

  if (password !== currentPass) {
    throw new Error('Contraseña incorrecta.');
  }

  const user = { id: 'admin-mock-1', email: currentEmail };
  setStorage('admin_user', user);
  return { user };
}

export async function adminSignOut() {
  if (hasValidSupabaseConfig) {
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
  }
  setStorage('admin_user', null);
}

export async function adminChangeEmail(currentPassword: string, newEmail: string): Promise<void> {
  const currentPass = getStorage<string>('admin_password', DEFAULT_ADMIN_PASS);
  if (currentPassword !== currentPass) {
    throw new Error('La contraseña actual es incorrecta. No se pudo cambiar el correo.');
  }
  const cleanEmail = newEmail.trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
    throw new Error('Ingresá un correo electrónico válido.');
  }

  setStorage('admin_email', cleanEmail);
  const user = getStorage<{ id: string; email: string } | null>('admin_user', null);
  if (user) {
    user.email = cleanEmail;
    setStorage('admin_user', user);
  }
}

export async function adminChangePassword(currentPassword: string, newPassword: string) {
  if (hasValidSupabaseConfig) {
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: (await supabase.auth.getUser()).data.user?.email ?? '',
        password: currentPassword,
      });
      if (signInError) throw new Error('La contraseña actual es incorrecta');
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw new Error('No se pudo cambiar la contraseña');
    } catch {
      // best effort
    }
  }

  const saved = getStorage<string>('admin_password', DEFAULT_ADMIN_PASS);
  if (currentPassword !== saved) {
    throw new Error('La contraseña actual es incorrecta.');
  }
  if (!newPassword || newPassword.length < 6) {
    throw new Error('La nueva contraseña debe tener al menos 6 caracteres.');
  }

  setStorage('admin_password', newPassword);
}

export async function adminSetNewPassword(newPassword: string): Promise<void> {
  if (!newPassword || newPassword.length < 6) {
    throw new Error('La nueva contraseña debe tener al menos 6 caracteres.');
  }
  setStorage('admin_password', newPassword);
}

export async function adminResetPassword(email: string) {
  if (hasValidSupabaseConfig) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}#/admin`,
      });
      if (error) throw new Error('No se pudo enviar el correo de recuperación');
      return;
    } catch (err: unknown) {
      if (err instanceof Error) throw err;
    }
  }
  console.info(`[TalentoCrux] Solicitud de recuperación enviada a: ${email}`);
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
  if (hasValidSupabaseConfig) {
    try {
      const { data, error } = await supabase.rpc('admin_list_all_professionals');
      if (!error && data) return data as AdminProfessional[];
    } catch {
      // fallback
    }
  }
  return getMockProfessionals();
}

export async function adminSetProfessionalEstado(id: string, estado: string, _detail?: string) {
  if (hasValidSupabaseConfig) {
    try {
      const { error } = await supabase.rpc('admin_set_professional_estado', {
        p_id: id, p_estado: estado, p_detail: _detail ?? '',
      });
      if (!error) return;
    } catch {
      // fallback
    }
  }

  const list = getMockProfessionals();
  const idx = list.findIndex((p) => p.id === id);
  if (idx !== -1) {
    list[idx].estado = estado;
    setMockProfessionals(list);
  }
}

export async function adminUpdateProfessional(id: string, updates: Partial<AdminProfessional>) {
  if (hasValidSupabaseConfig) {
    try {
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
      if (!error) return;
    } catch {
      // fallback
    }
  }

  const list = getMockProfessionals();
  const idx = list.findIndex((p) => p.id === id);
  if (idx !== -1) {
    list[idx] = { ...list[idx], ...updates };
    setMockProfessionals(list);
  }
}

export async function adminDeleteProfessional(id: string) {
  if (hasValidSupabaseConfig) {
    try {
      const { error } = await supabase.rpc('admin_delete_professional', { p_id: id });
      if (!error) return;
    } catch {
      // fallback
    }
  }

  const list = getMockProfessionals().filter((p) => p.id !== id);
  setMockProfessionals(list);
}

// ── Admin Courses Operations ──

export async function adminListCourses(): Promise<Course[]> {
  if (hasValidSupabaseConfig) {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*');
      if (!error && data && data.length > 0) {
        return (data as Record<string, unknown>[]).map((r) => ({
          id: String(r.id),
          nombreCurso: String(r.nombre_curso),
          instructor: String(r.instructor),
          whatsapp: String(r.whatsapp),
          email: String(r.email ?? ''),
          descripcion: String(r.descripcion ?? ''),
          duracionHoras: String(r.duracion_horas ?? ''),
          precioARS: Number(r.precio_ars ?? 0),
          clicksContacto: Number(r.clicks_contacto ?? 0),
          estado: String(r.estado ?? 'Activo'),
          rating_avg: Number(r.rating_avg ?? 0),
          review_count: Number(r.review_count ?? 0),
        }));
      }
    } catch {
      // fallback
    }
  }
  return getMockCourses();
}

export async function adminSetCourseEstado(id: string, estado: string) {
  if (hasValidSupabaseConfig) {
    try {
      await supabase.from('courses').update({ estado }).eq('id', id);
      return;
    } catch {
      // fallback
    }
  }
  const list = getMockCourses();
  const idx = list.findIndex((c) => c.id === id);
  if (idx !== -1) {
    list[idx].estado = estado;
    setMockCourses(list);
  }
}

export async function adminUpdateCourse(id: string, updates: Partial<Course>) {
  if (hasValidSupabaseConfig) {
    try {
      await supabase.from('courses').update({
        nombre_curso: updates.nombreCurso,
        instructor: updates.instructor,
        whatsapp: updates.whatsapp,
        email: updates.email,
        descripcion: updates.descripcion,
        duracion_horas: updates.duracionHoras,
        precio_ars: updates.precioARS,
        estado: updates.estado,
      }).eq('id', id);
      return;
    } catch {
      // fallback
    }
  }
  const list = getMockCourses();
  const idx = list.findIndex((c) => c.id === id);
  if (idx !== -1) {
    list[idx] = { ...list[idx], ...updates };
    setMockCourses(list);
  }
}

export async function adminDeleteCourse(id: string) {
  if (hasValidSupabaseConfig) {
    try {
      await supabase.from('courses').delete().eq('id', id);
      return;
    } catch {
      // fallback
    }
  }
  const list = getMockCourses().filter((c) => c.id !== id);
  setMockCourses(list);
}

// ── Admin Ads Operations ──

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
  if (hasValidSupabaseConfig) {
    try {
      const { data, error } = await supabase.rpc('admin_list_all_ads');
      if (!error && data) return data as AdminAd[];
    } catch {
      // fallback
    }
  }
  return getMockAds();
}

export async function adminSetAdEstado(id: string, estado: string, _detail?: string) {
  if (hasValidSupabaseConfig) {
    try {
      const { error } = await supabase.rpc('admin_set_ad_estado', {
        p_id: id, p_estado: estado, p_detail: _detail ?? '',
      });
      if (!error) return;
    } catch {
      // fallback
    }
  }

  const list = getMockAds();
  const idx = list.findIndex((a) => a.id === id);
  if (idx !== -1) {
    list[idx].estado = estado;
    setMockAds(list);
  }
}

export async function adminUpdateAd(id: string, updates: Partial<AdminAd>) {
  if (hasValidSupabaseConfig) {
    try {
      const { error } = await supabase.rpc('admin_update_ad', {
        p_id: id,
        p_titulo: updates.titulo ?? null,
        p_descripcion: updates.descripcion ?? null,
        p_link: updates.link ?? null,
        p_link_video: updates.link_video ?? null,
        p_imagen_path: updates.imagen_path ?? null,
        p_plan_nombre: updates.plan_nombre ?? null,
      });
      if (!error) return;
    } catch {
      // fallback
    }
  }

  const list = getMockAds();
  const idx = list.findIndex((a) => a.id === id);
  if (idx !== -1) {
    list[idx] = { ...list[idx], ...updates };
    setMockAds(list);
  }
}

export async function adminDeleteAd(id: string) {
  if (hasValidSupabaseConfig) {
    try {
      const { error } = await supabase.rpc('admin_delete_ad', { p_id: id });
      if (!error) return;
    } catch {
      // fallback
    }
  }

  const list = getMockAds().filter((a) => a.id !== id);
  setMockAds(list);
}

export interface AdminReview {
  id: string;
  target_type?: 'professional' | 'course';
  professional_id: string;
  professional_name?: string;
  contact_log_id: string;
  client_name?: string;
  rating: number;
  comment: string;
  estado: string;
  rating_code?: string;
  created_at: string;
}

export async function adminListReviews(professionalId?: string): Promise<AdminReview[]> {
  if (hasValidSupabaseConfig) {
    try {
      const { data, error } = await supabase.rpc('admin_list_reviews', {
        p_professional_id: professionalId ?? null,
      });
      if (!error && data) return data as AdminReview[];
    } catch {
      // fallback
    }
  }

  const list = getMockReviews();
  return professionalId
    ? list.filter((r) => r.professional_id === professionalId)
    : list;
}

export async function adminSetReviewEstado(id: string, estado: string, _detail?: string) {
  if (hasValidSupabaseConfig) {
    try {
      const { error } = await supabase.rpc('admin_set_review_estado', {
        p_id: id, p_estado: estado, p_detail: _detail ?? '',
      });
      if (!error) return;
    } catch {
      // fallback
    }
  }

  const list = getMockReviews();
  const idx = list.findIndex((r) => r.id === id);
  if (idx !== -1) {
    list[idx].estado = estado;
    setMockReviews(list);
  }
}

export async function adminDeleteReview(id: string): Promise<void> {
  const list = getMockReviews().filter((r) => r.id !== id);
  setMockReviews(list);
}

export async function adminListContactLogs(professionalId?: string): Promise<ContactLog[]> {
  if (hasValidSupabaseConfig) {
    try {
      const { data, error } = await supabase.rpc('admin_list_contact_logs', {
        p_professional_id: professionalId ?? null,
      });
      if (!error && data && Array.isArray(data)) return data as ContactLog[];
    } catch {
      // fallback
    }
  }

  const logs = getStorage<ContactLog[]>('contact_logs', INITIAL_CONTACT_LOGS);
  return professionalId ? logs.filter((l) => l.professional_id === professionalId) : logs;
}

export async function adminRegenerateContactCode(contactId: string): Promise<string> {
  const contacts = getStorage<ContactLog[]>('contact_logs', INITIAL_CONTACT_LOGS);
  const idx = contacts.findIndex((c) => c.id === contactId);
  if (idx === -1) throw new Error('Contacto no encontrado');
  const newCode = generateRatingCode();
  contacts[idx].rating_code = newCode;
  contacts[idx].code_status = 'activo';
  setStorage('contact_logs', contacts);
  return newCode;
}

export async function adminReactivateContactCode(contactId: string): Promise<void> {
  const contacts = getStorage<ContactLog[]>('contact_logs', INITIAL_CONTACT_LOGS);
  const idx = contacts.findIndex((c) => c.id === contactId);
  if (idx === -1) throw new Error('Contacto no encontrado');
  contacts[idx].code_status = 'activo';
  setStorage('contact_logs', contacts);
}

export async function adminDeleteContactLog(id: string): Promise<void> {
  const logs = getStorage<ContactLog[]>('contact_logs', INITIAL_CONTACT_LOGS).filter((l) => l.id !== id);
  setStorage('contact_logs', logs);
}

// ── Admin Multimedia Removal ──

export type ProfessionalMediaType = 'photo_url' | 'dni_frente_path' | 'dni_dorso_path' | 'foto_matricula_path';

export async function adminDeleteProfessionalMedia(profId: string, mediaType: ProfessionalMediaType): Promise<void> {
  const profs = getMockProfessionals();
  const idx = profs.findIndex((p) => p.id === profId);
  if (idx === -1) throw new Error('Profesional no encontrado');
  profs[idx][mediaType] = '';
  setMockProfessionals(profs);
}

export type AdMediaType = 'imagen_path' | 'link_video';

export async function adminDeleteAdMedia(adId: string, mediaType: AdMediaType): Promise<void> {
  const ads = getMockAds();
  const idx = ads.findIndex((a) => a.id === adId);
  if (idx === -1) throw new Error('Anuncio no encontrado');
  ads[idx][mediaType] = '';
  setMockAds(ads);
}

// ── Private image signed URLs (admin only) ──

export async function getPrivateImageUrl(path: string): Promise<string> {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }
  if (hasValidSupabaseConfig) {
    try {
      const { data, error } = await supabase.storage.from('private-docs').createSignedUrl(path, 300);
      if (!error && data?.signedUrl) return data.signedUrl;
    } catch {
      // fallback
    }
  }
  return path;
}

// ── Admin session check ──

export async function getAdminSession() {
  if (hasValidSupabaseConfig) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data } = await supabase.from('admin_profiles').select('is_admin').eq('user_id', user.id).maybeSingle();
      if (data?.is_admin) return user;
    } catch {
      // fallback
    }
  }
  return getStorage<unknown>('admin_user', null);
}
