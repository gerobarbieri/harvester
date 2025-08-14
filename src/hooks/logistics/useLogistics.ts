// src/hooks/logistics/useLogistics.tsx
import { useState, useEffect } from 'react';
import useAuth from '../../context/auth/AuthContext';
import type { Logistics } from '../../types';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../../firebase/firebase';

export const useLogistics = () => {
    const { currentUser, loading: authLoading } = useAuth();
    const [logistics, setLogistics] = useState<Logistics[]>([]);
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

        const logisticsQuery = query(
            collection(db, 'logistics'),
            where('organization_id', '==', currentUser.organizationId)
        );

        const unsubscribe = onSnapshot(logisticsQuery,
            (snapshot) => {
                const logisticsData = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...(doc.data() as Omit<Logistics, 'id'>)
                }));

                setLogistics(logisticsData);
                setLoading(false);
            },
            (err) => {
                console.error("Error en la suscripción a logística:", err);
                setError(err.message);
                setLoading(false);
            }
        );

        return () => unsubscribe();

    }, [currentUser, authLoading]);

    return { logistics, loading, error };
};