import { type FC, useState, useMemo } from "react";
import { KilosIcon, RindeIcon, StatCard } from "../ui/Icons";
import useData from "../../context/DataContext";

const Dashboard: FC = () => {
    const { crops, fields, campaigns, harvestPlotsWithDetails } = useData();
    const [selectedCampaign, setSelectedCampaign] = useState('');
    const [selectedCrop, setSelectedCrop] = useState('');
    const [selectedField, setSelectedField] = useState('todos');

    const sortedCampaigns = useMemo(() => {
        if (!campaigns) return [];
        return [...campaigns].sort((a, b) => {
            const timeA = a.date ? new Date(a.date).getTime() : 0;
            const timeB = b.date ? new Date(b.date).getTime() : 0;
            if (isNaN(timeA) || isNaN(timeB)) return b.name.localeCompare(a.name);
            return timeB - timeA;
        });
    }, [campaigns]);


    const availableCrops = useMemo(() => {
        if (!crops || !harvestPlotsWithDetails) return [];
        const activeCrops = new Set(
            harvestPlotsWithDetails
                .filter(hp => hp.campaign_id === selectedCampaign)
                .map(hp => hp.crop_id)
        );
        return crops.filter(crop => activeCrops.has(crop.id))
    }, [crops, harvestPlotsWithDetails, selectedCampaign]);

    const availableFields = useMemo(() => {
        if (!fields || !harvestPlotsWithDetails) return [];
        const activeFields = new Set(
            harvestPlotsWithDetails
                .filter(hp => hp.campaign_id === selectedCampaign && hp.crop_id === selectedCrop)
                .map(hp => hp.field_id)
        );
        return fields.filter(field => activeFields.has(field.id))
    }, [fields, harvestPlotsWithDetails, selectedCampaign, selectedCrop]);

    // Lógica para agregar y calcular los datos basados en los filtros
    const dashboardData = useMemo(() => {
        const filteredPlots = harvestPlotsWithDetails.filter(p => {
            if (selectedField === 'todos') return p.campaign_id === selectedCampaign && p.crop_id === selectedCrop

            return p.campaign_id === selectedCampaign && p.crop_id === selectedCrop && p.field_id === selectedField
        });

        const totals = filteredPlots.reduce((acc, plot) => {
            acc.seed_hectares += plot.hectares;
            acc.harvested_hectares += plot.harvested_hectares;
            acc.harvested_kgs += plot.harvested_kgs;
            return acc;
        }, { seed_hectares: 0, harvested_hectares: 0, harvested_kgs: 0 });

        return totals;
    }, [selectedCampaign, selectedCrop, selectedField, harvestPlotsWithDetails]);

    const status = dashboardData.seed_hectares > 0 ? (dashboardData.harvested_hectares / dashboardData.seed_hectares) * 100 : 0;
    const yieldSeedHectares = dashboardData.seed_hectares > 0 ? (dashboardData.harvested_kgs / dashboardData.seed_hectares) : 0;
    const yieldHarvestedHectares = dashboardData.harvested_hectares > 0 ? (dashboardData.harvested_kgs / dashboardData.harvested_hectares) : 0;

    return (
        <div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200/80 mb-8">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Controles del Dashboard</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label htmlFor="campaign-filter" className="block text-sm font-medium text-gray-700 mb-1">Campaña</label>
                        <select id="campaign-filter" value={selectedCampaign} onChange={(e) => { setSelectedCampaign(e.target.value); setSelectedCrop(''); setSelectedField('todos'); }} className="w-full p-3 border-gray-300 bg-gray-50 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2A6449]">
                            <option value="" disabled>Seleccione una campaña</option>
                            {sortedCampaigns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="crop-filter" className="block text-sm font-medium text-gray-700 mb-1">Cultivo</label>
                        <select id="crop-filter" value={selectedCrop} onChange={(e) => { setSelectedCrop(e.target.value); setSelectedField('todos'); }} className="w-full p-3 border-gray-300 bg-gray-50 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2A6449]">
                            <option value="" disabled>Seleccione un cultivo</option>
                            {availableCrops.map(c => <option key={c.id} value={c.id}>{c.name} {c.type}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="field-filter" className="block text-sm font-medium text-gray-700 mb-1">Campo</label>
                        <select id="field-filter" value={selectedField} onChange={(e) => setSelectedField(e.target.value)} className="w-full p-3 border-gray-300 bg-gray-50 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2A6449]">
                            <option value="todos">Todos los campos</option>
                            {availableFields.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {/* --- TARJETA PRINCIPAL DE AVANCE --- */}
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

            {/* --- TARJETAS DE ESTADÍSTICAS SECUNDARIAS --- */}
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
        </div>
    );
};

export default Dashboard