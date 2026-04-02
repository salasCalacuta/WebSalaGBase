

import React, { useState, useMemo, useEffect } from 'react';
import { Reservation, Room, RoomColor } from '../../types';
import { Button } from '../ui/Button';
import { ROOMS } from '../../constants';
import { X, Check } from 'lucide-react';

interface ReservationsViewProps {
  reservations: Reservation[];
  onUpdateStatus: (id: string, status: Reservation['status']) => void;
  onDelete?: (id: string) => void;
  onToggleAbono: (id: string) => void;
  startDate?: string;
  endDate?: string;
}

const WEEKDAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

export const ReservationsView: React.FC<ReservationsViewProps> = ({ 
    reservations, 
    onUpdateStatus, 
    onDelete, 
    onToggleAbono,
    startDate: propStartDate,
    endDate: propEndDate
}) => {
  // Range State
  const [internalStartDate, setInternalStartDate] = useState('');
  const [internalEndDate, setInternalEndDate] = useState('');
  
  const startDate = propStartDate || internalStartDate;
  const endDate = propEndDate || internalEndDate;
  
  // Modal State
  const [selectedEvent, setSelectedEvent] = useState<Reservation | null>(null);
  const [showCancelOptions, setShowCancelOptions] = useState(false);

  // Initialize with Today -> +28 days (4 weeks)
  useEffect(() => {
    if (!propStartDate) {
        const today = new Date();
        setInternalStartDate(today.toISOString().split('T')[0]);
    }
    
    if (!propEndDate) {
        const today = new Date();
        const future = new Date(today);
        future.setDate(future.getDate() + 27);
        setInternalEndDate(future.toISOString().split('T')[0]);
    }
  }, [propStartDate, propEndDate]);

  // --- Logic ---

  // Generate array of dates between start and end
  const dateRange = useMemo(() => {
      if (!startDate || !endDate) return [];
      const start = new Date(startDate);
      const end = new Date(endDate);
      const dates = [];
      
      // Limit to avoid crashes
      if ((end.getTime() - start.getTime()) > (1000 * 60 * 60 * 24 * 90)) {
          return []; // Max 90 days
      }

      for(let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          dates.push(new Date(d));
      }
      return dates;
  }, [startDate, endDate]);

  const getReservationsForDay = (dateObj: Date) => {
      // Create local YYYY-MM-DD
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const day = String(dateObj.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      
      // Show CONFIRMED, PENDING, and COMPLETED
      // REJECTED usually filtered out, but if we want to show 'X', we might need them? 
      // Prompt says "si no asistió, una cruz". Usually rejected are hidden, but let's include all to show history if needed.
      // Or maybe strictly Confirmed/Completed for agenda. Let's include everything so we can see the X.
      return reservations.filter(r => r.date === dateStr);
  };

  const roomColorBg = (color: RoomColor) => {
      switch(color) {
          case RoomColor.BLUE: return 'bg-blue-900/50 border-blue-500';
          case RoomColor.GREEN: return 'bg-green-900/50 border-green-500';
          case RoomColor.VIOLET: return 'bg-purple-900/50 border-purple-500';
          case RoomColor.RED: return 'bg-red-900/50 border-red-500';
          default: return 'bg-gray-800';
      }
  }

  const handleConfirmReservation = () => {
    if (!selectedEvent) return;
    onUpdateStatus(selectedEvent.id, 'CONFIRMED');
    setSelectedEvent(null);
    setShowCancelOptions(false);
  };

  const handleCancelByBand = () => {
      if (!selectedEvent) return;
      onUpdateStatus(selectedEvent.id, 'REJECTED');
      setSelectedEvent(null);
      setShowCancelOptions(false);
  };

  const handleCancelByError = () => {
      if (!selectedEvent || !onDelete) return;
      onDelete(selectedEvent.id);
      setSelectedEvent(null);
      setShowCancelOptions(false);
  };

  return (
    <div className="space-y-6 relative">
      
      {/* --- DETAIL MODAL --- */}
      {selectedEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
              <div className="bg-gray-900 border border-[#D2B48C] rounded-lg w-full max-w-md p-6 relative shadow-2xl">
                  <button 
                    onClick={() => { setSelectedEvent(null); setShowCancelOptions(false); }}
                    className="absolute top-4 right-4 text-gray-500 hover:text-white"
                  >
                      <X size={24} />
                  </button>

                  <h3 className="text-2xl font-bold text-[#D2B48C] mb-2">{selectedEvent.bandName}</h3>
                  <div className="flex items-center gap-2 mb-4">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold 
                        ${selectedEvent.status === 'PENDING' ? 'bg-yellow-600 text-black' : 
                          selectedEvent.status === 'COMPLETED' ? 'bg-green-600 text-white' : 
                          selectedEvent.status === 'REJECTED' ? 'bg-red-900 text-red-200' : 'bg-blue-600 text-white'}`}>
                          {selectedEvent.status === 'PENDING' ? 'PENDIENTE' : 
                           selectedEvent.status === 'CONFIRMED' ? 'CONFIRMADO' : 
                           selectedEvent.status === 'COMPLETED' ? 'ASISTIÓ / COBRADO' : 'CANCELADO'}
                      </span>
                      {selectedEvent.isAbono && <span className="bg-yellow-500 text-black text-xs font-bold px-2 py-0.5 rounded">ABONO</span>}
                  </div>

                  <div className="space-y-3 text-sm text-gray-300">
                      <p><strong className="text-gray-500 uppercase">Fecha:</strong> {selectedEvent.date}</p>
                      <p><strong className="text-gray-500 uppercase">Horario:</strong> {selectedEvent.timeStart} - {selectedEvent.timeEnd}</p>
                      <p><strong className="text-gray-500 uppercase">Sala:</strong> {ROOMS.find(r => r.id === selectedEvent.roomId)?.name}</p>
                      <p><strong className="text-gray-500 uppercase">Precio:</strong> ${selectedEvent.totalAmount}</p>
                      <p><strong className="text-gray-500 uppercase">Contacto:</strong> {selectedEvent.clientName}</p>
                  </div>

                  <div className="border-t border-gray-800 mt-6 pt-4 flex flex-col gap-3">
                      
                      {/* Actions for Pending */}
                      {selectedEvent.status === 'PENDING' && (
                          <div className="flex gap-2">
                              <Button variant="success" className="flex-1" onClick={handleConfirmReservation}>
                                  Aprobar Solicitud
                              </Button>
                          </div>
                      )}

                      {/* General Actions */}
                      {!showCancelOptions ? (
                        <div className="flex gap-2">
                            <Button variant="danger" className="flex-1" onClick={() => setShowCancelOptions(true)}>
                                Cancelar Reserva
                            </Button>
                            {selectedEvent.status === 'CONFIRMED' && (
                                <Button 
                                    variant="secondary" 
                                    className="flex-1"
                                    onClick={() => { onToggleAbono(selectedEvent.id); setSelectedEvent(null); }}
                                >
                                    {selectedEvent.isAbono ? 'Quitar Abono' : 'Marcar Abono'}
                                </Button>
                            )}
                        </div>
                      ) : (
                        <div className="bg-gray-800 p-3 rounded border border-red-900/50">
                            <p className="text-xs text-red-400 font-bold mb-2 uppercase text-center">Seleccione motivo de cancelación:</p>
                            <div className="flex gap-2">
                                <Button variant="secondary" className="flex-1 text-xs" onClick={handleCancelByBand}>
                                    Por Banda
                                    <span className="block text-[9px] text-gray-500 font-normal">(Suma al historial)</span>
                                </Button>
                                <Button variant="danger" className="flex-1 text-xs" onClick={handleCancelByError}>
                                    Error Interno
                                    <span className="block text-[9px] text-red-300 font-normal">(Borrar registro)</span>
                                </Button>
                            </div>
                            <button onClick={() => setShowCancelOptions(false)} className="w-full text-center text-xs text-gray-500 mt-2 hover:text-white underline">Volver atrás</button>
                        </div>
                      )}
                  </div>
              </div>
          </div>
      )}

      {/* --- CONTROLS --- */}
      {!propStartDate && !propEndDate && (
        <div className="bg-gray-900 p-4 rounded border border-[#D2B48C]/30 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex gap-2 items-center bg-black/50 p-2 rounded">
                <span className="text-xs text-gray-500 uppercase mr-2">Desde (Hoy):</span>
                <input 
                    type="date" 
                    value={startDate} 
                    onChange={e => setInternalStartDate(e.target.value)} 
                    className="bg-gray-800 text-white text-xs p-1 rounded border border-gray-700"
                />
                <span className="text-gray-500 text-xs uppercase ml-2">Hasta:</span>
                <input 
                    type="date" 
                    value={endDate} 
                    onChange={e => setInternalEndDate(e.target.value)} 
                    className="bg-gray-800 text-white text-xs p-1 rounded border border-gray-700"
                />
            </div>
        </div>
      )}
      
      {/* --- GRID VIEW --- */}
      <div className="overflow-x-auto">
        <div className="min-w-[800px]"> 
            {/* 
               Grid Layout: Strict 7 columns.
               Starts from Start Date (Today).
               Wraps automatically.
            */}
            <div className={`grid gap-2 grid-cols-7`}>
                {dateRange.map((day) => {
                    const dayReservations = getReservationsForDay(day);
                    // Standard JS day index: 0=Sun, 1=Mon...
                    const dayIndex = day.getDay();
                    const dayName = WEEKDAYS[dayIndex === 0 ? 6 : dayIndex - 1]; // Map to Lun-Dom array
                    const dateDisplay = day.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' });

                    return (
                        <div key={day.toISOString()} className="border border-gray-800 rounded bg-gray-900 min-h-[150px] flex flex-col relative group hover:border-[#D2B48C]/30 transition-colors">
                            <div className="p-2 border-b border-gray-800 flex justify-between items-center bg-black/40">
                                <span className="text-[#D2B48C] font-bold text-sm uppercase">{dayName}</span>
                                <span className="text-gray-500 text-xs">{dateDisplay}</span>
                            </div>
                            
                            <div className="p-1 flex-1 flex flex-col gap-1 overflow-y-auto max-h-[300px] scrollbar-hide">
                                {dayReservations.length === 0 && <span className="text-[10px] text-gray-600 text-center mt-4">- Libre -</span>}
                                {dayReservations
                                    .sort((a,b) => a.timeStart.localeCompare(b.timeStart))
                                    .map(res => {
                                        const room = ROOMS.find(r => r.id === res.roomId);
                                        return (
                                            <button 
                                                key={res.id} 
                                                onClick={() => setSelectedEvent(res)}
                                                className={`p-2 rounded border text-left flex flex-col leading-tight transition-all hover:scale-[1.02] 
                                                    ${room ? roomColorBg(room.color) : ''}
                                                    ${res.status === 'PENDING' ? 'border-dashed border-yellow-500/50 opacity-80' : ''}
                                                    ${res.status === 'REJECTED' ? 'opacity-50 border-red-900 bg-red-900/10' : ''}
                                                `}
                                            >
                                                <div className="flex justify-between items-center w-full mb-1">
                                                    <span className="font-bold text-white text-xs">{res.timeStart}</span>
                                                    {res.status === 'PENDING' && <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></span>}
                                                    {res.status === 'COMPLETED' && <Check size={12} className="text-green-400" />}
                                                    {res.status === 'REJECTED' && <X size={12} className="text-red-400" />}
                                                </div>
                                                <div className="truncate font-semibold text-gray-200 text-xs w-full" title={res.bandName}>
                                                    {res.bandName}
                                                </div>
                                                {res.isAbono && <span className="text-[9px] text-yellow-400 font-bold">★ ABONO</span>}
                                            </button>
                                        )
                                    })
                                }
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
      </div>
    </div>
  );
};
