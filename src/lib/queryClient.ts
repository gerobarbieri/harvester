// src/lib/queryClient.ts
import { QueryClient } from '@tanstack/react-query';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            gcTime: 1000 * 60 * 60 * 24, // 24 horas: tiempo en caché antes de ser eliminado
            staleTime: 1000 * 60 * 5,    // 5 minutos: tiempo antes de que los datos se consideren "viejos"
            refetchOnWindowFocus: true,  // Refresca datos cuando el usuario vuelve a la pestaña
        },
    },
});

export const persister = createAsyncStoragePersister({
    storage: window.localStorage,
});