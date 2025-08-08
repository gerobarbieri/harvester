import { type FC } from "react";
import { useParams, Link } from "react-router";
import { useCampaignFields } from "../../hooks/field/useCampaignFields";
import { useCampaign } from "../../hooks/campaign/useCampaign";

const FieldList: FC = () => {
    const { campaignId } = useParams<{ campaignId: string }>();
    const { campaign, loading: campaignLoading } = useCampaign(campaignId);
    const { campaignFields, loading } = useCampaignFields(campaignId);

    if (loading || campaignLoading) {
        return <p>Cargando...</p>
    }

    return (<>
        <header className="mb-6">
            <Link to="/campaigns" className="text-[#2A6449] hover:underline font-semibold mb-2">&larr; Volver a Campañas</Link>
            <h2 className="text-3xl font-bold text-gray-800 mt-4">Campaña {campaign?.name}</h2>
            <p className="text-lg text-gray-500 mt-4">Seleccione un campo</p>
        </header>

        {campaignFields.length > 0 ?
            <div className="grid grid-cols-2 text-center gap-4">
                {campaignFields.map(f =>
                    <Link key={f.id} to={`/campaigns/${campaign?.id}/fields/${f.field.id}/harvest-sessions`}>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200/80">
                            <h2 className="text-xl font-bold text-[#2A6449]">{f.field.name}</h2>
                        </div>
                    </Link>
                )}
            </div>
            :
            <div className="flex justify-center items-center mb-2 mt-8">
                <h3 className="text-xl font-bold text-[#2A6449]">No se encontraron campos para esta campaña.</h3>
            </div>
        }

    </>);
};

export default FieldList;