import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { format, subDays } from "date-fns";
import PageHeader from "../../components/commons/layout/PageHeader";
import { useLogistics } from "../../hooks/logistics/useLogistics";
import { useCampaignFields } from "../../hooks/field/useCampaignFields";
import { useActiveCampaign } from "../../hooks/campaign/useActiveCampaign";
import { useCrops } from "../../hooks/crop/useCrops";
import { updateLogisticsStatus } from "../../services/logistics";
import type { Logistics as LogisticsType } from "../../types";
import { PlusCircle } from "lucide-react";
import Button from "../../components/commons/Button";
import toast from "react-hot-toast";
import AddTruckModal from "../../components/logistics/modals/AddTruckModal";
import UpdateStatusModal from "../../components/logistics/modals/UpdateStatusModal";
import LogisticsFilters from "../../components/logistics/LogisticsFilters";
import LogisticsBoard from "../../components/logistics/LogisticsBoard";

const Logistics = () => {
    const [modal, setModal] = useState<'add' | 'update' | null>(null);
    const [selectedTruck, setSelectedTruck] = useState<LogisticsType | null>(null);
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
    const { logistics, loading: loadingLogistics } = useLogistics(selectedDateRange, selectedField);

    const statusOptions = [
        { value: 'in-route-to-field', label: 'En Camino a Campo', color: 'bg-blue-100 text-blue-800', shortLabel: 'En Camino' },
        { value: 'loading', label: 'Cargando', color: 'bg-yellow-100 text-yellow-800', shortLabel: 'Cargando' },
        { value: 'in-transit', label: 'En Camino a Destino', color: 'bg-green-100 text-green-800', shortLabel: 'En Tránsito' },
        { value: 'closed', label: 'Entregado', color: 'bg-grey-100 text-grey-800', shortLabel: 'Entregado' },

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


    const organizedTasks = useMemo(() => {
        const organized = statusOptions.reduce((acc, status) => ({ ...acc, [status.value]: [] }), {});
        logistics.forEach(truck => {
            if (organized[truck.status]) organized[truck.status].push(truck);
        });
        return organized;
    }, [logistics]);

    const handleStatusChange = async (truckId: string, newStatus: string) => {
        updateLogisticsStatus(truckId, newStatus).catch(error => {
            console.error('Error al actualizar estado:', error);
            toast.error("No se pudo actualizar el estado.");
        });
        toast.success(`Estado actualizado con exito!`);
        setSelectedTruck(null);
        setModal(null);

    };

    const openUpdateModal = (truck: LogisticsType) => {
        setSelectedTruck(truck);
        setModal('update');
    };

    return (
        <div className="space-y-6">
            <PageHeader title="Logística" breadcrumbs={[{ label: 'Logística' }]}>
                <Button icon={PlusCircle} onClick={() => setModal('add')}>Agregar Camión</Button>
            </PageHeader>


            <LogisticsFilters
                control={control}
                campaignFields={campaignFields}
                loadingFields={loadingFields}
            />

            <div className="md:hidden mb-4"><p className="text-xs text-gray-500 text-center">← Desliza para ver más estados →</p></div>

            {loadingLogistics ? <p className="text-center py-8">Cargando órdenes...</p> : (
                <LogisticsBoard
                    organizedTasks={organizedTasks}
                    statusOptions={statusOptions}
                    openUpdateModal={openUpdateModal}
                />
            )}

            <AddTruckModal
                isOpen={modal === 'add'}
                onClose={() => setModal(null)}
                fields={campaignFields}
                crops={crops}
                suggestedOrderNumber={suggestedOrderNumber} />

            <UpdateStatusModal
                isOpen={modal === 'update'}
                onClose={() => setModal(null)}
                selectedTruck={selectedTruck}
                statusOptions={statusOptions}
                handleStatusChange={handleStatusChange} />
        </div>
    );
};

export default Logistics;