import { type FC, useState, type FormEvent, type ChangeEvent } from "react";
import { updateHarvestSession } from "../../services/harvestSession";

// Componentes y Tipos
import Button from "../commons/Button";
import TagSelect from "../commons/TagSelect";
import type { HarvestSession } from "../../types";

// Hooks para traer los datos maestros
import { useCrops } from "../../hooks/crop/useCrops";
import { useHarvesters } from "../../hooks/harvester/useHarvesters";
import { useHarvestManagers } from "../../hooks/harvest-manager/useHarvestManagers";

const PlotEditModal: FC<{
    harvestSession: HarvestSession;
    fieldToEdit: 'crop' | 'harvest_manager' | 'harvesters'; // Actualizado para reflejar el modelo
    onClose: () => void;
}> = ({ harvestSession, fieldToEdit, onClose }) => {
    console.log(harvestSession)
    // --- 1. Traemos los datos para los selectores ---
    const { crops, loading: loadingCrops } = useCrops();
    const { harvesters, loading: loadingHarvesters } = useHarvesters();
    const { harvestManagers, loading: loadingManagers } = useHarvestManagers();

    // --- 2. El estado ahora puede guardar cualquier tipo de valor ---
    const [value, setValue] = useState<any>(() => harvestSession[fieldToEdit]);

    // Unimos todos los estados de carga
    const isLoading = loadingCrops || loadingHarvesters || loadingManagers;

    // --- 3. El handleSubmit ahora es más simple ---
    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        onClose();
        // El 'value' ya tiene el formato correcto (objeto o array de objetos)
        updateHarvestSession(harvestSession.id, fieldToEdit, value)
            .catch(err => console.error(`Error al actualizar ${fieldToEdit}:`, err));
    };

    // --- 4. Lógica para renderizar el input correcto ---
    const renderInput = () => {
        switch (fieldToEdit) {
            case 'crop':
                return (
                    <select
                        value={value?.id || ''} // Usamos el ID del objeto guardado
                        onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                            const selectedCrop = crops?.find(c => c.id === e.target.value);
                            setValue(selectedCrop);
                        }}
                        className="w-full mt-1 p-2 border rounded-lg"
                    >
                        <option value="">Seleccione un cultivo</option>
                        {crops?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                );
            case 'harvest_manager':
                return (
                    <select
                        value={value?.id || ''}
                        onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                            const selectedManager = harvestManagers?.find(m => m.id === e.target.value);
                            setValue(selectedManager);
                        }}
                        className="w-full mt-1 p-2 border rounded-lg"
                    >
                        <option value="">Seleccione un responsable</option>
                        {harvestManagers?.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                    </select>
                );
            case 'harvesters':
                return (
                    <TagSelect
                        label="" // El título del modal ya actúa como label
                        options={harvesters || []}
                        selectedItems={value || []}
                        onSelectionChange={(newSelection) => setValue(newSelection)}
                        placeholder="Seleccionar cosechadores..."
                    />
                );
            default:
                return null;
        }
    };

    // El título se puede simplificar
    const titleMap = { crop: 'Cultivo', harvest_manager: 'Responsable', harvesters: 'Cosecheros' };
    const titleLabel = titleMap[fieldToEdit];

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <h3 className="text-xl font-bold text-gray-800">Editar {titleLabel}</h3>

                    {isLoading ? <p>Cargando opciones...</p> : renderInput()}

                    <div className="pt-4 flex gap-4">
                        <Button type="button" onClick={onClose} variant="secondary">Cancelar</Button>
                        <Button type="submit">Guardar</Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PlotEditModal;