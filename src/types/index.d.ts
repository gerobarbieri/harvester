import type { FieldValue, Timestamp } from "firebase/firestore";

export interface Campaign {
    id: string;
    name: string;
    date: string;
}

export interface Field {
    id: string;
    name: string;
}

export interface Plot {
    id: string;
    name: string;
    field_id: string;
}

export type HarvestStatus = 'pending' | 'in-progress' | 'finished';

export interface HarvestPlot {
    id: string;
    campaign_id: string;
    field_id: string;
    plot_id: string;
    crop_id: string;
    hectares: number;
    harvested_kgs?: number;
    harvester?: string;
    harvest_manager?: string;
    status: 'pending' | 'in-progress' | 'finished';
    harvested_hectares: number;
    created_at: Date;
    created_at_server?: FieldValue | Timestamp;
    updated_at?: Date;
    updated_at_server: FieldValue | Timestamp;
}

export interface HarvestPlotsWithDetails extends HarvestPlot { plotName: string; cropName: string; cropType: string }

export interface Yield {
    seed: number;
    harvested: number;
}

export interface Crop {
    id: string;
    name: string;
    type: string;
}

export interface HarvestPlotRecord {
    id: string;
    harvest_plot_id: string;
    type: 'camion' | 'silobolsa';
    destination?: string;
    kg: number;
    driver?: string;
    license_plate?: string;
    silobag_name?: string;
    humidity: number;
    details?: string;
    created_at: FieldValue | Timestamp;
    updated_at?: FieldValue | Timestamp;
}

export type FilterStatus = 'Todos' | 'Pendientes' | 'En Progreso' | 'Finalizados'