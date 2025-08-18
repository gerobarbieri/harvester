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
import type { Silobag } from "../../types";
import ExtractKgsModal from "../../components/silobags/modals/ExtractKgsModal";
import CloseSiloBagModal from "../../components/silobags/modals/CloseSilobagModal";

const SiloBags = () => {
    const [selectedField, setSelectedField] = useState('todos');
    const [selectedCrop, setSelectedCrop] = useState('todos');
    const [modalState, setModalState] = useState<{ type: 'create' | 'extract' | 'close' | null; data?: Silobag }>({ type: null });

    const { campaign } = useActiveCampaign();
    const { campaignFields } = useCampaignFields(campaign?.id);
    const { crops } = useCrops();
    const { siloBags, loading, error, updateOptimisticSiloBag, removeOptimisticSiloBag, addOptimisticSiloBag } = useSiloBags();

    // Filtrar silos según criterios seleccionados
    const filteredSiloBags = useMemo(() => {
        if (!siloBags) return [];

        return siloBags.filter(silo => {
            const fieldMatch = selectedField === 'todos' || silo.field.id === selectedField;
            const statusMatch = selectedCrop === 'todos' || silo.crop.id === selectedCrop;
            return fieldMatch && statusMatch;
        });
    }, [siloBags, selectedField, selectedCrop]);


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
                        <Button
                            className="w-full sm:px-10 sm:py-3 sm:text-base"
                            icon={PlusCircle}
                            onClick={() => setModalState({ type: 'create' })}
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

                <div className="max-h-[70vh] overflow-y-auto md:max-h-none md:overflow-visible pr-2 md:pr-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredSiloBags.length > 0 ? (
                            filteredSiloBags.map(silobag => (
                                <SiloBagCard
                                    key={silobag.id}
                                    silo={silobag}
                                    onExtract={() => setModalState({ type: 'extract', data: silobag })}
                                    onClose={() => setModalState({ type: 'close', data: silobag })}
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
            <CreateSiloBagModal
                isOpen={modalState.type === 'create'}
                onClose={() => setModalState({ type: null })}
                fields={campaignFields || []}
                crops={crops || []}
                removeOptimisticSiloBag={removeOptimisticSiloBag}
                addOptimisticSiloBag={addOptimisticSiloBag}
            />

            {
                modalState.data && (
                    <>
                        <ExtractKgsModal
                            isOpen={modalState.type === 'extract'}
                            onClose={() => setModalState({ type: null })}
                            siloBag={modalState.data}
                            updateOptimisticSiloBag={updateOptimisticSiloBag}
                        />
                        <CloseSiloBagModal
                            isOpen={modalState.type === 'close'}
                            onClose={() => setModalState({ type: null })}
                            siloBag={modalState.data}
                            updateOptimisticSiloBag={updateOptimisticSiloBag}
                        />
                    </>
                )
            }
        </>
    )
};

export default SiloBags;