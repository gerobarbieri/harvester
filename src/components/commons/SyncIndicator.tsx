import { Wifi, WifiOff, RefreshCw, CheckCircle, AlertCircle } from "lucide-react";
import { useSync } from "../../context/sync/SyncProvider";
import useAuth from "../../context/auth/AuthContext";
import { type FC, useState, useEffect } from "react";
import { format } from "date-fns"; // Para formatear la fecha

const SyncIndicator: FC = () => {
    const { currentUser } = useAuth();
    // Obtenemos triggerSync del contexto
    const { isSyncing, lastSync, syncError, triggerSync } = useSync();
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    if (!currentUser) {
        return null;
    }

    const getStatus = () => {
        if (!isOnline) return { icon: WifiOff, text: "Sin Conexión", color: "text-white/70", disabled: true };
        if (syncError) return { icon: AlertCircle, text: "Error de Sincronización", color: "text-red-400" };
        if (isSyncing) return { icon: RefreshCw, text: "Sincronizando...", color: "text-white", isSpinning: true, disabled: true };
        if (lastSync) {
            // Formateamos la fecha para que sea más legible
            const formattedTime = format(lastSync, 'HH:mm');
            return { icon: CheckCircle, text: `Sincronizado ${formattedTime}hs`, color: "text-white/90" };
        }
        return { icon: Wifi, text: "Online", color: "text-white/70" };
    };

    const { icon: Icon, text, color, isSpinning, disabled } = getStatus();

    // Convertimos el div en un botón
    return (
        <button
            onClick={triggerSync}
            disabled={disabled || isSyncing}
            className="flex items-center gap-2 z-50 px-3 py-1.5 rounded-full bg-white/10 transition-colors hover:bg-white/20 disabled:opacity-70 disabled:cursor-not-allowed"
            title={!disabled ? "Forzar sincronización manual" : text}
        >
            <Icon size={16} className={`${color} ${isSpinning ? 'animate-spin' : ''}`} />
            <span className={`text-sm font-medium ${color}`}>{text}</span>
        </button>
    );
};

export default SyncIndicator;
