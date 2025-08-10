import Login from './pages/auth/Login.tsx';
import { Routes, Route } from 'react-router';
import Layout from './components/commons/layout/index.tsx';
import ProtectedRoute from './components/auth/ProtectedRoute.tsx';
import HarvestView from './pages/dashboards/Harvest.tsx';
import Reports, { DestinationsSection, HarvestersSection, HarvestSection } from './pages/dashboards/Reports.tsx';
import SiloBagsView from './pages/silobags/Silobags.tsx';
import Logistics from './pages/logistics/Logistics.tsx';
import HarvestDetail, { CosecherosTab, RegistroTab, ResumenTab } from './pages/harvest-sessions/HarvestDetails.tsx';

export default function App() {

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<HarvestView />} />
          <Route path="reports" element={<Reports />}>
            <Route index element={<HarvestSection />} /> {/* Ruta por defecto para /reports */}
            <Route path="cosecha" element={<HarvestSection />} />
            <Route path="cosecheros" element={<HarvestersSection />} />
            <Route path="destinos" element={<DestinationsSection />} />
          </Route>
          <Route path="harvest-session" element={<HarvestView />} />
          <Route path="harvest-session/{harvestSessionId}/details" element={<HarvestDetail onBack={() => window.history.back()} />}>
            <Route index element={<ResumenTab />} /> {/* Ruta por defecto para /harvestSessionId */}
            <Route path="resumen" element={<ResumenTab />} />
            <Route path="registro" element={<RegistroTab />} />
            <Route path="cosecheros" element={<CosecherosTab />} />
          </Route>
          <Route path="silo-bags" element={<SiloBagsView />} />
          <Route path="logistics" element={<Logistics />} />
        </Route>
      </Route>
    </Routes >
  );
}