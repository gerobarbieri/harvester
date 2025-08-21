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
import { useCrops } from "../../hooks/crop/useCrops";
import CreateSiloBagModal from "../../components/silobags/modals/CreateSilobagModal";
import ExtractKgsModal from "../../components/silobags/modals/ExtractKgsModal";
import CloseSiloBagModal from "../../components/silobags/modals/CloseSilobagModal";
import { useSiloBagManager } from "../../hooks/silobags/useSilobagManager";

const SiloBags = () => {
    const [selectedField, setSelectedField] = useState('todos');
    const [selectedCrop, setSelectedCrop] = useState('todos');

    // Hooks de datos
    const { campaign } = useActiveCampaign();
    const { campaignFields } = useCampaignFields(campaign?.id);
    const { crops } = useCrops();
    const { siloBags, loading, error } = useSiloBags({ fieldId: selectedField, cropId: selectedCrop, status: 'todos' });

    // 2. Instanciamos nuestro nuevo manager, pasándole los datos que necesita
    const manager = useSiloBagManager(campaignFields, crops);


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
        <>
            <div className="space-y-6">
                <PageHeader title="Silos" breadcrumbs={[{ label: 'Silos' }]}>
                    <div className="w-full md:w-auto">
                        {/* 3. Los eventos ahora llaman a los manejadores del hook */}
                        <Button
                            className="w-full sm:px-10 sm:py-3 sm:text-base"
                            icon={PlusCircle}
                            onClick={() => manager.openModal('create')}
                        >
                            Crear Silobolsa
                        </Button>
                    </div>
                </PageHeader>

                <Filters
                    selectedField={selectedField}
                    onFieldChange={setSelectedField}
                    fields={campaignFields || []}
                    crops={crops || []}
                    selectedCrop={selectedCrop}
                    onCropChange={setSelectedCrop}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {siloBags.length > 0 ? (
                        siloBags.map(silobag => (
                            <SiloBagCard
                                key={silobag.id}
                                silo={silobag}
                                onExtract={() => manager.openModal('extract', silobag)}
                                onClose={() => manager.openModal('close', silobag)}
                            />
                        ))
                    ) : (
                        <div className="col-span-full text-center text-text-secondary py-8">
                            <p>No se encontraron silos con los filtros seleccionados.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* 4. Los modales se controlan con el estado del manager */}
            <CreateSiloBagModal
                isOpen={manager.modalState.type === 'create'}
                onClose={manager.closeModal}
                onSubmit={manager.handlers.create}
                fields={campaignFields || []}
                crops={crops || []}
            />

            {manager.modalState.data && (
                <>
                    <ExtractKgsModal
                        isOpen={manager.modalState.type === 'extract'}
                        onClose={manager.closeModal}
                        siloBag={manager.modalState.data}
                        onSubmit={manager.handlers.extract} // Pasamos el manejador de extracción
                    />
                    <CloseSiloBagModal
                        isOpen={manager.modalState.type === 'close'}
                        onClose={manager.closeModal}
                        siloBag={manager.modalState.data}
                        onSubmit={manager.handlers.close} // Pasamos el manejador de cierre
                    />
                </>
            )}
        </>
    )
};

export default SiloBags;