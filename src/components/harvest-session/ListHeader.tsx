import { type FC } from "react";
import { Link } from 'react-router';
import Button from "../commons/Button";
import type { Field } from "../../types";

interface PlotListHeaderProps {
    campaignId: string;
    field: Field;
    onHarvestClick: () => void;
}

const HarvestSessionsHeader: FC<PlotListHeaderProps> = ({ campaignId, field, onHarvestClick }) => {


    return (
        <header className="mb-6">
            <Link to={`/campaigns/${campaignId}/fields`} className="text-[#2A6449] hover:underline font-semibold mb-2">
                &larr; Volver a Campos
            </Link>
            <h2 className="text-3xl font-bold text-gray-800 mt-4">{field?.name}</h2>
            <p className="text-lg text-gray-500 mt-4">Lotes en cosecha</p>
            <div className="my-6">
                <Button onClick={onHarvestClick}>+ Cosechar Lote</Button>
            </div>
        </header>
    )
};

export default HarvestSessionsHeader;