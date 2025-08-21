import { useCallback, useState } from "react";
import { useNavigate } from "react-router";
import Button from "../../components/commons/Button";
import PageHeader from "../../components/commons/layout/PageHeader";
import Tabs from "../../components/harvest-session/ui/Tabs";
import AddModal from "../../components/harvest-session/modals/AddModal";
import { PlusCircle } from "lucide-react";
import { useHarvestSessionsByCampaign } from "../../hooks/harvest-session/useHarvestSessionsByCampaign";
import SessionSection from "../../components/harvest-session/ui/SessionSection";
import SessionsFilters, { type SessionsFiltersProps } from "../../components/harvest-session/ui/Filters";
import { useActiveCampaign } from "../../hooks/campaign/useActiveCampaign";

const HarvestListView = () => {
    const [filters, setFilters] = useState<SessionsFiltersProps>({
        crop: 'all', field: 'all'
    });
    const [activeTab, setActiveTab] = useState('todos');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const navigate = useNavigate();
    const { campaign, loading: loadingCampaign } = useActiveCampaign();
    const { sessions, loading: loadingSessions, error } = useHarvestSessionsByCampaign(campaign?.id);



    const handleFilterChange = useCallback((filterName: keyof SessionsFiltersProps, value: string) => {
        setFilters(currentFilters => {
            const newFilters = { ...currentFilters, [filterName]: value };
            return newFilters;
        });
    }, []);

    const getFilteredSessions = useCallback(() => {
        let filteredData = sessions;

        if (filters.field !== 'all') {
            filteredData = filteredData?.filter(session => session.field.id === filters.field);
        }

        if (filters.crop !== 'all') {
            filteredData = filteredData?.filter(session => session.crop.id === filters.crop);
        }

        if (activeTab !== 'todos') {
            const statusMap: { [key: string]: string[] } = {
                'pending': ['pending', 'Pendiente'],
                'in-progress': ['in-progress', 'En Progreso'],
                'finished': ['finished', 'Finalizado']
            };
            const allowedStatuses = statusMap[activeTab] || [];
            filteredData = filteredData?.filter(session => allowedStatuses.includes(session.status));
        }

        return filteredData || [];
    }, [sessions, filters, activeTab]);

    const finalFilteredSessions = getFilteredSessions();

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

    if (loadingCampaign) {
        return <div className="text-center py-8">Cargando campaña activa...</div>;
    }

    if (!campaign) {
        return (
            <div className="text-center py-8">
                <p className="text-text-secondary">No hay campaña activa disponible.</p>
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
            />
        </div>
    );
};

export default HarvestListView;