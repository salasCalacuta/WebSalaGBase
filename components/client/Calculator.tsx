import React, { useState } from 'react';
import { Input } from '../ui/Input';

export const Calculator: React.FC = () => {
    const [total, setTotal] = useState('');
    const [members, setMembers] = useState('');

    const result = (parseFloat(total) / parseFloat(members));

    return (
        <div className="mt-8 p-4 border border-dashed border-[#D2B48C]/50 rounded bg-[#D2B48C]/5">
            <h3 className="text-[#D2B48C] font-bold uppercase mb-4 text-center">Calculadora de Gastos</h3>
            <div className="flex gap-2 items-end">
                <Input 
                    type="number" 
                    placeholder="Total $" 
                    value={total} 
                    onChange={e => setTotal(e.target.value)}
                    label="Monto Total"
                />
                <div className="text-xl pb-2">/</div>
                <Input 
                    type="number" 
                    placeholder="Integrantes" 
                    value={members} 
                    onChange={e => setMembers(e.target.value)}
                    label="Músicos"
                />
            </div>
            {total && members && !isNaN(result) && (
                <div className="mt-4 text-center">
                    <span className="text-xs uppercase text-gray-500">Cada uno paga:</span>
                    <div className="text-3xl font-bold text-white">${result.toFixed(0)}</div>
                </div>
            )}
        </div>
    );
}