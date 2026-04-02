import React, { useState } from 'react';
import { MaintenanceItem, Room } from '../../types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface MaintenanceViewProps {
  items: MaintenanceItem[];
  rooms: Room[];
  onUpdateItem: (item: MaintenanceItem) => void;
  onCreateItem: (item: MaintenanceItem) => void;
  onPayRepair: (item: MaintenanceItem, cost: number) => void;
}

type ModalType = 'ENVIAR' | 'PRESUPUESTO' | 'RETIRO' | 'NUEVO' | null;

export const MaintenanceView: React.FC<MaintenanceViewProps> = ({ items, rooms, onUpdateItem, onCreateItem, onPayRepair }) => {
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [selectedItem, setSelectedItem] = useState<MaintenanceItem | null>(null);
  const [selectedRoomId, setSelectedRoomId] = useState<string>('');

  // Form State
  const [dateVal, setDateVal] = useState('');
  const [textVal, setTextVal] = useState(''); // Motivo or Estimated Time or Name
  const [amountVal, setAmountVal] = useState(''); // Budget or Cost

  const openModal = (type: ModalType, item: MaintenanceItem | null = null, roomId: string = '') => {
    setSelectedItem(item);
    setActiveModal(type);
    setSelectedRoomId(roomId);
    setDateVal(new Date().toISOString().split('T')[0]);
    setTextVal('');
    setAmountVal('');
  };

  const closeModal = () => {
    setActiveModal(null);
    setSelectedItem(null);
    setSelectedRoomId('');
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (activeModal === 'NUEVO') {
        const newItem: MaintenanceItem = {
            id: Date.now().toString(),
            name: textVal,
            roomId: selectedRoomId,
            status: 'OK'
        };
        onCreateItem(newItem);
        closeModal();
        return;
    }

    if (!selectedItem) return;

    let updated = { ...selectedItem };

    if (activeModal === 'ENVIAR') {
        updated.status = 'REPAIR';
        updated.repairDate = dateVal;
        updated.reason = textVal;
    } else if (activeModal === 'PRESUPUESTO') {
        updated.budget = Number(amountVal);
        updated.estimatedTime = textVal;
    } else if (activeModal === 'RETIRO') {
        updated.returnDate = dateVal;
        const costToPay = Number(amountVal) || selectedItem.budget || 0;
        updated.actualCost = costToPay;
        updated.status = 'OK'; // Return to Sala
        onPayRepair(updated, costToPay);
        closeModal();
        return; 
    }

    onUpdateItem(updated);
    closeModal();
  };

  const itemsInRepair = items.filter(i => i.status === 'REPAIR');

  return (
    <div className="space-y-8">
      {/* MODAL */}
      {activeModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
              <div className="bg-gray-900 border border-[#D2B48C] p-6 rounded w-full max-w-md space-y-4">
                  <h3 className="text-xl font-bold text-[#D2B48C]">
                      {activeModal === 'ENVIAR' && 'Enviar a Reparación'}
                      {activeModal === 'PRESUPUESTO' && 'Cargar Presupuesto'}
                      {activeModal === 'RETIRO' && 'Reingreso (Vuelta a Stock)'}
                      {activeModal === 'NUEVO' && 'Nuevo Item de Mantenimiento'}
                  </h3>
                  {selectedItem && <p className="text-white font-bold">{selectedItem.name}</p>}
                  {activeModal === 'NUEVO' && <p className="text-white font-bold">Sala: {rooms.find(r => r.id === selectedRoomId)?.name}</p>}

                  <form onSubmit={handleSubmit} className="space-y-4">
                      {activeModal === 'NUEVO' && (
                          <Input label="Nombre del Item (Ej: Aire Acondicionado, Consola)" value={textVal} onChange={e => setTextVal(e.target.value)} required />
                      )}

                      {activeModal === 'ENVIAR' && (
                          <>
                            <Input type="date" label="Fecha Envío" value={dateVal} onChange={e => setDateVal(e.target.value)} required />
                            <Input label="Motivo / Falla" value={textVal} onChange={e => setTextVal(e.target.value)} required />
                          </>
                      )}

                      {activeModal === 'PRESUPUESTO' && (
                          <>
                            <Input type="number" label="Importe $" value={amountVal} onChange={e => setAmountVal(e.target.value)} required />
                            <Input label="Tiempo Estimado" value={textVal} onChange={e => setTextVal(e.target.value)} required />
                          </>
                      )}

                      {activeModal === 'RETIRO' && (
                          <>
                            <p className="text-xs text-red-400">Al confirmar, el item vuelve a stock y se descuenta el pago de la caja.</p>
                            <Input type="date" label="Fecha Reingreso" value={dateVal} onChange={e => setDateVal(e.target.value)} required />
                            <Input type="number" label="Monto Final (Pago)" value={amountVal} onChange={e => setAmountVal(e.target.value)} placeholder={selectedItem?.budget?.toString()} required />
                          </>
                      )}

                      <div className="flex gap-2 pt-2">
                          <Button type="submit" className="flex-1">Confirmar</Button>
                          <Button type="button" onClick={closeModal} variant="secondary" className="flex-1">Cancelar</Button>
                      </div>
                  </form>
              </div>
          </div>
      )}

      {/* REPAIRS IN PROGRESS SECTION */}
      {itemsInRepair.length > 0 && (
          <div className="border border-red-500 bg-red-900/10 p-4 rounded mb-6">
              <h2 className="text-xl font-bold text-red-500 mb-4 uppercase">Items en Reparación</h2>
              <div className="grid gap-3">
                  {itemsInRepair.map(item => (
                      <div key={item.id} className="bg-black/50 p-3 rounded flex justify-between items-center border border-red-900/50">
                          <div>
                              <div className="font-bold text-white">{item.name}</div>
                              <div className="text-xs text-gray-400">
                                  {rooms.find(r => r.id === item.roomId)?.name} - Envío: {item.repairDate}
                              </div>
                              {item.reason && <div className="text-xs text-red-300">Motivo: {item.reason}</div>}
                              <div className="text-xs text-red-500 italic mt-1 font-bold">EN REPARACIÓN</div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="secondary" className="text-xs" onClick={() => openModal('PRESUPUESTO', item)}>
                                Presupuesto
                            </Button>
                            <Button variant="success" className="text-xs" onClick={() => openModal('RETIRO', item)}>
                                Reingreso
                            </Button>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      )}

      {/* LIST BY ROOM (Only show OK status items) */}
      {rooms.map(room => (
          <div key={room.id} className="border border-gray-800 rounded p-4 bg-gray-900/50">
              <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold" style={{ color: room.hex }}>Mantenimiento {room.name}</h2>
                  <Button variant="secondary" className="text-xs py-1" onClick={() => openModal('NUEVO', null, room.id)}>
                      + Agregar Item
                  </Button>
              </div>
              <div className="grid gap-4">
                  {items.filter(i => i.roomId === room.id && i.status === 'OK').map(item => (
                      <div key={item.id} className="flex flex-col md:flex-row justify-between items-start bg-black p-3 rounded border border-gray-800 gap-4">
                          <div className="flex-1">
                              <div className="font-bold text-white text-lg">{item.name}</div>
                              <div className="text-sm font-bold text-green-500">EN SALA</div>
                          </div>
                          
                          <div className="flex flex-col gap-2 w-full md:w-auto min-w-[140px]">
                              <Button variant="danger" className="text-xs w-full" onClick={() => openModal('ENVIAR', item)}>
                                  Enviar
                              </Button>
                          </div>
                      </div>
                  ))}
                  {items.filter(i => i.roomId === room.id && i.status === 'OK').length === 0 && (
                      <p className="text-gray-500 text-sm italic">No hay items registrados o todos están en reparación.</p>
                  )}
              </div>
              {/* Legend */}
              <div className="mt-4 pt-4 border-t border-gray-800 text-center">
                 <p className="text-[10px] text-[#D2B48C] font-bold uppercase tracking-widest animate-pulse">
                   Aire Acondicionado y Servicio de Bar
                 </p>
              </div>
          </div>
      ))}
    </div>
  );
};