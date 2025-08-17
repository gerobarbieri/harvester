
import { useForm } from 'react-hook-form';
import { Timestamp } from "firebase/firestore";
import Button from '../../commons/Button';
import Input from '../../commons/form/Input';
import TextArea from '../../commons/form/TextArea';
import Modal from '../../commons/Modal';
import { extractKgsSilobag } from '../../../services/siloBags';
import type { MovementType } from '../../../types';
import useAuth from '../../../context/auth/AuthContext';
import { formatNumber } from '../../../utils';
import { useExtractKgs } from '../../../hooks/silobags/useExtractKgs';

interface ExtractKgsModalProps {
    isOpen: boolean;
    onClose: () => void;
    siloBag: any; // Deberías usar tu tipo SiloBag
}

const ExtractKgsModal: React.FC<ExtractKgsModalProps> = ({ isOpen, onClose, siloBag }) => {
    const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm();
    const { currentUser } = useAuth();

    const extractMutation = useExtractKgs();

    const onSubmit = (data: any) => {
        const { kgChange, details } = data;
        const exitMovement = {
            type: "substract" as MovementType,
            kg_change: -parseFloat(kgChange),
            organization_id: currentUser.organizationId,
            date: Timestamp.now(),
            details
        };

        // Simplemente llamas a 'mutate'. TanStack Query se encarga del resto.
        extractMutation.mutate({ siloBagId: siloBag.id, movement: exitMovement });
        handleClose(); // Puedes cerrar el modal inmediatamente
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title={`Extraer Kilos de ${siloBag.name}`}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <p className="text-sm text-text-secondary">Disponibles: <span className="font-bold text-text-primary">{formatNumber(siloBag.current_kg)} kgs</span></p>
                <Input
                    label="Cantidad a Extraer (kgs)"
                    type="number"
                    {...register("kgChange", {
                        required: "La cantidad es obligatoria.",
                        valueAsNumber: true,
                        max: {
                            value: siloBag.current_kg,
                            message: `No se puede extraer más de lo disponible.`
                        },
                        min: { value: 1, message: "Debe ser mayor a 0." }
                    })}
                    error={errors.kgChange?.message as string}
                />
                <TextArea label="Motivo / Descripción" {...register("details", { required: "El motivo es obligatorio." })} error={errors.details?.message as string} />

                <div className="flex justify-end gap-3 pt-4">
                    <Button variant="outline" type="button" onClick={onClose}>Cancelar</Button>
                    <Button variant="primary" type="submit" isLoading={isSubmitting}>Confirmar Extracción</Button>
                </div>
            </form>
        </Modal>
    );
};

export default ExtractKgsModal;