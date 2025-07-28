import { type FC, useState, type FormEvent, type ChangeEvent } from "react";
import useData from "../../context/DataContext";
import { updateHarvestPlot } from "../../services/harvestPlot";

// Importa tus componentes
import Button from "../ui/Button";
import type { HarvestPlot, HarvestPlotsWithDetails } from "../../types";

// ✅ 1. Extraemos la configuración fuera del componente para mayor limpieza.
const FIELD_CONFIG = {
    crop: { label: 'Cultivo', defaultValue: (plot: HarvestPlot) => plot.crop_id },
    manager: { label: 'Responsable', defaultValue: (plot: HarvestPlot) => plot.harvest_manager || '' },
    harvester: { label: 'Cosechero', defaultValue: (plot: HarvestPlot) => plot.harvester || '' }
};

const PlotEditModal: FC<{ plot: HarvestPlotsWithDetails; fieldToEdit: 'crop' | 'manager' | 'harvester'; onClose: () => void; }> = ({ plot, fieldToEdit, onClose }) => {
    const { crops } = useData();

    // ✅ 2. Usamos un solo estado para el valor del campo, inicializado dinámicamente.
    const [value, setValue] = useState(() => FIELD_CONFIG[fieldToEdit].defaultValue(plot));

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        onClose(); // Cierre optimista

        // ✅ 3. Llamamos al servicio con los datos necesarios.
        updateHarvestPlot(plot.id, fieldToEdit, value)
            .catch(err => {
                console.error(`Error al actualizar ${fieldToEdit}:`, err);
            });
    };

    const titleLabel = FIELD_CONFIG[fieldToEdit].label;

    return (
        // Mantenemos tu estructura JSX original
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <h3 className="text-xl font-bold text-gray-800">Editar {titleLabel}</h3>

                    {/* ✅ 4. La lógica de renderizado ahora usa el estado 'value' */}
                    {fieldToEdit === 'crop' ? (
                        <select
                            name="newValue"
                            value={value}
                            onChange={(e: ChangeEvent<HTMLSelectElement>) => setValue(e.target.value)}
                            className="w-full mt-1 p-2 border rounded-lg"
                        >
                            {crops.map(c => <option key={c.id} value={c.id}>{c.name} {c.type}</option>)}
                        </select>
                    ) : (
                        <input
                            name="newValue"
                            type="text"
                            value={value}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => setValue(e.target.value)}
                            className="w-full mt-1 p-2 border rounded-lg"
                        />
                    )}

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