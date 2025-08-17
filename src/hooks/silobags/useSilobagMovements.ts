import { useInfiniteQuery } from '@tanstack/react-query';
import { collection, query, orderBy, limit, startAfter, getDocs, where, type QueryDocumentSnapshot, type DocumentData } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import useAuth from '../../context/auth/AuthContext';
import type { SilobagMovement } from '../../types';

const PAGE_SIZE = 15;

const fetchMovementsPage = async ({ pageParam, queryKey }: { pageParam: QueryDocumentSnapshot<DocumentData> | null, queryKey: any[] }) => {
    // 1. Destructuramos los IDs directamente de la queryKey
    const [_key, siloBagId, organizationId] = queryKey;

    const collectionRef = collection(db, `silo_bags/${siloBagId}/movements`);

    let q = query(
        collectionRef,
        where('organization_id', '==', organizationId),
        orderBy("date", "desc"),
        limit(PAGE_SIZE)
    );

    if (pageParam) {
        q = query(q, startAfter(pageParam));
    }

    const docSnap = await getDocs(q);

    const movementsData: SilobagMovement[] = docSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as SilobagMovement));

    return {
        data: movementsData,
        nextCursor: docSnap.docs[docSnap.docs.length - 1],
    };
};

export const useSiloBagMovements = (siloBagId?: string) => {
    const { currentUser } = useAuth();
    const organizationId = currentUser?.organizationId;

    const {
        data,
        error,
        fetchNextPage,
        hasNextPage,
        isLoading,
        isFetchingNextPage
    } = useInfiniteQuery({

        queryKey: ['siloBagMovements', siloBagId, organizationId],

        queryFn: fetchMovementsPage,

        getNextPageParam: (lastPage) => {
            return lastPage.nextCursor || undefined;
        },
        initialPageParam: null,

        enabled: !!siloBagId && !!organizationId,
    });

    const movements = data?.pages?.flatMap(page => page.data) ?? [];

    return {
        movements,
        loading: isLoading,
        loadingMore: isFetchingNextPage,
        error: error as Error | null,
        fetchMore: fetchNextPage,
        hasMore: !!hasNextPage,
    };
};