// src/hooks/reports/useReportsAnalytics.tsx
import { useMemo } from 'react';
import { useDestinationSummary } from './useDestinationsReport';
import { useHarvestersSummary } from "./useHarvestersReport"
import { useHarvestSummary } from "./useHarvestsReport";
import type { DestinationSummary, HarvestersSummary, HarvestSummary } from '../../types';

interface AnalyticsData {
    harvestSummary: HarvestSummary
    harvestersSummary: HarvestersSummary[]
    destinationSummary: DestinationSummary[]
    loading: boolean;
    error: string | null;
}

export const useReportsAnalytics = (
    campaignId: string,
    filters: {
        crop: string;
        field: string;
        plot: string;
    }
): AnalyticsData => {
    // Determine query parameters based on filters
    const queryParams = useMemo(() => {
        const cropId = filters.crop !== 'all' ? filters.crop : undefined;
        const fieldId = filters.field !== 'all' ? filters.field : undefined;
        const plotId = filters.plot !== 'all' ? filters.plot : undefined;

        return { campaignId, cropId, fieldId, plotId };
    }, [campaignId, filters]);

    // Get data from aggregated summaries
    const {
        harvestSummary,
        loading: harvestLoading,
        error: harvestError
    } = useHarvestSummary(
        queryParams.campaignId,
        queryParams.cropId,
        queryParams.fieldId,
        queryParams.plotId
    );

    const {
        destinationSummary,
        loading: destinationLoading,
        error: destinationError
    } = useDestinationSummary(
        queryParams.campaignId,
        queryParams.cropId,
        queryParams.fieldId,
        queryParams.plotId
    );

    const {
        harvestersSummary,
        loading: harvestersLoading,
        error: harvestersError
    } = useHarvestersSummary(
        queryParams.campaignId,
        queryParams.cropId,
        queryParams.fieldId,
        queryParams.plotId
    );

    return useMemo(() => {
        const loading = harvestLoading || destinationLoading || harvestersLoading;
        const error = harvestError || destinationError || harvestersError;

        return {
            harvestSummary,
            harvestersSummary,
            destinationSummary,
            loading,
            error
        };
    }, [
        harvestSummary,
        destinationSummary,
        harvestersSummary,
        harvestLoading,
        destinationLoading,
        harvestersLoading,
        harvestError,
        destinationError,
        harvestersError
    ]);
};