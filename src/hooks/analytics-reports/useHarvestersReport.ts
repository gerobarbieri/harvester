import { query, collection, where, documentId, getDocs, getDocsFromCache } from "firebase/firestore";
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
            if (!authLoading) setLoading(false);
            return;
        }

        let docId = `camp_${campaignId}_crop_${cropId}`;
        let aggregationLevel = 'crop';
        if (fieldId) {
            docId += `_field_${fieldId}`;
            aggregationLevel = 'field';
        }
        if (plotId && fieldId) {
            docId += `_plot_${plotId}`;
            aggregationLevel = 'plot';
        }

        const harvestersSummaryQuery = query(
            collection(db, 'harvester_analytics_summary'),
            where('organization_id', '==', currentUser.organizationId),
            where(documentId(), ">=", docId),
            where(documentId(), "<", docId + '\uf8ff'),
            where('aggregation_level', '==', aggregationLevel)
        );

        const getSummary = async () => {
            try {
                const cacheSnapshot = await getDocsFromCache(harvestersSummaryQuery);
                if (!cacheSnapshot.empty) {
                    const data = cacheSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as HarvestersSummary));
                    setHarvestersSummary(data);
                    setLoading(false);
                }
            } catch (err) {
                setLoading(false);
            }

            try {

                const serverSnapshot = await getDocs(harvestersSummaryQuery);
                const serverData = serverSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as HarvestersSummary));
                setHarvestersSummary(serverData);
                setLoading(false);
            } catch (e) {
                setLoading(false);
            }
        };

        getSummary();

    }, [currentUser, authLoading, campaignId, cropId, fieldId, plotId]);

    return { harvestersSummary, loading, error };
};