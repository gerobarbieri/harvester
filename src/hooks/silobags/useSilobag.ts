// src/hooks/silobags/useSiloBag.ts
import { doc, onSnapshot } from 'firebase/firestore';
import { useState, useEffect } from 'react';
import { db } from '../../firebase/firebase';
import type { Silobag } from '../../types';

export const useSiloBag = (siloBagId?: string) => {
    const [siloBag, setSiloBag] = useState<Silobag | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        // Si no hay un ID, no hacemos nada.
        if (!siloBagId) {
            setLoading(false);
            return;
        }

        setLoading(true);

        const docRef = doc(db, 'silo_bags', siloBagId);

        // onSnapshot establece el "escucha" en tiempo real y devuelve una función para desuscribirse
        const unsubscribe = onSnapshot(docRef,
            (docSnap) => {
                if (docSnap.exists()) {
                    // Combinamos el ID del documento con sus datos
                    setSiloBag({ id: docSnap.id, ...docSnap.data() } as Silobag );
                } else {
                    setError(new Error("El silobolsa no fue encontrado."));
                    setSiloBag(null);
                }
                setLoading(false);
            },
            (err) => {
                console.error("Error en useSiloBag:", err);
                setError(err);
                setLoading(false);
            }
        );

        // La función de limpieza de useEffect se ejecuta cuando el componente se desmonta.
        // Es CRUCIAL desuscribirse para evitar fugas de memoria.
        return () => {
            unsubscribe();
        };

    }, [siloBagId]); // El efecto se vuelve a ejecutar solo si el ID del silo cambia

    return { siloBag, loading, error };
};