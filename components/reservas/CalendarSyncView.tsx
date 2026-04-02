import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Reservation } from '../../types';

interface CalendarSyncViewProps {
    reservations: Reservation[];
    onSyncComplete: (fetchedReservations?: Reservation[]) => void;
}

export const CalendarSyncView: React.FC<CalendarSyncViewProps> = ({ reservations, onSyncComplete }) => {
    const [isConnecting, setIsConnecting] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [tokens, setTokens] = useState<any>(null);
    
    const GOOGLE_API_CONFIG = {
        user: "salacalacutaweb@gmail.com",
    };

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.data?.type === 'GOOGLE_AUTH_SUCCESS') {
                setTokens(event.data.tokens);
                setIsConnecting(false);
                alert("Conexión con Google exitosa.");
            }
        };
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    const handleConnect = async () => {
        setIsConnecting(true);
        try {
            const response = await fetch('/api/auth/google/url');
            if (!response.ok) throw new Error("Error al obtener URL de autenticación");
            const { url } = await response.json();
            window.open(url, 'google_auth', 'width=600,height=700');
        } catch (error) {
            console.error("Error fetching auth URL:", error);
            setIsConnecting(false);
            alert("Error al conectar con Google. Asegúrese de que GOOGLE_CLIENT_ID esté configurado.");
        }
    };

    const handleSyncFrom = async () => {
        if (!tokens) {
            alert("Primero debes conectar con Google.");
            return;
        }
        setIsSyncing(true);
        try {
            // Validate first
            const valRes = await fetch(`/api/calendar/validate?tokens=${encodeURIComponent(JSON.stringify(tokens))}`);
            const valData = await valRes.json();
            if (!valData.valid) {
                if (valData.error && valData.error.includes('access_denied')) {
                    alert("Error de Acceso: La aplicación está en modo de prueba. \n\nDebes agregar tu correo como 'Tester' en la consola de Google Cloud (OAuth Consent Screen) para poder acceder.");
                } else {
                    alert(`La conexión con Google ya no es válida: ${valData.error || 'Desconocido'}. Por favor, vuelve a conectar.`);
                    setTokens(null);
                }
                setIsSyncing(false);
                return;
            }

            const response = await fetch(`/api/calendar/fetch?tokens=${encodeURIComponent(JSON.stringify(tokens))}`);
            const result = await response.json();
            
            if (response.status === 403 || (result.error && result.error.includes('access_denied'))) {
                alert("Error de Acceso: La aplicación está en modo de prueba. \n\nDebes agregar tu correo como 'Tester' en la consola de Google Cloud (OAuth Consent Screen) para poder acceder.");
                setIsSyncing(false);
                return;
            }

            if (result.success) {
                alert(`Se han obtenido ${result.reservations.length} eventos de Google Calendar.`);
                onSyncComplete(result.reservations);
            } else {
                throw new Error(result.error);
            }
        } catch (error: any) {
            console.error("Fetch Error:", error);
            alert(`Error al obtener eventos: ${error.message}`);
        } finally {
            setIsSyncing(false);
        }
    };

    const handleSyncTo = async () => {
        if (!tokens) {
            alert("Primero debes conectar con Google.");
            return;
        }
        setIsSyncing(true);
        try {
            // Validate first
            const valRes = await fetch(`/api/calendar/validate?tokens=${encodeURIComponent(JSON.stringify(tokens))}`);
            const valData = await valRes.json();
            if (!valData.valid) {
                alert(`La conexión con Google ya no es válida. Por favor, vuelve a conectar.`);
                setTokens(null);
                setIsSyncing(false);
                return;
            }

            const response = await fetch('/api/calendar/sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reservations, tokens })
            });
            const result = await response.json();
            if (result.success) {
                alert("Sincronización completada con éxito.");
                onSyncComplete();
            } else {
                throw new Error(result.error);
            }
        } catch (error: any) {
            console.error("Sync Error:", error);
            alert(`Error al sincronizar: ${error.message}`);
        } finally {
            setIsSyncing(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center h-[50vh] gap-8">
            <h2 className="text-2xl font-bold text-[#D2B48C]">Sincronización Real de Agenda</h2>
            
            <div className="bg-gray-900 border border-blue-900 p-6 rounded text-center w-full max-w-md">
                <div className="flex items-center justify-center mb-4">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                         <svg viewBox="0 0 24 24" width="24" height="24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                    </div>
                </div>
                <p className="text-gray-400 text-sm mb-1 uppercase tracking-wider">Cuenta objetivo</p>
                <p className="text-blue-400 font-bold text-lg">{GOOGLE_API_CONFIG.user}</p>
                <div className="mt-2 text-xs text-gray-500 bg-black/30 p-2 rounded">
                    Status: <span className={tokens ? "text-green-500" : "text-yellow-500"}>
                        {tokens ? "Conectado" : "Desconectado"}
                    </span>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
                {!tokens ? (
                    <Button onClick={handleConnect} disabled={isConnecting} className="p-8 text-xl border-blue-500 text-blue-400 hover:bg-blue-900/20">
                        {isConnecting ? "Conectando..." : "Conectar con Google"}
                    </Button>
                ) : (
                    <div className="flex gap-4">
                        <Button onClick={handleSyncFrom} disabled={isSyncing} className="p-8 text-xl border-blue-500 text-blue-400 hover:bg-blue-900/20">
                            {isSyncing ? "Sincronizando..." : "Sincronizar DESDE Calendar"}
                        </Button>
                        <Button onClick={handleSyncTo} disabled={isSyncing} variant="secondary" className="p-8 text-xl">
                            {isSyncing ? "Sincronizando..." : "Sincronizar HACIA Calendar"}
                        </Button>
                    </div>
                )}
            </div>
            
            <p className="text-xs text-gray-500 max-w-sm text-center">
                Nota: Se requiere configurar GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET en las variables de entorno de AI Studio.
            </p>
        </div>
    );
};
