import { doc, serverTimestamp, updateDoc, collection, addDoc } from "firebase/firestore";
import type { Harvester, HarvestManager, HarvestSession, HarvestStatus } from "../types";
import { db } from "../firebase/firebase";
import { getSessionWithRecalculatedYields } from "../utils";

export const startHarvestSession = (harvestData: Partial<HarvestSession>) => {
    const harvestPlotDocument = {
        ...harvestData,
        created_at: new Date(),
        created_at_server: serverTimestamp(),
        harvested_kgs: 0,
        status: 'pending',
        harvested_hectares: 0,
        yields: { seed: 0, harvested: 0, real_vs_projected: 0 }
    };
    return addDoc(collection(db, 'harvest_sessions'), harvestPlotDocument);
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

export const updateHarvestSessionProgress = async (
    currentSession: HarvestSession,
    newStatus: HarvestStatus,
    newHarvestedHectares: number
) => {
    const sessionRef = doc(db, "harvest_sessions", currentSession.id);

    const sessionWithNewProgress = {
        ...currentSession,
        status: newStatus,
        harvested_hectares: newHarvestedHectares
    };

    const finalSession = getSessionWithRecalculatedYields(sessionWithNewProgress);

    const updatePayload = {
        status: finalSession.status,
        harvested_hectares: finalSession.harvested_hectares,
        yields: finalSession.yields,
        updated_at: new Date(),
        updated_at_server: serverTimestamp()
    };

    return updateDoc(sessionRef, updatePayload);
};