import { useState } from "react";
import { useNavigate } from "react-router";
import Button from "../../components/commons/Button";
import PageHeader from "../../components/commons/layout/PageHeader";
import Tabs from "../../components/harvest-session/ui/Tabs";
import Filters from "../../components/harvest-session/ui/Filters";
import AddModal from "../../components/harvest-session/modals/AddModal";
import { PlusCircle } from "lucide-react";
import { useActiveCampaign } from "../../hooks/campaign/useActiveCampaign";
import { useHarvestSessionsByCampaign } from "../../hooks/harvest-session/useHarvestSessionsByCampaign";
import { useHarvestSessionFilters } from "../../hooks/harvest-session/useHarvestSessionsFilters";
import SessionSection from "../../components/harvest-session/ui/SessionSection";

const HarvestListView = () => {
    const [activeTab, setActiveTab] = useState('todos');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const navigate = useNavigate();

    // Hooks para obtener datos
    const { campaign, loading: loadingCampaign } = useActiveCampaign();
    const { sessions, loading: loadingSessions, error } = useHarvestSessionsByCampaign(campaign?.id);

    // Hook para filtros de sesiones
    const {
        filteredSessions,
        filterStatus,
        setFilterStatus,
        cropNames,
        filterCrop,
        setFilterCrop
    } = useHarvestSessionFilters(sessions);

    // Filtrar por tab activo
    const getFilteredByTab = () => {
        if (activeTab === 'todos') return filteredSessions;

        const statusMap = {
            'pending': ['pending', 'Pendiente'],
            'in-progress': ['in-progress', 'En Progreso'],
            'finished': ['finished', 'Finalizado', 'finished']
        };

        const allowedStatuses = statusMap[activeTab] || [];
        return filteredSessions?.filter(session =>
            allowedStatuses.includes(session.status)
        ) || [];
    };

    const finalFilteredSessions = getFilteredByTab();

    const handleViewLot = (harvestSession: any) => {
        // Navegar a detalles de la sesión
        navigate(`/harvest-sessions/${harvestSession.id}/details`);
    };

    const openModal = () => {
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const showToast = (message: string, type: string) => {
        // TODO: Implementar sistema de toasts
        console.log(`${type}: ${message}`);
    };

    if (loadingCampaign) {
        return <div className="text-center py-8">Cargando campaña...</div>;
    }

    if (!campaign) {
        return (
            <div className="text-center py-8">
                <p className="text-text-secondary">No hay una campaña activa.</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-8">
                <p className="text-red-500">Error: {error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <PageHeader title="Campaña" breadcrumbs={[{ label: 'Campaña' }]}>
                <div className="w-full md:w-auto">
                    <Button
                        className="w-full sm:px-10 sm:py-3 sm:text-base"
                        icon={PlusCircle}
                        onClick={openModal}
                    >
                        Cosechar Lote
                    </Button>
                </div>
            </PageHeader>

            <Filters
                campaign={campaign}
                filterCrop={filterCrop}
                setFilterCrop={setFilterCrop}
                cropNames={cropNames}
                loading={loadingSessions}
            />

            <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />

            <SessionSection
                harvestSessions={finalFilteredSessions || []}
                onViewLot={handleViewLot}
                loading={loadingSessions}
            />

            <AddModal
                isOpen={isModalOpen}
                onClose={closeModal}
                showToast={showToast}
                campaign={campaign}
            />
        </div>
    );
};

export default HarvestListView;