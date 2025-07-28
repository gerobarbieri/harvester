import { useMemo } from 'react';
import { Timestamp } from 'firebase/firestore';
import useData from '../../context/DataContext';

export const useHarvestPlotDetails = (harvestPlotId: string) => {
    const { harvestPlotsWithDetails, harvestPlotsRecords } = useData();

    // Lógica para encontrar el lote actual
    const harvestPlot = useMemo(() =>
        harvestPlotsWithDetails.find(plot => plot.id === harvestPlotId),
        [harvestPlotsWithDetails, harvestPlotId]
    );

    // Lógica para filtrar y ordenar los registros del lote
    const harvestPlotRecords = useMemo(() => {
        if (!harvestPlotsRecords || !harvestPlotId) return [];
        return harvestPlotsRecords
            .filter((record) => record.harvest_plot_id === harvestPlotId)
            .sort((a, b) => {
                if (a.created_at instanceof Timestamp && b.created_at instanceof Timestamp) {
                    return b.created_at.toMillis() - a.created_at.toMillis();
                }
                return 0;
            });
    }, [harvestPlotsRecords, harvestPlotId]);

    // Lógica de cálculos de rendimiento
    const yieldData = useMemo(() => {
        if (!harvestPlot) return { seed: 0, harvested: 0 };
        const harvestedKgs = harvestPlot.harvested_kgs || 0;
        const seed = harvestPlot.hectares > 0 ? harvestedKgs / harvestPlot.hectares : 0;
        const harvested = harvestPlot.harvested_hectares > 0 ? harvestedKgs / harvestPlot.harvested_hectares : 0;
        return { seed, harvested };
    }, [harvestPlot]);

    return {
        harvestPlot,
        harvestPlotRecords,
        yieldData,
        isLoading: !harvestPlot // Una forma simple de saber si ya encontró el dato
    };
};