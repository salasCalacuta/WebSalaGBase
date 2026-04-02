
import { INITIAL_PRODUCTS, INITIAL_MAINTENANCE, ROOMS as INITIAL_ROOMS, INITIAL_INCOME_CATEGORIES, INITIAL_EXPENSE_CATEGORIES, INITIAL_STAFF_USERS, DEFAULT_HEADER_LINKS } from '../constants';
import { Product, Reservation, Transaction, User, MaintenanceItem, Consumption, Contact, Room, StaffShift, PendingTask, GlobalConfig } from '../types';
import { supabase } from './supabase';

// Keys
const DB_PREFIX = 'calacuta_';
const KEYS = {
  USERS: `${DB_PREFIX}users`,
  RESERVATIONS: `${DB_PREFIX}reservations`,
  PRODUCTS: `${DB_PREFIX}products`,
  TRANSACTIONS: `${DB_PREFIX}transactions`,
  MAINTENANCE: `${DB_PREFIX}maintenance`,
  CONSUMPTION: `${DB_PREFIX}consumption`,
  CONTACTS: `${DB_PREFIX}contacts`,
  SHIFTS: `${DB_PREFIX}shifts`,
  PENDING_TASKS: `${DB_PREFIX}pending_tasks`,
  ROOMS: `${DB_PREFIX}rooms`,
  INITIAL_CASH: `${DB_PREFIX}initial_cash`,
  CONFIG: `${DB_PREFIX}config`,
};

// Initialize DB if empty
export const initDB = () => {
  if (!localStorage.getItem(KEYS.PRODUCTS)) {
    localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
  }
  if (!localStorage.getItem(KEYS.MAINTENANCE)) {
    localStorage.setItem(KEYS.MAINTENANCE, JSON.stringify(INITIAL_MAINTENANCE));
  }
  if (!localStorage.getItem(KEYS.USERS)) {
    localStorage.setItem(KEYS.USERS, JSON.stringify([]));
  }
  if (!localStorage.getItem(KEYS.ROOMS)) {
    localStorage.setItem(KEYS.ROOMS, JSON.stringify(INITIAL_ROOMS));
  }
  if (!localStorage.getItem(KEYS.CONFIG)) {
    const defaultConfig: GlobalConfig = {
      id: 'global',
      initialCash: 0,
      staffUsers: INITIAL_STAFF_USERS,
      incomeCategories: INITIAL_INCOME_CATEGORIES,
      expenseCategories: INITIAL_EXPENSE_CATEGORIES,
      headerLinks: DEFAULT_HEADER_LINKS
    };
    localStorage.setItem(KEYS.CONFIG, JSON.stringify(defaultConfig));
  }
};

// Helper to sync to Supabase
const syncToSupabase = async (tableName: string, data: any) => {
  // Ensure data is an array for upsert
  const dataArray = Array.isArray(data) ? data : [data];
  
  if (dataArray.length === 0) return;

  const { error } = await supabase
    .from(tableName)
    .upsert(dataArray, { onConflict: 'id' });
  
  if (error) {
    // If column is missing, try to sync without it as a fallback
    if (error.code === 'PGRST204' && tableName === 'config') {
      console.warn(`⚠️ Column missing in Supabase [${tableName}]. Retrying without 'expenseCategories'...`);
      const cleanedData = dataArray.map(item => {
        const { expenseCategories, ...rest } = item;
        return rest;
      });
      const { error: retryError } = await supabase
        .from(tableName)
        .upsert(cleanedData, { onConflict: 'id' });
      
      if (!retryError) return;
      throw new Error(`Supabase Retry [${tableName}]: ${retryError.message} (${retryError.code})`);
    }

    console.error(`❌ Supabase Error [${tableName}]:`, error);
    throw new Error(`Supabase [${tableName}]: ${error.message} (${error.code})`);
  }
};

// Helper to delete from Supabase
const deleteFromSupabase = async (tableName: string, id: string) => {
  const { error } = await supabase
    .from(tableName)
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error(`❌ Supabase Delete Error [${tableName}]:`, error);
    throw new Error(`Supabase Delete [${tableName}]: ${error.message} (${error.code})`);
  }
};

export const storage = {
  getProducts: (): Product[] => JSON.parse(localStorage.getItem(KEYS.PRODUCTS) || '[]'),
  saveProducts: async (data: Product[], singleItem?: Product) => {
    localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(data));
    await syncToSupabase('products', singleItem || data);
  },
  deleteProduct: async (id: string, allData: Product[]) => {
    localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(allData));
    await deleteFromSupabase('products', id);
  },
  
  getReservations: (): Reservation[] => JSON.parse(localStorage.getItem(KEYS.RESERVATIONS) || '[]'),
  saveReservations: async (data: Reservation[], singleItem?: Reservation) => {
    localStorage.setItem(KEYS.RESERVATIONS, JSON.stringify(data));
    await syncToSupabase('reservations', singleItem || data);
  },
  deleteReservation: async (id: string, allReservations: Reservation[]) => {
    localStorage.setItem(KEYS.RESERVATIONS, JSON.stringify(allReservations));
    await deleteFromSupabase('reservations', id);
  },
  
  getTransactions: (): Transaction[] => JSON.parse(localStorage.getItem(KEYS.TRANSACTIONS) || '[]'),
  saveTransactions: async (data: Transaction[], singleItem?: Transaction) => {
    localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(data));
    await syncToSupabase('transactions', singleItem || data);
  },
  deleteTransaction: async (id: string, allData: Transaction[]) => {
    localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(allData));
    await deleteFromSupabase('transactions', id);
  },

  getMaintenance: (): MaintenanceItem[] => JSON.parse(localStorage.getItem(KEYS.MAINTENANCE) || '[]'),
  saveMaintenance: async (data: MaintenanceItem[], singleItem?: MaintenanceItem) => {
    localStorage.setItem(KEYS.MAINTENANCE, JSON.stringify(data));
    await syncToSupabase('maintenance', singleItem || data);
  },
  deleteMaintenance: async (id: string, allData: MaintenanceItem[]) => {
    localStorage.setItem(KEYS.MAINTENANCE, JSON.stringify(allData));
    await deleteFromSupabase('maintenance', id);
  },

  getUsers: (): User[] => JSON.parse(localStorage.getItem(KEYS.USERS) || '[]'),
  saveUsers: async (data: User[], singleItem?: User) => {
    localStorage.setItem(KEYS.USERS, JSON.stringify(data));
    const usersToSync = (singleItem ? [singleItem] : data).map(u => ({ ...u, id: u.username }));
    await syncToSupabase('users', usersToSync);
  },
  deleteUser: async (username: string, allData: User[]) => {
    localStorage.setItem(KEYS.USERS, JSON.stringify(allData));
    const { error } = await supabase.from('users').delete().eq('username', username);
    if (error) throw error;
  },

  getConsumption: (): Consumption[] => JSON.parse(localStorage.getItem(KEYS.CONSUMPTION) || '[]'),
  saveConsumption: async (data: Consumption[], singleItem?: Consumption) => {
    localStorage.setItem(KEYS.CONSUMPTION, JSON.stringify(data));
    await syncToSupabase('consumptions', singleItem || data);
  },
  deleteConsumption: async (id: string, allData: Consumption[]) => {
    localStorage.setItem(KEYS.CONSUMPTION, JSON.stringify(allData));
    await deleteFromSupabase('consumptions', id);
  },

  getContacts: (): Contact[] => JSON.parse(localStorage.getItem(KEYS.CONTACTS) || '[]'),
  saveContacts: async (data: Contact[], singleItem?: Contact) => {
    localStorage.setItem(KEYS.CONTACTS, JSON.stringify(data));
    await syncToSupabase('contacts', singleItem || data);
  },
  deleteContact: async (id: string, allData: Contact[]) => {
    localStorage.setItem(KEYS.CONTACTS, JSON.stringify(allData));
    await deleteFromSupabase('contacts', id);
  },

  getRooms: (): Room[] => JSON.parse(localStorage.getItem(KEYS.ROOMS) || JSON.stringify(INITIAL_ROOMS)),
  saveRooms: async (data: Room[], singleItem?: Room) => {
    localStorage.setItem(KEYS.ROOMS, JSON.stringify(data));
    await syncToSupabase('rooms', singleItem || data);
  },
  deleteRoom: async (id: string, allData: Room[]) => {
    localStorage.setItem(KEYS.ROOMS, JSON.stringify(allData));
    await deleteFromSupabase('rooms', id);
  },

  getShifts: (): StaffShift[] => JSON.parse(localStorage.getItem(KEYS.SHIFTS) || '[]'),
  saveShifts: async (data: StaffShift[], singleItem?: StaffShift) => {
    localStorage.setItem(KEYS.SHIFTS, JSON.stringify(data));
    await syncToSupabase('shifts', singleItem || data);
  },
  deleteShift: async (id: string, allData: StaffShift[]) => {
    localStorage.setItem(KEYS.SHIFTS, JSON.stringify(allData));
    await deleteFromSupabase('shifts', id);
  },

  getPendingTasks: (): PendingTask[] => JSON.parse(localStorage.getItem(KEYS.PENDING_TASKS) || '[]'),
  savePendingTasks: async (data: PendingTask[], singleItem?: PendingTask) => {
    localStorage.setItem(KEYS.PENDING_TASKS, JSON.stringify(data));
    await syncToSupabase('pending_tasks', singleItem || data);
  },
  deletePendingTask: async (id: string, allData: PendingTask[]) => {
    localStorage.setItem(KEYS.PENDING_TASKS, JSON.stringify(allData));
    await deleteFromSupabase('pending_tasks', id);
  },

  getInitialCash: (): number => Number(localStorage.getItem(KEYS.INITIAL_CASH) || 0),
  saveInitialCash: async (amount: number) => {
    localStorage.setItem(KEYS.INITIAL_CASH, String(amount));
    // We update the global config object in Supabase
    const currentConfig = storage.getConfig();
    await syncToSupabase('config', [{ ...currentConfig, initialCash: amount }]);
  },

  getConfig: (): GlobalConfig => {
    const data = localStorage.getItem(KEYS.CONFIG);
    if (data) return JSON.parse(data);
    return {
      id: 'global',
      initialCash: 0,
      staffUsers: INITIAL_STAFF_USERS,
      incomeCategories: INITIAL_INCOME_CATEGORIES,
      expenseCategories: INITIAL_EXPENSE_CATEGORIES,
      headerLinks: DEFAULT_HEADER_LINKS
    };
  },
  saveConfig: async (config: GlobalConfig) => {
    localStorage.setItem(KEYS.CONFIG, JSON.stringify(config));
    await syncToSupabase('config', [config]);
  },

  clearAllData: async () => {
    localStorage.setItem(KEYS.RESERVATIONS, JSON.stringify([]));
    localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify([]));
    localStorage.setItem(KEYS.CONSUMPTION, JSON.stringify([]));
    localStorage.setItem(KEYS.CONTACTS, JSON.stringify([]));
    localStorage.setItem(KEYS.INITIAL_CASH, '0');
    localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
    localStorage.setItem(KEYS.MAINTENANCE, JSON.stringify(INITIAL_MAINTENANCE));
  }
};
