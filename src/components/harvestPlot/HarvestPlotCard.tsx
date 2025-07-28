import type { FC } from "react";
import { Link } from "react-router";
import { useHarvestPlotDetails } from "../../hooks/harvestPlot/useHarvestPlotDetails";
import type { HarvestPlotsWithDetails } from "../../types";
import HarvestPlotCardHeader from "./HarvestPlotCardHeader";
import HarvestPlotCardProgressBar from "./HarvestPlotCardProgressBar";
import HarvestPlotCardEditableField from "./HarvestPlotCardEditableField";

const EDITABLE_FIELDS_CONFIG = {
    crop: {
        text: 'Cultivo',
        displayValue: (plot: HarvestPlotsWithDetails) => `${plot.cropName} ${plot.cropType}`
    },
    manager: {
        text: 'Responsable',
        displayValue: (plot: HarvestPlotsWithDetails) => plot.harvest_manager || '-'
    },
    harvester: {
        text: 'Cosechero',
        displayValue: (plot: HarvestPlotsWithDetails) => plot.harvester || '-'
    }
};
interface PlotCardProps {
    harvestPlot: HarvestPlotsWithDetails;
    onEditClick: (plot: HarvestPlotsWithDetails, field: string) => void;
    onProgressClick: (plot: HarvestPlotsWithDetails) => void;
}

const PlotCard: FC<PlotCardProps> = ({ harvestPlot, onEditClick, onProgressClick }) => {
    // La lógica de datos se mantiene aquí
    const { harvestPlotRecords } = useHarvestPlotDetails(harvestPlot.id);
    const progress = harvestPlot.hectares > 0 ? ((harvestPlot.harvested_hectares || 0) / harvestPlot.hectares) * 100 : 0;
    const editableFields = Object.keys(EDITABLE_FIELDS_CONFIG);

    // Los handlers que detienen la propagación también se mantienen
    const handleEdit = (e: React.MouseEvent, field: string) => {
        e.preventDefault();
        e.stopPropagation();
        onEditClick(harvestPlot, field);
    };

    const handleProgress = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onProgressClick(harvestPlot);
    };

    return (
        <Link to={`/campaigns/${harvestPlot.campaign_id}/fields/${harvestPlot.field_id}/plots/${harvestPlot.id}`} className="block mt-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200/80 transition-shadow hover:shadow-md">

                <HarvestPlotCardHeader plotName={harvestPlot.plotName} status={harvestPlot.status} />

                <div className="grid grid-cols-3 gap-x-6 mb-4 text-sm">
                    {editableFields.map((fieldKey) => {
                        const fieldConfig = EDITABLE_FIELDS_CONFIG[fieldKey];
                        const harvestHasStarted = harvestPlotRecords.length > 0 || harvestPlot.harvested_hectares > 0;
                        const canEdit = fieldKey !== 'crop' || !harvestHasStarted;

                        return (
                            <HarvestPlotCardEditableField
                                key={fieldKey}
                                label={fieldConfig.text}
                                value={fieldConfig.displayValue(harvestPlot)}
                                canEdit={canEdit}
                                onEdit={(e) => handleEdit(e, fieldKey)}
                            />
                        );
                    })}
                </div>

                <HarvestPlotCardProgressBar
                    progress={progress}
                    harvestedHectares={harvestPlot.harvested_hectares}
                    totalHectares={harvestPlot.hectares}
                    onProgressClick={handleProgress}
                />

            </div>
        </Link>
    );
};

export default PlotCard;