import { query, collection, where, onSnapshot } from "firebase/firestore";
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

        const destinationSummaryQuery = query(
            collection(db, 'destination_analytics_summary'),
            where('organization_id', '==', currentUser.organizationId),
            where('id', '==', documentId),
            where('agregation_level', '==', aggregationLevel)
        );

        const unsubscribe = onSnapshot(destinationSummaryQuery,
            (snapshot) => {
                const summaryData = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...(doc.data() as Omit<DestinationSummary, 'id'>)
                }));

                setDestinationSummary(summaryData);
                setLoading(false);
            },
            (err) => {
                console.error("Error in destination_summary subscription:", err);
                setError(err.message);
                setLoading(false);
            }
        );

        return () => unsubscribe();

    }, [currentUser, authLoading, campaignId, cropId, fieldId, plotId]);

    return { destinationSummary, loading, error };
};