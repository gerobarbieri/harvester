// src/hooks/silobags/useSiloBag.ts
import { doc } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import type { Silobag } from '../../types';
import { useFirestoreDocumentQuery } from '../firestore/useFirestoreDocumentQuery';

export const useSiloBag = (siloBagId?: string) => {
    // 2. Prepara la referencia al documento
    const docRef = doc(db, 'silo_bags', siloBagId);

    const { data: siloBag, isLoading: loading, error } = useFirestoreDocumentQuery<Silobag>(
        ['siloBag', siloBagId],
        docRef,
        { enabled: !!siloBagId }
    );

    return { siloBag, loading, error };
};