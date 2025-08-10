import type { FC } from "react";
import HarvestProgressCard from "./ui/HarvestProgressCard";
import HarvestStatsCards from "./ui/HarvestStatsCard";
import YieldPerformanceCard from "./ui/YieldPerformanceCard";

interface HarvestSectionProps {
    harvestedHectares: number;
    hectares: number;
    rindeCosechado: number;
    rindeEstimado: number;
    kgCosechados: number;
    rindeSembrado: number;
}

const HarvestSection: FC<HarvestSectionProps> = ({
    harvestedHectares,
    hectares,
    rindeCosechado,
    rindeEstimado,
    kgCosechados,
    rindeSembrado,
}) => (
    <div className="space-y-4 lg:space-y-6 animate-fade-in">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
            <HarvestProgressCard
                harvestedHectares={harvestedHectares}
                hectares={hectares}
            />
            <YieldPerformanceCard real={rindeCosechado} estimated={rindeEstimado} />
        </div>
        <HarvestStatsCards
            kgCosechados={kgCosechados}
            rindeSembrado={rindeSembrado}
            rindeCosechado={rindeCosechado}
        />
    </div>
);

export default HarvestSection;