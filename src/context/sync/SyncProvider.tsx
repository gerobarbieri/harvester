// context/sync/SyncProvider.tsx
import { createContext, useState, useContext, useEffect, useCallback, useRef, type ReactNode } from 'react';
import { primeOfflineCache } from '../../services/priming'
import useAuth from '../auth/AuthContext';

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
    triggerSync: () => Promise<void>;
    clearSyncError: () => void;
}

const SyncContext = createContext<SyncContextType | undefined>(undefined);

export const SyncProvider = ({ children }: { children: ReactNode }) => {
    const [isSyncing, setIsSyncing] = useState(false);
    const [lastSync, setLastSync] = useState<Date | null>(null);
    const [syncError, setSyncError] = useState<Error | null>(null);
    const [syncMetrics, setSyncMetrics] = useState<PrimingMetrics | null>(null);
    const { currentUser } = useAuth();

    // ✅ Rate limiting - evitar múltiples syncs muy seguidos
    const lastSyncAttempt = useRef<number>(0);
    const RATE_LIMIT_MS = 10000; // 10 segundos entre syncs

    const triggerSync = useCallback(async () => {
        // ✅ Rate limiting mejorado
        const now = Date.now();
        if (now - lastSyncAttempt.current < RATE_LIMIT_MS) {
            console.log(`⏳ Rate limit: esperando ${Math.ceil((RATE_LIMIT_MS - (now - lastSyncAttempt.current)) / 1000)}s`);
            return;
        }

        if (isSyncing) {
            console.log('🔄 Sync ya en progreso, saltando...');
            return;
        }

        if (!navigator.onLine) {
            console.log('📱 Sin conexión - usando cache offline');
            setSyncError(new Error('Sin conexión a internet'));
            return;
        }

        if (!currentUser?.organizationId || !currentUser?.role || !currentUser?.uid) {
            console.log("👤 Datos de usuario no disponibles para sync");
            return;
        }

        lastSyncAttempt.current = now;
        setIsSyncing(true);
        setSyncError(null);
        setSyncMetrics(null);

        try {
            console.log(`🚀 Iniciando sync para ${currentUser.role} en org: ${currentUser.organizationId}`);

            // ✅ Capturar métricas del priming
            const metrics = await primeOfflineCache(
                currentUser.organizationId,
                currentUser.role,
                currentUser.uid
            );

            setLastSync(new Date());
            setSyncMetrics(metrics);

            console.log(`✅ Sync completado: ${metrics.totalQueries} queries, ${metrics.totalDocuments} docs en ${metrics.duration}ms`);

            // ✅ Log detallado solo en desarrollo
            if (process.env.NODE_ENV === 'development') {
                console.table({
                    'Queries totales': metrics.totalQueries,
                    'Documentos': metrics.totalDocuments,
                    'Duración (ms)': metrics.duration,
                    'Última fase': metrics.stage,
                    'Errores': metrics.errors.length
                });

                if (metrics.errors.length > 0) {
                    console.warn('⚠️ Errores durante el sync:', metrics.errors);
                }
            }

        } catch (error: any) {
            console.error("🔥 Sync failed:", error);
            setSyncError(error);

            // ✅ Métricas parciales si hubo error
            if (error.metrics) {
                setSyncMetrics(error.metrics);
            }
        } finally {
            setIsSyncing(false);
        }
    }, [currentUser]); // ✅ Eliminado isSyncing de dependencias para evitar bucles

    // ✅ Función para limpiar errores manualmente
    const clearSyncError = useCallback(() => {
        setSyncError(null);
    }, []);

    // ✅ Sync inicial mejorado
    useEffect(() => {
        if (currentUser && !lastSync && !isSyncing) {
            console.log('🎯 Primera sincronización para usuario logueado');
            triggerSync();
        }
    }, [currentUser, lastSync, triggerSync]); // ✅ Quitado isSyncing de dependencias

    // ✅ Sync cuando vuelve la conexión
    useEffect(() => {
        const handleOnline = () => {
            if (currentUser && !isSyncing) {
                console.log('🌐 Conexión restaurada, sincronizando...');
                triggerSync();
            }
        };

        window.addEventListener('online', handleOnline);
        return () => window.removeEventListener('online', handleOnline);
    }, [currentUser, triggerSync]); // ✅ Sin isSyncing

    // ✅ Cleanup cuando el usuario se desloguea
    useEffect(() => {
        if (!currentUser) {
            setLastSync(null);
            setSyncError(null);
            setSyncMetrics(null);
            lastSyncAttempt.current = 0;
            console.log('🧹 Sync state limpiado por logout');
        }
    }, [currentUser]);

    const value = {
        isSyncing,
        lastSync,
        syncError,
        syncMetrics,
        triggerSync,
        clearSyncError
    };

    return (
        <SyncContext.Provider value={value}>
            {children}
        </SyncContext.Provider>
    );
};

export const useSync = () => {
    const context = useContext(SyncContext);
    if (context === undefined) {
        throw new Error('useSync must be used within a SyncProvider');
    }
    return context;
};