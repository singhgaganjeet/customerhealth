import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';

export default function Header({ onImportClick, onPDFClick, onAddClick }) {
  const { reportDate } = useData();
  return (
    <header className="bg-gray-50 border-b border-gray-200 px-5 py-3 flex items-center gap-4 shadow-sm sticky top-0 z-40">
      <Link to="/" className="flex items-center gap-3 shrink-0 hover:opacity-80 transition-opacity">
        <img src="/hoopstr_logo.png" alt="Hoopstr" className="h-7 w-auto" />
        <div className="text-[10px] text-slate-400 leading-tight border-l border-gray-300 pl-3">Customer Activation</div>
      </Link>

      <div className="flex-1" />

      {reportDate && (
        <span className="text-xs text-slate-400 hidden md:block">
          Report: <span className="text-slate-600 font-medium">{reportDate}</span>
        </span>
      )}

      {onAddClick && (
        <button
          onClick={onAddClick}
          className="flex items-center gap-1.5 text-xs text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-2 rounded-lg transition-colors font-medium"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Customer
        </button>
      )}

      {onImportClick && (
        <button
          onClick={onImportClick}
          className="flex items-center gap-1.5 text-xs text-slate-600 bg-white border border-gray-300 hover:bg-gray-100 px-3 py-2 rounded-lg transition-colors font-medium"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          Import CSV
        </button>
      )}

      {onPDFClick && (
        <button
          onClick={onPDFClick}
          className="flex items-center gap-1.5 text-xs text-slate-600 bg-white border border-gray-300 hover:bg-gray-100 px-3 py-2 rounded-lg transition-colors font-medium"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          PDF Report
        </button>
      )}
    </header>
  );
}
