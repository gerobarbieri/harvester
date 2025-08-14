// src/pages/silobags/Silobags.tsx
import { useState, useMemo } from "react";
import Filters from "../../components/silobags/Filters";
import SiloBagCard from "../../components/silobags/SilobagCard";
import PageHeader from "../../components/commons/layout/PageHeader";
import { useSiloBags } from "../../hooks/silobags/useSilobags";
import { useCampaignFields } from "../../hooks/field/useCampaignFields";
import { useActiveCampaign } from "../../hooks/campaign/useActiveCampaign";
import Button from "../../components/commons/Button";
import { PlusCircle } from "lucide-react";

const SiloBags = () => {
    const [selectedField, setSelectedField] = useState('todos');
    const [selectedStatus, setSelectedStatus] = useState('todos');

    const { campaign } = useActiveCampaign();
    const { campaignFields } = useCampaignFields(campaign?.id);
    const { siloBags, loading, error } = useSiloBags();

    // Filtrar silos según criterios seleccionados
    const filteredSiloBags = useMemo(() => {
        if (!siloBags) return [];

        return siloBags.filter(silo => {
            const fieldMatch = selectedField === 'todos' || silo.location?.includes(selectedField);
            const statusMatch = selectedStatus === 'todos' || silo.status.toLowerCase() === selectedStatus.toLowerCase();
            return fieldMatch && statusMatch;
        });
    }, [siloBags, selectedField, selectedStatus]);

    const handleExtract = (silo: any) => {
        // TODO: Implementar lógica de extracción
        console.log('Extraer de silo:', silo.id);
    };

    const handleClose = (silo: any) => {
        // TODO: Implementar lógica de cierre
        console.log('Cerrar silo:', silo.id);
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <PageHeader title="Silos" breadcrumbs={[{ label: 'Silos' }]} />
                <div className="text-center py-8">Cargando silos...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="space-y-6">
                <PageHeader title="Silos" breadcrumbs={[{ label: 'Silos' }]} />
                <div className="text-center text-red-500 py-8">Error: {error}</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <PageHeader title="Silos" breadcrumbs={[{ label: 'Silos' }]}>
                <div className="w-full md:w-auto">
                    <Button
                        className="w-full sm:px-10 sm:py-3 sm:text-base"
                        icon={PlusCircle}
                    >
                        Crear Silobolsa
                    </Button>
                </div>
            </PageHeader>

            <Filters
                selectedField={selectedField}
                onFieldChange={setSelectedField}
                selectedStatus={selectedStatus}
                onStatusChange={setSelectedStatus}
                fields={campaignFields || []}
            />

            <div className="max-h-[60vh] overflow-y-auto pr-2">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredSiloBags.length > 0 ? (
                        filteredSiloBags.map(silobag => (
                            <SiloBagCard
                                key={silobag.id}
                                silo={silobag}
                                onExtract={handleExtract}
                                onClose={handleClose}
                            />
                        ))
                    ) : (
                        <div className="col-span-full text-center text-text-secondary py-8">
                            <p>No se encontraron silos con los filtros seleccionados.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
};

export default SiloBags;