
import React, { useState, useMemo } from 'react';
import { StaffShift } from '../../types';
import { Button } from '../ui/Button';
import { Input, Select } from '../ui/Input';
import { Pencil } from 'lucide-react';

interface StaffScheduleViewProps {
  shifts: StaffShift[];
  onAddShift: (shift: StaffShift) => void;
  onRemoveShift: (id: string) => void;
  onUpdateShift?: (shift: StaffShift) => void;
  staffUsers: string[];
}

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

export const StaffScheduleView: React.FC<StaffScheduleViewProps> = ({ 
  shifts, 
  onAddShift, 
  onRemoveShift, 
  onUpdateShift,
  staffUsers
}) => {
  const [staff, setStaff] = useState(staffUsers[0] || '');
  const [day, setDay] = useState(DAYS[0]);
  const [start, setStart] = useState('14:00');
  const [end, setEnd] = useState('22:00');
  
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleAddOrUpdate = () => {
    if (editingId && onUpdateShift) {
        onUpdateShift({
            id: editingId,
            staffName: staff,
            dayOfWeek: day,
            timeStart: start,
            timeEnd: end
        });
        setEditingId(null);
    } else {
        onAddShift({
            id: Date.now().toString(),
            staffName: staff,
            dayOfWeek: day,
            timeStart: start,
            timeEnd: end
        });
    }
    // Reset defaults (optional)
  };

  const handleEdit = (shift: StaffShift) => {
      setEditingId(shift.id);
      setStaff(shift.staffName);
      setDay(shift.dayOfWeek);
      setStart(shift.timeStart);
      setEnd(shift.timeEnd);
  };

  const handleCancelEdit = () => {
      setEditingId(null);
      setStart('14:00');
      setEnd('22:00');
  }

  // Helper to calculate duration for summary
  const calculateDuration = (s: string, e: string) => {
      let [h1, m1] = s.split(':').map(Number);
      let [h2, m2] = e.split(':').map(Number);
      
      // Handle 23:59 as 24:00 rule
      if (h2 === 23 && m2 === 59) { h2 = 24; m2 = 0; }
      // Handle 00:00 as midnight (next day) if start is not 0
      if (h2 === 0 && (h1 > 0 || m1 > 0)) h2 = 24;

      const t1 = h1 + m1/60;
      const t2 = h2 + m2/60;
      return Math.max(0, t2 - t1);
  };

  // Calculate Summary
  const staffSummary = useMemo(() => {
      const summary: Record<string, { count: number, totalHours: number }> = {};
      
      staffUsers.forEach(u => {
          summary[u] = { count: 0, totalHours: 0 };
      });

      shifts.forEach(s => {
          if (summary[s.staffName]) {
              summary[s.staffName].count += 1;
              summary[s.staffName].totalHours += calculateDuration(s.timeStart, s.timeEnd);
          }
      });

      return summary;
  }, [shifts, staffUsers]);

  return (
    <div className="space-y-8">
      
      {/* ADD/EDIT FORM */}
      <div className="bg-gray-900 p-6 rounded border border-[#D2B48C]/30">
          <h3 className="text-xl font-bold text-[#D2B48C] mb-4">
              {editingId ? 'Modificar Horario Personal' : 'Asignar Horario Personal'}
          </h3>
          <div className="flex flex-col md:flex-row gap-4 items-end">
              <Select label="Personal" value={staff} onChange={e => setStaff(e.target.value)}>
                  {staffUsers.map(u => <option key={u} value={u}>{u}</option>)}
              </Select>
              <Select label="Día" value={day} onChange={e => setDay(e.target.value)}>
                  {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
              </Select>
              <Input type="time" label="Entrada" value={start} onChange={e => setStart(e.target.value)} />
              <Input type="time" label="Salida" value={end} onChange={e => setEnd(e.target.value)} />
              
              <div className="flex gap-2">
                  <Button onClick={handleAddOrUpdate}>
                      {editingId ? 'Actualizar' : 'Asignar'}
                  </Button>
                  {editingId && (
                      <Button variant="secondary" onClick={handleCancelEdit}>
                          Cancelar
                      </Button>
                  )}
              </div>
          </div>
      </div>

      {/* SCHEDULE GRID */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {DAYS.map(d => {
              // Filter and SORT by time
              const daysShifts = shifts
                .filter(s => s.dayOfWeek === d)
                .sort((a, b) => a.timeStart.localeCompare(b.timeStart));

              return (
                <div key={d} className="border border-gray-800 bg-gray-900 rounded p-4">
                    <h4 className="font-bold text-[#D2B48C] mb-2 uppercase">{d}</h4>
                    <ul className="space-y-2">
                        {daysShifts.map(s => (
                            <li key={s.id} className="flex justify-between items-center text-sm bg-black p-2 rounded">
                                <div>
                                    <span className="font-bold text-white">{s.staffName}</span>
                                    <div className="text-gray-500">{s.timeStart} - {s.timeEnd}</div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => handleEdit(s)} className="text-blue-500 hover:text-blue-400">
                                        <Pencil size={14} />
                                    </button>
                                    <button onClick={() => onRemoveShift(s.id)} className="text-red-500 hover:text-red-400">x</button>
                                </div>
                            </li>
                        ))}
                        {daysShifts.length === 0 && <li className="text-gray-600 text-xs italic">Sin asignar</li>}
                    </ul>
                </div>
              );
          })}
      </div>

      {/* SUMMARY SECTION */}
      <div className="bg-gray-900 p-6 rounded border border-[#D2B48C]/30 mt-8">
          <h3 className="text-xl font-bold text-[#D2B48C] mb-4">Resumen Semanal por Personal</h3>
          <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                  <thead className="bg-gray-800 text-[#D2B48C]">
                      <tr>
                          <th className="p-3">Personal</th>
                          <th className="p-3 text-center">Turnos (Veces p/sem)</th>
                          <th className="p-3 text-center">Total Horas Semanales</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                      {staffUsers.map(user => (
                          <tr key={user} className="hover:bg-white/5">
                              <td className="p-3 font-bold text-white">{user}</td>
                              <td className="p-3 text-center">{staffSummary[user]?.count || 0}</td>
                              <td className="p-3 text-center text-[#D2B48C] font-bold">
                                  {(staffSummary[user]?.totalHours || 0).toFixed(2)} hs
                              </td>
                          </tr>
                      ))}
                  </tbody>
              </table>
          </div>
      </div>
    </div>
  );
};
