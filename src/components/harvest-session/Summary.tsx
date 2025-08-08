import { type FC } from "react";
import type { HarvestSession } from "../../types";

interface PlotSummaryProps {
    session: HarvestSession
}

const PlotSummary: FC<PlotSummaryProps> = ({ session }) => {
    const yieldDifference = session.yields?.real_vs_projected || 0;

    let colorClass = 'text-gray-800';
    if (yieldDifference > 0) colorClass = 'text-green-600';
    else if (yieldDifference < 0) colorClass = 'text-red-600';

    const formattedYield = yieldDifference.toLocaleString('es-AR', { maximumFractionDigits: 0 });
    const displayValue = yieldDifference > 0 ? `+${formattedYield}` : formattedYield;

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200/80 mb-6">
            <h3 className="text-xl text-center font-bold text-gray-800">Resumen del Lote</h3>
            <div className="space-y-4 mt-4">
                <div className="text-center">
                    <p className="text-sm text-gray-600">Kg Totales</p>
                    <p className="text-3xl font-bold text-gray-800">
                        {(session.harvested_kgs || 0).toLocaleString('es-AR')}
                        <span className="ml-1 text-lg font-medium text-gray-500">kg</span>
                    </p>
                </div>

                <div className="border-t border-gray-200 pt-4"></div>

                <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                        <p className="text-sm text-gray-600">Rinde has/Cosechado</p>
                        <p className="text-3xl font-bold text-gray-800">
                            {session.yields?.harvested.toLocaleString('es-AR', { maximumFractionDigits: 0 }) || 0}
                            <span className="ml-1 text-base font-medium text-gray-500">kg/ha</span>
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Rinde has/Sembrado</p>
                        <p className="text-3xl font-bold text-gray-800">
                            {session.yields?.seed.toLocaleString('es-AR', { maximumFractionDigits: 0 }) || 0}
                            <span className="ml-1 text-base font-medium text-gray-500">kg/ha</span>
                        </p>
                    </div>

                    <div>
                        <p className="text-sm text-gray-600">Rinde Real vs Estimado</p>
                        <p className={`text-3xl font-bold ${colorClass} transition-colors duration-300`}>
                            {session.harvested_kgs > 0 ? (
                                <>
                                    {displayValue}
                                    <span className={`ml-2 text-base font-medium ${colorClass}`}>
                                        kg/ha
                                    </span>
                                </>
                            ) : (
                                '-'
                            )}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlotSummary;