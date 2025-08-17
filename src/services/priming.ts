// services/latencyOptimizedPriming.ts
import {
    collection,
    query,
    where,
    getDocs,
    orderBy,
    Timestamp,
    limit,
    QuerySnapshot,
    type DocumentData
} from "firebase/firestore";
import { db } from "../firebase/firebase";
import { chunkArray } from "../firebase/utils";
import { queryClient } from "../lib/queryClient";

interface PrimingMetrics {
    totalQueries: number;
    totalDocuments: number;
    duration: number;
    stage: string;
    errors: string[];
    timings: Record<string, number>;
}

const processAndCache = (queryKey: any[], snapshot: QuerySnapshot<DocumentData>) => {
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    queryClient.setQueryData(queryKey, data);
    return data;
};

class PrimingService {
    private metrics: PrimingMetrics = {
        totalQueries: 0,
        totalDocuments: 0,
        duration: 0,
        stage: 'idle',
        errors: [],
        timings: {}
    };

    async prime(organizationId: string, userRole: string, userId: string): Promise<PrimingMetrics> {
        if (!organizationId || !userRole || !userId) {
            console.warn("Priming cancelado: Faltan datos de usuario (organizationId, userRole, o userId).");
            this.metrics.stage = 'aborted';
            this.metrics.errors.push("Datos de usuario incompletos.");
            return this.metrics;
        }
        const startTime = Date.now();
        console.time("Priming");
        console.log(`🌍 Priming optimizado iniciado para rol: ${userRole}`);
        this.resetMetrics();

        try {
            // --- PRIMERA RONDA: DATOS GLOBALES Y DE CAMPAÑA ACTIVA ---
            const megaStart = Date.now();
            const [
                campaignSnap,
                cropsSnap,
                harvestersSnap,
                destinationsSnap,
                usersSnap,
                activeSessionsSnap,
                finishedSessionsSnap
            ] = await Promise.all([
                this.queryWithMetrics(() => getDocs(query(collection(db, 'campaigns'), where('organization_id', '==', organizationId), where('active', '==', true), limit(1))), 'campaign'),
                this.queryWithMetrics(() => getDocs(query(collection(db, 'crops'), where('organization_id', '==', organizationId))), 'crops'),
                this.queryWithMetrics(() => getDocs(query(collection(db, 'harvesters'), where('organization_id', '==', organizationId))), 'harvesters'),
                this.queryWithMetrics(() => getDocs(query(collection(db, 'destinations'), where('organization_id', '==', organizationId))), 'destinations'),
                this.queryWithMetrics(() => getDocs(query(collection(db, 'users'), where('organization_id', '==', organizationId))), 'users'),
                this.queryWithMetrics(() => getDocs(query(collection(db, 'harvest_sessions'), where('organization_id', '==', organizationId), where('status', 'in', ['pending', 'in-progress']), orderBy('date', 'desc'))), 'active_sessions'),
                this.queryWithMetrics(() => getDocs(query(collection(db, 'harvest_sessions'), where('organization_id', '==', organizationId), where('status', '==', 'finished'), where('date', '>=', Timestamp.fromDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))), orderBy('date', 'desc'))), 'finished_sessions')
            ]);
            this.metrics.timings['parallel'] = Date.now() - megaStart;

            // --- PROCESADO Y CACHEO DE LA PRIMERA RONDA ---
            const activeCampaign = campaignSnap.docs[0] ? { id: campaignSnap.docs[0].id, ...campaignSnap.docs[0].data() } as any : null;
            queryClient.setQueryData(['activeCampaign', organizationId], activeCampaign);

            processAndCache(['crops', organizationId], cropsSnap);
            processAndCache(['harvesters', organizationId], harvestersSnap);
            processAndCache(['destinations', organizationId], destinationsSnap);
            processAndCache(['users', organizationId], usersSnap);

            if (!activeCampaign) {
                console.log("⚠️ No hay campaña activa, priming finalizado.");
                this.finishMetrics(startTime);
                return this.metrics;
            }

            const allSessions = [
                ...activeSessionsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })),
                ...finishedSessionsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
            ];
            queryClient.setQueryData(['harvestSessionsByCampaign', activeCampaign.id], allSessions);

            // --- SEGUNDA RONDA: DATOS DEPENDIENTES DE LA CAMPAÑA Y SESIONES ---
            const relevantFieldIds = [...new Set(allSessions.map((s: any) => s.field.id))];
            const secondStart = Date.now();
            const [campaignFieldsSnap, plotsSnap, siloBagsSnap] = await Promise.all([
                this.loadCampaignFields(organizationId, activeCampaign.id, userRole, userId),
                this.loadPlots(organizationId, relevantFieldIds),
                this.queryWithMetrics(() => getDocs(query(collection(db, 'silo_bags'), where('organization_id', '==', organizationId), where('status', '==', 'active'), limit(20))), 'silo_bags')
            ]);

            processAndCache(['campaignFields', activeCampaign.id], campaignFieldsSnap);
            processAndCache(['siloBags', organizationId], siloBagsSnap);

            const allPlots = plotsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            relevantFieldIds.forEach(fieldId => {
                const plotsForField = allPlots.filter((p: any) => p.field.id === fieldId);
                queryClient.setQueryData(['plots', fieldId], plotsForField);
            });

            this.metrics.timings['second_parallel'] = Date.now() - secondStart;

            // --- TERCERA RONDA: SUBCOLECCIONES CRÍTICAS ---
            const thirdStart = Date.now();
            await this.loadCriticalSubcollections(organizationId, allSessions, siloBagsSnap);
            this.metrics.timings['third_subcollections'] = Date.now() - thirdStart;

            this.finishMetrics(startTime);
            console.timeEnd("Priming");

            console.log(`🌍 Priming completado: ${this.metrics.totalQueries} queries, ${this.metrics.totalDocuments} docs, ${this.metrics.duration}ms`);
            return this.metrics;

        } catch (error: any) {
            this.metrics.duration = Date.now() - startTime;
            this.metrics.stage = 'error';
            this.metrics.errors.push(error.message);
            console.error("🔥 Error crítico durante el priming:", error);
            throw error;
        }
    }

    /**
     * Campaign fields con estrategia optimizada para latencia
     */
    private async loadCampaignFields(organizationId: string, campaignId: string, userRole: string, userId: string) {
        if (userRole === 'admin' || userRole === 'owner') {
            // Admins: todos los campaign fields en UNA query
            return this.queryWithMetrics(
                () => getDocs(query(
                    collection(db, 'campaign_fields'),
                    where('organization_id', '==', organizationId),
                    where('campaign.id', '==', campaignId)
                )),
                'campaign_fields_admin'
            );
        } else {
            // Managers: 2 queries en paralelo (inevitable)
            const [assignedSnap, unassignedSnap] = await Promise.all([
                this.queryWithMetrics(
                    () => getDocs(query(
                        collection(db, 'campaign_fields'),
                        where('organization_id', '==', organizationId),
                        where('campaign.id', '==', campaignId),
                        where('responsible_uids', 'array-contains', userId)
                    )),
                    'assigned'
                ),
                this.queryWithMetrics(
                    () => getDocs(query(
                        collection(db, 'campaign_fields'),
                        where('organization_id', '==', organizationId),
                        where('campaign.id', '==', campaignId),
                        where('responsible_uids', '==', [])
                    )),
                    'unassigned'
                )
            ]);

            const allFields = [
                ...assignedSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })),
                ...unassignedSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
            ];

            console.log(`👤 Manager: ${allFields.length} total campaign fields`);
            return { docs: allFields };
        }
    }

    /**
     * Plots optimizado para chunks mínimos
     */
    private async loadPlots(organizationId: string, fieldIds: string[]) {
        if (fieldIds.length === 0) return { docs: [] };

        // Chunks más grandes para minimizar queries (30 es el límite de Firestore)
        const fieldChunks = chunkArray(fieldIds, 30);

        const plotPromises = fieldChunks.map(chunk =>
            this.queryWithMetrics(
                () => getDocs(query(
                    collection(db, 'plots'),
                    where('organization_id', '==', organizationId),
                    where('field.id', 'in', chunk)
                )),
                `plots_${chunk.length}`
            )
        );

        const results = await Promise.all(plotPromises);
        const allPlots = results.flatMap(snap => snap.docs);

        console.log(`📍 ${allPlots.length} plots cargados en ${fieldChunks.length} queries`);
        return { docs: allPlots };
    }

    /**
     * Solo subcollecciones CRÍTICAS para minimizar queries
     */
    private async loadCriticalSubcollections(organizationId: string, sessions: any[], siloBagsSnap: any) {
        if (sessions.length === 0) return;

        const registerPromises = sessions.map(session =>
            this.queryWithMetrics(() => getDocs(query(collection(db, 'harvest_sessions', session.id, 'registers'), where('organization_id', '==', organizationId), limit(50))), `registers_${session.id}`)
                .then(snap => processAndCache(['harvestSessionRegisters', session.id], snap))
                .catch(error => { console.warn(`Error al cargar registros para ${session.id}:`, error.message); return []; })
        );

        const limitedSiloBags = siloBagsSnap.docs.slice(0, 20);
        const movementPromises = limitedSiloBags.map(siloDoc =>
            this.queryWithMetrics(() => getDocs(query(collection(db, 'silo_bags', siloDoc.id, 'movements'), where('organization_id', '==', organizationId), orderBy('date', 'desc'), limit(20))), `movements_${siloDoc.id}`)
                .then(snap => processAndCache(['siloBagMovements', siloDoc.id], snap))
                .catch(error => { console.warn(`Error al cargar movimientos para ${siloDoc.id}:`, error.message); return []; })
        );

        await Promise.all([...registerPromises, ...movementPromises]);
    }

    private async queryWithMetrics(queryFn: () => Promise<any>, queryName: string): Promise<any> {
        this.metrics.totalQueries++;

        try {
            const queryStart = Date.now();
            const result = await queryFn();
            const queryDuration = Date.now() - queryStart;

            if (result.docs) {
                this.metrics.totalDocuments += result.docs.length;
            } else if (result.exists) {
                this.metrics.totalDocuments += 1;
            }

            // Solo log si es muy lenta
            if (queryDuration > 800) {
                console.warn(`🐌 Query lenta: ${queryName} tomó ${queryDuration}ms`);
            } else {
                console.log(`⚡ ${queryName}: ${result.docs?.length || 1} docs en ${queryDuration}ms`);
            }

            return result;
        } catch (error: any) {
            this.metrics.errors.push(`${queryName}: ${error.message}`);
            console.error(`❌ Error en ${queryName}:`, error.message);
            throw error;
        }
    }

    private resetMetrics() {
        this.metrics = {
            totalQueries: 0,
            totalDocuments: 0,
            duration: 0,
            stage: 'starting',
            errors: [],
            timings: {}
        };
    }

    private finishMetrics(startTime: number) {
        this.metrics.duration = Date.now() - startTime;
        this.metrics.stage = 'completed';
    }

    getMetrics(): PrimingMetrics {
        return { ...this.metrics };
    }
}

export const priming = new PrimingService();

export const primeOfflineCache = (
    organizationId: string,
    userRole: string,
    userId: string
): Promise<PrimingMetrics> => {
    return priming.prime(organizationId, userRole, userId);
};