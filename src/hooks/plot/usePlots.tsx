// src/hooks/usePlots.ts

import { useState, useEffect } from 'react';
import useAuth from '../../context/auth/AuthContext';
import type { Plot } from '../../types';
// Agregamos 'onSnapshot' al import
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../../firebase/firebase';

export const usePlots = (fieldId: string) => {
    const { currentUser, loading: authLoading } = useAuth();
    const [plots, setPlots] = useState<Plot[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (authLoading || !currentUser || !fieldId) {
            if (!authLoading) {
                setLoading(false);
            }
            return;
        }

        setLoading(true);
        setError(null);

        const plotsQuery = query(
            collection(db, 'plots'),
            where('organization_id', '==', currentUser.organizationId),
            where('field.id', '==', fieldId)
        );

        const unsubscribe = onSnapshot(plotsQuery,
            (snapshot) => {
                const plotsData = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...(doc.data() as Omit<Plot, 'id'>)
                }));

                setPlots(plotsData);
                setLoading(false);
            },
            (err) => {
                console.error("Error en la suscripción a lotes:", err);
                setError(err.message);
                setLoading(false);
            }
        );

        return () => unsubscribe();

    }, [currentUser, authLoading, fieldId]);

    return { plots, loading, error };
};