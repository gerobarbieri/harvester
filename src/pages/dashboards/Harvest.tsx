// src/pages/dashboards/Harvest.tsx
import { Tractor, Leaf, Weight } from "lucide-react";
import Card from "../../components/commons/Card";
import Select from "../../components/commons/form/Select";
import StatCard from "../../components/dashboards/commons/StatCard";

import { useCampaignFields } from "../../hooks/field/useCampaignFields";
import { useActiveCampaign } from "../../hooks/campaign/useActiveCampaign";
import { useHarvestSessionsByCampaign } from "../../hooks/harvest-session/useHarvestSessionsByCampaign";
import PageHeader from "../../components/commons/layout/PageHeader";
import { useState, useMemo } from "react";
import { Timestamp } from "firebase/firestore";
import SessionCardList from "../../components/dashboards/harvest/SessionCardList";
import StatusBadge from "../../components/commons/StatusBadge";
import { Controller, useForm, useWatch } from "react-hook-form";

const HarvestView = () => {

    const { control } = useForm({
        defaultValues: {
            fieldId: 'todos'
        }
    });
    const selectedFieldId = useWatch({ control, name: 'fieldId' });
    const [activeListTab, setActiveListTab] = useState<'in-progress' | 'pending'>('in-progress');

    // 1. Obtenemos la campaña activa primero
    const { campaign, loading: loadingActiveCampaign, error: activeCampaignError } = useActiveCampaign();

    // 2. Usamos el ID de la campaña para obtener los campos y sesiones
    const { campaignFields, loading: loadingCampaignFields, error: campaignFieldsError } = useCampaignFields(campaign?.id);
    const { sessions: harvestSessions, loading: loadingSessions } = useHarvestSessionsByCampaign(campaign?.id);

    // 4. Calculamos estadísticas del día
    const todayStats = useMemo(() => {
        if (!harvestSessions) return { activeLots: 0, todayHectares: 0, todayKgs: 0 };

        const today = new Date().toISOString().split('T')[0];
        const todaySessions = harvestSessions.filter(session =>
            session.date && session.date.isEqual(Timestamp.fromDate(new Date(today)))
        );

        const activeLots = harvestSessions.filter(session =>
            session.status === 'in-progress'
        ).length;

        const todayHectares = todaySessions.reduce((sum, session) =>
            sum + (session.harvested_hectares || 0), 0
        );

        const todayKgs = todaySessions.reduce((sum, session) =>
            sum + (session.total_kgs || 0), 0
        );

        return { activeLots, todayHectares, todayKgs: todayKgs / 1000 }; // Convert to tons
    }, [harvestSessions]);

    const { inProgressSessions, pendingSessions } = useMemo(() => {
        if (!harvestSessions) return { inProgressSessions: [], pendingSessions: [] };

        const filteredSessions = selectedFieldId === 'todos'
            ? harvestSessions
            : harvestSessions.filter(session => session.field?.id === selectedFieldId);

        const inProgress = filteredSessions.filter(session =>
            session.status === 'in-progress'
        );

        const pending = filteredSessions.filter(session =>
            session.status === 'pending'
        );

        // Convertimos a formato esperado por PlotCardList
        const inProgressSessions = inProgress.map(session => ({
            id: session.id,
            name: session.plot?.name || 'Sin nombre',
            field: { name: session.field?.name || 'Sin campo' },
            crop: { name: session.crop?.name || 'Sin cultivo' },
            progress: session.harvested_hectares && session.hectares
                ? Math.round((session.harvested_hectares / session.hectares) * 100)
                : 0
        }));

        const pendingSessions = pending.map(session => ({
            id: session.id,
            name: session.plot?.name || 'Sin nombre',
            field: { name: session.field?.name || 'Sin campo' },
            crop: { name: session.crop?.name || 'Sin cultivo' }
        }));

        return { inProgressSessions, pendingSessions };
    }, [harvestSessions, selectedFieldId]);

    if (loadingActiveCampaign) return <div className="text-center py-8">Cargando campaña activa...</div>;
    if (activeCampaignError) return <div className="text-center text-red-500 py-8">Error al cargar la campaña: {activeCampaignError}</div>;
    if (!campaign) return <Card><p className="text-center text-gray-500">No hay una campaña activa configurada.</p></Card>;


    return (
        <div className="space-y-4 lg:space-y-6">
            <PageHeader title="Cosecha Actual" breadcrumbs={[{ label: 'Informacion de cosecha' }]} />

            <Card>
                <div className="md:w-[31%] ">
                    <Controller
                        name="fieldId"
                        control={control}
                        render={({ field }) => (
                            <Select
                                label="Campo"
                                name="fieldId"
                                placeholder={loadingCampaignFields ? "Cargando campos..." : "Todos los campos"}
                                items={[{ id: 'todos', name: 'Todos los campos' }, ...(campaignFields?.map(cf => ({ id: cf.field.id, name: cf.field.name })) || [])]}
                                value={field.value}
                                onChange={field.onChange}
                                disabled={loadingCampaignFields || !!campaignFieldsError}
                            />
                        )}
                    />
                </div>
                {campaignFieldsError && <p className="text-red-500 text-sm mt-2">No se pudieron cargar los campos.</p>}
            </Card>

            <div className="w-full lg:grid lg:grid-cols-3 lg:gap-6">
                <div className="flex gap-4 overflow-x-auto pb-4 lg:pb-0 lg:contents">
                    <div className="flex-shrink-0 w-4/5 sm:w-2/3 md:w-1/2 lg:w-full"><StatCard title="Lotes en Cosecha" value={todayStats.activeLots} unit="activos" icon={Tractor} /></div>
                    <div className="flex-shrink-0 w-4/5 sm:w-2/3 md:w-1/2 lg:w-full"><StatCard title="Hectáreas del Día" value={todayStats.todayHectares.toFixed(1)} unit="ha" icon={Leaf} color="blue" /></div>
                    <div className="flex-shrink-0 w-4/5 sm:w-2/3 md:w-1/2 lg:w-full"><StatCard title="Kilos del Día" value={todayStats.todayKgs.toFixed(1)} unit="tn" icon={Weight} color="orange" /></div>
                </div>
            </div>

            <div className="hidden lg:flex flex-col lg:flex-row gap-4 lg:gap-6">
                <Card className="flex-1 flex flex-col">
                    <div className="mb-4">
                        <h3 className="text-lg font-semibold text-gray-800 mb-1">Lotes en cosecha</h3>
                        <StatusBadge status="in-progress" />
                    </div>
                    <div className="flex-1 overflow-y-auto pr-2">
                        <SessionCardList sessions={inProgressSessions} showProgress={true} />
                    </div>
                </Card>
                <Card className="flex-1 flex flex-col">
                    <div className="mb-4">
                        <h3 className="text-lg font-semibold text-gray-800 mb-1">Lotes Pendientes</h3>
                        <StatusBadge status="pending" />
                    </div>
                    <div className="flex-1 overflow-y-auto pr-2">
                        <SessionCardList sessions={pendingSessions} />
                    </div>
                </Card>
            </div>

            {/* --- Vista Móvil: Tarjeta con Pestañas --- */}
            <div className="lg:hidden">
                <Card>
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex space-x-6">
                            <button
                                onClick={() => setActiveListTab('in-progress')}
                                className={`py-4 px-1 border-b-2 font-semibold text-sm text-center w-1/2 ${activeListTab === 'in-progress' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                            >
                                <span>Lotes en cosecha</span>
                                <StatusBadge status='in-progress' className="mt-1" />
                            </button>
                            <button
                                onClick={() => setActiveListTab('pending')}
                                className={`py-4 px-1 border-b-2 font-semibold text-sm text-center w-1/2 ${activeListTab === 'pending' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                            >
                                <span>Lotes pendientes</span>
                                <StatusBadge status='pending' className="mt-1" />
                            </button>
                        </nav>
                    </div>
                    <div className="pt-6">
                        {loadingSessions ? (
                            <div className="text-center text-gray-500 py-8">Cargando datos de cosecha...</div>
                        ) : (
                            activeListTab === 'in-progress'
                                ? <SessionCardList sessions={inProgressSessions} showProgress={true} />
                                : <SessionCardList sessions={pendingSessions} />
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default HarvestView;