import { useState, useEffect } from 'react';
import type { HarvestSession } from '../../types';
import { collection, query, where, onSnapshot, QueryConstraint } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import useAuth from '../../context/auth/AuthContext';

export const useHarvestSessionsByCampaign = (campaignId: string) => {
    const { currentUser, loading: authLoading } = useAuth();
    const [sessions, setSessions] = useState<HarvestSession[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (authLoading || !currentUser || !campaignId) {
            if (!authLoading) setLoading(false);
            return;
        }

        // 3. Construimos la consulta dinámicamente
        const constraints: QueryConstraint[] = [
            where('organization_id', '==', currentUser.organizationId),
            where('campaign.id', '==', campaignId)
        ];

        const q = query(collection(db, 'harvest_sessions'), ...constraints);

        const unsubscribe = onSnapshot(q,
            (snapshot) => {
                setSessions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as HarvestSession)));
                if (loading) setLoading(false);
            },
            (err) => {
                setError(err.message);
                setLoading(false);
            }
        );
        return () => {
            unsubscribe();
        };
        // 4. Añadimos los filtros al array de dependencias
    }, [campaignId, currentUser, authLoading]);

    return { sessions, loading, error };
};