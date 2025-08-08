import { useState } from "react";
import { useParams } from "react-router";

// Importa los componentes atomizados
import HarvestSessionsHeader from "../../components/harvest-session/ListHeader";
import HarvestSessionFilters from "../../components/harvest-session/Filters"
import HarvestSessionCard from "../../components/harvest-session/Card";

// Importa los modales
import HarvestSessionProgressModal from "../../components/harvest-session/ProgressModal";
import PlotEditModal from "../../components/harvest-session/EditModal";
import { useHarvestSessions } from "../../hooks/harvest-session/useHarvestSessions";
import HarvestSessionModal from "../../components/harvest-session/AddModal";
import { useHarvestSessionFilters } from "../../hooks/harvest-session/useHarvestSessionsFilters";
import { useField } from "../../hooks/field/useField";

const PlotList = () => {
    const { campaignId, fieldId } = useParams();
    const { harvestSessions, loading } = useHarvestSessions(campaignId, fieldId);
    const { field, loading: fieldLoading } = useField(fieldId);
    const [harvestSession, setHarvestSession] = useState(null);
    const [harvestModalOpen, setHarvestModalOpen] = useState(false);
    const [editingProp, setEditingProp] = useState(null);
    const { cropNames, filterCrop, filterStatus, filteredSessions, setFilterCrop, setFilterStatus } = useHarvestSessionFilters(harvestSessions);

    if (loading || !harvestSessions || fieldLoading) return <p>Cargando...</p>;


    return (
        <>
            {/* Renderizado de Modales */}
            {harvestModalOpen && <HarvestSessionModal campaignId={campaignId} fieldId={fieldId} onClose={() => setHarvestModalOpen(false)} />}
            {harvestSession && <HarvestSessionProgressModal harvestSession={harvestSession} onClose={() => setHarvestSession(null)} />}
            {editingProp && <PlotEditModal harvestSession={editingProp.harvestSession} fieldToEdit={editingProp.field} onClose={() => setEditingProp(null)} />}

            {/* Componentes de UI */}
            <HarvestSessionsHeader
                field={field}
                campaignId={campaignId}
                onHarvestClick={() => setHarvestModalOpen(true)}
            />

            {harvestSessions.length > 0 && (
                <HarvestSessionFilters
                    activeStatus={filterStatus}
                    onStatusChange={setFilterStatus}
                    cropNames={cropNames}
                    activeCrop={filterCrop}
                    onCropChange={setFilterCrop}
                />
            )}

            {filteredSessions.length > 0 ?
                filteredSessions.map(harvestSession => (
                    <HarvestSessionCard
                        key={harvestSession.id}
                        harvestSession={harvestSession}
                        onEditClick={(hs, f) => setEditingProp({ harvestSession: hs, field: f })}
                        onProgressClick={setHarvestSession}
                    />)
                ) : (
                    <div className="flex justify-center items-center mb-2 mt-8">
                        <h3 className="text-xl font-bold text-[#2A6449]">No se encontraron lotes para los filtros seleccionados.</h3>
                    </div>
                )}

        </>
    );
};

export default PlotList;