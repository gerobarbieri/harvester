import { useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { format, subDays } from "date-fns";
import PageHeader from "../../components/commons/layout/PageHeader";
import { useLogistics } from "../../hooks/logistics/useLogistics";
import { useCampaignFields } from "../../hooks/field/useCampaignFields";
import { useActiveCampaign } from "../../hooks/campaign/useActiveCampaign";
import { useCrops } from "../../hooks/crop/useCrops";
import { updateLogisticsStatus } from "../../services/logistics";
import type { Logistics } from "../../types";
import { Truck, PlusCircle } from "lucide-react";
import Button from "../../components/commons/Button";
import Card from "../../components/commons/Card";
import Modal from "../../components/commons/Modal";
import Select from "../../components/commons/form/Select";
import toast from "react-hot-toast";
import AddTruckModal from "../../components/logistics/modals/AddTruckModal";
import TruckCard from "../../components/logistics/TruckCard";
import DateInput from "../../components/commons/form/DateInput";

// --- COMPONENTE PRINCIPAL DE LA PÁGINA ---
const Logistics = () => {
    const [modal, setModal] = useState<'add' | 'update' | null>(null);
    const [selectedTruck, setSelectedTruck] = useState<Logistics | null>(null);
    const { control, watch } = useForm({
        defaultValues: {
            dateRange: {
                from: subDays(new Date(), 7),
                to: new Date()
            },
            field: 'todos'
        }
    });

    const selectedDateRange = watch('dateRange');
    const selectedField = watch('field');

    // Hooks de datos
    const { campaign } = useActiveCampaign();
    const { campaignFields, loading: loadingFields } = useCampaignFields(campaign?.id);
    const { crops } = useCrops();
    const { logistics, loading: loadingLogistics } = useLogistics(selectedDateRange);

    const statusOptions = [
        { value: 'requested', label: 'Solicitado', color: 'bg-gray-100 text-gray-800', shortLabel: 'Solicitado' },
        { value: 'in-route-to-field', label: 'En Camino a Campo', color: 'bg-blue-100 text-blue-800', shortLabel: 'En Camino' },
        { value: 'loading', label: 'Cargando', color: 'bg-yellow-100 text-yellow-800', shortLabel: 'Cargando' },
        { value: 'in-transit', label: 'En Camino a Destino', color: 'bg-green-100 text-green-800', shortLabel: 'En Tránsito' }
    ];

    const suggestedOrderNumber = useMemo(() => {
        const dateToUse = selectedDateRange.to || new Date();
        const datePrefix = format(dateToUse, 'ddMM');
        const ordersForDay = logistics.filter(truck => {
            const truckDate = truck.date.toDate();
            return truckDate && format(truckDate, 'ddMM') === datePrefix;
        });
        const nextNumber = ordersForDay.length + 1;
        return `ORD-${datePrefix}-${String(nextNumber).padStart(3, '0')}`;
    }, [selectedDateRange.to, logistics]);

    const filteredLogistics = useMemo(() => {
        if (!logistics) return [];
        if (selectedField === 'todos') return logistics;
        return logistics.filter(truck => truck.field?.id === selectedField);
    }, [logistics, selectedField]);

    const organizedTasks = useMemo(() => {
        const organized = statusOptions.reduce((acc, status) => ({ ...acc, [status.value]: [] }), {});
        filteredLogistics.forEach(truck => {
            if (organized[truck.status]) organized[truck.status].push(truck);
        });
        return organized;
    }, [filteredLogistics]);

    const handleStatusChange = async (truckId: string, newStatus: string) => {
        updateLogisticsStatus(truckId, newStatus).catch(error => {
            console.error('Error al actualizar estado:', error);
            toast.error("No se pudo actualizar el estado.");
        });
        toast.success(`Estado actualizado a "${newStatus}"`);
        setSelectedTruck(null);
        setModal(null);

    };

    const openUpdateModal = (truck: Logistics) => {
        setSelectedTruck(truck);
        setModal('update');
    };

    const ColumnView = () => (
        <div className="flex gap-4 overflow-x-auto md:overflow-x-visible pb-4">
            {statusOptions.map(status => {
                const trucks = organizedTasks[status.value] || [];
                return (
                    <div key={status.value} className="flex-shrink-0 w-72 md:flex-1 md:w-auto">
                        <Card className="p-3 mb-4 bg-gray-50 border-gray-200">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-gray-900 text-sm">{status.shortLabel}</h3>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>{trucks.length}</span>
                            </div>
                        </Card>
                        <div className="space-y-0 max-h-[calc(100vh-400px)] overflow-y-auto">
                            {trucks.length > 0 ? (
                                trucks.map(truck => <TruckCard key={truck.id} truck={truck} isCompact openUpdateModal={openUpdateModal} />)
                            ) : (
                                <Card className="p-6 text-center border-2 border-dashed border-gray-200">
                                    <Truck className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                    <p className="text-sm text-gray-500">No hay camiones</p>
                                </Card>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );

    return (
        <div className="space-y-6">
            <PageHeader title="Logística" breadcrumbs={[{ label: 'Logística' }]}>
                <Button icon={PlusCircle} onClick={() => setModal('add')}>Agregar Camión</Button>
            </PageHeader>

            <Card>
                <h2 className="text-lg font-bold text-text-primary mb-4">Filtros</h2>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    <Controller name="dateRange.from" control={control} render={({ field }) => <DateInput {...field} label="Desde" />} />
                    <Controller name="dateRange.to" control={control} render={({ field }) => <DateInput {...field} label="Hasta" />} />
                    <Controller name="field" control={control} render={({ field }) => (
                        <Select {...field} label="Campo" items={[{ id: 'todos', name: 'Todos los campos' }, ...campaignFields.map(cf => cf.field)]} className="flex-1" disabled={loadingFields} />
                    )} />
                </div>
            </Card>

            <div className="md:hidden mb-4"><p className="text-xs text-gray-500 text-center">← Desliza para ver más estados →</p></div>

            {loadingLogistics ? <p className="text-center py-8">Cargando órdenes...</p> : <ColumnView />}

            <AddTruckModal isOpen={modal === 'add'} onClose={() => setModal(null)} fields={campaignFields} crops={crops} suggestedOrderNumber={suggestedOrderNumber} />

            {selectedTruck && (
                <Modal isOpen={modal === 'update'} onClose={() => setModal(null)} title={`Actualizar Estado`}>
                    <div className="space-y-3">
                        {statusOptions.map((status) => (
                            <button key={status.value} onClick={() => handleStatusChange(selectedTruck.id, status.value)}
                                className={`w-full p-4 text-left rounded-xl border-2 transition-colors disabled:opacity-50 ${selectedTruck.status === status.value ? 'border-primary-darker bg-blue-50' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`}>
                                <div className="font-medium text-gray-900">{status.label}</div>
                                {selectedTruck.status === status.value && <div className="text-sm text-primary-darker mt-1">Estado actual</div>}
                            </button>
                        ))}
                    </div>
                    <div className="mt-6 pt-4 border-t border-gray-200">
                        <Button variant="outline" onClick={() => setModal(null)} className="w-full">Cancelar</Button>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default Logistics;