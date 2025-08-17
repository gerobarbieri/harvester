import type { FC } from "react";
import { useOutletContext } from "react-router";
import Card from "../../../components/commons/Card";
import YieldPerformanceCard from "../../../components/dashboards/reports/harvest-report/ui/YieldPerformanceCard";
import { formatNumber } from "../../../utils";

const SummaryTab: FC = () => {
    const { harvestSession } = useOutletContext<any>();

    const totalKg = harvestSession.total_kgs || harvestSession.harvested_kgs || 0;
    const harvestedYield = harvestSession.yields?.harvested || 0;
    const sownYield = harvestSession.yields?.sown || 0;
    const estimatedYield = harvestSession.estimated_yield;

    return (
        <div className="space-y-6">
            <Card>
                <h3 className="text-lg font-bold text-center text-text-primary">Resumen del Lote</h3>
                <div className="text-center my-2">
                    <p className="text-sm text-text-secondary">Kg Totales</p>
                    <p className="text-4xl font-bold text-primary-dark">
                        {formatNumber(totalKg)}
                    </p>
                </div>
                <div className="grid grid-cols-2 gap-6 text-center my-6 py-6 border-t border-b border-gray-100">
                    <div>
                        <p className="text-sm text-text-secondary">Rinde ha/Cosechado</p>
                        <p className="text-2xl font-bold text-text-primary">
                            {formatNumber(harvestedYield)}
                            <span className="text-lg font-normal text-gray-400"> kg/ha</span>
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-text-secondary">Rinde ha/Sembrado</p>
                        <p className="text-2xl font-bold text-text-primary">
                            {formatNumber(sownYield)}
                            <span className="text-lg font-normal text-gray-400"> kg/ha</span>
                        </p>
                    </div>
                </div>
                <YieldPerformanceCard
                    realYield={harvestedYield}
                    estimatedYield={estimatedYield}
                    realVsProjected={harvestSession.yields.real_vs_projected}
                />
            </Card>
        </div>
    );
};

export default SummaryTab;