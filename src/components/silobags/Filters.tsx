// src/components/silobags/Filters.tsx
import type { FC } from "react";
import Select from "../commons/form/Select";
import Card from "../commons/Card";
import type { CampaignField, Crop } from "../../types";

interface SiloBagsFiltersProps {
    selectedField: string;
    onFieldChange: (fieldId: string) => void;
    selectedCrop: string;
    onCropChange: (crop: string) => void;
    fields: Partial<CampaignField>[];
    crops: Partial<Crop>[];
}

const Filters: FC<SiloBagsFiltersProps> = ({
    selectedField,
    onFieldChange,
    selectedCrop,
    onCropChange,
    fields,
    crops
}) => {
    const fieldOptions = [
        { id: 'todos', name: 'Todos los Campos' },
        ...fields.map(cf => ({ id: cf.field.id, name: cf.field.name }))
    ];

    const cropOptions = [
        { id: 'todos', name: 'Todos los Cultivos' },
        ...crops.map(crop => ({ id: crop.id, name: crop.name }))
    ];

    return (
        <Card>
            <h2 className="text-lg font-bold text-text-primary mb-4">Filtros</h2>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                <Select
                    label="Campo"
                    items={fieldOptions}
                    name="campo"
                    placeholder="Filtrar por Campo"
                    value={selectedField}
                    onChange={(newValue) => onFieldChange(newValue as string)}
                />
                <Select
                    label="Cultivo"
                    items={cropOptions}
                    name="crop"
                    placeholder="Filtrar por Cultivo"
                    value={selectedCrop}
                    onChange={(newValue) => onCropChange(newValue as string)}
                />
            </div>
        </Card>
    );
};

export default Filters;