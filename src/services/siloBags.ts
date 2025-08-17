import { addDoc, collection, doc, Timestamp, writeBatch } from "firebase/firestore";
import { db } from "../firebase/firebase";
import type { Silobag, SilobagMovement } from "../types";

export const createSilobag = (siloBagData: Partial<Silobag>) => {
    const siloBagRef = doc(collection(db, "silo_bags"));
    const newSiloId = siloBagRef.id;
    const movementRef = doc(collection(db, `silo_bags/${newSiloId}/movements`));

    const initialMovementData = {
        type: "creation",
        organization_id: siloBagData.organization_id,
        kg_change: siloBagData.initial_kg,
        date: new Date(),
        details: siloBagData.details || "Silobolsa creado manualmente."
    };

    const siloBagDocument = {
        ...siloBagData,
        created_at: new Date(),
        status: "active",
    };

    const batch = writeBatch(db);

    batch.set(siloBagRef, siloBagDocument);
    batch.set(movementRef, initialMovementData); // Operación 2: Crear el movimiento

    return batch.commit();
};

export const extractKgsSilobag = (siloBagId: string, movement: Partial<SilobagMovement>) => {
    return addDoc(collection(db, `silo_bags/${siloBagId}/movements`), movement);
}

export const closeSilobag = (siloBag: Silobag, details: string, organization_id: string) => {
    const siloBagRef = doc(db, `silo_bags/${siloBag.id}`);
    const batch = writeBatch(db);

    batch.update(siloBagRef, {
        status: "closed",
        lost_kg: siloBag.current_kg
    });

    if (siloBag.current_kg > 0) {
        const movementRef = doc(collection(db, `silo_bags/${siloBag.id}/movements`));

        const adjustmentMovement = {
            organization_id: organization_id,
            type: "loss",
            kg_change: -siloBag.current_kg,
            date: Timestamp.now(),
            details: `Cierre de silo con pérdida. Motivo: ${details}`
        };
        batch.set(movementRef, adjustmentMovement);
    }

    // 3. Ejecuta ambas operaciones de forma atómica.
    return batch.commit();
}