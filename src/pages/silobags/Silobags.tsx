import Card from "../../components/commons/Card";
import Select from "../../components/commons/form/Select";
import Filters from "../../components/silobags/Filters";
import SiloBagCard from "../../components/silobags/SilobagCard";

const SiloBagsView = () => {
    return (
        <div className="space-y-6">
            <Filters />
            <div className="max-h-[60vh] overflow-y-auto pr-2">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[].map(silobag => (
                        <SiloBagCard
                            key={silobag.id}
                            silo={silobag}
                            onExtract={() => { }}
                            onClose={() => { }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SiloBagsView;