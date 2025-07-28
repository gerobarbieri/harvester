import { useMemo } from 'react';
import useData from '../../context/DataContext';

export const useFilteredHarvestPlots = (campaignId: string, fieldId: string, filterStatus: string, filterCrop: string, setFilterCrop: (crop: string) => void) => {
    const { harvestPlotsWithDetails, plots, fields } = useData();
    // Encuentra el campo actual
    const field = useMemo(() => fields.find(f => f.id === fieldId), [fields, fieldId]);

    // Encuentra todos los lotes de cosecha en este campo
    const harvestPlotsInField = useMemo(() => {
        return harvestPlotsWithDetails.filter(hp => hp.campaign_id === campaignId && hp.field_id === fieldId);
    }, [harvestPlotsWithDetails, campaignId, fieldId]);

    // Calcula qué lotes aún no han sido asignados para cosechar
    const availablePlots = useMemo(() => {
        const harvestPlotIds = new Set(harvestPlotsInField.map(ap => ap.plot_id));
        return plots.filter(p => p.field_id === fieldId && !harvestPlotIds.has(p.id));
    }, [plots, harvestPlotsInField, fieldId]);

    // Filtra los lotes por el estado seleccionado (Pendiente, En Progreso, etc.)
    const plotsFilteredByStatus = useMemo(() => {
        if (filterStatus === 'Todos') return harvestPlotsInField;
        const statusMap = {
            'Pendientes': 'pending',
            'En Progreso': 'in-progress',
            'Finalizados': 'finished'
        };
        return harvestPlotsInField.filter(p => p.status === statusMap[filterStatus]);
    }, [harvestPlotsInField, filterStatus]);

    const cropNames = useMemo(() => {
        const uniqueCrops = new Set(plotsFilteredByStatus.map(p => `${p.cropName} ${p.cropType}`));
        return ['Todos', ...Array.from(uniqueCrops).sort()];
    }, [plotsFilteredByStatus]);

    const finalFilteredPlots = useMemo(() => {
        if (filterCrop === 'Todos') return plotsFilteredByStatus;
        const filtered = plotsFilteredByStatus.filter(p => `${p.cropName} ${p.cropType}` === filterCrop);
        if (filtered.length === 0 && plotsFilteredByStatus.length > 0) {
            setFilterCrop('Todos');
            return plotsFilteredByStatus;
        }
        return filtered;
    }, [plotsFilteredByStatus, filterCrop, setFilterCrop]);

    return { field, harvestPlotsInField, availablePlots, cropNames, finalFilteredPlots };
};