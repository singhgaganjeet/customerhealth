import { useState } from 'react';
import { clsx } from 'clsx';
import CustomerListModal from './CustomerListModal';

const PA_TIERS = [
  { label: 'Very Active',  key: 'Very Active',  bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-200',  dot: 'bg-green-500'  },
  { label: 'Active',       key: 'Active',        bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200',   dot: 'bg-blue-500'   },
  { label: 'Average',      key: 'Average',       bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', dot: 'bg-yellow-500' },
  { label: 'Dormant',      key: 'Dormant',       bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', dot: 'bg-orange-400' },
  { label: 'Very Dormant', key: 'Very Dormant',  bg: 'bg-red-50',    text: 'text-red-700',    border: 'border-red-200',    dot: 'bg-red-500'    },
];

const MODULES = [
  { label: 'ALP',             fn: c => { const v = String(c.alp || '').trim(); return v !== '' && v.toLowerCase() !== 'no'; } },
  { label: 'Ascend Elite',    fn: c => c.ascend_elite === 'Yes' },
  { label: 'Group Insurance', fn: c => c.group_insurance === 'Yes' },
  { label: 'Hoopstr Live',    fn: c => c.hoopstr_live === 'Yes' },
  { label: 'Affinity',        fn: c => c.hoopstr_affinity === 'Yes' },
  { label: 'Vanguard',        fn: c => c.vanguard === 'Yes' },
  { label: 'Magic AI',        fn: c => c.magic_ai === 'Yes' },
  { label: 'Campus Visit',    fn: c => c.campus_visited === 'Yes' },
  { label: 'Demo Done',       fn: c => !!(c.last_demo_date && String(c.last_demo_date).trim()) },
];

function StatCard({ label, count, total, bg, text, border, dot, onClick }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <button
      onClick={onClick}
      className={clsx('rounded-xl border px-3 py-2.5 flex flex-col gap-1 text-left transition-opacity hover:opacity-80 active:opacity-70 cursor-pointer w-full', bg, border)}
    >
      <div className={clsx('text-2xl font-bold tabular-nums leading-none', text)}>{count}</div>
      <div className="flex items-center gap-1.5">
        {dot && <span className={clsx('w-1.5 h-1.5 rounded-full shrink-0', dot)} />}
        <span className={clsx('text-[11px] leading-snug font-medium', text)}>{label}</span>
      </div>
      <div className={clsx('text-[10px]', text, 'opacity-60')}>{pct}% of total</div>
    </button>
  );
}

function ModuleCard({ label, count, total, onClick }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <button
      onClick={onClick}
      className="rounded-xl border border-indigo-100 bg-indigo-50 px-3 py-2.5 flex flex-col gap-1 text-left transition-opacity hover:opacity-80 active:opacity-70 cursor-pointer w-full"
    >
      <div className="text-2xl font-bold tabular-nums leading-none text-indigo-700">{count}</div>
      <div className="text-[11px] font-medium text-indigo-700 leading-snug">{label}</div>
      <div className="text-[10px] text-indigo-400">{pct}% of total</div>
    </button>
  );
}

export default function StatsStrip({ customers }) {
  const [modal, setModal] = useState(null);
  const total = customers.length;

  return (
    <>
      <div className="space-y-3">
        {/* PA Status */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Product Adoption Status</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            {PA_TIERS.map(t => {
              const subset = customers.filter(c => c.pa_status === t.key);
              return (
                <StatCard
                  key={t.key}
                  label={t.label}
                  count={subset.length}
                  total={total}
                  bg={t.bg}
                  text={t.text}
                  border={t.border}
                  dot={t.dot}
                  onClick={() => setModal({ title: `PA Status — ${t.label}`, customers: subset })}
                />
              );
            })}
          </div>
        </div>

        {/* Module adoption */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Module Adoption</p>
          <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-2">
            {MODULES.map(m => {
              const subset = customers.filter(m.fn);
              return (
                <ModuleCard
                  key={m.label}
                  label={m.label}
                  count={subset.length}
                  total={total}
                  onClick={() => setModal({ title: m.label, customers: subset })}
                />
              );
            })}
          </div>
        </div>
      </div>

      {modal && (
        <CustomerListModal
          title={modal.title}
          customers={modal.customers}
          onClose={() => setModal(null)}
        />
      )}
    </>
  );
}
