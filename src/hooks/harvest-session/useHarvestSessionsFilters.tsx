// src/hooks/useHarvestSessionFilters.ts
import { useState, useMemo, useEffect } from 'react';
import type { HarvestSession } from '../../types';

export const useHarvestSessionFilters = (harvestSessions: HarvestSession[] | null) => {
    const [filterStatus, setFilterStatus] = useState('Todos');
    const [filterCrop, setFilterCrop] = useState('Todos');

    // 1. Filtramos la lista base por el estado seleccionado.
    const harvestSessionsFilteredByStatus = useMemo(() => {
        if (filterStatus === 'Todos') return harvestSessions;
        const statusMap = {
            'Pendientes': 'pending',
            'En Progreso': 'in-progress',
            'Finalizados': 'finished'
        };
        return harvestSessions.filter(p => p.status === statusMap[filterStatus]);
    }, [harvestSessions, filterStatus]);

    const cropNames = useMemo(() => {
        const uniqueCrops = new Set(harvestSessionsFilteredByStatus.map(hs => hs.crop.name));
        return ['Todos', ...Array.from(uniqueCrops).sort()];
    }, [harvestSessionsFilteredByStatus]);

    useEffect(() => {
        if (!cropNames.includes(filterCrop)) {
            setFilterCrop('Todos');
        }
    }, [cropNames, filterCrop]);

    const filteredSessions = useMemo(() => {
        if (filterCrop === 'Todos') return harvestSessionsFilteredByStatus;
        return harvestSessionsFilteredByStatus.filter(hs => hs.crop.name === filterCrop);
    }, [harvestSessionsFilteredByStatus, filterCrop]);

    return {
        filteredSessions,
        filterStatus,
        setFilterStatus,
        cropNames,
        filterCrop,
        setFilterCrop
    };
};