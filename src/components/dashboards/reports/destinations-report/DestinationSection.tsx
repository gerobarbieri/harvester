import { PieChart } from "lucide-react";
import type { FC } from "react";
import type { Destination } from "../../../../types";
import Card from "../../../commons/Card";
import DestinationChart from "./ui/DestinationChart";

interface DestinationsSectionProps {
    destinationData: Destination[];
}

const DestinationsSection: FC<DestinationsSectionProps> = ({ destinationData }) => (
    <Card className="animate-fade-in">
        <div className="flex items-center space-x-2 mb-6">
            <PieChart className="w-5 h-5 text-text-secondary" />
            <h3 className="text-lg font-semibold text-text-primary">Entregas por Destino</h3>
        </div>
        {destinationData.length > 0 ? (
            <div className="flex justify-center">
                <DestinationChart data={destinationData} />
            </div>
        ) : (
            <p className="text-center text-text-secondary">No hay datos de destinos para los filtros seleccionados.</p>
        )}
    </Card>
);

export default DestinationsSection;