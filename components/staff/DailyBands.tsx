import React, { useState } from 'react';
import { Reservation, Room, RoomColor, Product, Consumption } from '../../types';
import { Button } from '../ui/Button';
import { Input, CurrencyInput } from '../ui/Input';
import { Trash, Minus, Plus } from 'lucide-react';

interface DailyBandsProps {
  reservations: Reservation[];
  rooms: Room[];
  onAddConsumption: (reservationId: string, item: Product) => void;
  consumptions: Consumption[];
  products: Product[];
  onCloseBand: (reservationId: string, method: 'CASH' | 'MERCADOPAGO' | 'DEBT', partialAmount?: number) => void;
  onDayClose: () => void;
  onToggleAbono?: (id: string) => void;
  onDeleteReservation?: (id: string) => void;
  onUpdateConsumption: (resId: string, productId: string, change: number, isDelete?: boolean) => void;
  isClosingView?: boolean; // New Prop to control Close Button
}

export const DailyBands: React.FC<DailyBandsProps> = ({ 
    reservations, rooms, onAddConsumption, consumptions, products, onCloseBand, onDayClose, onToggleAbono, onDeleteReservation, onUpdateConsumption, isClosingView = false
}) => {
  // ...
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const handleDeleteRes = (id: string) => {
      if (!onDeleteReservation) return;
      if (showDeleteConfirm !== id) {
          setShowDeleteConfirm(id);
          return;
      }
      onDeleteReservation(id);
      setShowDeleteConfirm(null);
  };
  // Fix timezone issue for "Today"
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const todayDate = new Date(now.getTime() - (offset*60*1000));
  const today = todayDate.toISOString().split('T')[0];
  
  const formatMoney = (val: number) => val.toLocaleString('es-AR');

  const todaysBands = reservations.filter(r => r.date === today && r.status === 'CONFIRMED');
  const closedBandsToday = reservations.filter(r => r.date === today && r.status === 'COMPLETED');
  
  // State to manage payment selection popup
  const [paymentSelection, setPaymentSelection] = useState<string | null>(null);
  
  // DEBT MODAL STATE
  const [debtModalOpen, setDebtModalOpen] = useState(false);
  const [selectedDebtRes, setSelectedDebtRes] = useState<string | null>(null);
  const [debtTotal, setDebtTotal] = useState(0);
  const [partialPay, setPartialPay] = useState(0);

  const getRoomStyle = (room: Room) => {
    return {
        borderColor: room.hex,
        boxShadow: `0 0 10px ${room.hex}33` // 33 is 20% opacity in hex
    };
  };

  const handleClose = (resId: string, method: 'CASH' | 'MERCADOPAGO' | 'DEBT') => {
      if (method === 'DEBT') {
          // Calculate Total
          const res = reservations.find(r => r.id === resId);
          const cons = consumptions.find(c => c.reservationId === resId);
          if (res) {
              const roomPrice = res.isAbono ? 0 : res.totalAmount;
              const total = (cons?.total || 0) + roomPrice;
              setDebtTotal(total);
              setSelectedDebtRes(resId);
              setPartialPay(0);
              setDebtModalOpen(true);
          }
          return;
      }

      onCloseBand(resId, method);
      setPaymentSelection(null);
      alert("Cobrado correctamente");
  };

  const confirmDebt = () => {
      if (!selectedDebtRes) return;
      
      if (partialPay > debtTotal) return alert("El importe abonado no puede superar el total.");

      const newBalance = debtTotal - partialPay;
      
      onCloseBand(selectedDebtRes, 'DEBT', partialPay);
      alert(`Deuda registrada.\nTotal: $${formatMoney(debtTotal)}\nAbonado: $${formatMoney(partialPay)}\nSaldo Deuda (Imputado a Banda): $${formatMoney(newBalance)}`);
      
      setDebtModalOpen(false);
      setSelectedDebtRes(null);
      setPaymentSelection(null);
  };
  
  const handleManualProduct = (resId: string) => {
      const description = prompt("Descripción del item (ej. Pago Deuda):", "Pago Deuda / Varios");
      if (!description) return;
      const priceStr = prompt("Ingrese monto:", "0");
      if (!priceStr) return;
      
      // Remove dots for parsing
      const amount = parseInt(priceStr.replace(/\./g, ''));
      if (isNaN(amount) || amount <= 0) return alert("Monto inválido");
      
      // Construct a temporary product
      const tempProd: Product = {
          id: 'manual_' + Date.now(),
          name: description,
          price: amount,
          cost: 0,
          stock: 999,
          category: 'BAR'
      };
      onAddConsumption(resId, tempProd);
  };

  const handleDayCloseClick = () => {
      onDayClose();
      // Alert handled in App.tsx but also here for redundancy if prop is used differently
  };

  return (
    <div className="space-y-6">
      
      {/* DEBT MODAL POPUP */}
      {debtModalOpen && (
          <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
              <div className="bg-gray-900 border border-red-500 p-6 rounded max-w-sm w-full space-y-4">
                  <h3 className="text-xl font-bold text-red-500 uppercase">Registrar Deuda</h3>
                  <div className="bg-black/50 p-3 rounded">
                      <div className="flex justify-between text-gray-400">
                          <span>Total a Pagar:</span>
                          <span className="text-white font-bold">${formatMoney(debtTotal)}</span>
                      </div>
                  </div>
                  
                  <CurrencyInput 
                    label="Importe Abonado (Entrega)" 
                    value={partialPay} 
                    onChange={setPartialPay} 
                    placeholder="0"
                  />
                  
                  <div className="bg-red-900/20 p-3 rounded border border-red-900">
                      <div className="flex justify-between text-red-300">
                          <span>Nuevo Saldo Deuda:</span>
                          <span className="font-bold text-xl">${formatMoney(debtTotal - partialPay)}</span>
                      </div>
                      <p className="text-[10px] text-gray-500 mt-1">* Este saldo se imputará a la banda y alertará en futuras reservas.</p>
                  </div>

                  <div className="flex gap-2">
                      <Button onClick={confirmDebt} variant="danger" className="flex-1">Confirmar</Button>
                      <Button onClick={() => setDebtModalOpen(false)} variant="secondary" className="flex-1">Cancelar</Button>
                  </div>
              </div>
          </div>
      )}

      {/* Daily Summary Header */}
      <div className="bg-gray-800 p-4 rounded border border-[#D2B48C]/30 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-[#D2B48C]">Resumen del Día ({today})</h2>
            <div className="text-sm">
                Bandas Activas: {todaysBands.length} | Cerradas: {closedBandsToday.length}
            </div>
          </div>
          {isClosingView && (
            <Button onClick={handleDayCloseClick} variant="danger">Cerrar Caja del Día</Button>
          )}
      </div>

      {todaysBands.length === 0 && closedBandsToday.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No hay bandas para hoy.</div>
      ) : (
          todaysBands.map(res => {
            const room = rooms.find(r => r.id === res.roomId);
            const consumption = consumptions.find(c => c.reservationId === res.id);
            
            if (!room) return null;

            // Abono Logic: Room Price is 0 if it is an Abono
            const roomPrice = res.isAbono ? 0 : res.totalAmount;
            const currentTotal = (consumption?.total || 0) + roomPrice; 
            
            return (
                <div key={res.id} className="bg-gray-900 border-l-4 p-4 rounded relative" style={getRoomStyle(room)}>
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                                {res.bandName}
                                {res.isAbono && <span className="bg-yellow-600 text-black text-xs px-2 py-0.5 rounded font-bold">ABONO</span>}
                            </h3>
                            <p className="text-[#D2B48C]">{res.timeStart} - {res.timeEnd} / {room.name}</p>
                            
                            {onToggleAbono && (
                                <button 
                                    onClick={() => onToggleAbono(res.id)} 
                                    className="text-[10px] text-gray-500 underline mt-1 hover:text-white"
                                >
                                    {res.isAbono ? 'Desmarcar Abono' : 'Marcar como Abono'}
                                </button>
                            )}
                            {onDeleteReservation && (
                                <button 
                                    onClick={() => handleDeleteRes(res.id)} 
                                    className={`text-[10px] underline mt-1 ml-4 transition-colors ${showDeleteConfirm === res.id ? 'text-red-500 font-bold' : 'text-gray-500 hover:text-red-400'}`}
                                >
                                    {showDeleteConfirm === res.id ? '¿CONFIRMAR ELIMINAR?' : 'Eliminar Reserva'}
                                </button>
                            )}
                        </div>
                        <div className="text-right">
                            <span className="text-xs text-gray-500 uppercase">Total a Cobrar</span>
                            <div className="text-xl font-bold">${formatMoney(currentTotal)}</div>
                            {res.isAbono && <span className="text-xs text-green-500 font-bold">Sala Bonificada (Abono)</span>}
                        </div>
                    </div>

                    {/* Bar Section */}
                    <div className="mb-4 bg-black/20 p-3 rounded border border-gray-800">
                        <p className="text-xs uppercase text-gray-500 mb-2 font-bold">Consumo Barra</p>
                        
                        <div className="flex flex-wrap gap-2 mb-3 max-h-40 overflow-y-auto">
                            {products.filter(p => (p.category === 'BAR' || p.category === 'VITRINA') && p.id !== 'bar_generic' && p.id !== 'pago_deuda' && p.id !== 'v10').map(p => (
                                <button 
                                    key={p.id}
                                    onClick={() => onAddConsumption(res.id, p)}
                                    className={`px-2 py-1 border rounded text-xs text-left transition-all
                                        ${p.category === 'VITRINA' ? 'bg-amber-900/20 border-amber-600 text-amber-200 hover:bg-amber-800' : 'bg-gray-800 border-gray-600 text-white hover:bg-gray-700 hover:border-[#D2B48C]'}
                                    `}
                                >
                                    {p.name} <span className="text-gray-400">(${formatMoney(p.price)})</span>
                                </button>
                            ))}
                            {/* Manual Debt Payment Item */}
                            <button 
                                onClick={() => handleManualProduct(res.id)}
                                className="px-2 py-1 bg-blue-900/30 border border-blue-600 rounded text-xs hover:bg-blue-800 text-blue-200"
                            >
                                + Pago Deuda / Varios
                            </button>
                        </div>
                    </div>

                    {/* Items Consumed List with Quantity Controls */}
                    {consumption && consumption.items.length > 0 && (
                        <div className="bg-black/30 p-2 rounded mb-4 text-sm space-y-1">
                            {consumption.items.map((item, idx) => (
                                <div key={item.productId} className="flex justify-between items-center border-b border-gray-800 py-1 last:border-0 hover:bg-white/5 px-2 rounded">
                                    <div className="flex-1">
                                        <span className="font-bold">{item.name}</span>
                                        <div className="text-[10px] text-gray-400">${formatMoney(item.price)} c/u</div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-1 bg-gray-800 rounded">
                                            <button 
                                                onClick={() => onUpdateConsumption(res.id, item.productId, -1)}
                                                className="px-2 py-1 hover:bg-gray-700 text-gray-400"
                                            >
                                                <Minus size={10} />
                                            </button>
                                            <span className="w-6 text-center text-xs font-bold">{item.quantity}</span>
                                            <button 
                                                onClick={() => onUpdateConsumption(res.id, item.productId, 1)}
                                                className="px-2 py-1 hover:bg-gray-700 text-white"
                                            >
                                                <Plus size={10} />
                                            </button>
                                        </div>
                                        <span className="w-16 text-right font-bold">${formatMoney(item.price * item.quantity)}</span>
                                        <button 
                                            onClick={() => onUpdateConsumption(res.id, item.productId, 0, true)}
                                            className="text-red-500 hover:text-red-400 ml-2"
                                            title="Eliminar item"
                                        >
                                            <Trash size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Close Action */}
                    <div className="mt-4 pt-4 border-t border-gray-800 relative">
                        {paymentSelection === res.id ? (
                            <div className="flex gap-2 animate-fade-in">
                                <Button variant="primary" className="flex-1 text-sm" onClick={() => handleClose(res.id, 'CASH')}>
                                    Efectivo
                                </Button>
                                <Button variant="secondary" className="flex-1 text-sm" onClick={() => handleClose(res.id, 'MERCADOPAGO')}>
                                    MercadoPago
                                </Button>
                                {/* NEW DEBT BUTTON */}
                                <Button className="flex-1 text-sm border-red-500 text-red-500 hover:bg-red-900/30" onClick={() => handleClose(res.id, 'DEBT')}>
                                    Deuda
                                </Button>
                                <button onClick={() => setPaymentSelection(null)} className="px-2 text-red-500">X</button>
                            </div>
                        ) : (
                            <Button className="w-full text-sm font-bold" onClick={() => setPaymentSelection(res.id)}>
                                COBRAR
                            </Button>
                        )}
                    </div>
                </div>
            );
          })
      )}

      {todaysBands.length === 0 && closedBandsToday.length > 0 && (
          <div className="p-4 bg-green-900/20 border border-green-900 rounded text-center">
              <h3 className="text-green-500 font-bold">Todas las bandas de hoy han sido cobradas.</h3>
          </div>
      )}
    </div>
  );
};