import Papa from "papaparse";
import * as xlsx from 'xlsx';
import { format } from "date-fns";
import { Timestamp } from "firebase/firestore";
import type { Campaign, Field, HarvestPlotsWithDetails, Yield, HarvestPlotRecord } from "../types";

// Función auxiliar para no repetir código
function prepareExportData(plot: HarvestPlotsWithDetails, records: HarvestPlotRecord[], yieldData: Yield, campaign: Campaign, field: Field) {
    const summaryData = [{
        "Campaña": campaign?.name || '-',
        "Campo": field?.name || '-',
        "Cultivo": `${plot.cropName} ${plot.cropType}`,
        "Lote": plot.plotName,
        "Has. Sembradas": plot.hectares,
        "Total Kilos": plot.harvested_kgs || 0,
        "Rinde has. Cosechadas": yieldData.harvested.toFixed(2),
        "Rinde has. Semb": yieldData.seed.toFixed(2),
    }];

    const recordsData = records.map(r => ({
        "Fecha": r.created_at instanceof Timestamp ? format(r.created_at.toDate(), 'dd/MM/yyyy HH:mm') : '-',
        "Tipo": r.type,
        "Kilos": r.kg,
        "Humedad": r.humidity || '-',
        "ID/Patente": r.type === 'camion' ? r.license_plate : r.silobag_name || '-',
        "Chofer": r.type === 'camion' ? r.driver : '-',
        "Destino": r.type === 'camion' ? r.destination : '-',
        "Observaciones": r.details || '-'
    }));

    const fileName = `Cosecha_${campaign?.name}_${field?.name}_${plot.plotName}`.replace(/ /g, '_');

    return { summaryData, recordsData, fileName };
}

export const exportToCsv = (plot: HarvestPlotsWithDetails, records: HarvestPlotRecord[], yieldData: Yield, campaign: Campaign, field: Field) => {
    const { summaryData, recordsData, fileName } = prepareExportData(plot, records, yieldData, campaign, field);
    const summaryCsv = Papa.unparse(summaryData);
    const recordsCsv = Papa.unparse(recordsData);
    const finalCsv = `${summaryCsv}\n\n${recordsCsv}`;

    const blob = new Blob([finalCsv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${fileName}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

export const exportToXlsx = (plot: HarvestPlotsWithDetails, records: HarvestPlotRecord[], yieldData: Yield, campaign: Campaign, field: Field) => {
    const { summaryData, recordsData, fileName } = prepareExportData(plot, records, yieldData, campaign, field);
    const summaryWorksheet = xlsx.utils.json_to_sheet(summaryData);
    const recordsWorksheet = xlsx.utils.json_to_sheet(recordsData);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, summaryWorksheet, "Resumen");
    xlsx.utils.book_append_sheet(workbook, recordsWorksheet, "Registros");
    xlsx.writeFile(workbook, `${fileName}.xlsx`);
};