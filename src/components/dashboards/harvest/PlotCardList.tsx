import { PlusCircle } from "lucide-react";
import Card from "../../commons/Card";

const PlotCardList = ({ title, plots, showProgress = false }) => {
    const LotCardComponent = ({ plot }) => (
        <div className="bg-background p-4 rounded-xl hover:bg-gray-200/60 transition-colors cursor-pointer">
            <div className="flex justify-between items-center">
                <div>
                    <p className="font-semibold text-gray-900">{plot.name}</p>
                    <p className="text-text-secondary text-sm">{plot.field.name} - {plot.crop.name}</p>
                </div>
                {showProgress ? (
                    <span className="font-bold text-gray-900">{0}%</span>
                ) : (
                    <button className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center hover:bg-primary-medium transition-colors">
                        <PlusCircle size={16} />
                    </button>
                )}
            </div>
            {showProgress && (
                <div className="mt-3">
                    <div className="w-full bg-gray-300 rounded-full h-2">
                        <div
                            className="bg-primary h-2 rounded-full transition-all duration-300"
                            style={{ width: `${0}%` }}
                        ></div>
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <Card className="flex-1">
            <h3 className="text-lg font-semibold text-text-primary mb-4">{title}</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {plots.map(plot => (
                    <LotCardComponent key={plot.id} plot={plot} />
                ))}
            </div>
        </Card>
    );
};

export default PlotCardList;