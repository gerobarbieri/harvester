// src/hooks/useFirestoreDocumentQuery.ts
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { onSnapshot, type DocumentReference } from 'firebase/firestore';
import { queryClient } from '../../lib/queryClient';

/**
 * Hook genérico para suscripciones a un único documento de Firestore en tiempo real.
 * @param queryKey La "etiqueta" única para este documento en la caché.
 * @param docRef La referencia al documento de Firestore.
 * @param options Opciones como `enabled`.
 */
export const useFirestoreDocumentQuery = <T>(
    queryKey: any[],
    docRef: DocumentReference,
    options: { enabled: boolean } = { enabled: true }
) => {
    const queryClient = useQueryClient();

    return useQuery<T | null, Error>({
        queryKey,
        queryFn: () => {
            return new Promise((resolve, reject) => {
                const unsubscribe = onSnapshot(docRef,
                    (docSnap) => {
                        const data = docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as T : null;
                        // Actualiza la caché de TanStack Query en cada cambio
                        queryClient.setQueryData(queryKey, data);
                        resolve(data);
                    },
                    (error) => {
                        console.error(`Error en la suscripción para [${queryKey}]:`, error);
                        reject(error);
                    }
                );
                // Guarda la función de desuscripción en la metadata de la query
                queryClient.setQueryDefaults(queryKey, { meta: { unsubscribe } });
            });
        },
        enabled: options.enabled,
    });
};

// El listener global para limpiar suscripciones se mantiene igual y funciona para ambos hooks
queryClient.getQueryCache().subscribe(({ type, query }) => {
    if (type === 'observerRemoved' && query.getObserversCount() === 0 && query.meta?.unsubscribe) {
        (query.meta.unsubscribe as () => void)();
        console.log(`Unsubscribed from [${query.queryKey}]`);
    }
});