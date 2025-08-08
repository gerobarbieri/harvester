// src/hooks/useField.ts

import { useState, useEffect } from 'react';
import useAuth from '../../context/auth/AuthContext';
import type { Field } from '../../types';
// Agregamos 'onSnapshot' y 'doc' al import
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/firebase';

export const useField = (fieldId: string) => {
    const { currentUser, loading: authLoading } = useAuth();
    const [field, setField] = useState<Field | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Guarda de seguridad para evitar ejecuciones innecesarias
        if (authLoading || !currentUser || !fieldId) {
            if (!authLoading) {
                setLoading(false);
            }
            return;
        }

        setLoading(true);
        setError(null);

        const docRef = doc(db, 'fields', fieldId);

        const unsubscribe = onSnapshot(docRef,
            (docSnap) => {
                if (docSnap.exists()) {
                    const fieldData = { id: docSnap.id, ...docSnap.data() };
                    setField(fieldData as Field);
                } else {
                    setError("El campo no existe.");
                    setField(null);
                }
                setLoading(false);
            },
            (err) => {
                console.error("Error en la suscripción al campo:", err);
                setError(err.message);
                setLoading(false);
            }
        );

        // 3. Devolvemos la función de limpieza
        return () => unsubscribe();

    }, [currentUser, authLoading, fieldId]);

    return { field, loading, error };
};