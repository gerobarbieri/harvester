// src/pages/dashboards/Reports.tsx
import { Link, Outlet, useMatch, useNavigate, useOutletContext } from "react-router";
import PageHeader from "../../components/commons/layout/PageHeader";
import { Weight, Leaf, Tractor, Award, PieChart } from "lucide-react";
import { type FC, useState, useEffect, useMemo } from "react";
import Card from "../../components/commons/Card";
import Select from "../../components/commons/form/Select";
import StatCard from "../../components/dashboards/commons/StatCard";
import DestinationChart from "../../components/dashboards/reports/destinations-report/ui/DestinationChart";
import YieldPerformanceCard from "../../components/dashboards/reports/harvest-report/ui/YieldPerformanceCard";
import { useCampaigns } from "../../hooks/campaign/useCampaigns";
import { useHarvestSessionsByCampaign } from "../../hooks/harvest-session/useHarvestSessionsByCampaign";
import { useReportsAnalytics } from "../../hooks/analytics-reports/useReportsAnalytics";
import type { Campaign, Crop, Plot, Field } from "../../types";

interface FiltersProps {
    campaigns: Campaign[];
    campaignsLoading: boolean;
    filters: { campaign: string; crop: string; field: string; plot: string; };
    availableCrops: Partial<Crop>[];
    availableFields: Partial<Field>[];
    availablePlots: Partial<Plot>[];
    handleFilterChange: (filterName: string, value: string) => void;
}

const Filters: FC<FiltersProps> = ({
    campaigns,
    campaignsLoading,
    filters,
    availableCrops,
    availableFields,
    availablePlots,
    handleFilterChange
}) => (
    <Card>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
                placeholder="Todos"
                value={filters.crop}
                onChange={(e) => handleFilterChange('crop', e.target.value)}
                disabled={!filters.campaign}
            />
            <Select
                label="Campo"
                items={availableFields}
                name="field"
                placeholder="Todos"
                value={filters.field}
                onChange={(e) => handleFilterChange('field', e.target.value)}
                disabled={!filters.campaign}
            />
            <Select
                label="Lote"
                items={availablePlots}
                name="plot"
                placeholder="Todos los lotes"
                value={filters.plot}
                onChange={(e) => handleFilterChange('plot', e.target.value)}
                disabled={!filters.campaign}
            />
        </div>
    </Card>
);

export const HarvestSection: FC = () => {
    const { analytics } = useOutletContext<any>();

    const harvestProgress = analytics?.harvestSummary?.total_hectares > 0
        ? (analytics?.harvestSummary?.total_harvested_hectares / analytics?.harvestSummary?.total_hectares) * 100
        : 0;

    if (analytics.loading) {
        return <p className="text-center text-text-secondary py-8">Calculando datos de cosecha...</p>;
    }

    if (analytics.error) {
        return <p className="text-center text-red-500 py-8">Error: {analytics.error}</p>;
    }

    return (
        <div className="space-y-4 lg:space-y-6 animate-fade-in">
            <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
                <Card className="flex-1">
                    <h3 className="text-lg font-semibold text-text-primary mb-2">Avance de Cosecha</h3>
                    <div className="text-3xl font-bold text-text-primary mb-4">{harvestProgress.toFixed(1)}%</div>
                    <div className="w-full bg-background rounded-full h-3 mb-2">
                        <div
                            className="bg-primary h-3 rounded-full transition-all duration-500"
                            style={{ width: `${harvestProgress}%` }}
                        ></div>
                    </div>
                    <p className="text-text-secondary text-sm">
                        {analytics.harvestSummary?.total_harvested_hectares?.toLocaleString('es-AR')} ha / {analytics?.harvestSummary?.total_hectares?.toLocaleString('es-AR')} ha
                    </p>
                </Card>
                <YieldPerformanceCard
                    real={analytics?.harvestSummary?.yield_per_harvested_hectare || 0}
                    estimated={analytics?.harvestSummary?.average_estimated_yield || 0}
                />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
                <StatCard
                    title="Kg Cosechados"
                    value={(analytics?.harvestSummary?.total_kgs && analytics?.harvestSummary?.total_kgs / 1000)?.toLocaleString('es-AR', { maximumFractionDigits: 0 }) || 0}
                    unit="tn"
                    icon={Weight}
                    color="orange"
                />
                <StatCard
                    title="Rinde Sembrado"
                    value={analytics?.harvestSummary?.yield_per_sown_hectare?.toLocaleString('es-AR', { maximumFractionDigits: 0 }) || 0}
                    unit="kg/ha"
                    icon={Leaf}
                    color="blue"
                />
                <StatCard
                    title="Rinde Cosechado"
                    value={analytics?.harvestSummary?.yield_per_harvested_hectare?.toLocaleString('es-AR', { maximumFractionDigits: 0 }) || 0}
                    unit="kg/ha"
                    icon={Tractor}
                    color="green"
                />
            </div>
        </div>
    );
};

export const HarvestersSection: FC = () => {
    const { analytics } = useOutletContext<any>();

    if (analytics.loading) {
        return <p className="text-center text-text-secondary py-8">Cargando datos de cosecheros...</p>;
    }

    if (analytics.error) {
        return <p className="text-center text-red-500 py-8">Error: {analytics.error}</p>;
    }

    return (
        <Card className="animate-fade-in">
            <div className="flex items-center space-x-2 mb-6">
                <Award className="w-5 h-5 text-text-secondary" />
                <h3 className="text-lg font-semibold text-text-primary">Ranking de Cosecheros</h3>
            </div>
            <div className="space-y-4">
                {analytics.harvestersSummary.length > 0 ? (
                    analytics.harvestersSummary.map((h: any, i: number) => (
                        <div key={h.id} className="flex justify-between items-center py-3 border-b border-gray-100 last:border-b-0">
                            <div className="flex items-center space-x-3">
                                <span className="text-text-secondary font-semibold text-sm w-6">#{i + 1}</span>
                                <span className="font-medium text-text-primary">{h.harvester.name}</span>
                            </div>
                            <span className="font-bold text-text-primary">{h.average_yield_kg_ha.toFixed(0)} kg/ha</span>
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
    const { analytics } = useOutletContext<any>();

    if (analytics.loading) {
        return <p className="text-center text-text-secondary py-8">Cargando datos de destinos...</p>;
    }

    if (analytics.error) {
        return <p className="text-center text-red-500 py-8">Error: {analytics.error}</p>;
    }

    return (
        <Card className="animate-fade-in">
            <div className="flex items-center space-x-2 mb-6">
                <PieChart className="w-5 h-5 text-text-secondary" />
                <h3 className="text-lg font-semibold text-text-primary">Entregas por Destino</h3>
            </div>
            {analytics.destinationSummary.length > 0 ? (
                <div className="flex justify-center">
                    <DestinationChart data={analytics.destinationData} />
                </div>
            ) : (
                <p className="text-center text-text-secondary">No hay datos de destinos para los filtros seleccionados.</p>
            )}
        </Card>
    );
};

// --- Componente principal Reports ---
const Reports: FC = () => {
    const [filters, setFilters] = useState({
        campaign: '',
        crop: 'todos',
        field: 'todos',
        plot: 'todos',
    });

    const { campaigns, loading: campaignsLoading } = useCampaigns();
    const { sessions: sessionsForCampaign } = useHarvestSessionsByCampaign(filters.campaign);
    const navigate = useNavigate();

    // Reinicia los filtros cuando cambia la campaña
    useEffect(() => {
        setFilters(prev => ({
            ...prev,
            crop: 'todos',
            field: 'todos',
            plot: 'todos',
        }));
    }, [filters.campaign]);

    // Establecer primera campaña por defecto
    useEffect(() => {
        if (campaigns.length > 0 && !filters.campaign) {
            setFilters(prev => ({
                ...prev,
                campaign: campaigns[0].id
            }));
        }
    }, [campaigns, filters.campaign]);

    // Opciones para los filtros (obtenidas de las sesiones para mantener consistencia)
    const availableCrops = useMemo(() => {
        if (!sessionsForCampaign) return [];
        const uniqueCrops = new Map(sessionsForCampaign.map(s => [s.crop.id, s.crop]));
        return Array.from(uniqueCrops.values());
    }, [sessionsForCampaign]);

    const availableFields = useMemo(() => {
        if (!sessionsForCampaign) return [];
        let filteredByCrop = sessionsForCampaign;
        if (filters.crop !== 'todos') {
            filteredByCrop = sessionsForCampaign.filter(s => s.crop.id === filters.crop);
        }
        const uniqueFields = new Map(filteredByCrop.map(s => [s.field.id, s.field]));
        return Array.from(uniqueFields.values());
    }, [sessionsForCampaign, filters.crop]);

    const availablePlots = useMemo(() => {
        if (!sessionsForCampaign) return [];
        let filteredByField = sessionsForCampaign;
        if (filters.field !== 'todos') {
            filteredByField = sessionsForCampaign.filter(s => s.field.id === filters.field);
        }
        const uniquePlots = new Map(filteredByField.map(s => [s.plot.id, s.plot]));
        return Array.from(uniquePlots.values());
    }, [sessionsForCampaign, filters.field]);

    // Analytics usando el hook optimizado con resúmenes agregados
    const analytics = useReportsAnalytics(filters.campaign, {
        crop: filters.crop,
        field: filters.field,
        plot: filters.plot
    });

    const handleFilterChange = (filterName: string, value: string) => {
        setFilters(prev => ({ ...prev, [filterName]: value }));
    };

    // Determinar la pestaña activa basándose en la URL
    const matchHarvests = useMatch('/reports/harvests');
    const matchHarvesters = useMatch('/reports/harvesters');
    const matchDestinations = useMatch('/reports/destinations');

    const activeTab = useMemo(() => {
        if (matchHarvesters) return 'harvesters';
        if (matchDestinations) return 'destinations';
        return 'harvests';
    }, [matchHarvests, matchHarvesters, matchDestinations]);

    // Redirige a la pestaña por defecto si se accede a la ruta base sin sub-ruta
    useEffect(() => {
        if (!matchHarvests && !matchHarvesters && !matchDestinations) {
            navigate('/reports/harvests', { replace: true });
        }
    }, [matchHarvests, matchHarvesters, matchDestinations, navigate]);

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
        return (
            <div className="space-y-6">
                <PageHeader title="Reportes" breadcrumbs={[{ label: 'Reportes' }]} />
                <p className="text-center py-8">Cargando reportes...</p>
            </div>
        );
    }

    if (campaigns.length === 0) {
        return (
            <div className="space-y-6">
                <PageHeader title="Reportes" breadcrumbs={[{ label: 'Reportes' }]} />
                <Card>
                    <p className="text-center text-text-secondary">No hay campañas disponibles.</p>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-4 lg:space-y-6">
            <PageHeader title="Reportes" breadcrumbs={[{ label: 'Reportes' }]} />

            <Filters
                campaigns={campaigns}
                campaignsLoading={campaignsLoading}
                filters={filters}
                availableCrops={availableCrops}
                availableFields={availableFields}
                availablePlots={availablePlots}
                handleFilterChange={handleFilterChange}
            />

            <div className="flex text-center space-x-1 bg-background p-1 rounded-xl overflow-x-auto shadow-sm">
                <TabButton isActive={activeTab === 'harvests'} to="/reports/harvests">Cosecha</TabButton>
                <TabButton isActive={activeTab === 'harvesters'} to="/reports/harvesters">Cosecheros</TabButton>
                <TabButton isActive={activeTab === 'destinations'} to="/reports/destinations">Destinos</TabButton>
            </div>

            {/* Mostrar estado de carga global */}
            {analytics.loading && (
                <Card>
                    <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-text-secondary">Cargando datos de reportes...</p>
                    </div>
                </Card>
            )}

            {/* Mostrar error global */}
            {analytics.error && !analytics.loading && (
                <Card>
                    <div className="text-center py-8">
                        <p className="text-red-500 mb-2">Error al cargar los datos:</p>
                        <p className="text-text-secondary text-sm">{analytics.error}</p>
                    </div>
                </Card>
            )}

            {/* Contenido dinámico según la pestaña seleccionada */}
            {!analytics.loading && !analytics.error && (
                <div className="animate-fade-in-fast">
                    <Outlet context={{ analytics }} />
                </div>
            )}
        </div>
    );
};

export default Reports;