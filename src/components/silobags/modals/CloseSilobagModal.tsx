import { useForm } from 'react-hook-form';
import Button from '../../commons/Button';
import TextArea from '../../commons/form/TextArea';
import Modal from '../../commons/Modal';
import { closeSilobag } from '../../../services/siloBags';
import { formatNumber } from '../../../utils';
import type { Silobag } from '../../../types'; // Importa tu tipo Silobag
import toast from 'react-hot-toast';

// --- 1. ACTUALIZAR LA INTERFAZ DE PROPS ---
interface CloseSiloBagModalProps {
    isOpen: boolean;
    onClose: () => void;
    siloBag: Silobag;
    onSubmit: (data: any) => Promise<void>;
}

const CloseSiloBagModal: React.FC<CloseSiloBagModalProps> = ({ isOpen, onClose, siloBag, onSubmit }) => {
    const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm();

    const handleFormSubmit = async (data: any) => {
        await onSubmit(data); // 2. Llamamos a la prop
        reset();
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title={`Cerrar ${siloBag.name}`}>
            <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm">
                    <p>Estás a punto de cambiar el estado a <span className="font-bold">"Cerrado"</span>. Esta acción no se puede deshacer.</p>
                    {siloBag.current_kg > 0 && (
                        <p className="mt-2">Se registrará un ajuste por la pérdida de <span className="font-bold">{formatNumber(siloBag.current_kg)} kgs</span>.</p>
                    )}
                </div>
                <TextArea
                    label="Motivo del Cierre"
                    placeholder="Ej: Fin de campaña, pudrición, etc."
                    {...register("details", { required: "El motivo es obligatorio." })}
                    error={errors.details?.message as string}
                />

                <div className="flex justify-end gap-3 pt-4">
                    <Button variant="outline" type="button" onClick={onClose}>Cancelar</Button>
                    <Button variant="danger" type="submit" isLoading={isSubmitting}>Confirmar Cierre</Button>
                </div>
            </form>
        </Modal>
    );
};

export default CloseSiloBagModal;