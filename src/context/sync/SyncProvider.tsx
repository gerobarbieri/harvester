import { createContext, useState, useContext, useEffect, useCallback, type ReactNode } from 'react';
import { primeOfflineCache } from '../../services/priming';
import useAuth from '../auth/AuthContext'; // Necesitamos el contexto de Auth para los datos del usuario

interface SyncContextType {
    isSyncing: boolean;
    lastSync: Date | null;
    syncError: Error | null;
    triggerSync: () => Promise<void>;
}

const SyncContext = createContext<SyncContextType | undefined>(undefined);

export const SyncProvider = ({ children }: { children: ReactNode }) => {
    const [isSyncing, setIsSyncing] = useState(false);
    const [lastSync, setLastSync] = useState<Date | null>(null);
    const [syncError, setSyncError] = useState<Error | null>(null);
    const { currentUser } = useAuth();

    const triggerSync = useCallback(async () => {
        if (isSyncing || !navigator.onLine) {
            console.log(`Sync skipped. isSyncing: ${isSyncing}, isOnline: ${navigator.onLine}`);
            return;
        }

        // 2. Verificar si tenemos los datos del usuario necesarios
        if (!currentUser?.organizationId || !currentUser?.role || !currentUser?.uid) {
            console.log("Sync skipped. User data not available yet.");
            return;
        }

        setIsSyncing(true);
        setSyncError(null);

        try {
            await primeOfflineCache(currentUser.organizationId, currentUser.role, currentUser.uid);
            setLastSync(new Date());
            console.log("✅ Sync completed successfully.");
        } catch (error: any) {
            console.error("🔥 Sync failed:", error);
            setSyncError(error);
        } finally {
            setIsSyncing(false);
        }
    }, [isSyncing, currentUser]); // Depende de 'isSyncing' y 'user'

    // Efecto para la primera sincronización cuando el usuario se loguea
    useEffect(() => {
        if (currentUser && !lastSync) { // Si hay usuario y nunca se ha sincronizado
            triggerSync();
        }
    }, [currentUser, lastSync, triggerSync]);


    return (
        <SyncContext.Provider value={{ isSyncing, lastSync, syncError, triggerSync }}>
            {children}
        </SyncContext.Provider>
    );
};

export const useSync = () => {
    return useContext(SyncContext);
};