// src/hooks/harvest-session/useActiveHarvestSessions.tsx
import { useState, useEffect, useMemo } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import useAuth from '../../context/auth/AuthContext';
import type { HarvestSession } from '../../types';

export const useActiveHarvestSessions = (campaignId: string, selectedFieldId?: string) => {
    const { currentUser, loading: authLoading } = useAuth();
    const [sessions, setSessions] = useState<HarvestSession[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Memoizar la query key para evitar re-renders innecesarios
    const queryKey = useMemo(() =>
        `${currentUser?.organizationId}-${campaignId}-${selectedFieldId}`,
        [currentUser?.organizationId, campaignId, selectedFieldId]
    );

    useEffect(() => {
        if (authLoading || !currentUser || !campaignId) {
            if (!authLoading) setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        // Query base: solo sessions activas de la campaña y organización
        let baseQuery = query(
            collection(db, 'harvest_sessions'),
            where('organization_id', '==', currentUser.organizationId),
            where('campaign.id', '==', campaignId),
            where('status', 'in', ['pending', 'in-progress']) // Solo activas
        );

        // Si se selecciona un campo específico, agregar filtro
        if (selectedFieldId && selectedFieldId !== 'all') {
            baseQuery = query(
                collection(db, 'harvest_sessions'),
                where('organization_id', '==', currentUser.organizationId),
                where('campaign.id', '==', campaignId),
                where('field.id', '==', selectedFieldId), // Filtro de campo
                where('status', 'in', ['pending', 'in-progress'])
            );
        }

        const unsubscribe = onSnapshot(
            baseQuery,
            (snapshot) => {
                const sessionsData = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                } as HarvestSession));

                setSessions(sessionsData);
                setLoading(false);
            },
            (err) => {
                console.error("Error en active harvest sessions:", err);
                setError(err.message);
                setLoading(false);
            }
        );

        return () => unsubscribe();

    }, [currentUser, authLoading, queryKey]); // Usar queryKey en deps

    return {
        sessions,
        loading,
        error
    };
};