
import React, { useState } from 'react';
import { Contact, Reservation, Room } from '../../types';
import { Button } from '../ui/Button';
import { Input, Select } from '../ui/Input';
import { ROOMS as DEFAULT_ROOMS } from '../../constants';
// @ts-ignore
import * as XLSX from 'xlsx';

interface ContactsViewProps {
  contacts: Contact[];
  reservations?: Reservation[];
  onAddContact: (c: Contact) => void;
  onAddContacts?: (cs: Contact[]) => void;
  onUpdateContact?: (c: Contact) => void;
  onDeleteContact?: (id: string, reason: string) => void;
  onNavigateToReserve?: (bandName: string) => void;
  onPayAbono?: (contactId: string, amount: number, description: string) => void;
  rooms?: Room[];
}

const BAND_ROLES = ['Baterista', 'Guitarrista', 'Bajista', 'Cantante', 'Tecladista', 'Saxofonista', 'Percusión'];
const BAND_STYLES = ['Heavy', 'Rock', 'Jazz', 'Cumbia', 'Punk', 'Reggae', 'Pop'];
const EMAIL_DOMAINS = ['@gmail.com', '@outlook.com'];

export const ContactsView: React.FC<ContactsViewProps> = ({ 
    contacts, 
    reservations = [], 
    onAddContact, 
    onAddContacts,
    onUpdateContact,
    onDeleteContact,
    onNavigateToReserve,
    onPayAbono,
    rooms = DEFAULT_ROOMS
}) => {
  const [mode, setMode] = useState<'LIST' | 'CREATE' | 'EDIT'>('CREATE');
  
  // Abono Modal State
  const [abonoModal, setAbonoModal] = useState<{ isOpen: boolean, contact: Contact | null }>({ isOpen: false, contact: null });
  
  // Delete Modal State
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean, contactId: string, reason: string }>({ isOpen: false, contactId: '', reason: '' });

  // Edit State
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [abonoRoomId, setAbonoRoomId] = useState(rooms[0]?.id || 'sala1');
  const [abonoHours, setAbonoHours] = useState('2');
  const [abonoSessions, setAbonoSessions] = useState('4');
  const [abonoDiscount, setAbonoDiscount] = useState('0');
  const [abonoDiscountType, setAbonoDiscountType] = useState<'FIXED' | 'PERCENT'>('FIXED');


  // Form
  const [name, setName] = useState('');
  const [bandName, setBandName] = useState('');
  const [phone, setPhone] = useState('');
  
  // Email Split State
  const [emailUser, setEmailUser] = useState('');
  const [emailDomain, setEmailDomain] = useState(EMAIL_DOMAINS[0]);

  const [style, setStyle] = useState(BAND_STYLES[0]);
  const [musicians, setMusicians] = useState('');
  const [room, setRoom] = useState(rooms[0]?.name || 'Sala 1');
  // New Fields
  const [instagramUser, setInstagramUser] = useState(''); // Store only username part
  const [bandRole, setBandRole] = useState(BAND_ROLES[0]);

  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();

      const fullEmail = `${emailUser}${emailDomain}`;

      // Validation
      if (!fullEmail.includes('@')) {
          alert("El email debe ser válido (contener '@').");
          return;
      }
      
      // Strict 10 digit number validation
      const phoneRegex = /^\d{10}$/;
      if (!phoneRegex.test(phone)) {
          alert("El teléfono debe contener exactamente 10 números, sin espacios ni símbolos.");
          return;
      }

      const newContact: Contact = {
          id: editingContact ? editingContact.id : Date.now().toString(),
          name,
          bandName,
          phone,
          email: fullEmail,
          style,
          musiciansCount: Number(musicians),
          habitualRoom: room,
          cancellationRate: editingContact ? editingContact.cancellationRate : 0,
          attendanceRate: editingContact ? editingContact.attendanceRate : 0,
          instagram: instagramUser ? `@${instagramUser}` : '',
          bandRole,
          isAbono: editingContact ? editingContact.isAbono : false,
          debt: editingContact ? editingContact.debt : 0,
          isBlocked: editingContact ? editingContact.isBlocked : false
      };

      if (editingContact && onUpdateContact) {
          onUpdateContact(newContact);
          setMode('LIST');
          setEditingContact(null);
      } else {
          onAddContact(newContact);
      }
      
      // Reset
      setName(''); setBandName(''); setPhone(''); setEmailUser(''); setStyle(BAND_STYLES[0]); 
      setMusicians(''); setInstagramUser(''); setBandRole(BAND_ROLES[0]);
  };

  const handleOpenAbono = (c: Contact) => {
      setAbonoModal({ isOpen: true, contact: c });
      setAbonoDiscount('0');
      setAbonoDiscountType('FIXED');
      setAbonoHours('2');
      setAbonoSessions('4');
  };

  const calculateAbonoTotal = () => {
      const selectedRoom = rooms.find(r => r.id === abonoRoomId);
      const price = selectedRoom ? selectedRoom.price : 0;
      const subtotal = price * Number(abonoHours) * Number(abonoSessions);
      
      const discountVal = Number(abonoDiscount) || 0;
      let total = subtotal;

      if (abonoDiscountType === 'FIXED') {
          total = subtotal - discountVal;
      } else {
          // Percentage
          total = subtotal - (subtotal * discountVal / 100);
      }
      
      return Math.max(0, total);
  };

  const handleConfirmAbono = () => {
      if (!abonoModal.contact || !onPayAbono) return;
      const total = calculateAbonoTotal();
      if (total <= 0) return alert("El monto debe ser mayor a 0");
      
      const description = `Abono ${abonoModal.contact.bandName} (${abonoSessions} ensayos, ${abonoHours}hs)`;
      onPayAbono(abonoModal.contact.id, total, description);
      
      alert(`Se cobró $${total} y la banda quedó registrada como Abonada.`);
      setAbonoModal({ isOpen: false, contact: null });
  };

  const handleEdit = (c: Contact) => {
      setEditingContact(c);
      setName(c.name.replace('*', ''));
      setBandName(c.bandName);
      setPhone(c.phone);
      
      const [user, domain] = c.email.split('@');
      setEmailUser(user || '');
      setEmailDomain(domain ? `@${domain}` : EMAIL_DOMAINS[0]);
      
      setStyle(c.style || BAND_STYLES[0]);
      setMusicians(String(c.musiciansCount || ''));
      setRoom(c.habitualRoom || rooms[0]?.name || 'Sala 1');
      setInstagramUser(c.instagram ? c.instagram.replace('@', '') : '');
      setBandRole(c.bandRole || BAND_ROLES[0]);
      setMode('EDIT');
  };

  const handleDeleteClick = (id: string) => {
      setDeleteModal({ isOpen: true, contactId: id, reason: '' });
  };

  const handleConfirmDelete = () => {
      if (!deleteModal.reason.trim()) return alert("Debe ingresar un motivo");
      if (onDeleteContact) {
          onDeleteContact(deleteModal.contactId, deleteModal.reason);
          setDeleteModal({ isOpen: false, contactId: '', reason: '' });
      }
  };

  const handleToggleBlock = (c: Contact) => {
      if (onUpdateContact) {
          onUpdateContact({ ...c, isBlocked: !c.isBlocked });
      }
  };


  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (evt) => {
          try {
              const dataBuffer = evt.target?.result;
              const wb = XLSX.read(dataBuffer, { type: 'array' });
              const wsName = wb.SheetNames[0];
              const ws = wb.Sheets[wsName];
              
              // Use header: 1 to get array of arrays, allowing us to skip the first row easily
              const rows = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];
              
              if (rows.length <= 1) {
                  alert("El archivo está vacío o solo contiene el encabezado.");
                  return;
              }

              // The first row is the header
              const headers = rows[0].map(h => String(h).trim().toLowerCase());
              const dataRows = rows.slice(1);
              
              const newContacts: Contact[] = [];
              const errors: string[] = [];
              let skippedCount = 0;

              dataRows.forEach((row, index) => {
                  const rowNum = index + 2; // +1 for 0-index, +1 for header row
                  
                  // Create a map of header name to value
                  const r: any = {};
                  headers.forEach((header, i) => {
                      r[header] = row[i];
                  });

                  // Required Keys: nombre de responsable, rol, nombre de banda, instagram, telefono, sala, mail, estilo, cantidad de musicos
                  const rawBand = r['nombre de banda'] || r['banda'] || '';
                  const rawName = r['nombre de responsable'] || r['responsable'] || r['contacto'] || '';
                  const rawRole = r['rol'] || '';
                  const rawInsta = r['instagram'] || '';
                  const rawPhone = r['telefono'] || r['teléfono'] || '';
                  const rawRoom = r['sala'] || 'Sala 1';
                  const rawEmail = r['mail'] || r['email'] || 'sin@email.com';
                  const rawStyle = r['estilo'] || '';
                  const rawMusicians = r['cantidad de musicos'] || r['cantidad de músicos'] || '0';

                  // Skip empty rows
                  if (!rawBand && !rawName && !rawPhone) {
                      skippedCount++;
                      return;
                  }

                  // Validation
                  if (!rawBand) errors.push(`Fila ${rowNum}: Falta 'Nombre de Banda'`);
                  if (!rawName) errors.push(`Fila ${rowNum}: Falta 'Nombre de Responsable'`);
                  if (!rawPhone) errors.push(`Fila ${rowNum}: Falta 'Teléfono'`);

                  if (rawPhone) {
                      const cleanPhone = String(rawPhone).trim();
                      const existsInCurrent = contacts.some(c => c.phone.trim() === cleanPhone);
                      const existsInNew = newContacts.some(c => c.phone.trim() === cleanPhone);
                      if (existsInCurrent || existsInNew) {
                          errors.push(`Fila ${rowNum}: Teléfono duplicado (${rawPhone})`);
                          return; 
                      }
                  }

                  if (rawBand && rawName && rawPhone) {
                      newContacts.push({
                          id: Date.now().toString() + Math.random().toString().substr(2, 5),
                          name: String(rawName),
                          bandName: String(rawBand),
                          phone: String(rawPhone),
                          email: String(rawEmail),
                          style: String(rawStyle),
                          musiciansCount: Number(rawMusicians) || 0,
                          habitualRoom: String(rawRoom),
                          cancellationRate: 0,
                          attendanceRate: 0,
                          instagram: rawInsta ? (String(rawInsta).startsWith('@') ? String(rawInsta) : `@${rawInsta}`) : '',
                          bandRole: String(rawRole)
                      });
                  }
              });
              
              if (newContacts.length > 0) {
                  if (onAddContacts) {
                      onAddContacts(newContacts);
                  } else {
                      newContacts.forEach(c => onAddContact(c));
                  }
              }

              if (errors.length > 0) {
                  alert(`Se encontraron errores en la importación:\n\n${errors.slice(0, 10).join('\n')}${errors.length > 10 ? '\n...y otros ' + (errors.length - 10) + ' errores' : ''}\n\nSe importaron ${newContacts.length} contactos.`);
              } else if (newContacts.length > 0) {
                  alert("¡Importación exitosa!");
              } else {
                  alert("No se encontraron datos válidos para importar.");
              }
              setMode('LIST');
          } catch (error) {
              console.error(error);
              alert("Error al leer el archivo. Asegúrese de que sea un Excel válido.");
          }
      };
      reader.readAsArrayBuffer(file);
  };

  const getMetrics = (bandName: string) => {
      if (!reservations.length) return { cancel: 0, attendance: 0 };
      
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      
      const history = reservations.filter(r => 
          r.bandName.toLowerCase() === bandName.toLowerCase() && 
          new Date(r.date) >= threeMonthsAgo
      );

      const total = history.length;
      if (total === 0) return { cancel: 0, attendance: 0 };

      const cancelled = history.filter(r => r.status === 'REJECTED').length;
      const attended = history.filter(r => r.status === 'COMPLETED').length;

      return {
          cancel: Math.round((cancelled / total) * 100),
          attendance: Math.round((attended / total) * 100)
      };
  };

  return (
    <div className="space-y-6">
        
        {/* ABONO MODAL */}
        {abonoModal.isOpen && abonoModal.contact && (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                <div className="bg-gray-900 border border-yellow-500/50 p-6 rounded w-full max-w-md">
                    <h3 className="text-xl font-bold text-yellow-500 mb-4">Calcular Abono: {abonoModal.contact.bandName}</h3>
                    <div className="space-y-4">
                        <Select label="Sala de Ensayo" value={abonoRoomId} onChange={e => setAbonoRoomId(e.target.value)}>
                            {rooms.map(r => <option key={r.id} value={r.id}>{r.name} (${r.price}/h)</option>)}
                        </Select>
                        <div className="flex gap-4">
                             <Input type="number" label="Horas por Ensayo" value={abonoHours} onChange={e => setAbonoHours(e.target.value)} />
                             <Input type="number" label="Cant. Ensayos" value={abonoSessions} onChange={e => setAbonoSessions(e.target.value)} />
                        </div>
                        
                        <div className="flex gap-2 items-end">
                            <div className="flex-1">
                                <Input type="number" label="Descuento Manual" value={abonoDiscount} onChange={e => setAbonoDiscount(e.target.value)} />
                            </div>
                            <div className="flex gap-1 bg-black/50 p-1 rounded border border-gray-700 h-[58px] items-end pb-1">
                                <button 
                                    onClick={() => setAbonoDiscountType('FIXED')}
                                    className={`px-3 py-2 text-xs font-bold rounded ${abonoDiscountType === 'FIXED' ? 'bg-[#D2B48C] text-black' : 'text-gray-400 hover:text-white'}`}
                                >
                                    $
                                </button>
                                <button 
                                    onClick={() => setAbonoDiscountType('PERCENT')}
                                    className={`px-3 py-2 text-xs font-bold rounded ${abonoDiscountType === 'PERCENT' ? 'bg-[#D2B48C] text-black' : 'text-gray-400 hover:text-white'}`}
                                >
                                    %
                                </button>
                            </div>
                        </div>
                        
                        <div className="bg-black/50 p-3 rounded border border-gray-700 mt-2">
                             <div className="flex justify-between text-gray-400 text-sm mb-1">
                                  <span>Subtotal:</span>
                                  <span>${(rooms.find(r => r.id === abonoRoomId)?.price || 0) * Number(abonoHours) * Number(abonoSessions)}</span>
                             </div>
                             <div className="flex justify-between text-yellow-500 font-bold text-xl border-t border-gray-600 pt-1">
                                  <span>TOTAL FINAL:</span>
                                  <span>${calculateAbonoTotal().toFixed(0)}</span>
                             </div>
                        </div>

                        <div className="flex gap-2 pt-4">
                            <Button onClick={handleConfirmAbono} className="flex-1 bg-yellow-600 hover:bg-yellow-500 text-black border-none">
                                Cobrar Abono
                            </Button>
                            <Button onClick={() => setAbonoModal({isOpen: false, contact: null})} variant="secondary" className="flex-1">
                                Cancelar
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* DELETE MODAL */}
        {deleteModal.isOpen && (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                <div className="bg-gray-900 border border-red-500/50 p-6 rounded w-full max-w-md">
                    <h3 className="text-xl font-bold text-red-500 mb-4">Eliminar Contacto</h3>
                    <p className="text-gray-400 text-sm mb-4">Por favor, indique el motivo de la eliminación:</p>
                    <textarea 
                        className="w-full bg-black border border-gray-700 rounded p-2 text-white text-sm focus:outline-none focus:border-red-500 mb-4"
                        rows={3}
                        value={deleteModal.reason}
                        onChange={e => setDeleteModal({...deleteModal, reason: e.target.value})}
                        placeholder="Escriba el motivo aquí..."
                    />
                    <div className="flex gap-2">
                        <Button onClick={handleConfirmDelete} variant="danger" className="flex-1">Eliminar</Button>
                        <Button onClick={() => setDeleteModal({isOpen: false, contactId: '', reason: ''})} variant="secondary" className="flex-1">Cancelar</Button>
                    </div>
                </div>
            </div>
        )}

        <div className="flex justify-between border-b border-gray-800 pb-2">
            <div className="flex gap-4">
                <button className={`text-sm font-bold uppercase ${mode === 'CREATE' ? 'text-[#D2B48C]' : 'text-gray-500'}`} onClick={() => setMode('CREATE')}>Crear Manual</button>
                <button className={`text-sm font-bold uppercase ${mode === 'LIST' ? 'text-[#D2B48C]' : 'text-gray-500'}`} onClick={() => setMode('LIST')}>Listado de Bandas</button>
            </div>
            
            {/* EXCEL IMPORT */}
            <div className="flex flex-col items-end gap-1">
                 <div className="flex items-center gap-2">
                    <label className="bg-green-700 hover:bg-green-600 text-white text-xs px-3 py-1 rounded cursor-pointer transition-colors">
                        Importar Excel
                        <input 
                            type="file" 
                            accept=".xlsx, .xls, .csv" 
                            onChange={handleFileUpload} 
                            className="hidden" 
                        />
                    </label>
                 </div>
                 <a 
                    href="https://docs.google.com/spreadsheets/d/1n3ETKIoPK4FUoS24gwUFHxBEpHkM7tlX6HM09-4M1Ms/edit?usp=drive_link" 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-[10px] text-gray-500 hover:text-[#D2B48C] underline"
                 >
                    Ver planilla modelo
                 </a>
            </div>
        </div>

        {(mode === 'CREATE' || mode === 'EDIT') && (
            <div className="bg-gray-900 p-6 rounded border border-[#D2B48C]/30 max-w-2xl">
                <h3 className="text-xl font-bold text-[#D2B48C] mb-6">{mode === 'EDIT' ? 'Editar Contacto' : 'Nuevo Contacto'}</h3>
                <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
                    <Input label="Nombre Responsable" value={name} onChange={e => setName(e.target.value)} required />
                    
                    <Select label="Rol en Banda" value={bandRole} onChange={e => setBandRole(e.target.value)}>
                        {BAND_ROLES.map(role => (
                            <option key={role} value={role}>{role}</option>
                        ))}
                    </Select>
                    
                    <Input label="Nombre Banda" value={bandName} onChange={e => setBandName(e.target.value)} required />
                    
                    {/* Instagram with Fixed Prefix */}
                    <div className="flex flex-col gap-1 w-full">
                        <label className="text-xs font-bold uppercase tracking-wider text-[#D2B48C] opacity-80">Instagram</label>
                        <div className="flex items-center">
                            <span className="bg-gray-800 border border-r-0 border-[#D2B48C]/30 rounded-l p-2 text-[#D2B48C] font-bold">@</span>
                            <input 
                                className="bg-gray-900 border border-l-0 border-[#D2B48C]/30 rounded-r p-2 text-[#D2B48C] focus:outline-none focus:border-[#D2B48C] placeholder-gray-600 flex-1 min-w-0"
                                value={instagramUser} 
                                onChange={e => setInstagramUser(e.target.value)} 
                                placeholder="usuario" 
                            />
                        </div>
                    </div>
                    
                    <Input 
                        label="Teléfono (10 números)" 
                        value={phone} 
                        onChange={e => setPhone(e.target.value.replace(/\D/g, ''))} // Only allow typing numbers visualy too
                        required 
                        placeholder="Ej: 1122334455" 
                        maxLength={10} 
                    />
                    
                    {/* EMAIL SPLIT */}
                    <div className="flex flex-col gap-1 w-full">
                        <label className="text-xs font-bold uppercase tracking-wider text-[#D2B48C] opacity-80">Email</label>
                        <div className="flex gap-2">
                             <input 
                                className="bg-gray-900 border border-[#D2B48C]/30 rounded p-2 text-[#D2B48C] focus:outline-none focus:border-[#D2B48C] placeholder-gray-600 flex-1 min-w-0"
                                value={emailUser} 
                                onChange={e => setEmailUser(e.target.value)} 
                                required 
                                placeholder="usuario" 
                             />
                             <select 
                                className="bg-gray-900 border border-[#D2B48C]/30 rounded p-2 text-[#D2B48C] focus:outline-none focus:border-[#D2B48C] w-36"
                                value={emailDomain}
                                onChange={e => setEmailDomain(e.target.value)}
                             >
                                 {EMAIL_DOMAINS.map(d => <option key={d} value={d}>{d}</option>)}
                             </select>
                        </div>
                    </div>

                    <Select label="Estilo" value={style} onChange={e => setStyle(e.target.value)}>
                        {BAND_STYLES.map(s => <option key={s} value={s}>{s}</option>)}
                    </Select>

                    <Input label="Cant. Músicos" type="number" value={musicians} onChange={e => setMusicians(e.target.value)} />
                    <Select label="Sala Habitual" value={room} onChange={e => setRoom(e.target.value)}>
                        {rooms.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
                    </Select>
                    
                    <div className="md:col-span-2 pt-4 flex gap-2">
                        <Button type="submit" className="flex-1">{mode === 'EDIT' ? 'Actualizar' : 'Guardar'}</Button>
                        {mode === 'EDIT' && (
                            <Button type="button" variant="secondary" onClick={() => { setMode('LIST'); setEditingContact(null); }}>Cancelar</Button>
                        )}
                    </div>
                </form>
            </div>
        )}

        {mode === 'LIST' && (
            <div className="space-y-4">
                <h3 className="text-xl font-bold text-[#D2B48C]">Base de Datos de Bandas</h3>
                <div className="bg-gray-900 rounded border border-gray-800 overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-gray-800 text-[#D2B48C]">
                            <tr>
                                <th className="p-3">Banda</th>
                                <th className="p-3">Contacto / Rol</th>
                                <th className="p-3">Instagram</th>
                                <th className="p-3">Teléfono</th>
                                <th className="p-3">Sala</th>
                                <th className="p-3 text-center" title="Últimos 3 meses">% Cancel</th>
                                <th className="p-3 text-center" title="Últimos 3 meses">% Asistencia</th>
                                <th className="p-3">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {contacts.length === 0 && <tr><td colSpan={10} className="p-4 text-center text-gray-500">Sin contactos.</td></tr>}
                            {contacts.map(c => {
                                const metrics = getMetrics(c.bandName);
                                return (
                                    <tr key={c.id} className={`hover:bg-white/5 ${c.isBlocked ? 'opacity-50 grayscale' : ''}`}>
                                        <td className="p-3 font-bold text-white">
                                            {c.bandName}
                                            {c.isAbono && <span className="ml-2 bg-yellow-600 text-black text-[9px] px-1 rounded font-bold">ABONADO</span>}
                                            {c.isBlocked && <span className="ml-2 bg-red-600 text-white text-[9px] px-1 rounded font-bold uppercase">Bloqueado</span>}
                                        </td>
                                        <td className="p-3">
                                            <div>
                                                {c.name.includes('*') ? (
                                                    <span className="text-yellow-500 font-bold" title="Faltan datos">{c.name}</span>
                                                ) : (
                                                    c.name
                                                )}
                                            </div>
                                            {c.bandRole && <div className="text-[10px] text-gray-500">{c.bandRole}</div>}
                                        </td>
                                        <td className="p-3 text-blue-400">
                                            {c.instagram ? (
                                                <a 
                                                    href={`https://instagram.com/${c.instagram.replace('@', '')}`} 
                                                    target="_blank" 
                                                    rel="noreferrer" 
                                                    className="hover:underline hover:text-blue-300"
                                                >
                                                    {c.instagram}
                                                </a>
                                            ) : '-'}
                                        </td>
                                        <td className="p-3">{c.phone}</td>
                                        <td className="p-3">{c.habitualRoom}</td>
                                        <td className="p-3 text-center font-bold text-red-400">{metrics.cancel}%</td>
                                        <td className="p-3 text-center font-bold text-green-400">{metrics.attendance}%</td>
                                        <td className="p-3">
                                            <div className="flex flex-wrap gap-1">
                                                <Button 
                                                    variant="secondary" 
                                                    className="text-[10px] py-1 px-2 h-auto"
                                                    onClick={() => onNavigateToReserve && !c.isBlocked && onNavigateToReserve(c.bandName)}
                                                    disabled={c.isBlocked}
                                                >
                                                    Reservar
                                                </Button>
                                                {onPayAbono && (
                                                    <button 
                                                        onClick={() => handleOpenAbono(c)}
                                                        className="text-[10px] bg-yellow-900/30 text-yellow-500 border border-yellow-700 px-2 rounded hover:bg-yellow-900/50"
                                                    >
                                                        Abono
                                                    </button>
                                                )}
                                                <button 
                                                    onClick={() => handleEdit(c)}
                                                    className="text-[10px] bg-blue-900/30 text-blue-400 border border-blue-700 px-2 rounded hover:bg-blue-900/50"
                                                >
                                                    Editar
                                                </button>
                                                <button 
                                                    onClick={() => handleDeleteClick(c.id)}
                                                    className="text-[10px] bg-red-900/30 text-red-400 border border-red-700 px-2 rounded hover:bg-red-900/50"
                                                >
                                                    Borrar
                                                </button>
                                                <button 
                                                    onClick={() => handleToggleBlock(c)}
                                                    className={`text-[10px] border px-2 rounded ${c.isBlocked ? 'bg-green-900/30 text-green-400 border-green-700 hover:bg-green-900/50' : 'bg-orange-900/30 text-orange-400 border-orange-700 hover:bg-orange-900/50'}`}
                                                >
                                                    {c.isBlocked ? 'Desbloquear' : 'Bloquear'}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                <p className="text-[10px] text-gray-500 text-right">* El asterisco en el nombre indica datos faltantes.</p>
            </div>
        )}
    </div>
  );
};
