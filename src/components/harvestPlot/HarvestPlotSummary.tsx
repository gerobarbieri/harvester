import { type FC } from "react";

interface PlotSummaryProps {
    harvestPlot: { harvested_kgs?: number };
    yieldData: { harvested: number; seed: number };
}

const PlotSummary: FC<PlotSummaryProps> = ({ harvestPlot, yieldData }) => {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200/80 mb-6">
            <h3 className="text-xl text-center font-bold text-gray-800">Resumen del Lote</h3>
            <div className="space-y-4 mt-4">
                <div className="text-center">
                    <p className="text-sm text-gray-600">Kg Totales</p>
                    <p className="text-3xl font-bold text-gray-800">
                        {(harvestPlot.harvested_kgs || 0).toLocaleString('es-AR')}
                        <span className="ml-1 text-lg font-medium text-gray-500">kg</span>
                    </p>
                </div>

                <div className="border-t border-gray-200 pt-4"></div>

                <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                        <p className="text-sm text-gray-600">Rinde has/Cosechado</p>
                        <p className="text-3xl font-bold text-gray-800">
                            {yieldData.harvested.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                            <span className="ml-1 text-base font-medium text-gray-500">kg/ha</span>
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Rinde has/Sembrado</p>
                        <p className="text-3xl font-bold text-gray-800">
                            {yieldData.seed.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                            <span className="ml-1 text-base font-medium text-gray-500">kg/ha</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlotSummary;