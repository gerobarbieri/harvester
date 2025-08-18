// src/components/pwa/UpdateManager.tsx
import { useEffect, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { UploadCloud, Check } from 'lucide-react';
import Card from '../commons/Card';
import Button from '../commons/Button';

function UpdateManager() {
    const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);

    const {
        needRefresh: [needRefresh],
        updateServiceWorker,
    } = useRegisterSW({
        onRegistered(r) {
            setRegistration(r);
        },
    });

    const handleUpdate = () => {
        setIsUpdating(true);
        updateServiceWorker(true);
    };

    useEffect(() => {
        if (registration) {
            const interval = setInterval(() => {
                registration.update();
            }, 3600 * 1000); // 1 hora

            return () => clearInterval(interval);
        }
    }, [registration]);

    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible' && registration) {
                registration.update();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [registration]);

    if (needRefresh) {
        return (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[101] flex justify-center items-center p-4 animate-fade-in">
                <Card className="max-w-lg w-full text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary-light">
                        <UploadCloud size={32} className="text-primary-dark" />
                    </div>
                    <div className="mt-4">
                        <h3 className="text-xl font-bold text-text-primary">Nueva versión disponible</h3>
                        <p className="mt-2 text-text-secondary">
                            Hemos lanzado mejoras importantes. Por favor, actualiza la aplicación para continuar.
                        </p>
                    </div>
                    <div className="mt-6">
                        <Button
                            variant="primary"
                            onClick={handleUpdate}
                            isLoading={isUpdating}
                            className="w-full sm:w-auto sm:px-10"
                        >
                            {isUpdating ? 'Actualizando...' : 'Actualizar Ahora'}
                        </Button>
                    </div>
                </Card>
            </div>
        );
    }

    return null;
}

export default UpdateManager;
