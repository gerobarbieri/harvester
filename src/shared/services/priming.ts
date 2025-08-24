import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { chunkArray } from "../firebase/utils";
import type { CampaignField } from "../types";

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

    async prime(organizationId: string, userRole: string, userId: string): Promise<PrimingMetrics> {
        const startTime = Date.now();
        console.time("Priming");
        console.log(`🌍 Iniciando priming optimizado para rol: ${userRole}`);
        this.resetMetrics();

        try {
            // --- ETAPA 1: Carga de datos base (no dependen de nada) ---
            const stage1Start = Date.now();
            const [
                activeCampaignSnap, _cropsSnap, _harvestersSnap,
                _destinationsSnap, _usersSnap, activeSiloBagsSnap
            ] = await Promise.all([
                this.queryWithMetrics(() => getDocs(query(collection(db, 'campaigns'), where('organization_id', '==', organizationId), where('active', '==', true), limit(1))), '1. Campaña Activa'),
                this.queryWithMetrics(() => getDocs(query(collection(db, 'crops'), where('organization_id', '==', organizationId))), '1. Catálogo: Cultivos'),
                this.queryWithMetrics(() => getDocs(query(collection(db, 'harvesters'), where('organization_id', '==', organizationId))), '1. Catálogo: Cosecheros'),
                this.queryWithMetrics(() => getDocs(query(collection(db, 'destinations'), where('organization_id', '==', organizationId))), '1. Catálogo: Destinos'),
                this.queryWithMetrics(() => getDocs(query(collection(db, 'users'), where('organization_id', '==', organizationId))), '1. Catálogo: Usuarios'),
                this.queryWithMetrics(() => getDocs(query(collection(db, 'silo_bags'), where('organization_id', '==', organizationId), where('status', '==', 'active'), orderBy('created_at', 'desc'), limit(50))), '1. Silobolsas Activos'),
                this.queryWithMetrics(() => getDocs(query(collection(db, 'logistics'), where('organization_id', '==', organizationId), where('status', 'in', ['in-route-to-field', 'loading']), orderBy('date', 'desc'), limit(50))), '1. Logística Activa'),
            ]);
            this.metrics.timings['stage1_base'] = Date.now() - stage1Start;

            const campaign = activeCampaignSnap.docs[0] ? { id: activeCampaignSnap.docs[0].id, ...activeCampaignSnap.docs[0].data() } : null;
            if (!campaign) {
                console.log("⚠️ No hay campaña activa. El priming finaliza temprano.");
                this.finishMetrics(startTime);
                return this.metrics;
            }

            // --- ETAPA 2: Carga de datos dependientes de la campaña (Campos) ---
            const stage2Start = Date.now();
            const campaignFieldsSnap = await this.loadCampaignFields(organizationId, campaign.id, userRole, userId);
            const relevantFieldIds = campaignFieldsSnap.docs.map((doc: any) => (doc.data() as CampaignField).field.id);
            console.log(`🔄 Encontrados ${relevantFieldIds.length} campos para la campaña activa.`);
            this.metrics.timings['stage2_campaign_fields'] = Date.now() - stage2Start;

            // --- ETAPA 3: Carga de datos dependientes de los campos (Lotes y Sesiones) ---
            const stage3Start = Date.now();
            const [_plotsSnap, allSessionsSnap] = await Promise.all([
                this.loadPlots(organizationId, relevantFieldIds),
                this.loadSessionsByFields(organizationId, campaign.id, relevantFieldIds)
            ]);
            this.metrics.timings['stage3_plots_and_sessions'] = Date.now() - stage3Start;

            // --- ETAPA 4: Carga de subcolecciones críticas ---
            const stage4Start = Date.now();
            const allSessions = allSessionsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            await this.loadCriticalSubcollections(organizationId, allSessions, activeSiloBagsSnap);
            this.metrics.timings['stage4_subcollections'] = Date.now() - stage4Start;

            this.finishMetrics(startTime);
            console.timeEnd("Priming");
            console.log(`✅ Priming finalizado: ${this.metrics.totalQueries} queries, ${this.metrics.totalDocuments} docs en ${this.metrics.duration}ms`);
            return this.metrics;

        } catch (error: any) {
            this.metrics.duration = Date.now() - startTime;
            this.metrics.stage = 'error';
            this.metrics.errors.push(error.message);
            console.error("🔥 Error crítico durante el priming:", error);
            throw error;
        }
    }

    private async loadCampaignFields(organizationId: string, campaignId: string, userRole: string, userId: string) {
        if (userRole === 'admin' || userRole === 'owner') {
            return this.queryWithMetrics(() => getDocs(query(collection(db, 'campaign_fields'), where('organization_id', '==', organizationId), where('campaign.id', '==', campaignId))), '2a. Campos de Campaña (Admin)');
        }

        const [assignedSnap, unassignedSnap] = await Promise.all([
            this.queryWithMetrics(() => getDocs(query(collection(db, 'campaign_fields'), where('organization_id', '==', organizationId), where('campaign.id', '==', campaignId), where('responsible_uids', 'array-contains', userId))), '2a. Campos Asignados (Manager)'),
            this.queryWithMetrics(() => getDocs(query(collection(db, 'campaign_fields'), where('organization_id', '==', organizationId), where('campaign.id', '==', campaignId), where('responsible_uids', '==', []))), '2a. Campos sin Asignar (Manager)')
        ]);

        const docsMap = new Map();
        assignedSnap.docs.forEach((doc: any) => docsMap.set(doc.id, doc));
        unassignedSnap.docs.forEach((doc: any) => docsMap.set(doc.id, doc));
        const allDocs = Array.from(docsMap.values());

        return { docs: allDocs };
    }

    private async loadPlots(organizationId: string, fieldIds: string[]) {
        if (fieldIds.length === 0) return { docs: [] };
        const fieldChunks = chunkArray(fieldIds, 30);
        const plotPromises = fieldChunks.map(chunk =>
            this.queryWithMetrics(() => getDocs(query(collection(db, 'plots'), where('organization_id', '==', organizationId), where('field.id', 'in', chunk))), `3a. Lotes (chunk de ${chunk.length})`)
        );
        const results = await Promise.all(plotPromises);
        return { docs: results.flatMap(snap => snap.docs) };
    }

    private async loadSessionsByFields(organizationId: string, campaignId: string, fieldIds: string[]) {
        if (fieldIds.length === 0) return { docs: [] };
        const fieldChunks = chunkArray(fieldIds, 30);
        const sessionPromises = fieldChunks.map(chunk =>
            this.queryWithMetrics(() => getDocs(query(collection(db, 'harvest_sessions'), where('organization_id', '==', organizationId), where('campaign.id', '==', campaignId), where('status', 'in', ['pending', 'in-progress']), where('field.id', 'in', chunk))), `3b. Sesiones (chunk de ${chunk.length})`)
        );
        const results = await Promise.all(sessionPromises);
        return { docs: results.flatMap(snap => snap.docs) };
    }

    private async loadCriticalSubcollections(organizationId: string, sessions: any[], siloBagsSnap: any) {
        if (sessions.length === 0 && siloBagsSnap.docs.length === 0) return;

        const recentSessions = sessions.sort((a, b) => b.date.toMillis() - a.date.toMillis()).slice(0, 10);

        const registerPromises = recentSessions.map(session =>
            this.queryWithMetrics(() => getDocs(query(collection(db, 'harvest_sessions', session.id, 'registers'), where('organization_id', '==', organizationId), orderBy('date', 'desc'), limit(50))), `4. Registros de Sesión ${session.plot.name}`)
                .catch(() => ({ docs: [] }))
        );

        const movementPromises = siloBagsSnap.docs.map((siloDoc: any) =>
            this.queryWithMetrics(() => getDocs(query(collection(db, 'silo_bags', siloDoc.id, 'movements'), where('organization_id', '==', organizationId), orderBy('date', 'desc'), limit(20))), `4. Movimientos de Silo ${siloDoc.data().name}`)
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

export const priming = new PrimingService();

export const primeOfflineCache = (
    organizationId: string,
    userRole: string,
    userId: string
): Promise<PrimingMetrics> => {
    return priming.prime(organizationId, userRole, userId);
};