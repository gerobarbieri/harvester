
// src/hooks/silobags/useSiloBagMovements.ts (Versión con Paginado)
import { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, startAfter, getDocs, type DocumentData, QueryDocumentSnapshot, where } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import useAuth from '../../context/auth/AuthContext';

const PAGE_SIZE = 15; // Cantidad de movimientos a cargar por página

export const useSiloBagMovements = (siloBagId?: string) => {
    const { currentUser } = useAuth();
    const [movements, setMovements] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
    const [hasMore, setHasMore] = useState(true);

    const fetchMovements = async (siloId: string) => {
        setLoading(true);
        try {
            const collectionRef = collection(db, `silo_bags/${siloId}/movements`);
            const q = query(collectionRef, orderBy("date", "desc"), where('organization_id', '==', currentUser.organizationId), limit(PAGE_SIZE));
            const docSnap = await getDocs(q);

            const movementsData: any[] = [];
            docSnap.forEach(doc => movementsData.push({ id: doc.id, ...doc.data() }));

            setMovements(movementsData);
            setLastVisible(docSnap.docs[docSnap.docs.length - 1]);
            setHasMore(docSnap.docs.length === PAGE_SIZE);
        } catch (err: any) {
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (siloBagId) {
            fetchMovements(siloBagId);
        } else {
            setMovements([]);
            setLoading(false);
        }
    }, [siloBagId]);

    const fetchMore = async () => {
        if (!siloBagId || !lastVisible || !hasMore) return;
        setLoadingMore(true);
        try {
            const collectionRef = collection(db, `silo_bags/${siloBagId}/movements`);
            const q = query(collectionRef, orderBy("date", "desc"), where('organization_id', '==', currentUser.organizationId), startAfter(lastVisible), limit(PAGE_SIZE));
            const docSnap = await getDocs(q);

            const newMovements: any[] = [];
            docSnap.forEach(doc => newMovements.push({ id: doc.id, ...doc.data() }));

            setMovements(prev => [...prev, ...newMovements]);
            setLastVisible(docSnap.docs[docSnap.docs.length - 1]);
            setHasMore(docSnap.docs.length === PAGE_SIZE);
        } catch (err: any) {
            setError(err);
        } finally {
            setLoadingMore(false);
        }
    };

    return { movements, loading, loadingMore, error, fetchMore, hasMore };
};