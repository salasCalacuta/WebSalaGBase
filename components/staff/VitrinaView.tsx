
import React, { useState } from 'react';
import { Product } from '../../types';
import { Button } from '../ui/Button';

interface VitrinaViewProps {
  products: Product[];
  onAddTransaction: (amount: number, method: 'CASH' | 'MERCADOPAGO' | 'DEBT', descriptionSuffix?: string) => void;
  onUpdateStock: (product: Product) => void;
}

export const VitrinaView: React.FC<VitrinaViewProps> = ({ products, onAddTransaction, onUpdateStock }) => {
  const [cart, setCart] = useState<{product: Product, quantity: number, customName?: string}[]>([]);
  const formatMoney = (val: number) => val.toLocaleString('es-AR');

  const addToCart = (p: Product) => {
      if (p.stock <= 0 && p.id !== 'v10') return alert("Sin stock");
      
      if (p.id === 'v10') {
          const customName = prompt("Ingrese el nombre del item:");
          if (!customName) return;
          const customPrice = prompt("Ingrese el precio:");
          if (!customPrice || isNaN(Number(customPrice))) return;
          
          setCart([...cart, {
              product: {...p, name: customName, price: Number(customPrice)}, 
              quantity: 1,
              customName
          }]);
          return;
      }

      const existing = cart.find(i => i.product.id === p.id);
      if (existing) {
          setCart(cart.map(i => i.product.id === p.id ? {...i, quantity: i.quantity + 1} : i));
      } else {
          setCart([...cart, {product: p, quantity: 1}]);
      }
  };

  const removeFromCart = (idx: number) => {
      setCart(cart.filter((_, i) => i !== idx));
  };

  const total = cart.reduce((acc, curr) => acc + (curr.product.price * curr.quantity), 0);

  const handlePay = (method: 'CASH' | 'MERCADOPAGO' | 'DEBT') => {
      if (total === 0) return;
      
      let suffix = '';
      if (method === 'DEBT') {
          const debtor = prompt("Ingrese el nombre de quien debe:");
          if (!debtor) return;
          suffix = ` (Deuda: ${debtor})`;
      }

      // Update Stocks (skip for "Varios")
      cart.forEach(item => {
          if (item.product.id !== 'v10') {
              onUpdateStock({...item.product, stock: item.product.stock - item.quantity});
          }
      });

      // Add Transaction
      onAddTransaction(total, method, ` [Vitrina]${suffix}`);
      
      alert(`Registrado: $${formatMoney(total)} [${method}${suffix}]`);
      setCart([]);
  };

  return (
    <div className="space-y-6">
        <div className="bg-gray-800 p-4 rounded border border-[#D2B48C]/30 text-center">
            <h2 className="text-xl font-bold text-[#D2B48C]">VENTA DE VITRINA</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
            {/* Product Grid */}
            <div className="space-y-4">
                <h3 className="font-bold uppercase text-sm text-gray-400">Productos</h3>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 max-h-[500px] overflow-y-auto">
                    {products.filter(p => p.category === 'VITRINA').map(p => (
                        <button 
                            key={p.id}
                            onClick={() => addToCart(p)}
                            className={`p-3 rounded border text-left text-sm flex flex-col justify-between h-20 transition-all
                                ${p.stock < 1 && p.id !== 'v10' ? 'border-red-900 bg-red-900/10 opacity-50 cursor-not-allowed' : 'border-gray-700 bg-gray-900 hover:border-[#D2B48C]'}
                            `}
                            disabled={p.stock < 1 && p.id !== 'v10'}
                        >
                            <span className="font-bold text-white">{p.name}</span>
                            <div className="flex justify-between w-full text-xs text-gray-400">
                                <span>{p.id === 'v10' ? 'Variable' : `$${formatMoney(p.price)}`}</span>
                                {p.id !== 'v10' && <span>Stock: {p.stock}</span>}
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Cart & Checkout */}
            <div className="bg-black/50 p-4 rounded border border-gray-800 flex flex-col h-full">
                <h3 className="font-bold uppercase text-sm text-gray-400 mb-4">Pedido Actual</h3>
                
                <div className="flex-1 space-y-2 overflow-y-auto mb-4">
                    {cart.length === 0 && <p className="text-gray-600 italic text-center py-10">Selecciona productos...</p>}
                    {cart.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-gray-900 p-2 rounded border border-gray-800">
                            <div>
                                <div className="text-white font-bold">{item.product.name}</div>
                                <div className="text-xs text-gray-500">{item.quantity} x ${formatMoney(item.product.price)}</div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-[#D2B48C] font-bold">${formatMoney(item.product.price * item.quantity)}</span>
                                <button onClick={() => removeFromCart(idx)} className="text-red-500 hover:text-white">x</button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="border-t border-gray-700 pt-4 mt-auto">
                    <div className="flex justify-between text-2xl font-bold text-white mb-6">
                        <span>Total</span>
                        <span>${formatMoney(total)}</span>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2">
                        <Button onClick={() => handlePay('CASH')} disabled={total === 0} className="text-xs">
                            Efectivo
                        </Button>
                        <Button variant="secondary" onClick={() => handlePay('MERCADOPAGO')} disabled={total === 0} className="text-xs">
                            Cobrar MP
                        </Button>
                        <Button className="border-red-500 text-red-500 hover:bg-red-900/30 text-xs" onClick={() => handlePay('DEBT')} disabled={total === 0}>
                            Deuda
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};
