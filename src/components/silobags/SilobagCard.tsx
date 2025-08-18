// src/components/silobags/SiloBagCard.tsx
import { Link } from 'react-router';
import { MinusCircle, X, AlertTriangle, Archive } from 'lucide-react';
import Card from '../commons/Card';
import { formatNumber } from '../../utils';
import Button from '../commons/Button';
import { useMemo } from 'react';

interface SiloBagCardProps {
    silo: any; // Deberías usar tu tipo SiloBag
    onExtract: (e: React.MouseEvent) => void;
    onClose: (e: React.MouseEvent) => void;
}

// src/components/silobags/SiloBagCard.tsx - Versión con loading states
const SiloBagCard: React.FC<SiloBagCardProps> = ({ silo, onExtract, onClose }) => {
    const isClosed = silo.status === 'closed';
    const hasLoss = isClosed && silo.lost_kg > 0;

    // Calcular fillPercentage con fallback
    const fillPercentage = useMemo(() => {
        if (silo.initial_kg > 0) {
            return (silo.current_kg / silo.initial_kg) * 100;
        }
        return 0;
    }, [silo.current_kg, silo.initial_kg]);

    return (
        <Card className={`p-4 transition-all duration-300 group ${isClosed ? 'bg-gray-100 opacity-80' : 'bg-surface hover:shadow-md hover:border-gray-300'
            }`}>
            <div className="flex items-center gap-4">
                {/* Icono con loading state */}
                <div className="flex-shrink-0">
                    <div className={`w-11 h-11 flex items-center justify-center rounded-lg ${isClosed ? 'bg-gray-200 text-gray-500' : 'bg-secondary text-white'
                        }`}>
                        <Archive size={22} />
                    </div>
                </div>

                <Link to={`/silo-bags/${silo.id}`} className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="font-bold text-text-primary truncate group-hover:text-primary">
                                {silo.name}
                            </p>
                            <p className="text-sm text-text-secondary">
                                {silo.crop.name} <span className="text-gray-300 mx-1">•</span> {silo.field.name}
                            </p>
                        </div>
                        <div className="text-right flex-shrink-0 ml-2">
                            <p className="font-bold text-lg text-primary">
                                {hasLoss ? '0' : formatNumber(silo.current_kg)}
                            </p>
                            <p className="text-xs text-text-secondary -mt-1">kgs</p>

                        </div>
                    </div>

                    {hasLoss ? (
                        <div className="mt-1.5 text-xs font-semibold text-yellow-700 bg-yellow-100 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full">
                            <AlertTriangle size={12} />
                            <span>{formatNumber(silo.lost_kg)} kgs perdidos</span>
                        </div>
                    ) : (
                        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2 overflow-hidden"
                            title={`${fillPercentage.toFixed(0)}%`}>
                            <div
                                style={{ width: `${isClosed ? 0 : fillPercentage}%` }}
                                className={'h-full rounded-full transition-all duration-500 bg-primary-darker'}
                            ></div>
                        </div>
                    )}
                </Link>

                {/* Acciones - disabled mientras procesa */}
                {!isClosed && (
                    <div className="flex items-center border-l border-gray-200 pl-3">
                        <Button
                            variant="ghost"
                            className="!p-2"
                            onClick={onExtract}
                            title="Extraer Kilos"
                        >
                            <MinusCircle size={20} className="text-text-secondary hover:text-primary" />
                        </Button>
                        <Button
                            variant="ghost"
                            className="!p-2"
                            onClick={onClose}
                            title="Cerrar Silo"
                        >
                            <X size={20} className="text-text-secondary hover:text-red-600" />
                        </Button>
                    </div>
                )}
            </div>
        </Card>
    );
};

export default SiloBagCard;