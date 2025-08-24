
import { useState, useEffect, useMemo } from 'react';
import useAuth from '../../context/auth/AuthContext';
import type { CampaignField } from '../../types';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../../firebase/firebase';

export const useCampaignFields = (campaignId: string) => {
    const { currentUser, loading: authLoading } = useAuth();
    const [campaignFields, setCampaignFields] = useState<CampaignField[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (authLoading || !currentUser || !campaignId) return;

        // Lógica para Admin/Owner (una sola consulta y un solo listener)
        if (currentUser.role === 'admin' || currentUser.role === 'owner') {
            const q = query(
                collection(db, 'campaign_fields'),
                where("organization_id", "==", currentUser.organizationId),
                where('campaign.id', '==', campaignId)
            );

            const unsubscribe = onSnapshot(q, (snapshot) => {
                const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as CampaignField }));
                setCampaignFields(data);
                setLoading(false);
            }, (err) => {
                console.error("Error en la suscripción de CampaignFields (admin):", err);
                setError(err.message);
                setLoading(false);
            });

            return () => unsubscribe();
        }

        // Lógica para Manager (dos consultas y dos listeners)
        if (currentUser.role === 'manager') {
            // Estados intermedios para los resultados de cada listener
            let assignedFields: CampaignField[] = [];
            let unassignedFields: CampaignField[] = [];

            // Función para unir y actualizar el estado final
            const mergeResults = () => {
                const fieldsMap = new Map();
                assignedFields.forEach(field => fieldsMap.set(field.id, field));
                unassignedFields.forEach(field => fieldsMap.set(field.id, field));
                setCampaignFields(Array.from(fieldsMap.values()));
                setLoading(false);
            };

            // Listener 1: Campos asignados al manager
            const assignedQuery = query(
                collection(db, 'campaign_fields'),
                where("organization_id", "==", currentUser.organizationId),
                where('campaign.id', '==', campaignId),
                where('responsible_uids', 'array-contains', currentUser.uid)
            );
            const unsubscribeAssigned = onSnapshot(assignedQuery, (snapshot) => {
                assignedFields = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as CampaignField }));
                mergeResults();
            }, (err) => {
                console.error("Error en listener de campos asignados:", err);
                setError(err.message);
            });

            // Listener 2: Campos sin asignar
            const unassignedQuery = query(
                collection(db, 'campaign_fields'),
                where("organization_id", "==", currentUser.organizationId),
                where('campaign.id', '==', campaignId),
                where('responsible_uids', '==', [])
            );
            const unsubscribeUnassigned = onSnapshot(unassignedQuery, (snapshot) => {
                unassignedFields = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as CampaignField }));
                mergeResults();
            }, (err) => {
                console.error("Error en listener de campos sin asignar:", err);
                setError(err.message);
            });

            return () => {
                unsubscribeAssigned();
                unsubscribeUnassigned();
            };
        }

    }, [currentUser, authLoading, campaignId]);

    const fieldOptions = useMemo(() =>
        campaignFields.map(cf => ({
            id: cf.field.id,
            value: cf.field.id,
            name: cf.field.name,
            label: cf.field.name
        })),
        [campaignFields]
    );

    return { campaignFields, loading, error, fieldOptions };
};