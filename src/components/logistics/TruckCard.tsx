import { format } from "date-fns";
import { MapPin, Package, User, ChevronRight } from "lucide-react";
import type { Logistics } from "../../types";
import Card from "../commons/Card";

const TruckCard = ({ truck, isCompact = false, openUpdateModal }: { truck: Logistics, isCompact?: boolean, openUpdateModal }) => (
    <Card className={`${isCompact ? 'p-3' : 'p-4'} mb-3 cursor-pointer hover:shadow-md transition-shadow`} onClick={() => openUpdateModal(truck)}>
        <div className="font-semibold text-gray-900 text-sm mb-2">Camion Nro. {truck.order}</div>
        <div className="space-y-1.5 text-xs text-gray-600">
            <div className="flex items-center gap-1.5"><MapPin className="h-3 w-3 flex-shrink-0" /><span className="truncate">{truck.field?.name}</span></div>
            <div className="flex items-center gap-1.5"><Package className="h-3 w-3 flex-shrink-0" /><span className="truncate">{truck.crop?.name}</span></div>
            <div className="flex items-center gap-1.5"><User className="h-3 w-3 flex-shrink-0" /><span className="truncate">{truck.driver}</span></div>
        </div>
        <div className="mt-3 flex items-center justify-between">
            <span className="text-xs text-gray-500">{format(truck.date.toDate(), 'dd/MM/yyyy')}</span>
            <ChevronRight className="h-4 w-4 text-gray-400" />
        </div>
    </Card>
);

export default TruckCard;