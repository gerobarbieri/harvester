import type { FC } from "react";
import Card from "../../../../../components/commons/Card";

interface HarvestProgressCardProps {
    harvestedHectares: number;
    hectares: number;
}

const HarvestProgressCard: FC<HarvestProgressCardProps> = ({ harvestedHectares, hectares }) => {

    const progress = (harvestedHectares / hectares) * 100;

    return (
        <Card className="flex-1">
            <h3 className="text-lg font-semibold text-text-primary mb-2">Avance de Cosecha</h3>
            <div className="text-3xl font-bold text-text-primary mb-4">{progress.toFixed(1)}%</div>
            <div className="w-full bg-background rounded-full h-3 mb-2">
                <div
                    className="bg-primary h-3 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                ></div>
            </div>
            <p className="text-text-secondary text-sm">
                {harvestedHectares.toLocaleString('es-AR')} ha / {hectares.toLocaleString('es-AR')} ha
            </p>
        </Card>
    )
};

export default HarvestProgressCard;