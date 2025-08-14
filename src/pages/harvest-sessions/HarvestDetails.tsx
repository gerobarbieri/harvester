// src/pages/harvest-sessions/HarvestDetails.tsx
import { Archive, ArrowLeft, Download, Droplets, Edit, FileSpreadsheet, FileText, LifeBuoy, MapPin, PlayCircle, PlusCircle, Scale, Tractor, Trash2, Truck, User } from "lucide-react";
import { type FC, useMemo, useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useMatch, Link, Outlet, useOutletContext } from "react-router";
import Button from "../../components/commons/Button";
import Card from "../../components/commons/Card";
import YieldPerformanceCard from "../../components/dashboards/reports/harvest-report/ui/YieldPerformanceCard";
import { useHarvestSession } from "../../hooks/harvest-session/useHarvestSession";
import { useHarvestSessionRegisters } from "../../hooks/harvest-session-register/useHarvestSessionRegisters";
import { format } from "date-fns";
import PageHeader from "../../components/commons/layout/PageHeader";
import { exportToCsv, exportToXlsx } from "../../services/export";
import { updateHarvestSessionProgress, upsertHarvesters } from "../../services/harvestSession";
import UpdateAdvanceModal from "../../components/harvest-session/modals/UpdateAdvanceModal";
import StatusBadge from "../../components/commons/StatusBadge";
import EditManagerModal from "../../components/harvest-session/modals/harvest-managers/EditHarvestManagerModal";
import { addRegister, deleteRegister } from "../../services/harvestSessionRegister";
import AddRegisterModal from "../../components/harvest-session/modals/registers/AddRegisterModal";
import useAuth from "../../context/auth/AuthContext";
import type { HarvestSessionRegister, Silobag } from "../../types";
import { useSiloBags } from "../../hooks/silobags/useSilobags";
import { useDestinations } from "../../hooks/destination/useDestinations";
import { collection, doc, Timestamp, writeBatch } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import EditRegisterModal from "../../components/harvest-session/modals/registers/EditRegisterModal";
import DeleteRegisterModal from "../../components/harvest-session/modals/registers/DeleteRegisterModal";
import ManageHarvestersModal from "../../components/harvest-session/modals/harvesters/ManageHarvestersModal";

const ExportDropdown = ({ onExport }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Efecto para cerrar el dropdown si se hace clic afuera
    useEffect(() => {
        if (!isOpen) return;

        const handleClickOutside = (event: MouseEvent | TouchEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        const timerId = setTimeout(() => {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('touchstart', handleClickOutside);
        }, 0);

        return () => {
            clearTimeout(timerId);
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        };
    }, [isOpen]);

    const handleExport = (format: 'xlsx' | 'csv') => {
        alert(`Exportando a ${format}...`);
        setIsOpen(false); // Cierra el menú después de seleccionar una opción
    };

    return (
        <div ref={dropdownRef} className="relative">
            {/* Botón principal que abre el dropdown */}
            <Button onClick={() => setIsOpen(!isOpen)} variant="primary" icon={Download} className="lg:px-6 lg:py-3 lg:text-base">
                Exportar
            </Button>

            {/* Menú dropdown condicional */}
            {isOpen && (
                <div className="absolute right-0 top-14 bg-white border border-gray-200 rounded-lg shadow-lg py-1 w-64 z-50 animate-fade-in-fast">
                    <button
                        onClick={() => onExport('xlsx')}
                        className="w-full flex items-center space-x-3 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-md transition-all duration-150"
                    >
                        <FileSpreadsheet size={16} className="text-gray-500" />
                        <span>Exportar a Excel (.xlsx)</span>
                    </button>
                    <button
                        onClick={() => onExport('csv')}
                        className="w-full flex items-center space-x-3 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-md transition-all duration-150"
                    >
                        <FileText size={16} className="text-gray-500" />
                        <span>Exportar a CSV (.csv)</span>
                    </button>
                </div>
            )}
        </div>
    );
};

interface HarvestDetailProps {
    onBack: () => void;
}

const HarvestDetail: FC<HarvestDetailProps> = ({ onBack }) => {
    const { harvestSessionId } = useParams<{ harvestSessionId: string }>();
    const { session: harvestSession, loading } = useHarvestSession(harvestSessionId || '');
    const { registers } = useHarvestSessionRegisters(harvestSessionId || '');
    const [isUpdatingAdvance, setIsUpdatingAdvance] = useState(false);
    const [isAdvanceModalOpen, setIsAdvanceModalOpen] = useState(false);
    const [isEditManagerModalOpen, setIsEditManagerModalOpen] = useState(false);
    const [isSubmittingManager, setIsSubmittingManager] = useState(false);
    const navigate = useNavigate();

    // Determinar la pestaña activa basándose en la URL
    const matchSummary = useMatch('/harvest-sessions/:harvestSessionId/details/summary');
    const matchRegisters = useMatch('/harvest-sessions/:harvestSessionId/details/registers');
    const matchHarvesters = useMatch('/harvest-sessions/:harvestSessionId/details/harvesters');

    const activeTab = useMemo(() => {
        if (matchRegisters) return 'registers';
        if (matchHarvesters) return 'harvesters';
        return 'summary';
    }, [matchSummary, matchRegisters, matchHarvesters]);

    // Redirige a la pestaña de resumen si se accede a la ruta base sin sub-ruta
    useEffect(() => {
        if (harvestSessionId && !matchSummary && !matchRegisters && !matchHarvesters) {
            navigate(`/harvest-sessions/${harvestSessionId}/details/registers`, { replace: true });
        }
    }, [harvestSessionId, matchSummary, matchRegisters, matchHarvesters, navigate]);

    const handleExport = (format: string) => {
        if (!harvestSession && !registers) return;

        if (format === 'csv') {
            exportToCsv(harvestSession, registers);
        } else {
            exportToXlsx(harvestSession, registers);
        }
    };

    const handleUpdateAdvance = async (data: any) => {
        setIsUpdatingAdvance(true);
        try {
            updateHarvestSessionProgress(harvestSession.id, data.status, data.harvested_hectares);
            setIsAdvanceModalOpen(false);
        } catch (error) {
            console.error('Error al actualizar avance:', error);
        } finally {
            setIsUpdatingAdvance(false);
        }
    };

    const TabButton: FC<{ isActive: boolean; to: string; children: React.ReactNode }> = ({ isActive, to, children }) => (
        <Link
            to={to}
            replace
            className={`flex-1 px-4 py-3 rounded-xl font-bold transition-all text-sm md:text-base text-center ${isActive
                ? 'bg-surface text-text-primary shadow-sm'
                : 'text-text-secondary hover:text-text-primary'
                }`}
        >
            {children}
        </Link>
    );

    if (loading) {
        return <p className="text-center text-text-secondary py-8">Cargando detalles de la sesión...</p>;
    }

    if (!harvestSession) {
        return <p className="text-center text-red-500 py-8">Sesión de cosecha no encontrada.</p>;
    }

    const progress = harvestSession.harvested_hectares && harvestSession.hectares
        ? Math.round((harvestSession.harvested_hectares / harvestSession.hectares) * 100)
        : 0;

    return (
        <>

            {isAdvanceModalOpen && (
                <UpdateAdvanceModal
                    isOpen={isAdvanceModalOpen}
                    onClose={() => setIsAdvanceModalOpen(false)}
                    onSubmit={handleUpdateAdvance}
                    harvestSession={harvestSession}
                    isSubmitting={isUpdatingAdvance}
                />
            )}
            {isEditManagerModalOpen && (
                <EditManagerModal
                    session={harvestSession}
                    isOpen={isEditManagerModalOpen}
                    onClose={() => setIsEditManagerModalOpen(false)}
                />
            )}

            <div className="space-y-4 animate-fade-in">
                <PageHeader title="Sesion de cosecha" breadcrumbs={[{ label: `Lote ${harvestSession.plot.name}` }]}>
                    <ExportDropdown onExport={handleExport} />
                </PageHeader>

                <Button variant="secondary" icon={ArrowLeft} onClick={onBack}>
                    Volver a Lotes
                </Button>
                <Card>
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <p className="font-semibold text-xl text-text-primary">
                                Lote {harvestSession.plot?.name || 'Sin nombre'}
                            </p>
                            <p className="text-md text-text-secondary">
                                {harvestSession.crop?.name} - {harvestSession.field?.name}
                            </p>
                        </div>
                        <div className="flex flex-col items-start">
                            <p className="text-sm text-gray-500 mb-1">Estado</p>
                            <StatusBadge status={harvestSession.status} className="text-sm px-3 py-1.5" />
                        </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-200 mb-4">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm text-gray-500">Responsable de Cosecha</p>
                                <p className="font-semibold text-gray-800">{harvestSession.harvest_manager?.name || 'No asignado'}</p>
                            </div>
                            <Button variant="ghost" icon={Edit} aria-label="Editar Responsable" onClick={() => setIsEditManagerModalOpen(true)} className="p-2" />
                        </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex justify-between items-baseline">
                            <h3 className="text-lg font-bold text-text-primary">Avance de Cosecha</h3>
                            <span className="text-sm font-medium text-text-secondary">
                                {harvestSession.harvested_hectares || 0} ha / {harvestSession.hectares || 0} ha ({progress}%)
                            </span>
                        </div>
                        <div className="mt-2 h-4 w-full bg-background rounded-full overflow-hidden">
                            <div style={{ width: `${progress}%` }} className="h-full bg-primary"></div>
                        </div>
                        <div className="flex justify-center md:justify-end mt-4 ">
                            <Button
                                variant="secondary"
                                className="w-full md:w-auto"
                                onClick={() => setIsAdvanceModalOpen(true)}
                                isLoading={isUpdatingAdvance}
                                icon={isUpdatingAdvance ? undefined : PlayCircle}
                            >
                                {isUpdatingAdvance ? 'Actualizando...' : 'Actualizar Avance'}
                            </Button>
                        </div>
                    </div>
                </Card>
                <div className="bg-background p-2 rounded-2xl">
                    <div className="flex space-x-1">
                        <TabButton
                            isActive={activeTab === 'summary'}
                            to={`/harvest-sessions/${harvestSession.id}/details/summary`}
                        >
                            Resumen
                        </TabButton>
                        <TabButton
                            isActive={activeTab === 'registers'}
                            to={`/harvest-sessions/${harvestSession.id}/details/registers`}
                        >
                            Registros
                        </TabButton>
                        <TabButton
                            isActive={activeTab === 'harvesters'}
                            to={`/harvest-sessions/${harvestSession.id}/details/harvesters`}
                        >
                            Cosecheros
                        </TabButton>
                    </div>
                </div>

                {/* Contenido dinámico según la pestaña seleccionada - renderizado por Outlet */}
                <div className="animate-fade-in-fast">
                    <Outlet context={{ harvestSession, registers }} />
                </div>
            </div>
        </>
    );
};

export default HarvestDetail;

// --- Pestaña de Resumen ---
export const SummaryTab: FC = () => {
    const { harvestSession } = useOutletContext<any>();

    const totalKg = harvestSession.total_kgs || harvestSession.harvested_kgs || 0;
    const rindeCosechado = harvestSession.yield?.harvested || 0;
    const rindeSembrado = harvestSession.yield?.sown || 0;
    const rindeEstimado = harvestSession.estimated_yield || 0;

    return (
        <div className="space-y-6">
            <Card>
                <h3 className="text-lg font-bold text-center text-text-primary">Resumen del Lote</h3>
                <div className="text-center my-2">
                    <p className="text-sm text-text-secondary">Kg Totales</p>
                    <p className="text-4xl font-bold text-primary-dark">
                        {totalKg.toLocaleString()}
                    </p>
                </div>
                <div className="grid grid-cols-2 gap-6 text-center my-6 py-6 border-t border-b border-gray-100">
                    <div>
                        <p className="text-sm text-text-secondary">Rinde ha/Cosechado</p>
                        <p className="text-2xl font-bold text-text-primary">
                            {rindeCosechado.toLocaleString()}
                            <span className="text-lg font-normal text-gray-400"> kg/ha</span>
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-text-secondary">Rinde ha/Sembrado</p>
                        <p className="text-2xl font-bold text-text-primary">
                            {rindeSembrado.toLocaleString()}
                            <span className="text-lg font-normal text-gray-400"> kg/ha</span>
                        </p>
                    </div>
                </div>
                <YieldPerformanceCard
                    real={rindeCosechado}
                    estimated={rindeEstimado}
                />
            </Card>
        </div>
    );
};

// --- Pestaña de Registro ---
export const RegistersTab: FC = () => {
    const { registers, harvestSession } = useOutletContext<any>();
    const [isAddRegisterModalOpen, setIsAddRegisterModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedRegister, setSelectedRegister] = useState<any>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const { currentUser } = useAuth();
    const { destinations } = useDestinations();
    const { siloBags } = useSiloBags();
    const handleAddRegisterSubmit = async (data: any) => {
        setIsSubmitting(true);
        try {
            const batch = writeBatch(db);
            let siloBagForRegister: { id: string, name: string, location: string };
            let silobagData;

            const isNewSiloBag = data.type === 'silo_bag' && !data.siloBagId;
            if (isNewSiloBag) {
                const newSiloBagRef = doc(collection(db, 'silo_bags'));
                silobagData = {
                    id: newSiloBagRef.id,
                    name: data.newSiloBagName,
                    crop: {
                        id: harvestSession.crop.id,
                        name: harvestSession.crop.name
                    },
                    initial_kg: parseFloat(data.weight_kg),
                    location: data.location,
                    organization_id: currentUser.organizationId,
                    status: 'active',
                    created_at: Timestamp.fromDate(new Date())
                };

                batch.set(newSiloBagRef, silobagData);
                siloBagForRegister = { id: silobagData.id, name: silobagData.name, location: silobagData.location };

            } else if (data.type === 'silo_bag') {
                const existingSiloBag = siloBags.find(sb => sb.id === data.siloBagId);
                siloBagForRegister = { id: existingSiloBag.id, name: existingSiloBag.name, location: existingSiloBag.location };
            }

            const registerRef = doc(collection(db, `harvest_sessions/${harvestSession.id}/registers`));
            const destination = destinations.find((d) => d.id === data.destinationId);

            const registerData = {
                organization_id: currentUser.organizationId,
                date: Timestamp.fromDate(new Date()),
                humidity: parseFloat(data.humidity),
                weight_kg: parseFloat(data.weight_kg),
                type: data.type,
                details: data.observations,
                ...(data.type === 'truck' ? {
                    truck: {
                        driver: data.driver,
                        license_plate: data.license_plate
                    },
                    destination: destination || null,
                    ctg: data.ctg || null,
                    cpe: data.cpe || null
                } : {
                    silo_bag: siloBagForRegister
                })
            };

            batch.set(registerRef, registerData);

            batch.commit();

            setIsAddRegisterModalOpen(false);

        } catch (error) {
            console.error('Error al agregar registro:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditSubmit = async (data: any) => {
        setIsSubmitting(true);
        try {
            if (!selectedRegister) {
                throw new Error("No hay un registro seleccionado para editar.");
            }

            const batch = writeBatch(db);
            let siloBagForRegister: { id: string, name: string, location: string };
            // 1. Obtener la referencia al documento del registro existente
            const registerRef = doc(db, `harvest_sessions/${harvestSession.id}/registers`, selectedRegister.id);

            // 2. Preparar los datos actualizados del formulario
            const destination = destinations.find((d) => d.id === data.destinationId);
            if (data.type === 'silo_bag') {
                const existingSiloBag = siloBags.find(sb => sb.id === data.siloBagId);
                siloBagForRegister = { id: existingSiloBag.id, name: existingSiloBag.name, location: data.location }
            }

            const updatedRegisterData = {
                humidity: parseFloat(data.humidity),
                weight_kg: parseFloat(data.weight_kg),
                details: data.observations,
                ...(data.type === 'truck' ? {
                    truck: {
                        driver: data.driver,
                        license_plate: data.license_plate
                    },
                    destination: destination || null,
                    ctg: data.ctg || null,
                    cpe: data.cpe || null
                } : {
                    silo_bag: siloBagForRegister
                })
            };

            batch.update(registerRef, updatedRegisterData);

            // 5. Ejecutar todas las operaciones del lote
            await batch.commit();

            setIsEditModalOpen(false); // Cierra el modal al tener éxito
        } catch (error) {
            console.error('Error al editar el registro:', error);
            // Aquí deberías mostrar un mensaje de error al usuario
        } finally {
            setIsSubmitting(false);
        }
    };

    const openDeleteModal = (register: any) => {
        setSelectedRegister(register);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!selectedRegister) return;
        setIsSubmitting(true);
        try {
            deleteRegister(selectedRegister.id, harvestSession.id);
            setIsDeleteModalOpen(false);
            setSelectedRegister(null);
        } catch (error) {
            console.error("Error al eliminar el registro:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const openEditModal = (register: any) => {
        setSelectedRegister(register);
        setIsEditModalOpen(true);
    };

    return (
        <>
            {isAddRegisterModalOpen && <AddRegisterModal isOpen={isAddRegisterModalOpen} onClose={() => setIsAddRegisterModalOpen(false)} onSubmit={handleAddRegisterSubmit} isSubmitting={isSubmitting} />}
            {isEditModalOpen && selectedRegister && <EditRegisterModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} onSubmit={handleEditSubmit} isSubmitting={isSubmitting} register={selectedRegister} />}
            {isDeleteModalOpen && selectedRegister && <DeleteRegisterModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={handleConfirmDelete} isSubmitting={isSubmitting} />}
            <div className="space-y-6">
                <div className="flex justify-center mt-4">
                    <Button className="w-full md:w-1/2" icon={PlusCircle} onClick={() => setIsAddRegisterModalOpen(true)} >
                        Añadir Nuevo Registro
                    </Button>
                </div>
                <Card>
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Registros de Cosecha</h3>
                    <div className="max-h-[60vh] overflow-y-auto pr-2">
                        {registers && registers.length > 0 ? (
                            <>
                                <div className="hidden md:block">
                                    <table className="w-full text-left text-sm">
                                        <thead className="border-b-2 border-gray-200 bg-gray-50">
                                            <tr>
                                                <th className="p-3 font-semibold text-gray-600 uppercase tracking-wider">Fecha</th>
                                                <th className="p-3 font-semibold text-gray-600 uppercase tracking-wider">Tipo</th>
                                                <th className="p-3 font-semibold text-gray-600 uppercase tracking-wider text-right">Kgs</th>
                                                <th className="p-3 font-semibold text-gray-600 uppercase tracking-wider">ID/Patente</th>
                                                <th className="p-3 font-semibold text-gray-600 uppercase tracking-wider">Chofer</th>
                                                <th className="p-3 font-semibold text-gray-600 uppercase tracking-wider">Destino</th>
                                                <th className="p-3 font-semibold text-gray-600 uppercase tracking-wider">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {registers.map((reg: any) => (
                                                <tr key={reg.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="p-3 whitespace-nowrap">{reg.date ? format(new Date(reg.date.seconds * 1000), 'dd/MM/yy HH:mm') : '-'}</td>
                                                    <td className="p-3"><div className="flex items-center gap-2">{reg.type === 'truck' ? <Truck size={16} className="text-gray-500" /> : <Archive size={16} className="text-gray-500" />}<span>{reg.type === 'truck' ? 'Camión' : 'Silo Bolsa'}</span></div></td>
                                                    <td className="p-3 text-right font-medium text-gray-800">{reg.weight_kg?.toLocaleString()}</td>
                                                    <td className="p-3 font-mono">{reg.truck?.license_plate || reg.silo_bag?.name || '-'}</td>
                                                    <td className="p-3">{reg.truck?.driver || '-'}</td>
                                                    <td className="p-3">{reg.destination?.name || reg.silo_bag?.location || '-'}</td>
                                                    <td className="p-3"><div className="flex gap-1"><Button variant="ghost" aria-label="Editar" onClick={() => openEditModal(reg)}><Edit size={16} /></Button><Button variant="ghost" aria-label="Eliminar" onClick={() => openDeleteModal(reg)}><Trash2 size={16} className="text-red-500 hover:text-red-700" /></Button></div></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="md:hidden space-y-4">
                                    {registers.map((reg: any) => (
                                        <Card key={reg.id} className="bg-white border">
                                            <div className="flex justify-between items-start">
                                                <div className="flex items-center gap-3">
                                                    <div className="bg-blue-100 p-3 rounded-full">
                                                        {reg.type === 'truck' ? <Truck size={20} className="text-blue-600" /> : <Archive size={20} className="text-blue-600" />}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-800">{reg.truck?.license_plate || reg.silo_bag?.name}</p>
                                                        <p className="text-xs text-gray-500">{reg.date ? format(new Date(reg.date.seconds * 1000), 'dd/MM/yyyy HH:mm') : '-'}</p>
                                                    </div>
                                                </div>
                                                <div className="flex -mr-2 -mt-2">
                                                    <Button variant="ghost" onClick={() => openEditModal(reg)}><Edit size={16} /></Button>
                                                    <Button variant="ghost" onClick={() => openDeleteModal(reg)}><Trash2 size={16} className="text-red-500" /></Button>
                                                </div>
                                            </div>
                                            <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-4 text-sm">
                                                <div className="flex items-center gap-2"><Scale size={14} className="text-gray-400" /><p><span className="font-semibold">{reg.weight_kg?.toLocaleString()}</span> kg</p></div>
                                                <div className="flex items-center gap-2"><Droplets size={14} className="text-gray-400" /><p><span className="font-semibold">{reg.humidity || 0}</span> %</p></div>
                                                {reg.type === 'truck' ? (
                                                    <>
                                                        <div className="flex items-center gap-2"><MapPin size={14} className="text-gray-400" /><p>{reg.destination?.name || 'N/A'}</p></div>
                                                        <div className="flex items-center gap-2"><User size={14} className="text-gray-400" /><p>{reg.truck?.driver || 'N/A'}</p></div>
                                                    </>
                                                ) : (
                                                    <div className="col-span-2 flex items-center gap-2"><MapPin size={14} className="text-gray-400" /><p>{reg.silo_bag?.location || 'N/A'}</p></div>
                                                )}
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            </>
                        ) : (<div className="text-center text-gray-500 py-8"><p>No hay registros de cosecha para este lote.</p></div>)}
                    </div>
                </Card>
            </div >
        </>
    );
};

// --- Pestaña de Cosecheros ---
export const HarvestersTab: FC = () => {
    const { harvestSession } = useOutletContext<any>();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleEditSubmit = async (data: any) => {
        setIsSubmitting(true);
        try {
            const updatedHarvesters = data.harvesters.map(h => ({
                id: h.id,
                name: h.name,
                plot_map: h.plot_map || false,
                harvested_hectares: parseFloat(h.harvested_hectares) || 0
            }));
            upsertHarvesters(harvestSession.id, updatedHarvesters)
            setIsEditModalOpen(false);
        } catch (error) {
            console.error("Error al editar cosecheros:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            {isEditModalOpen && (
                <ManageHarvestersModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    onSubmit={handleEditSubmit}
                    isSubmitting={isSubmitting}
                    harvestSession={harvestSession}
                />
            )}
            <Card>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-gray-800">Cosecheros Asignados</h3>
                    <Button variant="ghost" icon={Edit} aria-label="Editar Cosecheros" onClick={() => setIsEditModalOpen(true)} />
                </div>
                <div className="space-y-4">
                    {harvestSession.harvesters && harvestSession.harvesters.length > 0 ? (
                        harvestSession.harvesters.map((h: any, i: number) => {
                            const progress = h.harvested_hectares && harvestSession.harvested_hectares > 0
                                ? (h.harvested_hectares / harvestSession.harvested_hectares) * 100
                                : 0;
                            return (
                                <div key={h.id || i} className="bg-gray-50 p-4 rounded-xl">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-primary-light p-3 rounded-full">
                                            <Tractor size={20} className="text-primary-dark" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-baseline">
                                                <p className="font-semibold text-gray-900">{h.name}</p>
                                                <span className="text-sm font-bold text-gray-800">{h.harvested_hectares || 0} ha</span>
                                            </div>
                                            <p className="text-sm text-gray-500">
                                                {h.plot_map ? 'Con mapeo' : 'Sin mapeo'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="mt-3 h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                                        <div style={{ width: `${progress}%` }} className="h-full bg-primary rounded-full"></div>
                                    </div>
                                </div>
                            )
                        })
                    ) : (
                        <div className="text-center py-4 text-gray-500">
                            <p>No hay cosecheros asignados a este lote.</p>
                        </div>
                    )}
                </div>
            </Card>
        </>
    );
};