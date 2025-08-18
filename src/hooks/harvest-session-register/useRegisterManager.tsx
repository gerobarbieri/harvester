import { useState, useCallback } from 'react';
import type { HarvestSession, HarvestSessionRegister } from '../../types';
import { addRegister, deleteRegister, updateRegister } from '../../services/harvestSessionRegister';
import { useSiloBags } from '../silobags/useSilobags';
import { useDestinations } from '../destination/useDestinations';
import toast from 'react-hot-toast';

export const useRegisterManager = (
    harvestSession: HarvestSession,
    setSession: (session: HarvestSession) => void
) => {
    const [selectedRegister, setSelectedRegister] = useState<HarvestSessionRegister | null>(null);
    const [modal, setModal] = useState<'add' | 'edit' | 'delete' | null>(null);

    const { siloBags, addOptimisticSiloBag, removeOptimisticSiloBag, updateOptimisticSiloBag } = useSiloBags();
    const { destinations } = useDestinations();

    const handleAdd = useCallback(async (data: any) => {
        const dataWithOrg = { ...data, organization_id: harvestSession.organization_id };
        const destination = data.type === 'truck' ? destinations.find(d => d.id === data.destinationId) : undefined;
        const silobag = data.type === 'silo_bag' ? siloBags.find(s => s.id === data.siloBagId) : undefined;

        addRegister(dataWithOrg, harvestSession, setSession, { add: addOptimisticSiloBag, remove: removeOptimisticSiloBag, update: updateOptimisticSiloBag }, silobag, destination)
            .catch(error => {
                console.error('Error al agregar registro:', error);
            })
        setModal(null);
        toast.success("Registro guardado con exito!");
    }, [destinations, harvestSession, setSession, siloBags, addOptimisticSiloBag, removeOptimisticSiloBag, updateOptimisticSiloBag]);

    const handleUpdate = useCallback(async (newData: any) => {
        if (!selectedRegister) return;
        const dataWithOrg = { ...newData, organization_id: harvestSession.organization_id };
        const destination = newData.type === 'truck' ? destinations.find(d => d.id === newData.destinationId) : undefined;
        const silobag = newData.type === 'silo_bag' ? { id: selectedRegister.silo_bag.id, name: selectedRegister.silo_bag.name, location: newData.location } : undefined;

        updateRegister(dataWithOrg, selectedRegister, harvestSession, setSession, updateOptimisticSiloBag, siloBags, silobag, destination)
            .catch(error => {
                console.log("Error al actualizar el registro", error);
            });
        setModal(null);
        toast.success("Registro actualizado con exito!");
    }, [selectedRegister, harvestSession, setSession, updateOptimisticSiloBag, siloBags, destinations]);

    const handleDelete = useCallback(async () => {
        if (!selectedRegister) return;

        deleteRegister(selectedRegister, harvestSession, setSession, updateOptimisticSiloBag, siloBags)
            .catch(error => {
                console.error('Error al eliminar registro:', error);
            });
        setModal(null);
        toast.success("Registro eliminado con exito!");
    }, [selectedRegister, harvestSession, setSession, updateOptimisticSiloBag, siloBags]);

    const openModal = useCallback((type: 'add' | 'edit' | 'delete', register?: HarvestSessionRegister) => {
        if (register) setSelectedRegister(register);
        setModal(type);
    }, []);

    const closeModal = useCallback(() => {
        setModal(null);
        setSelectedRegister(null);
    }, []);

    return {
        selectedRegister,
        modal,
        handlers: {
            add: handleAdd,
            update: handleUpdate,
            delete: handleDelete,
        },
        ui: {
            openModal,
            closeModal,
        },
    };
};