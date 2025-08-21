import { useState, useEffect } from 'react';
import useAuth from '../../context/auth/AuthContext';
import type { Campaign } from '../../types';
import { doc, onSnapshot, getDocFromCache } from 'firebase/firestore';
import { db } from '../../firebase/firebase';

export const useCampaign = (campaignId: string) => {
    const { currentUser, loading: authLoading } = useAuth();
    const [campaign, setCampaign] = useState<Campaign | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (authLoading || !currentUser || !campaignId) {
            return;
        }

        const docRef = doc(db, 'campaigns', campaignId);

        const unsubscribe = onSnapshot(docRef,
            (docSnap) => {
                if (docSnap.exists()) {
                    setCampaign({ id: docSnap.id, ...docSnap.data() } as Campaign);
                    setLoading(false);
                } else {
                    setError("La campaña no fue encontrada.");
                    setLoading(false);
                }
            }
        );

        return () => {
            unsubscribe();
        };

    }, [currentUser, authLoading, campaignId]);

    return { campaign, loading, error };
};