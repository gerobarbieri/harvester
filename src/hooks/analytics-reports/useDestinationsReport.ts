import { query, collection, where, documentId, getDocs, getDocsFromCache } from "firebase/firestore";
import { useState, useEffect } from "react";
import useAuth from "../../context/auth/AuthContext";
import { db } from "../../firebase/firebase";
import type { DestinationSummary } from "../../types";

export const useDestinationSummary = (campaignId?: string, cropId?: string, fieldId?: string, plotId?: string) => {
    const { currentUser, loading: authLoading } = useAuth();
    const [destinationSummary, setDestinationSummary] = useState<DestinationSummary[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (authLoading || !currentUser || !campaignId) {
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

        const destinationSummaryQuery = query(
            collection(db, 'destination_analytics_summary'),
            where('organization_id', '==', currentUser.organizationId),
            where(documentId(), ">=", docId),
            where(documentId(), "<", docId + '\uf8ff'),
            where('aggregation_level', '==', aggregationLevel)
        );

        const getSummary = async () => {
            try {
                const cacheSnapshot = await getDocsFromCache(destinationSummaryQuery);
                if (!cacheSnapshot.empty) {
                    const data = cacheSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DestinationSummary));
                    setDestinationSummary(data);
                    setLoading(false);
                }
            } catch (err) { setLoading(false); }

            try {
                const serverSnapshot = await getDocs(destinationSummaryQuery);
                const serverData = serverSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DestinationSummary));
                setDestinationSummary(serverData);
                setLoading(false);
            } catch (err) { setLoading(false); }

        };

        getSummary();

    }, [currentUser, authLoading, campaignId, cropId, fieldId, plotId]);

    return { destinationSummary, loading, error };
};