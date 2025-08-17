// src/pages/harvest-sessions/HarvestDetails.tsx
import { ArrowLeft, Download, Edit, FileSpreadsheet, FileText, PlayCircle, } from "lucide-react";
import { type FC, useMemo, useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useMatch, Link, Outlet } from "react-router";
import Button from "../../components/commons/Button";
import Card from "../../components/commons/Card";
import { useHarvestSession } from "../../hooks/harvest-session/useHarvestSession";
import { useHarvestSessionRegisters } from "../../hooks/harvest-session-register/useHarvestSessionRegisters";

import PageHeader from "../../components/commons/layout/PageHeader";
import { exportToCsv, exportToXlsx } from "../../services/export";
import { updateHarvestSessionProgress } from "../../services/harvestSession";
import UpdateAdvanceModal from "../../components/harvest-session/modals/UpdateAdvanceModal";
import StatusBadge from "../../components/commons/StatusBadge";
import EditManagerModal from "../../components/harvest-session/modals/harvest-managers/EditHarvestManagerModal";

const ExportDropdown = ({ onExport }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

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

