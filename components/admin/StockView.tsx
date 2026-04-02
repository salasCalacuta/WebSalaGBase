

import React, { useState } from 'react';
import { Product } from '../../types';
import { CustomModal } from '../ui/CustomModal';

interface StockViewProps {
  products: Product[];
  onUpdateProduct: (product: Product) => void;
  onAddStockExpense: (product: Product, quantity: number) => void;
  category?: 'BAR' | 'VITRINA';
  title?: string;
}

export const StockView: React.FC<StockViewProps> = ({ 
    products, 
    onUpdateProduct, 
    onAddStockExpense, 
    category = 'BAR',
    title = 'Control de Stock (Barra)'
}) => {
  const items = products.filter(p => p.category === category && p.id !== 'bar_generic' && p.id !== 'v10');
  const formatMoney = (val: number) => val.toLocaleString('es-AR');

  const [modalOpen, setModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState<{
      title: string;
      message: string;
      type: 'prompt' | 'confirm';
      defaultValue: string;
      onConfirm: (val?: string) => void;
  } | null>(null);

  const handleAddStock = (item: Product) => {
      setModalConfig({
          title: "AGREGAR STOCK",
          message: `¿Cuántas unidades de ${item.name} desea AGREGAR?`,
          type: 'prompt',
          defaultValue: "1",
          onConfirm: (qtyStr) => {
              const qty = parseInt(qtyStr || "0");
              if (isNaN(qty) || qty <= 0) return;
              onUpdateProduct({...item, stock: item.stock + qty});
              onAddStockExpense(item, qty);
              setModalOpen(false);
          }
      });
      setModalOpen(true);
  };

  const handleSubtractStock = (item: Product) => {
      setModalConfig({
          title: "RESTAR STOCK",
          message: `¿Cuántas unidades de ${item.name} desea RESTAR?`,
          type: 'prompt',
          defaultValue: "1",
          onConfirm: (qtyStr) => {
              const qty = parseInt(qtyStr || "0");
              if (isNaN(qty) || qty <= 0) return;
              onUpdateProduct({...item, stock: Math.max(0, item.stock - qty)});
              setModalOpen(false);
          }
      });
      setModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold uppercase border-b border-[#D2B48C]/30 pb-2">{title}</h2>
      
      {modalConfig && (
          <CustomModal 
              isOpen={modalOpen}
              title={modalConfig.title}
              message={modalConfig.message}
              type={modalConfig.type}
              defaultValue={modalConfig.defaultValue}
              onConfirm={modalConfig.onConfirm}
              onCancel={() => setModalOpen(false)}
          />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map(item => {
          const isLowStock = item.stock < 5;
          return (
            <div 
                key={item.id} 
                className={`border p-4 rounded bg-gray-900/50 relative transition-all duration-300
                    ${isLowStock ? 'border-red-600 border-4 shadow-[0_0_15px_rgba(220,38,38,0.5)] animate-pulse' : 'border-[#D2B48C]/30'}
                `}
            >
                <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-lg">{item.name}</span>
                    <span className={`text-lg font-bold ${isLowStock ? 'text-red-500' : 'text-gray-400'}`}>
                        Stock: {item.stock}
                    </span>
                </div>
                
                <div className="flex flex-col gap-2 mt-2">
                    <div className="flex justify-between text-sm">
                        <span>Precio Venta:</span>
                        <span>${formatMoney(item.price)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-500">
                        <span>Costo:</span>
                        <span>${formatMoney(item.cost)}</span>
                    </div>
                </div>

                <div className="mt-4 flex gap-2">
                    <button 
                        onClick={() => handleAddStock(item)}
                        className="flex-1 bg-[#D2B48C]/10 hover:bg-[#D2B48C]/20 border border-[#D2B48C]/50 text-[#D2B48C] text-xs py-1 rounded"
                    >
                        + Agregar
                    </button>
                    <button 
                        onClick={() => handleSubtractStock(item)}
                        className="flex-1 bg-red-900/20 hover:bg-red-900/40 border border-red-800/50 text-red-500 text-xs py-1 rounded"
                    >
                        - Restar
                    </button>
                </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};