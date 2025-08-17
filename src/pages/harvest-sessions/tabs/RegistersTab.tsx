import { format } from "date-fns";
import type { writeBatch, doc, collection, Timestamp } from "firebase/firestore";
import { PlusCircle, Truck, Archive, Edit, Trash2, Scale, Droplets, MapPin, User } from "lucide-react";
import { type FC, useState } from "react";
import { useOutletContext } from "react-router";
import Button from "../../../components/commons/Button";
import Card from "../../../components/commons/Card";
import AddRegisterModal from "../../../components/harvest-session/modals/registers/AddRegisterModal";
import DeleteRegisterModal from "../../../components/harvest-session/modals/registers/DeleteRegisterModal";
import EditRegisterModal from "../../../components/harvest-session/modals/registers/EditRegisterModal";
import useAuth from "../../../context/auth/AuthContext";
import type { db } from "../../../firebase/firebase";
import { useDestinations } from "../../../hooks/destination/useDestinations";
import { useSiloBags } from "../../../hooks/silobags/useSilobags";
import { addRegister, deleteRegister, updateRegister } from "../../../services/harvestSessionRegister";
import { formatNumber } from "../../../utils";
import type { Silobag } from "../../../types";

const RegistersTab: FC = () => {
    const { registers, harvestSession } = useOutletContext<any>();
    const [isAddRegisterModalOpen, setIsAddRegisterModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedRegister, setSelectedRegister] = useState<any>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const { currentUser } = useAuth();
    const { destinations } = useDestinations();
    const { siloBags } = useSiloBags();
    const handleAddRegisterSubmit = async (data: any) => {
        setIsSubmitting(true);
        try {
            const dataWithOrg = { ...data, organization_id: currentUser.organizationId }
            if (data.type === 'silo_bag' && !data.siloBagId) {
                addRegister(dataWithOrg, harvestSession);
            } else if (data.silobagId) {
                const silobag = siloBags.find(sb => sb.id === data.siloBagId);
                addRegister(dataWithOrg, harvestSession, silobag);
            } else {
                const destination = destinations.find(d => d.id === data.destinationId);
                addRegister(dataWithOrg, harvestSession, undefined, destination);
            }

            setIsAddRegisterModalOpen(false);

        } catch (error) {
            console.error('Error al agregar registro:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditSubmit = async (data: any) => {
        setIsSubmitting(true);
        try {
            if (!selectedRegister) {
                throw new Error("No hay un registro seleccionado para editar.");
            }

            if (data.type === 'silo_bag') {
                let siloBagForRegister: Partial<Silobag>;
                const existingSiloBag = siloBags.find(sb => sb.id === data.siloBagId);
                siloBagForRegister = { id: existingSiloBag.id, name: existingSiloBag.name, location: data.location }
                updateRegister(selectedRegister.id, harvestSession.id, data, siloBagForRegister);
            } else {
                const destination = destinations.find((d) => d.id === data.destinationId);
                updateRegister(selectedRegister.id, harvestSession.id, data, undefined, destination);
            }

            setIsEditModalOpen(false); // Cierra el modal al tener éxito
        } catch (error) {
            console.error('Error al editar el registro:', error);
            // Aquí deberías mostrar un mensaje de error al usuario
        } finally {
            setIsSubmitting(false);
        }
    };

    const openDeleteModal = (register: any) => {
        setSelectedRegister(register);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!selectedRegister) return;
        setIsSubmitting(true);
        try {
            deleteRegister(selectedRegister.id, harvestSession.id);
            setIsDeleteModalOpen(false);
            setSelectedRegister(null);
        } catch (error) {
            console.error("Error al eliminar el registro:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const openEditModal = (register: any) => {
        setSelectedRegister(register);
        setIsEditModalOpen(true);
    };

    return (
        <>
            {isAddRegisterModalOpen && <AddRegisterModal isOpen={isAddRegisterModalOpen} onClose={() => setIsAddRegisterModalOpen(false)} onSubmit={handleAddRegisterSubmit} isSubmitting={isSubmitting} />}
            {isEditModalOpen && selectedRegister && <EditRegisterModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} onSubmit={handleEditSubmit} isSubmitting={isSubmitting} register={selectedRegister} />}
            {isDeleteModalOpen && selectedRegister && <DeleteRegisterModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={handleConfirmDelete} isSubmitting={isSubmitting} />}
            <div className="space-y-6">
                <div className="flex justify-center mt-4">
                    <Button className="w-full md:w-1/2" icon={PlusCircle} onClick={() => setIsAddRegisterModalOpen(true)} >
                        Añadir Nuevo Registro
                    </Button>
                </div>
                <Card>
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Registros de Cosecha</h3>
                    <div className="max-h-[60vh] overflow-y-auto pr-2">
                        {registers && registers.length > 0 ? (
                            <>
                                <div className="hidden md:block">
                                    <table className="w-full text-left text-sm">
                                        <thead className="border-b-2 border-gray-200 bg-gray-50">
                                            <tr>
                                                <th className="p-3 font-semibold text-gray-600 uppercase tracking-wider">Fecha</th>
                                                <th className="p-3 font-semibold text-gray-600 uppercase tracking-wider">Tipo</th>
                                                <th className="p-3 font-semibold text-gray-600 uppercase tracking-wider text-right">Kgs</th>
                                                <th className="p-3 font-semibold text-gray-600 uppercase tracking-wider">ID/Patente</th>
                                                <th className="p-3 font-semibold text-gray-600 uppercase tracking-wider">Chofer</th>
                                                <th className="p-3 font-semibold text-gray-600 uppercase tracking-wider">Destino</th>
                                                <th className="p-3 font-semibold text-gray-600 uppercase tracking-wider">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {registers.map((reg: any) => (
                                                <tr key={reg.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="p-3 whitespace-nowrap">{reg.date ? format(new Date(reg.date.seconds * 1000), 'dd/MM/yy HH:mm') : '-'}</td>
                                                    <td className="p-3"><div className="flex items-center gap-2">{reg.type === 'truck' ? <Truck size={16} className="text-gray-500" /> : <Archive size={16} className="text-gray-500" />}<span>{reg.type === 'truck' ? 'Camión' : 'Silo Bolsa'}</span></div></td>
                                                    <td className="p-3 text-right font-medium text-gray-800">{formatNumber(reg.weight_kg)}</td>
                                                    <td className="p-3 font-mono">{reg.truck?.license_plate || reg.silo_bag?.name || '-'}</td>
                                                    <td className="p-3">{reg.truck?.driver || '-'}</td>
                                                    <td className="p-3">{reg.destination?.name || reg.silo_bag?.location || '-'}</td>
                                                    <td className="p-3"><div className="flex gap-1"><Button variant="ghost" aria-label="Editar" onClick={() => openEditModal(reg)}><Edit size={16} /></Button><Button variant="ghost" aria-label="Eliminar" onClick={() => openDeleteModal(reg)}><Trash2 size={16} className="text-red-500 hover:text-red-700" /></Button></div></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="md:hidden space-y-4">
                                    {registers.map((reg: any) => (
                                        <Card key={reg.id} className="bg-white border">
                                            <div className="flex justify-between items-start">
                                                <div className="flex items-center gap-3">
                                                    <div className="bg-blue-100 p-3 rounded-full">
                                                        {reg.type === 'truck' ? <Truck size={20} className="text-blue-600" /> : <Archive size={20} className="text-blue-600" />}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-800">{reg.truck?.license_plate || reg.silo_bag?.name}</p>
                                                        <p className="text-xs text-gray-500">{reg.date ? format(new Date(reg.date.seconds * 1000), 'dd/MM/yyyy HH:mm') : '-'}</p>
                                                    </div>
                                                </div>
                                                <div className="flex -mr-2 -mt-2">
                                                    <Button variant="ghost" onClick={() => openEditModal(reg)}><Edit size={16} /></Button>
                                                    <Button variant="ghost" onClick={() => openDeleteModal(reg)}><Trash2 size={16} className="text-red-500" /></Button>
                                                </div>
                                            </div>
                                            <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-4 text-sm">
                                                <div className="flex items-center gap-2"><Scale size={14} className="text-gray-400" /><p><span className="font-semibold">{formatNumber(reg.weight_kg)}</span> kg</p></div>
                                                <div className="flex items-center gap-2"><Droplets size={14} className="text-gray-400" /><p><span className="font-semibold">{reg.humidity || 0}</span> %</p></div>
                                                {reg.type === 'truck' ? (
                                                    <>
                                                        <div className="flex items-center gap-2"><MapPin size={14} className="text-gray-400" /><p>{reg.destination?.name || 'N/A'}</p></div>
                                                        <div className="flex items-center gap-2"><User size={14} className="text-gray-400" /><p>{reg.truck?.driver || 'N/A'}</p></div>
                                                    </>
                                                ) : (
                                                    <div className="col-span-2 flex items-center gap-2"><MapPin size={14} className="text-gray-400" /><p>{reg.silo_bag?.location || 'N/A'}</p></div>
                                                )}
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            </>
                        ) : (<div className="text-center text-gray-500 py-8"><p>No hay registros de cosecha para este lote.</p></div>)}
                    </div>
                </Card>
            </div >
        </>
    );
};

export default RegistersTab;