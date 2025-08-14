// src/hooks/silobags/useSiloBags.tsx
import { useState, useEffect } from 'react';
import useAuth from '../../context/auth/AuthContext';
import type { Silobag } from '../../types';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../../firebase/firebase';

export const useSiloBags = () => {
    const { currentUser, loading: authLoading } = useAuth();
    const [siloBags, setSiloBags] = useState<Silobag[]>([]);
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

        const siloBagsQuery = query(
            collection(db, 'silo_bags'),
            where('organization_id', '==', currentUser.organizationId)
        );

        const unsubscribe = onSnapshot(siloBagsQuery,
            (snapshot) => {
                const siloBagsData = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...(doc.data() as Omit<Silobag, 'id'>)
                }));

                setSiloBags(siloBagsData);
                setLoading(false);
            },
            (err) => {
                console.error("Error en la suscripción a silos:", err);
                setError(err.message);
                setLoading(false);
            }
        );

        return () => unsubscribe();

    }, [currentUser, authLoading]);

    return { siloBags, loading, error };
};