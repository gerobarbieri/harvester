import { query, collection, where, onSnapshot, documentId } from "firebase/firestore";
import { useState, useEffect } from "react";
import type { DestinationSummary } from "../../../shared/types";
import useAuth from "../../../shared/context/auth/AuthContext";
import { db } from "../../../shared/firebase/firebase";

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
        let docId = `camp_${campaignId}_crop_${cropId}`;
        let aggregationLevel = 'crop';

        if (fieldId) {
            docId += `_field_${fieldId}`;
            aggregationLevel = 'field';
        }

        if (plotId && fieldId) { // Plot requiere field
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