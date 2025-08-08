// src/hooks/useCrops.ts

import { useState, useEffect } from 'react';
import useAuth from '../../context/auth/AuthContext';
import type { Crop } from '../../types';
// Agregamos 'onSnapshot' al import
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../../firebase/firebase';

export const useCrops = () => {
    const { currentUser, loading: authLoading } = useAuth();
    const [crops, setCrops] = useState<Crop[]>([]);
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

        // 1. La consulta es la misma: trae todos los cultivos de la organización
        const cropsQuery = query(
            collection(db, 'crops'),
            where('organization_id', '==', currentUser.organizationId)
        );

        // 2. Nos suscribimos a los cambios con onSnapshot
        const unsubscribe = onSnapshot(cropsQuery,
            (snapshot) => {
                const cropData = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...(doc.data() as Omit<Crop, 'id'>)
                }));

                setCrops(cropData);
                setLoading(false);
            },
            (err) => {
                console.error("Error en la suscripción a cultivos:", err);
                setError(err.message);
                setLoading(false);
            }
        );

        // 3. Devolvemos la función de limpieza
        return () => unsubscribe();

    }, [currentUser, authLoading]);

    return { crops, loading, error };
};