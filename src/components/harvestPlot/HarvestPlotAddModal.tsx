import { type FC, useState, type ChangeEvent, type FormEvent } from "react";
import useData from "../../context/DataContext";
import { startHarvestOnPlot } from "../../services/harvestPlot";

// Importa tus componentes
import Button from "../ui/Button";
import type { Plot } from "../../types";

const PlotHarvestModal: FC<{ campaignId: string; fieldId: string; availablePlots: Plot[]; onClose: () => void; }> = ({ campaignId, fieldId, availablePlots, onClose }) => {
    const { crops } = useData();

    const [formData, setFormData] = useState({
        plotId: '',
        cropId: '',
        hectares: '',
        harvester: '',
        harvestManager: ''
    });

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const plotData = {
            campaign_id: campaignId,
            field_id: fieldId,
            plot_id: formData.plotId,
            crop_id: formData.cropId,
            hectares: parseFloat(formData.hectares),
            harvester: formData.harvester,
            harvest_manager: formData.harvestManager,
        };

        onClose();

        startHarvestOnPlot(plotData)
            .catch((err) => {
                console.error("Error al iniciar cosecha:", err);
            });
    };

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <h3 className="text-xl font-bold text-gray-800">Iniciar cosecha</h3>
                    <div>
                        <label htmlFor="plotId" className="font-semibold">Lote</label>
                        <select name="plotId" id="plotId" value={formData.plotId} onChange={handleChange} required className="w-full mt-1 p-2 border rounded-lg">
                            <option value="">Seleccione un lote disponible</option>
                            {availablePlots.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="cropId" className="font-semibold">Cultivo</label>
                            <select name="cropId" id="cropId" value={formData.cropId} onChange={handleChange} required className="w-full mt-1 p-2 border rounded-lg">
                                <option value="">Seleccione un cultivo</option>
                                {crops.map(c => <option key={c.id} value={c.id}>{c.name} {c.type}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="hectares" className="font-semibold">Hectáreas</label>
                            <input name="hectares" id="hectares" value={formData.hectares} onChange={handleChange} type="number" step="0.01" required placeholder="Ej: 30" className="w-full mt-1 p-2 border rounded-lg" />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="harvester" className="font-semibold">Cosechero</label>
                            <input name="harvester" id="harvester" value={formData.harvester} onChange={handleChange} type="text" placeholder="Ej: Pedro Rodriguez" className="w-full mt-1 p-2 border rounded-lg" />
                        </div>
                        <div>
                            <label htmlFor="harvestManager" className="font-semibold">Responsable de cosecha</label>
                            <input name="harvestManager" id="harvestManager" value={formData.harvestManager} onChange={handleChange} type="text" placeholder="Ej: Fede Ferray" className="w-full mt-1 p-2 border rounded-lg" />
                        </div>
                    </div>
                    <div className="pt-4 flex gap-4">
                        <Button type="button" onClick={onClose} variant="secondary">Cancelar</Button>
                        <Button type="submit">Guardar</Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PlotHarvestModal;