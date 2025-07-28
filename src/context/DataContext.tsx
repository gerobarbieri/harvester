import { collection, onSnapshot } from "firebase/firestore";
import { createContext, type FC, useState, useEffect, useContext } from "react";
import { db } from "../repository/firebase";
import type { Campaign, Field, Plot, Crop, HarvestPlot, HarvestPlotsWithDetails, HarvestPlotRecord } from "../types";
import useAuth from "./AuthContext";

interface DataContextType { campaigns: Campaign[]; fields: Field[]; plots: Plot[]; crops: Crop[]; harvestPlots: HarvestPlot[]; harvestPlotsWithDetails: HarvestPlotsWithDetails[]; harvestPlotsRecords: HarvestPlotRecord[]; dataLoading: boolean; }
const DataContext = createContext<DataContextType>({} as DataContextType);
export const DataProvider: FC<{ children: React.ReactNode }> = ({ children }) => {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [fields, setFields] = useState<Field[]>([]);
    const [plots, setPlots] = useState<Plot[]>([]);
    const [crops, setCrops] = useState<Crop[]>([]);
    const [harvestPlots, setHarvestPlots] = useState<HarvestPlot[]>([]);
    const [harvestPlotsWithDetails, setHarvestPlotsWithDetails] = useState<HarvestPlotsWithDetails[]>([]);
    const [harvestPlotsRecords, setHarvestPlotsRecords] = useState<HarvestPlotRecord[]>([]);
    const [dataLoading, setDataLoading] = useState(true);
    const { currentUser } = useAuth();

    // Dentro de tu DataProvider
    useEffect(() => {
        if (!currentUser) {
            setCampaigns([]);
            setFields([]);
            setPlots([]);
            setCrops([]);
            setHarvestPlots([]);
            setHarvestPlotsRecords([]);
            setDataLoading(true);
            return;
        }

        setDataLoading(true);

        const collectionsToLoad = ['campaigns', 'fields', 'plots', 'crops', 'harvest_plots', 'harvest_plots_records'];

        const unsubscribers = [];

        const initialLoadPromises = collectionsToLoad.map(collectionName => {
            return new Promise((resolve) => {
                const query = collection(db, collectionName);
                const unsub = onSnapshot(query, (snapshot) => {
                    const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
                    switch (collectionName) {
                        case 'campaigns': setCampaigns(data as Campaign[]); break;
                        case 'fields': setFields(data as Field[]); break;
                        case 'plots': setPlots(data as Plot[]); break;
                        case 'crops': setCrops(data as Crop[]); break;
                        case 'harvest_plots': setHarvestPlots(data as HarvestPlot[]); break;
                        case 'harvest_plots_records': setHarvestPlotsRecords(data as HarvestPlotRecord[]); break;
                    }

                    resolve(true);
                }, (error) => {
                    console.error(`Error cargando ${collectionName}:`, error);
                    resolve(false); // Resolvemos incluso si hay error para no bloquear el resto
                });
                unsubscribers.push(unsub);
            });
        });

        Promise.all(initialLoadPromises).then(() => {
            setDataLoading(false);
            console.log("Toda la data inicial ha sido cargada.");
        });

        return () => {
            unsubscribers.forEach(unsub => unsub());
        };
    }, [currentUser]);

    useEffect(() => {
        if (dataLoading || !plots.length || !crops.length) return;

        const plotMap = new Map(plots.map(p => [p.id, p]));
        const cropMap = new Map(crops.map(c => [c.id, c]));

        const details = harvestPlots.map(ap => {
            const plot = plotMap.get(ap.plot_id);
            const crop = cropMap.get(ap.crop_id);
            return {
                ...ap,
                plotName: plot?.name || 'Lote Desconocido',
                cropName: crop?.name || 'Cultivo Desconocido',
                cropType: crop?.type || '',
            };
        });
        setHarvestPlotsWithDetails(details);

    }, [harvestPlots, plots, crops, dataLoading]);

    const value = { campaigns, fields, plots, crops, harvestPlots, harvestPlotsRecords, harvestPlotsWithDetails, dataLoading };
    return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}
const useData = () => useContext(DataContext);

// eslint-disable-next-line react-refresh/only-export-components
export default useData;