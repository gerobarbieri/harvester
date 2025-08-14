import type { FC } from "react";
import Card from "../../../commons/Card";
import Select from "../../../commons/form/Select";
import type { Campaign, Crop, Plot, Field } from "../../../../types";

interface FiltersProps {
    campaigns: Partial<Campaign[]>;
    campaignsLoading: boolean;
    filters: { campaign: string; crop: string; field: string; plot: string; };
    availableCrops: Partial<Crop[]>;
    availableFields: Partial<Field[]>;
    availablePlots: Partial<Plot[]>;
    sessionsLoading: boolean;
    handleFilterChange: (filterName: string, value: string) => void;
}

const Filters: FC<FiltersProps> = ({
    campaigns,
    campaignsLoading,
    filters,
    availableCrops,
    availableFields,
    availablePlots,
    sessionsLoading,
    handleFilterChange
}) => (
    <Card>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Select
                label="Campaña"
                items={campaigns}
                name="campaign"
                placeholder="Seleccione una campaña"
                value={filters.campaign}
                onChange={(e) => handleFilterChange('campaign', e.target.value)}
                disabled={campaignsLoading}
            />
            <Select
                label="Cultivo"
                items={availableCrops}
                name="crop"
                placeholder="Todos los cultivos"
                value={filters.crop}
                onChange={(e) => handleFilterChange('crop', e.target.value)}
                disabled={!filters.campaign || sessionsLoading}
            />
            <Select
                label="Campo"
                items={availableFields}
                name="field"
                placeholder="Todos los campos"
                value={filters.field}
                onChange={(e) => handleFilterChange('field', e.target.value)}
                disabled={!filters.campaign || sessionsLoading}
            />
            <Select
                label="Lote"
                items={availablePlots}
                name="plot"
                placeholder="Todos los lotes"
                value={filters.plot}
                onChange={(e) => handleFilterChange('plot', e.target.value)}
                disabled={!filters.campaign || sessionsLoading}
            />
        </div>
    </Card>
);

export default Filters;