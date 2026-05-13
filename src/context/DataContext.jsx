import { createContext, useContext, useState, useEffect } from 'react';
import { parseAndValidateCSV } from '../lib/csvParser';
import { enrichCustomer } from '../lib/scoring';

const DataContext = createContext(null);

// Fields tracked for change history diffs
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

function load(key, fallback) {
  try {
    const s = localStorage.getItem(key);
    return s ? JSON.parse(s) : fallback;
  } catch { return fallback; }
}

export function DataProvider({ children }) {
  const [customers, setCustomers] = useState(() =>
    load('hoopstr_customers', []).map(enrichCustomer)
  );
  const [history, setHistory]     = useState(() => load('hoopstr_history', []));
  const [reportDate, setReportDate] = useState(() => load('hoopstr_report_date', null));
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState(null);

  useEffect(() => { localStorage.setItem('hoopstr_customers',    JSON.stringify(customers));   }, [customers]);
  useEffect(() => { localStorage.setItem('hoopstr_history',      JSON.stringify(history));     }, [history]);
  useEffect(() => { localStorage.setItem('hoopstr_report_date',  JSON.stringify(reportDate));  }, [reportDate]);

  function pushHistory(entry) {
    setHistory(prev => [{ id: String(Date.now()), timestamp: new Date().toISOString(), ...entry }, ...prev]);
  }

  function addCustomer(enriched) {
    setCustomers(prev => [...prev, enriched]);
    pushHistory({ action: 'added', customerName: enriched.customer, siteId: enriched.site_id });
  }

  function updateCustomer(enriched) {
    const old = customers.find(c => String(c.site_id) === String(enriched.site_id));
    const changes = diffCustomer(old, enriched);
    setCustomers(prev => prev.map(c => String(c.site_id) === String(enriched.site_id) ? enriched : c));
    pushHistory({ action: 'edited', customerName: enriched.customer, siteId: enriched.site_id, changes });
  }

  function deleteCustomer(siteId) {
    const c = customers.find(c => String(c.site_id) === String(siteId));
    setCustomers(prev => prev.filter(c => String(c.site_id) !== String(siteId)));
    pushHistory({ action: 'deleted', customerName: c?.customer, siteId });
  }

  function clearAllCustomers() {
    const count = customers.length;
    setCustomers([]);
    setReportDate(null);
    pushHistory({ action: 'cleared', count });
  }

  function clearHistory() {
    setHistory([]);
  }

  async function importCSV(file, asOfDate) {
    setImporting(true);
    setImportError(null);
    try {
      const parsed = await parseAndValidateCSV(file, asOfDate);
      setCustomers(parsed);
      setReportDate(asOfDate || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }));
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
      customers, reportDate, history,
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
