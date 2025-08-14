// src/components/silobags/Filters.tsx
import type { FC } from "react";
import Select from "../commons/form/Select";
import Card from "../commons/Card";
import type { CampaignFields } from "../../types";

interface SiloBagsFiltersProps {
    selectedField: string;
    onFieldChange: (fieldId: string) => void;
    selectedStatus: string;
    onStatusChange: (status: string) => void;
    fields: Partial<CampaignFields>[];
}

const Filters: FC<SiloBagsFiltersProps> = ({
    selectedField,
    onFieldChange,
    selectedStatus,
    onStatusChange,
    fields
}) => {
    const fieldOptions = [
        { id: 'todos', name: 'Todos los Campos' },
        ...fields.map(cf => ({ id: cf.field.id, name: cf.field.name }))
    ];

    const statusOptions = [
        { id: 'todos', name: 'Todos los Estados' },
        { id: 'activo', name: 'Activos' },
        { id: 'cerrado', name: 'Cerrados' },
        { id: 'en_uso', name: 'En Uso' }
    ];

    return (
        <Card>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Select
                    label="Campo"
                    items={fieldOptions}
                    name="campo"
                    placeholder="Filtrar por Campo"
                    value={selectedField}
                    onChange={(e) => onFieldChange(e.target.value)}
                />
                <Select
                    label="Estado"
                    items={statusOptions}
                    name="status"
                    placeholder="Filtrar por Estado"
                    value={selectedStatus}
                    onChange={(e) => onStatusChange(e.target.value)}
                />
            </div>
        </Card>
    );
};

export default Filters;