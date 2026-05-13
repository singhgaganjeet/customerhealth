import { createContext, useContext, useState } from 'react';
import { SAMPLE_CUSTOMERS, SAMPLE_REPORT_DATE } from '../lib/sampleData';
import { parseAndValidateCSV } from '../lib/csvParser';

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const [customers, setCustomers] = useState(SAMPLE_CUSTOMERS);
  const [reportDate, setReportDate] = useState(SAMPLE_REPORT_DATE);
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState(null);

  function addCustomer(enriched) {
    setCustomers(prev => [...prev, enriched]);
  }

  function updateCustomer(enriched) {
    setCustomers(prev => prev.map(c => String(c.site_id) === String(enriched.site_id) ? enriched : c));
  }

  async function importCSV(file) {
    setImporting(true);
    setImportError(null);
    try {
      const parsed = await parseAndValidateCSV(file);
      setCustomers(parsed);
      const now = new Date();
      setReportDate(now.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }));
      return true;
    } catch (err) {
      setImportError(err.message);
      return false;
    } finally {
      setImporting(false);
    }
  }

  return (
    <DataContext.Provider value={{ customers, reportDate, importing, importError, importCSV, setImportError, addCustomer, updateCustomer }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be within DataProvider');
  return ctx;
}
