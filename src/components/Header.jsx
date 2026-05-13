import { useState } from 'react';
import { Link } from 'react-router-dom';
import { SignInButton, UserButton } from '@clerk/clerk-react';
import { useAdmin, CLERK_CONFIGURED } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import HistoryModal from './HistoryModal';

export default function Header({ onImportClick, onPDFClick, onAddClick }) {
  const { reportDate, history } = useData();
  const { isSignedIn } = useAdmin();
  const [showHistory, setShowHistory] = useState(false);

  return (
    <>
    <header className="bg-gray-50 border-b border-gray-200 px-5 py-3 flex items-center gap-4 shadow-sm sticky top-0 z-40">
      <Link to="/" className="flex items-center gap-3 shrink-0 hover:opacity-80 transition-opacity">
        <img src="/hoopstr_logo.png" alt="Hoopstr" className="h-7 w-auto" />
        <div className="text-[10px] text-slate-400 leading-tight border-l border-gray-300 pl-3">Customer Activation</div>
      </Link>

      <div className="flex-1" />

      {reportDate && (
        <span className="text-xs text-slate-400 hidden md:block">
          Data As Of: <span className="text-slate-600 font-medium">{reportDate}</span>
        </span>
      )}

      {isSignedIn && (
        <button
          onClick={() => setShowHistory(true)}
          title="Change History"
          className="relative flex items-center gap-1.5 text-xs text-slate-600 bg-white border border-gray-300 hover:bg-gray-100 px-3 py-2 rounded-lg transition-colors font-medium"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          History
          {history.length > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-indigo-600 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
              {history.length > 99 ? '99' : history.length}
            </span>
          )}
        </button>
      )}

      {isSignedIn && onAddClick && (
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

      {isSignedIn && onImportClick && (
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

      {isSignedIn && onPDFClick && (
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

      {CLERK_CONFIGURED && (
        isSignedIn ? (
          <UserButton afterSignOutUrl={window.location.href} />
        ) : (
          <SignInButton mode="modal">
            <button className="flex items-center gap-1.5 text-xs text-slate-600 bg-white border border-gray-300 hover:bg-gray-100 px-3 py-2 rounded-lg transition-colors font-medium">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Admin Login
            </button>
          </SignInButton>
        )
      )}
    </header>

    {showHistory && <HistoryModal onClose={() => setShowHistory(false)} />}
    </>
  );
}
