import React, { useState } from 'react';
import { Contact, Reservation, Consumption, Product } from '../../types';
import { Button } from '../ui/Button';

interface PointsViewProps {
  contacts: Contact[];
  reservations: Reservation[];
  consumptions: Consumption[];
  products: Product[];
  onUpdateContact: (contact: Contact) => void;
  onApplyReward: (contactId: string, type: 'IPA' | 'PIZZA' | 'DISCOUNT' | 'RECORDING') => void;
}

export const PointsView: React.FC<PointsViewProps> = ({ 
    contacts, 
    reservations, 
    consumptions, 
    products,
    onUpdateContact,
    onApplyReward
}) => {
  const [editingPoints, setEditingPoints] = useState<{id: string, value: number} | null>(null);

  const formatMoney = (val: number) => val.toLocaleString('es-AR');

  const handleSavePoints = () => {
      if (!editingPoints) return;
      const contact = contacts.find(c => c.id === editingPoints.id);
      if (contact) {
          onUpdateContact({ ...contact, points: editingPoints.value });
      }
      setEditingPoints(null);
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 p-4 rounded border border-[#D2B48C]/30 text-center">
          <h2 className="text-xl font-bold text-[#D2B48C]">SISTEMA DE PUNTOS</h2>
          <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest">Fidelización de Bandas</p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-gray-900 p-4 rounded border border-gray-800">
              <h3 className="text-sm font-bold text-[#D2B48C] mb-2 uppercase">Regla: Asistencia</h3>
              <p className="text-xs text-gray-400 italic">3 veces seguidas sin faltas = 3 puntos</p>
          </div>
          <div className="bg-gray-900 p-4 rounded border border-gray-800">
              <h3 className="text-sm font-bold text-[#D2B48C] mb-2 uppercase">Regla: Alquiler</h3>
              <p className="text-xs text-gray-400 italic">1 instrumento por semana = 1 punto</p>
          </div>
          <div className="bg-gray-900 p-4 rounded border border-gray-800">
              <h3 className="text-sm font-bold text-[#D2B48C] mb-2 uppercase">Regla: Barra</h3>
              <p className="text-xs text-gray-400 italic">Más de 5 items de barra = 2 puntos</p>
          </div>
      </div>

      <div className="bg-gray-900 p-6 rounded border border-[#D2B48C]/20">
          <h3 className="text-lg font-bold text-[#D2B48C] mb-4 uppercase tracking-widest border-b border-[#D2B48C]/20 pb-2">Sección Premios</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-3 border border-gray-800 rounded bg-black/30">
                  <div className="text-xs text-gray-500 uppercase mb-1">25 Puntos</div>
                  <div className="font-bold text-white">2 IPA Lager Gratis</div>
              </div>
              <div className="p-3 border border-gray-800 rounded bg-black/30">
                  <div className="text-xs text-gray-500 uppercase mb-1">50 Puntos</div>
                  <div className="font-bold text-white">1 Pizza Gratis</div>
              </div>
              <div className="p-3 border border-gray-800 rounded bg-black/30">
                  <div className="text-xs text-gray-500 uppercase mb-1">75 Puntos</div>
                  <div className="font-bold text-white">10% Off Próxima Reserva</div>
              </div>
              <div className="p-3 border border-gray-800 rounded bg-black/30">
                  <div className="text-xs text-gray-500 uppercase mb-1">100 Puntos</div>
                  <div className="font-bold text-white">Grabación Gratis</div>
              </div>
          </div>
          <p className="text-[10px] text-gray-500 mt-4 italic">* Los puntos tienen una validez de 60 días desde su obtención.</p>
      </div>

      <div className="bg-black/50 rounded border border-gray-800 overflow-hidden">
          <table className="w-full text-left text-sm">
              <thead className="bg-gray-900 text-[#D2B48C]">
                  <tr>
                      <th className="p-3">Banda</th>
                      <th className="p-3 text-center">Puntos Actuales</th>
                      <th className="p-3 text-center">Estado</th>
                      <th className="p-3 text-right">Acciones</th>
                  </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                  {contacts.sort((a, b) => (b.points || 0) - (a.points || 0)).map(c => (
                      <tr key={c.id} className={ (c.points || 0) >= 20 ? 'bg-yellow-900/10' : ''}>
                          <td className="p-3">
                              <div className="font-bold text-white">{c.bandName}</div>
                              <div className="text-xs text-gray-500">{c.responsibleName || c.name}</div>
                          </td>
                          <td className="p-3 text-center">
                              {editingPoints?.id === c.id ? (
                                  <input 
                                      type="number" 
                                      className="w-16 bg-black border border-[#D2B48C] text-white text-center rounded"
                                      value={editingPoints.value}
                                      onChange={e => setEditingPoints({...editingPoints, value: Number(e.target.value)})}
                                  />
                              ) : (
                                  <span className={`text-lg font-bold ${(c.points || 0) >= 20 ? 'text-yellow-400' : 'text-white'}`}>
                                      {c.points || 0}
                                  </span>
                              )}
                          </td>
                          <td className="p-3 text-center">
                              {(c.points || 0) >= 20 ? (
                                  <span className="px-2 py-0.5 bg-yellow-500 text-black text-[10px] font-bold rounded uppercase animate-pulse">
                                      ¡PREMIO DISPONIBLE!
                                  </span>
                              ) : (
                                  <span className="text-gray-600 text-[10px] uppercase">En progreso</span>
                              )}
                          </td>
                          <td className="p-3 text-right">
                              <div className="flex justify-end items-center gap-3">
                                  {editingPoints?.id === c.id ? (
                                      <div className="flex gap-2">
                                          <button onClick={handleSavePoints} className="text-green-500 hover:text-white text-xs underline">Guardar</button>
                                          <button onClick={() => setEditingPoints(null)} className="text-gray-500 hover:text-white text-xs underline">Cancelar</button>
                                      </div>
                                  ) : (
                                      <>
                                          <div className="flex gap-1">
                                              {(c.points || 0) >= 25 && <button onClick={() => onApplyReward(c.id, 'IPA')} className="bg-blue-900/50 hover:bg-blue-800 text-blue-200 text-[9px] px-1.5 py-0.5 rounded border border-blue-700">IPA</button>}
                                              {(c.points || 0) >= 50 && <button onClick={() => onApplyReward(c.id, 'PIZZA')} className="bg-orange-900/50 hover:bg-orange-800 text-orange-200 text-[9px] px-1.5 py-0.5 rounded border border-orange-700">Pizza</button>}
                                              {(c.points || 0) >= 75 && <button onClick={() => onApplyReward(c.id, 'DISCOUNT')} className="bg-purple-900/50 hover:bg-purple-800 text-purple-200 text-[9px] px-1.5 py-0.5 rounded border border-purple-700">10%</button>}
                                              {(c.points || 0) >= 100 && <button onClick={() => onApplyReward(c.id, 'RECORDING')} className="bg-red-900/50 hover:bg-red-800 text-red-200 text-[9px] px-1.5 py-0.5 rounded border border-red-700">Grab.</button>}
                                          </div>
                                          <button 
                                              onClick={() => setEditingPoints({id: c.id, value: c.points || 0})}
                                              className="text-[#D2B48C] hover:text-white text-xs underline"
                                          >
                                              Ajustar
                                          </button>
                                      </>
                                  )}
                              </div>
                          </td>
                      </tr>
                  ))}
              </tbody>
          </table>
      </div>
    </div>
  );
};
