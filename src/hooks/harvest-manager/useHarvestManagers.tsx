// src/hooks/useHarvestManagers.ts

import { useState, useEffect } from 'react';
import useAuth from '../../context/auth/AuthContext';
import type { HarvestManager } from '../../types'; // Asumiendo que este tipo coincide con la estructura de un User
// Agregamos 'onSnapshot' al import
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../../firebase/firebase';

export const useHarvestManagers = () => {
    const { currentUser, loading: authLoading } = useAuth();
    const [harvestManagers, setHarvestManagers] = useState<HarvestManager[]>([]);
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

        // 1. La consulta para traer los usuarios con rol de manager/admin es la misma.
        const harvestManagersQuery = query(
            collection(db, 'users'),
            where('organization_id', '==', currentUser.organizationId),
            where('role', 'in', ['manager', 'admin'])
        );

        // 2. Nos suscribimos a los cambios con onSnapshot
        const unsubscribe = onSnapshot(harvestManagersQuery,
            (snapshot) => {
                const harvestManagerData = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...(doc.data() as Omit<HarvestManager, 'id'>)
                }));

                setHarvestManagers(harvestManagerData);
                setLoading(false);
            },
            (err) => {
                console.error("Error en la suscripción a los responsables de cosecha:", err);
                setError(err.message);
                setLoading(false);
            }
        );

        // 3. Devolvemos la función de limpieza
        return () => unsubscribe();

    }, [currentUser, authLoading]);

    return { harvestManagers, loading, error };
};