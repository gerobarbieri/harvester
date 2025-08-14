import { MinusCircle, X } from "lucide-react";
import Button from "../commons/Button";
import Card from "../commons/Card";

const SiloBagCard = ({ silo, onExtract, onClose }) => {
    const fillPercentage = silo.initial_kg > 0 ? (silo.current_kg / silo.initial_kg) * 100 : 0;
    const isClosed = silo.current_kg <= 0;

    return (
        <Card className={`transition-all duration-300 flex flex-col justify-between ${isClosed ? 'bg-gray-50 opacity-70' : 'bg-surface'}`}>
            <div>
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="font-bold text-lg text-text-primary">{silo.name}</h3>
                        <p className="text-sm text-text-secondary">{silo.crop.name} - {silo.created_at}</p>
                    </div>
                    {isClosed && <span className="px-3 py-1 text-xs font-bold text-red-800 bg-red-100 rounded-full">CERRADO</span>}
                </div>
                <div className="my-4 text-center">
                    <p className="text-4xl font-bold text-text-primary">{silo.current_kg.toLocaleString()}</p>
                    <p className="text-sm font-medium text-text-secondary">Kilos restantes</p>
                </div>
                <div>
                    <div className="h-3 w-full bg-background rounded-full overflow-hidden">
                        <div style={{ width: `${fillPercentage}%` }} className="h-full bg-primary-darker transition-all duration-500"></div>
                    </div>
                    <p className="text-xs text-right mt-1 text-text-secondary">Inicial: {silo.initial_kg.toLocaleString()} kg</p>
                </div>
            </div>
            {!isClosed && (
                <div className="mt-6 flex gap-3">
                    <Button variant="secondary" className="w-full" onClick={() => onExtract(silo)} icon={MinusCircle}>Extraer</Button>
                    <Button variant="danger" className="w-full" onClick={() => onClose(silo)} icon={X}>Cerrar</Button>
                </div>
            )}
        </Card>
    );
};

export default SiloBagCard