import { type FC, useMemo } from "react";
import { useParams, Link } from "react-router";
import useData from "../../context/DataContext";

const FieldList: FC = () => {
    const { campaignId } = useParams<{ campaignId: string }>();
    const { campaigns, fields, dataLoading } = useData();
    const campaign = useMemo(() => campaigns.find(c => c.id === campaignId), [campaigns, campaignId]);

    if (!campaign) return <p>Cargando campaña...</p>;

    return (<>
        <header className="mb-6">
            <Link to="/campaigns" className="text-[#2A6449] hover:underline font-semibold mb-2">&larr; Volver a Campañas</Link>
            <h2 className="text-3xl font-bold text-gray-800 mt-4">Campaña {campaign.name}</h2>
            <p className="text-lg text-gray-500 mt-4">Seleccione un campo</p>
        </header>
        <div className="grid grid-cols-2 text-center gap-4">
            {dataLoading ? <p>Cargando...</p> : fields?.map(f =>
                <Link key={f.id} to={`/campaigns/${campaignId}/fields/${f.id}/plots`}>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200/80">
                        <h2 className="text-xl font-bold text-[#2A6449]">{f.name}</h2>
                    </div>
                </Link>
            )}
        </div>
    </>);
};

export default FieldList;