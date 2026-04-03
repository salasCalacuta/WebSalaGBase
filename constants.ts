
import { Product, Room, RoomColor, MaintenanceItem, StaffUserConfig } from './types';

export const ROOMS: Room[] = [];

export const INITIAL_INCOME_CATEGORIES = [];

export const INITIAL_EXPENSE_CATEGORIES = [];

export const INITIAL_PRODUCTS: Product[] = [];

export const INITIAL_MAINTENANCE: MaintenanceItem[] = [];

export const INITIAL_STAFF_USERS: StaffUserConfig[] = [];

export const DEFAULT_HEADER_LINKS = [
  { label: 'Instagram', url: 'https://instagram.com/salascalacuta', image: 'https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png' },
  { label: 'Ubicacion', url: 'https://maps.google.com', image: 'https://upload.wikimedia.org/wikipedia/commons/a/aa/Google_Maps_icon_%282020%29.svg' },
  { label: 'Youtube', url: 'https://youtube.com', image: 'https://upload.wikimedia.org/wikipedia/commons/0/09/YouTube_full-color_icon_%282017%29.svg' },
  { label: 'X', url: 'https://x.com', image: 'https://upload.wikimedia.org/wikipedia/commons/5/57/X_logo_2023_%28white%29.png' },
  { label: 'Whatsapp', url: 'https://wa.me/5491112345678', image: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg' }
];

export const DEFAULT_MAIN_PHOTO = 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=1000&auto=format&fit=crop';

export const DEFAULT_POINTS_RULES = [
  { id: 'r1', label: 'Asistencia', description: '3 veces seguidas sin faltas = 3 puntos' },
  { id: 'r2', label: 'Alquiler', description: '1 instrumento por semana = 1 punto' },
  { id: 'r3', label: 'Barra', description: 'Más de 5 items de barra = 2 puntos' }
];

export const DEFAULT_POINTS_REWARDS = [
  { id: 'w1', label: '2 IPA Lager Gratis', points: 25, description: 'Canjeable en barra' },
  { id: 'w2', label: '1 Pizza Gratis', points: 50, description: 'Canjeable en barra' },
  { id: 'w3', label: '10% Off Próxima Reserva', points: 75, description: 'Válido para una sesión' },
  { id: 'w4', label: 'Grabación Gratis', points: 100, description: '1 hora de grabación' }
];
