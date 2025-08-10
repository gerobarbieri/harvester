import { Trash2, PlusCircle } from 'lucide-react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import Button from '../../commons/Button';
import Checkbox from '../../commons/form/Checkbox';
import Input from '../../commons/form/Input';
import Select from '../../commons/form/Select';
import Modal from '../../commons/Modal';

const AddModal = ({ isOpen, onClose, showToast }) => {
    const { register, control, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm({
        defaultValues: {
            fieldId: '',
            plotId: '',
            cropId: '',
            hectares: '',
            estimatedYield: '',
            managerId: '',
            harvesters: [{ harvesterId: '', maps: true }]
        }
    });

    const { fields, append, remove } = useFieldArray({ control, name: "harvesters" });
    const selectedFieldId = watch('fieldId');

    const filteredLotes = selectedFieldId
        ? [].filter(lote => lote.field.toLowerCase().replace(' ', '') === selectedFieldId)
        : [];

    const onSubmit = async (data) => {
        await new Promise(resolve => setTimeout(resolve, 1500));
        console.log("Form Data Submitted:", data);
        showToast('Lote iniciado en cosecha!', 'success');
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Iniciar Cosecha de Lote">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                <div className="grid grid-cols-2 gap-4">
                    <Controller
                        name="fieldId"
                        control={control}
                        rules={{ required: 'Debes seleccionar un campo.' }}
                        render={({ field }) => (
                            <Select
                                {...field}
                                label="Campo"
                                items={[].filter(c => c.id !== 'all')}
                                placeholder="Elige un campo..."
                                error={errors.fieldId?.message} />
                        )} />
                    <Controller
                        name="plotId"
                        control={control}
                        rules={{ required: 'Debes seleccionar un lote.' }}
                        render={({ field }) => (
                            <Select
                                {...field}
                                label="Lote"
                                items={filteredLotes}
                                placeholder={selectedFieldId ? "Elige un lote..." : "Elige un campo"}
                                disabled={!selectedFieldId || filteredLotes.length === 0}
                                error={errors.plotId?.message} />
                        )} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <Controller
                        name="cropId"
                        control={control}
                        rules={{ required: 'Debes seleccionar un cultivo.' }}
                        render={({ field }) => (
                            <Select
                                {...field}
                                label="Cultivo"
                                items={[].filter(c => c.id !== 'all')}
                                placeholder="Elige un cultivo..."
                                error={errors.cropId?.message} />
                        )} />
                    <Controller
                        name="managerId"
                        control={control}
                        rules={{ required: 'El responsable es obligatorio.' }}
                        render={({ field }) => (
                            <Select
                                {...field}
                                label="Responsable de Cosecha"
                                items={[{ id: 'fferray', name: 'Federico Ferray' }, { id: 'agomez', name: 'Ana Gomez' }]}
                                placeholder="Seleccionar..."
                                error={errors.managerId?.message} />
                        )} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Input
                        label="Hectáreas (ha)"
                        type="number"
                        placeholder="Ej: 120"
                        {...register('hectares', { required: 'Las hectáreas son obligatorias.', valueAsNumber: true })}
                        error={errors.hectares?.message} />
                    <Input
                        label="Rinde Estimado (kg/ha)"
                        type="number"
                        placeholder="Ej: 3500"
                        {...register('estimatedYield', { required: 'El rinde es obligatorio.', valueAsNumber: true })}
                        error={errors.estimatedYield?.message} />
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-text-secondary">Cosecheros Asignados</label>
                    {fields.map((item, index) => (
                        <div key={item.id} className="flex items-center gap-2 p-2 bg-background rounded-lg">
                            <div className="flex-grow space-y-3">
                                <Controller
                                    name={`harvesters.${index}.harvesterId`}
                                    control={control}
                                    rules={{ required: 'Elige un cosechero' }}
                                    render={({ field }) => (
                                        <Select {...field} items={[]} placeholder="Seleccionar..." />
                                    )} />
                                <Controller
                                    name={`harvesters.${index}.maps`}
                                    control={control}
                                    render={({ field }) => <Checkbox {...field} checked={field.value} label="Mapea" />} />
                            </div>
                            <Button type="button" variant="ghost" onClick={() => remove(index)} aria-label="Quitar cosechero">
                                <Trash2 size={18} className="text-red-500" />
                            </Button>
                        </div>
                    ))}
                    {errors.harvesters && <p className="text-red-500 text-xs mt-1.5">Completa todos los cosecheros.</p>}

                    {/* CAMBIO: Botón rediseñado y reposicionado. */}
                    <div className="flex justify-end pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            icon={PlusCircle}
                            onClick={() => append({ harvesterId: '', maps: true })}
                        >
                            Agregar
                        </Button>
                    </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-gray-100">
                    <Button className="w-[30%]" variant="outline" type="button" onClick={onClose}>Cancelar</Button>
                    <Button className="w-[70%]" variant="primary" type="submit" isLoading={isSubmitting}>
                        {isSubmitting ? 'Guardando...' : 'Iniciar Cosecha'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default AddModal;