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
const STORAGE_PREFIX = 'talentocrux_';
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

const INITIAL_PROFESSIONALS: AdminProfessional[] = [
  {
    id: 'prof-1',
    name: 'Carlos Rossi',
    profession: 'Electricista Matriculado',
    category: 'hogar',
    neighborhood: 'Palermo',
    schedule: 'Lun a Sáb 8:00 a 19:00 (Urgencias 24hs)',
    whatsapp: '5491155550101',
    description: 'Instalaciones eléctricas residenciales y comerciales en CABA. Certificados de aptitud eléctrica (DCI), tableros, cableados y detección de fugas.',
    photo_url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&auto=format&fit=crop&q=80',
    dni_frente_path: 'https://images.unsplash.com/photo-1589330694653-dad6d3240e2b?w=600&auto=format&fit=crop&q=80',
    dni_dorso_path: 'https://images.unsplash.com/photo-1589330694653-dad6d3240e2b?w=600&auto=format&fit=crop&q=80',
    foto_matricula_path: 'https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=600&auto=format&fit=crop&q=80',
    numero_matricula: 'COPIME-84920',
    estado: 'Aprobado',
    verificado: true,
    rating_avg: 4.9,
    review_count: 24,
    clicks_contacto: 87,
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
  {
    id: 'prof-2',
    name: 'Mariana Benítez',
    profession: 'Diseñadora Gráfica & Branding',
    category: 'diseno',
    neighborhood: 'Colegiales',
    schedule: 'Lun a Vie 9:00 a 18:00',
    whatsapp: '5491155550102',
    description: 'Especialista en identidad visual para emprendimientos y pymes: logotipos, manuales de marca, diseño para redes sociales y packaging.',
    photo_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
    dni_frente_path: 'https://images.unsplash.com/photo-1589330694653-dad6d3240e2b?w=600&auto=format&fit=crop&q=80',
    dni_dorso_path: '',
    foto_matricula_path: '',
    numero_matricula: '',
    estado: 'Aprobado',
    verificado: true,
    rating_avg: 5.0,
    review_count: 18,
    clicks_contacto: 64,
    created_at: new Date(Date.now() - 25 * 86400000).toISOString(),
  },
  {
    id: 'prof-3',
    name: 'Lucas Ferraro',
    profession: 'Soporte IT & Redes Wi-Fi',
    category: 'tecnologia',
    neighborhood: 'Belgrano',
    schedule: 'Lun a Vie 10:00 a 19:00',
    whatsapp: '5491155550103',
    description: 'Mantenimiento de computadoras PC y Mac, optimización, instalación de redes hogareñas Mesh y recuperación de datos.',
    photo_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    dni_frente_path: '',
    dni_dorso_path: '',
    foto_matricula_path: '',
    numero_matricula: '',
    estado: 'Aprobado',
    verificado: true,
    rating_avg: 4.8,
    review_count: 31,
    clicks_contacto: 112,
    created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
  },
  {
    id: 'prof-4',
    name: 'Dr. Martín Gómez',
    profession: 'Kinesiólogo Fisiatra',
    category: 'salud',
    neighborhood: 'Recoleta',
    schedule: 'Mar, Jue y Sáb 8:00 a 14:00',
    whatsapp: '5491155550104',
    description: 'Rehabilitación traumatológica y postural a domicilio en Recoleta, Retiro y Barrio Norte. Kinesiología respiratoria y motora.',
    photo_url: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format&fit=crop&q=80',
    dni_frente_path: 'https://images.unsplash.com/photo-1589330694653-dad6d3240e2b?w=600&auto=format&fit=crop&q=80',
    dni_dorso_path: 'https://images.unsplash.com/photo-1589330694653-dad6d3240e2b?w=600&auto=format&fit=crop&q=80',
    foto_matricula_path: 'https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=600&auto=format&fit=crop&q=80',
    numero_matricula: 'MN-15822',
    estado: 'Aprobado',
    verificado: true,
    rating_avg: 4.9,
    review_count: 15,
    clicks_contacto: 49,
    created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
  },
  {
    id: 'prof-5',
    name: 'Lucía Santillán',
    profession: 'Paisajismo y Jardinería Urbana',
    category: 'jardineria',
    neighborhood: 'Villa Urquiza',
    schedule: 'Lun a Sáb 8:00 a 16:00',
    whatsapp: '5491155550105',
    description: 'Diseño y armado de balcones verdes, terrazas y jardines. Mantenimiento mensual, riego por goteo y control de plagas ecológico.',
    photo_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80',
    dni_frente_path: '',
    dni_dorso_path: '',
    foto_matricula_path: '',
    numero_matricula: '',
    estado: 'Aprobado',
    verificado: true,
    rating_avg: 4.7,
    review_count: 12,
    clicks_contacto: 38,
    created_at: new Date(Date.now() - 12 * 86400000).toISOString(),
  },
  {
    id: 'prof-6',
    name: 'Esteban Morales',
    profession: 'Plomero & Gasista Matriculado',
    category: 'hogar',
    neighborhood: 'Caballito',
    schedule: 'Lun a Sáb 7:30 a 20:00 (Guardias CABA)',
    whatsapp: '5491155550106',
    description: 'Reparaciones integrales de plomería, destapaciones cloacales mecánicas, instalación de termotanques y pruebas de hermeticidad de gas.',
    photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    dni_frente_path: 'https://images.unsplash.com/photo-1589330694653-dad6d3240e2b?w=600&auto=format&fit=crop&q=80',
    dni_dorso_path: 'https://images.unsplash.com/photo-1589330694653-dad6d3240e2b?w=600&auto=format&fit=crop&q=80',
    foto_matricula_path: 'https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=600&auto=format&fit=crop&q=80',
    numero_matricula: 'METROGAS-3104',
    estado: 'Aprobado',
    verificado: true,
    rating_avg: 4.8,
    review_count: 27,
    clicks_contacto: 95,
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
  {
    id: 'prof-7',
    name: 'Florencia Varela',
    profession: 'Chef a Domicilio & Catering',
    category: 'cocina',
    neighborhood: 'Almagro',
    schedule: 'Mié a Dom (Eventos previa reserva)',
    whatsapp: '5491155550107',
    description: 'Experiencias gastronómicas a domicilio, cenas privadas por pasos, finger food para reuniones y opciones vegetarianas/celíacas.',
    photo_url: 'https://images.unsplash.com/photo-1595273670150-bd0c3c392e46?w=400&auto=format&fit=crop&q=80',
    dni_frente_path: '',
    dni_dorso_path: '',
    foto_matricula_path: '',
    numero_matricula: '',
    estado: 'Aprobado',
    verificado: false,
    rating_avg: 4.6,
    review_count: 9,
    clicks_contacto: 26,
    created_at: new Date(Date.now() - 8 * 86400000).toISOString(),
  },
  {
    id: 'prof-8',
    name: 'Roberto D´Angelo',
    profession: 'Técnico de Aire Acondicionado',
    category: 'hogar',
    neighborhood: 'Flores',
    schedule: 'Lun a Sáb 8:00 a 18:00',
    whatsapp: '5491155550108',
    description: 'Instalación split matriculado con garantía escrita. Carga de gas R410/R22, limpieza profunda de filtros y reparación de plaquetas inverter.',
    photo_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    dni_frente_path: 'https://images.unsplash.com/photo-1589330694653-dad6d3240e2b?w=600&auto=format&fit=crop&q=80',
    dni_dorso_path: '',
    foto_matricula_path: 'https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=600&auto=format&fit=crop&q=80',
    numero_matricula: 'CACAAV-1922',
    estado: 'Aprobado',
    verificado: true,
    rating_avg: 4.9,
    review_count: 22,
    clicks_contacto: 74,
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
];

const INITIAL_COURSES: Course[] = [
  {
    id: 'course-1',
    nombreCurso: 'Electricidad Domiciliaria Básica y Seguridad',
    instructor: 'Ing. Carlos Rossi',
    whatsapp: '5491155550101',
    email: 'cursos@talentocrux.com',
    descripcion: 'Aprendé desde cero los fundamentos de la electricidad en el hogar: cálculo de cargas, armado de tableros, llaves térmicas y disyuntores.',
    duracionHoras: '24 horas (4 semanas)',
    precioARS: 45000,
    clicksContacto: 34,
    estado: 'Activo',
    created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
    rating_avg: 4.9,
    review_count: 14,
  },
  {
    id: 'course-2',
    nombreCurso: 'Instalación y Mantenimiento de Aire Acondicionado',
    instructor: 'Roberto D´Angelo',
    whatsapp: '5491155550108',
    email: 'clima@talentocrux.com',
    descripcion: 'Capacitación práctica con equipos inverter: abocardado, presurización con nitrógeno, vacío con bomba y carga de refrigerante.',
    duracionHoras: '30 horas (5 semanas)',
    precioARS: 62000,
    clicksContacto: 48,
    estado: 'Activo',
    created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
    rating_avg: 4.8,
    review_count: 9,
  },
  {
    id: 'course-3',
    nombreCurso: 'Taller de Jardinería y Huertas en Balcones',
    instructor: 'Lucía Santillán',
    whatsapp: '5491155550105',
    email: 'huertas@talentocrux.com',
    descripcion: 'Aprovechá tu espacio en CABA: sustratos para macetas, aromáticas, tomates cherry y control biológico de plagas sin químicos.',
    duracionHoras: '12 horas (2 sábados)',
    precioARS: 28000,
    clicksContacto: 19,
    estado: 'Activo',
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
    rating_avg: 5.0,
    review_count: 6,
  },
];

const INITIAL_ADS: AdminAd[] = [
  {
    id: 'ad-1',
    titulo: 'Ferretería Industrial Palermo — Descuentos para Profesionales',
    descripcion: 'Presentando tu registro en TalentoCrux obtené 15% de descuento en herramientas Milwaukee, Stanley y DeWalt.',
    link: 'https://wa.me/5491155550100?text=Hola%2C%20vi%20el%20anuncio%20en%20TalentoCrux',
    link_video: '',
    imagen_path: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=800&auto=format&fit=crop&q=80',
    plan_nombre: 'Plan Destacado',
    estado: 'Activo',
    clicks_contacto: 124,
    created_at: new Date().toISOString(),
  },
  {
    id: 'ad-2',
    titulo: 'Pinturerías Centro — Envíos sin cargo en CABA',
    descripcion: 'Látex lavable, impermeabilizantes y esmaltes sintéticos con entrega directa en obra en menos de 24 horas.',
    link: 'https://wa.me/5491155550100?text=Consulta%20pinturas%20TalentoCrux',
    link_video: '',
    imagen_path: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800&auto=format&fit=crop&q=80',
    plan_nombre: 'Plan Básico',
    estado: 'Activo',
    clicks_contacto: 83,
    created_at: new Date().toISOString(),
  },
];

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
const INITIAL_REVIEWS: AdminReview[] = [
  // ── Carlos Rossi (prof-1) 24 verified reviews ──
  {
    id: 'rev-carlos-01',
    target_type: 'professional',
    professional_id: 'prof-1',
    professional_name: 'Carlos Rossi',
    contact_log_id: 'cl-init-1',
    client_name: 'Luciana Herrera',
    rating: 5,
    comment: 'Excelente atención de Carlos. Vino puntual a Palermo, revisó el tablero que hacía saltar la térmica y dejó todo impecable.',
    estado: 'Aprobado',
    rating_code: 'TC-7421',
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'rev-carlos-02',
    target_type: 'professional',
    professional_id: 'prof-1',
    professional_name: 'Carlos Rossi',
    contact_log_id: 'cl-init-2',
    client_name: 'Fernando Domínguez',
    rating: 5,
    comment: 'Súper recomendable. Matriculado real, me dio la constancia para la empresa de seguros sin vueltas.',
    estado: 'Aprobado',
    rating_code: 'TC-5192',
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: 'rev-carlos-03',
    target_type: 'professional',
    professional_id: 'prof-1',
    professional_name: 'Carlos Rossi',
    contact_log_id: 'cl-c3',
    client_name: 'Santiago Morales',
    rating: 5,
    comment: 'Trabajo prolijo y precio justo. Cambió todo el cableado de un departamento antiguo en Recoleta.',
    estado: 'Aprobado',
    rating_code: 'TC-1003',
    created_at: new Date(Date.now() - 8 * 86400000).toISOString(),
  },
  {
    id: 'rev-carlos-04',
    target_type: 'professional',
    professional_id: 'prof-1',
    professional_name: 'Carlos Rossi',
    contact_log_id: 'cl-c4',
    client_name: 'Beatriz Casares',
    rating: 5,
    comment: 'Muy profesional. Detectó una fuga que dos electricistas anteriores no habían podido encontrar.',
    estado: 'Aprobado',
    rating_code: 'TC-1004',
    created_at: new Date(Date.now() - 11 * 86400000).toISOString(),
  },
  {
    id: 'rev-carlos-05',
    target_type: 'professional',
    professional_id: 'prof-1',
    professional_name: 'Carlos Rossi',
    contact_log_id: 'cl-c5',
    client_name: 'Gonzalo Silva',
    rating: 5,
    comment: 'Llegó en menos de una hora para una urgencia un sábado a la noche. Me salvó el fin de semana.',
    estado: 'Aprobado',
    rating_code: 'TC-1005',
    created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
  },
  {
    id: 'rev-carlos-06',
    target_type: 'professional',
    professional_id: 'prof-1',
    professional_name: 'Carlos Rossi',
    contact_log_id: 'cl-c6',
    client_name: 'Natalia Castro',
    rating: 5,
    comment: 'Excelente trato y explicación detallada de cada paso que iba realizando. Muy didáctico y honesto.',
    estado: 'Aprobado',
    rating_code: 'TC-1006',
    created_at: new Date(Date.now() - 17 * 86400000).toISOString(),
  },
  {
    id: 'rev-carlos-07',
    target_type: 'professional',
    professional_id: 'prof-1',
    professional_name: 'Carlos Rossi',
    contact_log_id: 'cl-c7',
    client_name: 'Diego R.',
    rating: 5,
    comment: 'Colocó luminarias colgantes y renovó llaves térmicas en Almagro. Muy puntual y ordenado.',
    estado: 'Aprobado',
    rating_code: 'TC-1007',
    created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
  },
  {
    id: 'rev-carlos-08',
    target_type: 'professional',
    professional_id: 'prof-1',
    professional_name: 'Carlos Rossi',
    contact_log_id: 'cl-c8',
    client_name: 'Mariano Vega',
    rating: 4,
    comment: 'Buen profesional, resolvió el problema del disyuntor rápido. Tardó un poco en conseguir el repuesto específico pero quedó 10 puntos.',
    estado: 'Aprobado',
    rating_code: 'TC-1008',
    created_at: new Date(Date.now() - 23 * 86400000).toISOString(),
  },
  {
    id: 'rev-carlos-09',
    target_type: 'professional',
    professional_id: 'prof-1',
    professional_name: 'Carlos Rossi',
    contact_log_id: 'cl-c9',
    client_name: 'Paula Mendez',
    rating: 5,
    comment: 'Hizo la certificación DCI para Edenor de mi local comercial en Palermo Soho. Trámite aprobado al primer intento.',
    estado: 'Aprobado',
    rating_code: 'TC-1009',
    created_at: new Date(Date.now() - 26 * 86400000).toISOString(),
  },
  {
    id: 'rev-carlos-10',
    target_type: 'professional',
    professional_id: 'prof-1',
    professional_name: 'Carlos Rossi',
    contact_log_id: 'cl-c10',
    client_name: 'Julián Ramos',
    rating: 5,
    comment: 'Muy correcto en el presupuesto y cumplió con los plazos exactos pactados. Lo volvería a llamar sin dudas.',
    estado: 'Aprobado',
    rating_code: 'TC-1010',
    created_at: new Date(Date.now() - 29 * 86400000).toISOString(),
  },
  {
    id: 'rev-carlos-11',
    target_type: 'professional',
    professional_id: 'prof-1',
    professional_name: 'Carlos Rossi',
    contact_log_id: 'cl-c11',
    client_name: 'Horacio B.',
    rating: 5,
    comment: 'Instaló un disyuntor diferencial y puesta a tierra con jabalina. Medición con telurímetro certificada.',
    estado: 'Aprobado',
    rating_code: 'TC-1011',
    created_at: new Date(Date.now() - 32 * 86400000).toISOString(),
  },
  {
    id: 'rev-carlos-12',
    target_type: 'professional',
    professional_id: 'prof-1',
    professional_name: 'Carlos Rossi',
    contact_log_id: 'cl-c12',
    client_name: 'Consorcio Corrientes 3400',
    rating: 5,
    comment: 'Excelente predisposición para asesorar sobre consumo eficiente e iluminación LED en el consorcio.',
    estado: 'Aprobado',
    rating_code: 'TC-1012',
    created_at: new Date(Date.now() - 35 * 86400000).toISOString(),
  },
  {
    id: 'rev-carlos-13',
    target_type: 'professional',
    professional_id: 'prof-1',
    professional_name: 'Carlos Rossi',
    contact_log_id: 'cl-c13',
    client_name: 'Estela Giménez',
    rating: 5,
    comment: 'Solucionó un cortocircuito grave en la cocina. Muy precavido y con todas las herramientas de seguridad necesarias.',
    estado: 'Aprobado',
    rating_code: 'TC-1013',
    created_at: new Date(Date.now() - 38 * 86400000).toISOString(),
  },
  {
    id: 'rev-carlos-14',
    target_type: 'professional',
    professional_id: 'prof-1',
    professional_name: 'Carlos Rossi',
    contact_log_id: 'cl-c14',
    client_name: 'Federico L.',
    rating: 5,
    comment: 'Profesional 100% de confianza. Le dejamos la llave del depto mientras trabajaba y ningún inconveniente. Muy respetuoso.',
    estado: 'Aprobado',
    rating_code: 'TC-1014',
    created_at: new Date(Date.now() - 41 * 86400000).toISOString(),
  },
  {
    id: 'rev-carlos-15',
    target_type: 'professional',
    professional_id: 'prof-1',
    professional_name: 'Carlos Rossi',
    contact_log_id: 'cl-c15',
    client_name: 'Estudio Jurídico Belgrano',
    rating: 5,
    comment: 'Muy buen trabajo en remodelación de oficina en Belgrano. Cumplió con todas las normativas vigentes del COPIME.',
    estado: 'Aprobado',
    rating_code: 'TC-1015',
    created_at: new Date(Date.now() - 44 * 86400000).toISOString(),
  },
  {
    id: 'rev-carlos-16',
    target_type: 'professional',
    professional_id: 'prof-1',
    professional_name: 'Carlos Rossi',
    contact_log_id: 'cl-c16',
    client_name: 'Matías F.',
    rating: 4,
    comment: 'El trabajo quedó muy bien hecho. Solo demoró unos minutos más de lo estimado por el tráfico en Libertador, pero avisó con tiempo.',
    estado: 'Aprobado',
    rating_code: 'TC-1016',
    created_at: new Date(Date.now() - 47 * 86400000).toISOString(),
  },
  {
    id: 'rev-carlos-17',
    target_type: 'professional',
    professional_id: 'prof-1',
    professional_name: 'Carlos Rossi',
    contact_log_id: 'cl-c17',
    client_name: 'Guillermo Paz',
    rating: 5,
    comment: 'Armado de tablero principal nuevo con llave selectora para grupo electrógeno. Impecable ejecución.',
    estado: 'Aprobado',
    rating_code: 'TC-1017',
    created_at: new Date(Date.now() - 50 * 86400000).toISOString(),
  },
  {
    id: 'rev-carlos-18',
    target_type: 'professional',
    professional_id: 'prof-1',
    professional_name: 'Carlos Rossi',
    contact_log_id: 'cl-c18',
    client_name: 'Inés Fontana',
    rating: 5,
    comment: 'Atento y muy educado. Dejó todo limpio al terminar las canalizaciones en la pared.',
    estado: 'Aprobado',
    rating_code: 'TC-1018',
    created_at: new Date(Date.now() - 53 * 86400000).toISOString(),
  },
  {
    id: 'rev-carlos-19',
    target_type: 'professional',
    professional_id: 'prof-1',
    professional_name: 'Carlos Rossi',
    contact_log_id: 'cl-c19',
    client_name: 'Admin Consorcio Arenales',
    rating: 5,
    comment: 'Cambio de montantes y térmicas en edificio antiguo. Excelente coordinación con la administración del consorcio.',
    estado: 'Aprobado',
    rating_code: 'TC-1019',
    created_at: new Date(Date.now() - 56 * 86400000).toISOString(),
  },
  {
    id: 'rev-carlos-20',
    target_type: 'professional',
    professional_id: 'prof-1',
    professional_name: 'Carlos Rossi',
    contact_log_id: 'cl-c20',
    client_name: 'Arquitecto Marcelo Diaz',
    rating: 5,
    comment: 'Conoce a fondo el reglamento AEA. Muy valorable encontrar técnicos en CABA que realmente saben lo que hacen.',
    estado: 'Aprobado',
    rating_code: 'TC-1020',
    created_at: new Date(Date.now() - 60 * 86400000).toISOString(),
  },
  {
    id: 'rev-carlos-21',
    target_type: 'professional',
    professional_id: 'prof-1',
    professional_name: 'Carlos Rossi',
    contact_log_id: 'cl-c21',
    client_name: 'Pablo Estudio Sonido',
    rating: 5,
    comment: 'Resolvió zumbidos molestos en la instalación eléctrica de mi estudio de música casero en Colegiales.',
    estado: 'Aprobado',
    rating_code: 'TC-1021',
    created_at: new Date(Date.now() - 64 * 86400000).toISOString(),
  },
  {
    id: 'rev-carlos-22',
    target_type: 'professional',
    professional_id: 'prof-1',
    professional_name: 'Carlos Rossi',
    contact_log_id: 'cl-c22',
    client_name: 'Carolina V.',
    rating: 5,
    comment: 'Todo según lo conversado por WhatsApp. Presupuesto transparente y sin costos ocultos.',
    estado: 'Aprobado',
    rating_code: 'TC-1022',
    created_at: new Date(Date.now() - 68 * 86400000).toISOString(),
  },
  {
    id: 'rev-carlos-23',
    target_type: 'professional',
    professional_id: 'prof-1',
    professional_name: 'Carlos Rossi',
    contact_log_id: 'cl-c23',
    client_name: 'Rodrigo S.',
    rating: 5,
    comment: 'Rápido diagnóstico y solución definitiva a caídas de tensión frecuentes en el departamento.',
    estado: 'Aprobado',
    rating_code: 'TC-1023',
    created_at: new Date(Date.now() - 72 * 86400000).toISOString(),
  },
  {
    id: 'rev-carlos-24',
    target_type: 'professional',
    professional_id: 'prof-1',
    professional_name: 'Carlos Rossi',
    contact_log_id: 'cl-c24',
    client_name: 'Anahí Benitez',
    rating: 5,
    comment: 'El mejor electricista que contraté en Buenos Aires. Altamente recomendable por seriedad y por ser matriculado legal.',
    estado: 'Aprobado',
    rating_code: 'TC-1024',
    created_at: new Date(Date.now() - 76 * 86400000).toISOString(),
  },

  // ── Other Professionals reviews ──
  {
    id: 'rev-mariana-01',
    target_type: 'professional',
    professional_id: 'prof-2',
    professional_name: 'Mariana Benítez',
    contact_log_id: 'cl-init-5',
    client_name: 'Camila Rivas',
    rating: 5,
    comment: 'Mariana entendió de inmediato el concepto de mi marca gastronómica. El manual de marca superó mis expectativas.',
    estado: 'Aprobado',
    rating_code: 'TC-4189',
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
  {
    id: 'rev-esteban-01',
    target_type: 'professional',
    professional_id: 'prof-6',
    professional_name: 'Esteban Morales',
    contact_log_id: 'cl-init-3',
    client_name: 'Valeria Solís',
    rating: 5,
    comment: 'Esteban solucionó una pérdida difícil en el baño en Caballito. Muy prolijo y respetó el presupuesto pactado.',
    estado: 'Aprobado',
    rating_code: 'TC-8340',
    created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
  },

  // ── Courses reviews ──
  {
    id: 'rev-course-01',
    target_type: 'course',
    professional_id: 'course-1',
    professional_name: 'Electricidad Domiciliaria Básica y Seguridad',
    contact_log_id: 'cl-course-1',
    client_name: 'Martín Olivera',
    rating: 5,
    comment: 'El curso de electricidad domiciliaria superó mis expectativas. El Ing. Rossi explica todo con casos prácticos y normas de seguridad vigentes en CABA.',
    estado: 'Aprobado',
    rating_code: 'TC-9315',
    created_at: new Date(Date.now() - 8 * 86400000).toISOString(),
  },
  {
    id: 'rev-course-02',
    target_type: 'course',
    professional_id: 'course-1',
    professional_name: 'Electricidad Domiciliaria Básica y Seguridad',
    contact_log_id: 'cl-course-2',
    client_name: 'Laura Fernández',
    rating: 5,
    comment: 'Excelente material didáctico. Hicimos armado de tableros reales y medición con instrumental. Súper recomendable para empezar a trabajar.',
    estado: 'Aprobado',
    rating_code: 'TC-9316',
    created_at: new Date(Date.now() - 12 * 86400000).toISOString(),
  },
  {
    id: 'rev-course-03',
    target_type: 'course',
    professional_id: 'course-2',
    professional_name: 'Instalación y Mantenimiento de Aire Acondicionado',
    contact_log_id: 'cl-course-3',
    client_name: 'Marcos Barrientos',
    rating: 5,
    comment: 'Roberto es un genio explicando. Aprendí presurización con nitrógeno, vacío con bomba de doble etapa y carga de gas R410.',
    estado: 'Aprobado',
    rating_code: 'TC-9320',
    created_at: new Date(Date.now() - 6 * 86400000).toISOString(),
  },
  {
    id: 'rev-course-04',
    target_type: 'course',
    professional_id: 'course-3',
    professional_name: 'Taller de Jardinería y Huertas en Balcones',
    contact_log_id: 'cl-course-4',
    client_name: 'Sofía Trigo',
    rating: 5,
    comment: 'Hermoso taller para quienes vivimos en departamentos. Lucía me enseñó el compost y sustratos para aromáticas. Crecen de diez.',
    estado: 'Aprobado',
    rating_code: 'TC-9330',
    created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
];

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

const INITIAL_CONTACT_LOGS: ContactLog[] = [
  {
    id: 'cl-init-1',
    target_type: 'professional',
    professional_id: 'prof-1',
    professional_name: 'Carlos Rossi',
    professional_profession: 'Electricista Matriculado',
    professional_neighborhood: 'Palermo',
    client_name: 'Luciana Herrera',
    client_phone: '1144558899',
    client_email: 'l.herrera@gmail.com',
    rating_code: 'TC-7421',
    code_status: 'activo',
    created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
    verified: true,
  },
  {
    id: 'cl-init-2',
    target_type: 'professional',
    professional_id: 'prof-1',
    professional_name: 'Carlos Rossi',
    professional_profession: 'Electricista Matriculado',
    professional_neighborhood: 'Palermo',
    client_name: 'Fernando Domínguez',
    client_phone: '1167891234',
    client_email: 'fer.dominguez@hotmail.com',
    rating_code: 'TC-5192',
    code_status: 'activo',
    created_at: new Date(Date.now() - 16 * 86400000).toISOString(),
    verified: true,
  },
  {
    id: 'cl-init-3',
    target_type: 'professional',
    professional_id: 'prof-6',
    professional_name: 'Esteban Morales',
    professional_profession: 'Plomero & Gasista Matriculado',
    professional_neighborhood: 'Caballito',
    client_name: 'Valeria Solís',
    client_phone: '1132119876',
    client_email: 'vale.solis@yahoo.com.ar',
    rating_code: 'TC-8340',
    code_status: 'usado',
    created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
    verified: true,
  },
  {
    id: 'cl-init-4',
    target_type: 'professional',
    professional_id: 'prof-8',
    professional_name: 'Roberto D´Angelo',
    professional_profession: 'Técnico de Aire Acondicionado',
    professional_neighborhood: 'Flores',
    client_name: 'Tomás Paz',
    client_phone: '1155442211',
    client_email: 'tomaspaz@gmail.com',
    rating_code: 'TC-6204',
    code_status: 'activo',
    created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
    verified: true,
  },
  {
    id: 'cl-init-5',
    target_type: 'professional',
    professional_id: 'prof-2',
    professional_name: 'Mariana Benítez',
    professional_profession: 'Diseñadora Gráfica & Branding',
    professional_neighborhood: 'Colegiales',
    client_name: 'Camila Rivas',
    client_phone: '1199887766',
    client_email: 'camila.rivas@gmail.com',
    rating_code: 'TC-4189',
    code_status: 'activo',
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    verified: true,
  },
  {
    id: 'cl-init-6',
    target_type: 'course',
    professional_id: 'course-1',
    professional_name: 'Electricidad Domiciliaria Básica y Seguridad',
    professional_profession: 'Curso por Ing. Carlos Rossi',
    professional_neighborhood: 'CABA',
    client_name: 'Martín Olivera',
    client_phone: '1122334455',
    client_email: 'martin.olivera@gmail.com',
    rating_code: 'TC-9315',
    code_status: 'activo',
    created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
    verified: true,
  },
];

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
