import { useState } from "react";
import { useParams } from "react-router";
import { useFilteredHarvestPlots } from '../../../hooks/harvestPlot/useFilteredHarvestPlots';

// Importa los componentes atomizados
import PlotListHeader from "../HarvestPlotListHeader";
import PlotFilters from "../HarvestPlotFilters"
import PlotCard from "../HarvestPlotCard";

// Importa los modales
import PlotHarvestModal from "../HarvestPlotAddModal";
import HarvestPlotProgressModal from "../HarvestPlotProgressModal";
import PlotEditModal from "../HarvestPlotEditModal";

const PlotList = () => {
    const { campaignId, fieldId } = useParams();

    const [filterStatus, setFilterStatus] = useState('Todos');
    const [filterCrop, setFilterCrop] = useState('Todos');
    const [modalPlot, setModalPlot] = useState(null);
    const [harvestModalOpen, setHarvestModalOpen] = useState(false);
    const [editingField, setEditingField] = useState(null);
    const { field, harvestPlotsInField, availablePlots, cropNames, finalFilteredPlots } = useFilteredHarvestPlots(campaignId, fieldId, filterStatus, filterCrop, setFilterCrop);
    if (!field) return <p>Cargando...</p>;

    return (
        <>
            {/* Renderizado de Modales */}
            {harvestModalOpen && <PlotHarvestModal campaignId={campaignId} availablePlots={availablePlots} fieldId={field.id} onClose={() => setHarvestModalOpen(false)} />}
            {modalPlot && <HarvestPlotProgressModal harvestPlot={modalPlot} onClose={() => setModalPlot(null)} />}
            {editingField && <PlotEditModal plot={editingField.plot} fieldToEdit={editingField.field} onClose={() => setEditingField(null)} />}

            {/* Componentes de UI */}
            <PlotListHeader
                campaignId={campaignId}
                field={field}
                showHarvestButton={availablePlots.length > 0}
                onHarvestClick={() => setHarvestModalOpen(true)}
            />

            {harvestPlotsInField.length > 0 && (
                <PlotFilters
                    activeStatus={filterStatus}
                    onStatusChange={setFilterStatus}
                    cropNames={cropNames}
                    activeCrop={filterCrop}
                    onCropChange={setFilterCrop}
                />
            )}

            {finalFilteredPlots.length > 0 ? (
                finalFilteredPlots.map(harvestPlot => (
                    <PlotCard
                        key={harvestPlot.id}
                        harvestPlot={harvestPlot}
                        onEditClick={(p, f) => setEditingField({ plot: p, field: f })}
                        onProgressClick={setModalPlot}
                    />
                ))
            ) : (
                <div className="flex justify-center items-center mb-2 mt-8">
                    <h3 className="text-xl font-bold text-[#2A6449]">No se encontraron lotes para los filtros seleccionados.</h3>
                </div>
            )}
        </>
    );
};

export default PlotList;