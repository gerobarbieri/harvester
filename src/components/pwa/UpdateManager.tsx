import { useEffect } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { useSync } from '../../context/sync/SyncProvider';

function UpdateManager() {
    const { triggerSync } = useSync();
    const {
        needRefresh: [needRefresh],
        updateServiceWorker,
    } = useRegisterSW({
        onRegistered(r) {
            console.log('Service Worker registered. Checking for updates and data...');
            r?.update();
            // triggerSync();
        },
    });

    useEffect(() => {
        const handleActivity = () => {
            if (document.visibilityState === 'visible' && navigator.onLine) {
                console.log('App is visible and online. Triggering sync...');
                // triggerSync();
            }
        };
        document.addEventListener('visibilitychange', handleActivity);
        window.addEventListener('online', handleActivity);

        return () => {
            document.removeEventListener('visibilitychange', handleActivity);
            window.removeEventListener('online', handleActivity);
        };
    }, [triggerSync]);

    if (needRefresh) {
        return (
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex justify-center items-center p-4">
                <div className="p-4 rounded-lg shadow-2xl bg-white border border-gray-200 flex items-center justify-between gap-4">
                    <div className="flex-grow">
                        <h3 className="font-bold text-gray-800">¡Nueva versión disponible! 🚀</h3>
                        <p className="text-sm text-gray-600">Recarga para obtener las últimas mejoras.</p>
                    </div>
                    <button
                        onClick={() => updateServiceWorker(true)}
                        className="px-5 py-2 text-sm font-bold text-white bg-[#2A6449] rounded-md hover:bg-[#21523B] transition-colors flex-shrink-0"
                    >
                        Actualizar
                    </button>
                </div>
            </div>
        );
    }

    return null;
}

export default UpdateManager;