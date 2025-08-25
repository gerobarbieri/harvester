import { collection, doc, Timestamp, writeBatch, increment } from "firebase/firestore";
import { toast } from "react-hot-toast";
import type { Destination, HarvestSession, HarvestSessionRegister, Silobag } from "../../../shared/types";
import { db } from "../../../shared/firebase/firebase";
import { getSessionWithRecalculatedYields } from "../../../shared/utils";
import { _prepareSiloBagCreation } from "../../silobags/services/siloBags";

interface AddRegisterParams {
    formData: any;
    harvestSession: HarvestSession;
    siloBags: Silobag[];
    destinations: Destination[];
}

interface UpdateRegisterParams {
    formData: any;
    originalRegister: HarvestSessionRegister;
    harvestSession: HarvestSession;
    siloBags: Silobag[];
    destinations: Destination[];
}

interface DeleteRegisterParams {
    registerToDelete: HarvestSessionRegister;
    harvestSession: HarvestSession;
}


// --- HELPERS (Funciones auxiliares) ---

const commitBatch = async (batch: any, messages: { success: string, error: string }) => {
    try {
        await batch.commit();
    } catch (error) {
        console.error(messages.error, error);
        toast.error(messages.error);
        throw error;
    }
};

const prepareRegisterData = (data: any, silo_bag?: any, destination?: Destination) => {
    return {
        organization_id: data.organization_id,
        field: data.field,
        date: Timestamp.fromDate(new Date()),
        humidity: parseFloat(data.humidity),
        weight_kg: parseFloat(data.weight_kg),
        type: data.type,
        details: data.observations,
        ...(data.type === 'truck' ? {
            truck: { driver: data.driver, license_plate: data.license_plate },
            destination: { id: destination.id, name: destination.name },
            ctg: data.ctg || null,
            cpe: data.cpe || null
        } : { silo_bag: silo_bag })
    };
};


// --- FUNCIONES PRINCIPALES DEL SERVICIO ---

export const addRegister = (params: AddRegisterParams) => {
    const { formData, harvestSession, siloBags, destinations } = params;
    const batch = writeBatch(db);
    const weightKg = parseFloat(formData.weight_kg);

    // Lógica de sesión
    const updatedSession = getSessionWithRecalculatedYields({
        ...harvestSession,
        harvested_kgs: (harvestSession.harvested_kgs || 0) + weightKg,
    });
    const sessionRef = doc(db, 'harvest_sessions', harvestSession.id);
    batch.update(sessionRef, {
        harvested_kgs: updatedSession.harvested_kgs,
        yields: updatedSession.yields
    });

    // Lógica de registro y silobolsa
    const registerRef = doc(collection(db, `harvest_sessions/${harvestSession.id}/registers`));
    let siloBagForRegister: { id: string, name: string, location: any };

    const destination = formData.type === 'truck' ? destinations.find(d => d.id === formData.destinationId) : undefined;

    if (formData.type === 'silo_bag') {
        if (!formData.siloBagId) { // Crear nuevo silobolsa
            const siloBagData = {
                name: formData.newSiloBagName, initial_kg: weightKg,
                organization_id: harvestSession.organization_id, crop: harvestSession.crop,
                field: harvestSession.field, location: formData.location
            } as Partial<Silobag>;
            const newSiloBagRef = _prepareSiloBagCreation(batch, siloBagData, 'harvest_entry', registerRef.id);
            siloBagForRegister = { id: newSiloBagRef.id, name: formData.newSiloBagName, location: formData.location };
        } else { // Usar silobolsa existente
            const silobag = siloBags.find(s => s.id === formData.siloBagId);
            if (!silobag) throw new Error("El silobolsa seleccionado no existe.");
            siloBagForRegister = { id: silobag.id, name: silobag.name, location: silobag.location };

            const siloRef = doc(db, 'silo_bags', silobag.id);
            const movementRef = doc(collection(db, `silo_bags/${silobag.id}/movements`), registerRef.id);
            batch.update(siloRef, { current_kg: increment(weightKg) });
            batch.set(movementRef, { type: 'harvest_entry', kg_change: weightKg, date: Timestamp.now(), organization_id: formData.organization_id, field: { id: harvestSession.field.id }, details: "Entrada por cosecha." });
        }
    }

    const registerData = prepareRegisterData({ ...formData, field: { id: harvestSession.field.id } }, siloBagForRegister, destination);
    batch.set(registerRef, registerData);

    return commitBatch(batch, { success: "Registro añadido con éxito.", error: 'Falló la operación combinada.' });
};

export const updateRegister = async (params: UpdateRegisterParams) => {
    const { formData, originalRegister, harvestSession, destinations } = params;
    const batch = writeBatch(db);
    const kgDifference = parseFloat(formData.weight_kg) - (originalRegister.weight_kg || 0);

    const updatedSession = getSessionWithRecalculatedYields({
        ...harvestSession,
        harvested_kgs: (harvestSession.harvested_kgs || 0) + kgDifference
    });
    const sessionRef = doc(db, 'harvest_sessions', harvestSession.id);
    batch.update(sessionRef, {
        harvested_kgs: updatedSession.harvested_kgs,
        yields: updatedSession.yields,
        updated_at: Timestamp.now()
    });

    const registerRef = doc(db, `harvest_sessions/${harvestSession.id}/registers`, originalRegister.id);
    const destination = formData.type === 'truck' ? destinations.find(d => d.id === formData.destinationId) : undefined;
    const silobag = formData.type === 'silo_bag' ? { id: originalRegister.silo_bag.id, name: originalRegister.silo_bag.name, location: formData.location } : undefined;
    const updatedRegisterData = prepareRegisterData(formData, silobag, destination);
    batch.update(registerRef, updatedRegisterData);

    if (originalRegister.type === 'silo_bag' && originalRegister.silo_bag?.id) {
        const siloRef = doc(db, 'silo_bags', originalRegister.silo_bag.id);
        const movementRef = doc(collection(db, `silo_bags/${originalRegister.silo_bag.id}/movements`), originalRegister.id);
        batch.update(siloRef, { current_kg: increment(kgDifference), updated_at: Timestamp.now() });
        batch.update(movementRef, { kg_change: parseFloat(formData.weight_kg), date: Timestamp.now() });
    }

    return commitBatch(batch, { success: "Registro actualizado con éxito.", error: 'Falló la actualización del registro.' });
};

export const deleteRegister = async (params: DeleteRegisterParams) => {
    const { registerToDelete, harvestSession } = params;
    if (!registerToDelete.id) return;
    const batch = writeBatch(db);
    const weightKg = registerToDelete.weight_kg || 0;

    const updatedSession = getSessionWithRecalculatedYields({
        ...harvestSession,
        harvested_kgs: (harvestSession.harvested_kgs || 0) - weightKg,
    });
    const sessionRef = doc(db, 'harvest_sessions', harvestSession.id);
    batch.update(sessionRef, {
        harvested_kgs: updatedSession.harvested_kgs,
        yields: updatedSession.yields
    });

    const registerRef = doc(db, `harvest_sessions/${harvestSession.id}/registers`, registerToDelete.id);
    batch.delete(registerRef);

    if (registerToDelete.type === 'silo_bag' && registerToDelete.silo_bag?.id) {
        const siloRef = doc(db, 'silo_bags', registerToDelete.silo_bag.id);
        const movementRef = doc(collection(db, `silo_bags/${registerToDelete.silo_bag.id}/movements`), registerToDelete.id);
        batch.update(siloRef, { current_kg: increment(-weightKg) });
        batch.delete(movementRef);
    }

    return commitBatch(batch, { success: "Registro eliminado con éxito.", error: 'Falló la eliminación del registro.' });
};