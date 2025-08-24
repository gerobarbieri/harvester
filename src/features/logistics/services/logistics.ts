import { collection, doc, addDoc, updateDoc, Timestamp } from "firebase/firestore";
import { db } from "../../../shared/firebase/firebase";
import type { Logistics } from "../../../shared/types";

export const addLogisticsOrder = (data: Partial<Logistics>) => {
    const logisticsCollection = collection(db, 'logistics');
    return addDoc(logisticsCollection, {
        ...data,
        status: 'in-route-to-field',
        created_at: Timestamp.now()
    });
};

export const updateLogisticsStatus = (id: string, newStatus: string) => {
    const logisticsDoc = doc(db, 'logistics', id);
    return updateDoc(logisticsDoc, {
        status: newStatus,
        updated_at: Timestamp.now()
    });
};