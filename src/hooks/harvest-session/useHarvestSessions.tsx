import { useState, useEffect } from 'react';
import useAuth from '../../context/auth/AuthContext';
import type { HarvestSession } from '../../types';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../../firebase/firebase';

export const useHarvestSessions = (campaignId: string, fieldId: string) => {
    const { currentUser, loading: authLoading } = useAuth();
    const [harvestSessions, setHarvestSessions] = useState<HarvestSession[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (authLoading || !currentUser) {
            if (!authLoading) {
                setLoading(false);
            }
            return;
        }
        const harvestSessionsQuery = query(
            collection(db, 'harvest_sessions'),
            where('organization_id', '==', currentUser.organizationId),
            where('campaign.id', '==', campaignId),
            where('field.id', '==', fieldId)
        );

        const unsubscribe = onSnapshot(harvestSessionsQuery,
            (snapshot) => {
                const harvestSessionData = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...(doc.data() as Omit<HarvestSession, 'id'>)
                }));

                setHarvestSessions(harvestSessionData);
                setLoading(false);
            },
            (error) => {
                console.error("Error en la suscripción a las sesiones de cosecha:", error);
                setError(error.message);
                setLoading(false);
            }
        );
        return () => {
            unsubscribe();
        };


    }, [currentUser, authLoading, campaignId, fieldId]);

    return { harvestSessions, loading, error };
};