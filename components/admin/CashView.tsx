
import React, { useState } from 'react';
import { Transaction } from '../../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Input, CurrencyInput } from '../ui/Input';
import { Button } from '../ui/Button';

interface CashViewProps {
  transactions: Transaction[];
  onAddTransaction?: (t: Transaction) => void;
  initialCash: number;
  onUpdateInitialCash: (amount: number) => void;
}

export const CashView: React.FC<CashViewProps> = ({ transactions, onAddTransaction, initialCash, onUpdateInitialCash }) => {
  const [withdrawalAmount, setWithdrawalAmount] = useState(0);
  const [tempInitialCash, setTempInitialCash] = useState(initialCash);
  
  const formatMoney = (val: number) => val.toLocaleString('es-AR');

  const handleSaveInitialCash = () => {
    onUpdateInitialCash(tempInitialCash);
    alert("Saldo inicial actualizado correctamente.");
  };

  // Calculate Running Totals (Including Initial Cash)
  const totalIncome = transactions
    .filter(t => t.type === 'INCOME' && t.paymentMethod !== 'DEBT')
    .reduce((s, t) => s + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((s, t) => s + t.amount, 0);

  const totalBalance = initialCash + totalIncome - totalExpense;

  const summaryData = transactions.reduce((acc, curr) => {
      // Exclude DEBT from visualization if we want strict cash view, but CashView usually shows log.
      // However, for "Money in Box", debt is not there.
      if (curr.paymentMethod === 'DEBT') return acc; 

      const type = curr.type === 'INCOME' ? 'Ingreso' : 'Egreso';
      const found = acc.find(x => x.name === type);
      if (found) found.amount += curr.amount;
      else acc.push({ name: type, amount: curr.amount });
      return acc;
  }, [] as {name: string, amount: number}[]);

  const handleWithdrawal = (e: React.FormEvent) => {
      e.preventDefault();
      if (!onAddTransaction) return;
      if (!withdrawalAmount || withdrawalAmount <= 0) return alert("Monto inválido");

      const tx: Transaction = {
          id: Date.now().toString(),
          type: 'EXPENSE',
          category: 'RETIRO_EFECTIVO',
          amount: Number(withdrawalAmount),
          date: new Date().toISOString(),
          description: `Retiro Manual de Efectivo`,
          isPaid: true,
          paymentMethod: 'CASH'
      };
      onAddTransaction(tx);
      setWithdrawalAmount(0);
  };

  return (
    <div className="space-y-8">
      
      {/* INITIAL BALANCE & MANUAL WITHDRAWAL GRID */}
      <div className="grid md:grid-cols-2 gap-6">
        
        {/* Initial Balance */}
        <div className="bg-gray-900 p-6 rounded border border-blue-900/50">
           <h3 className="text-xl font-bold text-blue-500 mb-4 uppercase">Saldo Inicial Caja</h3>
           <p className="text-xs text-gray-500 mb-4">Monto con el que inicia la caja (arrastre anterior o cambio).</p>
           <div className="flex gap-4 items-end">
             <CurrencyInput 
               label="Saldo Inicial $" 
               value={tempInitialCash} 
               onChange={setTempInitialCash} 
             />
             <Button onClick={handleSaveInitialCash} className="mb-1">
               Guardar
             </Button>
           </div>
        </div>

        {/* Manual Withdrawal */}
        <div className="bg-gray-900 p-6 rounded border border-red-900/50">
            <h3 className="text-xl font-bold text-red-500 mb-4 uppercase">Retiro de Efectivo</h3>
            <p className="text-xs text-gray-500 mb-4">Registrar cuando retiras dinero físico de la caja.</p>
            <form onSubmit={handleWithdrawal} className="flex gap-4 items-end">
                <CurrencyInput 
                  label="Monto a Retirar" 
                  value={withdrawalAmount} 
                  onChange={setWithdrawalAmount} 
                  required 
                />
                <Button type="submit" variant="danger" className="mb-1">
                    Retirar
                </Button>
            </form>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold text-[#D2B48C] mb-4">Movimientos de Caja</h2>
        <div className="bg-gray-900 rounded border border-gray-800 max-h-[400px] overflow-y-auto relative">
            <table className="w-full text-left text-sm text-gray-400">
                <thead className="sticky top-0 bg-gray-800 text-[#D2B48C] shadow-sm">
                    <tr>
                        <th className="p-3">Fecha</th>
                        <th className="p-3">Descripción</th>
                        <th className="p-3">Categoría</th>
                        <th className="p-3">Método</th>
                        <th className="p-3 text-right">Monto</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                    {transactions.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(t => (
                        <tr key={t.id} className="hover:bg-white/5">
                            <td className="p-3">{t.date.substring(0, 10)}</td>
                            <td className="p-3">{t.description}</td>
                            <td className="p-3 text-xs uppercase opacity-70">{t.category}</td>
                            <td className="p-3 text-xs opacity-70">
                                {t.paymentMethod === 'MERCADOPAGO' ? 'MP' : t.paymentMethod === 'CASH' ? 'Efectivo' : t.paymentMethod === 'DEBT' ? 'Deuda' : '-'}
                            </td>
                            <td className={`p-3 text-right font-bold ${t.type === 'INCOME' ? 'text-green-500' : 'text-red-500'}`}>
                                {t.type === 'INCOME' ? '+' : '-'}${formatMoney(t.amount)}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
        
        {/* TOTAL CASH DISPLAY (BELOW LIST) */}
        <div className="mt-4 p-4 bg-gray-900 border border-[#D2B48C] rounded flex justify-between items-center shadow-[0_0_15px_rgba(210,180,140,0.1)]">
            <div className="text-sm text-gray-400">
                <span className="block">Cálculo: Saldo Inicial + Ingresos - Egresos</span>
                <span className="text-xs italic">(Excluye Deudas)</span>
            </div>
            <div className="text-right">
                <div className="text-sm text-[#D2B48C] uppercase font-bold">Total en Caja</div>
                <div className={`text-3xl font-bold ${totalBalance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    ${formatMoney(totalBalance)}
                </div>
            </div>
        </div>
      </div>

      <div className="h-[300px] w-full bg-gray-900 p-4 rounded border border-gray-800">
        <h3 className="text-center text-[#D2B48C] mb-4 uppercase text-sm">Resumen Global (Sin Deudas)</h3>
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={summaryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="name" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip contentStyle={{ backgroundColor: '#000', borderColor: '#D2B48C' }} itemStyle={{ color: '#fff' }} />
                <Bar dataKey="amount" fill="#D2B48C" />
            </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
