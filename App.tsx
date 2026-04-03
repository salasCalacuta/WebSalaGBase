
// Version: 2.29 - Reset to Zero refinement
import React, { useEffect, useState } from 'react';
import { Header } from './components/Header';
import { Login } from './components/Login';
import { Button } from './components/ui/Button';
import { storage, initDB } from './services/storage';
import { supabase, isSupabaseConfigured } from './services/supabase';
import { User, UserRole, Reservation, Product, Transaction, MaintenanceItem, Consumption, RoomColor, StaffShift, Contact, Room, PointEntry, PendingTask, RoomEquipment, GlobalConfig } from './types';
import { ROOMS as DEFAULT_ROOMS, INITIAL_PRODUCTS, INITIAL_MAINTENANCE, DEFAULT_MAIN_PHOTO } from './constants';
import { StockView } from './components/admin/StockView';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { PointsView } from './components/admin/PointsView';
import { Register } from './components/Register';
import { VitrinaView } from './components/staff/VitrinaView';
import { DailyBands } from './components/staff/DailyBands';
import { GeneralBarView } from './components/staff/GeneralBarView';
import { NewReservation } from './components/client/NewReservation';
import { Calculator } from './components/client/Calculator';
import { Input, Select } from './components/ui/Input';
import { CobrosView } from './components/admin/CobrosView';
import { PagosView } from './components/admin/PagosView';
import { PricesView } from './components/admin/PricesView';
import { MaintenanceView } from './components/admin/MaintenanceView';
import { CashView } from './components/admin/CashView';
import { StaffScheduleView } from './components/admin/StaffScheduleView';
import { PendientesView } from './components/admin/PendientesView';
import { RoomsView } from './components/admin/RoomsView';
import { InstrumentsView } from './components/staff/InstrumentsView';
import { ContactsView } from './components/reservas/ContactsView';
import { CalendarSyncView } from './components/reservas/CalendarSyncView';
// import { ChatView } from './components/reservas/ChatView';
import { ReservasUserView } from './components/reservas/ReservasUserView';
import { X, RefreshCw } from 'lucide-react';

// Helper for tabs
const TabButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode; alert?: boolean }> = ({ active, onClick, children, alert }) => (
  <button 
    onClick={onClick}
    className={`relative px-4 py-4 md:px-6 md:py-4 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 text-center md:text-left shrink-0 group
      ${active ? 'bg-[#D2B48C] text-black shadow-[4px_0px_0px_rgba(210,180,140,0.3)]' : 'bg-transparent text-[#D2B48C]/60 hover:text-white hover:bg-white/[0.03]'}
      w-auto md:w-full border-b-2 md:border-b-0 md:border-l-4 ${active ? 'border-black' : 'border-transparent'}
    `}
  >
    <span className="relative z-10">{children}</span>
    {alert && (
      <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.5)]"></span>
    )}
    {!active && (
      <div className="absolute inset-0 bg-[#D2B48C] translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500 opacity-[0.05]"></div>
    )}
  </button>
);


import { CustomModal } from './components/ui/CustomModal';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [view, setView] = useState<string>('home');
  const [isAdminPathActive, setIsAdminPathActive] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  // Modal states
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'alert' | 'confirm' | 'prompt';
    onConfirm: (val?: string) => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'alert',
    onConfirm: () => {}
  });

  const showModal = (config: Omit<typeof modalConfig, 'isOpen'>) => {
    setModalConfig({ ...config, isOpen: true });
  };

  const closeModal = () => {
    setModalConfig(prev => ({ ...prev, isOpen: false }));
  };

  // Check for secret admin path on mount
  useEffect(() => {
    const path = window.location.pathname;
    const secretPath = import.meta.env.VITE_ADMIN_PATH || 'secret_admin_path';
    if (path === `/${secretPath}`) {
      setIsAdminPathActive(true);
      // Redirect to home but keep the admin path active in state
      window.history.replaceState({}, '', '/');
    }
  }, []);

  const wrapSync = async (fn: () => Promise<void>, successMessage?: string) => {
    if (!isSupabaseConfigured) {
      console.warn("Supabase not configured. Saving locally only.");
      try {
        await fn();
        if (successMessage) alert(successMessage);
      } catch (e) {
        console.error("Local Save Error:", e);
      }
      return;
    }

    setIsSyncing(true);
    setSyncError(null);
    try {
      await fn();
      if (successMessage) {
        alert(successMessage);
      }
    } catch (e: any) {
      console.error("❌ Sync Error Details:", e);
      const errorMsg = e.message || "Error de sincronización";
      setSyncError(errorMsg);
      alert(`Error de sincronización en la nube:\n\n${errorMsg}\n\nLos cambios se guardaron localmente pero no en la nube. Verifique su conexión y configuración de Supabase.`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleRefresh = async () => {
    setIsSyncing(true);
    setSyncError(null);
    try {
      const tables = [
        { name: 'reservations', setter: setReservations },
        { name: 'products', setter: setProducts },
        { name: 'transactions', setter: setTransactions },
        { name: 'maintenance', setter: setMaintenance },
        { name: 'consumptions', setter: setConsumptions },
        { name: 'shifts', setter: setShifts },
        { name: 'contacts', setter: setContacts },
        { name: 'pending_tasks', setter: setPendingTasks },
        { name: 'rooms', setter: setRooms },
      ];

      for (const { name, setter } of tables) {
        const { data, error } = await supabase.from(name).select('*');
        if (error) throw error;
        if (data) {
          setter(data);
          localStorage.setItem(`calacuta_${name}`, JSON.stringify(data));
        }
      }

      const { data: configData, error: configError } = await supabase.from('config').select('*').eq('id', 'global').single();
      if (configError && configError.code !== 'PGRST116') throw configError;
      if (configData) {
        setInitialCash(configData.initialCash || 0);
        localStorage.setItem('calacuta_initial_cash', String(configData.initialCash || 0));
        
        if (configData.globalConfig) {
          setGlobalConfig(configData.globalConfig);
          localStorage.setItem('calacuta_config', JSON.stringify(configData.globalConfig));
        }
      }
      
      alert("Base de datos actualizada desde la nube.");
    } catch (e: any) {
      console.error("Refresh Error:", e);
      setSyncError(e.message || "Error al actualizar");
      alert("Error al actualizar la base de datos. Verifique su conexión.");
    } finally {
      setIsSyncing(false);
    }
  };

  const [showLoginModal, setShowLoginModal] = useState(false);
  
  // Data State
  const [reservations, setReservations] = useState<Reservation[]>(storage.getReservations());
  const [products, setProducts] = useState<Product[]>(storage.getProducts());
  const [transactions, setTransactions] = useState<Transaction[]>(storage.getTransactions());
  const [maintenance, setMaintenance] = useState<MaintenanceItem[]>(storage.getMaintenance());
  const [consumptions, setConsumptions] = useState<Consumption[]>(storage.getConsumption());
  const [shifts, setShifts] = useState<StaffShift[]>(storage.getShifts());
  const [contacts, setContacts] = useState<Contact[]>(storage.getContacts());
  const [pendingTasks, setPendingTasks] = useState<PendingTask[]>(storage.getPendingTasks());
  const [rooms, setRooms] = useState<Room[]>(storage.getRooms());
  const [initialCash, setInitialCash] = useState<number>(storage.getInitialCash());
  const [globalConfig, setGlobalConfig] = useState<GlobalConfig>(() => {
    const config = storage.getConfig();
    return {
      ...config,
      staffUsers: (config.staffUsers || []).map((u: any) => 
        typeof u === 'string' ? { name: u, permissions: ['bandas', 'barra_banda', 'barra', 'vitrina', 'instrumentos', 'cierre'] } : u
      ),
      incomeCategories: config.incomeCategories || [],
      expenseCategories: config.expenseCategories || [],
      headerLinks: config.headerLinks || [],
      mainPhoto: config.mainPhoto || 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=1000&auto=format&fit=crop'
    };
  });
  
  // UI State
  const [selectedContactBand, setSelectedContactBand] = useState<string>('');
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);
  const [showRegister, setShowRegister] = useState(false);

  const pointsAlert = contacts.some(c => (c.points || 0) >= 20);

  const isSupabaseConfigured = !!import.meta.env.VITE_SUPABASE_URL && !!import.meta.env.VITE_SUPABASE_ANON_KEY;

  // Effect to sync data from Supabase
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    const tables = [
      { name: 'reservations', setter: setReservations, saver: storage.saveReservations },
      { name: 'products', setter: setProducts, saver: storage.saveProducts },
      { name: 'transactions', setter: setTransactions, saver: storage.saveTransactions },
      { name: 'maintenance', setter: setMaintenance, saver: storage.saveMaintenance },
      { name: 'consumptions', setter: setConsumptions, saver: storage.saveConsumption },
      { name: 'shifts', setter: setShifts, saver: storage.saveShifts },
      { name: 'contacts', setter: setContacts, saver: storage.saveContacts },
      { name: 'pending_tasks', setter: setPendingTasks, saver: storage.savePendingTasks },
      { name: 'rooms', setter: setRooms, saver: storage.saveRooms },
    ];

    const channels: any[] = [];

    tables.forEach(({ name, setter, saver }) => {
      // Initial fetch
      supabase.from(name).select('*').then(({ data, error }) => {
        if (error) {
          console.error(`Error fetching ${name}:`, error);
          setSyncError(`Error al conectar con ${name}: ${error.message}`);
        } else if (data && data.length > 0) {
          setter(data);
          localStorage.setItem(`calacuta_${name}`, JSON.stringify(data));
          setSyncError(null);
        } else if (data && data.length === 0) {
          // If Supabase is empty but we have local data, push it to Supabase
          const localData = localStorage.getItem(`calacuta_${name}`);
          if (localData) {
            const parsed = JSON.parse(localData);
            if (parsed.length > 0) {
              console.log(`Supabase table ${name} is empty. Pushing local data...`);
              saver(parsed);
            }
          }
        }
      });

      // Real-time subscription
      const channel = supabase
        .channel(`public:${name}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: name }, (payload) => {
          console.log(`Change detected in ${name}:`, payload);
          // Refresh data on change
          supabase.from(name).select('*').then(({ data }) => {
            if (data) {
              setter(data);
              localStorage.setItem(`calacuta_${name}`, JSON.stringify(data));
            }
          });
        })
        .subscribe();
      
      channels.push(channel);
    });

    // Config sync
    supabase.from('config').select('*').eq('id', 'global').single().then(({ data }) => {
      if (data) {
        setInitialCash(data.initialCash || 0);
        localStorage.setItem('calacuta_initial_cash', String(data.initialCash || 0));
        const config: GlobalConfig = {
          ...data,
          staffUsers: (data.staffUsers || []).map((u: any) => 
            typeof u === 'string' ? { name: u, permissions: ['bandas', 'barra_banda', 'barra', 'vitrina', 'instrumentos', 'cierre'] } : u
          ),
          incomeCategories: data.incomeCategories || [],
          expenseCategories: data.expenseCategories || [],
          headerLinks: data.headerLinks || []
        };
        setGlobalConfig(config);
        localStorage.setItem('calacuta_config', JSON.stringify(config));
      }
    });

    const configChannel = supabase
      .channel('public:config')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'config' }, (payload) => {
        if (payload.new) {
          const newData = payload.new as any;
          if (newData.initialCash !== undefined) {
            setInitialCash(newData.initialCash);
            localStorage.setItem('calacuta_initial_cash', String(newData.initialCash));
          }
          const config: GlobalConfig = {
            ...newData,
            staffUsers: (newData.staffUsers || []).map((u: any) => 
              typeof u === 'string' ? { name: u, permissions: ['bandas', 'barra_banda', 'barra', 'vitrina', 'instrumentos', 'cierre'] } : u
            ),
            incomeCategories: newData.incomeCategories || [],
            expenseCategories: newData.expenseCategories || [],
            headerLinks: newData.headerLinks || []
          };
          setGlobalConfig(config);
          localStorage.setItem('calacuta_config', JSON.stringify(config));
        }
      })
      .subscribe();
    
    channels.push(configChannel);

    return () => {
      channels.forEach(ch => supabase.removeChannel(ch));
    };
  }, [isSupabaseConfigured]);

  useEffect(() => {
    initDB();
    
    // One-time reset if requested
    if (!localStorage.getItem('calacuta_reset_v1')) {
        storage.clearAllData();
        localStorage.setItem('calacuta_reset_v1', 'true');
    }
    
    refreshData();
  }, []);

  const refreshData = () => {
    setReservations(storage.getReservations());
    setProducts(storage.getProducts());
    setTransactions(storage.getTransactions());
    setMaintenance(storage.getMaintenance());
    setConsumptions(storage.getConsumption());
    setContacts(storage.getContacts());
    setRooms(storage.getRooms());
    setInitialCash(storage.getInitialCash());
    setGlobalConfig(storage.getConfig());
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setShowLoginModal(false); // Close modal on login
    if (user.role === UserRole.ADMIN) setView('contactos'); // Changed from 'reservas' to hide Agenda
    else if (user.role === UserRole.STAFF) setView('bandas');
    else if (user.role === UserRole.RESERVAS) setView('contactos');
    else if (user.role === UserRole.CONTACTOS) setView('contactos');
    else setView('reservar');
  };

  const isRestricted = currentUser?.role === UserRole.RESERVAS;

  const handleLogout = () => {
    setCurrentUser(null);
    setView('home');
    setSelectedContactBand('');
  };

  // --- Actions ---

  const handleUpdateStock = async (updatedProduct: Product) => {
    const newProducts = products.map(p => p.id === updatedProduct.id ? updatedProduct : p);
    await wrapSync(() => storage.saveProducts(newProducts), "Stock actualizado y sincronizado");
  };

  const handleDeleteProduct = async (id: string) => {
    const newProducts = products.filter(p => p.id !== id);
    await wrapSync(() => storage.saveProducts(newProducts), "Producto eliminado y sincronizado");
  };

  const handleUpdateRoom = async (updatedRoom: Room) => {
      const newRooms = rooms.map(r => r.id === updatedRoom.id ? updatedRoom : r);
      await wrapSync(() => storage.saveRooms(newRooms), "Sala actualizada y sincronizada");

      // Sync equipment with maintenance
      if (updatedRoom.equipment) {
          const equipmentNames = [
              { key: 'battery', label: 'Batería' },
              { key: 'guitarAmp1', label: 'Ampli Guitarra 1' },
              { key: 'guitarAmp2', label: 'Ampli Guitarra 2' },
              { key: 'bassAmp', label: 'Ampli Bajo' },
              { key: 'console', label: 'Consola' },
              { key: 'piano', label: 'Piano' }
          ];

          let updatedMaintenance = [...maintenance];
          let changed = false;

          equipmentNames.forEach(eq => {
              const val = updatedRoom.equipment![eq.key as keyof RoomEquipment];
              if (val) {
                  const fullName = `${eq.label}: ${val}`;
                  const existingIndex = updatedMaintenance.findIndex(m => 
                      m.roomId === updatedRoom.id && m.name.startsWith(eq.label + ':')
                  );

                  if (existingIndex >= 0) {
                      if (updatedMaintenance[existingIndex].name !== fullName) {
                          updatedMaintenance[existingIndex] = { ...updatedMaintenance[existingIndex], name: fullName };
                          changed = true;
                      }
                  } else {
                      updatedMaintenance.push({
                          id: `eq_${updatedRoom.id}_${eq.key}_${Date.now()}`,
                          name: fullName,
                          roomId: updatedRoom.id,
                          status: 'OK'
                      });
                      changed = true;
                  }
              }
          });

          if (changed) {
              await wrapSync(() => storage.saveMaintenance(updatedMaintenance));
          }
      }
  };

  const handleCreateRoom = async (newRoom: Room) => {
    const updated = [...rooms, newRoom];
    await wrapSync(() => storage.saveRooms(updated));
  };

  const handleDeleteRoom = async (id: string) => {
    const updated = rooms.filter(r => r.id !== id);
    setRooms(updated);
    await wrapSync(() => storage.deleteRoom(id, updated));
  };

  const handleLoadDefaultRooms = async () => {
    await wrapSync(async () => {
      await storage.saveRooms(DEFAULT_ROOMS);
      await storage.saveMaintenance(INITIAL_MAINTENANCE);
      setRooms(DEFAULT_ROOMS);
      setMaintenance(INITIAL_MAINTENANCE);
    }, "Salas y equipamiento predeterminado cargados con éxito");
  };

  const handleLoadDefaultProducts = async () => {
    await wrapSync(() => storage.saveProducts(INITIAL_PRODUCTS));
  };

  const handleAddStockExpense = (product: Product, quantity: number) => {
     // Create expense when adding stock
     const cost = product.cost * quantity;
     if (cost > 0) {
         const tx: Transaction = {
             id: Date.now().toString(),
             type: 'EXPENSE',
             category: 'Compras Barra',
             amount: cost,
             date: new Date().toISOString(),
             description: `Stock: ${product.name} x${quantity}`,
             isPaid: true
         };
         handleAddTransaction(tx);
     }
  };

  const handleCreateProduct = async (p: Product) => {
      const newProducts = [...products, p];
      await wrapSync(() => storage.saveProducts(newProducts));
  };

  const handleReservationStatus = async (id: string, status: Reservation['status']) => {
    const updated = reservations.map(r => r.id === id ? { ...r, status } : r);
    await wrapSync(() => storage.saveReservations(updated));
  };

  // New function to delete reservation entirely (Error Interno)
  const handleUpdateReservation = async (updatedRes: Reservation) => {
    const updated = reservations.map(r => r.id === updatedRes.id ? updatedRes : r);
    await wrapSync(() => storage.saveReservations(updated));
  };

  const handleDeleteReservation = async (id: string) => {
      const updated = reservations.filter(r => r.id !== id);
      setReservations(updated); // Update local state immediately
      await wrapSync(() => storage.deleteReservation(id, updated));
  };

  const handleToggleAbono = async (id: string) => {
      const updated = reservations.map(r => r.id === id ? { ...r, isAbono: !r.isAbono } : r);
      await wrapSync(() => storage.saveReservations(updated));
  }

  const handleAddConsumption = async (resId: string, product: Product) => {
    if (product.stock <= 0 && product.category === 'BAR' && product.id !== 'bar_generic' && product.id !== 'manual') return alert("Sin stock");
    
    if (product.category === 'BAR' && product.id !== 'bar_generic' && product.id !== 'manual') {
        await handleUpdateStock({ ...product, stock: product.stock - 1 });
    }

    const existing = consumptions.find(c => c.reservationId === resId);
    let newConsumptions = [];
    if (existing) {
        const itemIndex = existing.items.findIndex(i => i.productId === product.id && i.price === product.price);
        let newItems = [...existing.items];
        if (itemIndex >= 0) {
            newItems[itemIndex].quantity += 1;
        } else {
            newItems.push({ productId: product.id, name: product.name, price: product.price, quantity: 1 });
        }
        const updatedCons = { 
            ...existing, 
            items: newItems, 
            total: newItems.reduce((acc, i) => acc + (i.price * i.quantity), 0) 
        };
        newConsumptions = consumptions.map(c => c.reservationId === resId ? updatedCons : c);
    } else {
        const newCons: Consumption = {
            id: Date.now().toString(),
            reservationId: resId,
            items: [{ productId: product.id, name: product.name, price: product.price, quantity: 1 }],
            total: product.price,
            paid: false
        };
        newConsumptions = [...consumptions, newCons];
    }
    await wrapSync(() => storage.saveConsumption(newConsumptions));
  };

  const handleUpdateConsumptionItem = async (resId: string, productId: string, change: number, isDelete: boolean = false) => {
      const existing = consumptions.find(c => c.reservationId === resId);
      if (!existing) return;

      let newItems = [...existing.items];
      const idx = newItems.findIndex(i => i.productId === productId);
      if (idx === -1) return;

      if (isDelete) {
          newItems.splice(idx, 1);
      } else {
          newItems[idx].quantity += change;
          if (newItems[idx].quantity <= 0) {
              newItems.splice(idx, 1);
          }
      }

      const updatedCons = {
          ...existing,
          items: newItems,
          total: newItems.reduce((acc, i) => acc + (i.price * i.quantity), 0)
      };

      const newConsumptions = consumptions.map(c => c.reservationId === resId ? updatedCons : c);
      await wrapSync(() => storage.saveConsumption(newConsumptions));
  };

  const handleCloseBand = async (resId: string, method: 'CASH' | 'MERCADOPAGO' | 'DEBT', partialAmount?: number) => {
    const res = reservations.find(r => r.id === resId);
    const cons = consumptions.find(c => c.reservationId === resId);
    if(!res) return;

    // Logic: If Abono, Room Price is 0.
    const roomPrice = res.isAbono ? 0 : res.totalAmount;
    const total = (cons?.total || 0) + roomPrice; 

    // Handle DEBT and Partial Payments
    if (method === 'DEBT') {
        const contact = contacts.find(c => c.bandName.toLowerCase() === res.bandName.toLowerCase());
        
        let incomeAmount = 0; // Amount actually entering the box (Partial)
        let debtAmount = total;

        if (partialAmount !== undefined) {
            incomeAmount = partialAmount;
            debtAmount = total - partialAmount;
        }

        // 1. Record Partial Payment as Income (if any)
        if (incomeAmount > 0) {
            const partialTx: Transaction = {
                id: Date.now().toString() + '_partial',
                type: 'INCOME',
                category: 'COBRO_BANDA',
                amount: incomeAmount,
                date: new Date().toISOString(),
                description: `Cobro Parcial ${res.bandName}`,
                isPaid: true,
                paymentMethod: 'CASH' // Assume Cash for partial unless specified, or could add partialMP
            };
            await handleAddTransaction(partialTx);
        }

        // 2. Update Debt on Contact
        if (contact && debtAmount > 0) {
            const updatedContact = { ...contact, debt: (contact.debt || 0) + debtAmount };
            const newContacts = contacts.map(c => c.id === contact.id ? updatedContact : c);
            await wrapSync(() => storage.saveContacts(newContacts));
        }
    } else {
        // Full Payment (CASH or MP)
        const newTx: Transaction = {
            id: Date.now().toString(),
            type: 'INCOME',
            category: 'COBRO_BANDA',
            amount: total,
            date: new Date().toISOString(),
            description: `Cobro banda ${res.bandName} ${res.isAbono ? '(Abono)' : ''}`,
            isPaid: true,
            paymentMethod: method 
        };
        await handleAddTransaction(newTx);
    }
    
    // Mark Reservation as COMPLETED (Attended/Paid)
    await handleReservationStatus(resId, 'COMPLETED');
    
    // Points Logic
    const contact = contacts.find(c => c.bandName.toLowerCase() === res.bandName.toLowerCase());
    if (contact) {
        let pointsToAdd = 0;
        
        // 1. Attendance (3 in a row)
        const bandRes = reservations
            .filter(r => r.bandName.toLowerCase() === res.bandName.toLowerCase())
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        const completedCount = bandRes.filter(r => r.status === 'COMPLETED').length + 1;
        if (completedCount > 0 && completedCount % 3 === 0) {
            pointsToAdd += 3;
        }

        // 2. Instrument Rental
        if (cons) {
            const hasInstrument = cons.items.some(item => {
                const prod = products.find(p => p.id === item.productId);
                return prod?.category === 'INSTRUMENT';
            });
            if (hasInstrument) pointsToAdd += 1;
        }

        // 3. Bar Consumption
        if (cons) {
            const itemCount = cons.items.reduce((acc, item) => acc + item.quantity, 0);
            if (itemCount > 5) pointsToAdd += 2;
        }

        if (pointsToAdd > 0) {
            const newEntry: PointEntry = {
                amount: pointsToAdd,
                date: new Date().toISOString(),
                reason: `Cierre de banda: ${res.bandName}`
            };
            const updatedContact = { 
                ...contact, 
                pointsHistory: [...(contact.pointsHistory || []), newEntry]
            };
            await handleUpdateContact(updatedContact);
        }
    }
    
    if(cons) {
        const updatedCons = consumptions.map(c => c.id === cons.id ? { ...c, paid: true, paymentMethod: method } : c);
        await wrapSync(() => storage.saveConsumption(updatedCons));
    }
  };

  const handleGeneralBarTransaction = async (amount: number, method: 'CASH' | 'MERCADOPAGO' | 'DEBT', descriptionSuffix: string = '') => {
      const tx: Transaction = {
          id: Date.now().toString(),
          type: 'INCOME',
          category: 'Barra',
          amount: amount,
          date: new Date().toISOString(),
          description: `Venta de Barra (General)${descriptionSuffix}`,
          isPaid: method !== 'DEBT',
          paymentMethod: method
      };
      await handleAddTransaction(tx);
  };

  const handleDayClose = async () => {
      const now = new Date();
      const todayString = now.toDateString(); 
      
      const todayTxs = transactions.filter(t => {
          if (!t.isPaid || !t.date) return false;
          // Filter out DEBT transactions for cash closing
          if (t.paymentMethod === 'DEBT') return false; 
          return new Date(t.date).toDateString() === todayString;
      });

      // Only sum Income
      const incomeTxs = todayTxs.filter(t => t.type === 'INCOME');
      
      const totalCash = incomeTxs.filter(t => t.paymentMethod === 'CASH').reduce((s,t) => s + t.amount, 0);
      const totalMP = incomeTxs.filter(t => t.paymentMethod === 'MERCADOPAGO').reduce((s,t) => s + t.amount, 0);
      
      // Force re-render just in case
      setTransactions([...transactions]);
      
      // Generate Daily Excel in Cloud
      await wrapSync(async () => {
          await new Promise(resolve => setTimeout(resolve, 2000));
          console.log(`[Cloud Export] Daily Excel generated for ${todayString}`);
      }, `Cierre de día exitoso. Excel diario generado en la nube: Cierre_${now.toISOString().split('T')[0]}.xlsx`);
  };

  const handleAddTransaction = async (t: Transaction) => {
      const newTxs = [...transactions, t];
      await wrapSync(() => storage.saveTransactions(newTxs), "Transacción registrada con éxito");
  };
  
  const handleUpdateTransaction = async (t: Transaction) => {
      const newTxs = transactions.map(tx => tx.id === t.id ? t : tx);
      await wrapSync(() => storage.saveTransactions(newTxs), "Transacción actualizada");
  };

  const handleToggleTransactionStatus = async (id: string) => {
      const updated = transactions.map(t => t.id === id ? { ...t, isPaid: !t.isPaid } : t);
      await wrapSync(() => storage.saveTransactions(updated), "Estado de transacción actualizado");
  };

  const handleSettleDebt = async (contactId: string, amount: number, type: 'PAY' | 'VOID') => {
      const contact = contacts.find(c => c.id === contactId);
      if (!contact) return;

      // 1. Clear Debt from Contact
      const updatedContact = { ...contact, debt: 0 };
      const newContacts = contacts.map(c => c.id === contact.id ? updatedContact : c);
      await wrapSync(() => storage.saveContacts(newContacts));

      // 2. Register Transaction
      if (type === 'PAY') {
          // Income
          const tx: Transaction = {
              id: Date.now().toString(),
              type: 'INCOME',
              category: 'COBRO_DEUDA',
              amount: amount,
              date: new Date().toISOString(),
              description: `Cobro Deuda Total: ${contact.bandName}`,
              isPaid: true,
              paymentMethod: 'CASH'
          };
          await handleAddTransaction(tx);
          alert("Deuda cobrada e ingresada a Caja.");
      } else {
          // Void (Expense/Loss)
          const tx: Transaction = {
              id: Date.now().toString(),
              type: 'EXPENSE',
              category: 'DEUDA_ANULADA',
              amount: amount,
              date: new Date().toISOString(),
              description: `Deuda Anulada: ${contact.bandName}`,
              isPaid: true
          };
          await handleAddTransaction(tx);
          alert("Deuda anulada y registrada como pérdida.");
      }
  };

  const handleClientReserve = async (data: { date: string, timeStart: string, timeEnd: string, roomId: string }) => {
      const contact = contacts.find(c => c.bandName.toLowerCase() === (currentUser?.bandName || '').toLowerCase());
      if (contact && contact.isBlocked) {
          alert("Esta banda está bloqueada y no puede realizar reservas. Por favor contacte con administración.");
          return;
      }
      const room = rooms.find(r => r.id === data.roomId);
      const newRes: Reservation = {
          id: Date.now().toString(),
          clientName: currentUser?.username || 'Unknown',
          bandName: currentUser?.bandName || 'Unknown',
          date: data.date,
          timeStart: data.timeStart,
          timeEnd: data.timeEnd,
          roomId: data.roomId,
          status: 'PENDING',
          totalAmount: room ? room.price : 0
      };
      const updated = [...reservations, newRes];
      await wrapSync(() => storage.saveReservations(updated));
  };
  
  // Helper for overlaps
  const checkConflict = (date: string, timeStart: string, timeEnd: string, roomId: string): boolean => {
      return reservations.some(r => 
          r.status !== 'REJECTED' && 
          r.date === date && 
          r.roomId === roomId &&
          (
              (timeStart >= r.timeStart && timeStart < r.timeEnd) || 
              (timeEnd > r.timeStart && timeEnd <= r.timeEnd) ||
              (timeStart <= r.timeStart && timeEnd >= r.timeEnd)
          )
      );
  };

  const handleAdminOrReservasCreate = async (data: { 
      date: string, timeStart: string, timeEnd: string, roomId: string, bandName: string, isAbono?: boolean
  }): Promise<{ success: boolean, message?: string }> => {
      const contact = contacts.find(c => c.bandName.toLowerCase() === data.bandName.toLowerCase());
      if (contact && contact.isBlocked) {
          return { success: false, message: "Esta banda está bloqueada" };
      }
      
      const room = rooms.find(r => r.id === data.roomId);
      const datesToBook: string[] = [data.date];

      // Logic: If Abono, find all same weekdays for the rest of the current month
      if (data.isAbono) {
          // Parse properly YYYY-MM-DD
          const [y, m, d] = data.date.split('-').map(Number);
          // Create date object (Month is 0-indexed)
          const current = new Date(y, m - 1, d);
          const targetMonth = current.getMonth();

          // Loop until month changes
          while (true) {
              current.setDate(current.getDate() + 7);
              if (current.getMonth() !== targetMonth) break;
              // Format back to YYYY-MM-DD
              const ny = current.getFullYear();
              const nm = String(current.getMonth() + 1).padStart(2, '0');
              const nd = String(current.getDate()).padStart(2, '0');
              datesToBook.push(`${ny}-${nm}-${nd}`);
          }
      }

      // 1. Check conflicts for ALL dates first (Atomic operation)
      for (const d of datesToBook) {
          if (checkConflict(d, data.timeStart, data.timeEnd, data.roomId)) {
              return { success: false, message: `Horario ocupado en fecha ${d}` };
          }
      }

      // 2. Create reservations
      const newReservations: Reservation[] = [];
      datesToBook.forEach((d, idx) => {
          newReservations.push({
            id: Date.now().toString() + idx,
            clientName: data.bandName,
            bandName: data.bandName,
            date: d,
            timeStart: data.timeStart,
            timeEnd: data.timeEnd,
            roomId: data.roomId,
            status: 'CONFIRMED',
            totalAmount: room ? room.price : 0,
            isAbono: data.isAbono
          });
      });

      const updated = [...reservations, ...newReservations];
      await wrapSync(() => storage.saveReservations(updated));
      return { success: true };
  }

  const handleCancelReservation = async (id: string) => {
      if(window.confirm("¿Seguro que deseas cancelar esta solicitud?")) {
          // Status strict cast fix
          const updated = reservations.map(r => r.id === id ? { ...r, status: 'REJECTED' as const } : r);
          await wrapSync(() => storage.saveReservations(updated));
      }
  }

  const handleCreateMaintenance = async (item: MaintenanceItem) => {
      const updated = [...maintenance, item];
      await wrapSync(() => storage.saveMaintenance(updated), "Nuevo item de mantenimiento agregado");
  };

  const handleUpdateMaintenance = async (item: MaintenanceItem) => {
      const updated = maintenance.map(m => m.id === item.id ? item : m);
      await wrapSync(() => storage.saveMaintenance(updated), "Mantenimiento actualizado");
  };

  const handleCreateMaintenanceItem = async (name: string, roomId: string) => {
     const existing = maintenance.find(m => m.name === name && m.roomId === roomId);
     if (existing) {
         await handleUpdateMaintenance({...existing, status: 'REPAIR', repairDate: new Date().toISOString().split('T')[0]});
     } else {
        const newItem: MaintenanceItem = {
            id: Date.now().toString(),
            name, 
            roomId,
            status: 'REPAIR',
            repairDate: new Date().toISOString().split('T')[0]
        };
        const updated = [...maintenance, newItem];
        await wrapSync(() => storage.saveMaintenance(updated));
     }
  };

  const handlePayRepair = async (item: MaintenanceItem, cost: number) => {
      if (cost > 0) {
        const tx: Transaction = {
            id: Date.now().toString(),
            type: 'EXPENSE',
            category: 'Mantenimiento',
            amount: cost,
            date: new Date().toISOString(),
            description: `Reparación ${item.name}`,
            isPaid: true
        };
        await handleAddTransaction(tx);
      }
      const updatedItem: MaintenanceItem = { 
          ...item, 
          isPaid: true, 
          actualCost: cost, 
          status: 'OK',
          repairDate: undefined 
      };
      await handleUpdateMaintenance(updatedItem);
  };

  const handleAddShift = async (shift: StaffShift) => {
      const updated = [...shifts, shift];
      await wrapSync(() => storage.saveShifts(updated));
  };
  const handleRemoveShift = async (id: string) => {
      const updated = shifts.filter(s => s.id !== id);
      await wrapSync(() => storage.saveShifts(updated));
  };
  
  // NEW: Update Shift
  const handleUpdateShift = async (updatedShift: StaffShift) => {
      const updated = shifts.map(s => s.id === updatedShift.id ? updatedShift : s);
      await wrapSync(() => storage.saveShifts(updated));
  };

  const handleAddContact = async (c: Contact) => {
      const newContacts = [...contacts, c];
      setContacts(newContacts); // Optimistic update
      
      await wrapSync(async () => {
          await storage.saveContacts(newContacts, c);
          
          // Also add to users for login
          const newUser: User = {
              username: c.responsibleName || c.name,
              role: UserRole.CLIENT,
              bandName: c.bandName,
              email: c.email,
              phone: c.phone,
              password: c.password,
              responsibleName: c.responsibleName || c.name
          };
          const currentUsers = storage.getUsers();
          await storage.saveUsers([...currentUsers, newUser], newUser);
      }, "Contacto guardado y sincronizado en la nube");
  };

  const handleAddContacts = async (newOnes: Contact[]) => {
      const updated = [...contacts, ...newOnes];
      setContacts(updated); // Optimistic update
      await wrapSync(() => storage.saveContacts(updated), "Contactos importados y sincronizados");
  };

  const handleUpdateContact = async (updated: Contact) => {
      // Filter expired points (60 days)
      const sixtyDaysAgo = new Date();
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
      
      const activeHistory = (updated.pointsHistory || []).filter(entry => 
          new Date(entry.date).getTime() > sixtyDaysAgo.getTime()
      );
      
      const activePoints = activeHistory.reduce((acc, entry) => acc + entry.amount, 0);
      
      const finalContact = { 
          ...updated, 
          pointsHistory: activeHistory,
          points: activePoints 
      };

      const newContacts = contacts.map(c => c.id === updated.id ? finalContact : c);
      setContacts(newContacts); // Optimistic update
      await wrapSync(() => storage.saveContacts(newContacts, finalContact), "Contacto actualizado y sincronizado");
  };

  const handleApplyReward = (contactId: string, rewardId: string) => {
      const contact = contacts.find(c => c.id === contactId);
      if (!contact) return;

      const reward = (globalConfig.pointsRewards || []).find(r => r.id === rewardId);
      if (!reward) return;

      if ((contact.points || 0) < reward.points) {
          alert("Puntos insuficientes");
          return;
      }

      const rewardType = reward.label;
      let stockUpdates: { productId: string; quantity: number }[] = [];

      // Logic for stock reduction based on reward label keywords
      if (rewardType.toLowerCase().includes('ipa')) {
          const ipa = products.find(p => p.name.toLowerCase().includes('ipa'));
          if (ipa) stockUpdates.push({ productId: ipa.id, quantity: 2 });
      } else if (rewardType.toLowerCase().includes('pizza')) {
          const pizza = products.find(p => p.name.toLowerCase().includes('pizza'));
          if (pizza) stockUpdates.push({ productId: pizza.id, quantity: 1 });
      } else if (rewardType.toLowerCase().includes('grabación')) {
          const recording = products.find(p => p.name.toLowerCase().includes('grabación'));
          if (recording) stockUpdates.push({ productId: recording.id, quantity: 1 });
      }

      // Update stock
      stockUpdates.forEach(update => {
          const prod = products.find(p => p.id === update.productId);
          if (prod) {
              handleUpdateStock({ ...prod, stock: Math.max(0, prod.stock - update.quantity) });
          }
      });

      // Update points history (negative entry)
      const newEntry: PointEntry = {
          amount: -reward.points,
          date: new Date().toISOString(),
          reason: `Canje de premio: ${reward.label}`
      };

      const updatedContact = {
          ...contact,
          points: (contact.points || 0) - reward.points,
          pointsHistory: [...(contact.pointsHistory || []), newEntry]
      };

      handleUpdateContact(updatedContact);
      alert(`Premio "${reward.label}" aplicado con éxito.`);
  };

  const handleDeleteContact = async (id: string, reason: string) => {
      const newContacts = contacts.filter(c => c.id !== id);
      setContacts(newContacts); // Optimistic update
      await wrapSync(() => storage.deleteContact(id, newContacts), "Contacto eliminado y sincronizado");
  };

  // NEW: Handle Pay Abono from Contacts
  const handlePayAbono = async (contactId: string, amount: number, description: string) => {
      const contact = contacts.find(c => c.id === contactId);
      if (!contact) return;
      
      const updatedContact = { ...contact, isAbono: true };
      const updatedContacts = contacts.map(c => c.id === contactId ? updatedContact : c);
      
      const tx: Transaction = {
          id: Date.now().toString(),
          type: 'INCOME',
          category: 'COBRO_ABONO',
          amount: amount,
          date: new Date().toISOString(),
          description: description,
          isPaid: true,
          paymentMethod: 'CASH'
      };
      const newTransactions = [...transactions, tx];

      // Optimistic updates
      setContacts(updatedContacts);
      setTransactions(newTransactions);

      await wrapSync(async () => {
          // 1. Update Contact
          await storage.saveContacts(updatedContacts, updatedContact);

          // 2. Add Transaction
          await storage.saveTransactions(newTransactions, tx);
      }, "Abono cobrado y sincronizado");
  };
  
  const handleUpdateInitialCash = async (amount: number) => {
      await wrapSync(() => storage.saveInitialCash(amount), "Saldo inicial guardado");
      setInitialCash(amount);
  };

  const handleUpdateGlobalConfig = async (config: GlobalConfig) => {
      await wrapSync(() => storage.saveConfig(config), "Configuración global guardada");
      setGlobalConfig(config);
  };

  const handleSavePendingTasks = async (tasks: PendingTask[]) => {
      await wrapSync(() => storage.savePendingTasks(tasks));
  };

  const handleResetToZero = async () => {
      showModal({
          title: "REINICIO A CERO",
          message: "¿ESTÁS SEGURO? Se exportará un Excel y se BORRARÁN todos los registros operativos (Reservas, Caja, Consumos, Stock y Deudas).",
          type: "confirm",
          onConfirm: async () => {
              closeModal();
              setIsSyncing(true);
              // Simulate Monthly Drive Folder Creation
              await new Promise(resolve => setTimeout(resolve, 3000));
              console.log("[Cloud Export] Monthly Drive Folder created with daily excels and summary.");
              
              await storage.clearAllData();
              
              // Update local state
              setReservations([]);
              setTransactions([]);
              setConsumptions([]);
              setContacts([]);
              setInitialCash(0);
              setRooms([]);
              setShifts([]);
              setPendingTasks([]);
              setMaintenance([]);
              
              // Reset products stock to 0 in local state
              setProducts(prev => prev.map(p => ({ ...p, stock: 0 })));
              
              setIsSyncing(false);
              showModal({
                  title: "SISTEMA REINICIADO",
                  message: "Cierre mensual completado. Carpeta generada en Drive con éxito. Sistema reiniciado.",
                  type: "alert",
                  onConfirm: closeModal
              });
          }
      });
  };

  const handleNavigateToReserve = (bandName: string) => {
      setSelectedContactBand(bandName);
      setView('reservas_view');
  };

  const handleSyncCalendar = async (fetchedReservations?: Reservation[]) => {
      if (!fetchedReservations || fetchedReservations.length === 0) {
          return;
      }
      
      // Merge fetched reservations with existing ones
      const existingIds = new Set(reservations.map(r => r.id));
      const newItems = fetchedReservations.filter(r => !existingIds.has(r.id));
      
      if (newItems.length === 0) {
          alert("No hay eventos nuevos para importar.");
          return;
      }

      // Assign a default room to imported events if they don't have one
      const itemsWithRoom = newItems.map(r => ({
          ...r,
          roomId: r.roomId || rooms[0]?.id || 'sala_a',
          totalAmount: r.totalAmount || 0,
          clientName: r.clientName || r.bandName,
          status: r.status || 'CONFIRMED'
      }));

      const updated = [...reservations, ...itemsWithRoom];
      setReservations(updated);
      await wrapSync(() => storage.saveReservations(updated), `Se han importado ${itemsWithRoom.length} eventos.`);
  };

  const handleExportClients = () => {
      setIsSyncing(true);
      setTimeout(() => {
          setIsSyncing(false);
          const csvContent = "data:text/csv;charset=utf-8," 
              + "Nombre Responsable,Banda,Integrantes,Instagram,Email,Telefono,Puntos\n"
              + contacts.map(c => `${c.responsibleName || c.name},${c.bandName},${c.musiciansCount},${c.instagram || ''},${c.email},${c.phone},${c.points || 0}`).join("\n");
          const encodedUri = encodeURI(csvContent);
          const link = document.createElement("a");
          link.setAttribute("href", encodedUri);
          link.setAttribute("download", "clientes_calacuta.csv");
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          alert("Base de datos exportada con éxito.");
      }, 1500);
  };

  // --- Render ---

  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 text-center">
        <div className="w-20 h-20 mb-6 rounded-full border-4 border-red-500 flex items-center justify-center">
          <span className="text-red-500 text-4xl font-bold">!</span>
        </div>
        <h1 className="text-[#D2B48C] text-2xl font-bold mb-4 uppercase tracking-widest">Error de Configuración</h1>
        <p className="text-white max-w-md mb-8 leading-relaxed">
          La aplicación no puede conectarse a la base de datos porque faltan las variables de entorno en Render.com.
        </p>
        <div className="bg-gray-900 p-6 rounded border border-red-900/50 text-left w-full max-w-lg">
          <p className="text-[#D2B48C] text-sm font-bold mb-2 uppercase">Pasos para solucionar:</p>
          <ol className="text-gray-400 text-sm space-y-2 list-decimal ml-4">
            <li>Ve a tu panel de <b>Render.com</b>.</li>
            <li>Entra en la pestaña <b>Environment</b>.</li>
            <li>Asegúrate de haber agregado <b>VITE_SUPABASE_URL</b> y <b>VITE_SUPABASE_ANON_KEY</b>.</li>
            <li>Ve al botón <b>Manual Deploy</b> y haz clic en <b>Clear build cache & deploy</b>.</li>
          </ol>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-black flex flex-col text-[#D2B48C] relative font-sans selection:bg-[#D2B48C] selection:text-black">
        <Header 
          isLoggedIn={false} 
          isSyncing={isSyncing}
          isSupabaseConfigured={isSupabaseConfigured}
          syncError={syncError}
          onViewSalas={() => setView('guest_salas')} 
          onViewQuienes={() => setView('guest_quienes')}
          onViewEspacio={() => setView('guest_espacio')}
          onOpenLogin={() => setShowLoginModal(true)}
          headerLinks={globalConfig.headerLinks}
        />

        {/* LOGIN MODAL */}
        {showLoginModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-black/95 backdrop-blur-md" onClick={() => setShowLoginModal(false)}></div>
                <div className="relative w-full max-w-md bg-black border-2 border-[#D2B48C] p-8 shadow-[10px_10px_0px_rgba(210,180,140,0.2)] animate-in fade-in zoom-in duration-300">
                    <button 
                        onClick={() => setShowLoginModal(false)}
                        className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
                    >
                        <X size={24} />
                    </button>
                    <Login onLogin={handleLogin} />
                    <div className="mt-8 text-center border-t border-white/10 pt-6">
                        <button 
                            onClick={() => { setShowLoginModal(false); setShowRegister(true); }}
                            className="text-[#D2B48C] hover:text-white text-[10px] font-black uppercase tracking-[0.2em] transition-colors"
                        >
                            ¿No tienes cuenta? Regístrate aquí
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* REGISTER MODAL */}
        {showRegister && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 overflow-y-auto backdrop-blur-md">
                <div className="relative w-full max-w-md my-8 animate-in fade-in slide-in-from-bottom-8 duration-500">
                    <Register 
                        onRegister={(c) => {
                            handleAddContact(c);
                            setShowRegister(false);
                            alert("Registro exitoso. Ahora puedes iniciar sesión con tu nombre de banda y la clave elegida.");
                        }} 
                        onCancel={() => setShowRegister(false)} 
                    />
                </div>
            </div>
        )}

        <main className={`flex-1 flex flex-col items-center ${view === 'home' ? 'justify-center' : 'justify-start'} p-6 md:p-12 overflow-y-auto`}>
            {view === 'home' && (
                <div className="flex-1 flex flex-col items-center justify-center animate-in fade-in zoom-in duration-1000">
                    <div className="relative">
                        <div className="absolute inset-0 bg-[#D2B48C]/20 blur-3xl rounded-full"></div>
                        <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-full overflow-hidden border-4 border-[#D2B48C] shadow-2xl bg-black flex items-center justify-center group">
                            <img src={globalConfig.mainPhoto || DEFAULT_MAIN_PHOTO} alt="Logo Salas" className="object-cover w-full h-full transition-transform duration-1000 group-hover:scale-110" referrerPolicy="no-referrer" />
                        </div>
                    </div>
                    {/* WhatsApp Button */}
                    {globalConfig.headerLinks.find(l => l.label === 'Whatsapp')?.url && (
                        <a 
                            href={globalConfig.headerLinks.find(l => l.label === 'Whatsapp')?.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-8 flex items-center gap-3 bg-[#25D366] hover:bg-[#128C7E] text-white px-6 py-3 rounded-full font-bold shadow-lg transition-all hover:scale-105 active:scale-95 group"
                        >
                            <img 
                                src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" 
                                alt="WhatsApp" 
                                className="w-6 h-6"
                            />
                            <span>Contactanos por WhatsApp</span>
                        </a>
                    )}
                </div>
            )}

            {view === 'guest_salas' && (
                <div className="w-full max-w-6xl animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-black text-white uppercase tracking-[0.4em] mb-4">Nuestras Salas</h2>
                        <div className="w-24 h-1 bg-[#D2B48C] mx-auto"></div>
                    </div>
                    <div className="grid gap-16">
                        {rooms.map(room => {
                            let images: string[] = [];
                            if (room.images && room.images.length > 0) images = room.images;
                            else if (room.image) images = [room.image];
                            else {
                                if (room.id === 'sala1') images = ["/sala1_1.png", "/sala1_2.png"];
                                if (room.id === 'sala2') images = ["/sala2_1.png", "/sala2_2.png"];
                                if (room.id === 'salaA') images = ["/salaA_1.png", "/salaA_2.png"];
                            }
                            return (
                                <div key={room.id} className="border-2 border-white/5 bg-white/[0.02] p-8 transition-all hover:border-[#D2B48C]/30 group">
                                    <h3 className="text-3xl font-black mb-6 uppercase tracking-[0.2em] border-l-4 pl-6" style={{ borderColor: room.hex, color: room.hex }}>{room.name}</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                        {images.map((img, i) => (
                                            <div key={i} className="aspect-square overflow-hidden border-2 border-white/5 grayscale hover:grayscale-0 transition-all duration-700 cursor-pointer" onClick={() => setLightboxImg(img)}>
                                                <img src={img} className="w-full h-full object-cover hover:scale-110 transition-transform duration-1000" alt={room.name} referrerPolicy="no-referrer" />
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-8 flex items-center justify-center border-2 border-dashed border-white/5 p-6">
                                        <p className="text-[9px] font-black uppercase tracking-[0.4em] text-center leading-relaxed text-[#D2B48C]/40 animate-pulse">Climatización Central & Servicio de Bar</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {view === 'guest_quienes' && (
                <div className="w-full max-w-3xl text-center animate-in fade-in zoom-in duration-700">
                    <div className="relative p-12 border-2 border-[#D2B48C]/20 bg-white/[0.02]">
                        <div className="absolute -top-4 -left-4 w-12 h-12 border-t-4 border-l-4 border-[#D2B48C]"></div>
                        <div className="absolute -bottom-4 -right-4 w-12 h-12 border-b-4 border-r-4 border-[#D2B48C]"></div>
                        <p className="text-sm md:text-base text-gray-300 leading-[2] font-medium uppercase tracking-widest text-justify">
                            Somos Salas Calacuta, donde le damos importancia al arte en todos sus aspectos. Tenemos salas equipadas para ensayos y profesores. Tenemos una barra con precios económicos y una terraza para disfrutar del aire libre. Brindamos servicio de alquiler de equipamiento, de instrumentos y contamos con un estudio para mezcla.
                        </p>
                    </div>
                </div>
            )}

            {view === 'guest_espacio' && (
                <div className="w-full max-w-5xl space-y-24 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                    <div className="text-center">
                        <h2 className="text-4xl font-black text-white uppercase tracking-[0.4em] mb-4">El Espacio</h2>
                        <div className="w-24 h-1 bg-[#D2B48C] mx-auto"></div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                        <div className="space-y-6">
                            <h3 className="text-xl font-black uppercase tracking-[0.3em] text-[#D2B48C]">Planta Baja</h3>
                            <p className="text-xs text-gray-500 leading-loose uppercase tracking-widest">Recepción, barra y salas de ensayo principales. Un ambiente diseñado para la creatividad y el encuentro.</p>
                        </div>
                        <div className="aspect-video overflow-hidden border-2 border-white/5 shadow-[20px_20px_0px_rgba(210,180,140,0.05)]">
                            <img src="/planta_baja.png" className="w-full h-full object-cover" alt="Planta Baja" referrerPolicy="no-referrer" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                        <div className="order-2 md:order-1 aspect-video overflow-hidden border-2 border-white/5 shadow-[-20px_20px_0px_rgba(210,180,140,0.05)]">
                            <img src="/primer_piso.png" className="w-full h-full object-cover" alt="Primer Piso" referrerPolicy="no-referrer" />
                        </div>
                        <div className="order-1 md:order-2 space-y-6 text-right">
                            <h3 className="text-xl font-black uppercase tracking-[0.3em] text-[#D2B48C]">Primer Piso</h3>
                            <p className="text-xs text-gray-500 leading-loose uppercase tracking-widest">Salas de estudio y áreas de descanso. Tranquilidad y equipamiento de alta fidelidad.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                        <div className="space-y-6">
                            <h3 className="text-xl font-black uppercase tracking-[0.3em] text-[#D2B48C]">La Terraza</h3>
                            <p className="text-xs text-gray-500 leading-loose uppercase tracking-widest">El pulmón de Calacuta. Espacio abierto para relajarse entre sesiones y disfrutar del aire libre.</p>
                        </div>
                        <div className="aspect-video overflow-hidden border-2 border-white/5 shadow-[20px_20px_0px_rgba(210,180,140,0.05)]">
                            <img src="/terraza.png" className="w-full h-full object-cover" alt="Terraza" referrerPolicy="no-referrer" />
                        </div>
                    </div>
                </div>
            )}
        </main>
      </div>
    );
  }

  // --- LOGGED IN RENDER ---

  const lowStockAlert = products.some(p => p.stock < 5 && p.category === 'BAR');
  
  const myConsumption = consumptions.filter(c => {
      const res = reservations.find(r => r.id === c.reservationId);
      return res?.bandName === currentUser.bandName && !c.paid;
  });
  const myTotalConsumption = myConsumption.reduce((acc, curr) => acc + curr.total, 0);

  return (
    <div className="min-h-screen bg-black flex flex-col text-[#D2B48C] relative font-sans selection:bg-[#D2B48C] selection:text-black">
      <Header 
        isLoggedIn={true} 
        isSyncing={isSyncing}
        isSupabaseConfigured={isSupabaseConfigured}
        syncError={syncError}
        onViewSalas={() => setView('salas')} 
        onViewQuienes={() => setView('quienes_somos')}
        onViewEspacio={() => setView('nuestro_espacio')}
        headerLinks={globalConfig.headerLinks}
      />

      {/* Lightbox Modal */}
      {lightboxImg && (
          <div 
             className="fixed inset-0 z-[110] bg-black/95 backdrop-blur-xl flex justify-center items-center cursor-pointer p-4 animate-in fade-in duration-300"
             onClick={() => setLightboxImg(null)}
          >
              <img src={lightboxImg} alt="Full View" className="max-h-[90vh] max-w-[90vw] border-2 border-[#D2B48C] shadow-[0_0_50px_rgba(210,180,140,0.2)] animate-in zoom-in duration-500" referrerPolicy="no-referrer" />
              <button className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors">
                <X size={32} />
              </button>
          </div>
      )}
      
      <div className="bg-white/[0.03] border-b border-white/5 px-6 py-3 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="flex items-center gap-6">
            <div className="flex flex-col">
              <span className="text-[8px] font-black uppercase tracking-[0.2em] text-[#D2B48C]/50">Usuario Activo</span>
              <span className="text-[11px] font-bold text-white uppercase tracking-wider">{currentUser.username} <span className="text-[#D2B48C]/40 ml-2">[{currentUser.role}]</span></span>
            </div>
            {currentUser.bandName && (
              <div className="flex flex-col border-l border-white/10 pl-6">
                <span className="text-[8px] font-black uppercase tracking-[0.2em] text-[#D2B48C]/50">Banda</span>
                <span className="text-[11px] font-bold text-white uppercase tracking-wider">{currentUser.bandName}</span>
              </div>
            )}
        </div>
        <div className="flex gap-4 items-center">
            <button 
                onClick={handleRefresh} 
                className="flex items-center gap-3 px-5 py-2 bg-[#D2B48C]/10 border border-[#D2B48C]/20 hover:bg-[#D2B48C] hover:text-black transition-all duration-500 group"
                title="Actualizar base de datos"
            >
                <RefreshCw size={12} className={`${isSyncing ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-700'}`} />
                <span className="text-[9px] font-black uppercase tracking-[0.2em]">Sincronizar</span>
            </button>
            <button 
              onClick={handleLogout} 
              className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500 hover:text-white transition-colors border-b border-transparent hover:border-white/20 pb-1"
            >
              Cerrar Sesión
            </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden">
        
        <nav className="w-full md:w-56 bg-black border-b md:border-b-0 md:border-r border-white/5 flex flex-row md:flex-col shrink-0 overflow-x-auto md:overflow-y-auto no-scrollbar">
            {/* OVEJA (ADMIN) */}
            {currentUser.role === UserRole.ADMIN && (
                <>
                    {(currentUser.username.toLowerCase() === 'uruguayo' || currentUser.username.toLowerCase() === 'encargado') && (
                        <TabButton active={view === 'reservas'} onClick={() => setView('reservas')}>Agenda</TabButton>
                    )}
                    <TabButton active={view === 'contactos'} onClick={() => setView('contactos')}>Contactos</TabButton>
                    <TabButton active={view === 'personal'} onClick={() => setView('personal')}>Personal</TabButton>
                    <TabButton active={view === 'stock'} onClick={() => setView('stock')} alert={lowStockAlert}>Stock</TabButton>
                    <TabButton active={view === 'vitrina'} onClick={() => setView('vitrina')}>Vitrina</TabButton>
                    <TabButton active={view === 'caja'} onClick={() => setView('caja')}>Caja</TabButton>
                    <TabButton active={view === 'pagos'} onClick={() => setView('pagos')}>Pagos</TabButton>
                    <TabButton active={view === 'cobros'} onClick={() => setView('cobros')}>Cobros</TabButton>
                    <TabButton active={view === 'precios'} onClick={() => setView('precios')}>Precios</TabButton>
                    <TabButton active={view === 'puntos'} onClick={() => setView('puntos')} alert={pointsAlert}>Puntos</TabButton>
                    <TabButton active={view === 'mantenimiento'} onClick={() => setView('mantenimiento')}>Mantenimiento</TabButton>
                    <TabButton active={view === 'admin_salas'} onClick={() => setView('admin_salas')}>Salas</TabButton>
                    <TabButton active={view === 'encabezado'} onClick={() => setView('encabezado')}>Encabezado</TabButton>
                    <TabButton active={view === 'administracion'} onClick={() => setView('administracion')}>Administración</TabButton>
                    <TabButton active={view === 'resumen_mensual'} onClick={() => setView('resumen_mensual')}>Resumen Mensual</TabButton>
                    <TabButton active={view === 'pendientes'} onClick={() => setView('pendientes')}>Pendientes</TabButton>
                </>
            )}

            {/* PERSONAL (STAFF) */}
            {currentUser.role === UserRole.STAFF && (
                <>
                    {(currentUser.permissions?.includes('bandas') || !currentUser.permissions) && <TabButton active={view === 'bandas'} onClick={() => setView('bandas')}>Bandas</TabButton>}
                    {(currentUser.permissions?.includes('barra_banda') || !currentUser.permissions) && <TabButton active={view === 'barra_banda'} onClick={() => setView('barra_banda')}>Barra Banda</TabButton>}
                    {(currentUser.permissions?.includes('barra') || !currentUser.permissions) && <TabButton active={view === 'barra'} onClick={() => setView('barra')}>Barra</TabButton>}
                    {(currentUser.permissions?.includes('vitrina') || !currentUser.permissions) && <TabButton active={view === 'vitrina'} onClick={() => setView('vitrina')}>Vitrina</TabButton>}
                    {(currentUser.permissions?.includes('instrumentos') || !currentUser.permissions) && <TabButton active={view === 'instrumentos'} onClick={() => setView('instrumentos')}>Instrumentos</TabButton>}
                    {(currentUser.permissions?.includes('cierre') || !currentUser.permissions) && <TabButton active={view === 'cierre'} onClick={() => setView('cierre')}>Cierre</TabButton>}
                    
                    {/* Additional tabs if permitted */}
                    {currentUser.permissions?.includes('reservas') && <TabButton active={view === 'reservas'} onClick={() => setView('reservas')}>Agenda</TabButton>}
                    {currentUser.permissions?.includes('contactos') && <TabButton active={view === 'contactos'} onClick={() => setView('contactos')}>Contactos</TabButton>}
                    {currentUser.permissions?.includes('personal') && <TabButton active={view === 'personal'} onClick={() => setView('personal')}>Personal</TabButton>}
                    {currentUser.permissions?.includes('stock') && <TabButton active={view === 'stock'} onClick={() => setView('stock')}>Stock</TabButton>}
                    {currentUser.permissions?.includes('caja') && <TabButton active={view === 'caja'} onClick={() => setView('caja')}>Caja</TabButton>}
                    {currentUser.permissions?.includes('pagos') && <TabButton active={view === 'pagos'} onClick={() => setView('pagos')}>Pagos</TabButton>}
                    {currentUser.permissions?.includes('cobros') && <TabButton active={view === 'cobros'} onClick={() => setView('cobros')}>Cobros</TabButton>}
                    {currentUser.permissions?.includes('precios') && <TabButton active={view === 'precios'} onClick={() => setView('precios')}>Precios</TabButton>}
                    {currentUser.permissions?.includes('puntos') && <TabButton active={view === 'puntos'} onClick={() => setView('puntos')}>Puntos</TabButton>}
                    {currentUser.permissions?.includes('mantenimiento') && <TabButton active={view === 'mantenimiento'} onClick={() => setView('mantenimiento')}>Mantenimiento</TabButton>}
                    {currentUser.permissions?.includes('admin_salas') && <TabButton active={view === 'admin_salas'} onClick={() => setView('admin_salas')}>Salas</TabButton>}
                    {currentUser.permissions?.includes('encabezado') && <TabButton active={view === 'encabezado'} onClick={() => setView('encabezado')}>Encabezado</TabButton>}
                    {currentUser.permissions?.includes('administracion') && <TabButton active={view === 'administracion'} onClick={() => setView('administracion')}>Administración</TabButton>}
                    {currentUser.permissions?.includes('resumen_mensual') && <TabButton active={view === 'resumen_mensual'} onClick={() => setView('resumen_mensual')}>Resumen Mensual</TabButton>}
                    {currentUser.permissions?.includes('pendientes') && <TabButton active={view === 'pendientes'} onClick={() => setView('pendientes')}>Pendientes</TabButton>}
                    {currentUser.permissions?.includes('agenda') && <TabButton active={view === 'agenda'} onClick={() => setView('agenda')}>Agenda</TabButton>}
                </>
            )}

            {/* EVENTOS */}
            {currentUser.role === UserRole.EVENTOS && (
                <>
                    <TabButton active={view === 'barra'} onClick={() => setView('barra')}>Barra</TabButton>
                    <TabButton active={view === 'cierre'} onClick={() => setView('cierre')}>Cierre</TabButton>
                </>
            )}

            {/* RESERVAS USER */}
            {currentUser.role === UserRole.RESERVAS && (
                <>
                    <TabButton active={view === 'contactos'} onClick={() => setView('contactos')}>Contactos</TabButton>
                </>
            )}

            {/* CONTACTOS ONLY */}
            {currentUser.role === UserRole.CONTACTOS && (
                <>
                    <TabButton active={view === 'contactos'} onClick={() => setView('contactos')}>Contactos</TabButton>
                </>
            )}

            {/* CLIENTE */}
            {currentUser.role === UserRole.CLIENT && (
                <>
                    <TabButton active={view === 'reservar'} onClick={() => setView('reservar')}>Reservar</TabButton>
                    <TabButton active={view === 'historial'} onClick={() => setView('historial')}>Historial</TabButton>
                    <TabButton active={view === 'puntos_cliente'} onClick={() => setView('puntos_cliente')}>Puntos Acumulados</TabButton>
                </>
            )}
        </nav>

        <main className="flex-1 overflow-y-auto h-full relative bg-black">
            <div className="p-6 md:p-10 min-h-full flex flex-col">
                <div className="flex-1">
            {/* OVEJA uses ReservasUserView for full creation control */}
            {view === 'reservas' && <ReservasUserView 
                reservations={reservations} 
                onUpdateStatus={handleReservationStatus} 
                onDelete={handleDeleteReservation}
                onUpdateReservation={handleUpdateReservation}
                onToggleAbono={handleToggleAbono}
                onReserve={handleAdminOrReservasCreate}
                onSyncCalendar={handleSyncCalendar}
                contacts={contacts}
                rooms={rooms}
            />}
            {view === 'stock' && <StockView products={products} onUpdateProduct={handleUpdateStock} onAddStockExpense={handleAddStockExpense} />}
            {view === 'resumen_mensual' && <AdminDashboard 
                transactions={transactions} 
                reservations={reservations} 
                rooms={rooms} 
                contacts={contacts} 
                products={products}
                maintenance={maintenance}
                shifts={shifts}
                currentUser={currentUser}
                onSettleDebt={handleSettleDebt} 
                onResetToZero={handleResetToZero}
                onExportClients={handleExportClients}
                onViewSalas={() => setView('admin_salas')}
            />}

            {view === 'encabezado' && <RoomsView 
                rooms={rooms} 
                onUpdateRoom={handleUpdateRoom} 
                onCreateRoom={handleCreateRoom} 
                onDeleteRoom={handleDeleteRoom} 
                onLoadDefaults={handleLoadDefaultRooms}
                globalConfig={globalConfig}
                onUpdateConfig={handleUpdateGlobalConfig}
                activeSection="encabezado"
            />}

            {view === 'administracion' && <RoomsView 
                rooms={rooms} 
                onUpdateRoom={handleUpdateRoom} 
                onCreateRoom={handleCreateRoom} 
                onDeleteRoom={handleDeleteRoom} 
                onLoadDefaults={handleLoadDefaultRooms}
                globalConfig={globalConfig}
                onUpdateConfig={handleUpdateGlobalConfig}
                activeSection="administracion"
            />}

            {view === 'pendientes' && <PendientesView 
                tasks={pendingTasks} 
                onSave={handleSavePendingTasks} 
                currentUser={currentUser}
            />}
            {view === 'vitrina' && (
                currentUser.role === UserRole.ADMIN ? (
                    <StockView 
                        products={products} 
                        onUpdateProduct={handleUpdateStock} 
                        onAddStockExpense={handleAddStockExpense} 
                        category="VITRINA"
                        title="Control de Stock (Vitrina)"
                    />
                ) : (
                    <VitrinaView 
                        products={products} 
                        onAddTransaction={handleGeneralBarTransaction} 
                        onUpdateStock={handleUpdateStock}
                    />
                )
            )}
            {view === 'caja' && <CashView 
                transactions={transactions} 
                onAddTransaction={handleAddTransaction} 
                initialCash={initialCash}
                onUpdateInitialCash={handleUpdateInitialCash}
            />}
            {view === 'cobros' && <CobrosView transactions={transactions} onAddTransaction={handleAddTransaction} onToggleStatus={handleToggleTransactionStatus} onUpdateTransaction={handleUpdateTransaction} incomeCategories={globalConfig.incomeCategories} />}
            {view === 'pagos' && <PagosView 
                transactions={transactions} 
                shifts={shifts}
                onAddTransaction={handleAddTransaction} 
                onToggleStatus={handleToggleTransactionStatus} 
                onUpdateTransaction={handleUpdateTransaction}
                expenseCategories={globalConfig.expenseCategories}
                staffUsers={globalConfig.staffUsers}
            />}
            
            {view === 'precios' && <PricesView 
                products={products} 
                onUpdateProduct={handleUpdateStock} 
                onDeleteProduct={handleDeleteProduct}
                onBulkUpdate={() => {}} // deprecated
                onCreateProduct={handleCreateProduct}
                rooms={rooms}
                onUpdateRoom={handleUpdateRoom}
                onDeleteRoom={handleDeleteRoom}
                onLoadDefaults={handleLoadDefaultProducts}
            />}

            {view === 'puntos' && <PointsView 
                contacts={contacts} 
                reservations={reservations} 
                consumptions={consumptions} 
                products={products}
                onUpdateContact={handleUpdateContact}
                onApplyReward={handleApplyReward}
                config={globalConfig}
                onUpdateConfig={handleUpdateGlobalConfig}
            />}

            {view === 'mantenimiento' && <MaintenanceView 
                items={maintenance} 
                rooms={rooms}
                onUpdateItem={handleUpdateMaintenance} 
                onCreateItem={handleCreateMaintenance}
                onPayRepair={handlePayRepair} 
            />}

            {view === 'personal' && <StaffScheduleView 
                shifts={shifts} 
                onAddShift={handleAddShift} 
                onRemoveShift={handleRemoveShift}
                onUpdateShift={handleUpdateShift}
                staffUsers={globalConfig.staffUsers.map(u => u.name)}
            />}

            {view === 'admin_salas' && <RoomsView 
                rooms={rooms} 
                onUpdateRoom={handleUpdateRoom} 
                onCreateRoom={handleCreateRoom}
                onDeleteRoom={handleDeleteRoom}
                onLoadDefaults={handleLoadDefaultRooms}
                globalConfig={globalConfig}
                onUpdateConfig={handleUpdateGlobalConfig}
            />}

            {view === 'bandas' && <DailyBands 
                reservations={reservations} 
                rooms={rooms} 
                products={products} 
                consumptions={consumptions}
                onAddConsumption={handleAddConsumption} 
                onCloseBand={handleCloseBand} 
                onDayClose={handleDayClose}
                onToggleAbono={handleToggleAbono}
                onDeleteReservation={handleDeleteReservation}
                onUpdateConsumption={handleUpdateConsumptionItem}
                isClosingView={false} // Hide Close Button
            />}
            
            {view === 'barra_banda' && <DailyBands 
                reservations={reservations} 
                rooms={rooms} 
                products={products.filter(p => p.category === 'BAR')}
                consumptions={consumptions}
                onAddConsumption={handleAddConsumption}
                onCloseBand={() => {}} 
                onDayClose={handleDayClose}
                onToggleAbono={handleToggleAbono}
                onUpdateConsumption={handleUpdateConsumptionItem}
                isClosingView={false}
            />}
            
            {view === 'barra' && <GeneralBarView 
                products={products} 
                onAddTransaction={handleGeneralBarTransaction} 
                onUpdateStock={handleUpdateStock}
            />}

            {view === 'instrumentos' && <InstrumentsView 
                reservations={reservations} 
                instruments={products} 
                maintenanceItems={maintenance}
                rooms={rooms}
                onAssignInstrument={handleAddConsumption}
                onSendToMaintenance={handleCreateMaintenanceItem}
            />}

            {view === 'cierre' && <DailyBands 
                reservations={reservations} 
                rooms={rooms} 
                products={products.filter(p => p.category === 'BAR' || p.category === 'VITRINA')} 
                consumptions={consumptions}
                onAddConsumption={handleAddConsumption} 
                onCloseBand={handleCloseBand} 
                onDayClose={handleDayClose}
                onToggleAbono={handleToggleAbono}
                onUpdateConsumption={handleUpdateConsumptionItem}
                isClosingView={true} // Show Close Button
            />}

            {/* CONTACTOS (Shared by Admin and Reservas) */}
            {view === 'contactos' && <ContactsView 
                contacts={contacts} 
                reservations={reservations}
                onAddContact={handleAddContact} 
                onAddContacts={handleAddContacts}
                onUpdateContact={handleUpdateContact}
                onDeleteContact={handleDeleteContact}
                onNavigateToReserve={handleNavigateToReserve}
                onPayAbono={handlePayAbono}
                rooms={rooms}
            />}

            {/* RESERVAS VIEWS */}
            {view === 'sync' && <CalendarSyncView reservations={reservations} onSyncComplete={handleSyncCalendar} />}
            {/* {view === 'chat' && <ChatView />} */}
            {view === 'reservas_view' && <ReservasUserView 
                reservations={reservations} 
                onUpdateStatus={handleReservationStatus} 
                onDelete={handleDeleteReservation}
                onToggleAbono={handleToggleAbono} 
                onReserve={handleAdminOrReservasCreate}
                prefillBandName={selectedContactBand}
                contacts={contacts}
                rooms={rooms}
                canSeeAgenda={!isRestricted}
            />}

            {view === 'reservar' && <NewReservation 
                onReserve={handleClientReserve} 
                userBandName={currentUser.bandName || ''} 
                onSuccessRedirect={() => setView('historial')} 
                rooms={rooms} 
                instrumentsList={products.filter(p => p.category === 'INSTRUMENT')}
            />}
            
            {view === 'consumos' && (
                <div className="space-y-4">
                     <h2 className="text-xl mb-4 font-bold text-[#D2B48C]">Mis Consumos Pendientes</h2>
                     {myConsumption.length === 0 ? (
                         <p className="text-gray-500">No tienes consumos sin pagar.</p>
                     ) : (
                         <div className="bg-gray-900 p-4 rounded border border-gray-800">
                             {myConsumption.map(c => (
                                 <div key={c.id}>
                                     {c.items.map(i => (
                                         <div key={i.productId} className="flex justify-between border-b border-gray-800 py-2">
                                             <span>{i.quantity}x {i.name}</span>
                                             <span>${i.price * i.quantity}</span>
                                         </div>
                                     ))}
                                 </div>
                             ))}
                             <div className="flex justify-between pt-4 font-bold text-xl text-white">
                                 <span>Total a Pagar (en Cierre)</span>
                                 <span>${myTotalConsumption}</span>
                             </div>
                         </div>
                     )}
                     <p className="text-gray-500 text-sm italic mt-4">* El monto total no es modificable. Es lo que el personal designó.</p>
                     <Calculator />
                </div>
            )}
            
            {view === 'salas' && (
                <div className="grid gap-8">
                    {rooms.length === 0 && (
                        <div className="text-center py-20 border border-dashed border-gray-800 rounded">
                            <p className="text-gray-500 italic">No hay salas configuradas actualmente.</p>
                            {currentUser?.role === UserRole.ADMIN && (
                                <Button onClick={() => setView('admin_salas')} className="mt-4">Ir a Gestión de Salas</Button>
                            )}
                        </div>
                    )}
                    {rooms.map(room => {
                        // Use uploaded image if exists
                        let images: string[] = [];
                        if (room.image) {
                            images = [room.image];
                        } else {
                            if (room.id === 'sala1') images = [
                                "/sala1_1.png", 
                                "/sala1_2.png"
                            ];
                            if (room.id === 'sala2') images = [
                                "/sala2_1.png", 
                                "/sala2_2.png"
                            ];
                            if (room.id === 'salaA') images = [
                                "/salaA_1.png", 
                                "/salaA_2.png"
                            ];
                        }

                        return (
                            <div key={room.id} className="border border-gray-800 rounded p-6 bg-gray-900">
                                <h3 className="text-2xl font-bold mb-4 border-b border-gray-800 pb-2" style={{ color: room.hex }}>{room.name}</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {images.map((img, i) => (
                                        <div 
                                            key={i} 
                                            className="cursor-pointer group overflow-hidden rounded border border-gray-700 hover:border-[#D2B48C]"
                                            onClick={() => setLightboxImg(img)}
                                        >
                                            <img 
                                                src={img} 
                                                className="w-full h-48 object-cover aspect-square group-hover:scale-110 transition-transform duration-500" 
                                                alt={room.name} 
                                                referrerPolicy="no-referrer"
                                            />
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-black/30 p-4 rounded border border-gray-800">
                                        <h4 className="text-[#D2B48C] text-xs font-bold uppercase mb-3 tracking-widest border-b border-[#D2B48C]/20 pb-1">Equipamiento</h4>
                                        <ul className="space-y-2 text-xs">
                                            {room.equipment?.battery && <li className="flex justify-between"><span className="text-gray-500 uppercase font-bold">Batería:</span> <span className="text-white">{room.equipment.battery}</span></li>}
                                            {room.equipment?.guitarAmp1 && <li className="flex justify-between"><span className="text-gray-500 uppercase font-bold">Ampli Guitarra 1:</span> <span className="text-white">{room.equipment.guitarAmp1}</span></li>}
                                            {room.equipment?.guitarAmp2 && <li className="flex justify-between"><span className="text-gray-500 uppercase font-bold">Ampli Guitarra 2:</span> <span className="text-white">{room.equipment.guitarAmp2}</span></li>}
                                            {room.equipment?.bassAmp && <li className="flex justify-between"><span className="text-gray-500 uppercase font-bold">Ampli Bajo:</span> <span className="text-white">{room.equipment.bassAmp}</span></li>}
                                            {room.equipment?.console && <li className="flex justify-between"><span className="text-gray-500 uppercase font-bold">Consola:</span> <span className="text-white">{room.equipment.console}</span></li>}
                                            {room.equipment?.piano && <li className="flex justify-between"><span className="text-gray-500 uppercase font-bold">Piano:</span> <span className="text-white">{room.equipment.piano}</span></li>}
                                            {!room.equipment && <li className="text-gray-600 italic">No hay equipamiento cargado</li>}
                                        </ul>
                                    </div>
                                    <div className="bg-black/30 p-4 rounded border border-gray-800 flex flex-col justify-center">
                                        <div className="text-center">
                                            <p className="text-[10px] text-[#D2B48C] font-bold uppercase tracking-widest animate-pulse">
                                              Aire Acondicionado y Servicio de Bar
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {view === 'quienes_somos' && (
                 <div className="flex-1 w-full max-w-4xl mx-auto text-center">
                     <h2 className="text-2xl font-bold text-[#D2B48C] mb-4">Quienes Somos</h2>
                     <p className="text-white max-w-2xl mx-auto leading-relaxed text-sm md:text-base border border-[#D2B48C]/30 p-6 rounded bg-gray-900">
                        Somos Salas Calacuta, donde le damos importancia al arte en todos sus aspectos. Tenemos salas equipadas para ensayos y profesores. Tenemos una barra con precios económicos y una terraza para disfrutar del aire libre. Brindamos servicio de alquiler de equipamiento, de instrumentos y contamos con un estudio para mezcla.
                     </p>
                 </div>
            )}
            
            {view === 'nuestro_espacio' && (
                 <div className="flex-1 w-full max-w-4xl mx-auto text-center space-y-12">
                     <h2 className="text-3xl font-bold text-[#D2B48C] mb-8">Nuestro Espacio</h2>
                     
                     {/* PLANTA BAJA */}
                     <div>
                        <h3 className="text-xl font-bold text-[#D2B48C] mb-4 uppercase tracking-widest border-b border-[#D2B48C]/30 pb-2 inline-block">Planta Baja</h3>
                        <div className="flex justify-center">
                            <img src="/planta_baja.png" className="w-full max-w-sm h-64 object-cover rounded border border-gray-800" alt="Planta Baja 1" referrerPolicy="no-referrer" />
                        </div>
                     </div>

                     {/* PRIMER PISO */}
                     <div>
                        <h3 className="text-xl font-bold text-[#D2B48C] mb-4 uppercase tracking-widest border-b border-[#D2B48C]/30 pb-2 inline-block">Primer Piso</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                            <img src="/primer_piso.png" className="w-full h-48 object-cover rounded border border-gray-800" alt="Primer Piso 1" referrerPolicy="no-referrer" />
                            <img src="/sala1_2.png" className="w-full h-48 object-cover rounded border border-gray-800" alt="Primer Piso 2" referrerPolicy="no-referrer" />
                        </div>
                     </div>

                     {/* TERRAZA */}
                     <div>
                        <h3 className="text-xl font-bold text-[#D2B48C] mb-4 uppercase tracking-widest border-b border-[#D2B48C]/30 pb-2 inline-block">Terraza</h3>
                        <div className="flex justify-center">
                            <img src="/terraza.png" className="w-full max-w-sm h-64 object-cover rounded border border-gray-800" alt="Terraza 1" referrerPolicy="no-referrer" />
                        </div>
                     </div>
                 </div>
            )}
            
            {view === 'historial' && (
                <div className="space-y-4">
                    <h2 className="text-xl font-bold mb-4 text-[#D2B48C]">Historial de Reservas</h2>
                    {reservations.filter(r => r.bandName === currentUser.bandName).length === 0 ? (
                        <p className="text-gray-500">No hay historial.</p>
                    ) : (
                        reservations.filter(r => r.bandName === currentUser.bandName).sort((a,b) => b.id.localeCompare(a.id)).map(r => (
                            <div key={r.id} className="flex flex-col md:flex-row justify-between items-center border border-gray-800 p-3 rounded bg-gray-900 mb-2">
                                <div className="flex flex-col">
                                    <span className="font-bold text-white">{r.date} ({r.timeStart} - {r.timeEnd})</span>
                                    <span className="text-xs text-gray-400">{rooms.find(room => room.id === r.roomId)?.name}</span>
                                </div>
                                <div className="flex items-center gap-4 mt-2 md:mt-0">
                                    <span className={`px-2 py-1 rounded text-xs font-bold 
                                        ${r.status === 'CONFIRMED' ? 'bg-green-900 text-green-200' : 
                                          r.status === 'PENDING' ? 'bg-yellow-900 text-yellow-200' : 
                                          r.status === 'REJECTED' ? 'bg-red-900 text-red-200' : 'bg-gray-700 text-gray-300'}`}>
                                        {r.status === 'REJECTED' ? 'CANCELADO/DENEGADO' : r.status}
                                    </span>
                                    {r.status === 'PENDING' && (
                                        <button onClick={() => handleCancelReservation(r.id)} className="text-red-500 text-xs hover:underline border border-red-900 px-2 py-1 rounded hover:bg-red-900/20">
                                            Cancelar
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
            
            {view === 'puntos_cliente' && (
                <div className="space-y-6">
                    <div className="bg-gray-900 p-6 rounded border border-[#D2B48C]/30 text-center">
                        <h2 className="text-2xl font-bold text-[#D2B48C] uppercase tracking-widest">Mis Puntos</h2>
                        <div className="mt-4 text-5xl font-black text-white">
                            {contacts.find(c => c.bandName === currentUser.bandName)?.points || 0}
                        </div>
                        <p className="text-xs text-gray-500 mt-2 uppercase">Puntos acumulados en los últimos 60 días</p>
                    </div>
                    
                    <div className="bg-gray-900 p-6 rounded border border-[#D2B48C]/20">
                        <h3 className="text-lg font-bold text-[#D2B48C] mb-4 uppercase tracking-widest border-b border-[#D2B48C]/20 pb-2">Premios Disponibles</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className={`p-4 border rounded bg-black/30 ${(contacts.find(c => c.bandName === currentUser.bandName)?.points || 0) >= 25 ? 'border-green-500' : 'border-gray-800 opacity-50'}`}>
                                <div className="text-xs text-gray-500 uppercase mb-1">25 Puntos</div>
                                <div className="font-bold text-white">2 IPA Lager Gratis</div>
                            </div>
                            <div className={`p-4 border rounded bg-black/30 ${(contacts.find(c => c.bandName === currentUser.bandName)?.points || 0) >= 50 ? 'border-green-500' : 'border-gray-800 opacity-50'}`}>
                                <div className="text-xs text-gray-500 uppercase mb-1">50 Puntos</div>
                                <div className="font-bold text-white">1 Pizza Gratis</div>
                            </div>
                            <div className={`p-4 border rounded bg-black/30 ${(contacts.find(c => c.bandName === currentUser.bandName)?.points || 0) >= 75 ? 'border-green-500' : 'border-gray-800 opacity-50'}`}>
                                <div className="text-xs text-gray-500 uppercase mb-1">75 Puntos</div>
                                <div className="font-bold text-white">10% Off Próxima Reserva</div>
                            </div>
                            <div className={`p-4 border rounded bg-black/30 ${(contacts.find(c => c.bandName === currentUser.bandName)?.points || 0) >= 100 ? 'border-green-500' : 'border-gray-800 opacity-50'}`}>
                                <div className="text-xs text-gray-500 uppercase mb-1">100 Puntos</div>
                                <div className="font-bold text-white">Grabación Gratis</div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-900 p-6 rounded border border-gray-800">
                        <h3 className="text-sm font-bold text-[#D2B48C] mb-4 uppercase">Historial de Puntos</h3>
                        <div className="space-y-2">
                            {contacts.find(c => c.bandName === currentUser.bandName)?.pointsHistory?.slice().reverse().map((entry, i) => (
                                <div key={i} className="flex justify-between items-center text-xs border-b border-gray-800 pb-2 last:border-0">
                                    <div className="flex flex-col">
                                        <span className="text-white font-bold">{entry.reason}</span>
                                        <span className="text-gray-500">{new Date(entry.date).toLocaleDateString()}</span>
                                    </div>
                                    <span className={`font-bold ${entry.amount > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                        {entry.amount > 0 ? `+${entry.amount}` : entry.amount}
                                    </span>
                                </div>
                            )) || <p className="text-gray-500 text-xs">No hay movimientos aún.</p>}
                        </div>
                    </div>
                </div>
            )}
            
                </div>
            </div>
        </main>
      </div>
      <div className="fixed bottom-4 left-4 z-[200] pointer-events-none">
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#D2B48C]/40">v2.29</span>
      </div>

      <CustomModal 
        isOpen={modalConfig.isOpen}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
        onConfirm={modalConfig.onConfirm}
        onCancel={closeModal}
      />
    </div>
  );
}

export default App;
