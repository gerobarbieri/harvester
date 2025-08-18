import { collection, doc, addDoc, updateDoc, serverTimestamp, Timestamp } from "firebase/firestore";
import { db } from "../firebase/firebase";
import type { Logistics } from "../types"; // Asegúrate de que el tipo 'Logistics' exista en tus types

/**
 * Crea una nueva orden de logística en Firestore.
 */
export const addLogisticsOrder = (data: Partial<Logistics>) => {
    const logisticsCollection = collection(db, 'logistics');
    return addDoc(logisticsCollection, {
        ...data,
        status: 'requested',
        created_at: Timestamp.now()
    });
};

/**
 * Actualiza el estado de una orden de logística existente.
 */
export const updateLogisticsStatus = (id: string, newStatus: string) => {
    const logisticsDoc = doc(db, 'logistics', id);
    return updateDoc(logisticsDoc, {
        status: newStatus,
        updated_at: serverTimestamp()
    });
};