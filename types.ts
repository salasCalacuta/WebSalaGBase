
export enum UserRole {
  ADMIN = 'ADMIN',
  STAFF = 'STAFF',
  CLIENT = 'CLIENT',
  RESERVAS = 'RESERVAS',
  EVENTOS = 'EVENTOS',
  CONTACTOS = 'CONTACTOS'
}

export interface StaffUserConfig {
  name: string;
  password?: string;
  permissions?: string[]; // IDs of views they can see
}

export interface GlobalConfig {
  id: string;
  initialCash: number;
  staffUsers: StaffUserConfig[]; // Changed from string[]
  incomeCategories: string[];
  expenseCategories: string[];
  headerLinks: { label: string; url: string; image?: string }[]; // Added image
  mainPhoto?: string;
}

export interface User {
  username: string;
  role: UserRole;
  bandName?: string;
  email?: string;
  phone?: string;
  password?: string;
  responsibleName?: string;
}

export enum RoomColor {
  BLUE = 'blue',
  GREEN = 'green',
  VIOLET = 'violet',
  RED = 'red'
}

export interface RoomEquipment {
  battery: string;
  guitarAmp1: string;
  guitarAmp2: string;
  bassAmp: string;
  console: string;
  piano: string;
}

export interface Room {
  id: string;
  name: string;
  color: RoomColor; // 'blue' | 'green' | 'violet' | 'red'
  hex: string;
  price: number;
  image?: string;
  images?: string[];
  equipment?: RoomEquipment;
  calendarId?: string; // New field for Google Calendar sync
}

export interface Reservation {
  id: string;
  clientName: string;
  bandName: string;
  date: string; // YYYY-MM-DD
  timeStart: string;
  timeEnd: string;
  roomId: string;
  status: 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'COMPLETED';
  totalAmount: number;
  isAbono?: boolean; // New field for fixed bands
  instruments?: string[];
  recordingHours?: number;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  cost: number;
  stock: number;
  category: 'BAR' | 'INSTRUMENT' | 'PROMO' | 'VITRINA';
}

export interface Consumption {
  id: string;
  reservationId: string;
  items: { productId: string; quantity: number; name: string; price: number }[];
  total: number;
  paid: boolean;
  paymentMethod?: 'CASH' | 'MERCADOPAGO' | 'DEBT';
}

export interface MaintenanceItem {
  id: string;
  name: string;
  roomId: string;
  status: 'OK' | 'REPAIR';
  // Repair details
  repairDate?: string;     // Date sent to repair
  reason?: string;         // Motivo
  budget?: number;         // Estimated cost (Importe)
  estimatedTime?: string;  // Tiempo estimado
  returnDate?: string;     // Date returned (Retiro)
  actualCost?: number;     // Final cost
  isPaid?: boolean;        // Has the repair been paid?
}

export interface Transaction {
  id: string;
  type: 'INCOME' | 'EXPENSE';
  category: string; // 'LUZ', 'ALQUILER', 'SALA', 'BARRA', etc.
  amount: number;
  date: string;
  description: string;
  isPaid: boolean; // For tracking pending payments/collections
  paymentMethod?: 'CASH' | 'MERCADOPAGO' | 'DEBT' | 'CARD'; // New field
}

export interface StaffShift {
  id: string;
  staffName: string;
  dayOfWeek: string; // 'Lunes', 'Martes', etc.
  timeStart: string;
  timeEnd: string;
}

export interface StaffMember {
  id: string;
  name: string;
  active: boolean;
}

export interface PointEntry {
  amount: number;
  date: string;
  reason: string;
}

export interface PendingTask {
  id: string;
  date: string;
  details: string;
  completed: boolean;
  username?: string; // Added to make tasks independent per user
}

export interface Contact {
  id: string;
  name: string;
  bandName: string;
  phone: string;
  email: string;
  style: string;
  musiciansCount: number;
  habitualRoom: string;
  cancellationRate: number; // Percentage
  attendanceRate: number; // Percentage
  isAbono?: boolean; // New field
  instagram?: string; // New
  bandRole?: string; // New
  debt?: number; // New field
  isBlocked?: boolean; // New field
  points?: number;
  responsibleName?: string;
  password?: string;
  pointsHistory?: PointEntry[];
  instruments?: string[];
  recordingHours?: number;
}
