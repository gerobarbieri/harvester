import { collection, doc, increment, Timestamp, writeBatch } from "firebase/firestore";
import { db } from "../firebase/firebase";
import type { Silobag, MovementType, SilobagMovement } from "../types";
import { toast } from "react-hot-toast";

/**
 * AÑADE LAS OPERACIONES DE CREACIÓN DE SILOBOLSA A UN BATCH EXISTENTE.
 * @private
 */
export const _prepareSiloBagCreation = (
    batch: any,
    siloBagData: Partial<Silobag>,
    movementType: MovementType = 'creation',
    movementId?: string
) => {
    const siloBagRef = doc(collection(db, "silo_bags"));
    const movementRef = movementId ?
        doc(db, `silo_bags/${siloBagRef.id}/movements`, movementId) :
        doc(collection(db, `silo_bags/${siloBagRef.id}/movements`));

    const siloBagDocument = {
        ...siloBagData,
        created_at: Timestamp.fromDate(new Date()),
        current_kg: siloBagData.initial_kg,
        status: "active",
    };

    const initialMovementData: Partial<SilobagMovement> = {
        type: movementType,
        organization_id: siloBagData.organization_id,
        kg_change: siloBagData.initial_kg,
        date: Timestamp.now(),
        details: movementType === 'creation' ? "Creación manual de silobolsa." : "Entrada inicial por cosecha."
    };

    batch.set(siloBagRef, siloBagDocument);
    batch.set(movementRef, initialMovementData);

    return siloBagRef;
};

// --- SERVICIO PÚBLICO PARA CREAR UN SILO MANUALMENTE ---
export const createSilobag = async (siloBagData: Partial<Silobag>, optimisticHandlers: { add: (silo: Silobag) => void; remove: (id: string) => void; }) => {
    const optimisticId = `optimistic-${Date.now()}`;
    const optimisticSilo = {
        id: optimisticId, ...siloBagData, status: 'active', current_kg: siloBagData.initial_kg, lost_kg: 0
    } as Silobag;
    optimisticHandlers.add(optimisticSilo);

    const batch = writeBatch(db);
    _prepareSiloBagCreation(batch, siloBagData, 'creation');

    try {
        await batch.commit();
    } catch (error) {
        console.error("Error al crear el silo:", error);
        optimisticHandlers.remove(optimisticId);
        toast.error('No se pudo guardar el silobolsa.');
        throw error;
    }
};

// --- SERVICIO DE EXTRACCIÓN ---
export const extractKgsSilobag = async (siloBag: Silobag, movement: Partial<SilobagMovement>, updateOptimistic: (id: string, updates: Partial<Silobag>) => void) => {
    const originalKgs = siloBag.current_kg;
    const batch = writeBatch(db);

    // UI Optimista
    updateOptimistic(siloBag.id, { current_kg: originalKgs + (movement.kg_change || 0) });

    const siloBagRef = doc(db, 'silo_bags', siloBag.id);
    const movementRef = doc(collection(db, `silo_bags/${siloBag.id}/movements`));

    batch.update(siloBagRef, { current_kg: increment(movement.kg_change) });
    batch.set(movementRef, movement);

    try {
        await batch.commit();
    } catch (error) {
        console.error("Error al registrar extracción:", error);
        updateOptimistic(siloBag.id, { current_kg: originalKgs });
        toast.error('No se pudo guardar la extracción.');
        throw error;
    }
};

// --- SERVICIO DE CIERRE ---
export const closeSilobag = async (siloBag: Silobag, details: string, updateOptimistic: (id: string, updates: Partial<Silobag>) => void) => {
    const originalState = { status: siloBag.status, lost_kg: siloBag.lost_kg, current_kg: siloBag.current_kg };
    const batch = writeBatch(db);

    updateOptimistic(siloBag.id, { status: 'closed', lost_kg: siloBag.current_kg, current_kg: 0 });

    const siloBagRef = doc(db, `silo_bags/${siloBag.id}`);
    batch.update(siloBagRef, { status: "closed", lost_kg: siloBag.current_kg, current_kg: 0 });

    if (siloBag.current_kg > 0) {
        const movementRef = doc(collection(db, `silo_bags/${siloBag.id}/movements`));
        const adjustmentMovement: Partial<SilobagMovement> = {
            organization_id: siloBag.organization_id,
            type: "loss",
            kg_change: -siloBag.current_kg,
            date: Timestamp.now(),
            details: `Cierre de silo. Motivo: ${details}`
        };
        batch.set(movementRef, adjustmentMovement);
    }

    try {
        await batch.commit();
    } catch (error) {
        console.error("Error al cerrar el silo:", error);
        updateOptimistic(siloBag.id, originalState);
        toast.error('No se pudo cerrar el silobolsa.');
        throw error;
    }
};