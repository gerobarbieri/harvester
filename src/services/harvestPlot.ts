import { doc, serverTimestamp, updateDoc, collection, addDoc } from "firebase/firestore";
import type { HarvestPlot } from "../types";
import { db } from "../repository/firebase";

export const startHarvestOnPlot = (plotData: Partial<HarvestPlot>) => {
    // Validamos que los datos esenciales estén presentes.
    if (!plotData.plot_id || !plotData.crop_id || !plotData.hectares) return;

    // Preparamos el objeto final a guardar en Firestore.
    const harvestPlotDocument = {
        ...plotData,
        created_at: new Date(),
        created_at_server: serverTimestamp(),
        harvested_kgs: 0,
        status: 'pending',
        harvested_hectares: 0
    };

    return addDoc(collection(db, 'harvest_plots'), harvestPlotDocument);
};

export const updateHarvestPlot = (harvestPlotId: string, fieldKey: string, newValue: string) => {
    // Mapeo para traducir la clave del frontend al nombre real del campo en Firestore.
    const fieldMap = {
        crop: 'crop_id',
        manager: 'harvest_manager',
        harvester: 'harvester'
    };

    const dbFieldName = fieldMap[fieldKey];
    if (!dbFieldName) return;

    const harvestPlotRef = doc(db, 'harvest_plots', harvestPlotId);

    // Creamos el objeto de actualización dinámicamente.
    const updatePayload = {
        [dbFieldName]: newValue,
        updated_at: new Date(),
        updated_at_server: serverTimestamp()
    };

    return updateDoc(harvestPlotRef, updatePayload);
};

export const updatePlotProgress = (harvestPlotId: string, status: string, harvestedHectares: number) => {
    const harvestPlotRef = doc(db, "harvest_plots", harvestPlotId);

    const updatePayload = {
        status,
        harvested_hectares: harvestedHectares,
        updated_at: new Date(),
        updated_at_server: serverTimestamp()
    }
    updateDoc(harvestPlotRef, updatePayload)
        .catch(err => console.error("Error al actualizar progreso:", err));
}