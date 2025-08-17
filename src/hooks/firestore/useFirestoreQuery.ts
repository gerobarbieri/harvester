// src/hooks/useFirestoreQuery.ts
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { onSnapshot, type Query } from 'firebase/firestore';
import { queryClient } from '../../lib/queryClient';

/**
 * Hook genérico para suscripciones de Firestore en tiempo real con TanStack Query.
 * Maneja la suscripción, actualización de caché y desuscripción automática.
 * @param queryKey La "etiqueta" única para estos datos en la caché.
 * @param firestoreQuery La consulta de Firestore a ejecutar.
 * @param options Opciones adicionales como `enabled`.
 */
export const useFirestoreQuery = <T>(
    queryKey: any[],
    firestoreQuery: Query,
    options: { enabled: boolean } = { enabled: true }
) => {
    const queryClient = useQueryClient();

    // El hook useQuery se encarga del estado de carga, error y datos.
    return useQuery<T[], Error>({
        queryKey,
        queryFn: () => {
            // queryFn debe devolver una promesa. Creamos una que se resuelve
            // la primera vez que onSnapshot devuelve datos.
            return new Promise((resolve, reject) => {
                const unsubscribe = onSnapshot(firestoreQuery,
                    (snapshot) => {
                        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as T[];
                        queryClient.setQueryData(queryKey, data);
                        resolve(data);
                    },
                    (error) => {
                        console.error(`Error en la suscripción para [${queryKey}]:`, error);
                        reject(error);
                    }
                );

                queryClient.setQueryDefaults(queryKey, { meta: { unsubscribe } });
            });
        },
        enabled: options.enabled,
    });
};

// Listener global para limpiar suscripciones cuando ya no se usan.
queryClient.getQueryCache().subscribe(({ type, query }) => {
    if (type === 'observerRemoved' && query.getObserversCount() === 0 && query.meta?.unsubscribe) {
        (query.meta.unsubscribe as () => void)();
    }
});