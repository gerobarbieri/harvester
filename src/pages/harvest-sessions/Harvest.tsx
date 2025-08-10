import { useState } from "react";
import Button from "../../components/commons/Button";
import PageHeader from "../../components/commons/layout/PageHeader";
import PlotSection from "../../components/harvest-session/ui/PlotSection";
import Tabs from "../../components/harvest-session/ui/Tabs";

import { PlusCircle } from "lucide-react";
import Filters from "../../components/harvest-session/ui/Filters";

const HarvestView = ({ onViewLot, openModal }) => {
    const [activeTab, setActiveTab] = useState('todos');

    const getStatus = (progress) => {
        if (progress >= 100) return 'Finalizado';
        if (progress > 0) return 'En Progreso';
        return 'Pendiente';
    };

    const filteredLots = [].filter(lot => {
        if (activeTab === 'todos') return true;
        const status = getStatus(lot.progress).toLowerCase().replace(' ', '_');
        return activeTab === status;
    });
    return (
        <div className="space-y-6">
            <PageHeader title="Lotes de Cosecha" breadcrumbs={[{ label: 'Cosecha' }]}>
                <div className="w-full md:w-auto">
                    <Button className="w-full sm:px-10 sm:py-3 sm:text-base" icon={PlusCircle} onClick={() => openModal('createLot')}>
                        Cosechar Lote
                    </Button>
                </div>
            </PageHeader>

            <Filters />

            <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />

            <PlotSection harvestSessions={filteredLots} onViewLot={onViewLot} />
        </div>
    );
};

export default HarvestView;