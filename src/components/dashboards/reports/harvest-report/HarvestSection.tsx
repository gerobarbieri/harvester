import type { FC } from "react";
import HarvestProgressCard from "./ui/HarvestProgressCard";
import HarvestStatsCards from "./ui/HarvestStatsCard";
import { useOutletContext } from "react-router";
import Card from "../../../commons/Card";
import { BarChart3 } from "lucide-react";
import YieldPerformanceCard from "./ui/YieldPerformanceCard";

const HarvestSection: FC = () => {
    const { analytics } = useOutletContext<any>();

    if (!analytics.harvestSummary) {
        return (
            <Card className="p-6 text-center animate-fade-in">
                <div className="flex flex-col items-center justify-center h-full text-gray-500 py-8">
                    <BarChart3 className="h-12 w-12 mb-4 text-gray-400" />
                    <h3 className="font-semibold text-lg text-gray-700">Sin Datos de Cosecha</h3>
                    <p className="mt-2 max-w-sm mx-auto">No se encontraron datos de cosecha para mostrar en este momento.</p>
                </div>
            </Card>
        );
    }

    return (
        <div className="space-y-4 lg:space-y-6 animate-fade-in">
            <HarvestStatsCards
                totalHarvestedKgs={analytics.harvestSummary.total_kgs}
                yieldPerSown={analytics.harvestSummary.yield_per_sown_hectare}
                yieldPerHarvested={analytics.harvestSummary.yield_per_harvested_hectare}
            />
            <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
                <HarvestProgressCard
                    harvestedHectares={analytics.harvestSummary.total_harvested_hectares}
                    hectares={analytics.harvestSummary.total_hectares}
                />
                <YieldPerformanceCard
                    realVsProjected={analytics.harvestSummary.yield_real_vs_projected}
                    realYield={analytics.harvestSummary.yield_per_harvested_hectare}
                    estimatedYield={analytics.harvestSummary.average_estimated_yield} />
            </div>
        </div>
    )
};

export default HarvestSection;