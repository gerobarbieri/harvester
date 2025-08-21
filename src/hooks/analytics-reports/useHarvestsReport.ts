import { useState, useEffect } from 'react';
import useAuth from '../../context/auth/AuthContext';
import { doc, getDoc, getDocFromCache } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import type { HarvestSummary } from '../../types';

export const useHarvestSummary = (campaignId?: string, cropId?: string, fieldId?: string, plotId?: string) => {
    const { currentUser, loading: authLoading } = useAuth();
    const [harvestSummary, setHarvestSummary] = useState<HarvestSummary | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (authLoading || !currentUser || !campaignId || !cropId || cropId === 'all') {
            setHarvestSummary(null);
            setError(null);
            return;
        }

        let documentId = `camp_${campaignId}_crop_${cropId}`;
        // 2. CORRECCIÓN: No se debe concatenar un fieldId si es 'all'
        if (fieldId && fieldId !== 'all') documentId += `_field_${fieldId}`;
        if (plotId && fieldId && fieldId !== 'all' && plotId !== 'all') documentId += `_plot_${plotId}`;

        const harvestSummaryDoc = doc(db, 'harvest_analytics_summary', documentId);

        const getSummary = async () => {
            setHarvestSummary(null)
            setError(null);
            try {
                const cacheSnap = await getDocFromCache(harvestSummaryDoc);
                if (cacheSnap.exists()) {
                    setHarvestSummary({ id: cacheSnap.id, ...cacheSnap.data() } as HarvestSummary);
                    setLoading(false);
                }
            }
            catch (err) {
                setLoading(false);
            }
            try {
                const serverSnap = await getDoc(harvestSummaryDoc);
                if (serverSnap.exists()) {
                    setHarvestSummary({ id: serverSnap.id, ...serverSnap.data() } as HarvestSummary);
                    setLoading(false);
                } else {
                    // En lugar de un error, simplemente no hay datos para esa combinación.
                    setHarvestSummary(null);
                    setLoading(false);
                }
            } catch (err) { setLoading(false); }

        };

        getSummary();

    }, [currentUser, authLoading, campaignId, cropId, fieldId, plotId]);

    return { harvestSummary, loading, error };
};