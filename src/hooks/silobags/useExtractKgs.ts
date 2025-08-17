// src/hooks/silobags/useExtractKgs.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { extractKgsSilobag } from '../../services/siloBags'; // Tu función de servicio
import type { Silobag } from '../../types';
import toast from 'react-hot-toast';

export const useExtractKgs = () => {
    const queryClient = useQueryClient();

    return useMutation({
        // 1. La función que realmente ejecuta la escritura en la BD
        mutationFn: ({ siloBagId, movement }: { siloBagId: string, movement: any }) =>
            extractKgsSilobag(siloBagId, movement),

        // 2. LA MAGIA: El optimistic update
        onMutate: async ({ siloBagId, movement }) => {
            // Cancela cualquier recarga de datos para la lista de silos
            await queryClient.cancelQueries({ queryKey: ['siloBags'] });

            // Guarda el estado anterior por si hay que revertir
            const previousSiloBags = queryClient.getQueryData<Silobag[]>(['siloBags']);

            // Actualiza la caché optimistamente
            queryClient.setQueryData<Silobag[]>(['siloBags'], (oldData = []) =>
                oldData.map(silo =>
                    silo.id === siloBagId
                        ? { ...silo, current_kg: silo.current_kg + movement.kg_change } // Sumamos el valor negativo
                        : silo
                )
            );

            // Retorna el estado anterior en un objeto de contexto
            return { previousSiloBags };
        },

        // 3. Si la mutación falla, revierte los cambios
        onError: (_err, _variables, context) => {
            if (context?.previousSiloBags) {
                queryClient.setQueryData(['siloBags'], context.previousSiloBags);
            }
            toast.error("Error al extraer kilos del silobolsa.")
        },

        onSuccess: (_data, _variables, _context) => {
            toast.success("Se extrajeron correctamente los kilos del silobolsa.")
        },

        // 4. Al finalizar (éxito o error), re-sincroniza con el servidor
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['siloBags'] });

        },
    });
};