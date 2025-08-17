import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import Button from "../../components/commons/Button";
import PageHeader from "../../components/commons/layout/PageHeader";
import Tabs from "../../components/harvest-session/ui/Tabs";
import AddModal from "../../components/harvest-session/modals/AddModal";
import { PlusCircle } from "lucide-react";
import { useHarvestSessionsByCampaign } from "../../hooks/harvest-session/useHarvestSessionsByCampaign";
import { useHarvestSessionFilters } from "../../hooks/harvest-session/useHarvestSessionsFilters";
import SessionSection from "../../components/harvest-session/ui/SessionSection";
import SessionsFilters, { type SessionsFiltersProps } from "../../components/harvest-session/ui/Filters";

import { useCampaigns } from "../../hooks/campaign/useCampaigns";

const HarvestListView = () => {
    const [filters, setFilters] = useState<SessionsFiltersProps>({
        campaign: '', crop: 'all', field: 'all'
    });
    const [activeTab, setActiveTab] = useState('todos');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const navigate = useNavigate();
    const { campaigns, loading: loadingCampaigns } = useCampaigns();
    const { sessions, loading: loadingSessions, error } = useHarvestSessionsByCampaign(filters.campaign);

    useEffect(() => {
        if (campaigns.length > 0 && !filters.campaign) {
            const activeCampaign = campaigns.find(c => c.active === true) || campaigns[0];
            if (activeCampaign) {
                setFilters(prev => ({ ...prev, campaign: activeCampaign.id }));
            }
        }
    }, [campaigns, filters.campaign]);

    const handleFilterChange = useCallback((filterName: keyof SessionsFiltersProps, value: string) => {
        setFilters(currentFilters => {
            const newFilters = { ...currentFilters, [filterName]: value };
            if (filterName === 'campaign') {
                newFilters.field = 'all';
                newFilters.crop = 'all';
            }
            return newFilters;
        });
    }, []);

    const { filteredSessions } = useHarvestSessionFilters(sessions, filters);

    const getFilteredByTab = () => {
        if (activeTab === 'todos') return filteredSessions;

        const statusMap = {
            'pending': ['pending', 'Pendiente'],
            'in-progress': ['in-progress', 'En Progreso'],
            'finished': ['finished', 'Finalizado'] // Simplificado
        };

        const allowedStatuses = statusMap[activeTab] || [];
        // Usamos optional chaining (?) por si filteredSessions es undefined al inicio
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

    if (loadingCampaigns) {
        return <div className="text-center py-8">Cargando campañas...</div>;
    }

    if (!campaigns) {
        return (
            <div className="text-center py-8">
                <p className="text-text-secondary">No hay campañas disponibles.</p>
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

            <SessionsFilters
                filters={filters}
                onFilterChange={handleFilterChange}
                campaigns={campaigns}
                campaignsLoading={loadingCampaigns}
                sessionsForCampaign={sessions}
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
            />
        </div>
    );
};

export default HarvestListView;