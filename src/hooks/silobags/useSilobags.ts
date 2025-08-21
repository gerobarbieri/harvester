import { useState, useEffect } from 'react';
import useAuth from '../../context/auth/AuthContext';
import type { Silobag } from '../../types';
import { collection, onSnapshot, query, where, getDocsFromCache, QueryConstraint } from 'firebase/firestore';
import { db } from '../../firebase/firebase';

interface SiloBagFilters {
    fieldId: string;
    cropId: string;
    status: string;
}

export const useSiloBags = (filters: SiloBagFilters) => {
    const { currentUser, loading: authLoading } = useAuth();
    const [siloBags, setSiloBags] = useState<Silobag[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (authLoading || !currentUser) {
            if (!authLoading) setLoading(false);
            return;
        }

        const constraints: QueryConstraint[] = [
            where('organization_id', '==', currentUser.organizationId)
        ];

        if (filters.fieldId && filters.fieldId !== 'todos') {
            constraints.push(where('field.id', '==', filters.fieldId));
        }
        if (filters.cropId && filters.cropId !== 'todos') {
            constraints.push(where('crop.id', '==', filters.cropId));
        }
        if (filters.status && filters.status !== 'todos') {
            constraints.push(where('status', '==', filters.status));
        }

        const siloBagsQuery = query(collection(db, 'silo_bags'), ...constraints);

        const unsubscribe = onSnapshot(siloBagsQuery,
            (snapshot) => {
                setSiloBags(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as Silobag })));
                if (loading) setLoading(false);
            },
            (err) => {
                setError(err.message);
                setLoading(false);
            }
        );
        return () => {
            unsubscribe();
        };

    }, [currentUser, authLoading, filters.fieldId, filters.cropId]);

    return { siloBags, loading, error };
};