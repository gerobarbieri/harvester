// src/hooks/useDestinations.ts

import { useState, useEffect } from 'react';
import useAuth from '../../context/auth/AuthContext';
import type { Destination } from '../../types';
// Agregamos 'onSnapshot' al import
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../../firebase/firebase';

export const useDestinations = () => {
    const { currentUser, loading: authLoading } = useAuth();
    const [destinations, setDestinations] = useState<Destination[]>([]);
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

        const destinationsQuery = query(
            collection(db, 'destinations'),
            where('organization_id', '==', currentUser.organizationId)
        );

        const unsubscribe = onSnapshot(destinationsQuery,
            (snapshot) => {
                const destinationsData = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...(doc.data() as Omit<Destination, 'id'>)
                }));

                setDestinations(destinationsData);
                setLoading(false);
            },
            (err) => {
                console.error("Error en la suscripción a destinos:", err);
                setError(err.message);
                setLoading(false);
            }
        );

        return () => unsubscribe();

    }, [currentUser, authLoading]);

    return { destinations, loading, error };
};