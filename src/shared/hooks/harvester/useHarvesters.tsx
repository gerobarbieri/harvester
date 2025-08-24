import { useState, useEffect } from 'react';
import useAuth from '../../context/auth/AuthContext';
import type { Harvester } from '../../types';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../../firebase/firebase';

export const useHarvesters = () => {
    const { currentUser, loading: authLoading } = useAuth();
    const [harvesters, setHarvesters] = useState<Harvester[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (authLoading || !currentUser) return;
        const harvestersQuery = query(
            collection(db, 'harvesters'),
            where('organization_id', '==', currentUser.organizationId)
        );

        const unsubscribe = onSnapshot(harvestersQuery,
            (snapshot) => {
                const harvestersData = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...(doc.data() as Omit<Harvester, 'id'>)
                }));

                setHarvesters(harvestersData);
                setLoading(false);
            },
            (err) => {
                console.error("Error en la suscripción a cosecheros:", err);
                setError(err.message);
                setLoading(false);
            }
        );

        return () => unsubscribe();


    }, [currentUser, authLoading]);

    // 3. El hook devuelve el estado.
    return { harvesters, loading, error };
};