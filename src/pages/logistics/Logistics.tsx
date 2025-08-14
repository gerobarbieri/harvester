import { useEffect, useMemo, useState, type FC } from "react";
// import Filters from "../../components/logistics/Filters";
import PageHeader from "../../components/commons/layout/PageHeader";
import { useLogistics } from "../../hooks/logistics/useLogistics";
import { useCampaignFields } from "../../hooks/field/useCampaignFields";
import { useActiveCampaign } from "../../hooks/campaign/useActiveCampaign";
import type { CampaignFields } from "../../types";
import { Truck, MapPin, Package, User, PlusCircle, ChevronRight } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import Button from "../../components/commons/Button";
import Card from "../../components/commons/Card";
import Modal from "../../components/commons/Modal";


const mockLogistics = [
    { id: '1', orden: 'LOG-A001', fecha: '15/08/2025', campo: 'La Esperanza', cultivo: 'Soja', chofer: 'Juan Pérez', empresa: 'Transportes del Campo', status: 'Solicitado' },
    { id: '2', orden: 'LOG-B002', fecha: '15/08/2025', campo: 'San José', cultivo: 'Maíz', chofer: 'Carlos López', empresa: 'Logística Rural', status: 'En Camino Campo' },
    { id: '3', orden: 'LOG-C003', fecha: '15/08/2025', campo: 'El Progreso', cultivo: 'Trigo', chofer: 'Ana García', empresa: 'Transportes Sur', status: 'Cargando' },
    { id: '4', orden: 'LOG-D004', fecha: '15/08/2025', campo: 'Villa Nueva', cultivo: 'Girasol', chofer: 'Pedro Martín', empresa: 'Transportes del Campo', status: 'En Transito' },
    { id: '5', orden: 'LOG-E005', fecha: '15/08/2025', campo: 'La Esperanza', cultivo: 'Soja', chofer: 'María Rodríguez', empresa: 'Logística Rural', status: 'Solicitado' },
    { id: '6', orden: 'LOG-F006', fecha: '15/08/2025', campo: 'San José', cultivo: 'Maíz', chofer: 'Roberto Silva', empresa: 'Transportes Sur', status: 'Cargando' }
];

// --- COMPONENTE PRINCIPAL ---
const Logistics = () => {
    const [selectedDate, setSelectedDate] = useState('2025-08-15');
    const [selectedField, setSelectedField] = useState('todos');
    const [selectedTruck, setSelectedTruck] = useState(null);
    const [isUpdating, setIsUpdating] = useState(false);

    const statusOptions = [
        { value: 'Solicitado', label: 'Solicitado', color: 'bg-gray-100 text-gray-800', shortLabel: 'Solicitado' },
        { value: 'En Camino Campo', label: 'En Camino a Campo', color: 'bg-blue-100 text-blue-800', shortLabel: 'En Camino' },
        { value: 'Cargando', label: 'Cargando', color: 'bg-yellow-100 text-yellow-800', shortLabel: 'Cargando' },
        { value: 'En Transito', label: 'En Camino a Destino', color: 'bg-green-100 text-green-800', shortLabel: 'En Tránsito' }
    ];

    const getStatusInfo = (status) => {
        return statusOptions.find(s => s.value === status) || statusOptions[0];
    };

    const handleStatusChange = async (truckId, newStatus) => {
        setIsUpdating(true);
        try {
            // Simular delay de API
            await new Promise(resolve => setTimeout(resolve, 1000));
            console.log(`Actualizando camión ${truckId} a estado: ${newStatus}`);
            // Aquí iría tu lógica de actualización, por ejemplo con Firebase
            setSelectedTruck(null);
        } catch (error) {
            console.error('Error al actualizar estado:', error);
        } finally {
            setIsUpdating(false);
        }
    };

    const organizedTasks = useMemo(() => {
        const organized = statusOptions.reduce((acc, status) => {
            acc[status.value] = [];
            return acc;
        }, {});
        mockLogistics.forEach(truck => {
            if (organized[truck.status]) {
                organized[truck.status].push(truck);
            }
        });
        return organized;
    }, []);

    const TruckCard = ({ truck, isCompact = false }) => (
        <Card className={`${isCompact ? 'p-3' : 'p-4'} mb-3 cursor-pointer hover:shadow-md transition-shadow`} onClick={() => setSelectedTruck(truck)}>
            <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-gray-600 flex-shrink-0" />
                    <span className="font-semibold text-gray-900 text-sm">{truck.orden}</span>
                </div>
            </div>
            <div className="space-y-1.5 text-xs text-gray-600">
                <div className="flex items-center gap-1.5">
                    <MapPin className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">{truck.campo}</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <Package className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">{truck.cultivo}</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <User className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">{truck.chofer}</span>
                </div>
            </div>
            <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-gray-500">{truck.fecha}</span>
                <ChevronRight className="h-4 w-4 text-gray-400" />
            </div>
        </Card>
    );

    const ColumnView = () => (
        <div className="flex gap-4 overflow-x-auto md:overflow-x-visible pb-4 md:mx-0 md:px-0">
            {statusOptions.map(status => {
                const trucks = organizedTasks[status.value] || [];
                return (
                    <div key={status.value} className="flex-shrink-0 w-72 md:flex-1 md:w-auto">
                        <div className="mb-4">
                            <Card className="p-4 bg-gray-50 border-2 border-gray-200">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-semibold text-gray-900 text-sm">{status.shortLabel}</h3>
                                    <div className="flex items-center gap-2">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                                            {trucks.length}
                                        </span>
                                    </div>
                                </div>
                            </Card>
                        </div>
                        <div className="space-y-0 max-h-[calc(100vh-300px)] overflow-y-auto">
                            {trucks.length > 0 ? (
                                trucks.map(truck => (
                                    <TruckCard key={truck.id} truck={truck} isCompact />
                                ))
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
        <div className="space-y-6" >
            <PageHeader title="Logística" breadcrumbs={[{ label: 'Logística' }]}>
                <div className="w-full md:w-auto">
                    <Button
                        className="w-full sm:px-10 sm:py-3 sm:text-base"
                        icon={PlusCircle}
                    >
                        Agregar Camion
                    </Button>
                </div>
            </PageHeader>

            <Card className="mb-6">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-600 mb-1.5">Fecha</label>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="w-full p-3 border border-gray-300 bg-gray-50 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-600 mb-1.5">Campo</label>
                        <select
                            value={selectedField}
                            onChange={(e) => setSelectedField(e.target.value)}
                            className="w-full p-3 border border-gray-300 bg-gray-50 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="todos">Todos los campos</option>
                            <option value="la-esperanza">La Esperanza</option>
                            <option value="san-jose">San José</option>
                            <option value="el-progreso">El Progreso</option>
                            <option value="villa-nueva">Villa Nueva</option>
                        </select>
                    </div>
                </div>
            </Card>

            <div className="md:hidden mb-4">
                <p className="text-xs text-gray-500 text-center">
                    ← Desliza para ver más estados →
                </p>
            </div>

            <ColumnView />

            <Modal
                isOpen={!!selectedTruck}
                onClose={() => setSelectedTruck(null)}
                title={`Actualizar Estado - ${selectedTruck?.orden}`}
            >
                <div className="space-y-3">
                    {statusOptions.map((status) => (
                        <button
                            key={status.value}
                            onClick={() => handleStatusChange(selectedTruck.id, status.value)}
                            disabled={isUpdating}
                            className={`w-full p-4 text-left rounded-xl border-2 transition-colors disabled:opacity-50 ${selectedTruck?.status === status.value
                                ? 'border-primary-darker bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                }`}
                        >
                            <div className="font-medium text-gray-900">{status.label}</div>
                            {selectedTruck?.status === status.value && (
                                <div className="text-sm text-primary-darker mt-1">Estado actual</div>
                            )}
                        </button>
                    ))}
                </div>
                <div className="mt-6 pt-4 border-t border-gray-200">
                    <Button
                        variant="outline"
                        onClick={() => setSelectedTruck(null)}
                        className="w-full"
                        disabled={isUpdating}
                    >
                        Cancelar
                    </Button>
                </div>
            </Modal>
        </div >
    );
};

export default Logistics;
