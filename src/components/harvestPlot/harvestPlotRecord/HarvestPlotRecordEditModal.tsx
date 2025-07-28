import { type FC, useState, type FormEvent, type ChangeEvent } from "react";
import Button from "../../ui/Button";
import type { HarvestPlotsWithDetails, HarvestPlotRecord } from "../../../types";
import { updateRecordAndUpdateHarvestPlot } from "../../../services/harvestPlotRecord"; // Importamos la nueva función

const EditRecordModal: FC<{ record: HarvestPlotRecord; harvestPlot: HarvestPlotsWithDetails; onClose: () => void; }> = ({ record, harvestPlot, onClose }) => {
    const [formData, setFormData] = useState({
        kg: record.kg.toString(),
        humidity: record.humidity?.toString() || '',
        license_plate: record.license_plate || '',
        driver: record.driver || '',
        destination: record.destination || '',
        silobag_name: record.silobag_name || '',
        details: record.details || ''
    });

    // 2. Creamos un único handler para todos los cambios.
    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const updatedRecordData = {
            kg: parseFloat(formData.kg) || 0,
            humidity: parseFloat(formData.humidity) || 0,
            license_plate: formData.license_plate,
            driver: formData.driver,
            destination: formData.destination,
            silobag_name: formData.silobag_name,
            details: formData.details,
        };

        onClose(); // Cierre optimista de la UI

        // 4. Llamamos al servicio con los datos necesarios y manejamos el error.
        updateRecordAndUpdateHarvestPlot(record.id, harvestPlot.id, record.kg, updatedRecordData)
            .catch(err => {
                console.error("Error al actualizar registro:", err);
                // Aquí podrías mostrar una notificación de error al usuario.
            });
    };

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-lg">
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <h2 className="text-2xl font-bold text-gray-800">Editar Registro</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label>Kilos</label><input name="kg" value={formData.kg} onChange={handleChange} type="number" step="0.01" required className="w-full mt-1 p-2 border rounded-lg" /></div>
                        <div><label>Humedad</label><input name="humidity" value={formData.humidity} onChange={handleChange} type="number" step="0.01" className="w-full mt-1 p-2 border rounded-lg" /></div>
                    </div>

                    {record.type === 'camion' && (<>
                        <div className="grid grid-cols-2 gap-4">
                            <div><label>Chofer</label><input name="driver" value={formData.driver} onChange={handleChange} type="text" className="w-full mt-1 p-2 border rounded-lg" /></div>
                            <div><label>Patente</label><input name="license_plate" value={formData.license_plate} onChange={handleChange} type="text" className="w-full mt-1 p-2 border rounded-lg" /></div>
                        </div>
                        <div><label>Destino</label><input name="destination" value={formData.destination} onChange={handleChange} type="text" className="w-full mt-1 p-2 border rounded-lg" /></div>
                    </>)}

                    {record.type === 'silobolsa' && (<div><label>ID Silobolsa</label><input name="silobag_name" value={formData.silobag_name} onChange={handleChange} type="text" className="w-full mt-1 p-2 border rounded-lg" /></div>)}

                    <div><label>Observación</label><textarea name="details" value={formData.details} onChange={handleChange} rows={3} className="w-full mt-1 p-2 border rounded-lg"></textarea></div>

                    <div className="pt-4 flex flex-row gap-4">
                        <Button type="button" onClick={onClose} variant="secondary">Cancelar</Button>
                        <Button type="submit">Guardar</Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditRecordModal;