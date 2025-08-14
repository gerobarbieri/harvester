import { ChevronDown } from "lucide-react";
import { type FC, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { useDestinations } from "../../../../hooks/destination/useDestinations";
import { useSiloBags } from "../../../../hooks/silobags/useSilobags";
import Button from "../../../commons/Button";
import Input from "../../../commons/form/Input";
import Select from "../../../commons/form/Select";
import Modal from "../../../commons/Modal";
import TextArea from "../../../commons/form/TextArea";

export const RegisterFormFields: FC<{ control: any, errors: any, setValue: any, isEditMode: boolean }> = ({ control, errors, setValue, isEditMode }) => {
    const type = useWatch({ control, name: 'type' });
    const { siloBags } = useSiloBags();
    const { destinations } = useDestinations();
    const [siloBagMode, setSiloBagMode] = useState<'select' | 'create'>('select');
    const [showMore, setShowMore] = useState(false);
    const siloBagOptions = siloBags;
    const destinationOptions = destinations.map(d => ({ id: d.id, name: d.name }));

    const handleSiloBagModeChange = (mode: 'select' | 'create') => {
        setSiloBagMode(mode);
        if (mode === 'create') {
            setValue('siloBagId', '', { shouldValidate: true });
        } else {
            setValue('newSiloBagName', '', { shouldValidate: true });
        }
    };

    return (
        <>
            {type === 'truck' && (
                <div className="space-y-4 animate-fade-in-fast">
                    <div className="grid grid-cols-2 gap-4">
                        <Controller name="driver" control={control} render={({ field }) => (<Input {...field} label="Chofer" placeholder="Nombre del chofer" />)} />
                        <Controller name="license_plate" control={control} rules={{ required: 'La patente es obligatoria.' }} render={({ field, fieldState: { error } }) => (<Input {...field} label="Patente" placeholder="AAA-123-AA" error={error?.message} />)} />
                    </div>
                    <Controller name="destinationId" control={control} render={({ field, fieldState: { error } }) => (<Select {...field} label="Destino" items={destinationOptions} placeholder="Seleccionar destino..." error={error?.message} />)} />
                    <button type="button" onClick={() => setShowMore(!showMore)} className="text-sm text-primary font-semibold flex items-center gap-1">{showMore ? 'Mostrar menos' : 'Mostrar más'} <ChevronDown className={`w-4 h-4 transition-transform ${showMore ? 'rotate-180' : ''}`} /></button>
                    {showMore && (<div className="grid grid-cols-2 gap-4 animate-fade-in-fast"><Controller name="ctg" control={control} render={({ field }) => (<Input {...field} label="CTG" placeholder="Número de CTG" />)} /><Controller name="cpe" control={control} render={({ field }) => (<Input {...field} label="CPE" placeholder="Número de CPE" />)} /></div>)}
                </div>
            )}
            {type === 'silo_bag' && (
                <div className="space-y-4 animate-fade-in-fast">
                    {isEditMode ? (
                        <Controller name="siloBagId" control={control} rules={{ required: 'Debe seleccionar un silobolsa.' }} render={({ field, fieldState: { error } }) => (<Select {...field} label="Silobolsa" items={siloBagOptions} placeholder="Seleccionar existente..." error={error?.message} />)} />
                    ) : (
                        <div>
                            <div className="grid grid-cols-2 gap-1 p-1 bg-gray-200 rounded-lg mb-4">
                                <button type="button" onClick={() => handleSiloBagModeChange('select')} className={`px-3 py-2 text-sm font-semibold rounded-md transition-colors ${siloBagMode === 'select' ? 'bg-white shadow text-primary-darker' : 'text-gray-600'}`}>Seleccionar Existente</button>
                                <button type="button" onClick={() => handleSiloBagModeChange('create')} className={`px-3 py-2 text-sm font-semibold rounded-md transition-colors ${siloBagMode === 'create' ? 'bg-white shadow text-primary-darker' : 'text-gray-600'}`}>Crear Nuevo</button>
                            </div>
                            {siloBagMode === 'select' && (
                                <Controller name="siloBagId" control={control} rules={{ required: siloBagMode === 'select' ? 'Debe seleccionar un silobolsa.' : false }} render={({ field, fieldState: { error } }) => (<Select {...field} items={siloBagOptions} placeholder="Seleccionar existente..." error={error?.message} />)} />
                            )}
                            {siloBagMode === 'create' && (
                                <Controller name="newSiloBagName" control={control} rules={{ required: siloBagMode === 'create' ? 'El nombre es obligatorio.' : false }} render={({ field, fieldState: { error } }) => (<Input {...field} label="Nombre del Nuevo Silobolsa" placeholder="Ej: SB-004" error={error?.message} />)} />
                            )}
                        </div>
                    )}
                    <Controller name="location" control={control} render={({ field }) => (<Input {...field} label="Ubicación" placeholder="Lugar donde se encuentra" />)} />
                </div>
            )}
        </>
    );
}

const AddRegisterModal: FC<{ isOpen: boolean, onClose: () => void, onSubmit: (data: any) => void, isSubmitting: boolean }> = ({ isOpen, onClose, onSubmit, isSubmitting }) => {
    const { control, handleSubmit, formState: { errors }, setValue } = useForm({
        defaultValues: {
            type: 'truck', weight_kg: '', humidity: '', driver: '', license_plate: '',
            destinationId: '', ctg: '', cpe: '', siloBagId: '', newSiloBagName: '',
            location: '', observations: ''
        }
    });

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Nuevo Registro de Cosecha">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Controller name="type" control={control} render={({ field }) => (<Select {...field} label="Tipo" items={[{ id: 'truck', name: 'Camión' }, { id: 'silo_bag', name: 'Silobolsa' }]} />)} />
                <div className="grid grid-cols-2 gap-4">
                    <Controller name="weight_kg" control={control} rules={{ required: 'Los kilos son obligatorios.' }} render={({ field }) => (<Input {...field} label="Kilos" type="number" placeholder="Ej: 30000" error={errors.weight_kg?.message} />)} />
                    <Controller name="humidity" control={control} rules={{ required: 'La humedad es obligatoria.' }} render={({ field }) => (<Input {...field} label="Humedad (%)" type="number" placeholder="Ej: 14.5" error={errors.humidity?.message} />)} />
                </div>
                <RegisterFormFields control={control} errors={errors} setValue={setValue} isEditMode={false} />
                <Controller name="observations" control={control} render={({ field }) => (<TextArea {...field} label="Observaciones" placeholder="Anotaciones adicionales..." />)} />
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                    <Button className="w-[30%]" variant="outline" type="button" onClick={onClose}>Cancelar</Button>
                    <Button className="w-[70%]" type="submit" isLoading={isSubmitting}>{isSubmitting ? 'Guardando...' : 'Guardar Registro'}</Button>
                </div>
            </form>
        </Modal>
    );
};

export default AddRegisterModal;