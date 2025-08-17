import { ArrowLeft, ArrowDown, ArrowUp, AlertCircle, AlertTriangle, ChevronsRight, PlusCircle, XCircle } from "lucide-react";
import type { FC } from "react";
import { useParams, useNavigate } from "react-router";
import Button from "../../components/commons/Button";
import Card from "../../components/commons/Card";
import type { SilobagMovement } from "../../types";
import { useSiloBagMovements } from "../../hooks/silobags/useSilobagMovements";
import { useSiloBag } from "../../hooks/silobags/useSilobag";
import { formatNumber } from "../../utils";
import PageHeader from "../../components/commons/layout/PageHeader";

const SiloBagDetail: FC = () => {
    const { siloId } = useParams<{ siloId: string }>();
    const navigate = useNavigate();
    const { siloBag, loading: loadingSilo, error: errorSilo } = useSiloBag(siloId);
    const { movements, loading: loadingMovements, loadingMore, error: errorMovements, fetchMore, hasMore } = useSiloBagMovements(siloBag?.id);
    const isLoading = loadingSilo || loadingMovements;
    const error = errorSilo || errorMovements;

    if (isLoading) return <div className="text-center py-10">Cargando detalles del silo...</div>;
    if (error) return <div className="text-center text-red-500 py-10">Error al cargar los datos: {error.message}</div>;
    if (!siloBag) return <div className="text-center text-text-secondary py-10">No se encontró el silobolsa seleccionado.</div>;

    const isClosed = siloBag.status === 'closed';
    const hasLoss = isClosed && siloBag.lost_kg > 0;
    const fillPercentage = siloBag.initial_kg > 0 ? (siloBag.current_kg / siloBag.initial_kg) * 100 : 0;
    const MovementTypeBadge: FC<{ type: string }> = ({ type }) => {
        const typeStyles: { [key: string]: { label: string; classes: string } } = {
            creation: { label: "Creación", classes: "bg-blue-100 text-blue-800" },
            harvest_entry: { label: "Entrada Cosecha", classes: "bg-green-100 text-green-800" },
            substract: { label: "Salida", classes: "bg-red-100 text-red-800" },
            loss: { label: "Ajuste/Pérdida", classes: "bg-yellow-100 text-yellow-800" },
            close: { label: "Cierre", classes: "bg-gray-200 text-gray-800" },
        };
        const style = typeStyles[type] || { label: type, classes: "bg-gray-100 text-gray-800" };
        return <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${style.classes}`}>{style.label}</span>;
    };

    const movementVisuals: { [key: string]: { icon: React.ElementType, color: string } } = {
        creation: { icon: PlusCircle, color: "text-blue-500" },
        harvest_entry: { icon: ArrowDown, color: "text-green-600" },
        substract: { icon: ArrowUp, color: "text-red-500" },
        loss: { icon: AlertTriangle, color: "text-yellow-600" },
        close: { icon: XCircle, color: "text-gray-500" },
        default: { icon: ChevronsRight, color: "text-gray-500" },
    };

    console.log(movements);
    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader title="Detalle de Silo" breadcrumbs={[{ label: `Silo ${siloBag.name}` }]} />
            <Button variant="secondary" icon={ArrowLeft} onClick={() => navigate(-1)}>Volver a Silos</Button>
            <Card>
                {/* --- VISTA PARA MÓVIL (Visible hasta 'md') --- */}
                <div className="md:hidden text-center">
                    {/* Sección de Identidad */}
                    <div>
                        <h2 className="text-2xl font-bold text-text-primary">Silobolsa {siloBag.name}</h2>
                        {hasLoss && <div className="mt-1.5 text-xs font-semibold text-yellow-700 bg-yellow-100 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full">
                            <AlertTriangle size={12} />
                            <span>{formatNumber(siloBag.lost_kg)} kgs perdidos</span>
                        </div>}
                        <div className="mt-2 text-sm text-text-secondary flex justify-center items-center gap-2">
                            <span>{siloBag.crop.name}</span>
                            <span className="text-gray-300">•</span>
                            <span>{siloBag.field.name}</span>
                            <span className="text-gray-300">•</span>
                            <span className={`font-semibold ${siloBag.status === 'active' ? 'text-green-600' : 'text-red-600'}`}>
                                {siloBag.status === 'active' ? 'Activo' : 'Cerrado'}
                            </span>
                        </div>
                        <div className="mt-2 text-sm text-text-secondary flex justify-center items-center gap-2">
                            <span>{siloBag.location}</span>
                        </div>
                    </div>

                    {/* Línea de separación horizontal */}
                    <div className="border-t border-gray-200 my-4"></div>

                    {/* Sección de Métricas */}
                    <div>
                        <p className="text-sm text-text-secondary">Kgs Actuales</p>
                        <p className="text-4xl font-bold text-primary">{formatNumber(siloBag.current_kg)}</p>
                        <div className="mt-4">
                            <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                                <div className="bg-primary-darker h-2.5 rounded-full" style={{ width: `${fillPercentage}%` }}></div>
                            </div>
                            <p className="text-xs text-right text-text-secondary mt-1">
                                Capacidad Inicial: {formatNumber(siloBag.initial_kg)} kgs
                            </p>
                        </div>
                    </div>
                </div>
                {/* --- VISTA PARA WEB (Visible desde 'md' hacia arriba) --- */}
                <div className="hidden md:grid md:grid-cols-2 md:divide-x md:divide-gray-200">
                    <div className="p-6 text-left">
                        <h2 className="text-2xl font-bold text-text-primary">Silobolsa {siloBag.name}</h2>
                        {hasLoss && <div className="mt-1.5 text-xs font-semibold text-yellow-700 bg-yellow-100 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full">
                            <AlertTriangle size={12} />
                            <span>{formatNumber(siloBag.lost_kg)} kgs perdidos</span>
                        </div>}
                        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-text-secondary">Estado</p>
                                <p className={`font-semibold ${siloBag.status === 'active' ? 'text-green-600' : 'text-red-600'}`}>{siloBag.status === 'active' ? 'Activo' : 'Cerrado'}</p>
                            </div>
                            <div>
                                <p className="text-text-secondary">Cultivo</p>
                                <p className="font-semibold text-text-primary">{siloBag.crop.name}</p>
                            </div>
                            <div>
                                <p className="text-text-secondary">Campo</p>
                                <p className="font-semibold text-text-primary">{siloBag.field.name}</p>
                            </div>
                            <div>
                                <p className="text-text-secondary">Ubicación / Lote</p>
                                <p className="font-semibold text-text-primary">{siloBag.location}</p>
                            </div>
                        </div>
                    </div>
                    <div className="p-6 flex flex-col justify-center text-left">
                        <div>
                            <p className="text-sm text-text-secondary">Kgs Actuales</p>
                            <p className="text-4xl font-bold text-primary">{formatNumber(siloBag.current_kg)}</p>
                        </div>
                        <div className="mt-4">
                            <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                                <div className="bg-primary-darker h-2.5 rounded-full" style={{ width: `${fillPercentage}%` }}></div>
                            </div>
                            <p className="text-xs text-right text-text-secondary mt-1">Capacidad Inicial: {formatNumber(siloBag.initial_kg)} kgs</p>
                        </div>
                    </div>
                </div>
            </Card>
            <Card>
                <h3 className="text-xl font-bold text-text-primary mb-4">Historial de Movimientos</h3>
                <div className="hidden md:block">
                    <div className="divide-y divide-gray-100">
                        {movements.length > 0 && movements.map((mov: SilobagMovement) => {
                            const visual = movementVisuals[mov.type] || movementVisuals.default;
                            const Icon = visual.icon;
                            return (
                                <div key={mov.id} className="flex items-center gap-4 p-4 transition-colors hover:bg-gray-50">
                                    <div className="flex items-center gap-3 w-64">
                                        <div className={`p-2 rounded-full ${visual.color}`}><Icon size={20} /></div>
                                        <MovementTypeBadge type={mov.type} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium text-text-primary">{mov.details || "Sin descripción"}</p>
                                        <p className="text-sm text-text-secondary">{mov.date.toLocaleDateString('es-AR')}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className={`text-lg font-bold ${mov.kg_change > 0 ? 'text-green-600' : 'text-red-600'}`}>{mov.kg_change > 0 ? '+' : ''}{formatNumber(mov.kg_change)}</p>
                                        <p className="text-sm text-text-secondary">kgs</p>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
                <div className="md:hidden">
                    <div className="relative border-l-2 border-gray-200 ml-3 space-y-8">
                        {movements.length > 0 && movements.map((mov: SilobagMovement) => (
                            <div key={mov.id} className="relative pl-8">
                                <div className={`absolute -left-[11px] top-1 w-5 h-5 rounded-full flex items-center justify-center ${(mov.kg_change > 0) ? 'bg-green-500' : 'bg-red-500'}`}>{(mov.kg_change > 0) ? <ArrowDown size={12} className="text-white" /> : <ArrowUp size={12} className="text-white" />}</div>
                                <div className="flex justify-between items-center"><span className="font-semibold text-text-primary"><MovementTypeBadge type={mov.type} /></span><span className="text-xs text-text-secondary">{mov.date.toLocaleDateString('es-AR')}</span></div>
                                <p className={`font-bold text-2xl mt-1 ${mov.kg_change > 0 ? 'text-green-600' : 'text-red-600'}`}>{mov.kg_change > 0 ? '+' : ''}{formatNumber(mov.kg_change)} kgs</p>
                                <p className="text-sm text-text-secondary mt-1">{mov.details}</p>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="mt-6 flex justify-center">
                    {hasMore && (
                        <Button variant="secondary" onClick={() => fetchMore()} isLoading={loadingMore}>
                            Cargar más
                        </Button>
                    )}
                    {!loadingMovements && !hasMore && movements.length > 0 && (
                        <p className="text-sm text-text-secondary">Fin del historial</p>
                    )}
                </div>
                {movements.length === 0 && (
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