import { createRoot } from 'react-dom/client'
import './app.css'
import App from './App.tsx'
import { BrowserRouter } from "react-router";
import { AuthProvider } from './context/auth/AuthContext.tsx';
import UpdateManager from './components/pwa/UpdateManager.tsx';
import { SyncProvider } from './context/sync/SyncProvider.tsx';

createRoot(document.getElementById('root')!).render(
  <AuthProvider>
    <SyncProvider>

      <UpdateManager />
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </SyncProvider>
  </AuthProvider>
)