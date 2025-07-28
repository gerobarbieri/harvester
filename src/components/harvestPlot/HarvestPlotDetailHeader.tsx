import { type FC } from "react";
import { Link } from "react-router";
import ExportDropdown from "../ui/ExportDropDown";
import type { HarvestPlotsWithDetails } from "../../types";

// Definimos las props que el componente espera recibir
interface PlotDetailHeaderProps {
    harvestPlot: HarvestPlotsWithDetails; // Deberías usar tu tipo específico aquí
    onExport: (format: 'csv' | 'xlsx') => void;
}

const PlotDetailHeader: FC<PlotDetailHeaderProps> = ({ harvestPlot, onExport }) => {
    return (
        <div className="mb-8">
            <Link
                to={`/campaigns/${harvestPlot.campaign_id}/fields/${harvestPlot.field_id}/plots`}
                className="text-[#2A6449] hover:underline font-semibold flex items-center gap-2 mb-4"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                Volver a Lotes
            </Link>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200/80">
                <div className="flex justify-between items-start pb-4 border-b border-gray-200">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Lote {harvestPlot.plotName}</h1>
                        <p className="text-lg text-gray-500 mt-1">{harvestPlot.cropName} {harvestPlot.cropType}</p>
                        <p className="text-md text-gray-500 mt-1">{harvestPlot.hectares} ha</p>
                    </div>
                    <ExportDropdown
                        onExportCsv={() => onExport('csv')}
                        onExportXlsx={() => onExport('xlsx')}
                    />
                </div>

                <div className="grid grid-cols-2 text-center text-sm pt-4">
                    <div>
                        <p className="text-gray-500">Responsable</p>
                        <p className="font-semibold text-gray-800">{harvestPlot.harvest_manager || '-'}</p>
                    </div>
                    <div>
                        <p className="text-gray-500">Cosechero</p>
                        <p className="font-semibold text-gray-800">{harvestPlot.harvester || '-'}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlotDetailHeader;