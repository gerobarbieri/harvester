import { type FC } from "react";
import { Link } from "react-router";
import { useCampaigns } from "../../hooks/campaign/useCampaigns";

const CampaignList: FC = () => {

    const { campaigns, loading } = useCampaigns();

    if (loading) {
        return <p>Cargando...</p>
    }

    return (
        <div>
            <header className="mb-6">
                <p className="text-lg text-gray-500">Seleccione una campaña</p>
            </header>
            <div className="grid grid-cols-2 text-center gap-4">

                {campaigns.map(c =>
                    <Link key={c.id} to={`/campaigns/${c.id}/fields`}>
                        <div key={c.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200/80">
                            <h2 className="text-xl font-bold text-[#2A6449]">{c.name}</h2>
                        </div>
                    </Link>)}
            </div>
        </div>);
};

export default CampaignList;