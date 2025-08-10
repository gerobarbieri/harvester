// src/hooks/useCampaigns.ts

import { useState, useEffect } from 'react';
import useAuth from '../../context/auth/AuthContext';
import type { Campaign } from '../../types';
// Agregamos 'onSnapshot' al import
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../../firebase/firebase';

export const useActiveCampaign = () => {
    const { currentUser, loading: authLoading } = useAuth();
    const [campaign, setCampaign] = useState<Campaign>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (authLoading || !currentUser) {
            if (!authLoading) {
                setLoading(false);
            }
            return;
        }

        setLoading(true);
        setError(null);

        const campaignsQuery = query(
            collection(db, 'campaigns'),
            where('organization_id', '==', currentUser.organizationId),
            where('active', '==', true)
        );

        const unsubscribe = onSnapshot(campaignsQuery,
            (snapshot) => {
                const campaignsData = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...(doc.data() as Omit<Campaign, 'id'>)
                }));

                setCampaign(campaignsData[0]);
                setLoading(false);
            },
            (err) => {
                console.error("Error en la suscripción a campañas:", err);
                setError(err.message);
                setLoading(false);
            }
        );

        return () => {
            unsubscribe();
        };

    }, [currentUser, authLoading]);

    return { campaign, loading, error };
};