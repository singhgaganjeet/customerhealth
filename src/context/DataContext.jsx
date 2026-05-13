import { createContext, useContext, useState, useEffect } from 'react';
import { parseAndValidateCSV } from '../lib/csvParser';
import { enrichCustomer } from '../lib/scoring';

const DataContext = createContext(null);

const TRACKED_FIELDS = {
  code: 'Code', customer: 'Institution Name', city: 'City', state: 'State',
  signup_date: 'Signup Date',
  registered_db: 'Registered Members', unregistered_db: 'Unregistered Members',
  pend_app: 'Pending Approval',
  events: 'Events', last_event_date: 'Last Event Date',
  news: 'News Posts', last_news_date: 'Last News Date',
  chapters: 'Chapters', sigs: 'SIGs',
  last_login_date: 'Last Login Date', last_mailer_date: 'Last Mailer Date',
  alp: 'ALP', ascend_elite: 'Ascend Elite', group_insurance: 'Group Insurance',
  hoopstr_live: 'Hoopstr Live', hoopstr_affinity: 'Hoopstr Affinity',
  vanguard: 'Vanguard', magic_ai: 'Magic AI',
  campus_visited: 'Campus Visited', campus_visit_date: 'Campus Visit Date',
  last_demo_date: 'Last Demo Date',
};

function diffCustomer(oldC, newC) {
  return Object.entries(TRACKED_FIELDS)
    .filter(([key]) => String(oldC?.[key] ?? '') !== String(newC?.[key] ?? ''))
    .map(([key, label]) => ({
      field: label,
      before: String(oldC?.[key] ?? ''),
      after:  String(newC?.[key] ?? ''),
    }));
}

async function api(path, options = {}) {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new Error(json.error || `${res.status} ${res.statusText}`);
  }
  return res.json();
}

export function DataProvider({ children }) {
  const [customers,   setCustomers]   = useState([]);
  const [history,     setHistory]     = useState([]);
  const [reportDate,  setReportDate]  = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [dbError,     setDbError]     = useState(null);
  const [importing,   setImporting]   = useState(false);
  const [importError, setImportError] = useState(null);

  // Load data from Turso on mount
  useEffect(() => {
    Promise.all([
      api('/api/customers'),
      api('/api/history'),
    ]).then(([rawCustomers, rawHistory]) => {
      setCustomers(rawCustomers.map(enrichCustomer));
      setHistory(rawHistory);
      // Derive reportDate from last import event
      const lastImport = rawHistory.find(e => e.action === 'imported');
      if (lastImport) setReportDate(rawCustomers[0]?.as_of_date || null);
    }).catch(err => {
      setDbError(err.message);
    }).finally(() => setLoading(false));
  }, []);

  function pushHistory(entry) {
    const newEntry = { id: String(Date.now()), timestamp: new Date().toISOString(), ...entry };
    setHistory(prev => [newEntry, ...prev]);
    api('/api/history', { method: 'POST', body: newEntry }).catch(console.error);
  }

  function addCustomer(enriched) {
    setCustomers(prev => [...prev, enriched]);
    api('/api/customers', { method: 'POST', body: enriched }).catch(console.error);
    pushHistory({ action: 'added', customerName: enriched.customer, siteId: enriched.site_id });
  }

  function updateCustomer(enriched) {
    const old = customers.find(c => String(c.site_id) === String(enriched.site_id));
    const changes = diffCustomer(old, enriched);
    setCustomers(prev => prev.map(c => String(c.site_id) === String(enriched.site_id) ? enriched : c));
    api(`/api/customers/${enriched.site_id}`, { method: 'PUT', body: enriched }).catch(console.error);
    pushHistory({ action: 'edited', customerName: enriched.customer, siteId: enriched.site_id, changes });
  }

  function deleteCustomer(siteId) {
    const c = customers.find(c => String(c.site_id) === String(siteId));
    setCustomers(prev => prev.filter(c => String(c.site_id) !== String(siteId)));
    api(`/api/customers/${siteId}`, { method: 'DELETE' }).catch(console.error);
    pushHistory({ action: 'deleted', customerName: c?.customer, siteId });
  }

  function clearAllCustomers() {
    const count = customers.length;
    setCustomers([]);
    setReportDate(null);
    api('/api/customers', { method: 'DELETE' }).catch(console.error);
    pushHistory({ action: 'cleared', count });
  }

  function clearHistory() {
    setHistory([]);
    api('/api/history', { method: 'DELETE' }).catch(console.error);
  }

  async function importCSV(file, asOfDate) {
    setImporting(true);
    setImportError(null);
    try {
      const parsed = await parseAndValidateCSV(file, asOfDate);
      await api('/api/customers', { method: 'PUT', body: parsed });
      setCustomers(parsed.map(enrichCustomer));
      setReportDate(asOfDate || null);
      pushHistory({ action: 'imported', count: parsed.length, fileName: file.name });
      return true;
    } catch (err) {
      setImportError(err.message);
      return false;
    } finally {
      setImporting(false);
    }
  }

  return (
    <DataContext.Provider value={{
      customers, reportDate, history, loading, dbError,
      importing, importError,
      importCSV, setImportError,
      addCustomer, updateCustomer, deleteCustomer, clearAllCustomers, clearHistory,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be within DataProvider');
  return ctx;
}
