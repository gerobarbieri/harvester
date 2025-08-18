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
                const serverSiloBags = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...(doc.data() as Omit<Silobag, 'id'>)
                }));

                setSiloBags(prevSiloBags => {
                    const serverIds = new Set(serverSiloBags.map(s => s.id));
                    const optimisticSilos = prevSiloBags.filter(
                        s => s.id.startsWith('optimistic-') && !serverIds.has(s.id)
                    );
                    return [...serverSiloBags, ...optimisticSilos];
                });

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

    const addOptimisticSiloBag = (siloBag: Silobag) => {
        setSiloBags(prev => [siloBag, ...prev]);
    };

    const removeOptimisticSiloBag = (optimisticId: string) => {
        setSiloBags(prev => prev.filter(s => s.id !== optimisticId));
    };

    const updateOptimisticSiloBag = (siloBagId: string, updates: Partial<Silobag>) => {
        setSiloBags(prev =>
            prev.map(silo =>
                silo.id === siloBagId ? { ...silo, ...updates } : silo
            )
        );
    };

    return { siloBags, loading, error, addOptimisticSiloBag, removeOptimisticSiloBag, updateOptimisticSiloBag };
};