import type { FC } from "react";
import Button from "../../commons/Button";
import Card from "../../commons/Card";
import type { HarvestSession } from "../../../types";

interface PlotSectionProps {
    harvestSessions: HarvestSession[];
    onViewLot: (lot: HarvestSession) => void;
}

const getStatus = (status: string): string => {
    if (status === 'finished') return 'Finalizado';
    if (status === 'in-progress') return 'En Progreso';
    return 'Pendiente';
};

const StatusBadge: FC<{ status: string }> = ({ status }) => {
    const styles: { [key: string]: string } = {
        'Pendiente': 'bg-orange-100 text-orange-800',
        'En Progreso': 'bg-blue-100 text-blue-800',
        'Finalizado': 'bg-primary-light text-primary-dark', // Asegúrate de que primary-light y primary-dark estén definidos en tu configuración de Tailwind
    };
    return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${styles[status]}`}>{status}</span>;
};

const PlotCard: FC<{ harvestSession: HarvestSession; onClick: (harvestSession: HarvestSession) => void }> = ({ harvestSession, onClick }) => {
    const progress = ((harvestSession.harvested_hectares - harvestSession.hectares) * 100).toFixed(1)
    return (
        <Card onClick={() => onClick(harvestSession)} className="flex flex-col justify-between hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer">
            <div>
                <div className="flex justify-between items-start">
                    <h3 className="font-bold text-lg text-text-primary">{harvestSession.plot.name}</h3>
                    <StatusBadge status={getStatus(harvestSession.status)} />
                </div>
                <p className="text-sm text-text-secondary">{harvestSession.crop.name} - {harvestSession.field.name}</p>
            </div>
            <div className="mt-4">
                <div className="flex justify-between items-baseline mb-1">
                    <span className="text-sm font-medium text-text-secondary">Avance</span>
                    <span className="text-sm font-bold text-primary-dark">{progress}%</span>
                </div>
                <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div style={{ width: `${progress}%` }} className="h-full bg-primary transition-all duration-500"></div>
                </div>
            </div>
        </Card>
    )
};

const PlotSection: FC<PlotSectionProps> = ({ harvestSessions, onViewLot }) => (
    <div className="space-y-6">
        <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {harvestSessions.map(hs => <PlotCard key={hs.id} harvestSession={hs} onClick={onViewLot} />)}
            </div>
        </div>
        {/* Botón para cargar más registros */}
        <div className="flex justify-center">
            <Button onClick={() => console.log('Cargar más lotes (simulado)')} className="bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-400">Cargar más Lotes</Button>
        </div>
    </div>
);

export default PlotSection;