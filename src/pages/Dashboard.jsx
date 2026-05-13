import { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import Header from '../components/Header';
import KPIStrip from '../components/KPIStrip';
import PillarBreakdownChart from '../components/PillarBreakdownChart';
import CustomerTable from '../components/CustomerTable';
import FilterBar from '../components/FilterBar';
import ImportModal from '../components/ImportModal';
import AddCustomerModal from '../components/AddCustomerModal';
import ConfirmDialog from '../components/ConfirmDialog';
import { generatePDFReport } from '../lib/pdf';

export default function Dashboard() {
  const { customers, reportDate, clearAllCustomers } = useData();
  const [showImport, setShowImport] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ state: '', city: '', activationStatus: '', paStatus: '' });

  const filtered = useMemo(() => customers.filter(c => {
    if (filters.state && c.state !== filters.state) return false;
    if (filters.city && c.city !== filters.city) return false;
    if (filters.activationStatus && c.activationStatus?.label !== filters.activationStatus) return false;
    if (filters.paStatus && c.pa_status !== filters.paStatus) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!c.customer?.toLowerCase().includes(q) && !c.code?.toLowerCase().includes(q)) return false;
    }
    return true;
  }), [customers, filters, search]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Header
        onAddClick={() => setShowAdd(true)}
        onImportClick={() => setShowImport(true)}
        onPDFClick={() => generatePDFReport(customers, reportDate)}
      />

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-5">
        <KPIStrip customers={customers} />

        <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">
          <div className="xl:col-span-2">
            <PillarBreakdownChart customers={customers} />
          </div>

          <div className="xl:col-span-3 bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-700">Customer Directory</h2>
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400">{filtered.length} of {customers.length} shown</span>
                {customers.length > 0 && (
                  <button
                    onClick={() => setShowClearConfirm(true)}
                    className="text-xs text-red-400 hover:text-red-600 font-medium transition-colors"
                  >
                    Clear all
                  </button>
                )}
              </div>
            </div>
            <input
              type="text"
              placeholder="Search by institution name or code…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 w-full"
            />
            <FilterBar customers={customers} filters={filters} onChange={f => { setFilters(f); }} />
          </div>
        </div>

        <CustomerTable customers={filtered} />
      </main>

      {showImport && <ImportModal onClose={() => setShowImport(false)} />}
      {showAdd && <AddCustomerModal onClose={() => setShowAdd(false)} />}
      {showClearConfirm && (
        <ConfirmDialog
          title="Clear All Data"
          message={`This will permanently remove all ${customers.length} customers. This cannot be undone.`}
          confirmLabel="Clear All"
          danger
          onConfirm={() => { clearAllCustomers(); setShowClearConfirm(false); }}
          onCancel={() => setShowClearConfirm(false)}
        />
      )}
    </div>
  );
}
