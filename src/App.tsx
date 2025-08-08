import PlotList from './pages/harvest-session/HarvestSessionList.tsx';
import CampaignList from './pages/campaign/CampaignList.tsx';
import FieldList from './pages/field/FieldList.tsx';
import PlotDetail from './pages/harvest-session/HarvestSessionDetail.tsx';
import Login from './pages/auth/Login.tsx';
import { Routes, Route } from 'react-router';
import Layout from './components/commons/Layout.tsx';
import ProtectedRoute from './components/auth/ProtectedRoute.tsx';
import Dashboard from './pages/dashboard/Dashboard.tsx';

export default function App() {

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/campaigns" element={<CampaignList />} />
          <Route path="campaigns/:campaignId/fields" element={<FieldList />} />
          <Route path="campaigns/:campaignId/fields/:fieldId/harvest-sessions" element={<PlotList />} />
          <Route path="/campaigns/:campaignId/fields/:fieldId/harvest-sessions/:harvestSessionId" element={<PlotDetail />} />
        </Route>
      </Route>
    </Routes>
  );
}