import { type FC } from "react";

const STATUS_FILTERS = ['Todos', 'Pendientes', 'En Progreso', 'Finalizados'];

interface PlotFiltersProps {
    activeStatus: string;
    onStatusChange: (status: string) => void;
    cropNames: string[];
    activeCrop: string;
    onCropChange: (crop: string) => void;
}

const PlotFilters: FC<PlotFiltersProps> = ({ activeStatus, onStatusChange, cropNames, activeCrop, onCropChange }) => (
    <>
        <div className="p-2 bg-gray-200/50 rounded-lg flex items-center gap-1 sm:gap-2">
            {STATUS_FILTERS.map(status => (
                <button
                    key={status}
                    onClick={() => onStatusChange(status)}
                    className={`sm:flex-1 text-center px-4 py-2 text-xs sm:text-sm font-semibold rounded-md transition-colors whitespace-nowrap ${activeStatus === status ? 'bg-white text-[#2A6449] shadow-sm' : 'text-gray-600 hover:bg-gray-300/50'}`}
                >
                    {status}
                </button>
            ))}
        </div>
        {cropNames.length > 1 && (
            <div className="flex space-x-2 mt-5 overflow-x-auto pb-2">
                {cropNames.map(name => (
                    <button
                        key={name}
                        onClick={() => onCropChange(name)}
                        className={`flex-shrink-0 px-4 py-2 text-sm font-semibold rounded-md transition-colors ${activeCrop === name ? 'bg-white text-[#2A6449] shadow-sm' : 'bg-gray-200/50 text-gray-600 hover:bg-gray-300/50'}`}
                    >
                        {name}
                    </button>
                ))}
            </div>
        )}
    </>
);

export default PlotFilters;