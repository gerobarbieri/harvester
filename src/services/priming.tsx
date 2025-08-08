import {
    collection,
    query,
    where,
    getDocs,
    orderBy,
    Timestamp,
    Query,
    type DocumentData
} from "firebase/firestore";
import { db } from "../firebase/firebase"; // Asegúrate que la ruta sea correcta
import { chunkArray } from "../firebase/utils"; // Tu función de utilidad

// --- Interfaces para mayor claridad y seguridad de tipos ---
interface Campaign {
    id: string;
    // Agrega otras propiedades de campaign si las necesitas
}

interface FieldIdentifier {
    id: string;
    // Agrega otras propiedades de field si las necesitas
}

/**
 * Muestra un mensaje de finalización del priming y detiene el temporizador.
 * @param message - El mensaje a mostrar.
 * @param timerLabel - La etiqueta del temporizador a detener.
 */
const endPriming = (message: string, timerLabel: string = "Priming Total") => {
    console.log(message);
    console.timeEnd(timerLabel);
};

/**
 * Obtiene las campañas activas para una organización.
 * @param organizationId - ID de la organización.
 * @returns Un array de objetos Campaign.
 */
const fetchActiveCampaigns = async (organizationId: string): Promise<Campaign[]> => {
    const campaignsRef = collection(db, 'campaigns');
    const q = query(
        campaignsRef,
        where('organization_id', '==', organizationId),
        where('active', '==', true),
        orderBy('start_date', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

/**
 * Obtiene los IDs de los campos (fields) relevantes para el usuario según su rol.
 * @param organizationId - ID de la organización.
 * @param activeCampaignIds - IDs de las campañas activas.
 * @param userRole - Rol del usuario ('admin', 'owner', 'manager').
 * @param userId - ID del usuario.
 * @returns Un array de IDs de los campos relevantes.
 */
const fetchRelevantFieldIds = async (
    organizationId: string,
    activeCampaignIds: string[],
    userRole: string,
    userId: string
): Promise<string[]> => {
    const campaignFieldsRef = collection(db, 'campaign_fields');
    let fieldsQuery: Query<DocumentData>;

    if (userRole === 'admin' || userRole === 'owner') {
        // Los admins/owners ven todos los campos de las campañas activas.
        fieldsQuery = query(
            campaignFieldsRef,
            where('organization_id', '==', organizationId),
            where('campaign.id', 'in', activeCampaignIds)
        );
    } else if (userRole === 'manager') {
        // Los managers ven los campos a los que están asignados O los que no tienen responsable.
        // Firestore no soporta 'OR' en campos diferentes, así que hacemos dos consultas en paralelo.
        const assignedFieldsPromise = getDocs(query(
            campaignFieldsRef,
            where('organization_id', '==', organizationId),
            where('campaign.id', 'in', activeCampaignIds),
            where('responsible_uids', 'array-contains', userId)
        ));
        const unassignedFieldsPromise = getDocs(query(
            campaignFieldsRef,
            where('organization_id', '==', organizationId),
            where('campaign.id', 'in', activeCampaignIds),
            where('responsible_uids', '==', [])
        ));

        const [assignedSnaps, unassignedSnaps] = await Promise.all([assignedFieldsPromise, unassignedFieldsPromise]);

        const fieldsMap = new Map<string, FieldIdentifier>();
        assignedSnaps.forEach(doc => fieldsMap.set(doc.id, doc.data().field));
        unassignedSnaps.forEach(doc => fieldsMap.set(doc.id, doc.data().field)); // Map se encarga de la duplicación

        return Array.from(fieldsMap.values()).map(field => field.id);

    } else {
        return []; // Rol no reconocido
    }

    const fieldsSnapshot = await getDocs(fieldsQuery);
    return fieldsSnapshot.docs.map(doc => (doc.data().field as FieldIdentifier).id);
};

/**
 * Obtiene las sesiones de cosecha activas y las finalizadas recientemente.
 * @param organizationId - ID de la organización.
 * @param activeCampaignIds - IDs de las campañas activas.
 * @param activeFieldIds - IDs de los campos relevantes.
 * @returns Un Map con los documentos de las sesiones.
 */
const fetchHarvestSessions = async (
    organizationId: string,
    activeCampaignIds: string[],
    activeFieldIds: string[]
): Promise<Map<string, DocumentData>> => {
    const sessionsRef = collection(db, "harvest_sessions");
    const oneMonthAgo = Timestamp.fromDate(new Date(new Date().setMonth(new Date().getMonth() - 1)));
    const fieldIdChunks = chunkArray(activeFieldIds, 30);

    const queryPromises = [];

    for (const campaignId of activeCampaignIds) {
        for (const chunk of fieldIdChunks) {
            // Consulta para sesiones activas ("pending" o "in-progress")
            const activeSessionsQuery = query(
                sessionsRef,
                where("organization_id", "==", organizationId),
                where("campaign.id", "==", campaignId),
                where("field.id", "in", chunk),
                where("status", "in", ["pending", "in-progress"])
            );
            queryPromises.push(getDocs(activeSessionsQuery));

            // Consulta para sesiones finalizadas recientemente
            const finishedSessionsQuery = query(
                sessionsRef,
                where("organization_id", "==", organizationId),
                where("campaign.id", "==", campaignId),
                where("field.id", "in", chunk),
                where("status", "==", "finished"),
                where("date", ">=", oneMonthAgo)
            );
            queryPromises.push(getDocs(finishedSessionsQuery));
        }
    }

    const snapshots = await Promise.all(queryPromises);
    const sessionsMap = new Map<string, DocumentData>();
    snapshots.forEach(snap => snap.forEach(doc => sessionsMap.set(doc.id, doc)));
    return sessionsMap;
};


/**
 * Función principal para poblar la caché offline de Firestore.
 * Ejecuta una serie de consultas para traer los datos más relevantes para el usuario.
 */
export const primeOfflineCache = async (organizationId: string, userRole: string, userId: string) => {
    if (!organizationId || !userRole || !userId) {
        return console.error("Faltan datos de usuario (orgId, role, uid) para el priming.");
    }
    console.time("Priming Total");
    console.log(`🚀 Iniciando priming para la organización: ${organizationId}`);

    try {
        // --- PASO 1: Cargar catálogos base y campañas activas en paralelo ---
        const baseCatalogCollections = ['crops', 'harvesters', 'destinations', 'users'];
        const baseCatalogPromises = baseCatalogCollections.map(collName =>
            getDocs(query(collection(db, collName), where("organization_id", "==", organizationId)))
        );
        const activeCampaignsPromise = fetchActiveCampaigns(organizationId);

        const [_baseCatalogResults, activeCampaigns] = await Promise.all([Promise.all(baseCatalogPromises), activeCampaignsPromise]);
        console.log("✅ Catálogos base y Campañas cargados.");

        if (activeCampaigns.length === 0) {
            return endPriming("🏁 No hay campañas activas. Priming finalizado.");
        }
        const activeCampaignIds = activeCampaigns.map(c => c.id);

        // --- PASO 2: Cargar IDs de campos (Fields) relevantes para el usuario ---
        const activeFieldIds = await fetchRelevantFieldIds(organizationId, activeCampaignIds, userRole, userId);

        if (activeFieldIds.length === 0) {
            return endPriming("🏁 No hay campos relevantes para el usuario. Priming finalizado.");
        }
        console.log(`✅ ${activeFieldIds.length} campos relevantes encontrados.`);

        // --- PASO 3: Cargar datos transaccionales y sus sub-colecciones en paralelo ---
        const sessionsMapPromise = fetchHarvestSessions(organizationId, activeCampaignIds, activeFieldIds);
        const siloBagsPromise = getDocs(query(collection(db, "silo_bags"), where("organization_id", "==", organizationId), where("current_kg", ">", 0)));
        const logisticsPromise = getDocs(query(collection(db, "logistics"), where("organization_id", "==", organizationId), where("date", ">=", Timestamp.fromDate(new Date(new Date().setDate(new Date().getDate() - 10))))));

        const [sessionsMap, activeSilosSnap, logisticsSnap] = await Promise.all([sessionsMapPromise, siloBagsPromise, logisticsPromise]);
        console.log(`✅ Datos transaccionales cargados: ${sessionsMap.size} sesiones, ${activeSilosSnap.size} silo-bolsas, ${logisticsSnap.size} logísticas.`);

        // --- PASO 4: Cargar sub-colecciones de los documentos obtenidos ---
        const subcollectionPromises = [];

        // Sub-colecciones de Sesiones de Cosecha
        for (const sessionId of sessionsMap.keys()) {
            subcollectionPromises.push(getDocs(query(collection(db, "harvest_sessions", sessionId, "registers"), where('organization_id', '==', organizationId))));
        }
        // Sub-colecciones de Silo-Bolsas
        for (const doc of activeSilosSnap.docs) {
            subcollectionPromises.push(getDocs(query(collection(db, "silo_bags", doc.id, "movements"), where('organization_id', '==', organizationId))));
        }

        if (subcollectionPromises.length > 0) {
            await Promise.all(subcollectionPromises);
            console.log("✅ Sub-colecciones cargadas.");
        }

        endPriming("🏁 Priming completado exitosamente.");

    } catch (error) {
        console.error("🔥 Error durante el priming de la caché:", error);
        endPriming("❌ Priming finalizado con errores.", "Priming Total");
    }
};