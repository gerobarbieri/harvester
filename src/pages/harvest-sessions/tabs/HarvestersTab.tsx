import { Edit, Tractor } from "lucide-react";
import { type FC, useState } from "react";
import { useOutletContext } from "react-router";
import Button from "../../../components/commons/Button";
import Card from "../../../components/commons/Card";
import ManageHarvestersModal from "../../../components/harvest-session/modals/harvesters/ManageHarvestersModal";
import { upsertHarvesters } from "../../../services/harvestSession";

const HarvestersTab: FC = () => {
    const { harvestSession } = useOutletContext<any>();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleEditSubmit = async (data: any) => {
        setIsSubmitting(true);
        try {
            const updatedHarvesters = data.harvesters.map(h => ({
                id: h.id,
                name: h.name,
                plot_map: h.plot_map || false,
                harvested_hectares: parseFloat(h.harvested_hectares) || 0
            }));
            upsertHarvesters(harvestSession.id, updatedHarvesters)
            setIsEditModalOpen(false);
        } catch (error) {
            console.error("Error al editar cosecheros:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            {isEditModalOpen && (
                <ManageHarvestersModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    onSubmit={handleEditSubmit}
                    isSubmitting={isSubmitting}
                    harvestSession={harvestSession}
                />
            )}
            <Card>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-gray-800">Cosecheros Asignados</h3>
                    <Button variant="ghost" icon={Edit} aria-label="Editar Cosecheros" onClick={() => setIsEditModalOpen(true)} />
                </div>
                <div className="space-y-4">
                    {harvestSession.harvesters && harvestSession.harvesters.length > 0 ? (
                        harvestSession.harvesters.map((h: any, i: number) => {
                            const progress = h.harvested_hectares && harvestSession.harvested_hectares > 0
                                ? (h.harvested_hectares / harvestSession.harvested_hectares) * 100
                                : 0;
                            return (
                                <div key={h.id || i} className="bg-gray-50 p-4 rounded-xl">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-primary-light p-3 rounded-full">
                                            <Tractor size={20} className="text-primary-dark" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-baseline">
                                                <p className="font-semibold text-gray-900">{h.name}</p>
                                                <span className="text-sm font-bold text-gray-800">{h.harvested_hectares || 0} ha</span>
                                            </div>
                                            <p className="text-sm text-gray-500">
                                                {h.plot_map ? 'Con mapeo' : 'Sin mapeo'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="mt-3 h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                                        <div style={{ width: `${progress}%` }} className="h-full bg-primary rounded-full"></div>
                                    </div>
                                </div>
                            )
                        })
                    ) : (
                        <div className="text-center py-4 text-gray-500">
                            <p>No hay cosecheros asignados a este lote.</p>
                        </div>
                    )}
                </div>
            </Card>
        </>
    );
};

export default HarvestersTab;