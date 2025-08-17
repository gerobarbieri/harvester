import { useMemo } from 'react';
import type { HarvestSession } from '../../types';
import type { SessionsFiltersProps } from '../../components/harvest-session/ui/Filters';

export const useHarvestSessionFilters = (
    sessions: HarvestSession[] | null,
    filters: SessionsFiltersProps
) => {
    const filteredSessions = useMemo(() => {
        if (!sessions) {
            return [];
        }

        let tempSessions = [...sessions];

        if (filters.field !== 'all') {
            tempSessions = tempSessions.filter(session => session.field.id === filters.field);
        }

        if (filters.crop !== 'all') {
            tempSessions = tempSessions.filter(session => session.crop.id === filters.crop);
        }

        return tempSessions;
    }, [sessions, filters]);

    return {
        filteredSessions
    };
};