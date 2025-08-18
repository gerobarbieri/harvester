import { collection, doc, Timestamp, writeBatch, increment } from "firebase/firestore";
import { db } from "../firebase/firebase";
import type { Destination, HarvestSession, HarvestSessionRegister, Silobag } from "../types";
import { toast } from "react-hot-toast";
import { getSessionWithRecalculatedYields } from "../utils";
import { _prepareSiloBagCreation } from "./siloBags";

const prepareRegisterData = (data: any, silo_bag?: any, destination?: Destination) => {
    return {
        organization_id: data.organization_id,
        date: Timestamp.fromDate(new Date()),
        humidity: parseFloat(data.humidity), weight_kg: parseFloat(data.weight_kg),
        type: data.type, details: data.observations,
        ...(data.type === 'truck' ? {
            truck: { driver: data.driver, license_plate: data.license_plate },
            destination: destination || null, ctg: data.ctg || null, cpe: data.cpe || null
        } : { silo_bag: silo_bag })
    };
};

const addRegisterWithNewSiloBag = async (data: any, harvestSession: HarvestSession, setSession: (session: HarvestSession) => void, optimisticSiloHandlers: any) => {
    const originalSession = { ...harvestSession };
    let optimisticSiloId: string | null = null;
    const batch = writeBatch(db);

    const updatedSession = getSessionWithRecalculatedYields({ ...harvestSession, harvested_kgs: (harvestSession.harvested_kgs || 0) + parseFloat(data.weight_kg) });
    setSession(updatedSession);

    const siloBagData = {
        name: data.newSiloBagName, initial_kg: parseFloat(data.weight_kg),
        organization_id: harvestSession.organization_id, crop: harvestSession.crop,
        field: harvestSession.field, location: data.location
    } as Partial<Silobag>;
    const registerRef = doc(collection(db, `harvest_sessions/${harvestSession.id}/registers`));
    const newSiloBagRef = _prepareSiloBagCreation(batch, siloBagData, 'harvest_entry', registerRef.id);

    optimisticSiloId = `optimistic-${Date.now()}`;
    const optimisticSilo = { id: optimisticSiloId, ...siloBagData, current_kg: siloBagData.initial_kg, status: 'active', lost_kg: 0 } as Silobag;
    optimisticSiloHandlers.add(optimisticSilo);

    const sessionRef = doc(db, 'harvest_sessions', harvestSession.id);
    const siloBagForRegister = { id: newSiloBagRef.id, name: data.newSiloBagName, location: data.location };
    const registerData = prepareRegisterData(data, siloBagForRegister);

    batch.set(registerRef, registerData);
    batch.update(sessionRef, { harvested_kgs: updatedSession.harvested_kgs, yields: updatedSession.yields });

    batch.commit().catch(error => {
        console.error("Error al guardar registro y silo:", error);
        setSession(originalSession);
        if (optimisticSiloId) optimisticSiloHandlers.remove(optimisticSiloId);
        toast.error('Falló la operación combinada.');
        throw error;
    });
};

const addSimpleRegister = async (data: any, harvestSession: HarvestSession, setSession: (session: HarvestSession) => void, optimisticSiloUpdate: any, silobag?: Silobag, destination?: Destination) => {
    const originalSession = { ...harvestSession };
    const batch = writeBatch(db);
    const updatedSession = getSessionWithRecalculatedYields({ ...harvestSession, harvested_kgs: (harvestSession.harvested_kgs || 0) + parseFloat(data.weight_kg) });
    setSession(updatedSession);

    const sessionRef = doc(db, 'harvest_sessions', harvestSession.id);
    const registerRef = doc(collection(db, `harvest_sessions/${harvestSession.id}/registers`));
    let siloBagForRegister: { id: string, name: string, location: string };

    if (data.type === 'silo_bag' && silobag) {
        siloBagForRegister = { id: silobag.id, name: silobag.name, location: silobag.location };
        const siloRef = doc(db, 'silo_bags', silobag.id);
        const movementRef = doc(collection(db, `silo_bags/${silobag.id}/movements`));
        batch.update(siloRef, { current_kg: increment(parseFloat(data.weight_kg)) });
        batch.set(movementRef, { type: 'harvest_entry', kg_change: parseFloat(data.weight_kg), date: Timestamp.fromDate(new Date()), organization_id: data.organization_id });
        optimisticSiloUpdate(silobag.id, { current_kg: (silobag.current_kg || 0) + parseFloat(data.weight_kg) });
    }

    const registerData = prepareRegisterData(data, siloBagForRegister, destination);
    batch.set(registerRef, registerData);
    batch.update(sessionRef, { harvested_kgs: updatedSession.harvested_kgs, yields: updatedSession.yields });

    batch.commit().catch(error => {
        console.error("Error al guardar registro:", error);
        setSession(originalSession);
        if (data.type === 'silo_bag' && silobag) optimisticSiloUpdate(silobag.id, { current_kg: silobag.current_kg });
        toast.error('Falló el guardado.');
        throw error;
    });

};

export const addRegister = (data: any, harvestSession: HarvestSession, setSession: (session: HarvestSession) => void, optimisticSiloHandlers: any, silobag?: Silobag, destination?: Destination) => {
    const isNewSiloBag = data.type === 'silo_bag' && !data.siloBagId;
    if (isNewSiloBag) {
        return addRegisterWithNewSiloBag(data, harvestSession, setSession, optimisticSiloHandlers);
    } else {
        return addSimpleRegister(data, harvestSession, setSession, optimisticSiloHandlers.update, silobag, destination);
    }
};

export const updateRegister = async (data: any, originalData: HarvestSessionRegister, currentSession: HarvestSession, setSession: (session: HarvestSession) => void, optimisticSiloUpdate: (id: string, updates: Partial<Silobag>) => void, siloBags: Silobag[], silobag?: Partial<Silobag>, destination?: Destination) => {
    const originalSession = { ...currentSession };
    const batch = writeBatch(db);
    const kgDifference = parseFloat(data.weight_kg) - (originalData.weight_kg || 0);
    const updatedSession = getSessionWithRecalculatedYields({ ...currentSession, harvested_kgs: (currentSession.harvested_kgs || 0) + kgDifference });
    setSession(updatedSession);
    const sessionRef = doc(db, 'harvest_sessions', currentSession.id);
    const registerRef = doc(db, `harvest_sessions/${currentSession.id}/registers`, originalData.id);
    const updatedRegisterData = prepareRegisterData(data, silobag, destination);
    batch.update(registerRef, updatedRegisterData);
    batch.update(sessionRef, { harvested_kgs: updatedSession.harvested_kgs, yields: updatedSession.yields });
    if (originalData.type === 'silo_bag' && originalData.silo_bag?.id) {
        const siloRef = doc(db, 'silo_bags', originalData.silo_bag.id);
        const movementRef = doc(db, `silo_bags/${originalData.silo_bag.id}/movements`, originalData.id);
        batch.update(siloRef, { current_kg: increment(kgDifference) });
        batch.update(movementRef, { kg_change: parseFloat(data.weight_kg), date: Timestamp.fromDate(new Date()) });
        const originalSilo = siloBags.find(s => s.id === originalData.silo_bag.id);
        if (originalSilo) optimisticSiloUpdate(originalSilo.id, { current_kg: (originalSilo.current_kg || 0) + kgDifference });
    }
    batch.commit().catch(error => {
        setSession(originalSession);
        if (originalData.type === 'silo_bag' && originalData.silo_bag?.id) {
            const originalSilo = siloBags.find(s => s.id === originalData.silo_bag.id);
            if (originalSilo) optimisticSiloUpdate(originalSilo.id, { current_kg: originalSilo.current_kg });
        }
        toast.error('Falló la actualización del registro.');
        throw error;
    });

};

export const deleteRegister = async (register: HarvestSessionRegister, currentSession: HarvestSession, setSession: (session: HarvestSession) => void, optimisticSiloUpdate: (id: string, updates: Partial<Silobag>) => void, siloBags: Silobag[]) => {
    if (!register.id) return;
    const originalSession = { ...currentSession };
    const batch = writeBatch(db);
    const updatedSession = getSessionWithRecalculatedYields({ ...currentSession, harvested_kgs: (currentSession.harvested_kgs || 0) - (register.weight_kg || 0) });
    setSession(updatedSession);
    const sessionRef = doc(db, 'harvest_sessions', currentSession.id);
    const registerRef = doc(db, `harvest_sessions/${currentSession.id}/registers`, register.id);
    batch.delete(registerRef);
    batch.update(sessionRef, { harvested_kgs: updatedSession.harvested_kgs, yields: updatedSession.yields });
    console.log(register.silo_bag.id)
    console.log(register.id)
    if (register.type === 'silo_bag' && register.silo_bag?.id) {
        const siloRef = doc(db, 'silo_bags', register.silo_bag.id);
        const movementRef = doc(db, `silo_bags/${register.silo_bag.id}/movements`, register.id);
        batch.delete(movementRef);
        batch.update(siloRef, { current_kg: increment(-register.weight_kg) });
        const originalSilo = siloBags.find(s => s.id === register.silo_bag.id);
        if (originalSilo) optimisticSiloUpdate(originalSilo.id, { current_kg: (originalSilo.current_kg || 0) - register.weight_kg });
    }
    batch.commit().catch(error => {
        console.error("Error al eliminar registro:", error);
        setSession(originalSession);
        if (register.type === 'silo_bag' && register.silo_bag?.id) {
            const originalSilo = siloBags.find(s => s.id === register.silo_bag.id);
            if (originalSilo) optimisticSiloUpdate(originalSilo.id, { current_kg: originalSilo.current_kg });
        }
        toast.error('Falló la eliminación del registro.');
        throw error;
    });


};