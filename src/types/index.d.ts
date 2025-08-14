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
    organization_id: string;
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
    map_plot?: boolean
    harvested_hectares?: number
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
    harvesters: Partial<Harvester[]>;
    status: HarvestStatus;
    hectares: number;
    estimated_yield: number;
    yields: Yield;
    total_kgs: number;
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

export interface Silobag {
    id: string;
    name: string;
    created_at?: Timestamp;
    current_kg: number;
    initial_kg: number;
    crop: {
        id: string;
        name: string;
    };
    location: string
    status: string
}

export interface Truck {
    driver: string;
    license_plate: string;
}
export interface HarvestSessionRegister {
    id: string;
    organization_id: string;
    type: RegisterType;
    truck?: Truck;
    silo_bag?: Partial<Silobag>
    destination?: Destination;
    weight_kg: number;
    humidity: number;
    details?: string;
    created_at: FieldValue | Timestamp;
    updated_at?: FieldValue | Timestamp;
}

export interface Logistics {
    id: string;
    organization_id: string;
    status: string;
    date: string;
    driver: string;
    company: string;
    crop: {
        id: string;
        name: string;
    };
    field: {
        id: string;
        name: string;
    };
}

export interface HarvestSummary {
    id: string;
    organization_id: string;
    total_kgs: number;
    total_hectares: number;
    total_harvested_hectares: number;
    yield_per_sown_hectare: number;
    yield_per_harvested_hectare: number;
    average_estimated_yield: number;
    yield_real_vs_projected: number;
    agregation_level: 'campaign' | 'crop' | 'field' | 'plot';
}

export interface DestinationSummary {
    id: string;
    organization_id: string;
    destination: Destination;
    total_kgs: number;
    total_weighted_humidity: number;
    average_kg_per_truck: number;
    average_humidity: number;
    truck_count: number;
    agregation_level: 'campaign' | 'crop' | 'field' | 'plot';
}

export interface HarvestersSummary {
    id: string;
    harvester: Harvester;
    organization_id: string;
    total_harvested_kgs: number;
    total_harvested_hectares: number;
    session_count: number;
    average_yield_kg_ha: number;
    agregation_level: 'campaign' | 'crop' | 'field' | 'plot';
}

export type FilterStatus = 'Todos' | 'Pendientes' | 'En Progreso' | 'Finalizados'