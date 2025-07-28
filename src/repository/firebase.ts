import { initializeApp } from 'firebase/app';
import { firebaseConfig } from '../../config';
import {
    initializeFirestore,
    CACHE_SIZE_UNLIMITED,
    persistentLocalCache,
    persistentMultipleTabManager,
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

export const app = initializeApp(firebaseConfig);
export const db = initializeFirestore(app, {
    localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager(),
        cacheSizeBytes: CACHE_SIZE_UNLIMITED
    })
});
export const auth = getAuth(app);

