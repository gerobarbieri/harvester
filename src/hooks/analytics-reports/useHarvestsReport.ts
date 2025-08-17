// src/hooks/summaries/useHarvestSummary.tsx
import { useState, useEffect } from 'react';
import useAuth from '../../context/auth/AuthContext';
import { collection, doc, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import type { HarvestSummary } from '../../types';

export const useHarvestSummary = (
    campaignId?: string,
    cropId?: string,
    fieldId?: string,
    plotId?: string
) => {
    const { currentUser, loading: authLoading } = useAuth();
    const [harvestSummary, setHarvestSummary] = useState<HarvestSummary | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Mínimo requerido: campaign + crop
        if (authLoading || !currentUser || !campaignId || !cropId) {
            if (!authLoading) setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        // Armar document ID simplemente concatenando los valores que existen
        let documentId = `camp_${campaignId}_crop_${cropId}`;
        let aggregationLevel = 'crop';

        if (fieldId) {
            documentId += `_field_${fieldId}`;
            aggregationLevel = 'field';
        }

        if (plotId && fieldId) { // Plot requiere field
            documentId += `_plot_${plotId}`;
            aggregationLevel = 'plot';
        }

        const harvestSummaryDoc = doc(db, 'harvest_analytics_summary', documentId);

        const unsubscribe = onSnapshot(harvestSummaryDoc,
            (snapshot) => {
                if (snapshot.exists()) {
                    const harvestSummaryData = { id: snapshot.id, ...snapshot.data() };
                    setHarvestSummary(harvestSummaryData as HarvestSummary);
                } else {
                    console.error("No hay harvest summary.");
                    setError("El resumen de cosecha no fue encontrado.");
                }
                setLoading(false);
            },
            (err) => {
                console.error("Error:", err);
                setError(err.message);
                setLoading(false);
            }
        );

        return () => unsubscribe();

    }, [currentUser, authLoading, campaignId, cropId, fieldId, plotId]);

    return { harvestSummary, loading, error };
};