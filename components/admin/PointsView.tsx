import React, { useState } from 'react';
import { Contact, Reservation, Consumption, Product, GlobalConfig } from '../../types';
import { Button } from '../ui/Button';
import { Trash2 } from 'lucide-react';

interface PointsViewProps {
  contacts: Contact[];
  reservations: Reservation[];
  consumptions: Consumption[];
  products: Product[];
  onUpdateContact: (contact: Contact) => void;
  onApplyReward: (contactId: string, type: string) => void;
  config: GlobalConfig;
  onUpdateConfig: (config: GlobalConfig) => void;
}

export const PointsView: React.FC<PointsViewProps> = ({ 
    contacts, 
    reservations, 
    consumptions, 
    products,
    onUpdateContact,
    onApplyReward,
    config,
    onUpdateConfig
}) => {
  const [editingPoints, setEditingPoints] = useState<{id: string, value: number} | null>(null);
  const [showConfig, setShowConfig] = useState(false);

  const formatMoney = (val: number) => val.toLocaleString('es-AR');

  const handleSavePoints = () => {
      if (!editingPoints) return;
      const contact = contacts.find(c => c.id === editingPoints.id);
      if (contact) {
          onUpdateContact({ ...contact, points: editingPoints.value });
      }
      setEditingPoints(null);
  };

  const handleUpdateRule = (id: string, field: 'label' | 'description', value: string) => {
      const newRules = (config.pointsRules || []).map(r => r.id === id ? { ...r, [field]: value } : r);
      onUpdateConfig({ ...config, pointsRules: newRules });
  };

  const handleAddRule = () => {
      const newRule = { id: `rule_${Date.now()}`, label: 'Nueva Regla', description: 'Descripción de la regla' };
      onUpdateConfig({ ...config, pointsRules: [...(config.pointsRules || []), newRule] });
  };

  const handleRemoveRule = (id: string) => {
      const newRules = (config.pointsRules || []).filter(r => r.id !== id);
      onUpdateConfig({ ...config, pointsRules: newRules });
  };

  const handleUpdateReward = (id: string, field: 'label' | 'points' | 'description', value: any) => {
      const newRewards = (config.pointsRewards || []).map(r => r.id === id ? { ...r, [field]: value } : r);
      onUpdateConfig({ ...config, pointsRewards: newRewards });
  };

  const handleAddReward = () => {
      const newReward = { id: `reward_${Date.now()}`, label: 'Nuevo Premio', points: 10, description: 'Descripción del premio' };
      onUpdateConfig({ ...config, pointsRewards: [...(config.pointsRewards || []), newReward] });
  };

  const handleRemoveReward = (id: string) => {
      const newRewards = (config.pointsRewards || []).filter(r => r.id !== id);
      onUpdateConfig({ ...config, pointsRewards: newRewards });
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 p-4 rounded border border-[#D2B48C]/30 flex justify-between items-center">
          <div className="text-center flex-1">
              <h2 className="text-xl font-bold text-[#D2B48C]">SISTEMA DE PUNTOS</h2>
              <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest">Fidelización de Bandas</p>
          </div>
          <Button 
            onClick={() => setShowConfig(!showConfig)}
            variant="outline"
            className="text-[10px] h-8"
          >
            {showConfig ? 'Ver Puntos' : 'Configurar Reglas'}
          </Button>
      </div>

      {showConfig ? (
          <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="bg-gray-900 p-6 rounded border border-[#D2B48C]/20">
                  <div className="flex justify-between items-center mb-6 border-b border-[#D2B48C]/20 pb-2">
                      <h3 className="text-lg font-bold text-[#D2B48C] uppercase tracking-widest">Editar Reglas</h3>
                      <Button onClick={handleAddRule} variant="secondary" className="text-[10px] h-7">+ Agregar Regla</Button>
                  </div>
                  <div className="grid gap-4">
                      {(config.pointsRules || []).map(rule => (
                          <div key={rule.id} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-4 p-4 bg-black/30 border border-gray-800 rounded items-end">
                              <div className="space-y-2">
                                  <label className="text-[10px] text-gray-500 uppercase font-bold">Título</label>
                                  <input 
                                      className="w-full bg-black border border-gray-800 p-2 text-white text-sm rounded focus:border-[#D2B48C] outline-none"
                                      value={rule.label}
                                      onChange={(e) => handleUpdateRule(rule.id, 'label', e.target.value)}
                                  />
                              </div>
                              <div className="space-y-2">
                                  <label className="text-[10px] text-gray-500 uppercase font-bold">Descripción</label>
                                  <input 
                                      className="w-full bg-black border border-gray-800 p-2 text-white text-sm rounded focus:border-[#D2B48C] outline-none"
                                      value={rule.description}
                                      onChange={(e) => handleUpdateRule(rule.id, 'description', e.target.value)}
                                  />
                              </div>
                              <Button onClick={() => handleRemoveRule(rule.id)} variant="danger" className="p-2 h-9">
                                  <Trash2 size={14} />
                              </Button>
                          </div>
                      ))}
                  </div>
              </div>

              <div className="bg-gray-900 p-6 rounded border border-[#D2B48C]/20">
                  <div className="flex justify-between items-center mb-6 border-b border-[#D2B48C]/20 pb-2">
                      <h3 className="text-lg font-bold text-[#D2B48C] uppercase tracking-widest">Editar Premios</h3>
                      <Button onClick={handleAddReward} variant="secondary" className="text-[10px] h-7">+ Agregar Premio</Button>
                  </div>
                  <div className="grid gap-4">
                      {(config.pointsRewards || []).map(reward => (
                          <div key={reward.id} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_auto] gap-4 p-4 bg-black/30 border border-gray-800 rounded items-end">
                              <div className="space-y-2">
                                  <label className="text-[10px] text-gray-500 uppercase font-bold">Premio</label>
                                  <input 
                                      className="w-full bg-black border border-gray-800 p-2 text-white text-sm rounded focus:border-[#D2B48C] outline-none"
                                      value={reward.label}
                                      onChange={(e) => handleUpdateReward(reward.id, 'label', e.target.value)}
                                  />
                              </div>
                              <div className="space-y-2">
                                  <label className="text-[10px] text-gray-500 uppercase font-bold">Puntos Requeridos</label>
                                  <input 
                                      type="number"
                                      className="w-full bg-black border border-gray-800 p-2 text-white text-sm rounded focus:border-[#D2B48C] outline-none"
                                      value={reward.points}
                                      onChange={(e) => handleUpdateReward(reward.id, 'points', Number(e.target.value))}
                                  />
                              </div>
                              <div className="space-y-2">
                                  <label className="text-[10px] text-gray-500 uppercase font-bold">Descripción</label>
                                  <input 
                                      className="w-full bg-black border border-gray-800 p-2 text-white text-sm rounded focus:border-[#D2B48C] outline-none"
                                      value={reward.description}
                                      onChange={(e) => handleUpdateReward(reward.id, 'description', e.target.value)}
                                  />
                              </div>
                              <Button onClick={() => handleRemoveReward(reward.id)} variant="danger" className="p-2 h-9">
                                  <Trash2 size={14} />
                              </Button>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      ) : (
          <>
            <div className="grid md:grid-cols-3 gap-4">
                {(config.pointsRules || []).map(rule => (
                    <div key={rule.id} className="bg-gray-900 p-4 rounded border border-gray-800">
                        <h3 className="text-sm font-bold text-[#D2B48C] mb-2 uppercase">{rule.label}</h3>
                        <p className="text-xs text-gray-400 italic">{rule.description}</p>
                    </div>
                ))}
            </div>

            <div className="bg-gray-900 p-6 rounded border border-[#D2B48C]/20">
                <h3 className="text-lg font-bold text-[#D2B48C] mb-4 uppercase tracking-widest border-b border-[#D2B48C]/20 pb-2">Sección Premios</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {(config.pointsRewards || []).map(reward => (
                        <div key={reward.id} className="p-3 border border-gray-800 rounded bg-black/30">
                            <div className="text-xs text-gray-500 uppercase mb-1">{reward.points} Puntos</div>
                            <div className="font-bold text-white">{reward.label}</div>
                        </div>
                    ))}
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
                                                    {(config.pointsRewards || []).map(reward => (
                                                        (c.points || 0) >= reward.points && (
                                                            <button 
                                                                key={reward.id}
                                                                onClick={() => onApplyReward(c.id, reward.id)} 
                                                                className="bg-blue-900/50 hover:bg-blue-800 text-blue-200 text-[9px] px-1.5 py-0.5 rounded border border-blue-700"
                                                                title={reward.label}
                                                            >
                                                                {reward.label.split(' ')[0]}
                                                            </button>
                                                        )
                                                    ))}
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
          </>
      )}
    </div>
  );
};
