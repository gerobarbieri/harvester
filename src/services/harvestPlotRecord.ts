import { addDoc, collection, deleteDoc, doc, increment, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "../repository/firebase";
import type { HarvestPlotRecord } from "../types";

export const deleteRecordAndUpdateHarvestPlot = (recordToDelete: HarvestPlotRecord, harvestPlotIdplotId: string) => {
    if (!recordToDelete || !harvestPlotIdplotId) return;

    const plotRef = doc(db, "harvest_plots", harvestPlotIdplotId);
    const recordRef = doc(db, "harvest_plots_records", recordToDelete.id);

    const plotUpdatePromise = updateDoc(plotRef, {
        harvested_kgs: increment(-recordToDelete.kg)
    });

    const recordDeletePromise = deleteDoc(recordRef);
    return Promise.all([plotUpdatePromise, recordDeletePromise]);
};

export const addRecordAndUpdateHarvestPlot = (recordData: Partial<HarvestPlotRecord>, harvestPlotId: string) => {
    const finalRecord = {
        ...recordData,
        created_at: new Date(),
        created_at_server: serverTimestamp(),
    };

    const harvestPlotRef = doc(db, "harvest_plots", harvestPlotId);
    const plotUpdatePromise = updateDoc(harvestPlotRef, {
        harvested_kgs: increment(recordData.kg)
    });

    const recordAddPromise = addDoc(collection(db, "harvest_plots_records"), finalRecord);
    return Promise.all([recordAddPromise, plotUpdatePromise]);
}

export const updateRecordAndUpdateHarvestPlot = (recordId: string, harvestPlotIdplotId: string, originalKgValue: number, updatedData: Partial<HarvestPlotRecord>) => {
    if (!recordId || !harvestPlotIdplotId || originalKgValue === undefined || !updatedData) return;

    const kiloDifference = updatedData.kg - originalKgValue;

    const recordRef = doc(db, "harvest_plots_records", recordId);
    const plotRef = doc(db, "harvest_plots", harvestPlotIdplotId);

    const recordUpdatePromise = updateDoc(recordRef, {
        ...updatedData,
        updated_at: serverTimestamp()
    });

    const plotUpdatePromise = updateDoc(plotRef, {
        harvested_kgs: increment(kiloDifference)
    });

    return Promise.all([recordUpdatePromise, plotUpdatePromise]);
};