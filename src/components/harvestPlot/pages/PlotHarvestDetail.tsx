import { type FC, useState } from "react";
import { useHarvestPlotDetails } from "../../../hooks/harvestPlot/useHarvestPlotDetails";
import { exportToCsv, exportToXlsx } from "../../../services/export";
import { deleteRecordAndUpdateHarvestPlot } from "../../../services/harvestPlotRecord";

// Importa tus componentes de UI atomizados
import PlotDetailHeader from "../HarvestPlotDetailHeader";
import PlotSummary from '../HarvestPlotSummary';
import RecordsTable from "../harvestPlotRecord/HarvestPlotRecordsTable";
import Button from "../../ui/Button";

// Importa los modales
import EditRecordModal from "../harvestPlotRecord/HarvestPlotRecordEditModal";
import RecordFormModal from "../harvestPlotRecord/HarvestPlotRecordAddModal";
import RecordDeleteModal from "../harvestPlotRecord/HarvestPlotRecordDeleteModal";
import useData from "../../../context/DataContext";
import { useParams } from "react-router";

const PlotDetail: FC = () => {
    // 1. Obtenemos toda la lógica y datos del custom hook
    const { harvestPlotId } = useParams();
    const { harvestPlot, harvestPlotRecords, yieldData, isLoading } = useHarvestPlotDetails(harvestPlotId);
    const { campaigns, fields } = useData();

    // 2. El estado de los modales sigue siendo responsabilidad de esta vista
    const [editingRecord, setEditingRecord] = useState(null);
    const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
    const [recordToDelete, setRecordToDelete] = useState(null);

    // 3. Los handlers ahora son simples llamadas a los servicios
    const handleExport = (format: string) => {
        if (!harvestPlot) return;
        const campaign = campaigns.find(c => c.id === harvestPlot.campaign_id);
        const field = fields.find(f => f.id === harvestPlot.field_id);

        if (format === 'csv') {
            exportToCsv(harvestPlot, harvestPlotRecords, yieldData, campaign, field);
        } else {
            exportToXlsx(harvestPlot, harvestPlotRecords, yieldData, campaign, field);
        }
    };

    const handleDeleteConfirm = () => {
        setRecordToDelete(null);
        deleteRecordAndUpdateHarvestPlot(recordToDelete, harvestPlotId)
            .catch(error => {
                console.error("Error al eliminar el registro:", error);
            });
    };

    if (isLoading) return <p>Cargando lote...</p>;

    return (
        <>
            {/* Renderizado de Modales */}
            {recordToDelete && <RecordDeleteModal record={recordToDelete} onConfirm={handleDeleteConfirm} onCancel={() => setRecordToDelete(null)} />}
            {isRecordModalOpen && <RecordFormModal harvestPlotId={harvestPlot.id} onClose={() => setIsRecordModalOpen(false)} />}
            {editingRecord && <EditRecordModal record={editingRecord} harvestPlot={harvestPlot} onClose={() => setEditingRecord(null)} />}

            {/* Componentes de UI Atómicos */}
            <PlotDetailHeader harvestPlot={harvestPlot} onExport={handleExport} />
            <PlotSummary harvestPlot={harvestPlot} yieldData={yieldData} />

            {harvestPlot.status !== 'finished' && (
                <div className="mt-6">
                    <Button onClick={() => setIsRecordModalOpen(true)}>+ Añadir Registro</Button>
                </div>
            )}

            <RecordsTable
                records={harvestPlotRecords}
                onEditRecord={setEditingRecord}
                onDeleteRecord={setRecordToDelete}
            />
        </>
    );
};

export default PlotDetail;
