import { type FC, useState } from "react";
import { exportToCsv, exportToXlsx } from "../../services/export";
import { addRegister, deleteRegister, updateRegister } from "../../services/harvestSessionRegister";

// Importa tus componentes de UI atomizados
import PlotDetailHeader from "../../components/harvest-session/DetailHeader";
import PlotSummary from '../../components/harvest-session/Summary';
import Button from "../../components/commons/Button";

// Importa los modales
import RegisterEditModal from "../../components/harvest-session/harvest-session-register/EditModal";
import RegisterAddModal from "../../components/harvest-session/harvest-session-register/AddModal";
import RegisterDeleteModal from "../../components/harvest-session/harvest-session-register/DeleteModal";
import { useParams } from "react-router";
import { useHarvestSessionRegisters } from "../../hooks/harvest-session-register/useHarvestSessionRegisters";
import { useHarvestSession } from "../../hooks/harvest-session/useHarvestSession";
import RegistersTable from "../../components/harvest-session/harvest-session-register/Table";
import type { HarvestSessionRegister, Yield } from "../../types";

const PlotDetail: FC = () => {
    // 1. Obtenemos toda la lógica y datos del custom hook
    const { harvestSessionId } = useParams();
    const { session, loading: loadingHarvestSession, setSession } = useHarvestSession(harvestSessionId);
    const { registers, loading: loadingHarvestSessionRegister } = useHarvestSessionRegisters(harvestSessionId);

    // 2. El estado de los modales sigue siendo responsabilidad de esta vista
    const [editingRegister, setEditingRegister] = useState(null);
    const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
    const [registerToDelete, setRegisterToDelete] = useState<HarvestSessionRegister | null>(null);

    if (loadingHarvestSession || loadingHarvestSessionRegister) return <p>Cargando...</p>;

    const handleExport = (format: string) => {
        if (!session) return;

        if (format === 'csv') {
            exportToCsv(session, registers);
        } else {
            exportToXlsx(session, registers);
        }
    };



    // --- MANEJADORES DE OPERACIONES CON LÓGICA OPTIMISTA Y REVERSIÓN ---

    const handleRegisterAdded = async (newRegisterData: Partial<HarvestSessionRegister>) => {
        const previousSession = session; // Guardamos estado previo

        // Actualización optimista
        if (session) {
            const newTotalKgs = (session.harvested_kgs || 0) + (newRegisterData.weight_kg || 0);
            const newHarvestedYield = session.harvested_hectares > 0 ? newTotalKgs / session.harvested_hectares : 0;

            const yields: Yield = {
                harvested: newHarvestedYield,
                seed: session.hectares > 0 ? newTotalKgs / session.hectares : 0,
                real_vs_projected: newHarvestedYield - session.estimated_yield
            }

            const optimisticSession = {
                ...session,
                harvested_kgs: newTotalKgs,
                yields
            };
            setSession(optimisticSession);
        }
        setIsRegisterModalOpen(false);

        addRegister(newRegisterData, harvestSessionId).catch(error => {
            console.error("Falló la creación, revirtiendo.", error);
            setSession(previousSession);
            // showErrorToast("No se pudo guardar el registro.");
        })
    };

    const handleRegisterUpdated = async (oldRegister: HarvestSessionRegister, updatedData: Partial<HarvestSessionRegister>) => {
        const previousSession = session;

        if (session) {
            const weightChange = (updatedData.weight_kg || 0) - (oldRegister.weight_kg || 0);
            const newTotalKgs = (session.harvested_kgs || 0) + weightChange;
            const newHarvestedYield = session.harvested_hectares > 0 ? newTotalKgs / session.harvested_hectares : 0;

            const yields: Yield = {
                harvested: newHarvestedYield,
                seed: session.hectares > 0 ? newTotalKgs / session.hectares : 0,
                real_vs_projected: newHarvestedYield - session.estimated_yield
            }

            const optimisticSession = {
                ...session,
                harvested_kgs: newTotalKgs,
                yields
            };
            setSession(optimisticSession);
        }
        setEditingRegister(null);
        updateRegister(oldRegister.id, harvestSessionId, updatedData).catch(error => {
            console.error("Falló la actualización, revirtiendo.", error);
            setSession(previousSession);
            // showErrorToast("No se pudo actualizar.");
        })
    }
    const handleDeleteConfirm = async () => {
        if (!registerToDelete) return;

        const previousSession = session;

        if (session) {
            const newTotalKgs = (session.harvested_kgs || 0) - (registerToDelete.weight_kg || 0);
            const newHarvestedYield = session.harvested_hectares > 0 ? newTotalKgs / session.harvested_hectares : 0;

            const yields: Yield = {
                harvested: newHarvestedYield,
                seed: session.hectares > 0 ? newTotalKgs / session.hectares : 0,
                real_vs_projected: newHarvestedYield - session.estimated_yield
            }

            const optimisticSession = {
                ...session,
                harvested_kgs: newTotalKgs,
                yields
            };
            setSession(optimisticSession);
        }
        const registerIdToDelete = registerToDelete.id;
        setRegisterToDelete(null);

        deleteRegister(registerIdToDelete, harvestSessionId).catch(error => {
            console.error("Falló la eliminación, revirtiendo.", error);
            setSession(previousSession);
            // showErrorToast("No se pudo eliminar.");
        });
    }


    return (
        <>
            {/* Renderizado de Modales */}
            {registerToDelete && <RegisterDeleteModal registerId={registerToDelete} onConfirm={handleDeleteConfirm} onCancel={() => setRegisterToDelete(null)} />}
            {isRegisterModalOpen && <RegisterAddModal onClose={() => setIsRegisterModalOpen(false)} onRegisterAdd={handleRegisterAdded} />}
            {editingRegister && <RegisterEditModal register={editingRegister} onClose={() => setEditingRegister(null)} onRegisterUpdate={handleRegisterUpdated} />}

            {/* Componentes de UI Atómicos */}
            <PlotDetailHeader session={session} onExport={handleExport} />
            <PlotSummary session={session} />

            {session.status !== 'finished' && (
                <div className="mt-6">
                    <Button onClick={() => setIsRegisterModalOpen(true)}>+ Añadir Registro</Button>
                </div>
            )}

            <RegistersTable
                registers={registers}
                onEditRegister={setEditingRegister}
                onDeleteRegister={setRegisterToDelete}
            />
        </>
    );
};

export default PlotDetail;
