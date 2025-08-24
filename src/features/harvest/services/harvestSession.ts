import { doc, updateDoc, collection, addDoc, Timestamp } from "firebase/firestore";
import type { Campaign, CampaignField, Crop, Harvester, HarvestManager, HarvestSession, HarvestStatus, Plot, User } from "../../../shared/types";
import { db } from "../../../shared/firebase/firebase";
import { getSessionWithRecalculatedYields } from "../../../shared/utils";

interface UpsertHarvestersParams {
    harvestSessionId: string;
    harvestersFormData: { id: string; name: string; plot_map: boolean; harvested_hectares: string | number }[];
}

interface StartSessionParams {
    formData: {
        fieldId: string;
        plotId: string;
        cropId: string;
        hectares: number;
        estimatedYield: number;
        managerId: string;
        harvesters: { harvesterId: string; maps: boolean }[];
    };
    currentUser: User;
    activeCampaign: Partial<Campaign>;
    allPlots: Plot[];
    allCampaignFields: CampaignField[];
    allCrops: Crop[];
    allHarvestManagers: HarvestManager[];
    allHarvesters: Harvester[];
}

// 2. La función ahora contiene toda la lógica de negocio.
export const startHarvestSession = (params: StartSessionParams) => {
    const { formData, currentUser, activeCampaign, allPlots, allCampaignFields, allCrops, allHarvestManagers, allHarvesters } = params;

    // La lógica de encontrar los objetos completos ahora vive aquí.
    const selectedField = allCampaignFields?.find(cf => cf.field.id === formData.fieldId)?.field;
    const selectedPlot = allPlots?.find(p => p.id === formData.plotId);
    const selectedCrop = allCrops?.find(c => c.id === formData.cropId);
    const selectedManager = allHarvestManagers?.find(m => m.id === formData.managerId);

    const selectedHarvesters = formData.harvesters.map(h => {
        const harvesterData = allHarvesters?.find(harv => harv.id === h.harvesterId);
        // Aseguramos que el cosechero exista antes de agregarlo
        if (!harvesterData) throw new Error(`El cosechero con ID ${h.harvesterId} no fue encontrado.`);
        return { id: harvesterData.id, name: harvesterData.name, map_plot: h.maps, harvested_hectares: 0 };
    });

    // Podemos añadir validaciones críticas en el servicio.
    if (!selectedField || !selectedPlot || !selectedCrop || !selectedManager) {
        throw new Error("Faltan datos esenciales para iniciar la cosecha.");
    }

    const harvestPlotDocument = {
        field: { id: selectedField.id, name: selectedField.name },
        plot: { id: selectedPlot.id, name: selectedPlot.name },
        crop: { id: selectedCrop.id, name: selectedCrop.name },
        harvest_manager: { id: selectedManager.id, name: selectedManager.name },
        harvesters: selectedHarvesters,
        hectares: formData.hectares,
        estimated_yield: formData.estimatedYield,
        campaign: { id: activeCampaign.id, name: activeCampaign.name },
        date: Timestamp.now(),
        organization_id: currentUser.organizationId,
        harvested_kgs: 0,
        status: 'pending' as HarvestStatus,
        harvested_hectares: 0,
        yields: { seed: 0, harvested: 0, real_vs_projected: 0 }
    };

    return addDoc(collection(db, 'harvest_sessions'), harvestPlotDocument);
};

export const updateHarvestManager = (harvestSessionId: string, newValue: HarvestManager) => {
    const harvestPlotRef = doc(db, 'harvest_sessions', harvestSessionId);
    const updatePayload = {
        harvest_manager: newValue,
        updated_at: new Date()
    };
    return updateDoc(harvestPlotRef, updatePayload);
};

export const upsertHarvesters = (params: UpsertHarvestersParams) => {
    const { harvestSessionId, harvestersFormData } = params;

    const updatedHarvesters = harvestersFormData.map(h => ({
        id: h.id,
        name: h.name,
        plot_map: h.plot_map || false,
        harvested_hectares: parseFloat(String(h.harvested_hectares)) || 0
    }));

    const harvestPlotRef = doc(db, 'harvest_sessions', harvestSessionId);
    const updatePayload = {
        harvesters: updatedHarvesters,
        updated_at: new Date()
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
        harvested_hectares: newHarvestedHectares,
        updated_at: Timestamp.now()

    };

    const finalSession = getSessionWithRecalculatedYields(sessionWithNewProgress);

    const updatePayload: Partial<HarvestSession> = {
        status: finalSession.status,
        harvested_hectares: finalSession.harvested_hectares,
        yields: finalSession.yields,
        updated_at: Timestamp.now(),
    };

    if (finalSession.harvesters && finalSession.harvesters.length === 1) {
        const singleHarvester = finalSession.harvesters[0];
        updatePayload.harvesters = [{
            ...singleHarvester,
            harvested_hectares: finalSession.harvested_hectares,
        }];
    }

    return updateDoc(sessionRef, updatePayload);
};