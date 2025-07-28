
import { useState, useEffect } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

function UpdateManager() {
    const [registration, setRegistration] = useState(null);

    const {
        needRefresh: [needRefresh],
        updateServiceWorker,
    } = useRegisterSW({
        onRegistered(r) {
            setRegistration(r);
        },
    });

    // EFECTO 1: Comprobación periódica cada hora
    useEffect(() => {
        if (registration) {
            const interval = setInterval(() => {
                console.log('Buscando nueva versión (intervalo)...');
                registration.update();
            }, 3600 * 1000);

            return () => clearInterval(interval);
        }
    }, [registration]);

    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                console.log('Buscando nueva versión (visibilidad)...');
                registration?.update();
            }
        };

        if (registration) {
            document.addEventListener('visibilitychange', handleVisibilityChange);

            return () => {
                document.removeEventListener('visibilitychange', handleVisibilityChange);
            };
        }
    }, [registration]);

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
