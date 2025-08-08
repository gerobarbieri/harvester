// src/pages/Dashboard.tsx

import { type FC, useState, useMemo } from "react";

// Componentes
import { KilosIcon, RindeIcon, StatCard } from "../../components/commons/Icons";
import { useCampaigns } from "../../hooks/campaign/useCampaigns";
import { useHarvestSessionsByCampaign } from "../../hooks/harvest-session/useHarvestSessionsByCampaign";

const Dashboard: FC = () => {
    // --- ESTADOS DE LOS FILTROS ---
    const [selectedCampaign, setSelectedCampaign] = useState('');
    const [selectedCrop, setSelectedCrop] = useState('todos');
    const [selectedField, setSelectedField] = useState('todos');
    const [selectedPlot, setSelectedPlot] = useState('todos');

    // --- OBTENCIÓN DE DATOS ---
    const { campaigns, loading: campaignsLoading } = useCampaigns();
    const { sessions: sessionsForCampaign, loading: sessionsLoading } = useHarvestSessionsByCampaign(selectedCampaign);

    // --- LÓGICA DE FILTROS Y CÁLCULOS (usando useMemo para optimizar) ---

    // 2. Opciones para el desplegable de Cultivos (se generan a partir de las sesiones)
    const availableCrops = useMemo(() => {
        if (!sessionsForCampaign) return [];
        const uniqueCrops = new Map(sessionsForCampaign.map(s => [s.crop.id, s.crop]));
        return Array.from(uniqueCrops.values());
    }, [sessionsForCampaign]);

    // 3. Opciones para el desplegable de Campos
    const availableFields = useMemo(() => {
        if (!sessionsForCampaign) return [];
        let filteredByCrop = sessionsForCampaign;
        if (selectedCrop !== 'todos') {
            filteredByCrop = sessionsForCampaign.filter(s => s.crop.id === selectedCrop);
        }
        const uniqueFields = new Map(filteredByCrop.map(s => [s.field.id, s.field]));
        return Array.from(uniqueFields.values());
    }, [sessionsForCampaign, selectedCrop]);

    // 4. Opciones para el desplegable de Lotes
    const availablePlots = useMemo(() => {
        if (!sessionsForCampaign) return [];
        let filteredByField = sessionsForCampaign;
        if (selectedField !== 'todos') {
            filteredByField = sessionsForCampaign.filter(s => s.field.id === selectedField);
        }
        const uniquePlots = new Map(filteredByField.map(s => [s.plot.id, s.plot]));
        return Array.from(uniquePlots.values());
    }, [sessionsForCampaign, selectedField]);

    // 5. Datos finales para las tarjetas, después de aplicar todos los filtros
    const dashboardData = useMemo(() => {
        const initialTotals = { seed_hectares: 0, harvested_hectares: 0, harvested_kgs: 0 };
        if (!sessionsForCampaign) return initialTotals;

        const filteredSessions = sessionsForCampaign.filter(s => {
            const cropMatch = selectedCrop === 'todos' || s.crop.id === selectedCrop;
            const fieldMatch = selectedField === 'todos' || s.field.id === selectedField;
            const plotMatch = selectedPlot === 'todos' || s.plot.id === selectedPlot;
            return cropMatch && fieldMatch && plotMatch;
        });

        return filteredSessions.reduce((acc, session) => {
            acc.seed_hectares += session.hectares || 0;
            acc.harvested_hectares += session.harvested_hectares || 0;
            acc.harvested_kgs += session.harvested_kgs || 0;
            return acc;
        }, initialTotals);
    }, [sessionsForCampaign, selectedCrop, selectedField, selectedPlot]);

    // --- CÁLCULOS FINALES PARA LA UI ---
    const status = dashboardData.seed_hectares > 0 ? (dashboardData.harvested_hectares / dashboardData.seed_hectares) * 100 : 0;
    const yieldSeedHectares = dashboardData.seed_hectares > 0 ? (dashboardData.harvested_kgs / dashboardData.seed_hectares) : 0;
    const yieldHarvestedHectares = dashboardData.harvested_hectares > 0 ? (dashboardData.harvested_kgs / dashboardData.harvested_hectares) : 0;

    if (campaignsLoading) {
        return <p>Cargando panel...</p>;
    }

    return (
        <div>
            {/* --- SECCIÓN DE FILTROS --- */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200/80 mb-8">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Controles del Dashboard</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                        <label htmlFor="campaign-filter" className="block text-sm font-medium text-gray-700 mb-1">Campaña</label>
                        <select id="campaign-filter" value={selectedCampaign} onChange={(e) => { setSelectedCampaign(e.target.value); setSelectedCrop('todos'); setSelectedField('todos'); setSelectedPlot('todos'); }} className="w-full p-3 border-gray-300 bg-gray-50 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2A6449]">
                            <option value="" disabled>Seleccione una campaña</option>
                            {campaigns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="crop-filter" className="block text-sm font-medium text-gray-700 mb-1">Cultivo</label>
                        <select id="crop-filter" value={selectedCrop} onChange={(e) => { setSelectedCrop(e.target.value); setSelectedField('todos'); setSelectedPlot('todos'); }} disabled={!selectedCampaign || sessionsLoading} className="w-full p-3 border-gray-300 bg-gray-50 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2A6449]">
                            <option value="todos">Todos los cultivos</option>
                            {availableCrops.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="field-filter" className="block text-sm font-medium text-gray-700 mb-1">Campo</label>
                        <select id="field-filter" value={selectedField} onChange={(e) => { setSelectedField(e.target.value); setSelectedPlot('todos'); }} disabled={!selectedCampaign || sessionsLoading} className="w-full p-3 border-gray-300 bg-gray-50 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2A6449]">
                            <option value="todos">Todos los campos</option>
                            {availableFields.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="plot-filter" className="block text-sm font-medium text-gray-700 mb-1">Lote</label>
                        <select id="plot-filter" value={selectedPlot} onChange={(e) => setSelectedPlot(e.target.value)} disabled={!selectedCampaign || sessionsLoading} className="w-full p-3 border-gray-300 bg-gray-50 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2A6449]">
                            <option value="todos">Todos los lotes</option>
                            {availablePlots.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {/* --- SECCIÓN DE TARJETAS DE DATOS --- */}
            {sessionsLoading ? <p>Calculando...</p> : (
                <>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200/80 mb-8">
                        <div className="flex justify-between items-baseline mb-2">
                            <h2 className="text-lg font-semibold text-gray-800">Avance de Cosecha</h2>
                            <span className="text-2xl font-bold text-[#2A6449]">{status.toFixed(0)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-4"><div className="bg-gradient-to-r from-green-500 to-green-700 h-4 rounded-full transition-all duration-500 ease-out" style={{ width: `${status}%` }}></div></div>
                        <div className="flex justify-between items-center text-sm text-gray-600 mt-2">
                            <span>{dashboardData.harvested_hectares.toLocaleString('es-AR')} ha</span>
                            <span>{dashboardData.seed_hectares.toLocaleString('es-AR')} ha</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <StatCard
                            title="Kg Cosechados"
                            value={dashboardData.harvested_kgs.toLocaleString('es-AR')}
                            unit="kg"
                            icon={<KilosIcon />}
                        />
                        <StatCard
                            title="Rinde has/Sembrado"
                            value={yieldSeedHectares.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                            unit="kg/ha"
                            icon={<RindeIcon />}
                        />
                        <StatCard
                            title="Rinde has/Cosechado"
                            value={yieldHarvestedHectares.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                            unit="kg/ha"
                            icon={<RindeIcon />}
                        />
                    </div>
                </>
            )}
        </div>
    );
};

export default Dashboard;