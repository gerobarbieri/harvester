// src/components/commons/SyncIndicator.tsx
import { Wifi, WifiOff, RefreshCw, CheckCircle, AlertCircle } from "lucide-react";
import { useSync } from "../../context/sync/SyncProvider";
import useAuth from "../../context/auth/AuthContext";
import { type FC, useState, useEffect } from "react";

// Ya no necesita la prop "variant"
const SyncIndicator: FC = () => {
    const { currentUser } = useAuth();
    const { isSyncing, lastSync, syncError } = useSync(); // Ya no necesita triggerSync
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
        // Lógica de estado y color solo para la versión de cabecera
        if (!isOnline) return { icon: WifiOff, text: "Offline", color: "text-white/70" };
        if (syncError) return { icon: AlertCircle, text: "Error", color: "text-red-400" };
        if (isSyncing) return { icon: RefreshCw, text: "Sincronizando", color: "text-white", isSpinning: true };
        if (lastSync) return { icon: CheckCircle, text: "Sincronizado", color: "text-green-600", bgColor: "bg-green-100" };
        return { icon: Wifi, text: "Online", color: "text-white/70" };
    };

    const { icon: Icon, text, color, isSpinning } = getStatus();

    return (
        // Estilos fijos para la cabecera
        <div className="flex items-center gap-2 z-50 px-3 py-1.5 rounded-full bg-white/10">
            <Icon size={16} className={`${color} ${isSpinning ? 'animate-spin' : ''}`} />
            <span className={`text-sm font-medium ${color}`}>{text}</span>
        </div>
    );
};

export default SyncIndicator;