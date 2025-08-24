import { Truck } from "lucide-react";
import Card from "../../../shared/components/commons/Card";
import TruckCard from "./TruckCard";

const StatusColumn = ({ status, trucks, openUpdateModal }) => (
    <div className="flex-shrink-0 w-72 md:flex-1 md:w-auto">
        <Card className="p-3 mb-4 bg-gray-50 border-gray-200">
            <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 text-sm">{status.shortLabel}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>{trucks.length}</span>
            </div>
        </Card>

        {/* --- CAMBIO CLAVE AQUÍ --- */}
        {/* Se añaden las clases "md:max-h-none" y "md:overflow-y-visible" para desactivar el scroll en web */}
        <div className="space-y-0 max-h-[calc(100vh-400px)] overflow-y-auto md:max-h-none md:overflow-y-visible">
            {trucks.length > 0 ? (
                trucks.map(truck => <TruckCard key={truck.id} truck={truck} isCompact openUpdateModal={openUpdateModal} />)
            ) : (
                <Card className="p-6 text-center border-2 border-dashed border-gray-200">
                    <Truck className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No hay camiones</p>
                </Card>
            )}
        </div>
    </div>
);

export default StatusColumn;