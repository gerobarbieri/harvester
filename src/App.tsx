import PlotList from './components/harvestPlot/pages/PlotHarvestList.tsx';
import CampaignList from './components/campaign/CampaignList.tsx';
import FieldList from './components/field/FieldList.tsx';
import PlotDetail from './components/harvestPlot/pages/PlotHarvestDetail.tsx';
import Login from './components/login/Login.tsx';
import { Routes, Route } from 'react-router';
import Layout from './components/ui/Layout.tsx';
import ProtectedRoute from './components/login/ProtectedRoute.tsx';
import Dashboard from './components/dashboard/Dashboard.tsx';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/campaigns" element={<CampaignList />} />
          <Route path="campaigns/:campaignId/fields" element={<FieldList />} />
          <Route path="campaigns/:campaignId/fields/:fieldId/plots" element={<PlotList />} />
          <Route path="/campaigns/:campaignId/fields/:fieldId/plots/:harvestPlotId" element={<PlotDetail />} />
        </Route>
      </Route>
    </Routes>
  );
}