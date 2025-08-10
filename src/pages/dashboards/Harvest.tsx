import { Tractor, Leaf, Weight } from "lucide-react";
import Card from "../../components/commons/Card";
import Select from "../../components/commons/form/Select";
import StatCard from "../../components/dashboards/commons/StatCard";
import PlotCardList from "../../components/dashboards/harvest/PlotCardList";
import { useCampaignFields } from "../../hooks/field/useCampaignFields";
import { useActiveCampaign } from "../../hooks/campaign/useActiveCampaign";
import PageHeader from "../../components/commons/layout/PageHeader";

//TODO: AGREGACION PARA EL REPORTE DIARIO?

const HarvestView = () => {
    // 1. Obtenemos la campaña activa primero
    const { campaign, loading: loadingActiveCampaign, error: activeCampaignError } = useActiveCampaign();

    // 2. Usamos el ID de la campaña (cuando exista) para obtener los campos.
    //    El hook se llamará con 'undefined' hasta que 'campaign' se cargue.
    const { campaignFields, loading: loadingCampaignFields, error: campaignFieldsError } = useCampaignFields(campaign?.id);

    // --- Manejo explícito de estados de carga y error ---

    if (loadingActiveCampaign) {
        return <div>Cargando campaña activa...</div>;
    }

    if (activeCampaignError) {
        return <div>Error al cargar la campaña: {activeCampaignError}</div>;
    }

    // Si no hay campaña activa, mostramos un mensaje claro.
    if (!campaign) {
        return (
            <Card>
                <p className="text-center text-text-secondary">No hay una campaña activa configurada.</p>
            </Card>
        );
    }

    // --- Renderizado de la vista principal ---

    return (
        <div className="space-y-4 lg:space-y-6">
            <PageHeader title="Monitor Diario" breadcrumbs={[{ label: 'Monitor Diario' }]} />
            <Card>
                <h2 className="text-lg font-bold text-text-primary mb-4">Filtros</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Select
                        label="Campo"
                        // Mostramos un placeholder de carga si los campos aún no están listos
                        placeholder={loadingCampaignFields ? "Cargando campos..." : "Todos los Campos"}
                        // El array de items ahora viene de tu hook
                        items={campaignFields?.map(cf => ({ id: cf.field.id, name: cf.field.name })) || []}
                        name="campo"
                        disabled={loadingCampaignFields || !!campaignFieldsError}
                    />
                    {campaignFieldsError && <p className="text-red-500 text-sm">No se pudieron cargar los campos.</p>}
                </div>
            </Card>

            <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
                <StatCard title="Lotes en Cosecha" value={0} unit="activos" icon={Tractor} />
                <StatCard title="Hectáreas del Día" value={0} unit="ha" icon={Leaf} color="blue" />
                <StatCard title="Kilos del Día" value={0} unit="tn" icon={Weight} color="orange" />
            </div>

            <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
                <PlotCardList title="Lotes en Progreso" plots={[]} showProgress />
                <PlotCardList title="Lotes Pendientes de Iniciar" plots={[]} />
            </div>
        </div>
    );
};

export default HarvestView;