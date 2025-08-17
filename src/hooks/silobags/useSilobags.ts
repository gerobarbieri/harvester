// src/hooks/silobags/useSilobags.ts
import { useQuery } from '@tanstack/react-query';
import useAuth from '../../context/auth/AuthContext';
import type { Silobag } from '../../types';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../../firebase/firebase';

// La función que obtiene los datos
const getSiloBags = (organizationId: string): Promise<Silobag[]> => {
    return new Promise((resolve, reject) => {
        const siloBagsQuery = query(
            collection(db, 'silo_bags'),
            where('organization_id', '==', organizationId)
        );

        // onSnapshot nos da el poder del tiempo real
        const unsubscribe = onSnapshot(siloBagsQuery,
            (snapshot) => {
                const siloBagsData = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                } as Silobag));
                resolve(siloBagsData); // Resolvemos la promesa con los datos
            },
            (err) => {
                console.error("Error en la suscripción a silos:", err);
                reject(err);
            }
        );

        // NOTA: TanStack Query no maneja la desuscripción. 
        // Para una app a gran escala, se necesitaría un gestor de suscripciones.
        // Para este caso, la suscripción vivirá mientras la app esté abierta.
    });
};

export const useSiloBags = () => {
    const { currentUser } = useAuth();
    const organizationId = currentUser?.organizationId;

    return useQuery<Silobag[], Error>({
        // La queryKey es la "etiqueta" única para estos datos
        queryKey: ['siloBags', organizationId],
        // queryFn es la función que obtiene los datos
        queryFn: () => getSiloBags(organizationId!),
        // Habilitamos la query solo si tenemos el ID de la organización
        enabled: !!organizationId,
    });
};