import { type FC, useState, type FormEvent, type ChangeEvent } from "react";
import Button from "../../ui/Button";
import type { HarvestPlotRecord } from "../../../types";
import { addRecordAndUpdateHarvestPlot } from "../../../services/harvestPlotRecord";

const RecordFormModal: FC<{ harvestPlotId: string; onClose: () => void; }> = ({ harvestPlotId, onClose }) => {
    const [type, setType] = useState<HarvestPlotRecord['type']>('camion');
    const [formData, setFormData] = useState({
        kg: '',
        humidity: '',
        details: '',
        licensePlate: '',
        driver: '',
        destination: '',
        silobagName: ''
    });

    // ✅ 2. Creamos un único handler que maneja el cambio para todos los inputs.
    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!harvestPlotId) return;

        // 2. Construimos el objeto directamente desde el estado
        const newRecordData: Partial<HarvestPlotRecord> = {
            harvest_plot_id: harvestPlotId,
            kg: parseFloat(formData.kg) || 0,
            humidity: parseFloat(formData.humidity) || 0,
            details: formData.details,
            type,
            license_plate: type === 'camion' ? formData.licensePlate : '',
            driver: type === 'camion' ? formData.driver : '',
            destination: type === 'camion' ? formData.destination : '',
            silobag_name: type === 'silobolsa' ? formData.silobagName : ''
        };

        onClose();

        addRecordAndUpdateHarvestPlot(newRecordData, harvestPlotId)
            .catch(error => {
                console.error("Error al guardar el registro:", error);
            });
    };

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-lg">
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <h2 className="text-2xl font-bold text-gray-800">Nuevo Registro</h2>
                    <div><label>Tipo</label><select name="type" value={type} onChange={e => setType(e.target.value as HarvestPlotRecord['type'])} className="w-full mt-1 p-2 border rounded-lg"><option value="camion">Camión</option><option value="silobolsa">Silobolsa</option></select></div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label>Kilos</label><input name="kg" value={formData.kg} onChange={handleChange} type="number" step="0.01" required placeholder="Kilos" className="w-full mt-1 p-2 border rounded-lg" /></div>
                        <div><label>Humedad</label><input name="humidity" value={formData.humidity} onChange={handleChange} type="number" step="0.01" placeholder="Humedad" className="w-full mt-1 p-2 border rounded-lg" /></div>
                    </div>
                    {type === 'camion' && (<>
                        <div className="grid grid-cols-2 gap-4">
                            <div><label>Chofer</label><input name="driver" value={formData.driver} onChange={handleChange} type="text" placeholder="Nombre del chofer" className="w-full mt-1 p-2 border rounded-lg" /></div>
                            <div><label>Patente</label><input name="licensePlate" value={formData.licensePlate} onChange={handleChange} type="text" placeholder="Patente del camión" className="w-full mt-1 p-2 border rounded-lg" /></div>
                        </div>
                        <div><label>Destino</label><input name="destination" type="text" value={formData.destination} onChange={handleChange} placeholder="Destino de la carga" className="w-full mt-1 p-2 border rounded-lg" /></div>
                    </>)}
                    {type === 'silobolsa' && (<div><label>ID Silobolsa</label><input name="silobagName" value={formData.silobagName} onChange={handleChange} type="text" placeholder="ID o nombre del silobolsa" className="w-full mt-1 p-2 border rounded-lg" /></div>)}
                    <div><label>Observaciones</label><textarea name="details" value={formData.details} onChange={handleChange} rows={2} placeholder="Observaciones" className="w-full mt-1 p-2 border rounded-lg" /></div>
                    <div className="pt-4 flex flex-row gap-4">
                        <Button type="button" onClick={onClose} variant="secondary">Cancelar</Button>
                        <Button type="submit">Guardar</Button>
                    </div>
                </form>
            </div>
        </div>
    );
};
export default RecordFormModal;