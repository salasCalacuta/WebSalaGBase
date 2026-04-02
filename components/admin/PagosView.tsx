import React, { useState, useMemo, useEffect } from 'react';
import { Transaction, StaffShift } from '../../types';
import { Button } from '../ui/Button';
import { Input, Select, CurrencyInput } from '../ui/Input';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface PagosViewProps {
  transactions: Transaction[];
  shifts: StaffShift[];
  onAddTransaction: (t: Transaction) => void;
  onToggleStatus?: (id: string) => void;
  onUpdateTransaction?: (t: Transaction) => void;
  expenseCategories: string[];
  staffUsers: string[];
}

const FIXED_HOURLY_RATE = 7000;

export const PagosView: React.FC<PagosViewProps> = ({ 
  transactions, 
  shifts, 
  onAddTransaction, 
  onToggleStatus, 
  onUpdateTransaction,
  expenseCategories,
  staffUsers
}) => {
  const [category, setCategory] = useState(expenseCategories[0] || 'Varios');
  const [description, setDescription] = useState('');
  const [staffName, setStaffName] = useState(staffUsers[0] || '');
  const [amount, setAmount] = useState(0);
  const [paymentType, setPaymentType] = useState<'daily' | 'weekly' | 'monthly'>('monthly');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isPaid, setIsPaid] = useState('true');
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'MERCADOPAGO' | 'CARD'>('CASH');
  const [taxSubcategory, setTaxSubcategory] = useState('luz 445');
  const [staffSubcategory, setStaffSubcategory] = useState(staffUsers[0] || '');
  
  const formatMoney = (val: number) => val.toLocaleString('es-AR');

  // Edit Mode
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const expenses = transactions.filter(t => t.type === 'EXPENSE' && expenseCategories.includes(t.category));

  const chartData = expenseCategories.map(cat => ({
    name: cat,
    monto: expenses.filter(i => i.category === cat && i.isPaid).reduce((sum, curr) => sum + curr.amount, 0)
  }));

  // Logic to calculate hours
  const calculateHours = (s: string, e: string) => {
      let [startH, startM] = s.split(':').map(val => parseInt(val) || 0);
      let [endH, endM] = e.split(':').map(val => parseInt(val) || 0);

      // Rule: If 23:59, add 1 minute (treat as 24:00)
      if (endH === 23 && endM === 59) {
          endH = 24;
          endM = 0;
      }

      // Handle 00:00 as 24:00 for end time if start time is not 00:00
      if (endH === 0 && endM === 0 && (startH > 0 || startM > 0)) {
          endH = 24;
      }

      const startTotal = startH + (startM / 60);
      const endTotal = endH + (endM / 60);

      return Math.max(0, endTotal - startTotal);
  };

  const calculationDetails = useMemo(() => {
      if (category !== 'Personal') return { daily: 0, weekly: 0, monthly: 0, total: 0, dailyDetails: [] };
      
      // Filter shifts for selected staff
      const userShifts = shifts.filter(s => s.staffName === staffName);
      
      const dailyDetails = userShifts.map(s => ({
          day: s.dayOfWeek,
          hours: calculateHours(s.timeStart, s.timeEnd)
      }));

      // Calculate total hours per WEEK
      const weeklyHours = dailyDetails.reduce((acc, d) => acc + d.hours, 0);

      // Assume 4 weeks per month for the "Monthly" total
      const monthlyHours = weeklyHours * 4;
      
      let total = 0;
      if (paymentType === 'daily') {
          total = (dailyDetails.length > 0 ? dailyDetails[0].hours : 0) * FIXED_HOURLY_RATE;
      } else if (paymentType === 'weekly') {
          total = weeklyHours * FIXED_HOURLY_RATE;
      } else {
          total = monthlyHours * FIXED_HOURLY_RATE;
      }
      
      return { 
          daily: dailyDetails.length > 0 ? dailyDetails[0].hours : 0, 
          weekly: weeklyHours, 
          monthly: monthlyHours, 
          total,
          dailyDetails
      };
  }, [staffName, shifts, category, paymentType]);

  // Auto-update amount when calculation changes for Personal
  useEffect(() => {
      if (category === 'Personal' && !editingId) {
          // Even if 0, we set it to show no shifts
          setAmount(calculationDetails.total);
      }
  }, [calculationDetails, category, editingId]);

  const handleEdit = (t: Transaction) => {
      setEditingId(t.id);
      setCategory(t.category);
      setAmount(t.amount);
      setDate(t.date.split('T')[0]);
      setIsPaid(t.isPaid ? 'true' : 'false');
      setPaymentMethod((t.paymentMethod as any) || 'CASH');
      // Extract staff name from description if possible, or leave default
      const staffMatch = t.description.match(/Pago Personal: (.*)/);
      if (staffMatch && staffMatch[1]) {
          setStaffName(staffMatch[1]);
      }
  };

  const handleCancelEdit = () => {
      setEditingId(null);
      setAmount(0);
      setCategory(expenseCategories[0] || 'Varios');
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (category === 'Personal' && !editingId) {
        alert(`Generando PDF para pago a ${staffName} por $${formatMoney(Number(amount))}...`);
    }

    const baseDescription = category === 'Personal' ? `Pago Personal: ${staffName}` : `Gasto: ${category}`;
    let finalDescription = (category === 'Varios' || category === 'Inversiones') ? `${category}: ${description}` : baseDescription;

    if (category === 'Impuestos') {
        finalDescription = `Impuestos: ${taxSubcategory}`;
    } else if (category === 'retiro en efectivo') {
        finalDescription = `Retiro en efectivo: ${staffSubcategory}`;
    }

    const txData: Transaction = {
        id: editingId || Date.now().toString(),
        type: 'EXPENSE',
        category,
        amount: Number(amount),
        date: new Date(date).toISOString(),
        description: finalDescription,
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
          <div className="bg-gray-900 p-6 rounded border border-red-900/50">
              <h3 className="text-xl font-bold text-red-500 mb-4 uppercase">
                  {editingId ? 'Modificar Gasto' : 'Registrar Gasto'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                  <Select label="Concepto" value={category} onChange={e => setCategory(e.target.value)}>
                      {expenseCategories.map(c => <option key={c} value={c}>{c}</option>)}
                  </Select>
                  
                  {(category === 'Varios' || category === 'Inversiones') && (
                      <Input label="Descripción" value={description} onChange={e => setDescription(e.target.value)} required />
                  )}

                  {category === 'Impuestos' && (
                      <Select label="Subcategoría Impuestos" value={taxSubcategory} onChange={e => setTaxSubcategory(e.target.value)}>
                          <option value="luz 445">luz 445</option>
                          <option value="luz 447">luz 447</option>
                          <option value="alquiler 445">alquiler 445</option>
                          <option value="alquiler 447">alquiler 447</option>
                          <option value="abl 445">abl 445</option>
                          <option value="abl 447">abl 447</option>
                      </Select>
                  )}

                  {category === 'retiro en efectivo' && (
                      <Select label="Personal" value={staffSubcategory} onChange={e => setStaffSubcategory(e.target.value)}>
                          {staffUsers.map(u => <option key={u} value={u}>{u}</option>)}
                      </Select>
                  )}
                  
                  {category === 'Personal' && (
                      <div className="bg-gray-800 p-3 rounded border border-gray-700 space-y-3">
                          <Select label="Nombre del Personal" value={staffName} onChange={e => setStaffName(e.target.value)}>
                              {staffUsers.map(u => <option key={u} value={u}>{u}</option>)}
                          </Select>
                          
                          <div className="flex flex-col gap-2">
                              <label className="text-[10px] uppercase font-bold text-gray-500">Tipo de Pago</label>
                              <div className="flex gap-4">
                                  {(['daily', 'weekly', 'monthly'] as const).map(type => (
                                      <label key={type} className="flex items-center gap-2 cursor-pointer group">
                                          <input 
                                              type="radio" 
                                              name="paymentType" 
                                              checked={paymentType === type}
                                              onChange={() => setPaymentType(type)}
                                              className="accent-red-500"
                                          />
                                          <span className={`text-xs uppercase ${paymentType === type ? 'text-white font-bold' : 'text-gray-500 group-hover:text-gray-300'}`}>
                                              {type === 'daily' ? 'Diario' : type === 'weekly' ? 'Semanal' : 'Mensual'}
                                          </span>
                                      </label>
                                  ))}
                              </div>
                          </div>

                          {!editingId && (
                            <div className="text-[10px] text-gray-400 space-y-1 border-t border-gray-700 pt-2">
                                <div className="flex justify-between">
                                    <span>Horas Diarias (Promedio):</span>
                                    <span className="text-white font-bold">{calculationDetails.daily.toFixed(2)} hs - Total: ${formatMoney(calculationDetails.daily * FIXED_HOURLY_RATE)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Horas Semanales:</span>
                                    <span className="text-white font-bold">{calculationDetails.weekly.toFixed(2)} hs - Total: ${formatMoney(calculationDetails.weekly * FIXED_HOURLY_RATE)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Horas Mensuales:</span>
                                    <span className="text-white font-bold">{calculationDetails.monthly.toFixed(2)} hs - Total: ${formatMoney(calculationDetails.monthly * FIXED_HOURLY_RATE)}</span>
                                </div>
                                <div className="text-[#D2B48C] mt-2 border-t border-gray-600 pt-1 text-right text-xs">
                                    Monto Sugerido ({paymentType === 'daily' ? 'Diario' : paymentType === 'weekly' ? 'Semanal' : 'Mensual'}): <b>${formatMoney(calculationDetails.total)}</b>
                                </div>
                            </div>
                          )}
                      </div>
                  )}

                  <CurrencyInput label="Monto" value={amount} onChange={setAmount} required />
                  <Input type="date" label="Fecha" value={date} onChange={e => setDate(e.target.value)} required />
                  
                  <div className="flex gap-4">
                      <Select label="Estado" value={isPaid} onChange={e => setIsPaid(e.target.value)}>
                          <option value="true">Pagado</option>
                          <option value="false">A Deber</option>
                      </Select>
                      <Select label="Método de Pago" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value as any)}>
                          <option value="CASH">Efectivo</option>
                          <option value="MERCADOPAGO">MercadoPago</option>
                          <option value="CARD">Tarjeta</option>
                      </Select>
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" variant="danger" className="w-full">
                        {editingId ? 'Guardar Cambios' : 'Registrar Gasto'}
                    </Button>
                    {editingId && (
                        <Button type="button" variant="secondary" onClick={handleCancelEdit}>Cancelar</Button>
                    )}
                  </div>
              </form>
          </div>

          {/* Chart */}
          <div className="bg-gray-900 p-4 rounded border border-red-900/30 h-[400px]">
              <h3 className="text-center text-red-500 mb-4 uppercase text-sm">Seguimiento de Gastos (Pagados)</h3>
              <ResponsiveContainer width="100%" height="90%">
                  <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                      <XAxis dataKey="name" stroke="#666" fontSize={10} angle={-45} textAnchor="end" height={60} />
                      <YAxis stroke="#666" />
                      <Tooltip contentStyle={{ backgroundColor: '#000', borderColor: '#991b1b' }} itemStyle={{ color: '#fff' }} />
                      <Bar dataKey="monto" fill="#991b1b" />
                  </BarChart>
              </ResponsiveContainer>
          </div>
      </div>

      {/* List */}
      <div>
        <h3 className="text-xl font-bold text-red-500 mb-4">Historial de Pagos</h3>
        <p className="text-xs text-gray-500 mb-2">Click en estado para alternar rápido. Click en Modificar para editar.</p>
        <div className="bg-gray-900 rounded border border-gray-800 overflow-hidden">
            <table className="w-full text-left text-sm">
                <thead className="bg-gray-800 text-red-400">
                    <tr>
                        <th className="p-3">Fecha</th>
                        <th className="p-3">Concepto</th>
                        <th className="p-3">Monto / Método</th>
                        <th className="p-3">Estado / Acción</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                    {expenses.map(t => (
                        <tr key={t.id}>
                            <td className="p-3">{t.date.split('T')[0]}</td>
                            <td className="p-3">{t.description}</td>
                            <td className="p-3">
                                <div className="text-red-500 font-bold">${formatMoney(t.amount)}</div>
                                <div className="text-[10px] text-gray-400 uppercase">{t.paymentMethod === 'MERCADOPAGO' ? 'MP' : t.paymentMethod === 'CARD' ? 'Tarjeta' : 'Efectivo'}</div>
                            </td>
                            <td className="p-3 flex items-center gap-2">
                                <button 
                                  onClick={() => onToggleStatus && onToggleStatus(t.id)}
                                  className={`px-2 py-1 rounded text-xs cursor-pointer hover:opacity-80 ${t.isPaid ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'}`}
                                >
                                    {t.isPaid ? 'Pagado' : 'A Deber'}
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