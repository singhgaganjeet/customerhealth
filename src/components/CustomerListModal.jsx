import { useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';
import { getPAStatusStyle } from '../lib/scoring';
import ActivationBadge from './ActivationBadge';

export default function CustomerListModal({ title, customers, onClose }) {
  const navigate = useNavigate();
  const sorted = [...customers].sort((a, b) => b.activationScore - a.activationScore);

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-2xl max-h-[85vh] rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col">

        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-base font-semibold text-slate-800">{title}</h2>
            <p className="text-xs text-slate-400 mt-0.5">{sorted.length} customer{sorted.length !== 1 ? 's' : ''}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-2xl leading-none">&times;</button>
        </div>

        <div className="overflow-y-auto flex-1">
          {sorted.length === 0 ? (
            <div className="text-center py-16 text-slate-400 text-sm">No customers in this category</div>
          ) : sorted.map(c => (
            <div
              key={c.site_id}
              onClick={() => { onClose(); navigate(`/customer/${c.site_id}`); }}
              className="flex items-center gap-3 px-5 py-3 border-b border-gray-100 last:border-0 hover:bg-indigo-50 cursor-pointer transition-colors group"
            >
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-slate-800 group-hover:text-indigo-700 truncate transition-colors">
                  {c.customer}
                </div>
                <div className="text-xs text-slate-400 mt-0.5">{c.code} · {c.city}, {c.state}</div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={clsx('text-xs px-2 py-0.5 rounded font-medium hidden sm:inline', getPAStatusStyle(c.pa_status))}>
                  {c.pa_status}
                </span>
                <span className="text-sm font-bold text-slate-700 tabular-nums w-7 text-right">{c.activationScore}</span>
                <div className="hidden sm:block">
                  <ActivationBadge status={c.activationStatus} />
                </div>
                <svg className="w-4 h-4 text-gray-300 group-hover:text-indigo-400 transition-colors shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          ))}
        </div>

        <div className="px-5 py-4 border-t border-gray-100 shrink-0">
          <button
            onClick={onClose}
            className="w-full py-2.5 text-sm border border-gray-200 rounded-xl text-slate-600 hover:bg-gray-50 font-medium transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
