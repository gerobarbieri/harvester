import { type FC } from "react";

interface PlotProgressBarProps {
    progress: number;
    harvestedHectares: number;
    totalHectares: number;
    onProgressClick: (e: React.MouseEvent) => void;
}

const HarvestPlotCardProgressBar: FC<PlotProgressBarProps> = ({ progress, harvestedHectares, totalHectares, onProgressClick }) => {
    return (
        <div className="mt-4">
            <div className="flex justify-between items-center text-sm text-gray-600 mb-1">
                <span>Progreso</span>
                <span>{harvestedHectares || 0} de {totalHectares} ha</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-green-800 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200 flex justify-end">
                <button
                    onClick={onProgressClick}
                    className="text-sm font-semibold text-[#2A6449] hover:text-[#1c4b35] py-2 px-4 rounded-lg hover:bg-green-200/50 transition-colors"
                >
                    Actualizar Avance
                </button>
            </div>
        </div>
    );
};

export default HarvestPlotCardProgressBar;