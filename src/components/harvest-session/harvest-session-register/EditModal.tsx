import { type FC, useState, type FormEvent, type ChangeEvent } from "react";
import Button from "../../commons/Button";
import type { HarvestSessionRegister } from "../../../types";
import { useDestinations } from "../../../hooks/destination/useDestinations";

const RegisterEditModal: FC<{
    register: HarvestSessionRegister;
    onClose: () => void;
    onRegisterUpdate: (oldRegister: HarvestSessionRegister, updatedData: Partial<HarvestSessionRegister>) => void;
}> = ({ register, onClose, onRegisterUpdate }) => {

    // 2. TRAEMOS LOS DESTINOS DISPONIBLES
    const { destinations, loading: loadingDestinations } = useDestinations();

    // 3. ADAPTAMOS EL ESTADO INICIAL
    const [formData, setFormData] = useState({
        kg: register.weight_kg.toString(),
        humidity: register.humidity?.toString() || '',
        license_plate: register.license_plate || '',
        driver: register.driver || '',
        selectedDestination: register.destination || null, // <-- Guardamos el objeto
        silobag_name: register.silobag_name || '',
        details: register.details || ''
    });

    // ... (tu handleChange para inputs de texto está bien)

    // Un handler para el nuevo select de destinos
    const handleSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
        const { value } = e.target;
        const selectedObject = destinations?.find(item => item.id === value) || null;
        setFormData(prev => ({ ...prev, selectedDestination: selectedObject }));
    };

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

        const updatedRecordData: Partial<HarvestSessionRegister> = {
            weight_kg: parseFloat(formData.kg) || 0,
            humidity: parseFloat(formData.humidity) || 0,
            details: formData.details,
            ...(register.type === 'truck' && {
                license_plate: formData.license_plate,
                driver: formData.driver,
                destination: formData.selectedDestination ? { id: formData.selectedDestination.id, name: formData.selectedDestination.name } : null
            }),
            ...(register.type === 'silo_bag' && {
                silobag_name: formData.silobag_name
            })
        };

        onClose(); // Cierre optimista de la UI
        onRegisterUpdate(register, updatedRecordData);
    };

    if (loadingDestinations) {
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
            <div className="bg-white rounded-xl shadow-lg w-full max-w-lg">
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <h2 className="text-2xl font-bold text-gray-800">Editar Registro</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label>Kilos</label><input name="kg" value={formData.kg} onChange={handleChange} type="number" step="0.01" required className="w-full mt-1 p-2 border rounded-lg" /></div>
                        <div><label>Humedad</label><input name="humidity" value={formData.humidity} onChange={handleChange} type="number" step="0.01" className="w-full mt-1 p-2 border rounded-lg" /></div>
                    </div>

                    {register.type === 'truck' && (<>
                        <div className="grid grid-cols-2 gap-4">
                            <div><label>Chofer</label><input name="driver" value={formData.driver} onChange={handleChange} type="text" className="w-full mt-1 p-2 border rounded-lg" /></div>
                            <div><label>Patente</label><input name="license_plate" value={formData.license_plate} onChange={handleChange} type="text" className="w-full mt-1 p-2 border rounded-lg" /></div>
                        </div>
                        <div>
                            <label>Destino</label>
                            <select
                                name="destination"
                                value={formData.selectedDestination?.id || ''}
                                onChange={handleSelectChange}
                                className="w-full mt-1 p-2 border rounded-lg"
                            >
                                <option value="">{loadingDestinations ? "Cargando..." : "Seleccione"}</option>
                                {destinations?.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                            </select>
                        </div>
                    </>)}

                    {register.type === 'silo_bag' && (<div><label>ID Silobolsa</label><input name="silobag_name" value={formData.silobag_name} onChange={handleChange} type="text" className="w-full mt-1 p-2 border rounded-lg" /></div>)}

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

export default RegisterEditModal;