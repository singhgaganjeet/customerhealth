import { HashRouter, Routes, Route } from 'react-router-dom';
import { DataProvider, useData } from './context/DataContext';
import Dashboard from './pages/Dashboard';
import CustomerDetailPage from './pages/CustomerDetailPage';
import PillarExplorerPage from './pages/PillarExplorerPage';

function AppRoutes() {
  const { loading, dbError } = useData();

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-slate-500">Connecting to database…</p>
      </div>
    </div>
  );

  if (dbError) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-red-200 shadow-sm p-8 max-w-md w-full text-center">
        <div className="text-4xl text-red-400 mb-4">⚠</div>
        <h2 className="text-base font-semibold text-slate-800 mb-2">Database connection failed</h2>
        <p className="text-xs text-slate-500 font-mono bg-red-50 rounded-lg px-3 py-2 mb-5 break-all">{dbError}</p>
        <p className="text-xs text-slate-400 mb-4">Check that TURSO_DATABASE_URL and TURSO_AUTH_TOKEN are set in your Vercel environment variables.</p>
        <button
          onClick={() => window.location.reload()}
          className="text-sm text-indigo-600 hover:text-indigo-800 font-medium underline"
        >
          Try again
        </button>
      </div>
    </div>
  );

  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/customer/:siteId" element={<CustomerDetailPage />} />
      <Route path="/pillar/:pillarKey" element={<PillarExplorerPage />} />
    </Routes>
  );
}

export default function App() {
  return (
    <DataProvider>
      <HashRouter>
        <AppRoutes />
      </HashRouter>
    </DataProvider>
  );
}
