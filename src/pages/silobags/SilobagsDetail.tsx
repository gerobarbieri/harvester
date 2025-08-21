import { ArrowLeft, AlertCircle } from "lucide-react";
import type { FC } from "react";
import { useParams, useNavigate } from "react-router";
import Button from "../../components/commons/Button";
import Card from "../../components/commons/Card";

import { useSiloBagMovements } from "../../hooks/silobags/useSilobagMovements";
import { useSiloBag } from "../../hooks/silobags/useSilobag";

import PageHeader from "../../components/commons/layout/PageHeader";
import MovementsListDesktop from "../../components/silobags/desktop/MovementsList";
import MovementsListMobile from "../../components/silobags/mobile/MovementsList";
import SiloBagDetailsDesktop from "../../components/silobags/desktop/SilobagDetails";
import SiloBagDetailsMobile from "../../components/silobags/mobile/SilobagDetails";

const SiloBagDetail: FC = () => {
    const { siloId } = useParams<{ siloId: string }>();
    const navigate = useNavigate();
    const { siloBag, loading: loadingSilo, error: errorSilo } = useSiloBag(siloId);
    const { movements, loading: loadingMovements, error: errorMovements } = useSiloBagMovements(siloBag?.id);
    const isLoading = loadingSilo || loadingMovements;
    const error = errorSilo || errorMovements;

    if (isLoading) return <div className="text-center py-10">Cargando detalles del silo...</div>;
    if (error) return <div className="text-center text-red-500 py-10">Error al cargar los datos: {error.message}</div>;
    if (!siloBag) return <div className="text-center text-text-secondary py-10">No se encontró el silobolsa seleccionado.</div>;

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader title="Detalle de Silo" breadcrumbs={[{ label: `Silo ${siloBag.name}` }]} />
            <Button variant="secondary" icon={ArrowLeft} onClick={() => navigate(-1)}>Volver a Silos</Button>

            <Card>
                <SiloBagDetailsMobile siloBag={siloBag} />
                <SiloBagDetailsDesktop siloBag={siloBag} />
            </Card>

            <Card>
                <h3 className="text-xl font-bold text-text-primary mb-4">Historial de Movimientos</h3>
                {movements.length > 0 ? (
                    <>
                        <MovementsListDesktop movements={movements} />
                        <MovementsListMobile movements={movements} />
                    </>
                ) : (
                    <div className="text-center py-10 text-text-secondary">
                        <AlertCircle size={40} className="mx-auto mb-2 text-gray-300" />
                        <p>No se encontraron movimientos para este silobolsa.</p>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default SiloBagDetail;