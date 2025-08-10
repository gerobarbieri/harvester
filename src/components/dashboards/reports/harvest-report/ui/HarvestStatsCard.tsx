import type { FC } from "react";
import StatCard from "../../../commons/StatCard";
import { Weight, Leaf, Tractor } from "lucide-react";

interface HarvestStatsCardsProps {
    kgCosechados: number;
    rindeSembrado: number;
    rindeCosechado: number;
}

const HarvestStatsCards: FC<HarvestStatsCardsProps> = ({ kgCosechados, rindeSembrado, rindeCosechado }) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
        <StatCard title="Kg Cosechados" value={(kgCosechados / 1000).toLocaleString('es-AR', { maximumFractionDigits: 0 })} unit="tn" icon={<Weight className="w-5 h-5" />} color="orange" />
        <StatCard title="Rinde Sembrado" value={rindeSembrado.toLocaleString('es-AR', { maximumFractionDigits: 0 })} unit="kg/ha" icon={<Leaf className="w-5 h-5" />} color="blue" />
        <StatCard title="Rinde Cosechado" value={rindeCosechado.toLocaleString('es-AR', { maximumFractionDigits: 0 })} unit="kg/ha" icon={<Tractor className="w-5 h-5" />} color="green" />
    </div>
);

export default HarvestStatsCards;