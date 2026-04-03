import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { storage } from '../services/storage';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

interface LoginProps {
  onLogin: (user: User) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  // Login State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [captcha, setCaptcha] = useState(() => {
    const a = Math.floor(Math.random() * 10) + 1;
    const b = Math.floor(Math.random() * 10) + 1;
    return { a, b, result: a + b };
  });
  const [captchaInput, setCaptchaInput] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const userLower = username?.trim().toLowerCase();
    const passTrimmed = password?.trim();

    // 1. Client-side validation for hardcoded credentials (Primary for Netlify)
    const ADMIN_USERS: Record<string, string> = {
      'encargado': 'S41a5_=dE!#3nSaY0',
      'uruguayo': 'Male&Tefi2017_Malaver'
    };
    const STAFF_PASS = 'Zky76%13!QXb';
    const STAFF_USERS = ['zequi', 'nacho', 'mai', 'ove', 'abi', 'santi', 'marian', 'leo'];
    const RESERVAS_PASS = 'PuBLicRoCk(Ciclon!27';
    const EVENTOS_PASS = 'Ev/_1A$LPtdx';

    // Simple Captcha check
    if (Number(captchaInput) !== Number(captcha.result)) {
      setError("Captcha incorrecto. Por favor, resuelva el problema matemático.");
      setIsLoading(false);
      return;
    }

    // Check hardcoded users first
    if (ADMIN_USERS[userLower] && passTrimmed === ADMIN_USERS[userLower]) {
      onLogin({ username: username.trim(), role: UserRole.ADMIN });
      setIsLoading(false);
      return;
    }

    if (userLower === 'eventos' && passTrimmed === EVENTOS_PASS) {
      onLogin({ username: 'Eventos', role: UserRole.EVENTOS });
      setIsLoading(false);
      return;
    }

    // Check staff users from config
    const config = storage.getConfig();
    const staffUser = config.staffUsers.find(u => u.name.toLowerCase() === userLower);
    
    if (staffUser) {
      // If password is set in config, check it
      if (staffUser.password && passTrimmed !== staffUser.password) {
        // Fallback to default staff pass if it's one of the default users and no password set?
        // Actually, better to just check if it matches the config password.
      } else if (!staffUser.password && passTrimmed !== STAFF_PASS) {
        // If no password set in config, use default STAFF_PASS
      } else {
        onLogin({ 
          username: staffUser.name, 
          role: UserRole.STAFF,
          permissions: staffUser.permissions || [] 
        });
        setIsLoading(false);
        return;
      }
    }

    // Fallback for hardcoded staff users if not in config
    if (STAFF_USERS.includes(userLower) && passTrimmed === STAFF_PASS) {
      onLogin({ username: username, role: UserRole.STAFF, permissions: ['bandas', 'barra_banda', 'barra', 'vitrina', 'instrumentos', 'cierre'] });
      setIsLoading(false);
      return;
    }

    if (userLower === 'reservas' && passTrimmed === RESERVAS_PASS) {
      onLogin({ username: 'Reservas', role: UserRole.RESERVAS });
      setIsLoading(false);
      return;
    }

    // 2. If no hardcoded match, try the API (for dynamic users if any)
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          username, 
          password, 
          honeypot, 
          captchaAnswer: captchaInput, 
          captchaExpected: captcha.result 
        }),
      });

      if (response.ok) {
        const data = await response.json();
        onLogin(data);
      } else {
        const data = await response.json().catch(() => ({ error: "Credenciales incorrectas o error de servidor." }));
        setError(data.error || "El inicio de sesión es incorrecto. Intentá otra vez por favor! Gracias.");
      }
    } catch (err) {
      console.warn("API Login failed or not available:", err);
      setError("Credenciales incorrectas o error de conexión.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm flex flex-col gap-6">
        <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4 bg-gray-900 p-8 rounded border border-[#D2B48C] shadow-[0_0_20px_rgba(210,180,140,0.1)]">
            <h3 className="text-xl text-[#D2B48C] font-bold text-center uppercase tracking-widest">Ingresar</h3>
            
            {error && (
                <div className="bg-red-900/50 border border-red-500 text-red-200 p-3 rounded text-xs text-center animate-pulse">
                    {error}
                </div>
            )}

            {/* Honeypot field - hidden from users */}
            <div className="hidden">
              <input 
                type="text" 
                name="honeypot" 
                value={honeypot} 
                onChange={e => setHoneypot(e.target.value)} 
                tabIndex={-1} 
                autoComplete="off" 
              />
            </div>

            <Input 
                placeholder="Usuario" 
                value={username} 
                onChange={e => setUsername(e.target.value)} 
                autoFocus
                disabled={isLoading}
            />
            <Input 
                type="password" 
                placeholder="Clave" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                disabled={isLoading}
            />

            <div className="flex flex-col gap-2 mt-2">
                <label className="text-[10px] text-[#D2B48C] uppercase tracking-widest opacity-70">
                    Seguridad: ¿Cuánto es {captcha.a} + {captcha.b}?
                </label>
                <Input 
                    type="number" 
                    placeholder="Resultado" 
                    value={captchaInput} 
                    onChange={e => setCaptchaInput(e.target.value)} 
                    disabled={isLoading}
                    required
                />
            </div>

            <Button type="submit" className="mt-2" disabled={isLoading}>
              {isLoading ? 'CARGANDO...' : 'LOGIN'}
            </Button>
        </form>
    </div>
  );
};