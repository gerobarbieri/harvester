// src/components/logistics/Filters.tsx
import type { FC } from "react";
import Card from "../commons/Card";
import Select from "../commons/form/Select";
import Input from "../commons/form/Input";
import type { CampaignFields } from "../../types";

interface LogisticsFiltersProps {
    selectedDate: string;
    onDateChange: (date: string) => void;
    selectedField: string;
    onFieldChange: (fieldId: string) => void;
    fields: Partial<CampaignFields[]>;
}

const Filters: FC<LogisticsFiltersProps> = ({
    selectedDate,
    onDateChange,
    selectedField,
    onFieldChange,
    fields
}) => {
    const fieldOptions = [
        { id: 'todos', name: 'Todos los Campos' },
        ...fields.map(cf => ({ id: cf.field.id, name: cf.field.name }))
    ];

    return (
        <Card>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                <Input
                    name="fecha"
                    label="Fecha"
                    type="date"
                    value={selectedDate}
                    onChange={(e) => onDateChange(e.target.value)}
                />
                <Select
                    label="Campo"
                    items={fieldOptions}
                    name="campo"
                    placeholder="Filtrar por Campo"
                    value={selectedField}
                    onChange={(e) => onFieldChange(e.target.value)}
                />
            </div>
        </Card>
    );
};

export default Filters;