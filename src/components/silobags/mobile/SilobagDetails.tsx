import { AlertTriangle } from "lucide-react";
import type { FC } from "react";
import type { Silobag } from "../../../types";
import { formatNumber } from "../../../utils";
import SiloBagMetrics from "../SilobagMetrics";

const SiloBagDetailsMobile: FC<{ siloBag: Silobag }> = ({ siloBag }) => (
    <div className="md:hidden text-center">
        <div>
            <h2 className="text-2xl font-bold text-text-primary">Silobolsa {siloBag.name}</h2>
            {siloBag.status === 'closed' && siloBag.lost_kg > 0 && (
                <div className="mt-1.5 text-xs font-semibold text-yellow-700 bg-yellow-100 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full">
                    <AlertTriangle size={12} />
                    <span>{formatNumber(siloBag.lost_kg)} kgs perdidos</span>
                </div>
            )}
            <div className="mt-2 text-sm text-text-secondary flex justify-center items-center gap-2">
                <span>{siloBag.crop.name}</span>
                <span className="text-gray-300">•</span>
                <span>{siloBag.field.name}</span>
                <span className="text-gray-300">•</span>
                <span className={`font-semibold ${siloBag.status === 'active' ? 'text-green-600' : 'text-red-600'}`}>
                    {siloBag.status === 'active' ? 'Activo' : 'Cerrado'}
                </span>
            </div>
            <div className="mt-2 text-sm text-text-secondary flex justify-center items-center gap-2">
                <span>{siloBag.location}</span>
            </div>
        </div>
        <div className="border-t border-gray-200 my-4"></div>
        <SiloBagMetrics siloBag={siloBag} />
    </div>
);

export default SiloBagDetailsMobile;