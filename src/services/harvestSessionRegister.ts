import { addDoc, collection, deleteDoc, doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";
import type { HarvestSessionRegister } from "../types";

export const deleteRegister = (registerId: string, sessionId: string) => {
    if (!registerId) return;

    const registerRef = doc(db, `harvest_sessions/${sessionId}/registers`, registerId);

    return deleteDoc(registerRef);
};

export const addRegister = (recordData: Partial<HarvestSessionRegister>, sessionId: string) => {
    const finalRecord = {
        ...recordData,
        created_at: new Date(),
        created_at_server: serverTimestamp(),
    };

    return addDoc(collection(db, `harvest_sessions/${sessionId}/registers`), finalRecord);
}

export const updateRegister = (registerId: string, sessionId: string, updatedData: Partial<HarvestSessionRegister>) => {
    if (!registerId || !sessionId || !updatedData) return;

    const registerRef = doc(db, `harvest_sessions/${sessionId}/registers`, registerId);

    return updateDoc(registerRef, {
        ...updatedData,
        updated_at: serverTimestamp()
    });
};