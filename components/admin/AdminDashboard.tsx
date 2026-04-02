import React, { useState, useMemo } from 'react';
import { Transaction, Reservation, Room, Contact, User, Product, MaintenanceItem, StaffShift } from '../../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid, LineChart, Line } from 'recharts';
// @ts-ignore
import * as XLSX from 'xlsx';
import { Button } from '../ui/Button';
import { CustomModal } from '../ui/CustomModal';

interface AdminDashboardProps {
  transactions: Transaction[];
  reservations?: Reservation[];
  rooms?: Room[];
  contacts?: Contact[];
  products?: Product[];
  maintenance?: MaintenanceItem[];
  shifts?: StaffShift[];
  currentUser?: User;
  onSettleDebt?: (contactId: string, amount: number, type: 'PAY' | 'VOID') => void;
  onResetToZero?: () => void;
  onExportClients?: () => void;
  onViewSalas?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
    transactions, 
    reservations = [], 
    rooms = [], 
    contacts = [], 
    products = [],
    maintenance = [],
    shifts = [],
    currentUser,
    onSettleDebt,
    onResetToZero,
    onExportClients,
    onViewSalas
}) => {
  
  const [showDebtors, setShowDebtors] = useState(false);
  const [flowPeriod, setFlowPeriod] = useState<'diario' | 'semanal' | 'mensual'>('mensual');
  const [showResetModal, setShowResetModal] = useState(false);
  
  const formatMoney = (val: number) => val.toLocaleString('es-AR');

  // Cash Flow Analysis Logic
  const flowData = useMemo(() => {
      const now = new Date();
      const result: any[] = [];

      if (flowPeriod === 'diario') {
          // Last 14 days
          for (let i = 13; i >= 0; i--) {
              const d = new Date(now);
              d.setDate(now.getDate() - i);
              const dateStr = d.toISOString().split('T')[0];
              const dayTxs = transactions.filter(t => t.date.split('T')[0] === dateStr && t.paymentMethod !== 'DEBT');
              result.push({
                  label: d.toLocaleDateString('es-AR', { day: '2-digit', month: 'short' }),
                  Ingresos: dayTxs.filter(t => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0),
                  Egresos: dayTxs.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0),
                  fullDate: dateStr
              });
          }
      } else if (flowPeriod === 'semanal') {
          // Last 8 weeks
          for (let i = 7; i >= 0; i--) {
              const d = new Date(now);
              d.setDate(now.getDate() - (i * 7));
              // Find start of week (Monday)
              const day = d.getDay();
              const diff = d.getDate() - day + (day === 0 ? -6 : 1);
              const startOfWeek = new Date(d.setDate(diff));
              const endOfWeek = new Date(startOfWeek);
              endOfWeek.setDate(startOfWeek.getDate() + 6);

              const weekTxs = transactions.filter(t => {
                  const tDate = new Date(t.date);
                  return tDate >= startOfWeek && tDate <= endOfWeek && t.paymentMethod !== 'DEBT';
              });

              result.push({
                  label: `Sem ${startOfWeek.getDate()}/${startOfWeek.getMonth() + 1}`,
                  Ingresos: weekTxs.filter(t => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0),
                  Egresos: weekTxs.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0)
              });
          }
      } else {
          // Last 6 months
          for (let i = 5; i >= 0; i--) {
              const d = new Date(now);
              d.setMonth(now.getMonth() - i);
              const month = d.getMonth();
              const year = d.getFullYear();
              const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

              const monthTxs = transactions.filter(t => {
                  const tDate = new Date(t.date);
                  return tDate.getMonth() === month && tDate.getFullYear() === year && t.paymentMethod !== 'DEBT';
              });

              result.push({
                  label: `${monthNames[month]} ${year}`,
                  Ingresos: monthTxs.filter(t => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0),
                  Egresos: monthTxs.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0)
              });
          }
      }
      return result;
  }, [transactions, flowPeriod]);

  const flowStats = useMemo(() => {
      if (flowData.length < 2) return { currentIncome: 0, incomeChange: 0, currentExpense: 0, expenseChange: 0, margin: 0 };
      
      const current = flowData[flowData.length - 1];
      const previous = flowData[flowData.length - 2];

      const incomeChange = previous.Ingresos > 0 ? ((current.Ingresos - previous.Ingresos) / previous.Ingresos) * 100 : 0;
      const expenseChange = previous.Egresos > 0 ? ((current.Egresos - previous.Egresos) / previous.Egresos) * 100 : 0;
      const margin = current.Ingresos > 0 ? ((current.Ingresos - current.Egresos) / current.Ingresos) * 100 : 0;

      return {
          currentIncome: current.Ingresos,
          incomeChange,
          currentExpense: current.Egresos,
          expenseChange,
          margin
      };
  }, [flowData]);

  // Group by category for chart
  const dataMap = transactions.reduce((acc, curr) => {
    // Exclude DEBT transactions from Income charts/sums for Cash Flow view
    if (curr.paymentMethod === 'DEBT') return acc;

    const existing = acc.find(item => item.name === curr.category);
    if (existing) {
        if (curr.type === 'INCOME') existing.Ingresos += curr.amount;
        else existing.Gastos += curr.amount;
    } else {
        acc.push({
            name: curr.category,
            Ingresos: curr.type === 'INCOME' ? curr.amount : 0,
            Gastos: curr.type === 'EXPENSE' ? curr.amount : 0,
        });
    }
    return acc;
  }, [] as any[]);

  // Calculate Totals (Excluding Debt transactions from "Cash" totals)
  const totalIncome = transactions
    .filter(t => t.type === 'INCOME' && t.paymentMethod !== 'DEBT')
    .reduce((s, t) => s + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((s, t) => s + t.amount, 0);

  const netBalance = totalIncome - totalExpense;

  // Calculate Total Debt from Contacts (The actual current owed balance)
  const debtors = contacts.filter(c => c.debt && c.debt > 0);
  const totalDebt = debtors.reduce((acc, c) => acc + (c.debt || 0), 0);

  const handleExport = () => {
      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();

      // 1. Transactions Sheet (All in One)
      const monthlyTransactions = transactions.filter(t => {
          const d = new Date(t.date);
          return d.getMonth() === now.getMonth() && d.getFullYear() === currentYear;
      });
      monthlyTransactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      let sumIngreso = 0;
      let sumEgreso = 0;

      const exportData = monthlyTransactions.map(t => {
          const isIncome = t.type === 'INCOME';
          
          if (t.paymentMethod !== 'DEBT') {
              if(isIncome) sumIngreso += t.amount;
              else sumEgreso += t.amount;
          }

          return {
              Fecha: t.date.split('T')[0],
              Tipo: isIncome ? 'INGRESO' : 'EGRESO',
              Categoria: t.category,
              Descripcion: t.description,
              Ingreso: isIncome ? t.amount : '',
              Egreso: !isIncome ? t.amount : '',
              Metodo: t.paymentMethod === 'MERCADOPAGO' ? 'MercadoPago' : t.paymentMethod === 'CASH' ? 'Efectivo' : t.paymentMethod === 'DEBT' ? 'Deuda' : t.paymentMethod === 'CARD' ? 'Tarjeta' : '-'
          };
      });

      // Add Total Row
      exportData.push({
          Fecha: 'TOTALES (Caja Real)',
          Tipo: '',
          Categoria: '',
          Descripcion: '',
          Ingreso: sumIngreso,
          Egreso: sumEgreso,
          Metodo: ''
      } as any);

      // 2. Band Statistics Sheet
      const monthlyReservations = reservations.filter(r => {
          const [y, m, d] = r.date.split('-').map(Number); // YYYY-MM-DD
          return m === currentMonth && y === currentYear;
      });
      
      const statsData = monthlyReservations.map(r => {
          const room = rooms.find(rm => rm.id === r.roomId);
          // Calculate metrics (using contacts logic)
          let cancelRate = 0;
          let attRate = 0;
          
          if (contacts.length > 0) {
              const threeMonthsAgo = new Date();
              threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
              const history = reservations.filter(hist => 
                  hist.bandName.toLowerCase() === r.bandName.toLowerCase() && 
                  new Date(hist.date) >= threeMonthsAgo
              );
              const total = history.length;
              if (total > 0) {
                  const cancelled = history.filter(h => h.status === 'REJECTED').length;
                  const attended = history.filter(h => h.status === 'COMPLETED').length;
                  cancelRate = Math.round((cancelled / total) * 100);
                  attRate = Math.round((attended / total) * 100);
              }
          }

          return {
              Banda: r.bandName,
              Fecha: r.date,
              HorarioInicio: r.timeStart,
              HorarioCierre: r.timeEnd,
              Sala: room ? room.name : r.roomId,
              PorcentajeCancelacion: `${cancelRate}%`,
              PorcentajeAsistencia: `${attRate}%`,
              Abonado: r.isAbono ? 'X' : ''
          };
      });

      // 3. Cobros Sheet
      const cobrosData = transactions.filter(t => t.type === 'INCOME').map(t => ({
          Fecha: t.date.split('T')[0],
          Categoria: t.category,
          Descripcion: t.description,
          Monto: t.amount,
          Metodo: t.paymentMethod || '-',
          Estado: t.isPaid ? 'Cobrado' : 'Pendiente'
      }));

      // 4. Pagos Sheet
      const pagosData = transactions.filter(t => t.type === 'EXPENSE').map(t => ({
          Fecha: t.date.split('T')[0],
          Categoria: t.category,
          Descripcion: t.description,
          Monto: t.amount,
          Metodo: t.paymentMethod || '-',
          Estado: t.isPaid ? 'Pagado' : 'Pendiente'
      }));

      // 5. Stock Sheet
      const stockData = products.map(p => ({
          Nombre: p.name,
          Categoria: p.category,
          Precio: p.price,
          Costo: p.cost,
          Stock: p.stock,
          ValorInventario: p.stock * p.cost
      }));

      // 6. Mantenimiento Sheet
      const maintenanceData = maintenance.map(m => ({
          Item: m.name,
          Sala: rooms.find(r => r.id === m.roomId)?.name || m.roomId,
          Estado: m.status,
          FechaReparacion: m.repairDate || '-',
          Motivo: m.reason || '-',
          Presupuesto: m.budget || 0,
          CostoFinal: m.actualCost || 0,
          Pagado: m.isPaid ? 'SI' : 'NO'
      }));

      // 7. Personal Sheet
      const personalData = shifts.map(s => ({
          Nombre: s.staffName,
          Dia: s.dayOfWeek,
          Inicio: s.timeStart,
          Fin: s.timeEnd
      }));

      // 8. Precios Sheet
      const preciosData = rooms.map(r => ({
          Sala: r.name,
          PrecioHora: r.price,
          Color: r.color
      }));

      // 9. Contactos Sheet
      const contactosData = contacts.map(c => ({
          Banda: c.bandName,
          Responsable: c.name,
          Telefono: c.phone,
          Email: c.email,
          Estilo: c.style,
          Musicos: c.musiciansCount,
          SalaHabitual: c.habitualRoom,
          Deuda: c.debt || 0,
          Abonado: c.isAbono ? 'SI' : 'NO',
          Bloqueado: c.isBlocked ? 'SI' : 'NO',
          Instagram: c.instagram || '-',
          Rol: c.bandRole || '-'
      }));

      // 10. Agenda Sheet (Full History)
      const agendaData = reservations.map(r => ({
          Fecha: r.date,
          Banda: r.bandName,
          Inicio: r.timeStart,
          Fin: r.timeEnd,
          Sala: rooms.find(rm => rm.id === r.roomId)?.name || r.roomId,
          Estado: r.status,
          Monto: r.totalAmount,
          Abono: r.isAbono ? 'SI' : 'NO'
      }));

      // Create Workbook
      const wb = XLSX.utils.book_new();

      // Append Sheets
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(exportData), "Movimientos");
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(statsData), "Estadisticas Bandas");
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(cobrosData), "Cobros");
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(pagosData), "Pagos");
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(stockData), "Stock");
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(maintenanceData), "Mantenimiento");
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(personalData), "Personal");
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(preciosData), "Precios");
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(contactosData), "Contactos");
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(agendaData), "Agenda");

      // Generate File
      XLSX.writeFile(wb, `Cierre_Mensual_${currentYear}_${currentMonth}.xlsx`);
  };

  return (
    <div className="space-y-8">
      
      {/* Debtors Modal */}
      {showDebtors && (
          <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
              <div className="bg-gray-900 border border-yellow-500 rounded w-full max-w-2xl p-6 relative">
                  <button onClick={() => setShowDebtors(false)} className="absolute top-4 right-4 text-white hover:text-yellow-500">X</button>
                  <h3 className="text-xl font-bold text-yellow-500 mb-4 uppercase">Listado de Deudores</h3>
                  
                  <div className="max-h-[60vh] overflow-y-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-800 text-yellow-500">
                            <tr>
                                <th className="p-2">Banda</th>
                                <th className="p-2">Responsable</th>
                                <th className="p-2 text-right">Monto Deuda</th>
                                <th className="p-2 text-center">Acción</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {debtors.length === 0 && <tr><td colSpan={4} className="p-4 text-center text-gray-500">No hay deudas registradas.</td></tr>}
                            {debtors.map(c => (
                                <tr key={c.id}>
                                    <td className="p-2 font-bold text-white">{c.bandName}</td>
                                    <td className="p-2 text-gray-400">{c.name}</td>
                                    <td className="p-2 text-right font-bold text-red-400">${formatMoney(c.debt || 0)}</td>
                                    <td className="p-2 flex justify-center gap-2">
                                        <button 
                                            onClick={() => onSettleDebt && onSettleDebt(c.id, c.debt || 0, 'PAY')}
                                            className="px-2 py-1 bg-green-900/50 hover:bg-green-900 text-green-300 border border-green-700 rounded text-xs"
                                        >
                                            Cobrar
                                        </button>
                                        <button 
                                            onClick={() => onSettleDebt && onSettleDebt(c.id, c.debt || 0, 'VOID')}
                                            className="px-2 py-1 bg-red-900/50 hover:bg-red-900 text-red-300 border border-red-700 rounded text-xs"
                                        >
                                            Anular
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                  </div>
              </div>
          </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-6 border border-green-800 bg-green-900/10 rounded text-center">
            <h4 className="text-green-500 uppercase tracking-widest text-sm mb-2">Ingresos Totales</h4>
            <span className="text-3xl font-bold text-white">${formatMoney(totalIncome)}</span>
        </div>
        <div className="p-6 border border-red-800 bg-red-900/10 rounded text-center">
            <h4 className="text-red-500 uppercase tracking-widest text-sm mb-2">Gastos Totales</h4>
            <span className="text-3xl font-bold text-white">${formatMoney(totalExpense)}</span>
        </div>
        <div className="p-6 border border-yellow-600 bg-yellow-900/10 rounded text-center shadow-[0_0_15px_rgba(202,138,4,0.1)]">
            <h4 className="text-yellow-500 uppercase tracking-widest text-sm mb-2">Balance Neto</h4>
            <span className={`text-3xl font-bold ${netBalance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                ${formatMoney(netBalance)}
            </span>
        </div>
        
        {/* Debt Box in Yellow */}
        <div className="p-6 border-2 border-yellow-400 bg-yellow-900/20 rounded text-center flex flex-col justify-center items-center">
            <h4 className="text-yellow-400 uppercase tracking-widest text-sm mb-2">Deudas por Cobrar</h4>
            <span className="text-3xl font-bold text-yellow-300">${formatMoney(totalDebt)}</span>
            <button 
                onClick={() => setShowDebtors(true)}
                className="mt-2 text-xs bg-yellow-400 text-black px-2 py-1 rounded font-bold hover:bg-yellow-300"
            >
                Ver Deudores
            </button>
        </div>
      </div>

      <div className="h-[400px] w-full bg-gray-900/50 p-4 border border-gray-800 rounded">
        <h3 className="text-center text-[#D2B48C] mb-4 uppercase text-sm">Movimientos por Categoría (Excl. Deuda)</h3>
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dataMap}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="name" stroke="#666" fontSize={12} />
                <YAxis stroke="#666" fontSize={12} />
                <Tooltip 
                    contentStyle={{ backgroundColor: '#000', borderColor: '#D2B48C' }}
                    itemStyle={{ color: '#fff' }}
                />
                <Legend />
                <Bar dataKey="Ingresos" fill="#15803d" />
                <Bar dataKey="Gastos" fill="#991b1b" />
            </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex flex-col md:flex-row justify-center gap-4">
        <button 
            className="bg-emerald-600 text-white font-bold py-2 px-6 rounded hover:bg-emerald-700 transition-colors" 
            onClick={onViewSalas}
        >
            Gestionar Fotos Salas
        </button>

        <button 
            className="bg-[#D2B48C] text-black font-bold py-2 px-6 rounded hover:bg-[#c2a47c] transition-colors" 
            onClick={handleExport}
        >
            Exportar Cierre Mensual (XLS)
        </button>

        <button 
            className="bg-blue-600 text-white font-bold py-2 px-6 rounded hover:bg-blue-700 transition-colors" 
            onClick={onExportClients}
        >
            Exportar Base de Clientes (CSV)
        </button>

        {(['encargado', 'uruguayo'].includes(currentUser?.username.toLowerCase() || '')) && (
            <>
                <button 
                    className="bg-red-600 text-white font-bold py-2 px-6 rounded hover:bg-red-700 transition-colors shadow-[0_0_15px_rgba(220,38,38,0.3)]" 
                    onClick={() => setShowResetModal(true)}
                >
                    REINICIO A CERO
                </button>
                <CustomModal 
                    isOpen={showResetModal}
                    title="REINICIO A CERO"
                    message="¿ESTÁS SEGURO? Se exportará un Excel y se BORRARÁN todos los registros operativos (Reservas, Caja, Consumos, Stock y Deudas)."
                    type="confirm"
                    onConfirm={() => {
                        handleExport();
                        onResetToZero?.();
                        setShowResetModal(false);
                    }}
                    onCancel={() => setShowResetModal(false)}
                />
            </>
        )}
      </div>

      {/* Cash Flow Analysis Module */}
      <div className="mt-12 p-6 bg-gray-900/80 border border-[#D2B48C]/30 rounded-xl shadow-2xl">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
              <h3 className="text-xl font-bold text-[#D2B48C] uppercase tracking-widest flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                  Análisis de Flujo de Caja
              </h3>
              <div className="flex bg-black/40 p-1 rounded-lg border border-gray-800">
                  {(['diario', 'semanal', 'mensual'] as const).map((period) => (
                      <button
                          key={period}
                          onClick={() => setFlowPeriod(period)}
                          className={`px-4 py-1.5 rounded-md text-[10px] uppercase font-bold transition-all ${
                              flowPeriod === period 
                              ? 'bg-[#D2B48C] text-black shadow-lg' 
                              : 'text-gray-500 hover:text-gray-300'
                          }`}
                      >
                          {period}
                      </button>
                  ))}
              </div>
          </div>

          <div className="h-[350px] w-full mb-8">
              <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={flowData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                      <XAxis 
                          dataKey="label" 
                          stroke="#666" 
                          fontSize={10} 
                          tickLine={false}
                          axisLine={false}
                      />
                      <YAxis 
                          stroke="#666" 
                          fontSize={10} 
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={(value) => `$${value / 1000}k`}
                      />
                      <Tooltip 
                          contentStyle={{ backgroundColor: '#000', border: '1px solid #D2B48C', borderRadius: '8px', fontSize: '12px' }}
                          itemStyle={{ padding: '2px 0' }}
                          formatter={(value: number) => [`$${formatMoney(value)}`, '']}
                      />
                      <Legend verticalAlign="top" height={36} iconType="circle" />
                      <Line 
                          type="monotone" 
                          dataKey="Ingresos" 
                          stroke="#22c55e" 
                          strokeWidth={3} 
                          dot={{ r: 4, fill: '#22c55e', strokeWidth: 2, stroke: '#000' }}
                          activeDot={{ r: 6, strokeWidth: 0 }}
                      />
                      <Line 
                          type="monotone" 
                          dataKey="Egresos" 
                          stroke="#ef4444" 
                          strokeWidth={3} 
                          dot={{ r: 4, fill: '#ef4444', strokeWidth: 2, stroke: '#000' }}
                          activeDot={{ r: 6, strokeWidth: 0 }}
                      />
                  </LineChart>
              </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-black/40 rounded-lg border border-gray-800">
                  <span className="text-[10px] text-gray-500 uppercase font-bold block mb-1">Tendencia de Ingresos</span>
                  <div className="flex items-end gap-2">
                      <span className="text-xl font-bold text-white">${formatMoney(flowStats.currentIncome)}</span>
                      <span className={`text-xs font-bold mb-1 flex items-center ${flowStats.incomeChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {flowStats.incomeChange >= 0 ? '↑' : '↓'} {Math.abs(flowStats.incomeChange).toFixed(1)}%
                      </span>
                  </div>
                  <p className="text-[9px] text-gray-600 mt-1 italic">Comparado con el periodo anterior</p>
              </div>
              <div className="p-4 bg-black/40 rounded-lg border border-gray-800">
                  <span className="text-[10px] text-gray-500 uppercase font-bold block mb-1">Tendencia de Egresos</span>
                  <div className="flex items-end gap-2">
                      <span className="text-xl font-bold text-white">${formatMoney(flowStats.currentExpense)}</span>
                      <span className={`text-xs font-bold mb-1 flex items-center ${flowStats.expenseChange <= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {flowStats.expenseChange <= 0 ? '↓' : '↑'} {Math.abs(flowStats.expenseChange).toFixed(1)}%
                      </span>
                  </div>
                  <p className="text-[9px] text-gray-600 mt-1 italic">Comparado con el periodo anterior</p>
              </div>
              <div className="p-4 bg-black/40 rounded-lg border border-gray-800">
                  <span className="text-[10px] text-gray-500 uppercase font-bold block mb-1">Eficiencia Operativa</span>
                  <div className="flex items-end gap-2">
                      <span className="text-xl font-bold text-[#D2B48C]">{flowStats.margin.toFixed(1)}%</span>
                      <span className="text-[10px] text-gray-500 mb-1">Margen Neto</span>
                  </div>
                  <div className="w-full bg-gray-800 h-1.5 rounded-full mt-2 overflow-hidden">
                      <div 
                          className="bg-[#D2B48C] h-full transition-all duration-1000" 
                          style={{ width: `${Math.max(0, Math.min(100, flowStats.margin))}%` }}
                      ></div>
                  </div>
              </div>
          </div>
      </div>

      {/* Resumen Mes Anterior (Solo Oveja/Uruguayo) */}
      {(['encargado', 'uruguayo'].includes(currentUser?.username.toLowerCase() || '')) && (() => {
          const now = new Date();
          const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          const prevMonth = prevMonthDate.getMonth();
          const prevYear = prevMonthDate.getFullYear();
          const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

          const prevMonthTransactions = transactions.filter(t => {
              const d = new Date(t.date);
              return d.getMonth() === prevMonth && d.getFullYear() === prevYear;
          });

          const prevIncome = prevMonthTransactions
              .filter(t => t.type === 'INCOME' && t.paymentMethod !== 'DEBT')
              .reduce((s, t) => s + t.amount, 0);

          const prevExpense = prevMonthTransactions
              .filter(t => t.type === 'EXPENSE')
              .reduce((s, t) => s + t.amount, 0);

          const prevBalance = prevIncome - prevExpense;

          const prevMonthReservations = reservations.filter(r => {
              const [y, m] = r.date.split('-').map(Number);
              return (m - 1) === prevMonth && y === prevYear;
          });

          return (
              <div className="mt-12 pt-8 border-t border-gray-800">
                  <h3 className="text-center text-[#D2B48C] mb-6 uppercase text-xs tracking-[0.2em] opacity-70">Resumen {monthNames[prevMonth]} {prevYear}</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto">
                      <div className="p-3 border border-green-900/30 bg-green-900/5 rounded text-center">
                          <h4 className="text-green-500/70 uppercase text-[9px] mb-1">Ingresos</h4>
                          <span className="text-lg font-bold text-white/90">${formatMoney(prevIncome)}</span>
                      </div>
                      <div className="p-3 border border-red-900/30 bg-red-900/5 rounded text-center">
                          <h4 className="text-red-500/70 uppercase text-[9px] mb-1">Gastos</h4>
                          <span className="text-lg font-bold text-white/90">${formatMoney(prevExpense)}</span>
                      </div>
                      <div className="p-3 border border-yellow-900/30 bg-yellow-900/5 rounded text-center">
                          <h4 className="text-yellow-500/70 uppercase text-[9px] mb-1">Balance</h4>
                          <span className={`text-lg font-bold ${prevBalance >= 0 ? 'text-green-400/90' : 'text-red-400/90'}`}>
                              ${formatMoney(prevBalance)}
                          </span>
                      </div>
                      <div className="p-3 border border-blue-900/30 bg-blue-900/5 rounded text-center">
                          <h4 className="text-blue-500/70 uppercase text-[9px] mb-1">Reservas</h4>
                          <span className="text-lg font-bold text-white/90">{prevMonthReservations.length}</span>
                      </div>
                  </div>
              </div>
          );
      })()}
    </div>
  );
};