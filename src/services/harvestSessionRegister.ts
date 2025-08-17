import { addDoc, collection, deleteDoc, doc, serverTimestamp, Timestamp, updateDoc, writeBatch } from "firebase/firestore";
import { db } from "../firebase/firebase";
import type { Destination, HarvestSession, HarvestSessionRegister, Silobag } from "../types";

export const deleteRegister = (registerId: string, sessionId: string) => {
    if (!registerId) return;

    const registerRef = doc(db, `harvest_sessions/${sessionId}/registers`, registerId);

    return deleteDoc(registerRef);
};

export const addRegister = (data: any, harvestSession: HarvestSession, silobag?: Silobag, destination?: Destination) => {
    const batch = writeBatch(db);
    let siloBagForRegister: { id: string, name: string, location: string };
    let silobagData;

    const isNewSiloBag = data.type === 'silo_bag' && !data.siloBagId;

    if (isNewSiloBag) {
        const newSiloBagRef = doc(collection(db, 'silo_bags'));
        silobagData = {
            id: newSiloBagRef.id,
            name: data.newSiloBagName,
            crop: {
                id: harvestSession.crop.id,
                name: harvestSession.crop.name
            },
            field: {
                id: harvestSession.field.id,
                name: harvestSession.field.name
            },
            initial_kg: parseFloat(data.weight_kg),
            location: data.location,
            organization_id: data.organization_id,
            status: 'active',
            created_at: Timestamp.fromDate(new Date())
        };

        batch.set(newSiloBagRef, silobagData);
        siloBagForRegister = { id: silobagData.id, name: silobagData.name, location: silobagData.location };

    } else if (data.type === 'silo_bag') {
        siloBagForRegister = { id: silobag.id, name: silobag.name, location: silobag.location };
    }

    const registerRef = doc(collection(db, `harvest_sessions/${harvestSession.id}/registers`));

    const registerData = {
        organization_id: data.organization_id,
        date: Timestamp.fromDate(new Date()),
        humidity: parseFloat(data.humidity),
        weight_kg: parseFloat(data.weight_kg),
        type: data.type,
        details: data.observations,
        ...(data.type === 'truck' ? {
            truck: {
                driver: data.driver,
                license_plate: data.license_plate
            },
            destination: destination || null,
            ctg: data.ctg || null,
            cpe: data.cpe || null
        } : {
            silo_bag: siloBagForRegister
        })
    };

    batch.set(registerRef, registerData);

    batch.commit();
}

export const updateRegister = (registerId: string, sessionId: string, data: any, silobag?: Partial<Silobag>, destination?: Destination) => {
    const batch = writeBatch(db);
    // 1. Obtener la referencia al documento del registro existente
    const registerRef = doc(db, `harvest_sessions/${sessionId}/registers`, registerId);

    const updatedRegisterData = {
        humidity: parseFloat(data.humidity),
        weight_kg: parseFloat(data.weight_kg),
        details: data.observations,
        ...(data.type === 'truck' ? {
            truck: {
                driver: data.driver,
                license_plate: data.license_plate
            },
            destination: destination || null,
            ctg: data.ctg || null,
            cpe: data.cpe || null
        } : {
            silo_bag: silobag
        })
    };

    batch.update(registerRef, updatedRegisterData);
    batch.commit();
};