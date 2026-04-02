
import { Product, Room, RoomColor, MaintenanceItem, StaffUserConfig } from './types';

export const ROOMS: Room[] = [
  { 
    id: 'sala1', 
    name: 'Sala 1', 
    color: RoomColor.BLUE, 
    hex: '#1e3a8a', 
    price: 11000,
    equipment: {
      battery: 'Sonor SmartForce 505',
      guitarAmp1: 'Fender HotRodeDeluxe',
      guitarAmp2: 'Peavey Windsor Valv',
      bassAmp: 'Hartke HA2500',
      console: 'Eden TN226',
      piano: 'Piano R. Weimar'
    }
  },
  { 
    id: 'sala2', 
    name: 'Sala 2', 
    color: RoomColor.GREEN, 
    hex: '#14532d', 
    price: 10000,
    equipment: {
      battery: 'Gresch Renegade',
      guitarAmp1: 'Fender Frontman 212',
      guitarAmp2: 'Fender Champion 100',
      bassAmp: 'Gallien Kruger mb200',
      console: 'Yamaha MG16',
      piano: ''
    }
  },
  { 
    id: 'salaA', 
    name: 'Sala A (4x8m)', 
    color: RoomColor.VIOLET, 
    hex: '#581c87', 
    price: 12000,
    equipment: {
      battery: 'SolidDrums Nativa',
      guitarAmp1: 'Fender Frontman 212',
      guitarAmp2: 'Roland Jazz Chorus 40',
      bassAmp: 'Fender FM80',
      console: 'X-Air 16 ch',
      piano: 'Piano Vertical Ronisch'
    }
  },
  { 
    id: 'sala3', 
    name: 'Sala 3', 
    color: RoomColor.RED, 
    hex: '#991b1b', 
    price: 10000,
    equipment: {
      battery: 'Tama Swingstar',
      guitarAmp1: 'Marshall Valvestate 8080',
      guitarAmp2: 'Fender Champion 100',
      bassAmp: 'Fender BXR 100',
      console: 'Beringher Xenyx 1204',
      piano: ''
    }
  },
];

export const INITIAL_INCOME_CATEGORIES = [
  'Estudio Nacho', 
  'Colo', 
  'Taller Arriba', 
  'Entrepiso Barra (Nerds)', 
  'Varios'
];

export const INITIAL_EXPENSE_CATEGORIES = [
  'Impuestos',
  'Compras Barra', 
  'Personal', 
  'Mantenimiento',
  'retiro en efectivo',
  'Juliana',
  'Inversiones',
  'Internet',
  'Monotributo',
  'Prestamo',
  'Ajuste',
  'Varios'
];

export const INITIAL_PRODUCTS: Product[] = [
  // Drinks
  { id: 'p1', name: 'Coca 600', price: 1500, cost: 800, stock: 20, category: 'BAR' },
  { id: 'p2', name: 'Sprite 600', price: 1500, cost: 800, stock: 20, category: 'BAR' },
  { id: 'p3', name: 'Agua', price: 1000, cost: 400, stock: 30, category: 'BAR' },
  { id: 'p4', name: 'Vino', price: 3000, cost: 1500, stock: 10, category: 'BAR' },
  { id: 'p5', name: 'Fernet', price: 4000, cost: 2000, stock: 10, category: 'BAR' },
  { id: 'p6', name: 'IPA Lager', price: 2500, cost: 1200, stock: 2, category: 'BAR' }, // Low stock test
  { id: 'p7', name: 'Isenbeck', price: 2500, cost: 1200, stock: 15, category: 'BAR' },
  { id: 'p8', name: 'Vermut', price: 2500, cost: 1200, stock: 15, category: 'BAR' },
  { id: 'p11', name: 'Campari', price: 3500, cost: 1500, stock: 10, category: 'BAR' },
  { id: 'p12', name: 'Gin/Whisky', price: 4500, cost: 2000, stock: 10, category: 'BAR' },
  { id: 'p9', name: 'Pizza', price: 5000, cost: 2000, stock: 10, category: 'BAR' },
  { id: 'p10', name: 'Empanadas', price: 800, cost: 300, stock: 50, category: 'BAR' },
  // Instruments
  { id: 'i1', name: 'Guitarra A', price: 2000, cost: 0, stock: 1, category: 'INSTRUMENT' },
  { id: 'i2', name: 'Guitarra B', price: 2000, cost: 0, stock: 1, category: 'INSTRUMENT' },
  { id: 'i3', name: 'Bajo', price: 2000, cost: 0, stock: 1, category: 'INSTRUMENT' },
  { id: 'i4', name: 'Set Platos', price: 1500, cost: 0, stock: 1, category: 'INSTRUMENT' },
  { id: 'i5', name: 'Teclado', price: 2500, cost: 0, stock: 1, category: 'INSTRUMENT' },
  { id: 'i6', name: 'Grabación', price: 15000, cost: 0, stock: 999, category: 'INSTRUMENT' },
  // Special
  { id: 'bar_generic', name: 'Barra (Manual)', price: 0, cost: 0, stock: 9999, category: 'BAR' },
  // Vitrina
  { id: 'v1', name: 'Gorra', price: 10000, cost: 5000, stock: 5, category: 'VITRINA' },
  { id: 'v2', name: 'Felpas', price: 10000, cost: 5000, stock: 5, category: 'VITRINA' },
  { id: 'v3', name: 'Cuerdas 010', price: 10000, cost: 5000, stock: 5, category: 'VITRINA' },
  { id: 'v4', name: 'Cuerdas 009', price: 10000, cost: 5000, stock: 5, category: 'VITRINA' },
  { id: 'v5', name: 'Cuerdas 011', price: 10000, cost: 5000, stock: 5, category: 'VITRINA' },
  { id: 'v6', name: 'Palillos', price: 10000, cost: 5000, stock: 5, category: 'VITRINA' },
  { id: 'v7', name: 'Sombreritos', price: 10000, cost: 5000, stock: 5, category: 'VITRINA' },
  { id: 'v9', name: 'Correa', price: 10000, cost: 5000, stock: 5, category: 'VITRINA' },
  { id: 'v10', name: 'Varios', price: 10000, cost: 5000, stock: 5, category: 'VITRINA' },
];

export const INITIAL_MAINTENANCE: MaintenanceItem[] = [
  // Sala 1
  { id: 'm1', name: 'Batería Sonor SmartForce 505', roomId: 'sala1', status: 'OK' },
  { id: 'm2', name: 'Amp Bajo Hartke HA2500', roomId: 'sala1', status: 'OK' },
  { id: 'm3', name: 'Amp Guitarra Fender HotRodeDeluxe', roomId: 'sala1', status: 'OK' },
  { id: 'm4', name: 'Amp Guitarra Peavey Windsor Valv', roomId: 'sala1', status: 'OK' },
  { id: 'm5', name: 'Piano R. Weimar', roomId: 'sala1', status: 'OK' },
  { id: 'm6', name: 'Consola Eden TN226', roomId: 'sala1', status: 'OK' },
  // Sala 2
  { id: 'm7', name: 'Batería Gresch Renegade', roomId: 'sala2', status: 'OK' },
  { id: 'm8', name: 'Amp Bajo Gallien Kruger mb200', roomId: 'sala2', status: 'OK' },
  { id: 'm9', name: 'Amp Guitarra Fender Frontman 212', roomId: 'sala2', status: 'OK' },
  { id: 'm10', name: 'Amp Guitarra Fender Champion 100', roomId: 'sala2', status: 'OK' },
  { id: 'm11', name: 'Consola Yamaha MG16', roomId: 'sala2', status: 'OK' },
  // Sala A
  { id: 'm12', name: 'Batería SolidDrums Nativa', roomId: 'salaA', status: 'OK' },
  { id: 'm13', name: 'Amp Bajo Fender FM80', roomId: 'salaA', status: 'OK' },
  { id: 'm14', name: 'Amp Guitarra Fender Frontman 212', roomId: 'salaA', status: 'OK' },
  { id: 'm15', name: 'Amp Guitarra Roland Jazz Chorus 40', roomId: 'salaA', status: 'OK' },
  { id: 'm16', name: 'Piano Vertical Ronisch', roomId: 'salaA', status: 'OK' },
  { id: 'm17', name: 'Consola X-Air 16 ch', roomId: 'salaA', status: 'OK' },
  // Sala 3
  { id: 'm18', name: 'Batería Tama Swingstar', roomId: 'sala3', status: 'OK' },
  { id: 'm19', name: 'Amp Bajo Fender BXR 100', roomId: 'sala3', status: 'OK' },
  { id: 'm20', name: 'Amp Guitarra Marshall Valvestate 8080', roomId: 'sala3', status: 'OK' },
  { id: 'm21', name: 'Amp Guitarra Fender Champion 100', roomId: 'sala3', status: 'OK' },
  { id: 'm22', name: 'Consola Beringher Xenyx 1204', roomId: 'sala3', status: 'OK' },
];

export const INITIAL_STAFF_USERS: StaffUserConfig[] = [
  { name: 'zequi', permissions: ['bandas', 'barra_banda', 'barra', 'vitrina', 'instrumentos', 'cierre'] },
  { name: 'nacho', permissions: ['bandas', 'barra_banda', 'barra', 'vitrina', 'instrumentos', 'cierre'] },
  { name: 'mai', permissions: ['bandas', 'barra_banda', 'barra', 'vitrina', 'instrumentos', 'cierre'] },
  { name: 'ove', permissions: ['bandas', 'barra_banda', 'barra', 'vitrina', 'instrumentos', 'cierre'] },
  { name: 'abi', permissions: ['bandas', 'barra_banda', 'barra', 'vitrina', 'instrumentos', 'cierre'] },
  { name: 'santi', permissions: ['bandas', 'barra_banda', 'barra', 'vitrina', 'instrumentos', 'cierre'] },
  { name: 'marian', permissions: ['bandas', 'barra_banda', 'barra', 'vitrina', 'instrumentos', 'cierre'] },
  { name: 'leo', permissions: ['bandas', 'barra_banda', 'barra', 'vitrina', 'instrumentos', 'cierre'] }
];

export const DEFAULT_HEADER_LINKS = [
  { label: 'Instagram', url: 'https://instagram.com/salascalacuta', image: 'https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png' },
  { label: 'Ubicacion', url: 'https://maps.google.com', image: 'https://upload.wikimedia.org/wikipedia/commons/a/aa/Google_Maps_icon_%282020%29.svg' },
  { label: 'Youtube', url: 'https://youtube.com', image: 'https://upload.wikimedia.org/wikipedia/commons/0/09/YouTube_full-color_icon_%282017%29.svg' },
  { label: 'X', url: 'https://x.com', image: 'https://upload.wikimedia.org/wikipedia/commons/5/57/X_logo_2023_%28white%29.png' },
  { label: 'Whatsapp', url: 'https://wa.me/5491112345678', image: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg' }
];

export const DEFAULT_MAIN_PHOTO = 'https://images.unsplash.com/photo-1514525253361-bee8718a340b?auto=format&fit=crop&q=80&w=1920';
