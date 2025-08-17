import { useMemo } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import Card from '../../components/commons/Card';
import Select from '../../components/commons/form/Select';
import PageHeader from '../../components/commons/layout/PageHeader';
// import HarvestStatsSection from '../../components/dashboards/harvest/HarvestStatsSection';
import SessionsListSection from '../../components/dashboards/harvest/SessionListSection';
import { useActiveCampaign } from '../../hooks/campaign/useActiveCampaign';
import { useCampaignFields } from '../../hooks/field/useCampaignFields';
import { useActiveHarvestSessions } from '../../hooks/harvest-session/useActiveHarvestSessions';

const HarvestView = () => {
    const { control } = useForm({
        defaultValues: { fieldId: 'all' }
    });
    const selectedFieldId = useWatch({ control, name: 'fieldId' });

    // Hooks principales
    const { campaign, loading: loadingActiveCampaign, error: activeCampaignError } = useActiveCampaign();
    const { fieldOptions, loading: loadingCampaignFields, error: campaignFieldsError } = useCampaignFields(campaign?.id);
    const { sessions: harvestSessions, loading: loadingSessions } = useActiveHarvestSessions(campaign?.id, selectedFieldId);

    // Opciones para el selector de campos
    const fieldSelectOptions = useMemo(() => [
        { id: 'all', name: 'Todos los campos', value: 'all', label: 'Todos los campos' },
        ...fieldOptions
    ], [fieldOptions]);

    // Estados de carga
    const isLoading = loadingActiveCampaign || loadingCampaignFields || loadingSessions;

    // Manejo de errores
    if (activeCampaignError) {
        return (
            <div className="space-y-4">
                <PageHeader title="Cosecha Actual" breadcrumbs={[{ label: 'Información de cosecha' }]} />
                <Card>
                    <p className="text-center text-red-500">Error al cargar la campaña: {activeCampaignError}</p>
                </Card>
            </div>
        );
    }

    // Sin campaña activa
    if (!loadingActiveCampaign && !campaign) {
        return (
            <div className="space-y-4">
                <PageHeader title="Cosecha Actual" breadcrumbs={[{ label: 'Información de cosecha' }]} />
                <Card>
                    <p className="text-center text-gray-500">No hay una campaña activa configurada.</p>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-4 lg:space-y-6">
            <PageHeader
                title="Cosecha Actual"
                breadcrumbs={[{ label: 'Información de cosecha' }]}
            />

            <Card>

                <h2 className="text-lg font-bold text-text-primary mb-4">Filtros</h2>
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                    <Controller
                        name="fieldId"
                        control={control}
                        render={({ field }) => (
                            <Select
                                label="Campo"
                                name="fieldId"
                                placeholder={loadingCampaignFields ? "Cargando campos..." : "Todos los campos"}
                                items={fieldSelectOptions}
                                value={field.value}
                                onChange={field.onChange}
                                disabled={loadingCampaignFields || !!campaignFieldsError}
                            />
                        )}
                    />
                    {campaignFieldsError && (
                        <p className="text-red-500 text-sm mt-2">
                            No se pudieron cargar los campos.
                        </p>
                    )}
                </div>
            </Card >

            {/* Estadísticas del Día */}
            {/* <HarvestStatsSection
                    sessions={harvestSessions || []}
                    loading={isLoading}
                /> */}

            {/* Listas de Sesiones */}
            <SessionsListSection
                sessions={harvestSessions || []}
                loading={isLoading}
                selectedFieldId={selectedFieldId}
            />
        </div >
    );
};

export default HarvestView;