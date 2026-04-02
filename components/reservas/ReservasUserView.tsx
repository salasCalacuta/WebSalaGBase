
import React, { useState, useMemo, useEffect } from 'react';
import { Reservation, Contact, Room } from '../../types';
import { Button } from '../ui/Button';
import { Input, Select } from '../ui/Input';
import { CalendarSyncView } from './CalendarSyncView';

interface ReservasUserViewProps {
    reservations: Reservation[];
    onUpdateStatus: (id: string, status: Reservation['status']) => void;
    onDelete?: (id: string) => void;
    onUpdateReservation?: (res: Reservation) => void;
    onToggleAbono: (id: string) => void;
    onReserve: (data: { date: string, timeStart: string, timeEnd: string, roomId: string, bandName: string, isAbono?: boolean, instruments?: string[], recordingHours?: number }) => { success: boolean, message?: string };
    onSyncCalendar?: () => void;
    prefillBandName?: string;
    contacts?: Contact[];
    rooms: Room[];
    canSeeAgenda?: boolean;
}

const WEEKDAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

export const ReservasUserView: React.FC<ReservasUserViewProps> = ({ 
    reservations, 
    onUpdateStatus, 
    onDelete,
    onUpdateReservation,
    onToggleAbono, 
    onReserve,
    onSyncCalendar,
    prefillBandName,
    contacts = [],
    rooms,
    canSeeAgenda = true
}) => {
    const [activeSubTab, setActiveSubTab] = useState<'agenda' | 'sync'>('agenda');
    const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);
    const [editForm, setEditForm] = useState<Partial<Reservation>>({});

    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [timeStart, setTimeStart] = useState('14:00');
    const [timeEnd, setTimeEnd] = useState('16:00');
    const [roomId, setRoomId] = useState(rooms[0]?.id || 'sala1');
    const [bandName, setBandName] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const [instruments, setInstruments] = useState<string[]>([]);
    const [recordingHours, setRecordingHours] = useState('0');

    const availableInstruments = [
        { id: 'i1', name: 'Guitarra A' },
        { id: 'i2', name: 'Guitarra B' },
        { id: 'i3', name: 'Bajo' },
        { id: 'i4', name: 'Set Platos' },
        { id: 'i5', name: 'Teclado' }
    ];

    const handleInstrumentToggle = (id: string) => {
        if (instruments.includes(id)) {
            setInstruments(instruments.filter(i => i !== id));
        } else {
            setInstruments([...instruments, id]);
        }
    };

    // Range State for Agenda
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [pendingStartDate, setPendingStartDate] = useState('');
    const [pendingEndDate, setPendingEndDate] = useState('');

    // Initialize range: Today -> +20 days (3 weeks total)
    useEffect(() => {
        const today = new Date();
        const start = today.toISOString().split('T')[0];
        setStartDate(start);
        setPendingStartDate(start);
        
        const future = new Date(today);
        future.setDate(future.getDate() + 20);
        const end = future.toISOString().split('T')[0];
        setEndDate(end);
        setPendingEndDate(end);
    }, []);

    const handleApplyDates = () => {
        setStartDate(pendingStartDate);
        setEndDate(pendingEndDate);
    };

    const handleSetWeekly = () => {
        const today = new Date();
        const start = today.toISOString().split('T')[0];
        const future = new Date(today);
        future.setDate(future.getDate() + 6);
        const end = future.toISOString().split('T')[0];
        
        setPendingStartDate(start);
        setPendingEndDate(end);
        setStartDate(start);
        setEndDate(end);
    };

    const dateRange = useMemo(() => {
        if (!startDate || !endDate) return [];
        const start = new Date(startDate + 'T12:00:00');
        const end = new Date(endDate + 'T12:00:00');
        const dates = [];
        const diff = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
        if (diff > 90) return []; // Limit to 90 days
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            dates.push(new Date(d));
        }
        return dates;
    }, [startDate, endDate]);
    
    const roomColorBg = (color: string) => {
        switch(color) {
            case 'blue': return 'bg-blue-900/40 border-blue-500/50';
            case 'green': return 'bg-green-900/40 border-green-500/50';
            case 'violet': return 'bg-purple-900/40 border-purple-500/50';
            case 'red': return 'bg-red-900/40 border-red-500/50';
            default: return 'bg-gray-800/40 border-gray-700';
        }
    };

    // UI State
    const [formStatus, setFormStatus] = useState<{ type: 'success' | 'error' | null, msg: string }>({ type: null, msg: '' });

    useEffect(() => {
        if (prefillBandName) setBandName(prefillBandName);
    }, [prefillBandName]);

    // Effect: Auto-select habitual room when bandName matches a contact
    useEffect(() => {
        if (!bandName) return;
        const contact = contacts.find(c => c.bandName.toLowerCase() === bandName.trim().toLowerCase());
        if (contact && contact.habitualRoom) {
            // Find room ID based on room name (e.g. "Sala 1")
            const targetRoom = rooms.find(r => r.name.toLowerCase() === contact.habitualRoom.toLowerCase());
            if (targetRoom) {
                setRoomId(targetRoom.id);
            }
        }
    }, [bandName, contacts, rooms]);

    const hours = useMemo(() => {
        const list = [];
        for(let i=10; i<=23; i++) list.push(`${i}:00`);
        list.push('00:00');
        return list;
    }, []);

    const filteredContacts = useMemo(() => {
        if (!bandName) return contacts;
        return contacts.filter(c => 
            c.bandName.toLowerCase().includes(bandName.toLowerCase()) ||
            c.name.toLowerCase().includes(bandName.toLowerCase())
        );
    }, [bandName, contacts]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setFormStatus({ type: null, msg: '' });

        // 0. Validate Date (Not in the past)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const selectedDate = new Date(date + 'T00:00:00');
        if (selectedDate < today) {
             alert("fecha incorrecta");
             return;
        }

        // 1. Validate Time (End > Start)
        // Parse hours integers for comparison
        const startVal = timeStart === '00:00' ? 24 : parseInt(timeStart.split(':')[0]);
        const endVal = timeEnd === '00:00' ? 24 : parseInt(timeEnd.split(':')[0]);

        if (startVal >= endVal) {
             setFormStatus({ type: 'error', msg: 'La hora de fin debe ser mayor a la de inicio.' });
             return;
        }

        // 2. Validate Contact Existence
        const contactExists = contacts.some(c => c.bandName.trim().toLowerCase() === bandName.trim().toLowerCase());
        if (!contactExists) {
            setFormStatus({ type: 'error', msg: 'La banda no está en el listado de contactos.' });
            return;
        }

        // 3. Attempt Reserve (isAbono is now false by default for single manual reservations)
        const result = onReserve({ date, timeStart, timeEnd, roomId, bandName, isAbono: false, instruments, recordingHours: Number(recordingHours) });
        
        if (result.success) {
            setFormStatus({ type: 'success', msg: 'Reserva Agendada Correctamente.' });
            setBandName('');
            // Clear success message after 3 seconds
            setTimeout(() => setFormStatus({ type: null, msg: '' }), 3000);
        } else {
            setFormStatus({ type: 'error', msg: 'Horario ocupado' }); // Simplified message as requested
        }
    };

    const handleOpenEdit = (res: Reservation) => {
        setEditingReservation(res);
        setEditForm({ ...res });
    };

    const handleSaveEdit = () => {
        if (!editingReservation || !onUpdateReservation) return;
        
        // Validate times
        const startVal = editForm.timeStart === '00:00' ? 24 : parseInt(editForm.timeStart?.split(':')[0] || '0');
        const endVal = editForm.timeEnd === '00:00' ? 24 : parseInt(editForm.timeEnd?.split(':')[0] || '0');

        if (startVal >= endVal) {
            alert('La hora de fin debe ser mayor a la de inicio.');
            return;
        }

        // Check overlap (excluding current reservation)
        const hasOverlap = reservations.some(r => 
            r.id !== editingReservation.id &&
            r.date === editForm.date &&
            r.roomId === editForm.roomId &&
            r.status !== 'REJECTED' &&
            !(editForm.timeEnd! <= r.timeStart || editForm.timeStart! >= r.timeEnd)
        );

        if (hasOverlap) {
            alert('Horario ocupado en esa sala.');
            return;
        }

        onUpdateReservation({ ...editingReservation, ...editForm } as Reservation);
        setEditingReservation(null);
    };

    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // Historical Query State
    const [histStart, setHistStart] = useState('');
    const [histEnd, setHistEnd] = useState('');
    const [histResults, setHistResults] = useState<Reservation[]>([]);
    const [hasQueried, setHasQueried] = useState(false);

    const handleHistoryQuery = () => {
        if (!histStart || !histEnd) return alert("Seleccione un rango de fechas");
        const results = reservations.filter(r => 
            r.date >= histStart && 
            r.date <= histEnd && 
            r.status !== 'REJECTED'
        ).sort((a, b) => a.date.localeCompare(b.date) || a.timeStart.localeCompare(b.timeStart));
        setHistResults(results);
        setHasQueried(true);
    };

    const handleClearHistory = () => {
        setHistStart('');
        setHistEnd('');
        setHistResults([]);
        setHasQueried(false);
    };

    const handleDelete = () => {
        if (!editingReservation || !onDelete) return;
        
        if (!showDeleteConfirm) {
            setShowDeleteConfirm(true);
            return;
        }

        onDelete(editingReservation.id);
        setEditingReservation(null);
        setShowDeleteConfirm(false);
    };

    // Reset delete confirmation when modal closes or reservation changes
    useEffect(() => {
        setShowDeleteConfirm(false);
    }, [editingReservation]);

    return (
        <div className="space-y-8">
            {/* Sub Tabs */}
            <div className="flex gap-4 border-b border-gray-800">
                {canSeeAgenda && (
                    <button 
                        onClick={() => setActiveSubTab('agenda')}
                        className={`px-4 py-2 text-sm font-bold uppercase tracking-widest transition-colors ${activeSubTab === 'agenda' ? 'text-[#D2B48C] border-b-2 border-[#D2B48C]' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        Agenda
                    </button>
                )}
                <button 
                    onClick={() => setActiveSubTab('sync')}
                    className={`px-4 py-2 text-sm font-bold uppercase tracking-widest transition-colors ${activeSubTab === 'sync' ? 'text-[#D2B48C] border-b-2 border-[#D2B48C]' : 'text-gray-500 hover:text-gray-300'}`}
                >
                    Sincronizar Agenda
                </button>
            </div>

            {activeSubTab === 'sync' ? (
                <CalendarSyncView reservations={reservations} onSyncComplete={(fetched) => onSyncCalendar && onSyncCalendar(fetched)} />
            ) : (
                <>
            {/* Quick Reserve Form */}
            <div className="bg-gray-900 border border-[#D2B48C] p-6 rounded">
                <h3 className="text-xl font-bold text-[#D2B48C] mb-4">Agendar Banda Manualmente</h3>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="flex flex-col md:flex-row gap-4 items-end">
                        <div className="flex-1 w-full relative">
                            <label className="text-xs font-bold uppercase tracking-wider text-[#D2B48C] opacity-80 mb-1 block">Nombre Banda</label>
                            <input 
                                value={bandName}
                                onFocus={() => setShowDropdown(true)}
                                onChange={e => {
                                    setBandName(e.target.value);
                                    setFormStatus({ type: null, msg: '' });
                                    setShowDropdown(true);
                                }}
                                required
                                placeholder="Elegir del listado..."
                                className="bg-gray-900 border border-[#D2B48C]/30 rounded p-2 text-[#D2B48C] focus:outline-none focus:border-[#D2B48C] placeholder-gray-600 w-full"
                            />
                            
                            {showDropdown && filteredContacts.length > 0 && (
                                <div className="absolute z-50 top-full left-0 w-full mt-1 bg-black border border-[#D2B48C]/50 rounded shadow-2xl max-h-60 overflow-y-auto">
                                    <div className="grid grid-cols-3 gap-2 p-2 bg-gray-800 text-[10px] uppercase font-bold text-[#D2B48C] border-b border-[#D2B48C]/20 sticky top-0">
                                        <span>Responsable</span>
                                        <span>Banda</span>
                                        <span className="text-right">Abonado</span>
                                    </div>
                                    {filteredContacts.map(c => (
                                        <div 
                                            key={c.id}
                                            onClick={() => {
                                                setBandName(c.bandName);
                                                setShowDropdown(false);
                                            }}
                                            className="grid grid-cols-3 gap-2 p-2 hover:bg-[#D2B48C]/20 cursor-pointer text-xs border-b border-gray-800 last:border-0 items-center"
                                        >
                                            <span className="text-gray-400 truncate">{c.name}</span>
                                            <span className="font-bold text-white truncate">{c.bandName}</span>
                                            <span className="text-right">
                                                {c.isAbono ? (
                                                    <span className="bg-green-900 text-green-300 px-1 rounded text-[10px]">SI</span>
                                                ) : (
                                                    <span className="bg-gray-800 text-gray-500 px-1 rounded text-[10px]">NO</span>
                                                )}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {/* Backdrop to close dropdown */}
                            {showDropdown && (
                                <div 
                                    className="fixed inset-0 z-40" 
                                    onClick={() => setShowDropdown(false)}
                                />
                            )}
                        </div>
                        <div className="w-full md:w-32">
                            <Input type="date" label="Fecha" value={date} onChange={e => setDate(e.target.value)} required />
                        </div>
                        <div className="w-full md:w-24">
                            <Select label="Inicio" value={timeStart} onChange={e => setTimeStart(e.target.value)}>
                                {hours.map(h => <option key={h} value={h}>{h}</option>)}
                            </Select>
                        </div>
                        <div className="w-full md:w-24">
                             <Select label="Fin" value={timeEnd} onChange={e => setTimeEnd(e.target.value)}>
                                {hours.map(h => <option key={h} value={h}>{h}</option>)}
                            </Select>
                        </div>
                        <div className="w-full md:w-32">
                            <Select label="Sala" value={roomId} onChange={e => setRoomId(e.target.value)}>
                                {rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-gray-800 pt-4">
                        <div className="space-y-2">
                            <label className="block text-xs uppercase text-gray-500 font-bold">Instrumentos</label>
                            <div className="grid grid-cols-3 gap-2">
                                {availableInstruments.map(inst => (
                                    <label key={inst.id} className="flex items-center gap-2 p-2 bg-gray-800 rounded border border-gray-700 cursor-pointer hover:bg-gray-700 transition-colors">
                                        <input 
                                            type="checkbox" 
                                            checked={instruments.includes(inst.id)}
                                            onChange={() => handleInstrumentToggle(inst.id)}
                                            className="accent-[#D2B48C]"
                                        />
                                        <span className="text-[10px] text-gray-300">{inst.name}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div className="w-full md:w-48">
                            <Input 
                                type="number" 
                                label="Horas de Grabación" 
                                value={recordingHours} 
                                onChange={e => setRecordingHours(e.target.value)} 
                            />
                        </div>
                    </div>
                    
                    <div className="flex gap-4 items-center border-t border-gray-800 pt-3">
                        <div className="flex-1"></div>
                        <div className="flex flex-col items-end">
                            <Button type="submit">Agendar</Button>
                        </div>
                    </div>
                    
                    {/* Inline Feedback */}
                    {formStatus.msg && (
                        <div className={`text-sm font-bold text-right ${formStatus.type === 'error' ? 'text-red-500 animate-pulse' : 'text-green-500'}`}>
                            {formStatus.msg}
                        </div>
                    )}
                </form>
            </div>
            {/* Daily Room Grid */}
            {canSeeAgenda && (
                <div className="bg-black/40 border border-gray-800 p-4 rounded">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6 border-b border-gray-800 pb-4">
                        <h3 className="text-sm font-bold text-[#D2B48C] uppercase tracking-widest">Estado de Salas</h3>
                        
                        <div className="flex gap-2 items-center bg-black/50 p-2 rounded border border-[#D2B48C]/20">
                            <span className="text-[10px] text-gray-500 uppercase font-bold">Desde:</span>
                            <input 
                                type="date" 
                                value={pendingStartDate} 
                                onChange={e => setPendingStartDate(e.target.value)} 
                                className="bg-gray-800 text-white text-[10px] p-1 rounded border border-gray-700 outline-none focus:border-[#D2B48C]/50"
                            />
                            <span className="text-[10px] text-gray-500 uppercase font-bold ml-2">Hasta:</span>
                            <input 
                                type="date" 
                                value={pendingEndDate} 
                                onChange={e => setPendingEndDate(e.target.value)} 
                                className="bg-gray-800 text-white text-[10px] p-1 rounded border border-gray-700 outline-none focus:border-[#D2B48C]/50"
                            />
                            <button 
                                onClick={handleApplyDates}
                                className="ml-2 px-3 py-1 bg-[#D2B48C] text-black text-[10px] font-bold rounded hover:bg-[#c2a47c] transition-colors uppercase"
                            >
                                Aceptar
                            </button>
                            <button 
                                onClick={handleSetWeekly}
                                className="ml-1 px-3 py-1 bg-gray-700 text-white text-[10px] font-bold rounded hover:bg-gray-600 transition-colors uppercase"
                            >
                                Por Semana
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[800px]">
                            <thead>
                                <tr className="bg-gray-900/80">
                                    <th className="p-2 border border-gray-800 text-[10px] uppercase text-gray-500 w-32">Día / Fecha</th>
                                    {rooms.map(room => (
                                        <th key={room.id} className="p-2 border border-gray-800 text-center">
                                            <span className="text-[10px] font-black uppercase tracking-tighter" style={{ color: room.hex }}>{room.name}</span>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {dateRange.map(day => {
                                    const dateStr = day.toISOString().split('T')[0];
                                    const dayIndex = day.getDay();
                                    const dayName = WEEKDAYS[dayIndex === 0 ? 6 : dayIndex - 1];
                                    const dateDisplay = day.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' });
                                    
                                    return (
                                        <tr key={dateStr} className="hover:bg-white/5 transition-colors">
                                            <td className="p-2 border border-gray-800 bg-black/20">
                                                <div className="flex flex-col">
                                                    <span className="text-[#D2B48C] font-bold text-[11px] uppercase">{dayName}</span>
                                                    <span className="text-gray-500 text-[10px]">{dateDisplay}</span>
                                                </div>
                                            </td>
                                            {rooms.map(room => {
                                                const roomRes = reservations
                                                    .filter(r => r.date === dateStr && r.roomId === room.id && r.status !== 'REJECTED')
                                                    .sort((a, b) => a.timeStart.localeCompare(b.timeStart));

                                                return (
                                                    <td key={room.id} className="p-1 border border-gray-800 vertical-top">
                                                        <div className="flex flex-col gap-1 min-h-[40px]">
                                                            {roomRes.map(res => (
                                                                <div 
                                                                    key={res.id}
                                                                    onClick={() => handleOpenEdit(res)}
                                                                    className={`p-1 rounded border text-[9px] leading-tight cursor-pointer hover:brightness-125 transition-all ${roomColorBg(room.color)}`}
                                                                >
                                                                    <div className="flex justify-between font-bold">
                                                                        <span>{res.timeStart} - {res.timeEnd}</span>
                                                                        {res.isAbono && <span className="text-yellow-500">★</span>}
                                                                    </div>
                                                                    <div className="truncate text-white font-medium">{res.bandName}</div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Historical Query Section */}
            {activeSubTab === 'agenda' && (
                <div className="bg-gray-900 border border-gray-800 p-6 rounded mt-8">
                    <h3 className="text-lg font-bold text-[#D2B48C] mb-4 uppercase tracking-widest">Consulta Histórica de Bandas</h3>
                    <div className="flex flex-col md:flex-row gap-4 items-end mb-6">
                        <div className="flex-1">
                            <Input 
                                type="date" 
                                label="Desde" 
                                value={histStart} 
                                onChange={e => setHistStart(e.target.value)} 
                            />
                        </div>
                        <div className="flex-1">
                            <Input 
                                type="date" 
                                label="Hasta" 
                                value={histEnd} 
                                onChange={e => setHistEnd(e.target.value)} 
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button onClick={handleHistoryQuery}>Aceptar</Button>
                            <Button variant="secondary" onClick={handleClearHistory}>Limpiar</Button>
                        </div>
                    </div>

                    {hasQueried && (
                        <div className="overflow-x-auto border border-gray-800 rounded">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-800 text-[#D2B48C]">
                                    <tr>
                                        <th className="p-3">Fecha</th>
                                        <th className="p-3">Horario</th>
                                        <th className="p-3">Sala</th>
                                        <th className="p-3">Banda</th>
                                        <th className="p-3">Estado</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800">
                                    {histResults.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="p-8 text-center text-gray-500 italic">
                                                No se encontraron bandas agendadas en este rango.
                                            </td>
                                        </tr>
                                    ) : (
                                        histResults.map(res => {
                                            const room = rooms.find(r => r.id === res.roomId);
                                            return (
                                                <tr key={res.id} className="hover:bg-white/5 transition-colors">
                                                    <td className="p-3 text-gray-300">{res.date.split('-').reverse().join('/')}</td>
                                                    <td className="p-3 text-white font-medium">{res.timeStart} - {res.timeEnd}</td>
                                                    <td className="p-3">
                                                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded border" style={{ color: room?.hex, borderColor: room?.hex + '40', backgroundColor: room?.hex + '10' }}>
                                                            {room?.name || 'Sala'}
                                                        </span>
                                                    </td>
                                                    <td className="p-3 text-white font-bold">{res.bandName}</td>
                                                    <td className="p-3">
                                                        <span className={`text-[10px] font-bold uppercase ${res.status === 'CONFIRMED' ? 'text-green-500' : 'text-yellow-500'}`}>
                                                            {res.status === 'CONFIRMED' ? 'Confirmada' : 'Pendiente'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
            </>
            )}

            {/* Edit Modal */}
            {editingReservation && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-gray-900 border border-[#D2B48C] rounded-lg p-6 w-full max-w-md shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-[#D2B48C] uppercase tracking-widest">Modificar Reserva</h3>
                            <button onClick={() => setEditingReservation(null)} className="text-gray-500 hover:text-white">✕</button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-bold uppercase text-gray-500 block mb-1">Banda</label>
                                <div className="text-white font-bold text-lg">{editingReservation.bandName}</div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <Input 
                                    type="date" 
                                    label="Fecha" 
                                    value={editForm.date || ''} 
                                    onChange={e => setEditForm({ ...editForm, date: e.target.value })} 
                                />
                                <Select 
                                    label="Sala" 
                                    value={editForm.roomId || ''} 
                                    onChange={e => setEditForm({ ...editForm, roomId: e.target.value })}
                                >
                                    {rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                                </Select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <Select 
                                    label="Inicio" 
                                    value={editForm.timeStart || ''} 
                                    onChange={e => setEditForm({ ...editForm, timeStart: e.target.value })}
                                >
                                    {hours.map(h => <option key={h} value={h}>{h}</option>)}
                                </Select>
                                <Select 
                                    label="Fin" 
                                    value={editForm.timeEnd || ''} 
                                    onChange={e => setEditForm({ ...editForm, timeEnd: e.target.value })}
                                >
                                    {hours.map(h => <option key={h} value={h}>{h}</option>)}
                                </Select>
                            </div>

                            <div className="flex flex-col gap-3 pt-6 border-t border-gray-800">
                                <Button onClick={handleSaveEdit} className="w-full">Guardar Cambios</Button>
                                <div className="flex gap-2">
                                    <Button onClick={handleDelete} variant="secondary" className="flex-1 bg-red-900/20 border-red-500 text-red-500 hover:bg-red-900/40">
                                        {showDeleteConfirm ? "¿Confirmar?" : "Eliminar"}
                                    </Button>
                                    <Button onClick={() => setEditingReservation(null)} variant="secondary" className="flex-1">
                                        Cancelar
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
