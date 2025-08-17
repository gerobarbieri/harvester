// src/hooks/silobags/useCloseSiloBag.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { closeSilobag } from '../../services/siloBags';
import type { Silobag } from '../../types';

export const useCloseSiloBag = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ siloBag, details, organizationId }: { siloBag: Silobag, details: string, organizationId: string }) =>
            closeSilobag(siloBag, details, organizationId),

        onMutate: async ({ siloBag }) => {
            // Cancela recargas para no sobreescribir nuestro update optimista
            await queryClient.cancelQueries({ queryKey: ['siloBags'] });

            // Guarda el estado actual
            const previousSiloBags = queryClient.getQueryData<Silobag[]>(['siloBags']);

            // Actualiza la caché optimistamente
            queryClient.setQueryData<Silobag[]>(['siloBags'], (oldData = []) =>
                oldData.map(s =>
                    s.id === siloBag.id
                        ? { ...s, status: 'closed', lost_kg: s.current_kg, current_kg: 0 }
                        : s
                )
            );

            return { previousSiloBags };
        },

        onError: (err, variables, context) => {
            // Si algo falla, revierte al estado anterior
            if (context?.previousSiloBags) {
                queryClient.setQueryData(['siloBags'], context.previousSiloBags);
            }
            // showToast('Error al cerrar el silo.', 'error');
        },

        onSuccess: () => {
            // showToast('Silo cerrado con éxito.', 'success');
        },

        onSettled: () => {
            // Al final, re-sincroniza con el servidor para asegurar consistencia
            queryClient.invalidateQueries({ queryKey: ['siloBags'] });
        },
    });
};