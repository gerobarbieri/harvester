// src/components/commons/RefreshBanner.tsx
import type { FC } from "react";
import { useSync } from "../../context/sync/SyncProvider";

const RefreshBanner: FC = () => {
    const { showRefreshPrompt, setShowRefreshPrompt, triggerSync, isSyncing } = useSync();

    if (!showRefreshPrompt || isSyncing) {
        return null;
    }

    const handleRefresh = () => {
        setShowRefreshPrompt(false);
        triggerSync();
    };

    return (
        <div className="sticky top-4 z-50 mx-4 lg:mx-auto lg:max-w-3xl">
            <div className="bg-primary-darker text-white rounded-xl shadow-2xl p-4 flex items-center justify-between gap-4 animate-fade-in-down">
                <div>
                    <h4 className="font-bold">¡Bienvenido de vuelta!</h4>
                    <p className="text-sm text-white/80">Hay nuevos datos disponibles para sincronizar.</p>
                </div>
                <button
                    onClick={handleRefresh}
                    className="bg-white/20 hover:bg-white/30 text-white font-bold py-2 px-4 rounded-lg transition-colors flex-shrink-0"
                >
                    Actualizar
                </button>
            </div>
        </div>
    );
}

export default RefreshBanner;