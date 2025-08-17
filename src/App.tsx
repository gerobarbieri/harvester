import Login from './pages/auth/Login.tsx';
import { Routes, Route } from 'react-router';
import Layout from './components/commons/layout/index.tsx';
import ProtectedRoute from './components/auth/ProtectedRoute.tsx';
import HarvestView from './pages/dashboards/Harvest.tsx';
import SiloBagsView from './pages/silobags/Silobags.tsx';
import Logistics from './pages/logistics/Logistics.tsx';
import HarvestDetail from './pages/harvest-sessions/HarvestDetails.tsx';
import HarvestListView from './pages/harvest-sessions/Harvest.tsx';
import Reports from './pages/dashboards/Reports.tsx';
import HarvestSection from './components/dashboards/reports/harvest-report/HarvestSection.tsx';
import HarvestersSection from './components/dashboards/reports/harvester-report/HarvestersSection.tsx';
import DestinationsSection from './components/dashboards/reports/destinations-report/DestinationSection.tsx';
import HarvestersTab from './pages/harvest-sessions/tabs/HarvestersTab.tsx';
import RegistersTab from './pages/harvest-sessions/tabs/RegistersTab.tsx';
import SummaryTab from './pages/harvest-sessions/tabs/SummaryTab.tsx';
import SiloBagDetail from './pages/silobags/SilobagsDetail.tsx';

export default function App() {

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<HarvestView />} />
          <Route path="reports" element={<Reports />}>
            <Route index element={<HarvestSection />} /> {/* Ruta por defecto para /reports */}
            <Route path="harvests" element={<HarvestSection />} />
            <Route path="harvesters" element={<HarvestersSection />} />
            <Route path="destinations" element={<DestinationsSection />} />
          </Route>
          <Route path="harvest-sessions" element={<HarvestListView />} />
          <Route path="harvest-sessions/:harvestSessionId/details" element={<HarvestDetail onBack={() => window.history.back()} />}>
            <Route index element={<RegistersTab />} />
            <Route path="summary" element={<SummaryTab />} />
            <Route path="registers" element={<RegistersTab />} />
            <Route path="harvesters" element={<HarvestersTab />} />
          </Route>
          <Route path="silo-bags" element={<SiloBagsView />} />
          <Route path='silo-bags/:siloId' element={<SiloBagDetail />} />
          <Route path="logistics" element={<Logistics />} />
        </Route>
      </Route>
    </Routes >
  );
}