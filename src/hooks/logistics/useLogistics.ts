import { useState, useEffect } from 'react';
import useAuth from '../../context/auth/AuthContext';
import type { Logistics } from '../../types';
import { collection, onSnapshot, query, where, orderBy, Timestamp, QueryConstraint } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import { startOfDay, endOfDay } from 'date-fns';

/**
 * Hook para obtener las órdenes de logística, ahora con capacidad de filtrar por rango de fechas.
 * @param dateRange - Un objeto con propiedades 'from' y 'to' (objetos Date).
 */
export const useLogistics = (dateRange: { from: Date | null, to: Date | null }) => {
    const { currentUser, loading: authLoading } = useAuth();
    const [logistics, setLogistics] = useState<Logistics[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (authLoading || !currentUser) {
            if (!authLoading) setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        // 1. Empezamos con la consulta base
        let constraints: QueryConstraint[] = [
            where('organization_id', '==', currentUser.organizationId)
        ];

        // 2. Añadimos los filtros de fecha de forma dinámica
        if (dateRange.from) {
            constraints.push(where('date', '>=', Timestamp.fromDate(startOfDay(dateRange.from))));
        }
        if (dateRange.to) {
            constraints.push(where('date', '<=', Timestamp.fromDate(endOfDay(dateRange.to))));
        }

        // Añadimos el ordenamiento al final
        constraints.push(orderBy('date', 'desc'));

        const logisticsQuery = query(collection(db, 'logistics'), ...constraints);

        const unsubscribe = onSnapshot(logisticsQuery,
            (snapshot) => {
                const logisticsData = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...(doc.data() as Omit<Logistics, 'id'>)
                }));
                setLogistics(logisticsData);
                setLoading(false);
            },
            (err) => {
                console.error("Error en la suscripción a logística:", err);
                setError(err.message);
                setLoading(false);
            }
        );

        return () => unsubscribe();

    }, [currentUser, authLoading, dateRange.from, dateRange.to]); // Dependencias correctas

    return { logistics, loading, error };
};