import { type FC } from "react";
// CORRECCIÓN: El import correcto es de 'react-router-dom'
import { Link } from "react-router";
import type { HarvestSession } from "../../types";
import HarvestPlotCardHeader from "./CardHeader";
import HarvestPlotCardProgressBar from "./CardProgressBar";
import HarvestPlotCardEditableField from "./CardEditableField";

// CORRECCIÓN: Actualizamos el config para que coincida con nuestro nuevo modelo de datos
const EDITABLE_FIELDS_CONFIG = {
    crop: {
        text: 'Cultivo',
        // Accedemos al nombre dentro del objeto 'crop'
        displayValue: (harvestSession: HarvestSession) => harvestSession.crop?.name || '-'
    },
    harvest_manager: {
        text: 'Responsable',
        // Accedemos al nombre del manager y usamos optional chaining (?) por si no está asignado
        displayValue: (harvestSession: HarvestSession) => harvestSession.harvest_manager?.name || '-'
    },
    harvesters: {
        text: 'Cosecheros',
        // Mapeamos el array de harvesters y unimos los nombres con una coma
        displayValue: (harvestSession: HarvestSession) =>
            harvestSession.harvesters?.map(h => h.name).join(' - ') || '-'
    }
};

interface PlotCardProps {
    harvestSession: HarvestSession;
    onEditClick: (session: HarvestSession, field: string) => void;
    onProgressClick: (session: HarvestSession) => void;
}

const HarvestSessionCard: FC<PlotCardProps> = ({ harvestSession, onEditClick, onProgressClick }) => {
    const progress = harvestSession.hectares > 0 ? ((harvestSession.harvested_hectares || 0) / harvestSession.hectares) * 100 : 0;
    const editableFields = Object.keys(EDITABLE_FIELDS_CONFIG);

    const handleEdit = (e: React.MouseEvent, field: string) => {
        e.preventDefault();
        e.stopPropagation();
        onEditClick(harvestSession, field);
    };

    const handleProgress = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onProgressClick(harvestSession);
    };

    return (
        <Link to={`/campaigns/${harvestSession.campaign.id}/fields/${harvestSession.field.id}/harvest-sessions/${harvestSession.id}`} className="block mt-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200/80 transition-shadow hover:shadow-md">

                <HarvestPlotCardHeader plotName={harvestSession.plot.name} status={harvestSession.status} />

                <div className="grid grid-cols-3 gap-x-6 mb-4 text-sm">
                    {editableFields.map((fieldKey) => {
                        const fieldConfig = EDITABLE_FIELDS_CONFIG[fieldKey];
                        // CORRECCIÓN: Una lógica más clara para saber si la cosecha ya empezó
                        const harvestHasStarted = harvestSession.status !== 'pending';
                        const canEdit = fieldKey !== 'crop' || !harvestHasStarted;

                        return (
                            <HarvestPlotCardEditableField
                                key={fieldKey}
                                label={fieldConfig.text}
                                value={fieldConfig.displayValue(harvestSession)}
                                canEdit={canEdit}
                                onEdit={(e) => handleEdit(e, fieldKey)}
                            />
                        );
                    })}
                </div>

                <HarvestPlotCardProgressBar
                    progress={progress}
                    harvestedHectares={harvestSession.harvested_hectares}
                    totalHectares={harvestSession.hectares}
                    onProgressClick={handleProgress}
                />

            </div>
        </Link>
    );
};

export default HarvestSessionCard;