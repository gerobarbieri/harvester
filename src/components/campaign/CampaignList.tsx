import { useMemo, type FC } from "react";
import useData from "../../context/DataContext";
import { Link } from "react-router";

const CampaignList: FC = () => {
    const { campaigns, dataLoading } = useData();

    const sortedCampaigns = useMemo(() => {
        if (!campaigns) return [];
        return [...campaigns].sort((a, b) => {
            const timeA = a.date ? new Date(a.date).getTime() : 0;
            const timeB = b.date ? new Date(b.date).getTime() : 0;
            if (isNaN(timeA) || isNaN(timeB)) return b.name.localeCompare(a.name);
            return timeB - timeA;
        });
    }, [campaigns]);

    return (
        <div>
            <header className="mb-6">
                <p className="text-lg text-gray-500">Seleccione una campaña</p>
            </header>
            <div className="grid grid-cols-2 text-center gap-4">

                {dataLoading ? <p>Cargando...</p> : sortedCampaigns?.map(c =>
                    <Link key={c.id} to={`/campaigns/${c.id}/fields`}>
                        <div key={c.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200/80">
                            <h2 className="text-xl font-bold text-[#2A6449]">{c.name}</h2>
                        </div>
                    </Link>)}
            </div>
        </div>);
};

export default CampaignList;