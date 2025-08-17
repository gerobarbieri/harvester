// src/components/dashboards/harvest/HarvestStatsSection.tsx
import { type FC, useMemo } from 'react';
import { Tractor, Leaf, Weight } from "lucide-react";
import { Timestamp } from 'firebase/firestore';
import StatCard from '../commons/StatCard';
import type { HarvestSession } from '../../../types';

interface HarvestStatsSectionProps {
    sessions: HarvestSession[];
    loading?: boolean;
    className?: string;
}

const HarvestStatsSection: FC<HarvestStatsSectionProps> = ({
    sessions,
    loading = false,
    className = ''
}) => {
    const todayStats = useMemo(() => {
        if (!sessions?.length) return { activeLots: 0, todayHectares: 0, todayKgs: 0 };

        const today = new Date().toISOString().split('T')[0];

        // Filtrar sesiones del día actual
        const todaySessions = sessions.filter(session => {
            if (!session.date) return false;

            const sessionDate = session.date instanceof Timestamp
                ? session.date.toDate().toISOString().split('T')[0]
                : new Date(session.date).toISOString().split('T')[0];

            return sessionDate === today;
        });

        // Contar lotes activos (en progreso)
        const activeLots = sessions.filter(session =>
            session.status === 'in-progress'
        ).length;

        // Sumar hectáreas del día
        const todayHectares = todaySessions.reduce((sum, session) =>
            sum + (session.harvested_hectares || 0), 0
        );

        // Sumar kilos del día (convertir a toneladas)
        const todayKgs = todaySessions.reduce((sum, session) =>
            sum + (session.total_kgs || 0), 0
        ) / 1000; // Convertir a toneladas

        return { activeLots, todayHectares, todayKgs };
    }, [sessions]);

    if (loading) {
        return (
            <div className={`w-full lg:grid lg:grid-cols-3 lg:gap-6 ${className}`}>
                <div className="flex gap-4 overflow-x-auto pb-4 lg:pb-0 lg:contents">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="flex-shrink-0 w-4/5 sm:w-2/3 md:w-1/2 lg:w-full">
                            <div className="bg-gray-100 animate-pulse rounded-2xl p-6 h-24"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className={`w-full lg:grid lg:grid-cols-3 lg:gap-6 ${className}`}>
            <div className="flex gap-4 overflow-x-auto pb-4 lg:pb-0 lg:contents">
                <div className="flex-shrink-0 w-4/5 sm:w-2/3 md:w-1/2 lg:w-full">
                    <StatCard
                        title="Lotes en Cosecha"
                        value={todayStats.activeLots.toString()}
                        unit="activos"
                        icon={Tractor}
                        color="green"
                    />
                </div>
                <div className="flex-shrink-0 w-4/5 sm:w-2/3 md:w-1/2 lg:w-full">
                    <StatCard
                        title="Hectáreas del Día"
                        value={todayStats.todayHectares.toFixed(1)}
                        unit="ha"
                        icon={Leaf}
                        color="blue"
                    />
                </div>
                <div className="flex-shrink-0 w-4/5 sm:w-2/3 md:w-1/2 lg:w-full">
                    <StatCard
                        title="Kilos del Día"
                        value={todayStats.todayKgs.toFixed(1)}
                        unit="tn"
                        icon={Weight}
                        color="orange"
                    />
                </div>
            </div>
        </div>
    );
};

export default HarvestStatsSection;