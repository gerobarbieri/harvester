import { type FC } from "react";
import { Link } from 'react-router';
import Button from "../ui/Button";

interface PlotListHeaderProps {
    campaignId: string;
    field: { name: string };
    showHarvestButton: boolean;
    onHarvestClick: () => void;
}

const PlotListHeader: FC<PlotListHeaderProps> = ({ campaignId, field, showHarvestButton, onHarvestClick }) => (
    <header className="mb-6">
        <Link to={`/campaigns/${campaignId}/fields`} className="text-[#2A6449] hover:underline font-semibold mb-2">
            &larr; Volver a Campos
        </Link>
        <h2 className="text-3xl font-bold text-gray-800 mt-4">{field?.name}</h2>
        <p className="text-lg text-gray-500 mt-4">Lotes en cosecha</p>
        {showHarvestButton && (
            <div className="my-6">
                <Button onClick={onHarvestClick}>+ Cosechar Lote</Button>
            </div>
        )}
    </header>
);

export default PlotListHeader;