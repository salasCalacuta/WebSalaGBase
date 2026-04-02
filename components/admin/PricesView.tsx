import React, { useState, useEffect } from 'react';
import { Trash2, Plus, RefreshCw } from 'lucide-react';
import { Product, Room } from '../../types';
import { Button } from '../ui/Button';
import { Input, Select } from '../ui/Input';

interface PricesViewProps {
  products: Product[];
  onUpdateProduct: (p: Product) => void;
  onDeleteProduct: (id: string) => void;
  onBulkUpdate: (percent: number, category: string | 'ALL') => void;
  onCreateProduct: (p: Product) => void;
  rooms?: Room[];
  onUpdateRoom?: (r: Room) => void;
  onDeleteRoom?: (id: string) => void;
  onLoadDefaults: () => void;
}

const RoomPriceRow: React.FC<{ room: Room; onSave: (r: Room) => void; onDelete: (id: string) => void }> = ({ room, onSave, onDelete }) => {
    const [name, setName] = useState(room.name);
    const [price, setPrice] = useState(room.price.toString());
    const [hasChanges, setHasChanges] = useState(false);

    const handleApply = () => {
        onSave({ ...room, name, price: Number(price) });
        setHasChanges(false);
    };

    return (
        <tr className="border-b border-gray-800 last:border-0">
            <td className="p-3">
                <input 
                    type="text" 
                    value={name} 
                    onChange={e => { setName(e.target.value); setHasChanges(true); }}
                    className="bg-black border border-gray-800 rounded p-1 w-full text-sm font-bold"
                    style={{ color: room.hex }}
                />
            </td>
            <td className="p-3">
                <input 
                    type="number" 
                    value={price} 
                    onChange={e => { setPrice(e.target.value); setHasChanges(true); }}
                    className="bg-black border border-[#D2B48C]/50 rounded p-1 w-24 text-[#D2B48C] font-bold"
                />
            </td>
            <td className="p-3 flex gap-2">
                {hasChanges && (
                    <button onClick={handleApply} className="bg-green-700 hover:bg-green-600 text-white text-[10px] px-2 py-1 rounded uppercase font-bold">
                        OK
                    </button>
                )}
                <button 
                  onClick={() => { if(window.confirm('¿Eliminar sala?')) onDelete(room.id); }}
                  className="text-red-500 hover:text-red-400 p-1"
                >
                  <Trash2 size={14} />
                </button>
            </td>
        </tr>
    );
};

const PriceRow: React.FC<{ product: Product; onSave: (p: Product) => void; onDelete: (id: string) => void }> = ({ product, onSave, onDelete }) => {
    const [name, setName] = useState(product.name);
    const [cost, setCost] = useState(product.cost.toString());
    const [percent, setPercent] = useState('');
    const [price, setPrice] = useState(product.price.toString());
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        if (product.cost > 0) {
            setPercent(((product.price - product.cost) / product.cost * 100).toFixed(0));
        }
    }, [product]);

    const handleCostChange = (val: string) => {
        setCost(val);
        setHasChanges(true);
        if (percent) {
            const c = Number(val);
            const p = c + (c * Number(percent) / 100);
            setPrice(Math.ceil(p).toString());
        }
    };

    const handlePercentChange = (val: string) => {
        setPercent(val);
        setHasChanges(true);
        const c = Number(cost);
        const p = c + (c * Number(val) / 100);
        setPrice(Math.ceil(p).toString());
    };

    const handlePriceChange = (val: string) => {
        setPrice(val);
        setHasChanges(true);
        const p = Number(val);
        const c = Number(cost);
        if (c > 0) {
            setPercent(((p - c) / c * 100).toFixed(0));
        }
    };

    const handleApply = () => {
        onSave({
            ...product,
            name,
            cost: Number(cost),
            price: Number(price)
        });
        setHasChanges(false);
    };

    return (
        <tr>
            <td className="p-3">
                <input 
                    type="text" 
                    value={name} 
                    onChange={e => { setName(e.target.value); setHasChanges(true); }}
                    className="bg-black border border-gray-800 rounded p-1 w-full text-sm font-bold text-gray-300"
                />
                <div className="text-[9px] opacity-50 uppercase tracking-widest mt-1">{product.category}</div>
            </td>
            <td className="p-3 text-center">
                <input 
                    type="number" 
                    value={cost} 
                    onChange={e => handleCostChange(e.target.value)}
                    className="bg-black border border-gray-700 rounded p-1 w-16 text-gray-300 text-xs text-center"
                />
            </td>
            <td className="p-3 text-center">
                    <input 
                    type="number" 
                    value={percent}
                    onChange={e => handlePercentChange(e.target.value)}
                    className="bg-black border border-gray-700 rounded p-1 w-12 text-gray-300 text-xs text-center"
                />
            </td>
            <td className="p-3 text-center">
                <input 
                    type="number" 
                    value={price} 
                    onChange={e => handlePriceChange(e.target.value)}
                    className="bg-black border border-[#D2B48C]/50 rounded p-1 w-16 text-[#D2B48C] font-bold text-xs text-center"
                />
            </td>
            <td className="p-3">
                <div className="flex gap-2 items-center justify-center">
                  {hasChanges && (
                      <button onClick={handleApply} className="bg-green-700 hover:bg-green-600 text-white text-[10px] px-2 py-1 rounded uppercase font-bold">
                          OK
                      </button>
                  )}
                  <button 
                    onClick={() => { if(window.confirm('¿Eliminar producto?')) onDelete(product.id); }}
                    className="text-red-500 hover:text-red-400 p-1"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
            </td>
        </tr>
    );
};

export const PricesView: React.FC<PricesViewProps> = ({ products, onUpdateProduct, onDeleteProduct, onCreateProduct, rooms, onUpdateRoom, onDeleteRoom, onLoadDefaults }) => {
  const [showNewModal, setShowNewModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCost, setNewCost] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newStock, setNewStock] = useState('');
  const [newCat, setNewCat] = useState<'BAR'|'INSTRUMENT'|'PROMO'|'VITRINA'>('BAR');

  const handleCreateSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const newItem: Product = {
          id: Date.now().toString(),
          name: newName,
          cost: Number(newCost),
          price: Number(newPrice),
          stock: Number(newStock),
          category: newCat
      };
      onCreateProduct(newItem);
      setShowNewModal(false);
      setNewName(''); setNewCost(''); setNewPrice(''); setNewStock('');
  };

  return (
    <div className="space-y-8">
      {/* Create Modal */}
      {showNewModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
              <div className="bg-gray-900 border border-[#D2B48C] p-6 rounded w-full max-w-md">
                  <h3 className="text-xl font-bold text-[#D2B48C] mb-4">Crear Nuevo Item / Promo</h3>
                  <form onSubmit={handleCreateSubmit} className="space-y-3">
                      <Input label="Nombre" value={newName} onChange={e => setNewName(e.target.value)} required />
                      <div className="flex gap-2">
                        <Input type="number" label="Costo" value={newCost} onChange={e => setNewCost(e.target.value)} required />
                        <Input type="number" label="Venta" value={newPrice} onChange={e => setNewPrice(e.target.value)} required />
                      </div>
                      <Input type="number" label="Stock Inicial" value={newStock} onChange={e => setNewStock(e.target.value)} required />
                      <Select label="Categoría" value={newCat} onChange={e => setNewCat(e.target.value as any)}>
                          <option value="BAR">Barra</option>
                          <option value="INSTRUMENT">Instrumento</option>
                          <option value="PROMO">Promoción</option>
                          <option value="VITRINA">Vitrina</option>
                      </Select>
                      <div className="flex gap-2 pt-4">
                          <Button type="submit" className="flex-1">Crear</Button>
                          <Button type="button" variant="secondary" onClick={() => setShowNewModal(false)} className="flex-1">Cancelar</Button>
                      </div>
                  </form>
              </div>
          </div>
      )}

      {/* Room Prices Section */}
      {rooms && onUpdateRoom && (
          <div className="grid md:grid-cols-2 gap-8">
              <div>
                  <h3 className="text-xl font-bold text-[#D2B48C] mb-4">Precios de Salas</h3>
                  <div className="bg-gray-900 rounded border border-gray-800 overflow-hidden">
                      <table className="w-full text-left text-sm">
                          <thead className="bg-gray-800 text-[#D2B48C]">
                              <tr>
                                  <th className="p-3">Sala</th>
                                  <th className="p-3">Precio Actual</th>
                                  <th className="p-3">Acción</th>
                              </tr>
                          </thead>
                          <tbody>
                              {rooms.map(r => (
                                  <RoomPriceRow 
                                    key={r.id} 
                                    room={r} 
                                    onSave={onUpdateRoom} 
                                    onDelete={onDeleteRoom!}
                                  />
                              ))}
                          </tbody>
                      </table>
                  </div>
                  {/* Legend */}
                  <div className="mt-4 pt-4 border-t border-gray-800 text-center">
                     <p className="text-[10px] text-[#D2B48C] font-bold uppercase tracking-widest animate-pulse">
                       Aire Acondicionado y Servicio de Bar
                     </p>
                  </div>
              </div>

              <div>
                  <h3 className="text-xl font-bold text-[#D2B48C] mb-4">Precios de Vitrina</h3>
                  <div className="bg-gray-900 rounded border border-gray-800 overflow-hidden">
                      <table className="w-full text-left text-sm">
                          <thead className="bg-gray-800 text-[#D2B48C]">
                              <tr>
                                  <th className="p-3">Item</th>
                                  <th className="p-3">Precio Actual</th>
                                  <th className="p-3">Acción</th>
                              </tr>
                          </thead>
                          <tbody>
                              {products.filter(p => p.category === 'VITRINA').map(p => (
                                  <PriceRow 
                                    key={p.id} 
                                    product={p} 
                                    onSave={onUpdateProduct} 
                                    onDelete={onDeleteProduct}
                                  />
                              ))}
                          </tbody>
                      </table>
                  </div>
              </div>
          </div>
      )}

      {/* Actions Bar */}
      <div className="flex flex-col md:flex-row gap-4 pt-4 border-t border-[#D2B48C]/20">
          <Button onClick={() => { setNewCat('BAR'); setShowNewModal(true); }} className="flex-1">
              + Nuevo Producto
          </Button>
          <Button onClick={() => { setNewCat('PROMO'); setShowNewModal(true); }} className="flex-1">
              + Crear Promoción
          </Button>
          <Button variant="secondary" onClick={onLoadDefaults} className="flex-1">
              Cargar Predeterminados
          </Button>
      </div>

      {/* Individual List with Margin Calc */}
      <div>
          <h3 className="text-xl font-bold text-[#D2B48C] mb-4">Lista de Productos / Promos</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm bg-gray-900 rounded border border-gray-800">
                <thead className="bg-gray-800 text-[#D2B48C]">
                    <tr>
                        <th className="p-3">Producto</th>
                        <th className="p-3 w-24">Costo</th>
                        <th className="p-3 w-20">Porcentaje %</th>
                        <th className="p-3 w-24">Venta</th>
                        <th className="p-3 w-20">Acción</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                    {products.filter(p => p.id !== 'bar_generic' && p.category !== 'VITRINA').map(p => (
                        <PriceRow 
                          key={p.id} 
                          product={p} 
                          onSave={onUpdateProduct} 
                          onDelete={onDeleteProduct}
                        />
                    ))}
                </tbody>
            </table>
          </div>
      </div>
    </div>
  );
};