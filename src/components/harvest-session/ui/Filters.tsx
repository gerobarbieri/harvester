import { type FC, useMemo } from "react";
import type { Campaign, HarvestSession } from "../../../types";
import Select from "../../commons/form/Select";
import Card from "../../commons/Card";
import useAuth from "../../../context/auth/AuthContext";

// Define la forma del objeto de filtros que recibe
export interface SessionsFiltersProps {
    crop: string;
    field: string;
}

// Define todas las props que el componente necesita del padre
interface FilterComponentProps {
    filters: SessionsFiltersProps;
    onFilterChange: (filterName: keyof SessionsFiltersProps, value: string) => void;
    sessionsForCampaign: HarvestSession[];

}

const SessionsFilters: FC<FilterComponentProps> = ({
    filters,
    onFilterChange,
    sessionsForCampaign
}) => {

    const availableFields = useMemo(() => {
        if (!sessionsForCampaign) return [];
        const unique = new Map(sessionsForCampaign.map(s => [s.field.id, s.field]));
        return Array.from(unique.values());
    }, [sessionsForCampaign]);

    const availableCrops = useMemo(() => {
        if (!sessionsForCampaign) return [];
        const unique = new Map(sessionsForCampaign.map(s => [s.crop.id, s.crop]));
        return Array.from(unique.values());
    }, [sessionsForCampaign]);

    const fieldOptions = useMemo(() => [{ value: 'all', label: 'Todos los campos' }, ...availableFields.map(f => ({ value: f.id, label: f.name }))], [availableFields]);
    const cropOptions = useMemo(() => [{ value: 'all', label: 'Todos los cultivos' }, ...availableCrops.map(c => ({ value: c.id, label: c.name }))], [availableCrops]);

    return (
        <Card>
            <h2 className="text-lg font-bold text-text-primary mb-4">Filtros</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Select
                    name="field"
                    label="Campo (Opcional)"
                    items={fieldOptions}
                    value={filters.field}
                    onChange={(newValue) => onFilterChange('field', newValue as string)}
                />
                <Select
                    name="crop"
                    label="Cultivo (Opcional)"
                    items={cropOptions}
                    value={filters.crop}
                    onChange={(newValue) => onFilterChange('crop', newValue as string)}
                />
            </div>
        </Card>
    );
};

export default SessionsFilters;