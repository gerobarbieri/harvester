import { Award } from "lucide-react";
import type { FC } from "react";
import Card from "../../../commons/Card";
import type { Harvester } from "../../../../types";

interface HarvesterRankingSectionProps {
    harvesterData: Harvester[];
}

const HarvesterRankingSection: FC<HarvesterRankingSectionProps> = ({ harvesterData }) => (
    <Card className="animate-fade-in">
        <div className="flex items-center space-x-2 mb-6">
            <Award className="w-5 h-5 text-text-secondary" />
            <h3 className="text-lg font-semibold text-text-primary">Ranking de Cosecheros</h3>
        </div>
        <div className="space-y-4">
            {harvesterData.length > 0 ? (
                harvesterData.map((h, i) => (
                    <div key={h.id} className="flex justify-between items-center py-3 border-b border-gray-100 last:border-b-0">
                        <div className="flex items-center space-x-3">
                            <span className="text-text-secondary font-semibold text-sm w-6">#{i + 1}</span>
                            <span className="font-medium text-text-primary">{h.name}</span>
                        </div>
                        <span className="font-bold text-text-primary">{0} kg/ha</span>
                    </div>
                ))
            ) : (
                <p className="text-center text-text-secondary">No hay datos de cosecheros para los filtros seleccionados.</p>
            )}
        </div>
    </Card>
);

export default HarvesterRankingSection;