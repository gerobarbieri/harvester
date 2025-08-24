import { collection, doc, increment, Timestamp, writeBatch } from "firebase/firestore";
import { toast } from "react-hot-toast";
import { db } from "../../../shared/firebase/firebase";
import type { CampaignField, Crop, Silobag, MovementType, SilobagMovement } from "../../../shared/types";

interface CreateSiloBagParams {
    formData: {
        name: string;
        fieldId: string;
        cropId: string;
        initialKg: string;
        details?: string;
        location?: string;
    };
    currentUser: any; // Deberías tener un tipo User aquí
    fields: Partial<CampaignField>[];
    crops: Partial<Crop>[];
}

interface ExtractKgsParams {
    siloBag: Silobag;
    formData: {
        kgChange: string;
        details: string;
    };
    currentUser: any;
}

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

export const createSilobag = async (params: CreateSiloBagParams) => {
    const { formData, currentUser, fields, crops } = params;
    const { name, fieldId, cropId, initialKg, details, location } = formData;

    const field = fields.find(cf => cf.field.id === fieldId)?.field;
    const crop = crops.find(c => c.id === cropId);

    if (!field || !crop) {
        throw new Error("El campo o el cultivo seleccionado no son válidos.");
    }

    const siloBagData: Partial<Silobag> = {
        name,
        location: location,
        organization_id: currentUser.organizationId,
        initial_kg: parseFloat(initialKg),
        field: { id: field.id, name: field.name },
        crop: { id: crop.id, name: crop.name },
        details: details
    };

    const batch = writeBatch(db);
    _prepareSiloBagCreation(batch, siloBagData, 'creation');

    try {
        await batch.commit();
    } catch (error) {
        console.error("Error al crear el silo:", error);
        toast.error('No se pudo guardar el silobolsa.');
        throw error;
    }
};

// --- SERVICIO DE EXTRACCIÓN ---
export const extractKgsSilobag = async (params: ExtractKgsParams) => {
    const { siloBag, formData, currentUser } = params;

    const exitMovement: Partial<SilobagMovement> = {
        type: "substract" as MovementType,
        kg_change: -parseFloat(formData.kgChange),
        organization_id: currentUser.organizationId,
        date: Timestamp.now(),
        details: formData.details
    };

    const batch = writeBatch(db);
    const siloBagRef = doc(db, 'silo_bags', siloBag.id);
    const movementRef = doc(collection(db, `silo_bags/${siloBag.id}/movements`));

    batch.update(siloBagRef, { current_kg: increment(exitMovement.kg_change), updated_at: Timestamp.now() });
    batch.set(movementRef, exitMovement);

    try {
        await batch.commit();
    } catch (error) {
        console.error("Error al registrar extracción:", error);
        toast.error('No se pudo guardar la extracción.');
        throw error;
    }
};

type CloseData = { reason: string, details: string };
export const closeSilobag = async (siloBag: Silobag, formData: CloseData) => {

    const batch = writeBatch(db);

    const siloBagRef = doc(db, `silo_bags/${siloBag.id}`);
    const data = { status: 'closed', current_kg: 0, ...(formData.reason === 'loss' ? { lost_kg: siloBag.current_kg } : { difference_kg: siloBag.current_kg }) }
    if (formData.reason === 'loss' && siloBag.current_kg > 0) {
        const movementRef = doc(collection(db, `silo_bags/${siloBag.id}/movements`));
        const adjustmentMovement: Partial<SilobagMovement> = {
            organization_id: siloBag.organization_id,
            type: "loss",
            kg_change: -siloBag.current_kg,
            date: Timestamp.now(),
            details: `Cierre de silo. Motivo: ${formData.details}`
        };
        batch.set(movementRef, adjustmentMovement);
    }

    batch.update(siloBagRef, data);

    try {
        await batch.commit();
    } catch (error) {
        console.error("Error al cerrar el silo:", error);
        toast.error('No se pudo cerrar el silobolsa.');
        throw error;
    }
};