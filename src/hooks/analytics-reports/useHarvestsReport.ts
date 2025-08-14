// src/hooks/summaries/useHarvestSummary.tsx
import { useState, useEffect } from 'react';
import useAuth from '../../context/auth/AuthContext';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import type { HarvestSummary } from '../../types';

export const useHarvestSummary = (campaignId?: string, cropId?: string, fieldId?: string, plotId?: string) => {
    const { currentUser, loading: authLoading } = useAuth();
    const [harvestSummary, setHarvestSummary] = useState<HarvestSummary | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (authLoading || !currentUser || !campaignId) {
            if (!authLoading) {
                setLoading(false);
            }
            return;
        }

        setLoading(true);
        setError(null);

        // Build document ID based on filters
        let documentId = `camp_${campaignId}`;
        let aggregationLevel = 'campaign';

        if (plotId) {
            documentId += `_crop_${cropId}_field_${fieldId}_plot_${plotId}`;
            aggregationLevel = 'plot';
        } else if (fieldId) {
            documentId += `_crop_${cropId}_field_${fieldId}`;
            aggregationLevel = 'field';
        } else if (cropId) {
            documentId += `_crop_${cropId}`;
            aggregationLevel = 'crop';
        }

        const harvestSummaryQuery = query(
            collection(db, 'harvest_analytics_summary'),
            where('organization_id', '==', currentUser.organizationId),
            where('id', '==', documentId),
            where('agregation_level', '==', aggregationLevel)
        );

        const unsubscribe = onSnapshot(harvestSummaryQuery,
            (snapshot) => {
                const summaryData = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...(doc.data() as Omit<HarvestSummary, 'id'>)
                }));

                setHarvestSummary(summaryData[0] || null);
                setLoading(false);
            },
            (err) => {
                console.error("Error in harvest_summary subscription:", err);
                setError(err.message);
                setLoading(false);
            }
        );

        return () => unsubscribe();

    }, [currentUser, authLoading, campaignId, cropId, fieldId, plotId]);

    return { harvestSummary, loading, error };
};