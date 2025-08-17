import { createRoot } from 'react-dom/client'
import './app.css'
import App from './App.tsx'
import { BrowserRouter } from "react-router";
import { AuthProvider } from './context/auth/AuthContext.tsx';
import UpdateManager from './components/pwa/UpdateManager.tsx';
import { SyncProvider } from './context/sync/SyncProvider.tsx';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { persister, queryClient } from './lib/queryClient.ts';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

createRoot(document.getElementById('root')!).render(
  <AuthProvider>
    <SyncProvider>
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{ persister }}
      >
        <UpdateManager />
        <BrowserRouter>
          <App />
        </BrowserRouter>
        <ReactQueryDevtools initialIsOpen={false} />
      </PersistQueryClientProvider>
    </SyncProvider>
  </AuthProvider>
)