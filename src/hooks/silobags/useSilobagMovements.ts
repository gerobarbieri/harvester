import { useState, useEffect } from 'react';
import { collection, query, orderBy, where, onSnapshot, limit } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import useAuth from '../../context/auth/AuthContext';
import type { SilobagMovement } from '../../types';

// Escuchamos los 50 movimientos más recientes. Es un buen balance.
const REALTIME_LIMIT = 50;

export const useSiloBagMovements = (siloBagId?: string) => {
    const { currentUser, loading: authLoading } = useAuth();
    const [movements, setMovements] = useState<SilobagMovement[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (authLoading || !currentUser || !siloBagId) {
            if (!authLoading) setLoading(false);
            setMovements([]);
            return;
        }

        setLoading(true);
        setError(null);

        const collectionRef = collection(db, `silo_bags/${siloBagId}/movements`);
        const q = query(
            collectionRef,
            where('organization_id', '==', currentUser.organizationId),
            orderBy("date", "desc"),
            limit(REALTIME_LIMIT) // Limitamos la escucha en tiempo real
        );

        const unsubscribe = onSnapshot(q,
            (snapshot) => {
                const movementsData = snapshot.docs.map(doc => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        ...data
                    } as SilobagMovement;
                });

                setMovements(movementsData);
                setLoading(false);
            },
            (err) => {
                console.error("Error en la suscripción a movimientos:", err);
                setError(err);
                setLoading(false);
            }
        );

        return () => unsubscribe();

    }, [siloBagId, currentUser, authLoading]);

    return { movements, loading, error };
};