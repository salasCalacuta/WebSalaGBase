import React from 'react';
import { Product, Reservation, MaintenanceItem, Room } from '../../types';
import { Button } from '../ui/Button';

interface InstrumentsViewProps {
  instruments: Product[];
  reservations: Reservation[];
  maintenanceItems: MaintenanceItem[];
  rooms: Room[];
  onAssignInstrument: (resId: string, instrument: Product) => void;
  onSendToMaintenance: (name: string, roomId: string) => void;
}

export const InstrumentsView: React.FC<InstrumentsViewProps> = ({ 
    instruments, 
    reservations, 
    maintenanceItems,
    rooms,
    onAssignInstrument, 
    onSendToMaintenance 
}) => {
  const today = new Date().toLocaleDateString('en-CA');
  const todaysBands = reservations.filter(r => r.date === today && r.status === 'CONFIRMED');

  const handleAssign = (resId: string, inst: Product) => {
      onAssignInstrument(resId, inst);
      alert(`Instrumento ${inst.name} asignado a la banda.`);
  };

  const handleMaintenanceClick = (instrumentName: string) => {
      const roomId = prompt(`¿A qué sala corresponde el instrumento/equipo? (${rooms.map(r => r.id).join(', ')})`);
      if (roomId && rooms.some(r => r.id === roomId)) {
          onSendToMaintenance(instrumentName, roomId);
          alert(`Enviado a mantenimiento: ${instrumentName} (${roomId})`);
      } else {
          alert("ID de sala inválido o cancelado");
      }
  };

  const handleRoomEquipmentRepair = (item: MaintenanceItem) => {
      if (item.status === 'REPAIR') return;
      if (window.confirm(`¿Enviar ${item.name} a reparación?`)) {
          onSendToMaintenance(item.name, item.roomId);
          alert(`Enviado a mantenimiento: ${item.name}`);
      }
  };

  // Filter instruments: Exclude those whose name matches a maintenance item in 'REPAIR' status
  const availableInstruments = instruments.filter(inst => {
      if (inst.category !== 'INSTRUMENT') return false;
      const isInRepair = maintenanceItems.some(m => m.name === inst.name && m.status === 'REPAIR');
      return !isInRepair;
  });

  return (
    <div className="space-y-8">
        <div className="grid lg:grid-cols-2 gap-8">
            {/* Rental Section */}
            <div className="bg-gray-900 border border-blue-900/50 p-4 rounded">
                <h3 className="text-xl font-bold text-blue-400 mb-4">Alquilar Instrumento a Banda</h3>
                {todaysBands.length === 0 ? (
                    <p className="text-gray-500">No hay bandas confirmadas hoy.</p>
                ) : (
                    <div className="space-y-4">
                        {todaysBands.map(res => (
                            <div key={res.id} className="border border-gray-700 p-3 rounded">
                                <div className="font-bold text-white">{res.bandName}</div>
                                <div className="text-xs text-gray-500 mb-2">{res.timeStart} - {rooms.find(r => r.id === res.roomId)?.name}</div>
                                <div className="flex flex-wrap gap-2">
                                    {availableInstruments.length === 0 && <span className="text-gray-500 text-xs">No hay instrumentos disponibles.</span>}
                                    {availableInstruments.map(inst => (
                                        <button 
                                            key={inst.id}
                                            onClick={() => handleAssign(res.id, inst)}
                                            className="px-2 py-1 bg-gray-800 hover:bg-blue-900 text-xs rounded border border-gray-600"
                                        >
                                            + {inst.name} (${inst.price})
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Maintenance Trigger Section */}
            <div className="space-y-6">
                
                {/* 1. Instruments Rental Maintenance */}
                <div className="bg-gray-900 border border-red-900/50 p-4 rounded">
                    <h3 className="text-xl font-bold text-red-400 mb-4">Mantenimiento: Instrumentos Alquiler</h3>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                        {instruments.filter(i => i.category === 'INSTRUMENT').map(inst => {
                            const isInRepair = maintenanceItems.some(m => m.name === inst.name && m.status === 'REPAIR');
                            return (
                                <div key={inst.id} className="flex justify-between items-center border-b border-gray-800 pb-2">
                                    <span className={isInRepair ? "text-red-500 line-through" : "text-gray-200"}>
                                        {inst.name}
                                    </span>
                                    {isInRepair ? (
                                        <span className="text-xs text-red-500 italic">En reparación</span>
                                    ) : (
                                        <Button variant="danger" className="py-1 px-2 text-xs" onClick={() => handleMaintenanceClick(inst.name)}>
                                            Reparar
                                        </Button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* 2. Room Equipment Maintenance */}
                 <div className="bg-gray-900 border border-orange-900/50 p-4 rounded">
                    <h3 className="text-xl font-bold text-orange-400 mb-4">Mantenimiento: Equipos de Sala</h3>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                        {rooms.map(room => (
                            <div key={room.id} className="border-b border-gray-800 pb-2 mb-2">
                                <h4 className="font-bold text-[#D2B48C] mb-2">{room.name}</h4>
                                <div className="space-y-1 pl-2">
                                    {maintenanceItems.filter(m => m.roomId === room.id).map(item => (
                                        <div key={item.id} className="flex justify-between items-center text-sm">
                                            <span className={item.status === 'REPAIR' ? 'text-red-500 line-through' : 'text-gray-300'}>
                                                {item.name}
                                            </span>
                                            {item.status === 'OK' && (
                                                <button 
                                                    onClick={() => handleRoomEquipmentRepair(item)}
                                                    className="text-xs text-red-500 hover:underline border border-red-900/30 px-2 py-0.5 rounded"
                                                >
                                                    Enviar a Reparar
                                                </button>
                                            )}
                                            {item.status === 'REPAIR' && (
                                                <span className="text-xs text-red-500 italic">En reparación</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    </div>
  );
};