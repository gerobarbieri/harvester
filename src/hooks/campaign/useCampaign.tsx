import { useState, useEffect } from 'react';
import useAuth from '../../context/auth/AuthContext';
import type { Campaign } from '../../types';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/firebase';

export const useCampaign = (campaignId: string) => {
    const { currentUser, loading: authLoading } = useAuth();
    const [campaign, setCampaign] = useState<Campaign | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    useEffect(() => {
        if (authLoading || !currentUser || !campaignId) {
            if (!authLoading) {
                setLoading(false);
            }
            return;
        }
        const docRef = doc(db, 'campaigns', campaignId);

        const unsubscribe = onSnapshot(docRef,
            (docSnap) => {
                if (docSnap.exists()) {
                    const harvestSessionData = { id: docSnap.id, ...docSnap.data() };
                    setCampaign(harvestSessionData as Campaign);
                } else {
                    console.error("La campaña no existe.");
                    setError("La campaña no fue encontrada.");
                }
                setLoading(false);
            },
            (error) => {
                // Manejamos errores de permisos o de red.
                console.error("Error en la suscripción a la campaña:", error);
                setError(error.message);
                setLoading(false);
            }
        );

        // 3. Devolvemos la función de limpieza.
        return () => {
            unsubscribe();
        };


    }, [currentUser, authLoading, campaignId]);

    // 3. El hook devuelve el estado.
    return { campaign, loading, error };
};