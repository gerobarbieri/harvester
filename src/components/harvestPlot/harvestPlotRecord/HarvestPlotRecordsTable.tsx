import { type FC } from "react";
import { format } from "date-fns";
import { Timestamp } from "firebase/firestore";
import type { HarvestPlotRecord } from "../../../types";
import { PencilIcon, TrashIcon } from "../../ui/Icons";


interface RecordsTableProps {
    records: HarvestPlotRecord[];
    onEditRecord: (record: HarvestPlotRecord) => void;
    onDeleteRecord: (record: HarvestPlotRecord) => void;
}

const RecordsTable: FC<RecordsTableProps> = ({ records, onEditRecord, onDeleteRecord }) => {
    if (records.length === 0) {
        return (
            <div className="flex justify-center items-center mb-2">
                <h3 className="mt-8 text-xl font-bold text-[#2A6449]">No se encontraron registros.</h3>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto bg-white rounded-lg shadow-md mt-6">
            <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                    <tr>
                        <th className="px-9 py-3 text-center">Fecha</th>
                        <th className="px-9 py-3 text-center">Tipo</th>
                        <th className="px-5 py-3 text-center">Kgs</th>
                        <th className="px-2 py-3 text-center">Humedad</th>
                        <th className="px-1 py-3 text-center">ID/Patente</th>
                        <th className="px-1 py-3 text-center">Chofer</th>
                        <th className="px-1 py-3 text-center">Destino</th>
                        <th className="px-4 py-3 text-center">Observaciones</th>
                        <th className="px-4 py-3 text-center">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {records.map(r => (
                        <tr key={r.id} className="border-b hover:bg-gray-50">
                            <td className="px-4 py-4 text-center">{r.created_at instanceof Timestamp ? format(r.created_at.toDate(), 'dd/MM/yyyy HH:mm') : 'Pendiente'}</td>
                            <td className="px-4 py-4 text-center">{r.type === 'camion' ? '🚚' : '📦'} {r.type}</td>
                            <td className="px-4 py-4 text-center font-semibold">{r.kg.toLocaleString('es-AR')}</td>
                            <td className="px-4 py-4 text-center font-semibold">{r.humidity || '-'}</td>
                            <td className="px-4 py-4 text-center">{r.type === 'camion' ? r.license_plate : r.silobag_name || '-'}</td>
                            <td className="px-4 py-4 text-center">{r.type === 'camion' ? r.driver : '-'}</td>
                            <td className="px-4 py-4 text-center">{r.type === 'camion' ? r.destination : '-'}</td>
                            <td className="px-4 py-4 text-center">{r.details || '-'}</td>
                            <td className="px-4 py-4">
                                <div className="flex justify-center items-center gap-2">
                                    <button onClick={() => onEditRecord(r)} className="p-2 text-gray-500 rounded-full hover:bg-gray-200" title="Editar registro">
                                        <PencilIcon />
                                    </button>
                                    <button onClick={() => onDeleteRecord(r)} className="p-2 text-gray-500 rounded-full hover:bg-gray-200" title="Eliminar registro">
                                        <TrashIcon />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default RecordsTable;