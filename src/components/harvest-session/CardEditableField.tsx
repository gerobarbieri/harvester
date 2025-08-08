import { type FC } from "react";
import { PencilIcon } from '../commons/Icons';

interface EditableFieldProps {
    label: string;
    value: string;
    canEdit: boolean;
    onEdit: (e?: React.MouseEvent, field?: string) => void;
}

const HarvestPlotCardEditableField: FC<EditableFieldProps> = ({ label, value, canEdit, onEdit }) => {
    return (
        <div>
            <div className="flex items-center gap-1">
                <p className="text-gray-500">{label}</p>
                {canEdit && (
                    <button
                        onClick={onEdit}
                        className="p-1 text-gray-400 rounded-full hover:bg-gray-200 hover:text-[#2A6449] transition-colors"
                    >
                        <PencilIcon />
                    </button>
                )}
            </div>
            <p className="font-semibold text-gray-800">{value}</p>
        </div>
    );
};

export default HarvestPlotCardEditableField;