import { useState, useEffect } from 'react';
import useAuth from '../../context/auth/AuthContext';
import type { HarvestSessionRegister } from '../../types';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../../firebase/firebase';

export const useHarvestSessionRegisters = (harvestSessionId: string) => {
    const { currentUser, loading: authLoading } = useAuth();
    const [registers, setRegisters] = useState<HarvestSessionRegister[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (authLoading || !currentUser || !harvestSessionId) {
            if (!authLoading) {
                setLoading(false);
            }
            return;
        }
        const harvestSessionRegistersQuery = query(
            collection(db, `harvest_sessions/${harvestSessionId}/registers`),
            where('organization_id', '==', currentUser.organizationId),

        );

        const unsubscribe = onSnapshot(harvestSessionRegistersQuery,
            (snapshot) => {
                const harvestSessionRegistersData = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...(doc.data() as Omit<HarvestSessionRegister, 'id'>)
                }));

                setRegisters(harvestSessionRegistersData);
                setLoading(false);
            },
            (error) => {

                console.error("Error en la suscripción a registros de session de cosecha:", error);
                setError(error.message);
                setLoading(false);
            }
        );

        return () => {
            unsubscribe();
        };


    }, [currentUser, authLoading, harvestSessionId]);

    // 3. El hook devuelve el estado.
    return { registers, loading, error };
};