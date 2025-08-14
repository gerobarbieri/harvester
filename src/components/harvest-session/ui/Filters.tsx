// src/components/harvest-session/ui/Filters.tsx
import type { FC } from "react";
import Card from "../../commons/Card";
import Select from "../../commons/form/Select";
import type { Campaign } from "../../../types";

interface FiltersProps {
    campaign: Campaign;
    filterCrop: string;
    setFilterCrop: (crop: string) => void;
    cropNames: string[];
    loading: boolean;
}

const Filters: FC<FiltersProps> = ({
    campaign,
    filterCrop,
    setFilterCrop,
    cropNames,
    loading
}) => {
    const cropOptions = cropNames.map(name => ({ id: name, name }));

    return (
        <Card>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="col-span-2 lg:col-span-1">
                    <Select
                        label="Campaña"
                        items={[{ id: campaign.id, name: campaign.name }]}
                        name="campana"
                        placeholder="Seleccionar Campaña"
                        value={campaign.id}
                        disabled={true}
                    />
                </div>
                <div className="col-span-1">
                    <Select
                        label="Cultivo"
                        items={cropOptions}
                        name="cultivo"
                        placeholder="Todos los Cultivos"
                        value={filterCrop}
                        onChange={(e) => setFilterCrop(e.target.value)}
                        disabled={loading}
                    />
                </div>
            </div>
        </Card>
    );
};

export default Filters;