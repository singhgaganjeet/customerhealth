import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../context/AuthContext';
import { clsx } from 'clsx';
import ActivationBadge from './ActivationBadge';
import AddCustomerModal from './AddCustomerModal';
import ConfirmDialog from './ConfirmDialog';
import { useData } from '../context/DataContext';
import { getPAStatusStyle, daysSince } from '../lib/scoring';

const COLS = [
  { key: 'customer',         label: 'Institution'        },
  { key: 'city',             label: 'City'               },
  { key: 'tenure',           label: 'Tenure',   sortKey: '_tenure' },
  { key: 'pa_status',        label: 'PA Status'          },
  { key: 'activationScore',  label: 'Score'              },
  { key: 'activationStatus', label: 'Activation Status'  },
  { key: 'pillarsActivated', label: 'Pillars'            },
];

const PER_PAGE = 15;

function ScoreBar({ score }) {
  const color = score >= 80 ? 'bg-[#7ed957]' : score >= 60 ? 'bg-green-500' : score >= 40 ? 'bg-yellow-500' : score >= 20 ? 'bg-red-500' : 'bg-gray-400';
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 bg-gray-100 rounded-full h-1.5 shrink-0">
        <div className={clsx('h-1.5 rounded-full transition-all', color)} style={{ width: `${score}%` }} />
      </div>
      <span className="text-sm font-semibold text-slate-700 tabular-nums">{score}</span>
    </div>
  );
}

function getTenure(customer) {
  if (!customer.signup_date) return null;
  const days = daysSince(customer.signup_date, customer.as_of_date || null);
  if (!isFinite(days)) return null;
  const yrs = Math.floor(days / 365);
  const mo  = Math.round((days % 365) / 30);
  return mo > 0 ? `${yrs}y ${mo}m` : `${yrs}y`;
}

export default function CustomerTable({ customers }) {
  const navigate = useNavigate();
  const { deleteCustomer } = useData();
  const { isSignedIn } = useAdmin();
  const [sortKey, setSortKey] = useState('activationScore');
  const [sortDir, setSortDir] = useState('desc');
  const [page,    setPage]    = useState(1);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [editingCustomer,  setEditingCustomer]  = useState(null);

  function handleSort(key) {
    if (key === sortKey) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
    setPage(1);
  }

  const sorted = [...customers].sort((a, b) => {
    let av, bv;
    if (sortKey === 'activationStatus') { av = a.activationStatus?.label; bv = b.activationStatus?.label; }
    else if (sortKey === '_tenure') { av = daysSince(a.signup_date, a.as_of_date || null) || 0; bv = daysSince(b.signup_date, b.as_of_date || null) || 0; }
    else { av = a[sortKey]; bv = b[sortKey]; }
    if (typeof av === 'string') av = av.toLowerCase();
    if (typeof bv === 'string') bv = bv.toLowerCase();
    if (av < bv) return sortDir === 'asc' ? -1 : 1;
    if (av > bv) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  const totalPages = Math.ceil(sorted.length / PER_PAGE);
  const rows = sorted.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const SortArrow = ({ col }) => {
    const active = (col.sortKey || col.key) === sortKey;
    return active
      ? <span className="ml-1 text-indigo-500">{sortDir === 'asc' ? '↑' : '↓'}</span>
      : <span className="ml-1 text-gray-300">↕</span>;
  };

  const confirmTarget = confirmDeleteId ? customers.find(c => String(c.site_id) === String(confirmDeleteId)) : null;

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-gray-200">
                {COLS.map(col => (
                  <th
                    key={col.key}
                    onClick={() => handleSort(col.sortKey || col.key)}
                    className="text-left text-xs font-semibold text-slate-500 px-4 py-3 whitespace-nowrap cursor-pointer hover:text-slate-700 select-none"
                  >
                    {col.label}<SortArrow col={col} />
                  </th>
                ))}
                {isSignedIn && <th className="px-4 py-3 w-16" />}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={isSignedIn ? 8 : 7} className="text-center text-slate-400 text-sm py-16">
                    No customers match the current filters
                  </td>
                </tr>
              ) : rows.map(c => (
                <tr
                  key={c.site_id}
                  onClick={() => navigate(`/customer/${c.site_id}`)}
                  className="border-b border-gray-100 hover:bg-indigo-50 cursor-pointer transition-colors group"
                >
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-800 group-hover:text-indigo-700 transition-colors">{c.customer}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{c.code} · {c.state}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{c.city || '—'}</td>
                  <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">{getTenure(c) || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={clsx('text-xs px-2 py-0.5 rounded font-medium', getPAStatusStyle(c.pa_status))}>
                      {c.pa_status || '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3 min-w-[130px]">
                    <ScoreBar score={c.activationScore} />
                  </td>
                  <td className="px-4 py-3">
                    <ActivationBadge status={c.activationStatus} />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-sm font-bold text-slate-700 tabular-nums">
                      {c.pillarsActivated}<span className="text-slate-400 font-normal text-xs">/10</span>
                    </span>
                  </td>
                  {isSignedIn && (
                    <td className="px-4 py-3">
                      <div
                        className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={e => e.stopPropagation()}
                      >
                        <button
                          onClick={() => setEditingCustomer(c)}
                          title="Edit"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(c.site_id)}
                          title="Delete"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-slate-50">
            <span className="text-xs text-slate-400">{sorted.length} customers · Page {page} of {totalPages}</span>
            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={clsx(
                    'w-7 h-7 text-xs rounded font-medium transition-colors',
                    p === page ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-gray-200'
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {confirmTarget && (
        <ConfirmDialog
          title="Delete Customer"
          message={`Remove "${confirmTarget.customer}" permanently? This cannot be undone.`}
          confirmLabel="Delete"
          danger
          onConfirm={() => { deleteCustomer(confirmDeleteId); setConfirmDeleteId(null); }}
          onCancel={() => setConfirmDeleteId(null)}
        />
      )}

      {editingCustomer && (
        <AddCustomerModal
          editCustomer={editingCustomer}
          onClose={() => setEditingCustomer(null)}
        />
      )}
    </>
  );
}
