// src/hooks/silobags/useSiloBags.ts
import useAuth from '../../context/auth/AuthContext';
import type { Silobag } from '../../types';
import { collection, query, where } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import { useFirestoreQuery } from '../firestore/useFirestoreQuery';

export const useSiloBags = () => {
    const { currentUser } = useAuth();
    const organizationId = currentUser?.organizationId;

    const siloBagsQuery = query(
        collection(db, 'silo_bags'),
        where('organization_id', '==', organizationId)
    );

    return useFirestoreQuery<Silobag>(
        ['siloBags', organizationId],
        siloBagsQuery,
        { enabled: !!organizationId }
    );
};