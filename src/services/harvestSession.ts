import { doc, serverTimestamp, updateDoc, collection, addDoc } from "firebase/firestore";
import type { Harvester, HarvestManager, HarvestSession } from "../types";
import { db } from "../firebase/firebase";

export const startHarvestSession = (harvestData: Partial<HarvestSession>) => {
    // Validamos que los datos esenciales estén presentes.
    if (!harvestData.plot.id || !harvestData.crop.id || !harvestData.hectares) return;

    // Preparamos el objeto final a guardar en Firestore.
    const harvestPlotDocument = {
        ...harvestData,
        created_at: new Date(),
        created_at_server: serverTimestamp(),
        harvested_kgs: 0,
        status: 'pending',
        harvested_hectares: 0
    };

    return addDoc(collection(db, 'harvest_sessions'), harvestPlotDocument);
};

export const updateHarvestSession = (harvestSessionId: string, fieldKey: string, newValue: string) => {
    // Mapeo para traducir la clave del frontend al nombre real del campo en Firestore.
    const fieldMap = {
        crop: 'crop',
        harvest_manager: 'harvest_manager',
        harvesters: 'harvesters'
    };

    const dbFieldName = fieldMap[fieldKey];
    if (!dbFieldName) return;

    const harvestPlotRef = doc(db, 'harvest_sessions', harvestSessionId);

    // Creamos el objeto de actualización dinámicamente.
    const updatePayload = {
        [dbFieldName]: newValue,
        updated_at: new Date(),
        updated_at_server: serverTimestamp()
    };

    return updateDoc(harvestPlotRef, updatePayload);
};

export const updateHarvestManager = (harvestSessionId: string, newValue: HarvestManager) => {

    const harvestPlotRef = doc(db, 'harvest_sessions', harvestSessionId);

    const updatePayload = {
        harvest_manager: newValue,
        updated_at: new Date(),
        updated_at_server: serverTimestamp()
    };

    return updateDoc(harvestPlotRef, updatePayload);
};

export const upsertHarvesters = (harvestSessionId: string, updatedHarvesters: Harvester[]) => {

    const harvestPlotRef = doc(db, 'harvest_sessions', harvestSessionId);

    const updatePayload = {
        harvesters: updatedHarvesters,
        updated_at: new Date(),
        updated_at_server: serverTimestamp()
    };

    return updateDoc(harvestPlotRef, updatePayload);
};

export const updateHarvestSessionProgress = (harvestSessionId: string, status: string, harvestedHectares: number) => {
    const harvestPlotRef = doc(db, "harvest_sessions", harvestSessionId);

    const updatePayload = {
        status,
        harvested_hectares: harvestedHectares,
        updated_at: new Date(),
        updated_at_server: serverTimestamp()
    }
    updateDoc(harvestPlotRef, updatePayload)
        .catch(err => console.error("Error al actualizar progreso:", err));
}