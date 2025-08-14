import { query, collection, where, onSnapshot } from "firebase/firestore";
import { useState, useEffect } from "react";
import useAuth from "../../context/auth/AuthContext";
import { db } from "../../firebase/firebase";
import type { HarvestersSummary } from "../../types";

export const useHarvestersSummary = (campaignId?: string, cropId?: string, fieldId?: string, plotId?: string) => {
    const { currentUser, loading: authLoading } = useAuth();
    const [harvestersSummary, setHarvestersSummary] = useState<HarvestersSummary[]>([]);
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

        // Determine aggregation level
        let aggregationLevel = 'campaign';
        if (plotId) {
            aggregationLevel = 'plot';
        } else if (fieldId) {
            aggregationLevel = 'field';
        } else if (cropId) {
            aggregationLevel = 'crop';
        }

        let harvestersSummaryQuery = query(
            collection(db, 'harvester_analytics_summary'),
            where('organization_id', '==', currentUser.organizationId),
            where('agregation_level', '==', aggregationLevel)
        );

        // If we have specific filters, search by constructed ID
        if (plotId || fieldId || cropId) {
            let documentId = `camp_${campaignId}`;
            if (plotId) {
                documentId += `_crop_${cropId}_field_${fieldId}_plot_${plotId}`;
            } else if (fieldId) {
                documentId += `_crop_${cropId}_field_${fieldId}`;
            } else if (cropId) {
                documentId += `_crop_${cropId}`;
            }

            harvestersSummaryQuery = query(
                collection(db, 'harvester_analytics_summary'),
                where('organization_id', '==', currentUser.organizationId),
                where('id', '==', documentId),
                where('agregation_level', '==', aggregationLevel)
            );
        }

        const unsubscribe = onSnapshot(harvestersSummaryQuery,
            (snapshot) => {
                const summaryData = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...(doc.data() as Omit<HarvestersSummary, 'id'>)
                }));

                setHarvestersSummary(summaryData);
                setLoading(false);
            },
            (err) => {
                console.error("Error in harvesters_summary subscription:", err);
                setError(err.message);
                setLoading(false);
            }
        );

        return () => unsubscribe();

    }, [currentUser, authLoading, campaignId, cropId, fieldId, plotId]);

    return { harvestersSummary, loading, error };
};