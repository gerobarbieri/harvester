import { useState, useEffect } from 'react';
import type { HarvestSession } from '../../types';
import { collection, query, where, onSnapshot, getDocsFromCache, QueryConstraint } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import useAuth from '../../context/auth/AuthContext';

// 1. Definimos la interfaz para los filtros que aceptará el hook
interface SessionFilters {
    campaign: string
    field: string;
    crop: string;
}

// 2. El hook ahora acepta un segundo argumento: los filtros
export const useHarvestSessionsByCampaign = (filters: SessionFilters) => {
    const { currentUser, loading: authLoading } = useAuth();
    const [sessions, setSessions] = useState<HarvestSession[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (authLoading || !currentUser || !filters.campaign) {
            if (!authLoading) setLoading(false);
            return;
        }

        // 3. Construimos la consulta dinámicamente
        const constraints: QueryConstraint[] = [
            where('organization_id', '==', currentUser.organizationId),
            where('campaign.id', '==', filters.campaign)
        ];

        if (filters.field && filters.field !== 'all') {
            constraints.push(where('field.id', '==', filters.field));
        }
        if (filters.crop && filters.crop !== 'all') {
            constraints.push(where('crop.id', '==', filters.crop));
        }

        const q = query(collection(db, 'harvest_sessions'), ...constraints);

        const unsubscribe = onSnapshot(q,
            (snapshot) => {
                setSessions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as HarvestSession)));
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
        // 4. Añadimos los filtros al array de dependencias
    }, [filters.campaign, currentUser, authLoading, filters.field, filters.crop]);

    return { sessions, loading, error };
};