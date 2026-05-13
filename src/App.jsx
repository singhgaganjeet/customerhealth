import { HashRouter, Routes, Route } from 'react-router-dom';
import { SignInButton } from '@clerk/clerk-react';
import { AuthProvider, useAdmin, CLERK_CONFIGURED } from './context/AuthContext';
import { DataProvider, useData } from './context/DataContext';
import Dashboard from './pages/Dashboard';
import CustomerDetailPage from './pages/CustomerDetailPage';
import PillarExplorerPage from './pages/PillarExplorerPage';

function SignInScreen() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="text-center">
        <img src="/hoopstr_logo.png" alt="Hoopstr" className="h-10 w-auto mx-auto mb-8" />
        <h1 className="text-xl font-semibold text-slate-800 mb-1">Customer Activation Dashboard</h1>
        <p className="text-sm text-slate-400 mb-8">Admin access only</p>
        {CLERK_CONFIGURED ? (
          <SignInButton mode="modal">
            <button className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-6 py-2.5 rounded-lg transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Sign In
            </button>
          </SignInButton>
        ) : (
          <p className="text-xs text-slate-400 font-mono">VITE_CLERK_PUBLISHABLE_KEY not configured</p>
        )}
      </div>
    </div>
  );
}

function AppContent() {
  const { isSignedIn, isLoaded } = useAdmin();
  const { loading, dbError } = useData();

  if (!isLoaded || loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-slate-500">Loading…</p>
      </div>
    </div>
  );

  if (!isSignedIn) return <SignInScreen />;

  if (dbError) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-red-200 shadow-sm p-8 max-w-md w-full text-center">
        <div className="text-4xl text-red-400 mb-4">⚠</div>
        <h2 className="text-base font-semibold text-slate-800 mb-2">Database connection failed</h2>
        <p className="text-xs text-slate-500 font-mono bg-red-50 rounded-lg px-3 py-2 mb-5 break-all">{dbError}</p>
        <p className="text-xs text-slate-400 mb-4">Check that TURSO_DATABASE_URL and TURSO_AUTH_TOKEN are set in your Vercel environment variables.</p>
        <button onClick={() => window.location.reload()} className="text-sm text-indigo-600 hover:text-indigo-800 font-medium underline">
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
    <AuthProvider>
      <DataProvider>
        <HashRouter>
          <AppContent />
        </HashRouter>
      </DataProvider>
    </AuthProvider>
  );
}
