import { Link, Outlet, useMatch, useNavigate, useOutletContext } from "react-router";
import PageHeader from "../../components/commons/layout/PageHeader";
import { Weight, Leaf, Tractor, Award, PieChart } from "lucide-react";
import { type FC, useState, useEffect, useMemo } from "react";
import type { Field } from "react-hook-form";
import Card from "../../components/commons/Card";
import Select from "../../components/commons/form/Select";
import StatCard from "../../components/dashboards/commons/StatCard";
import DestinationChart from "../../components/dashboards/reports/destinations-report/ui/DestinationChart";
import YieldPerformanceCard from "../../components/dashboards/reports/harvest-report/ui/YieldPerformanceCard";
import { useCampaigns } from "../../hooks/campaign/useCampaigns";
import { useHarvestSessionsByCampaign } from "../../hooks/harvest-session/useHarvestSessionsByCampaign";
import type { Campaign, Crop, Plot } from "../../types";

interface FiltersProps {
    campaigns: Campaign[];
    campaignsLoading: boolean;
    filters: { campaign: string; crop: string; field: string; plot: string; };
    availableCrops: Crop[];
    availableFields: Field[];
    availablePlots: Plot[];
    sessionsLoading: boolean;
    handleFilterChange: (filterName: string, value: string) => void;
}

const Filters: FC<FiltersProps> = ({
    campaigns,
    campaignsLoading,
    filters,
    availableCrops,
    availableFields,
    availablePlots,
    sessionsLoading,
    handleFilterChange
}) => (
    <Card>
        <h2 className="text-lg font-bold text-text-primary mb-4">Filtros</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Select
                label="Campaña"
                items={campaigns}
                name="campaign"
                placeholder="Seleccione una campaña"
                value={filters.campaign}
                onChange={(e) => handleFilterChange('campaign', e.target.value)}
                disabled={campaignsLoading}
            />
            <Select
                label="Cultivo"
                items={availableCrops}
                name="crop"
                placeholder="Todos los cultivos"
                value={filters.crop}
                onChange={(e) => handleFilterChange('crop', e.target.value)}
                disabled={!filters.campaign || sessionsLoading}
            />
            <Select
                label="Campo"
                items={availableFields}
                name="field"
                placeholder="Todos los campos"
                value={filters.field}
                onChange={(e) => handleFilterChange('field', e.target.value)}
                disabled={!filters.campaign || sessionsLoading}
            />
            <Select
                label="Lote"
                items={availablePlots}
                name="plot"
                placeholder="Todos los lotes"
                value={filters.plot}
                onChange={(e) => handleFilterChange('plot', e.target.value)}
                disabled={!filters.campaign || sessionsLoading}
            />
        </div>
    </Card>
);

export const HarvestSection: FC = () => {
    const { analytics, sessionsLoading } = useOutletContext<any>(); // Obtener del contexto

    const avanceCosecha = analytics.hectareasTotales > 0 ? (analytics.hectareasCosechadas / analytics.hectareasTotales) * 100 : 0;

    if (sessionsLoading) {
        return <p className="text-center text-text-secondary py-8">Calculando datos de cosecha...</p>;
    }

    return (
        <div className="space-y-4 lg:space-y-6 animate-fade-in">
            <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
                <Card className="flex-1">
                    <h3 className="text-lg font-semibold text-text-primary mb-2">Avance de Cosecha</h3>
                    <div className="text-3xl font-bold text-text-primary mb-4">{avanceCosecha.toFixed(1)}%</div>
                    <div className="w-full bg-background rounded-full h-3 mb-2">
                        <div
                            className="bg-primary h-3 rounded-full transition-all duration-500"
                            style={{ width: `${avanceCosecha}%` }}
                        ></div>
                    </div>
                    <p className="text-text-secondary text-sm">
                        {analytics.hectareasCosechadas.toLocaleString('es-AR')} ha / {analytics.hectareasTotales.toLocaleString('es-AR')} ha
                    </p>
                </Card>
                <YieldPerformanceCard actual={analytics.rindeCosechado} estimated={analytics.rindeEstimado} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
                <StatCard title="Kg Cosechados" value={(analytics.kgCosechados / 1000).toLocaleString('es-AR', { maximumFractionDigits: 0 })} unit="tn" icon={<Weight className="w-5 h-5" />} color="orange" />
                <StatCard title="Rinde Sembrado" value={analytics.rindeSembrado.toLocaleString('es-AR', { maximumFractionDigits: 0 })} unit="kg/ha" icon={<Leaf className="w-5 h-5" />} color="blue" />
                <StatCard title="Rinde Cosechado" value={analytics.rindeCosechado.toLocaleString('es-AR', { maximumFractionDigits: 0 })} unit="kg/ha" icon={<Tractor className="w-5 h-5" />} color="green" />
            </div>
        </div>
    );
};

export const HarvestersSection: FC = () => {
    const { analytics, sessionsLoading } = useOutletContext<any>(); // Obtener del contexto

    if (sessionsLoading) {
        return <p className="text-center text-text-secondary py-8">Cargando datos de cosecheros...</p>;
    }

    return (
        <Card className="animate-fade-in">
            <div className="flex items-center space-x-2 mb-6">
                <Award className="w-5 h-5 text-text-secondary" />
                <h3 className="text-lg font-semibold text-text-primary">Ranking de Cosecheros</h3>
            </div>
            <div className="space-y-4">
                {analytics.harvesterData.length > 0 ? (
                    analytics.harvesterData.map((h: any, i: number) => (
                        <div key={h.id} className="flex justify-between items-center py-3 border-b border-gray-100 last:border-b-0">
                            <div className="flex items-center space-x-3">
                                <span className="text-text-secondary font-semibold text-sm w-6">#{i + 1}</span>
                                <span className="font-medium text-text-primary">{h.name}</span>
                            </div>
                            <span className="font-bold text-text-primary">{h.rinde.toFixed(0)} kg/ha</span>
                        </div>
                    ))
                ) : (
                    <p className="text-center text-text-secondary">No hay datos de cosecheros para los filtros seleccionados.</p>
                )}
            </div>
        </Card>
    );
};

export const DestinationsSection: FC = () => {
    const { analytics, sessionsLoading } = useOutletContext<any>(); // Obtener del contexto

    if (sessionsLoading) {
        return <p className="text-center text-text-secondary py-8">Cargando datos de destinos...</p>;
    }

    return (
        <Card className="animate-fade-in">
            <div className="flex items-center space-x-2 mb-6">
                <PieChart className="w-5 h-5 text-text-secondary" />
                <h3 className="text-lg font-semibold text-text-primary">Entregas por Destino</h3>
            </div>
            {analytics.destinationData.length > 0 ? (
                <div className="flex justify-center">
                    <DestinationChart data={analytics.destinationData} />
                </div>
            ) : (
                <p className="text-center text-text-secondary">No hay datos de destinos para los filtros seleccionados.</p>
            )}
        </Card>
    );
};


// --- Componente principal Reports (anteriormente Dashboard) ---
const Reports: FC = () => {
    // --- ESTADOS DE LOS FILTROS ---
    const [filters, setFilters] = useState({
        campaign: '',
        crop: 'todos',
        field: 'todos',
        plot: 'todos',
    });

    // --- OBTENCIÓN DE DATOS ---
    const { campaigns, loading: campaignsLoading } = useCampaigns();
    const { sessions: sessionsForCampaign, loading: sessionsLoading } = useHarvestSessionsByCampaign(filters.campaign);
    const navigate = useNavigate();

    // --- LÓGICA DE FILTROS Y CÁLCULOS (usando useMemo para optimizar) ---

    // Reinicia los filtros de cultivo, campo y lote cuando cambia la campaña
    useEffect(() => {
        setFilters(prev => ({
            ...prev,
            crop: 'todos',
            field: 'todos',
            plot: 'todos',
        }));
    }, [filters.campaign]);

    // Opciones para el desplegable de Cultivos (se generan a partir de las sesiones)
    const availableCrops = useMemo(() => {
        if (!sessionsForCampaign) return [];
        const uniqueCrops = new Map(sessionsForCampaign.map(s => [s.crop.id, s.crop]));
        return Array.from(uniqueCrops.values());
    }, [sessionsForCampaign]);

    // Opciones para el desplegable de Campos
    const availableFields = useMemo(() => {
        if (!sessionsForCampaign) return [];
        let filteredByCrop = sessionsForCampaign;
        if (filters.crop !== 'todos') {
            filteredByCrop = sessionsForCampaign.filter(s => s.crop.id === filters.crop);
        }
        const uniqueFields = new Map(filteredByCrop.map(s => [s.field.id, s.field]));
        return Array.from(uniqueFields.values());
    }, [sessionsForCampaign, filters.crop]);

    // Opciones para el desplegable de Lotes
    const availablePlots = useMemo(() => {
        if (!sessionsForCampaign) return [];
        let filteredByField = sessionsForCampaign;
        if (filters.field !== 'todos') {
            filteredByField = sessionsForCampaign.filter(s => s.field.id === filters.field);
        }
        const uniquePlots = new Map(filteredByField.map(s => [s.plot.id, s.plot]));
        return Array.from(uniquePlots.values());
    }, [sessionsForCampaign, filters.field]);

    // Datos finales para las tarjetas, después de aplicar todos los filtros
    const dashboardData = useMemo(() => {
        const initialTotals = { seed_hectares: 0, harvested_hectares: 0, harvested_kgs: 0 };
        if (!sessionsForCampaign) return initialTotals;

        const filteredSessions = sessionsForCampaign.filter(s => {
            const cropMatch = filters.crop === 'todos' || s.crop.id === filters.crop;
            const fieldMatch = filters.field === 'todos' || s.field.id === filters.field;
            const plotMatch = filters.plot === 'todos' || s.plot.id === filters.plot;
            return cropMatch && fieldMatch && plotMatch;
        });

        return filteredSessions.reduce((acc, session) => {
            acc.seed_hectares += session.hectares || 0;
            acc.harvested_hectares += session.harvested_hectares || 0;
            acc.harvested_kgs += session.harvested_kgs || 0;
            return acc;
        }, initialTotals);
    }, [sessionsForCampaign, filters.crop, filters.field, filters.plot]);

    // --- CÁLCULOS FINALES PARA LA UI ---
    const rindeSembrado = dashboardData.seed_hectares > 0 ? (dashboardData.harvested_kgs / dashboardData.seed_hectares) : 0;
    const rindeCosechado = dashboardData.harvested_hectares > 0 ? (dashboardData.harvested_kgs / dashboardData.harvested_hectares) : 0;

    // --- Datos para las nuevas secciones (cosecheros, destinos, rinde estimado) ---
    const analytics = useMemo(() => {
        const harvested_kgs = dashboardData.harvested_kgs;

        // Mock de rinde estimado (puedes ajustarlo o calcularlo de forma más inteligente)
        const rindeEstimado = rindeCosechado > 0 ? rindeCosechado * 1.05 : 3000;

        // Agrupación de datos por cosechador
        const harvesterMap = new Map<string, { id: string; name: string; harvested_kgs: number; harvested_hectares: number }>();
        sessionsForCampaign?.forEach(session => {
            if (session.harvester) {
                const current = harvesterMap.get(session.harvester.id) || { id: session.harvester.id, name: session.harvester.name, harvested_kgs: 0, harvested_hectares: 0 };
                current.harvested_kgs += session.harvested_kgs || 0;
                current.harvested_hectares += session.harvested_hectares || 0;
                harvesterMap.set(session.harvester.id, current);
            }
        });
        const harvesterData = Array.from(harvesterMap.values()).map(h => ({
            id: h.id,
            name: h.name,
            rinde: h.harvested_hectares > 0 ? (h.harvested_kgs / h.harvested_hectares) : 0,
        })).sort((a, b) => b.rinde - a.rinde);

        // Agrupación de datos por destino
        const destinationMap = new Map<string, { id: string; name: string; value: number }>();
        sessionsForCampaign?.forEach(session => {
            if (session.destination) {
                const current = destinationMap.get(session.destination.id) || { id: session.destination.id, name: session.destination.name, value: 0 };
                current.value += session.destination.value || 0;
                destinationMap.set(session.destination.id, current);
            }
        });
        const destinationData = Array.from(destinationMap.values());

        return {
            hectareasTotales: dashboardData.seed_hectares,
            hectareasCosechadas: dashboardData.harvested_hectares,
            kgCosechados: harvested_kgs,
            rindeSembrado: rindeSembrado,
            rindeCosechado: rindeCosechado,
            rindeEstimado: rindeEstimado,
            harvesterData: harvesterData,
            destinationData: destinationData,
        };
    }, [dashboardData, rindeCosechado, sessionsForCampaign]);


    const handleFilterChange = (filterName: string, value: string) => {
        setFilters(prev => ({ ...prev, [filterName]: value }));
    };

    // Determinar la pestaña activa basándose en la URL
    const matchCosecha = useMatch('/reports/cosecha');
    const matchCosecheros = useMatch('/reports/cosecheros');
    const matchDestinos = useMatch('/reports/destinos');

    const activeTab = useMemo(() => {
        if (matchCosecheros) return 'cosecheros';
        if (matchDestinos) return 'destinos';
        return 'cosecha'; // Default tab
    }, [matchCosecha, matchCosecheros, matchDestinos]);

    // Redirige a la pestaña por defecto si se accede a la ruta base sin sub-ruta
    useEffect(() => {
        if (!matchCosecha && !matchCosecheros && !matchDestinos) {
            navigate('/reports/cosecha', { replace: true });
        }
    }, [matchCosecha, matchCosecheros, matchDestinos, navigate]);

    // Componente TabButton (definido aquí o en common-ui-components si es global)
    const TabButton: FC<{ isActive: boolean; to: string; children: React.ReactNode }> = ({ isActive, to, children }) => (
        <Link
            to={to}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap text-sm
                ${isActive
                    ? 'bg-surface text-text-primary shadow-sm'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
        >
            {children}
        </Link>
    );

    if (campaignsLoading) {
        return <p>Cargando panel...</p>;
    }

    return (

        <div className="font-inter antialiased bg-gray-50 text-gray-800 p-4 sm:p-6 lg:p-8 min-h-screen">
            <PageHeader title="Reportes" breadcrumbs={[{ label: 'Reportes' }]} />
            <div className="max-w-7xl mx-auto space-y-4 lg:space-y-6">
                <div className="flex space-x-1 bg-background p-1 rounded-xl overflow-x-auto shadow-sm">
                    <TabButton isActive={activeTab === 'cosecha'} to="/reports/cosecha">Cosecha</TabButton>
                    <TabButton isActive={activeTab === 'cosecheros'} to="/reports/cosecheros">Cosecheros</TabButton>
                    <TabButton isActive={activeTab === 'destinos'} to="/reports/destinos">Destinos</TabButton>
                </div>

                <Filters
                    campaigns={campaigns}
                    campaignsLoading={campaignsLoading}
                    filters={filters}
                    availableCrops={availableCrops}
                    availableFields={availableFields}
                    availablePlots={availablePlots}
                    sessionsLoading={sessionsLoading}
                    handleFilterChange={handleFilterChange}
                />

                {/* Contenido dinámico según la pestaña seleccionada - renderizado por Outlet */}
                <div className="animate-fade-in-fast">
                    {/* Pasamos analytics y sessionsLoading al contexto del Outlet */}
                    <Outlet context={{ analytics, sessionsLoading }} />
                </div>
            </div>
        </div>
    );
};

export default Reports;