import React, { useState } from 'react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Contact } from '../types';

interface RegisterProps {
  onRegister: (contact: Contact) => void;
  onCancel: () => void;
}

export const Register: React.FC<RegisterProps> = ({ onRegister, onCancel }) => {
  const [responsibleName, setResponsibleName] = useState('');
  const [bandName, setBandName] = useState('');
  const [musiciansCount, setMusiciansCount] = useState('');
  const [instagram, setInstagram] = useState('@');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [instruments, setInstruments] = useState<string[]>([]);
  const [recordingHours, setRecordingHours] = useState('0');

  const availableInstruments = [
    { id: 'i1', name: 'Guitarra A' },
    { id: 'i2', name: 'Guitarra B' },
    { id: 'i3', name: 'Bajo' },
    { id: 'i4', name: 'Set Platos' },
    { id: 'i5', name: 'Teclado' }
  ];

  const handleInstrumentToggle = (id: string) => {
    if (instruments.includes(id)) {
      setInstruments(instruments.filter(i => i !== id));
    } else {
      setInstruments([...instruments, id]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert("Por favor, ingrese un email válido.");
      return;
    }

    // Phone validation (10 digits)
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phone)) {
      alert("El número de teléfono debe tener 10 dígitos numéricos.");
      return;
    }

    const newContact: Contact = {
      id: Date.now().toString(),
      name: responsibleName,
      responsibleName,
      bandName,
      musiciansCount: Number(musiciansCount),
      instagram,
      email,
      phone,
      password,
      style: '',
      habitualRoom: '',
      cancellationRate: 0,
      attendanceRate: 100,
      points: 0,
      debt: 0,
      isBlocked: false,
      instruments,
      recordingHours: Number(recordingHours)
    };

    onRegister(newContact);
  };

  return (
    <div className="w-full max-w-md mx-auto bg-gray-900 p-8 rounded border border-[#D2B48C] shadow-xl">
      <h2 className="text-2xl font-bold text-[#D2B48C] mb-6 text-center uppercase tracking-widest">Registro de Cliente</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input 
          label="Nombre Responsable" 
          value={responsibleName} 
          onChange={e => setResponsibleName(e.target.value)} 
          required 
        />
        <Input 
          label="Nombre de la Banda" 
          value={bandName} 
          onChange={e => setBandName(e.target.value)} 
          required 
        />
        <Input 
          type="number" 
          label="Cantidad de Integrantes" 
          value={musiciansCount} 
          onChange={e => setMusiciansCount(e.target.value)} 
          required 
        />
        <Input 
          label="Instagram" 
          value={instagram} 
          onChange={e => {
            const val = e.target.value;
            if (val.startsWith('@')) {
              setInstagram(val);
            } else {
              setInstagram('@' + val);
            }
          }} 
        />
        <Input 
          type="email" 
          label="Email" 
          value={email} 
          onChange={e => setEmail(e.target.value)} 
          required 
        />
        <Input 
          label="Teléfono (10 dígitos)" 
          value={phone} 
          onChange={e => setPhone(e.target.value)} 
          required 
        />
        <Input 
          type="password"
          label="Clave" 
          value={password} 
          onChange={e => setPassword(e.target.value)} 
          required 
        />

        <div className="space-y-2">
          <label className="block text-xs uppercase text-gray-500 font-bold">Instrumentos Habituales</label>
          <div className="grid grid-cols-2 gap-2">
            {availableInstruments.map(inst => (
              <label key={inst.id} className="flex items-center gap-2 p-2 bg-gray-800 rounded border border-gray-700 cursor-pointer hover:bg-gray-700 transition-colors">
                <input 
                  type="checkbox" 
                  checked={instruments.includes(inst.id)}
                  onChange={() => handleInstrumentToggle(inst.id)}
                  className="accent-[#D2B48C]"
                />
                <span className="text-xs text-gray-300">{inst.name}</span>
              </label>
            ))}
          </div>
        </div>

        <Input 
          type="number" 
          label="Horas de Grabación Habituales" 
          value={recordingHours} 
          onChange={e => setRecordingHours(e.target.value)} 
        />
        
        <div className="flex gap-4 pt-4">
          <Button type="submit" className="flex-1">REGISTRARSE</Button>
          <Button type="button" variant="secondary" onClick={onCancel} className="flex-1">CANCELAR</Button>
        </div>
      </form>
    </div>
  );
};
