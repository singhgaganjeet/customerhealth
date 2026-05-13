import { HashRouter, Routes, Route } from 'react-router-dom';
import { DataProvider } from './context/DataContext';
import Dashboard from './pages/Dashboard';
import CustomerDetailPage from './pages/CustomerDetailPage';
import PillarExplorerPage from './pages/PillarExplorerPage';

export default function App() {
  return (
    <DataProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/customer/:siteId" element={<CustomerDetailPage />} />
          <Route path="/pillar/:pillarKey" element={<PillarExplorerPage />} />
        </Routes>
      </HashRouter>
    </DataProvider>
  );
}
