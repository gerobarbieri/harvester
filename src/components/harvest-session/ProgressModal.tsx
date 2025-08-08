import { useState, type FC, type FormEvent } from "react";
import type { HarvestSession } from "../../types";
import Button from "../commons/Button";
import { updateHarvestSessionProgress } from "../../services/harvestSession";

const STATUS = [{ value: 'pending', text: "Pendiente" }, { value: 'in-progress', text: 'En progreso' }, { value: 'finished', text: "Finalizado" }];

const HarvestSessionProgressModal: FC<{ harvestSession: HarvestSession; onClose: () => void; }> = ({ harvestSession, onClose }) => {
    const [status, setStatus] = useState(harvestSession.status);
    const [harvestedHectares, setHarvestedHectares] = useState(harvestSession.harvested_hectares?.toString());

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        onClose();
        updateHarvestSessionProgress(harvestSession.id, status, parseFloat(harvestedHectares));
    };

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <h3 className="text-xl font-bold text-gray-800">Actualizar Progreso</h3>
                    <div>
                        <label htmlFor="status" className="font-semibold text-gray-700">Estado</label>
                        <select name="status" value={status} onChange={e => setStatus(e.target.value as HarvestSession['status'])} id="status" defaultValue={harvestSession.status} required className="w-full mt-1 p-2 border rounded-lg">
                            {STATUS.map((status) => (<option key={status.value} value={status.value}>{status.text}</option>))}

                        </select>
                    </div>
                    <div>
                        <label htmlFor="harvestedHectares" className="font-semibold text-gray-700">Hectáreas Cosechadas</label>
                        <input name="harvestedHectares" value={harvestedHectares} onChange={e => setHarvestedHectares(e.target.value)} id="harvestedHectares" type="number" step="0.01" defaultValue={harvestSession.harvested_hectares || 0} max={harvestSession.hectares} required className="w-full mt-1 p-2 border rounded-lg" />
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

export default HarvestSessionProgressModal;