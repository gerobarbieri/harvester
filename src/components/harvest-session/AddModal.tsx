import { type FC, useState, type ChangeEvent, type FormEvent, useEffect } from "react";
import { startHarvestSession } from "../../services/harvestSession";
import Button from "../commons/Button";
import TagSelect from "../commons/TagSelect";
import type { Crop, HarvestManager, HarvestSession, Harvester, Plot } from "../../types";
import { useCampaign } from "../../hooks/campaign/useCampaign";
import { useField } from "../../hooks/field/useField";
import { usePlots } from "../../hooks/plot/usePlots";
import { useCrops } from "../../hooks/crop/useCrops";
import { useHarvesters } from "../../hooks/harvester/useHarvesters";
import { useHarvestManagers } from "../../hooks/harvest-manager/useHarvestManagers";
import useAuth from "../../context/auth/AuthContext";
import { Timestamp } from "firebase/firestore";

interface HarvestSessionModalProps {
    campaignId: string;
    fieldId: string;
    onClose: () => void;
    // Optional prop for showing feedback
    onSuccess?: () => void;
    onError?: (error: Error) => void;
}

const HarvestSessionModal: FC<HarvestSessionModalProps> = ({ campaignId, fieldId, onClose, onSuccess, onError }) => {
    const { campaign, loading: loadingCampaign } = useCampaign(campaignId);
    const { field, loading: loadingField } = useField(fieldId);
    const { plots, loading: loadingPlots } = usePlots(fieldId);
    const { crops, loading: loadingCrops } = useCrops();
    const { harvesters, loading: loadingHarvesters } = useHarvesters();
    const { harvestManagers, loading: loadingManagers } = useHarvestManagers();
    const { currentUser } = useAuth();

    const [formData, setFormData] = useState({
        selectedPlot: null as Plot | null,
        selectedCrop: null as Crop | null,
        hectares: '',
        estimated_yield: '',
        selectedManager: null as HarvestManager | null,
        selectedHarvesters: [] as Harvester[],
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const isLoading = loadingCampaign || loadingField || loadingPlots || loadingCrops || loadingHarvesters || loadingManagers;

    // Sync hectares with the selected plot
    useEffect(() => {
        if (formData.selectedPlot) {
            setFormData(prev => ({ ...prev, hectares: String(formData.selectedPlot!.hectares) || '' }));
        }
    }, [formData.selectedPlot]);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);

        if (!campaign || !field || !formData.selectedPlot || !formData.selectedCrop || !formData.selectedManager) {
            console.error("Faltan datos para crear la sesión.");
            // You could display a user-facing error message here
            setIsSubmitting(false);
            onError?.(new Error("Missing required data."));
            return;
        }

        const harvestSessionData: Partial<HarvestSession> = {
            date: Timestamp.now(),
            status: 'pending',
            organization_id: currentUser.organizationId,
            campaign: { id: campaign.id, name: campaign.name },
            field: { id: field.id, name: field.name, location: field.location },
            plot: { id: formData.selectedPlot.id, name: formData.selectedPlot.name, hectares: formData.selectedPlot.hectares || 0 },
            crop: { id: formData.selectedCrop.id, name: formData.selectedCrop.name, type: formData.selectedCrop.type || '' },
            hectares: parseFloat(formData.hectares),
            estimated_yield: parseFloat(formData.estimated_yield) || 0,
            harvesters: formData.selectedHarvesters.map(h => ({ id: h.id, name: h.name })),
            harvest_manager: { id: formData.selectedManager.id, name: formData.selectedManager.name },
            yields: { seed: 0, harvested: 0, real_vs_projected: 0 },
            harvested_hectares: 0
        };

        try {
            startHarvestSession(harvestSessionData);
            onSuccess?.();
            onClose();
        } catch (err) {
            console.error("Error al iniciar cosecha:", err);
            onError?.(err as Error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;

        const dataMap = {
            plotId: plots,
            cropId: crops,
            managerId: harvestManagers,
        };

        const stateKeyMap: Record<string, keyof typeof formData> = {
            plotId: 'selectedPlot',
            cropId: 'selectedCrop',
            managerId: 'selectedManager'
        };

        const selectedObject = dataMap[name as keyof typeof dataMap]?.find(item => item.id === value) || null;
        setFormData(prev => ({ ...prev, [stateKeyMap[name]]: selectedObject }));
    };

    const handleHarvesterChange = (newSelection: Harvester[]) => {
        setFormData(prev => ({ ...prev, selectedHarvesters: newSelection }));
    };

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    if (isLoading) {
        return (
            <div className="fixed inset-0 bg-black/30 z-50 flex justify-center items-center">
                <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
                    <p>Cargando datos del formulario...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <h3 className="text-xl font-bold text-gray-800">Iniciar cosecha</h3>
                    <div>
                        <label htmlFor="plotId" className="font-semibold">Lote</label>
                        <select name="plotId" value={formData.selectedPlot?.id || ''} onChange={handleSelectChange} required className="w-full mt-1 p-2 border rounded-lg">
                            <option value="">{loadingPlots ? "Cargando..." : "Seleccione"}</option>
                            {plots?.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="cropId" className="font-semibold">Cultivo</label>
                        <select name="cropId" id="cropId" value={formData.selectedCrop?.id || ''} onChange={handleSelectChange} required className="w-full mt-1 p-2 border rounded-lg">
                            <option value="">{loadingCrops ? "Cargando..." : "Seleccione"}</option>
                            {crops.length > 0 ? crops.map(c => <option key={c.id} value={c.id}>{c.name}</option>) : <option disabled>No hay cultivos</option>}
                        </select>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="hectares" className="font-semibold">Hectáreas</label>
                            <input name="hectares" id="hectares" value={formData.hectares} onChange={handleInputChange} type="number" step="0.01" required placeholder="Ej: 30" className="w-full mt-1 p-2 border rounded-lg" disabled={!formData.selectedPlot} />
                        </div>
                        <div>
                            <label htmlFor="estimated_yield" className="font-semibold">Rinde estimado</label>
                            <input name="estimated_yield" id="estimated_yield" value={formData.estimated_yield} onChange={handleInputChange} type="number" step="0.01" placeholder="Ej: 5000" className="w-full mt-1 p-2 border rounded-lg" disabled={!formData.selectedPlot} />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <TagSelect
                                label="Cosecheros"
                                options={harvesters || []}
                                selectedItems={formData.selectedHarvesters}
                                onSelectionChange={handleHarvesterChange}
                                placeholder={loadingHarvesters ? "Cargando..." : "Seleccione"}
                            />
                        </div>
                        <div>
                            <label htmlFor="managerId" className="font-semibold">Responsable de cosecha</label>
                            <select name="managerId" id="managerId" value={formData.selectedManager?.id || ''} onChange={handleSelectChange} required className="w-full mt-1 p-2 border rounded-lg">
                                <option value="">{loadingManagers ? "Cargando..." : "Seleccione"}</option>
                                {harvestManagers.length > 0 ? harvestManagers.map(c => <option key={c.id} value={c.id}>{c.name}</option>) : <option disabled>No hay responsables</option>}
                            </select>
                        </div>

                    </div>
                    <div className="pt-4 flex gap-4">
                        <Button type="button" onClick={onClose} variant="secondary" disabled={isSubmitting}>Cancelar</Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Guardando..." : "Guardar"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default HarvestSessionModal;