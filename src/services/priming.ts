// services/latencyOptimizedPriming.ts
import {
    collection,
    query,
    where,
    getDocs,
    orderBy,
    Timestamp,
    limit
} from "firebase/firestore";
import { db } from "../firebase/firebase";
import { chunkArray } from "../firebase/utils";

interface PrimingMetrics {
    totalQueries: number;
    totalDocuments: number;
    duration: number;
    stage: string;
    errors: string[];
    timings: Record<string, number>;
}

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
        const startTime = Date.now();
        console.time("Priming");
        console.log(`🌍 Priming optimizado - ${userRole}`);

        this.resetMetrics();

        try {
            const megaStart = Date.now();
            const [
                activeCampaign,
                _crops,
                _harvesters,
                _destinations,
                _users,
                activeSessions,
                finishedSessions
            ] = await Promise.all([
                // Campaign (1 query)
                this.queryWithMetrics(
                    () => getDocs(query(
                        collection(db, 'campaigns'),
                        where('organization_id', '==', organizationId),
                        where('active', '==', true),
                        limit(1)
                    )),
                    'campaign'
                ),

                // Catálogos (3 queries)
                this.queryWithMetrics(
                    () => getDocs(query(
                        collection(db, 'crops'),
                        where('organization_id', '==', organizationId)
                    )),
                    'crops'
                ),

                this.queryWithMetrics(
                    () => getDocs(query(
                        collection(db, 'harvesters'),
                        where('organization_id', '==', organizationId)
                    )),
                    'harvesters'
                ),

                this.queryWithMetrics(
                    () => getDocs(query(
                        collection(db, 'destinations'),
                        where('organization_id', '==', organizationId)
                    )),
                    'destinations'
                ),

                // Users (1 query)
                this.queryWithMetrics(
                    () => getDocs(query(
                        collection(db, 'users'),
                        where('organization_id', '==', organizationId)
                    )),
                    'users'
                ),

                this.queryWithMetrics(
                    () => getDocs(query(
                        collection(db, 'harvest_sessions'),
                        where('organization_id', '==', organizationId),
                        where('status', 'in', ['pending', 'in-progress']),
                        orderBy('date', 'desc')
                    )),
                    'active_sessions'
                ),

                this.queryWithMetrics(
                    () => getDocs(query(
                        collection(db, 'harvest_sessions'),
                        where('organization_id', '==', organizationId),
                        where('status', '==', 'finished'),
                        where('date', '>=', Timestamp.fromDate(new Date(Date.now() - 10 * 24 * 60 * 60 * 1000))),
                        orderBy('date', 'desc')
                    )),
                    'finished_sessions'
                )
            ]);

            this.metrics.timings['parallel'] = Date.now() - megaStart;

            // Procesar results
            const campaign = activeCampaign.docs[0] ? {
                id: activeCampaign.docs[0].id,
                ...activeCampaign.docs[0].data()
            } : null;

            if (!campaign) {
                console.log("⚠️ No hay campaña activa");
                this.finishMetrics(startTime);
                return this.metrics;
            }

            const allSessions = [
                ...activeSessions.docs.map(doc => ({ id: doc.id, ...doc.data() })),
                ...finishedSessions.docs.map(doc => ({ id: doc.id, ...doc.data() }))
            ];

            const relevantFieldIds = [...new Set(allSessions.map(s => s.field.id))];
            console.log(`🔄 ${allSessions.length} sessions en ${relevantFieldIds.length} fields únicos`);

            const secondStart = Date.now();
            const [_campaignFields, _plots, siloBags] = await Promise.all([
                this.loadCampaignFields(organizationId, campaign.id, userRole, userId),
                this.loadPlots(organizationId, relevantFieldIds),
                this.queryWithMetrics(
                    () => getDocs(query(
                        collection(db, 'silo_bags'),
                        where('organization_id', '==', organizationId),
                        where('status', '==', 'active'),
                        limit(15)
                    )),
                    'silo_bags'
                )
            ]);
            this.metrics.timings['second_parallel'] = Date.now() - secondStart;

            const thirdStart = Date.now();

            await this.loadCriticalSubcollections(organizationId, allSessions, siloBags);
            this.metrics.timings['third_subcollections'] = Date.now() - thirdStart;

            this.finishMetrics(startTime);
            console.timeEnd("Priming");

            console.table({
                'Paralelo (7 queries)': `${this.metrics.timings.parallel}ms`,
                'Segunda ronda (3 queries)': `${this.metrics.timings.second_parallel}ms`,
                'Subcollecciones': `${this.metrics.timings.third_subcollections}ms`,
                'TOTAL': `${this.metrics.duration}ms`
            });

            console.log(`🌍 Priming de alta latencia: ${this.metrics.totalQueries} queries, ${this.metrics.totalDocuments} docs, ${this.metrics.duration}ms`);

            return this.metrics;

        } catch (error: any) {
            this.metrics.duration = Date.now() - startTime;
            this.metrics.stage = 'error';
            this.metrics.errors.push(error.message);
            console.error("🔥 Error en priming de alta latencia:", error);
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

        if (sessions.length === 0) {
            console.log("📝 No hay sesiones activas, saltando registros");
            return;
        }

        const registerPromises = sessions.map(session =>
            this.queryWithMetrics(
                () => getDocs(query(
                    collection(db, 'harvest_sessions', session.id, 'registers'),
                    where('organization_id', '==', organizationId),
                    limit(50)
                )),
                `registers_critical_${session.id}`
            ).catch(error => {
                console.warn(`Error registros ${session.id}:`, error.message);
                return { docs: [] };
            })
        );

        // Movimientos solo de algunos silo bags
        const limitedSiloBags = siloBagsSnap.docs.slice(0, 15); // Solo 5 silo bags
        const movementPromises = limitedSiloBags.map(siloDoc =>
            this.queryWithMetrics(
                () => getDocs(query(
                    collection(db, 'silo_bags', siloDoc.id, 'movements'),
                    where('organization_id', '==', organizationId),
                    orderBy('date', 'desc'),
                    limit(20)
                )),
                `movements_critical_${siloDoc.id}`
            ).catch(error => {
                console.warn(`Error movimientos ${siloDoc.id}:`, error.message);
                return { docs: [] };
            })
        );

        await Promise.all([...registerPromises, ...movementPromises]);

        console.log(`📝 Subcollecciones críticas: ${sessions.length} sessions, ${limitedSiloBags.length} silo bags`);
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