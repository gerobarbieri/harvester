// src/context/sync/SyncProvider.tsx
import { createContext, useState, useContext, useEffect, useCallback, useRef, type ReactNode } from 'react';
import { primeOfflineCache } from '../../services/priming';
import useAuth from '../auth/AuthContext';
import toast from 'react-hot-toast';
import { useDeviceType } from '../../hooks/useDeviceType';

interface PrimingMetrics {
    totalQueries: number;
    totalDocuments: number;
    duration: number;
    stage: string;
    errors: string[];
}

interface SyncContextType {
    isSyncing: boolean;
    lastSync: Date | null;
    syncError: Error | null;
    syncMetrics: PrimingMetrics | null;
    triggerSync: () => Promise<boolean>;
    showRefreshPrompt: boolean;
    setShowRefreshPrompt: (show: boolean) => void;
}

const SyncContext = createContext<SyncContextType | undefined>(undefined);

// --- CONSTANTES DE ESTRATEGIA DE SYNC ---
const MANUAL_SYNC_RATE_LIMIT_MS = 1000 * 60 * 60; // 1 hora para el botón manual
const RECONNECT_STALE_THRESHOLD_MS = 1000 * 60 * 15; // 15 minutos para reconexión automática

export const SyncProvider = ({ children }: { children: ReactNode }) => {
    const [isSyncing, setIsSyncing] = useState(false);
    const [lastSync, setLastSync] = useState<Date | null>(() => {
        const saved = localStorage.getItem('lastSync');
        return saved ? new Date(saved) : null;
    });
    const [syncError, setSyncError] = useState<Error | null>(null);
    const [syncMetrics, setSyncMetrics] = useState<PrimingMetrics | null>(null);
    const [showRefreshPrompt, setShowRefreshPrompt] = useState(false);
    const { currentUser } = useAuth();
    const { isMobileOrTablet } = useDeviceType();
    const lastManualSyncAttempt = useRef<number>(0);

    const triggerSync = useCallback(async (isManual = false): Promise<boolean> => {
        const now = Date.now();

        if (isManual) {
            if (now - lastManualSyncAttempt.current < MANUAL_SYNC_RATE_LIMIT_MS) {
                const waitTime = Math.ceil((MANUAL_SYNC_RATE_LIMIT_MS - (now - lastManualSyncAttempt.current)) / 1000);
                toast.error(`Ya has sincronizado recientemente. Inténtalo de nuevo en ${waitTime} segundos.`);
                return false;
            }
            lastManualSyncAttempt.current = now;
        }

        if (isSyncing) { return false; }
        if (!navigator.onLine) {
            if (isManual) toast('No hay conexión. La app funciona con datos locales.', { icon: '🟡' });
            return false;
        }
        if (!currentUser) { return false; }

        setShowRefreshPrompt(false);
        setIsSyncing(true);
        setSyncError(null);
        setSyncMetrics(null);

        try {
            console.log(`🚀 Iniciando sincronización para ${currentUser.role}`);
            const metrics = await primeOfflineCache(currentUser.organizationId, currentUser.role, currentUser.uid);

            const syncDate = new Date();
            setLastSync(syncDate);
            localStorage.setItem('lastSync', syncDate.toISOString());
            localStorage.setItem('lastSyncDate', syncDate.toISOString().split('T')[0]);
            setSyncMetrics(metrics);

            console.log(`✅ Sincronización completada.`);
            if (isManual) toast.success('Sincronización manual completada.');
            return true;
        } catch (error: any) {
            console.error("🔥 Falló la sincronización:", error);
            setSyncError(error);
            toast.error('Hubo un error durante la sincronización.');
            if (error.metrics) setSyncMetrics(error.metrics);
            return false;
        } finally {
            setIsSyncing(false);
        }
    }, [currentUser, isSyncing]);

    useEffect(() => {
        if (currentUser && !isSyncing && isMobileOrTablet) {
            const today = new Date().toISOString().split('T')[0];
            const lastSyncDate = localStorage.getItem('lastSyncDate');
            if (today !== lastSyncDate) {
                console.log('🎯 MÓVIL: Primera sincronización del día.');
                triggerSync();
            }
        }
    }, [currentUser, isSyncing, triggerSync, isMobileOrTablet]);

    useEffect(() => {
        const handleOnline = () => {
            if (currentUser && !isSyncing && isMobileOrTablet) {
                const timeSinceLastSync = lastSync ? new Date().getTime() - lastSync.getTime() : Infinity;
                if (timeSinceLastSync > RECONNECT_STALE_THRESHOLD_MS) {
                    console.log('🌐 MÓVIL: Conexión restaurada y datos desactualizados, sincronizando...');
                    triggerSync();
                }
            }
        };
        window.addEventListener('online', handleOnline);
        return () => window.removeEventListener('online', handleOnline);
    }, [currentUser, isSyncing, lastSync, triggerSync, isMobileOrTablet]);

    // Muestra el banner de actualización al volver a la app
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible' && lastSync && !isSyncing) {
                const timeSinceLastSync = new Date().getTime() - lastSync.getTime();
                if (timeSinceLastSync > RECONNECT_STALE_THRESHOLD_MS) {
                    setShowRefreshPrompt(true);
                }
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [lastSync, isSyncing]);

    useEffect(() => {
        if (!currentUser) {
            setLastSync(null);
            localStorage.removeItem('lastSync');
            localStorage.removeItem('lastSyncDate');
            setSyncError(null);
            setSyncMetrics(null);
            lastManualSyncAttempt.current = 0;
            console.log('🧹 Estado de sincronización limpiado por logout.');
        }
    }, [currentUser]);

    const value: SyncContextType = {
        isSyncing,
        lastSync,
        syncError,
        syncMetrics,
        triggerSync: () => triggerSync(true),
        showRefreshPrompt,
        setShowRefreshPrompt,
    };

    return (
        <SyncContext.Provider value={value}>
            {children}
        </SyncContext.Provider>
    );
};

export const useSync = (): SyncContextType => {
    const context = useContext(SyncContext);
    if (context === undefined) {
        throw new Error('useSync debe ser usado dentro de un SyncProvider');
    }
    return context;
};