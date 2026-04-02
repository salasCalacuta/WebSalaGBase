import React, { useState } from 'react';
import { PendingTask, User } from '../../types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Check, Trash2 } from 'lucide-react';

interface PendientesViewProps {
  tasks: PendingTask[];
  onSave: (tasks: PendingTask[]) => void;
  currentUser: User;
}

export const PendientesView: React.FC<PendientesViewProps> = ({ tasks, onSave, currentUser }) => {
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newDetails, setNewDetails] = useState('');

  // Filter tasks to show only those belonging to the current user
  const myTasks = tasks.filter(t => t.username === currentUser.username);

  const handleAddTask = () => {
    if (!newDetails.trim()) return;
    const newTask: PendingTask = {
      id: Math.random().toString(36).substr(2, 9),
      date: newDate,
      details: newDetails,
      completed: false,
      username: currentUser.username // Assign task to current user
    };
    onSave([...tasks, newTask]);
    setNewDetails('');
  };

  const toggleTask = (id: string) => {
    const updated = tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
    onSave(updated);
  };

  const deleteTask = (id: string) => {
    onSave(tasks.filter(t => t.id !== id));
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#D2B48C] uppercase tracking-widest">Mis Pendientes</h2>

      {/* Add Task Form */}
      <div className="bg-gray-900 p-4 rounded border border-[#D2B48C]/20 flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <label className="block text-[#D2B48C] text-xs uppercase font-bold mb-1">Fecha</label>
          <Input 
            type="date" 
            value={newDate} 
            onChange={e => setNewDate(e.target.value)} 
          />
        </div>
        <div className="flex-[3]">
          <label className="block text-[#D2B48C] text-xs uppercase font-bold mb-1">Detalles</label>
          <Input 
            placeholder="Escribí tu pendiente..." 
            value={newDetails} 
            onChange={e => setNewDetails(e.target.value)} 
          />
        </div>
        <div className="flex items-end">
          <Button onClick={handleAddTask} className="w-full md:w-auto">AGREGAR</Button>
        </div>
      </div>

      {/* Tasks List */}
      <div className="bg-gray-900 rounded border border-[#D2B48C]/20 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-black border-b border-[#D2B48C]/20">
              <th className="p-3 text-[#D2B48C] text-xs uppercase font-bold w-32">Fecha</th>
              <th className="p-3 text-[#D2B48C] text-xs uppercase font-bold">Detalles</th>
              <th className="p-3 text-[#D2B48C] text-xs uppercase font-bold w-24 text-center">Estado</th>
              <th className="p-3 text-[#D2B48C] text-xs uppercase font-bold w-16 text-center">Acción</th>
            </tr>
          </thead>
          <tbody>
            {myTasks.sort((a, b) => b.date.localeCompare(a.date)).map(task => (
              <tr key={task.id} className="border-b border-[#D2B48C]/10 hover:bg-white/5 transition-colors">
                <td className="p-3 text-white text-sm font-mono">{task.date}</td>
                <td className={`p-3 text-white text-sm ${task.completed ? 'line-through opacity-50' : ''}`}>
                  {task.details}
                </td>
                <td className="p-3 text-center">
                  <button 
                    onClick={() => toggleTask(task.id)}
                    className={`p-2 rounded-full transition-colors ${task.completed ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
                  >
                    <Check size={16} />
                  </button>
                </td>
                <td className="p-3 text-center">
                  <button 
                    onClick={() => deleteTask(task.id)}
                    className="p-2 text-red-500 hover:bg-red-900/30 rounded transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {myTasks.length === 0 && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-gray-500 italic">No tienes pendientes registrados</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
