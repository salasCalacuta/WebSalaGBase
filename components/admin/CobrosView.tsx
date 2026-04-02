import React, { useState } from 'react';
import { Transaction } from '../../types';
import { Button } from '../ui/Button';
import { Input, Select, CurrencyInput } from '../ui/Input';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface CobrosViewProps {
  transactions: Transaction[];
  onAddTransaction: (t: Transaction) => void;
  onToggleStatus?: (id: string) => void;
  onUpdateTransaction?: (t: Transaction) => void;
  incomeCategories: string[];
}

export const CobrosView: React.FC<CobrosViewProps> = ({ 
  transactions, 
  onAddTransaction, 
  onToggleStatus, 
  onUpdateTransaction,
  incomeCategories
}) => {
  const [category, setCategory] = useState(incomeCategories[0] || 'Varios');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState(0);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isPaid, setIsPaid] = useState('true');
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'MERCADOPAGO'>('CASH');
  
  const formatMoney = (val: number) => val.toLocaleString('es-AR');

  // Edit Mode State
  const [editingId, setEditingId] = useState<string | null>(null);

  const incomes = transactions.filter(t => t.type === 'INCOME' && incomeCategories.includes(t.category));

  // Chart Data: Only showing COBRADO transactions
  const chartData = incomeCategories.map(cat => ({
    name: cat,
    monto: incomes.filter(i => i.category === cat && i.isPaid).reduce((sum, curr) => sum + curr.amount, 0)
  }));

  const handleEdit = (t: Transaction) => {
      setEditingId(t.id);
      setCategory(t.category);
      setAmount(t.amount);
      setDate(t.date.split('T')[0]);
      setIsPaid(t.isPaid ? 'true' : 'false');
      setPaymentMethod((t.paymentMethod as any) || 'CASH');
  };

  const handleCancelEdit = () => {
      setEditingId(null);
      setAmount(0);
      setCategory(incomeCategories[0] || 'Varios');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const txData: Transaction = {
        id: editingId || Date.now().toString(),
        type: 'INCOME',
        category,
        amount: Number(amount),
        date: new Date(date).toISOString(),
        description: category === 'Varios' ? `Varios: ${description}` : `Cobro espacio: ${category}`,
        isPaid: isPaid === 'true',
        paymentMethod
    };

    if (editingId && onUpdateTransaction) {
        onUpdateTransaction(txData);
        setEditingId(null);
    } else {
        onAddTransaction(txData);
    }
    setAmount(0);
  };

  return (
    <div className="space-y-8">
      <div className="grid md:grid-cols-2 gap-8">
          {/* Form */}
          <div className="bg-gray-900 p-6 rounded border border-[#D2B48C]/30">
              <h3 className="text-xl font-bold text-[#D2B48C] mb-4 uppercase">
                  {editingId ? 'Modificar Cobro' : 'Registrar Cobro (Espacios)'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                  <Select label="Espacio" value={category} onChange={e => setCategory(e.target.value)}>
                      {incomeCategories.map(c => <option key={c} value={c}>{c}</option>)}
                  </Select>
                  {category === 'Varios' && (
                      <Input label="Descripción" value={description} onChange={e => setDescription(e.target.value)} required />
                  )}
                  <CurrencyInput label="Monto" value={amount} onChange={setAmount} required />
                  <Input type="date" label="Fecha" value={date} onChange={e => setDate(e.target.value)} required />
                  <div className="flex gap-4">
                      <Select label="Estado" value={isPaid} onChange={e => setIsPaid(e.target.value)}>
                          <option value="true">Cobrado</option>
                          <option value="false">Pendiente</option>
                      </Select>
                      <Select label="Método de Pago" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value as any)}>
                          <option value="CASH">Efectivo</option>
                          <option value="MERCADOPAGO">MercadoPago</option>
                      </Select>
                  </div>

                  <div className="flex gap-2">
                      <Button type="submit" variant="success" className="w-full">
                          {editingId ? 'Guardar Cambios' : 'Registrar Ingreso'}
                      </Button>
                      {editingId && (
                          <Button type="button" variant="secondary" onClick={handleCancelEdit}>
                              Cancelar
                          </Button>
                      )}
                  </div>
              </form>
          </div>

          {/* Chart */}
          <div className="bg-gray-900 p-4 rounded border border-[#D2B48C]/30 h-[400px]">
              <h3 className="text-center text-[#D2B48C] mb-4 uppercase text-sm">Seguimiento de Espacios (Cobrados)</h3>
              <ResponsiveContainer width="100%" height="90%">
                  <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                      <XAxis dataKey="name" stroke="#666" fontSize={10} angle={-45} textAnchor="end" height={60} />
                      <YAxis stroke="#666" />
                      <Tooltip contentStyle={{ backgroundColor: '#000', borderColor: '#D2B48C' }} itemStyle={{ color: '#fff' }} />
                      <Bar dataKey="monto" fill="#15803d" />
                  </BarChart>
              </ResponsiveContainer>
          </div>
      </div>

      {/* List */}
      <div>
        <h3 className="text-xl font-bold text-[#D2B48C] mb-4">Historial de Cobros</h3>
        <p className="text-xs text-gray-500 mb-2">Click en estado para alternar rápido. Click en Modificar para editar detalles.</p>
        <div className="bg-gray-900 rounded border border-gray-800 overflow-hidden">
            <table className="w-full text-left text-sm">
                <thead className="bg-gray-800 text-[#D2B48C]">
                    <tr>
                        <th className="p-3">Fecha</th>
                        <th className="p-3">Espacio</th>
                        <th className="p-3">Monto / Método</th>
                        <th className="p-3">Estado / Acción</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                    {incomes.map(t => (
                        <tr key={t.id}>
                            <td className="p-3">{t.date.split('T')[0]}</td>
                            <td className="p-3">{t.category}</td>
                            <td className="p-3">
                                <div className="text-green-500 font-bold">${formatMoney(t.amount)}</div>
                                <div className="text-[10px] text-gray-400 uppercase">{t.paymentMethod || 'CASH'}</div>
                            </td>
                            <td className="p-3 flex items-center gap-2">
                                <button 
                                  onClick={() => onToggleStatus && onToggleStatus(t.id)}
                                  className={`px-2 py-1 rounded text-xs cursor-pointer ${t.isPaid ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'}`}
                                >
                                    {t.isPaid ? 'Cobrado' : 'Pendiente'}
                                </button>
                                <button 
                                    onClick={() => handleEdit(t)}
                                    className="px-2 py-1 rounded text-xs bg-blue-900 text-blue-200 hover:bg-blue-800"
                                >
                                    Modificar
                                </button>
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