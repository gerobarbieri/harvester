import { ArrowLeft, Edit, PlayCircle, PlusCircle, Trash2 } from "lucide-react";
import { FC, useMemo, useEffect, useState } from "react";
import { useParams, useNavigate, useMatch, Link, Outlet, useOutletContext } from "react-router";
import Button from "../../components/commons/Button";
import Card from "../../components/commons/Card";
import YieldPerformanceCard from "../../components/dashboards/reports/harvest-report/ui/YieldPerformanceCard";
import { useHarvestSession } from "../../hooks/harvest-session/useHarvestSession";

interface HarvestDetailProps {
    onBack: () => void;
}

const HarvestDetail: FC<HarvestDetailProps> = () => {
    const { harvestSessionId } = useParams<{ harvestSessionId: string }>();
    const { harvestSession, loading } = useHarvestSession(harvestSessionId);
    const navigate = useNavigate();

    // Determinar la pestaña activa basándose en la URL
    const matchResumen = useMatch(`/campaigns/:campaignId/fields/:fieldId/harvest-sessions/:harvestSessionId`);
    const matchRegistro = useMatch(`/campaigns/:campaignId/fields/:fieldId/harvest-sessions/:harvestSessionId/registro`);
    const matchCosecheros = useMatch(`/campaigns/:campaignId/fields/:fieldId/harvest-sessions/:harvestSessionId/cosecheros`);

    const activeTab = useMemo(() => {
        if (matchRegistro) return 'registro';
        if (matchCosecheros) return 'cosecheros';
        return 'resumen'; // Default tab
    }, [matchResumen, matchRegistro, matchCosecheros]);

    // Redirige a la pestaña de resumen si se accede a la ruta base sin sub-ruta
    useEffect(() => {
        if (!matchResumen && !matchRegistro && !matchCosecheros && harvestSessionId) {
            navigate(`/campaigns/some-campaign-id/fields/some-field-id/harvest-sessions/${harvestSessionId}/resumen`, { replace: true });
        }
    }, [harvestSessionId, matchResumen, matchRegistro, matchCosecheros, navigate]);


    const [isUpdatingAdvance, setIsUpdatingAdvance] = useState(false);
    // const showToast = useToast(); // Descomentar si usas un ToastProvider

    const handleUpdateAdvance = async () => {
        setIsUpdatingAdvance(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        // showToast('Avance actualizado correctamente!', 'success'); // Descomentar si usas un ToastProvider
        setIsUpdatingAdvance(false);
    };

    const TabButton: FC<{ isActive: boolean; to: string; children: React.ReactNode }> = ({ isActive, to, children }) => (
        <Link
            to={to}
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

    return (
        <div className="space-y-4 animate-fade-in">
            <Button variant="secondary" icon={ArrowLeft} onClick={onBack}>
                Volver a Lotes
            </Button>
            <Card>
                <div className="flex justify-between items-center">
                    <div>
                        <p className="text-sm text-text-secondary">Responsable de cosecha</p>
                        <p className="font-semibold text-base text-text-primary">{harvestSession.responsible}</p>
                    </div>
                    <Button variant="ghost" icon={Edit} aria-label="Editar Responsable" onClick={() => console.log('Editar Responsable')} />
                </div>
            </Card>

            <div className="bg-background p-2 rounded-2xl">
                <div className="flex space-x-1">
                    <TabButton
                        isActive={activeTab === 'resumen'}
                        to={`/campaigns/some-campaign-id/fields/some-field-id/harvest-sessions/${harvestSession.id}/resumen`}
                    >
                        Resumen
                    </TabButton>
                    <TabButton
                        isActive={activeTab === 'registro'}
                        to={`/campaigns/some-campaign-id/fields/some-field-id/harvest-sessions/${harvestSession.id}/registro`}
                    >
                        Registros
                    </TabButton>
                    <TabButton
                        isActive={activeTab === 'cosecheros'}
                        to={`/campaigns/some-campaign-id/fields/some-field-id/harvest-sessions/${harvestSession.id}/cosecheros`}
                    >
                        Cosecheros
                    </TabButton>
                </div>
            </div>

            {/* Contenido dinámico según la pestaña seleccionada - renderizado por Outlet */}
            <div className="animate-fade-in-fast">
                <Outlet context={{ harvestSession, handleUpdateAdvance, isUpdatingAdvance }} />
            </div>
        </div>
    );
};

export default HarvestDetail;


// --- Pestaña de Resumen ---
interface ResumenTabProps {
    // harvestSession: HarvestSession; // Ya no se pasa directamente, se obtiene del contexto de Outlet
}

export const ResumenTab: FC<ResumenTabProps> = () => {
    const { harvestSession, handleUpdateAdvance, isUpdatingAdvance } = useOutletContext<any>(); // Obtener del contexto

    const harvestedHa = (harvestSession.ha * (harvestSession.progress / 100)).toFixed(1);

    return (
        <div className="space-y-6">
            <Card>
                <div className="flex justify-between items-baseline">
                    <h3 className="text-lg font-bold text-text-primary">Avance de Cosecha</h3>
                    <span className="text-sm font-medium text-text-secondary">{harvestedHa} ha / {harvestSession.ha} ha ({harvestSession.progress}%)</span>
                </div>
                <div className="mt-2 h-4 w-full bg-background rounded-full overflow-hidden">
                    <div style={{ width: `${harvestSession.progress}%` }} className="h-full bg-primary"></div>
                </div>
                <Button variant="secondary" className="w-full mt-4" onClick={handleUpdateAdvance} isLoading={isUpdatingAdvance} icon={isUpdatingAdvance ? undefined : PlayCircle}>
                    {isUpdatingAdvance ? 'Actualizando...' : 'Actualizar Avance'}
                </Button>
            </Card>
            <Card>
                <h3 className="text-lg font-bold text-center text-text-primary">Resumen del Lote</h3>
                <div className="text-center my-2">
                    <p className="text-sm text-text-secondary">Kg Totales</p>
                    <p className="text-4xl font-bold text-primary-dark">{harvestSession.totalKg.toLocaleString()}</p>
                </div>
                <div className="grid grid-cols-2 gap-6 text-center my-6 py-6 border-t border-b border-gray-100">
                    <div>
                        <p className="text-sm text-text-secondary">Rinde ha/Cosechado</p>
                        <p className="text-2xl font-bold text-text-primary">{harvestSession.rindeCosechado.toLocaleString()} <span className="text-lg font-normal text-gray-400">kg/ha</span></p>
                    </div>
                    <div>
                        <p className="text-sm text-text-secondary">Rinde ha/Sembrado</p>
                        <p className="text-2xl font-bold text-text-primary">{harvestSession.rindeSembrado.toLocaleString()} <span className="text-lg font-normal text-gray-400">kg/ha</span></p>
                    </div>
                </div>
                <YieldPerformanceCard actual={harvestSession.rindeCosechado} estimated={harvestSession.rindeEstimado} />
            </Card>
        </div>
    );
};

// --- Pestaña de Registro ---
interface RegistroTabProps {
    // harvestSession: HarvestSession; // Ya no se pasa directamente, se obtiene del contexto de Outlet
}

export const RegistroTab: FC<RegistroTabProps> = () => {
    const { harvestSession } = useOutletContext<any>(); // Obtener del contexto

    const records = [
        { id: 1, fecha: '2025-08-09 17:56', tipo: 'Camión', kgs: 28500, humedad: 14.5, patente: 'AE123FD', chofer: 'Carlos Gomez', destino: 'Acopio "El Cereal"' },
        { id: 2, fecha: '2025-08-09 13:48', tipo: 'Camión', kgs: 29100, humedad: 14.2, patente: 'AD987BC', chofer: 'Juan Perez', destino: 'Acopio "El Cereal"' },
        { id: 3, fecha: '2025-08-08 19:10', tipo: 'Silobolsa', kgs: 180000, humedad: 15.0, patente: 'N/A', chofer: '-', destino: 'SILO-03' },
        { id: 4, fecha: '2025-08-08 19:10', tipo: 'Silobolsa', kgs: 180000, humedad: 15.0, patente: 'N/A', chofer: '-', destino: 'SILO-03' },
        { id: 5, fecha: '2025-08-08 19:10', tipo: 'Silobolsa', kgs: 180000, humedad: 15.0, patente: 'N/A', chofer: '-', destino: 'SILO-03' },
        { id: 6, fecha: '2025-08-08 19:10', tipo: 'Silobolsa', kgs: 180000, humedad: 15.0, patente: 'N/A', chofer: '-', destino: 'SILO-03' },
    ];

    return (
        <div className="space-y-6">
            {/* CAMBIO: Botón de añadir ahora está en su pestaña correspondiente */}
            <Button className="w-full" icon={PlusCircle} onClick={() => console.log('Añadir nuevo registro')}>Añadir Nuevo Registro</Button>
            <Card>
                <h3 className="text-lg font-bold text-text-primary mb-4">Registros de Cosecha</h3>
                <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-4">


                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b border-gray-100 text-text-secondary">
                                <tr>
                                    <th className="p-3 font-semibold">Fecha</th>
                                    <th className="p-3 font-semibold">Tipo</th>
                                    <th className="p-3 font-semibold text-right">Kgs</th>
                                    <th className="p-3 font-semibold text-right">Humedad</th>
                                    <th className="p-3 font-semibold">ID/Patente</th>
                                    <th className="p-3 font-semibold">Chofer</th>
                                    <th className="p-3 font-semibold">Destino</th>
                                    <th className="p-3 font-semibold">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {records.map(rec => (
                                    <tr key={rec.id} className="border-b border-gray-100 last:border-0">
                                        <td className="p-3">{rec.fecha}</td>
                                        <td className="p-3">{rec.tipo}</td>
                                        <td className="p-3 text-right font-medium">{rec.kgs.toLocaleString()}</td>
                                        <td className="p-3 text-right">{rec.humedad}%</td>
                                        <td className="p-3">{rec.patente}</td>
                                        <td className="p-3">{rec.chofer}</td>
                                        <td className="p-3">{rec.destino}</td>
                                        <td className="p-3">
                                            <div className="flex gap-1">
                                                <Button variant="ghost" aria-label="Editar" onClick={() => console.log('Editar registro', rec.id)}><Edit size={16} /></Button>
                                                <Button variant="ghost" aria-label="Eliminar" onClick={() => console.log('Eliminar registro', rec.id)}><Trash2 size={16} /></Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Vista para Móvil (Tarjetas) */}
                    <div className="md:hidden space-y-4">
                        {records.map(rec => (
                            <Card key={rec.id} className="bg-background">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-bold text-text-primary">{rec.tipo} - {rec.patente}</p>
                                        <p className="text-xs text-text-secondary">{rec.fecha}</p>
                                    </div>
                                    <div className="flex -mr-2 -mt-2">
                                        <Button variant="ghost" onClick={() => console.log('Editar registro', rec.id)}><Edit size={16} /></Button>
                                        <Button variant="ghost" onClick={() => console.log('Eliminar registro', rec.id)}><Trash2 size={16} /></Button>
                                    </div>
                                </div>
                                <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                                    <div><p className="text-text-secondary">Kgs</p><p className="font-semibold">{rec.kgs.toLocaleString()}</p></div>
                                    <div><p className="text-text-secondary">Humedad</p><p className="font-semibold">{rec.humedad}%</p></div>
                                    <div className="col-span-2"><p className="text-text-secondary">Chofer</p><p className="font-semibold">{rec.chofer}</p></div>
                                    <div className="col-span-2"><p className="text-text-secondary">Destino</p><p className="font-semibold">{rec.destino}</p></div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            </Card>
        </div>
    );
};

// --- Pestaña de Cosecheros ---
interface CosecherosTabProps {
    // harvestSession: HarvestSession; // Ya no se pasa directamente, se obtiene del contexto de Outlet
}

export const CosecherosTab: FC<CosecherosTabProps> = () => {
    const { harvestSession } = useOutletContext<any>(); // Obtener del contexto

    return (
        <Card>
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-bold text-text-primary">Cosecheros Asignados</h3>
                <Button variant="ghost" icon={Edit} aria-label="Editar Cosecheros" onClick={() => console.log('Editar Cosecheros')} />
            </div>
            <div className="space-y-3 pt-2">
                {harvestSession.harvesters.map((h, i) => (
                    <div key={i} className="flex justify-between items-center bg-background p-3 rounded-lg">
                        <p className="font-semibold text-text-primary">{h.name}</p>
                        <p className="text-text-secondary font-medium">{h.ha} ha cosechadas</p>
                    </div>
                ))}
                {harvestSession.harvesters.length === 0 && (
                    <div className="text-center py-4 text-text-secondary">
                        <p>No hay cosecheros asignados a este lote.</p>
                    </div>
                )}
            </div>
        </Card>
    );
};