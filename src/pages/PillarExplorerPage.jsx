import { useParams, useNavigate, Link } from 'react-router-dom';
import { clsx } from 'clsx';
import { useData } from '../context/DataContext';
import { PILLAR_MAP } from '../lib/pillars';
import Header from '../components/Header';
import { getPAStatusStyle } from '../lib/scoring';

function CustomerRow({ customer, navigate }) {
  return (
    <div
      onClick={() => navigate(`/customer/${customer.site_id}`)}
      className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 cursor-pointer transition-colors group"
    >
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-slate-700 group-hover:text-indigo-600 transition-colors truncate">
          {customer.customer}
        </div>
        <div className="text-xs text-slate-400 mt-0.5">{customer.city} · {customer.state}</div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className={clsx('text-xs px-2 py-0.5 rounded font-medium', getPAStatusStyle(customer.pa_status))}>
          {customer.pa_status}
        </span>
        <span className="text-xs font-bold text-slate-600 tabular-nums w-6 text-right">{customer.activationScore}</span>
        <svg className="w-3.5 h-3.5 text-gray-300 group-hover:text-indigo-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </div>
  );
}

function exportPillarCSV(pillarKey, customers) {
  const rows = customers.map(c => ({
    site_id: c.site_id, customer: c.customer, city: c.city, state: c.state, plan: c.plan,
    activated: c.pillarActivations[pillarKey]?.activated ? 'Yes' : 'No',
    activation_detail: c.pillarActivations[pillarKey]?.detail || '',
    activation_score: c.activationScore,
  }));
  const headers = Object.keys(rows[0]);
  const csv = [headers.join(','), ...rows.map(r => headers.map(h => `"${r[h] ?? ''}"`).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `${pillarKey}_explorer.csv`; a.click();
  URL.revokeObjectURL(url);
}

export default function PillarExplorerPage() {
  const { pillarKey } = useParams();
  const { customers } = useData();
  const navigate = useNavigate();
  const pillar = PILLAR_MAP[pillarKey];

  if (!pillar) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <p className="text-slate-500 mb-4">Pillar not found</p>
        <Link to="/" className="text-indigo-600 hover:underline text-sm">Back to Dashboard</Link>
      </div>
    </div>
  );

  const activated = customers.filter(c => c.pillarActivations[pillarKey]?.activated).sort((a, b) => b.activationScore - a.activationScore);
  const notActivated = customers.filter(c => !c.pillarActivations[pillarKey]?.activated).sort((a, b) => b.activationScore - a.activationScore);
  const rate = customers.length > 0 ? Math.round((activated.length / customers.length) * 100) : 0;

  const rateColor = rate >= 80 ? 'text-green-600' : rate >= 60 ? 'text-lime-600' : rate >= 40 ? 'text-yellow-600' : rate >= 20 ? 'text-orange-600' : 'text-red-600';

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-6 space-y-5">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-700 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        {/* Pillar header */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-xs font-semibold text-indigo-600 uppercase tracking-wide mb-1">Pillar Explorer</div>
              <h1 className="text-xl font-bold text-slate-800">{pillar.label}</h1>
              <p className="text-sm text-slate-500 mt-1 max-w-lg">{pillar.description}</p>
            </div>
            <div className="flex items-center flex-wrap gap-4">
              <div className="text-center">
                <div className={clsx('text-3xl sm:text-4xl font-bold tabular-nums', rateColor)}>{rate}%</div>
                <div className="text-xs text-slate-400 mt-0.5">Activation Rate</div>
              </div>
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-slate-700 tabular-nums">{activated.length}</div>
                <div className="text-xs text-slate-400 mt-0.5">Activated</div>
              </div>
              <button
                onClick={() => exportPillarCSV(pillarKey, customers)}
                className="flex items-center gap-1.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-lg transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export CSV
              </button>
            </div>
          </div>
        </div>

        {/* Split view */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-white rounded-xl border border-green-200 overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 bg-green-50 border-b border-green-100">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-sm font-semibold text-green-800">Activated</span>
              <span className="ml-auto text-xs font-bold text-green-700 tabular-nums">{activated.length} customers</span>
            </div>
            <div className="overflow-y-auto max-h-[560px]">
              {activated.length === 0
                ? <p className="text-center text-slate-400 text-sm py-10">No customers activated on this pillar</p>
                : activated.map(c => <CustomerRow key={c.site_id} customer={c} navigate={navigate} />)
              }
            </div>
          </div>

          <div className="bg-white rounded-xl border border-red-200 overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border-b border-red-100">
              <span className="w-2 h-2 rounded-full bg-red-400" />
              <span className="text-sm font-semibold text-red-800">Not Activated</span>
              <span className="ml-auto text-xs font-bold text-red-700 tabular-nums">{notActivated.length} customers</span>
            </div>
            <div className="overflow-y-auto max-h-[560px]">
              {notActivated.length === 0
                ? <p className="text-center text-slate-400 text-sm py-10">All customers activated on this pillar!</p>
                : notActivated.map(c => <CustomerRow key={c.site_id} customer={c} navigate={navigate} />)
              }
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
