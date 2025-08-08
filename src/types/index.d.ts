import type { FieldValue, Timestamp } from "firebase/firestore";

export interface User {
    organizationId: string;
    role: string;
    uid: string
}

export interface Campaign {
    id: string;
    name: string;
    start_date: string;
    active: boolean;
}

export interface Field {
    id: string;
    name: string;
    location?: object
}

export interface CampaignFields {
    id: string;
    campaign: Partial<Campaign>
    field: Partial<Field>
}

export interface Plot {
    id: string;
    name: string;
    field: Partial<Field>;
    hectares?: number
}

export interface HarvestManager {
    id: string;
    name: string;
}

export interface Harvester {
    id: string;
    name: string;
}

export interface Destination {
    id: string;
    name: string;
}

export type HarvestStatus = 'pending' | 'in-progress' | 'finished';

export type RegisterType = 'truck' | 'silo_bag'

export interface HarvestSession {
    id: string;
    organization_id: string;
    date: Timestamp;
    campaign: Partial<Campaign>;
    plot: Partial<Plot>;
    field: Partial<Field>;
    crop: Partial<Crop>;
    harvesters: Partial<Harvesters[]>;
    status: HarvestStatus;
    hectares: number;
    estimated_yield: number;
    yields: Yield;
    harvested_kgs: number;
    harvested_hectares: number;
    harvest_manager: Partial<HarvestManager>
}

export interface Yield {
    seed: number;
    harvested: number;
    real_vs_projected: number;
}

export interface Crop {
    id: string;
    name: string;
    type: string;
}
export interface HarvestSessionRegister {
    id: string;
    organization_id: string;
    type: RegisterType;
    destination?: Destination;
    weight_kg: number;
    driver?: string;
    license_plate?: string;
    silobag_name?: string;
    humidity: number;
    details?: string;
    created_at: FieldValue | Timestamp;
    updated_at?: FieldValue | Timestamp;
}



export type FilterStatus = 'Todos' | 'Pendientes' | 'En Progreso' | 'Finalizados'