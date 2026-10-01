export interface Professional {
  id: string;
  name: string;
  profession: string;
  category: CategoryId;
  neighborhood: string;
  rating: number;
  reviews: number;
  schedule: string;
  whatsapp: string;
  photo: string;
  description: string;
  verificado: boolean;
}

export interface Course {
  id: string;
  nombreCurso: string;
  instructor: string;
  whatsapp: string;
  email: string;
  descripcion: string;
  duracionHoras: string | number;
  precioARS: number;
  clicksContacto: number;
}

export interface Ad {
  id: string;
  titulo: string;
  descripcion: string;
  imagenUrl: string;
  link: string;
  linkVideo: string;
  clicksContacto: number;
}

export interface Plan {
  id: string;
  nombre: string;
  precioARS: number;
  descripcion: string;
  duracionDias: number;
}

export type CategoryId =
  | 'hogar'
  | 'tecnologia'
  | 'diseno'
  | 'salud'
  | 'cocina'
  | 'jardineria';

export interface Category {
  id: CategoryId;
  label: string;
  icon: string;
}

export const CATEGORIES: Category[] = [
  { id: 'hogar', label: 'Hogar', icon: 'Wrench' },
  { id: 'tecnologia', label: 'Tecnología', icon: 'Laptop' },
  { id: 'diseno', label: 'Diseño', icon: 'PenTool' },
  { id: 'salud', label: 'Salud', icon: 'HeartPulse' },
  { id: 'cocina', label: 'Cocina', icon: 'ChefHat' },
  { id: 'jardineria', label: 'Jardinería', icon: 'Trees' },
];

export const NEIGHBORHOODS: string[] = [
  'Todos los barrios',
  'Agronomía',
  'Almagro',
  'Balvanera',
  'Barracas',
  'Belgrano',
  'Boedo',
  'Caballito',
  'Chacarita',
  'Coghlan',
  'Colegiales',
  'Constitución',
  'Flores',
  'Floresta',
  'La Boca',
  'Liniers',
  'Mataderos',
  'Montserrat',
  'Núñez',
  'Palermo',
  'Parque Avellaneda',
  'Parque Chacabuco',
  'Parque Patricios',
  'Puerto Madero',
  'Recoleta',
  'Retiro',
  'Saavedra',
  'San Cristóbal',
  'San Nicolás',
  'San Telmo',
  'Velez Sarsfield',
  'Versalles',
  'Villa Crespo',
  'Villa del Parque',
  'Villa Urquiza',
  'Villa Devoto',
];
