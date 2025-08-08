import { type FC } from "react";
import type { HarvestStatus } from "../../types";

const getStatusInfo = (status: HarvestStatus) => {
    switch (status) {
        case 'in-progress': return { text: 'En Progreso', color: 'bg-blue-500' };
        case 'finished': return { text: 'Finalizado', color: 'bg-green-800' };
        default: return { text: 'Pendiente', color: 'bg-yellow-400' };
    }
};

interface PlotCardHeaderProps {
    plotName: string;
    status: 'pending' | 'in-progress' | 'finished';
}

const HarvestPlotCardHeader: FC<PlotCardHeaderProps> = ({ plotName, status }) => {
    const statusInfo = getStatusInfo(status);

    return (
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-[#2A6449]">Lote {plotName}</h3>
            <span className={`text-xs font-semibold text-white px-2 py-1 rounded-full ${statusInfo.color}`}>
                {statusInfo.text}
            </span>
        </div>
    );
};

export default HarvestPlotCardHeader;