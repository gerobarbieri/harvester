// src/hooks/useHarvestSessionsByCampaign.ts

import { useState, useEffect } from 'react';
import type { HarvestSession } from '../../types';
// Agregamos 'onSnapshot' al import
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import useAuth from '../../context/auth/AuthContext';

export const useHarvestSessionsByCampaign = (campaignId: string) => {
    const { currentUser, loading: authLoading } = useAuth();
    const [sessions, setSessions] = useState<HarvestSession[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null); // Añadido para consistencia

    useEffect(() => {
        if (authLoading || !currentUser || !campaignId) {
            if (!authLoading) {
                setLoading(false);
            }
            return;
        }

        setLoading(true);
        setError(null);

        const q = query(
            collection(db, 'harvest_sessions'),
            where('organization_id', '==', currentUser.organizationId),
            where('campaign.id', '==', campaignId)
        );

        // 2. Nos suscribimos a los cambios con onSnapshot
        const unsubscribe = onSnapshot(q,
            (snapshot) => {
                const sessionsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as HarvestSession));
                setSessions(sessionsData);
                setLoading(false);
            },
            (err) => {
                console.error("Error en la suscripción a sesiones de cosecha:", err);
                setError(err.message);
                setLoading(false);
            }
        );

        // 3. Devolvemos la función de limpieza
        return () => unsubscribe();

    }, [campaignId, currentUser, authLoading]);

    return { sessions, loading, error }; // Devolvemos el error también
};