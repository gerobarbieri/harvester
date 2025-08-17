
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createSilobag } from '../../services/siloBags';
import type { Silobag } from '../../types';
import toast from 'react-hot-toast';

export const useCreateSiloBag = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (siloBagData: Silobag) =>
            createSilobag(siloBagData),

        onMutate: async (newSiloBagData) => {
            await queryClient.cancelQueries({ queryKey: ['siloBags'] });
            const previousSiloBags = queryClient.getQueryData<Silobag[]>(['siloBags']);

            // Optimistic Update para CREAR:
            // Se añade el nuevo silo a la lista existente.
            queryClient.setQueryData<Silobag[]>(['siloBags'], (oldData = []) => [
                ...oldData,
                {
                    id: `optimistic-${Date.now()}`,
                    status: 'active',
                    lost_kg: 0,
                    ...newSiloBagData,
                },
            ]);

            return { previousSiloBags };
        },

        onError: (_err, _variables, context) => {
            // Si algo falla, revierte al estado anterior
            if (context?.previousSiloBags) {
                queryClient.setQueryData(['siloBags'], context.previousSiloBags);
            }
            toast.error('Error al crear el silo.');
        },

        onSuccess: () => {
            toast.success('Silo creado con éxito.');
        },

        onSettled: () => {
            // Al final, re-sincroniza con el servidor para asegurar consistencia
            queryClient.invalidateQueries({ queryKey: ['siloBags'] });
        },
    });
};