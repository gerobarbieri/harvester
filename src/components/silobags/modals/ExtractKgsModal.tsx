import { useForm, Controller, useWatch } from 'react-hook-form';
import Button from '../../commons/Button';
import Input from '../../commons/form/Input';
import TextArea from '../../commons/form/TextArea';
import Modal from '../../commons/Modal';
import { extractKgsSilobag } from '../../../services/siloBags';
import type { MovementType, Silobag } from '../../../types';
import useAuth from '../../../context/auth/AuthContext';
import { formatNumber } from '../../../utils';
import { Timestamp } from 'firebase/firestore';
import toast from 'react-hot-toast';

interface ExtractKgsModalProps {
    isOpen: boolean;
    onClose: () => void;
    siloBag: Silobag;
    updateOptimisticSiloBag: (id: string, updates: Partial<Silobag>) => void;
}

const ExtractKgsModal: React.FC<ExtractKgsModalProps> = ({ isOpen, onClose, siloBag, updateOptimisticSiloBag }) => {

    const { control, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm({
        defaultValues: {
            kgChange: '',
            details: ''
        },
        mode: 'onChange'
    });
    const { currentUser } = useAuth();

    const kgChangeValue = useWatch({
        control,
        name: 'kgChange',
    });

    const exceedsAvailable = parseFloat(kgChangeValue) > siloBag.current_kg;

    const onSubmit = async (data: any) => {
        const { kgChange, details } = data;

        const exitMovement = {
            type: "substract" as MovementType,
            kg_change: -parseFloat(kgChange),
            organization_id: currentUser.organizationId,
            date: Timestamp.now(),
            details
        };

        extractKgsSilobag(siloBag, exitMovement, updateOptimisticSiloBag).catch(error => {
            console.error("Error al crear el movimiento de extracción:", error);
        })
        handleClose();
        toast.success("Se extrajeron los kilos con exito!")
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title={`Extraer Kilos de ${siloBag.name}`}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <p className="text-sm text-text-secondary">Disponibles: <span className="font-bold text-text-primary">{formatNumber(siloBag.current_kg)} kgs</span></p>

                {/* --- 3. REEMPLAZAMOS register CON Controller --- */}
                <Controller
                    name="kgChange"
                    control={control}
                    rules={{
                        required: "La cantidad es obligatoria.",
                        max: {
                            value: siloBag.current_kg,
                            message: `No se puede extraer más de lo disponible.`
                        },
                        min: { value: 1, message: "Debe ser mayor a 0." }
                    }}
                    render={({ field, fieldState: { error } }) => (
                        <Input
                            {...field}
                            label="Cantidad a Extraer (kgs)"
                            type="number"
                            error={error?.message}
                        />
                    )}
                />

                {/* --- 4. AÑADIMOS EL MENSAJE DE VALIDACIÓN EN TIEMPO REAL --- */}
                {exceedsAvailable && !errors.kgChange && (
                    <div className="p-3 text-sm text-red-700 bg-red-50 rounded-lg -mt-2">
                        El valor ingresado supera la cantidad disponible en el silobolsa.
                    </div>
                )}

                <Controller
                    name="details"
                    control={control}
                    rules={{ required: "El motivo es obligatorio." }}
                    render={({ field, fieldState: { error } }) => (
                        <TextArea
                            {...field}
                            label="Motivo / Descripción"
                            error={error?.message}
                        />
                    )}
                />
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
                        disabled={exceedsAvailable}
                    >
                        Confirmar Extracción
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default ExtractKgsModal;