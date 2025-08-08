// src/components/commons/SyncToast.tsx
import { useEffect } from 'react';
import { useSync } from '../../context/sync/SyncProvider';

const SyncToast = () => {
    const { isSyncing } = useSync();

    if (!isSyncing) return;

    const content = {
        icon: isSyncing ? (
            <svg className="animate-spin h-5 w-5 mr-3 text-emerald-600" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
        ) : (
            <svg className="h-5 w-5 mr-3 text-emerald-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
        ),
        text: isSyncing ? 'Sincronizando datos...' : 'Sincronización completa',
        bgClass: isSyncing ? 'bg-white' : 'bg-emerald-50',
        pulseClass: isSyncing ? 'animate-pulse' : ''
    };

    return (
        <div className={`fixed bottom-20 right-4 z-50 shadow-lg rounded-lg p-4 flex items-center transition-all ${content.bgClass} ${content.pulseClass}`}>
            {content.icon}
            <span className="text-gray-700 font-semibold">{content.text}</span>
        </div>
    );
};

export default SyncToast;