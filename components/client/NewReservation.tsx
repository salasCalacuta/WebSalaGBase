import React, { useState, useMemo } from 'react';
import { Room, Product } from '../../types';
import { Button } from '../ui/Button';
import { Input, Select } from '../ui/Input';

interface NewReservationProps {
  onReserve: (data: { date: string; timeStart: string; timeEnd: string; roomId: string; instruments?: string[]; recordingHours?: number }) => void;
  userBandName: string;
  onSuccessRedirect: () => void;
  rooms: Room[];
  instrumentsList: Product[];
}

export const NewReservation: React.FC<NewReservationProps> = ({ onReserve, userBandName, onSuccessRedirect, rooms, instrumentsList }) => {
  const [date, setDate] = useState('');
  const [timeStart, setTimeStart] = useState('14:00');
  const [timeEnd, setTimeEnd] = useState('16:00');
  const [roomId, setRoomId] = useState(rooms[0]?.id || 'sala1');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [instruments, setInstruments] = useState<string[]>([]);
  const [recordingHours, setRecordingHours] = useState('0');

  const handleInstrumentToggle = (id: string) => {
    if (instruments.includes(id)) {
      setInstruments(instruments.filter(i => i !== id));
    } else {
      setInstruments([...instruments, id]);
    }
  };

  // Generate full hours 10 to 00
  const hours = useMemo(() => {
    const list = [];
    // 10:00 to 23:00
    for(let i=10; i<=23; i++) list.push(`${i}:00`);
    // 00:00
    list.push('00:00');
    return list;
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    // Date validation
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(date + 'T00:00:00');
    if (selectedDate < today) {
        alert("fecha incorrecta");
        return;
    }

    if (timeStart === timeEnd) {
        alert("La hora de inicio y fin no pueden ser iguales.");
        return;
    }
    
    setIsSubmitting(true);
    
    // Simulate short delay for UX
    setTimeout(() => {
        onReserve({ date, timeStart, timeEnd, roomId, instruments, recordingHours: Number(recordingHours) });
        alert("Ya enviamos tu solicitud. Por favor, espera que lo veamos y te confirmamos o denegamos la reserva. Gracias!");
        setIsSubmitting(false);
        setDate(''); 
        onSuccessRedirect(); // Switch view
    }, 500);
  };

  return (
    <div className="max-w-md mx-auto bg-gray-900 p-6 rounded border border-[#D2B48C]/30">
        <h2 className="text-xl font-bold text-[#D2B48C] mb-6 text-center uppercase">Nueva Reserva</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-xs uppercase text-gray-500 mb-1">Banda</label>
                <div className="p-2 border border-gray-700 rounded text-gray-300 bg-gray-800 cursor-not-allowed">
                    {userBandName}
                </div>
            </div>
            
            <Input 
                type="date" 
                label="Fecha" 
                value={date} 
                onChange={e => setDate(e.target.value)} 
                required 
                min={new Date().toLocaleDateString('en-CA')}
            />
            
            <div className="flex gap-4">
                <Select label="Desde" value={timeStart} onChange={e => setTimeStart(e.target.value)}>
                    {hours.map(h => <option key={h} value={h}>{h}</option>)}
                </Select>
                <Select label="Hasta" value={timeEnd} onChange={e => setTimeEnd(e.target.value)}>
                    {hours.map(h => <option key={h} value={h}>{h}</option>)}
                </Select>
            </div>

            <Select label="Sala" value={roomId} onChange={e => setRoomId(e.target.value)}>
                {rooms.map(r => (
                    <option key={r.id} value={r.id}>{r.name} - ${r.price}</option>
                ))}
            </Select>

            <div className="space-y-2">
                <label className="block text-xs uppercase text-gray-500 font-bold">Instrumentos</label>
                <div className="grid grid-cols-2 gap-2">
                    {instrumentsList.map(inst => (
                        <label key={inst.id} className="flex items-center gap-2 p-2 bg-gray-800 rounded border border-gray-700 cursor-pointer hover:bg-gray-700 transition-colors">
                            <input 
                                type="checkbox" 
                                checked={instruments.includes(inst.id)}
                                onChange={() => handleInstrumentToggle(inst.id)}
                                className="accent-[#D2B48C]"
                            />
                            <span className="text-xs text-gray-300">{inst.name} (${inst.price})</span>
                        </label>
                    ))}
                </div>
            </div>

            <Input 
                type="number" 
                label="Horas de Grabación" 
                value={recordingHours} 
                onChange={e => setRecordingHours(e.target.value)} 
            />

            <div className="pt-4">
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? "Enviando..." : "Solicitar Reserva"}
                </Button>
            </div>
        </form>
    </div>
  );
};