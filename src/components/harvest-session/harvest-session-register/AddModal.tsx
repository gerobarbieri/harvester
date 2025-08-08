import { type FC, useState, type FormEvent, type ChangeEvent } from "react";
import Button from "../../commons/Button";
import type { Destination, HarvestSessionRegister } from "../../../types";
import useAuth from "../../../context/auth/AuthContext";
import { useDestinations } from "../../../hooks/destination/useDestinations";

interface RegisterAddModalProps {
    onClose: () => void;
    onRegisterAdd: (newRegister: Partial<HarvestSessionRegister>) => void;
}

const RegisterAddModal: FC<RegisterAddModalProps> = ({ onClose, onRegisterAdd }) => {

    const { currentUser } = useAuth();
    const { destinations, loading: loadingDestinations } = useDestinations();
    const [type, setType] = useState<HarvestSessionRegister['type']>('truck');
    const [formData, setFormData] = useState({
        kg: '',
        humidity: '',
        details: '',
        licensePlate: '',
        driver: '',
        selectedDestination: null as Destination | null,
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

    const handleSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;

        const dataMap = {
            destinationId: destinations
        };

        const stateKeyMap: Record<string, keyof typeof formData> = {
            destinationId: 'selectedDestination',
        };

        const selectedObject = dataMap[name as keyof typeof dataMap]?.find(item => item.id === value) || null;
        setFormData(prev => ({ ...prev, [stateKeyMap[name]]: selectedObject }));
    };

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const newRecordData: Partial<HarvestSessionRegister> = {
            organization_id: currentUser.organizationId,
            weight_kg: parseFloat(formData.kg) || 0,
            humidity: parseFloat(formData.humidity) || 0,
            details: formData.details,
            type,
            ...(type === 'truck' && {
                license_plate: formData.licensePlate,
                driver: formData.driver,
                destination: {
                    id: formData.selectedDestination.id,
                    name: formData.selectedDestination.name
                }
            }),
            ...(type === 'silo_bag' && {
                silobag_name: formData.silobagName
            })
        };

        onRegisterAdd(newRecordData);
        onClose();
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
                    <h2 className="text-2xl font-bold text-gray-800">Nuevo Registro</h2>
                    <div><label>Tipo</label><select name="type" value={type} onChange={e => setType(e.target.value as HarvestSessionRegister['type'])} className="w-full mt-1 p-2 border rounded-lg"><option value="truck">Camión</option><option value="silo_bag">Silobolsa</option></select></div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label>Kilos</label><input name="kg" value={formData.kg} onChange={handleChange} type="number" step="0.01" required placeholder="Kilos" className="w-full mt-1 p-2 border rounded-lg" /></div>
                        <div><label>Humedad</label><input name="humidity" value={formData.humidity} onChange={handleChange} type="number" step="0.01" placeholder="Humedad" className="w-full mt-1 p-2 border rounded-lg" /></div>
                    </div>
                    {type === 'truck' && (<>
                        <div className="grid grid-cols-2 gap-4">
                            <div><label>Chofer</label><input name="driver" value={formData.driver} onChange={handleChange} type="text" placeholder="Nombre del chofer" className="w-full mt-1 p-2 border rounded-lg" /></div>
                            <div><label>Patente</label><input name="licensePlate" value={formData.licensePlate} onChange={handleChange} type="text" placeholder="Patente del camión" className="w-full mt-1 p-2 border rounded-lg" /></div>
                        </div>
                        <div><label>Destino</label>
                            <select name="destinationId" id="destionationId" value={formData.selectedDestination?.id || ''} onChange={handleSelectChange} required className="w-full mt-1 p-2 border rounded-lg">
                                <option value="">{loadingDestinations ? "Cargando..." : "Seleccione"}</option>
                                {destinations.length > 0 ? destinations.map(d => <option key={d.id} value={d.id}>{d.name}</option>) : <option disabled>No hay Destinos</option>}
                            </select>
                        </div>
                    </>)}
                    {type === 'silo_bag' && (<div><label>ID Silobolsa</label><input name="silobagName" value={formData.silobagName} onChange={handleChange} type="text" placeholder="ID o nombre del silobolsa" className="w-full mt-1 p-2 border rounded-lg" /></div>)}
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
export default RegisterAddModal;