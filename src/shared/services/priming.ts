import { collection, query, where, getDocs, orderBy, limit, Timestamp } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { chunkArray } from "../firebase/utils";
import type { CampaignField, User } from "../types";
import { createSecurityQuery } from "../firebase/queryBuilder";

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
        totalQueries: 0, totalDocuments: 0, duration: 0,
        stage: 'idle', errors: [], timings: {}
    };
    private user: User | null = null;

    async prime(user: User): Promise<PrimingMetrics> {
        const startTime = Date.now();
        this.user = user;
        console.time("Priming");
        console.log(`🌍 Iniciando priming optimizado para rol: ${user.role}`);
        this.resetMetrics();

        try {
            const lastSyncItem = localStorage.getItem('lastSync');
            const lastSyncTimestamp = lastSyncItem ? Timestamp.fromDate(new Date(lastSyncItem)) : null;

            if (lastSyncTimestamp) {
                console.log(`🔄 Sincronización incremental desde: ${lastSyncTimestamp.toDate().toLocaleString()}`);
            } else {
                console.log('🔄 Realizando sincronización completa inicial.');
            }

            const stage1Start = Date.now();
            const baseSecurityConstraints = createSecurityQuery(this.user).build();
            let incrementalConstraints = [...baseSecurityConstraints];
            if (lastSyncTimestamp) {
                incrementalConstraints.push(where('updated_at', '>', lastSyncTimestamp));
            }

            const [
                activeCampaignSnap, _cropsSnap, _harvestersSnap,
                _destinationsSnap, _usersSnap, activeSiloBagsSnap,
                activeLogisticsSnap
            ] = await Promise.all([
                this.queryWithMetrics(() => getDocs(query(collection(db, 'campaigns'), ...baseSecurityConstraints, where('active', '==', true), limit(1))), '1. Campaña Activa'),
                this.queryWithMetrics(() => getDocs(query(collection(db, 'crops'), ...incrementalConstraints)), '1. Catálogo: Cultivos'),
                this.queryWithMetrics(() => getDocs(query(collection(db, 'harvesters'), ...incrementalConstraints)), '1. Catálogo: Cosecheros'),
                this.queryWithMetrics(() => getDocs(query(collection(db, 'destinations'), ...incrementalConstraints)), '1. Catálogo: Destinos'),
                this.queryWithMetrics(() => getDocs(query(collection(db, 'users'), ...incrementalConstraints)), '1. Catálogo: Usuarios'),
                this.queryWithMetrics(() => getDocs(query(collection(db, 'silo_bags'), ...baseSecurityConstraints, where('status', '==', 'active'), orderBy('date', 'desc'), limit(50))), '1. Silobolsas Activos'),
                this.queryWithMetrics(() => getDocs(query(collection(db, 'logistics'), ...baseSecurityConstraints, where('status', 'in', ['in-route-to-field', 'loading']), orderBy('date', 'desc'), limit(50))), '1. Logística Activa'),
            ]);
            this.metrics.timings['stage1_base'] = Date.now() - stage1Start;

            const campaign = activeCampaignSnap.docs[0] ? { id: activeCampaignSnap.docs[0].id, ...activeCampaignSnap.docs[0].data() } : null;
            if (!campaign) {
                console.log("⚠️ No hay campaña activa. El priming finaliza temprano.");
                this.finishMetrics(startTime);
                return this.metrics;
            }

            const stage2Start = Date.now();
            const campaignFieldsSnap = await this.loadCampaignFields(campaign.id, lastSyncTimestamp);
            const relevantFieldIds = campaignFieldsSnap.docs.map((doc: any) => (doc.data() as CampaignField).field.id);
            this.metrics.timings['stage2_campaign_fields'] = Date.now() - stage2Start;

            const stage3Start = Date.now();
            await Promise.all([
                this.loadPlots(relevantFieldIds, lastSyncTimestamp),
                this.loadSessionsByFields(campaign.id, relevantFieldIds, lastSyncTimestamp)
            ]);
            this.metrics.timings['stage3_plots_and_sessions'] = Date.now() - stage3Start;

            const allSessionsSnap = await this.loadSessionsByFields(campaign.id, relevantFieldIds, null);
            const allSessions = allSessionsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            const stage4Start = Date.now();
            await this.loadCriticalSubcollections(allSessions, activeSiloBagsSnap);
            this.metrics.timings['stage4_subcollections'] = Date.now() - stage4Start;

            this.finishMetrics(startTime);
            console.timeEnd("Priming");
            console.log(`✅ Priming finalizado: ${this.metrics.totalQueries} queries, ${this.metrics.totalDocuments} docs en ${this.metrics.duration}ms`);

            localStorage.setItem('lastSync', new Date().toISOString());

            return this.metrics;

        } catch (error: any) {
            this.metrics.duration = Date.now() - startTime;
            this.metrics.stage = 'error';
            this.metrics.errors.push(error.message);
            console.error("🔥 Error crítico durante el priming:", error);
            throw error;
        }
    }

    private async loadCampaignFields(campaignId: string, lastSync: Timestamp | null) {
        const securityConstraints = createSecurityQuery(this.user)
            .withFieldAccess('field.id')
            .build();

        let finalConstraints = [...securityConstraints, where('campaign.id', '==', campaignId)];
        if (lastSync) {
            finalConstraints.push(where('updated_at', '>', lastSync));
        }

        const finalQuery = query(collection(db, 'campaign_fields'), ...finalConstraints);
        return this.queryWithMetrics(() => getDocs(finalQuery), '2. Campos de Campaña');
    }

    private async loadPlots(fieldIds: string[], lastSync: Timestamp | null) {
        if (fieldIds.length === 0) return { docs: [] };

        const baseConstraints = createSecurityQuery(this.user).build();
        if (lastSync) {
            baseConstraints.push(where('updated_at', '>', lastSync));
        }

        const fieldChunks = chunkArray(fieldIds, 30);
        const plotPromises = fieldChunks.map(chunk =>
            this.queryWithMetrics(() => getDocs(query(collection(db, 'plots'), ...baseConstraints, where('field.id', 'in', chunk))), `3a. Lotes (chunk de ${chunk.length})`)
        );
        const results = await Promise.all(plotPromises);
        return { docs: results.flatMap(snap => snap.docs) };
    }

    private async loadSessionsByFields(campaignId: string, fieldIds: string[], lastSync: Timestamp | null) {
        if (fieldIds.length === 0) return { docs: [] };

        const baseConstraints = createSecurityQuery(this.user).build();
        if (lastSync) {
            baseConstraints.push(where('updated_at', '>', lastSync));
        }

        const fieldChunks = chunkArray(fieldIds, 30);
        const sessionPromises = fieldChunks.map(chunk => {
            const finalConstraints = [
                ...baseConstraints,
                where('campaign.id', '==', campaignId),
                where('status', 'in', ['pending', 'in-progress']),
                where('field.id', 'in', chunk)
            ];
            return this.queryWithMetrics(() => getDocs(query(collection(db, 'harvest_sessions'), ...finalConstraints)), `3b. Sesiones (chunk de ${chunk.length})`);
        });
        const results = await Promise.all(sessionPromises);
        return { docs: results.flatMap(snap => snap.docs) };
    }

    private async loadCriticalSubcollections(sessions: any[], siloBagsSnap: any) {
        if (sessions.length === 0 && siloBagsSnap.docs.length === 0) return;

        const baseConstraints = createSecurityQuery(this.user).build();
        const recentSessions = sessions.sort((a, b) => b.date.toMillis() - a.date.toMillis());

        const registerPromises = recentSessions.map(session =>
            this.queryWithMetrics(() => getDocs(query(collection(db, 'harvest_sessions', session.id, 'registers'), ...baseConstraints, orderBy('date', 'desc'), limit(50))), `4. Registros de Sesión ${session.plot.name}`)
                .catch(() => ({ docs: [] }))
        );

        const movementPromises = siloBagsSnap.docs.map((siloDoc: any) =>
            this.queryWithMetrics(() => getDocs(query(collection(db, 'silo_bags', siloDoc.id, 'movements'), ...baseConstraints, orderBy('date', 'desc'), limit(20))), `4. Movimientos de Silo ${siloDoc.data().name}`)
                .catch(() => ({ docs: [] }))
        );

        await Promise.all([...registerPromises, ...movementPromises]);
    }

    private async queryWithMetrics(queryFn: () => Promise<any>, queryName: string): Promise<any> {
        this.metrics.totalQueries++;
        try {
            const result = await queryFn();
            const docCount = result.docs ? result.docs.length : (result.exists ? 1 : 0);
            this.metrics.totalDocuments += docCount;
            console.log(`  - [${queryName}]: ${docCount} docs.`);
            return result;
        } catch (error: any) {
            this.metrics.errors.push(`${queryName}: ${error.message}`);
            console.error(`❌ Error en query "${queryName}":`, error.message);
            throw error;
        }
    }

    private resetMetrics() { this.metrics = { totalQueries: 0, totalDocuments: 0, duration: 0, stage: 'starting', errors: [], timings: {} }; }
    private finishMetrics(startTime: number) { this.metrics.duration = Date.now() - startTime; this.metrics.stage = 'completed'; }
}

export const primeOfflineCache = (user: User): Promise<PrimingMetrics> => {
    const priming = new PrimingService();
    return priming.prime(user);
};