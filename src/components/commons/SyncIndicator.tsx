// src/components/commons/SyncIndicator.tsx
import { Wifi, WifiOff, RefreshCw, CheckCircle, AlertCircle } from "lucide-react";
import { useSync } from "../../context/sync/SyncProvider";
import useAuth from "../../context/auth/AuthContext";
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { type FC, useState, useEffect } from "react";

const SyncIndicator: FC = () => {
    const { currentUser } = useAuth();
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

    // Si no hay usuario, el indicador no debe mostrarse.
    if (!currentUser) {
        return null;
    }

    const getStatus = () => {
        if (!isOnline) return { icon: WifiOff, text: "Sin conexión", color: "text-gray-500", bgColor: "bg-gray-100" };
        if (syncError) return { icon: AlertCircle, text: "Error de sync", color: "text-red-600", bgColor: "bg-red-100" };
        if (isSyncing) return { icon: RefreshCw, text: "Sincronizando...", color: "text-blue-600", bgColor: "bg-blue-100", isSpinning: true };
        if (lastSync) return { icon: CheckCircle, text: `Sincronizado ${formatDistanceToNow(lastSync, { addSuffix: true, locale: es })}`, color: "text-green-600", bgColor: "bg-green-100" };
        return { icon: Wifi, text: "En línea", color: "text-gray-500", bgColor: "bg-gray-100" };
    };

    const { icon: Icon, text, color, bgColor, isSpinning } = getStatus();

    const handleManualSync = async () => {
        await triggerSync();
    };

    return (
        <div className={`fixed bottom-4 left-4 z-50 flex items-center gap-3 pl-3 pr-2 py-2 rounded-full shadow-lg border border-gray-200/80 ${bgColor}`}>
            <Icon size={18} className={`${color} ${isSpinning ? 'animate-spin' : ''}`} />
            <span className={`text-sm font-semibold ${color}`}>{text}</span>

            {!isSyncing && isOnline && (
                <button onClick={handleManualSync} title="Forzar Sincronización" className="p-1.5 rounded-full hover:bg-black/10 transition-colors">
                    <RefreshCw size={16} className={syncError ? 'text-red-600' : 'text-gray-500'} />
                </button>
            )}
        </div>
    );
};

export default SyncIndicator;