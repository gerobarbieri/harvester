import { useForm, Controller } from 'react-hook-form';
import Button from "../../commons/Button";
import Input from "../../commons/form/Input";
import Select from "../../commons/form/Select";
import Modal from "../../commons/Modal";
import TextArea from '../../commons/form/TextArea';
import type { CampaignField, Crop, Silobag } from "../../../types";
import { createSilobag } from '../../../services/siloBags';
import useAuth from '../../../context/auth/AuthContext';
import toast from 'react-hot-toast';

// --- 1. ACTUALIZAR LA INTERFAZ DE PROPS ---
interface CreateSiloBagModalProps {
    isOpen: boolean;
    onClose: () => void;
    fields: Partial<CampaignField>[];
    crops: Partial<Crop>[];
    addOptimisticSiloBag: (silo: Silobag) => void;
    removeOptimisticSiloBag: (id: string) => void;
}

const CreateSiloBagModal: React.FC<CreateSiloBagModalProps> = ({
    isOpen,
    onClose,
    fields,
    crops,
    addOptimisticSiloBag,
    removeOptimisticSiloBag
}) => {
    const { register, control, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm();
    const { currentUser } = useAuth();

    // --- 2. ACTUALIZAR EL HANDLER ONSUBMIT ---
    const onSubmit = async (data: any) => {
        const { name, fieldId, cropId, initialKg, details, location } = data;
        const field = fields.find(cf => cf.field.id === fieldId)?.field;
        const crop = crops.find(c => c.id === cropId);

        const newSiloBag = {
            name,
            location: location,
            organization_id: currentUser.organizationId,
            initial_kg: parseFloat(initialKg),
            field: { id: field.id, name: field.name },
            crop: { id: crop.id, name: crop.name },
            details: details
        };

        createSilobag(newSiloBag, {
            add: addOptimisticSiloBag,
            remove: removeOptimisticSiloBag
        }).catch(error => {
            console.error("Error al intentar crear el silo:", error);
        });
        handleClose();
        toast.success("Silobolsa creado con exito!");
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Crear Nuevo Silobolsa">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input label="Nombre o Identificador del Silo" {...register("name", { required: "El nombre es obligatorio." })} error={errors.name?.message as string} />
                <div className="grid grid-cols-2 gap-4">
                    <Controller
                        name="fieldId"
                        control={control}
                        rules={{ required: "El campo es obligatorio." }}
                        render={({ field }) => (
                            <Select
                                {...field}
                                name="fieldId"
                                label="Campo"
                                items={fields.map(cf => ({ id: cf.field.id, name: cf.field.name }))}
                                placeholder="Seleccionar campo..."
                                error={errors.field?.message as string}
                            />
                        )}
                    />
                    <Controller
                        name="cropId"
                        control={control}
                        rules={{ required: "El cultivo es obligatorio." }}
                        render={({ field }) => (
                            <Select
                                {...field}
                                name="cropId"
                                label="Cultivo"
                                items={crops}
                                placeholder="Seleccionar cultivo..."
                                error={errors.crop?.message as string}
                            />
                        )}
                    />
                </div>
                <Input label="Kilos Iniciales" type="number" {...register("initialKg", { required: "Los kilos iniciales son obligatorios.", valueAsNumber: true, min: { value: 1, message: "Debe ser mayor a 0." } })} error={errors.initialKg?.message as string} />
                <Input label="Ubicacion" {...register("location")} />
                <TextArea label="Descripción / Motivo (Opcional)" {...register("details")} />

                <div className="flex gap-3 pt-4 border-t border-gray-100">
                    <Button
                        className="w-[30%]"
                        variant="outline"
                        type="button"
                        onClick={onClose}
                    >
                        Cancelar
                    </Button>
                    <Button
                        className="w-[70%]"
                        variant="primary"
                        type="submit"
                        isLoading={isSubmitting}
                    >
                        Crear Silo
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default CreateSiloBagModal;