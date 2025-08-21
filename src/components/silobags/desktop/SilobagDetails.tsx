import { AlertTriangle } from "lucide-react";
import type { FC } from "react";
import type { Silobag } from "../../../types";
import { formatNumber } from "../../../utils";
import SiloBagMetrics from "../SilobagMetrics";

const SiloBagDetailsDesktop: FC<{ siloBag: Silobag }> = ({ siloBag }) => (
    <div className="hidden md:grid md:grid-cols-2 md:divide-x md:divide-gray-200">
        <div className="p-6 text-left">
            <h2 className="text-2xl font-bold text-text-primary">Silobolsa {siloBag.name}</h2>
            {siloBag.status === 'closed' && siloBag.lost_kg > 0 && (
                <div className="mt-1.5 text-xs font-semibold text-yellow-700 bg-yellow-100 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full">
                    <AlertTriangle size={12} />
                    <span>{formatNumber(siloBag.lost_kg)} kgs perdidos</span>
                </div>
            )}
            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                    <p className="text-text-secondary">Estado</p>
                    <p className={`font-semibold ${siloBag.status === 'active' ? 'text-green-600' : 'text-red-600'}`}>{siloBag.status === 'active' ? 'Activo' : 'Cerrado'}</p>
                </div>
                <div>
                    <p className="text-text-secondary">Cultivo</p>
                    <p className="font-semibold text-text-primary">{siloBag.crop.name}</p>
                </div>
                <div>
                    <p className="text-text-secondary">Campo</p>
                    <p className="font-semibold text-text-primary">{siloBag.field.name}</p>
                </div>
                <div>
                    <p className="text-text-secondary">Ubicación / Lote</p>
                    <p className="font-semibold text-text-primary">{siloBag.location}</p>
                </div>
            </div>
        </div>
        <div className="p-6 flex flex-col justify-center text-left">
            <SiloBagMetrics siloBag={siloBag} />
        </div>
    </div>
);

export default SiloBagDetailsDesktop;