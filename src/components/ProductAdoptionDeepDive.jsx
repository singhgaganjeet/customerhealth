import { clsx } from 'clsx';
import { getPABreakdown, getPAStatusStyle } from '../lib/scoring';

// Each indicator maps a breakdown field to a display row
const INDICATORS = [
  {
    key: 'dbUnreg', label: 'Unregistered DB %', group: 'Database', max: 5,
    getValue: b => `${b.unregPct}%`,
    getScore: b => { const p = b.unregPct; return p > 90 ? 0 : p > 75 ? 1 : p > 50 ? 2 : p > 25 ? 3 : p > 10 ? 4 : 5; },
  },
  {
    key: 'dbPend', label: 'Pending Approval', group: 'Database', max: 5,
    getValue: b => b.pendApp,
    getScore: b => b.pendApp > 10 ? 0 : 5,
  },
  {
    key: 'efEvents', label: 'Events Posted %', group: 'Engagement', max: 5,
    getValue: b => `${b.evPct}%  (ideal: ${b.idealEvents})`,
    getScore: b => { const p = b.evPct; return p >= 85 ? 5 : p > 70 ? 4 : p > 50 ? 3 : p > 25 ? 2 : p > 10 ? 1 : 0; },
  },
  {
    key: 'efNews', label: 'News Posted %', group: 'Engagement', max: 5,
    getValue: b => `${b.nwPct}%  (ideal: ${b.idealNews})`,
    getScore: b => { const p = b.nwPct; return p >= 85 ? 5 : p > 70 ? 4 : p > 50 ? 3 : p > 25 ? 2 : p > 10 ? 1 : 0; },
  },
  {
    key: 'efChap', label: 'Chapters', group: 'Engagement', max: 5,
    getValue: b => b.chapters,
    getScore: b => b.chapters > 0 ? 5 : 0,
  },
  {
    key: 'efSigs', label: 'Special Interest Groups', group: 'Engagement', max: 5,
    getValue: b => b.sigs,
    getScore: b => b.sigs > 0 ? 5 : 0,
  },
  {
    key: 'recMailer', label: 'Last Mass Mailer', group: 'Recency', max: 5,
    getValue: b => b.mailerDays != null ? `${b.mailerDays} days ago` : 'Never sent',
    getScore: b => { const d = b.mailerDays; if (d == null) return 0; return d <= 31 ? 5 : d < 45 ? 4 : d < 60 ? 3 : d < 90 ? 2 : d < 120 ? 1 : 0; },
  },
  {
    key: 'recEvent', label: 'Last Event Posted', group: 'Recency', max: 5,
    getValue: b => b.eventDays != null ? `${b.eventDays} days ago` : 'Never posted',
    getScore: b => { const d = b.eventDays; if (d == null) return 0; return d <= 90 ? 5 : d < 120 ? 4 : d < 150 ? 3 : d < 180 ? 2 : d < 210 ? 1 : 0; },
  },
  {
    key: 'recNews', label: 'Last News Posted', group: 'Recency', max: 5,
    getValue: b => b.newsDays != null ? `${b.newsDays} days ago` : 'Never posted',
    getScore: b => { const d = b.newsDays; if (d == null) return 0; return d <= 15 ? 5 : d < 30 ? 4 : d < 45 ? 3 : d < 60 ? 2 : d < 75 ? 1 : 0; },
  },
  {
    key: 'recLogin', label: 'Admin Last Login', group: 'Recency', max: 5,
    getValue: b => b.loginDays != null ? `${b.loginDays} days ago` : 'Never logged in',
    getScore: b => { const d = b.loginDays; if (d == null) return 0; return d <= 30 ? 5 : d < 45 ? 4 : d < 60 ? 3 : d < 75 ? 2 : d < 90 ? 1 : 0; },
  },
];

const GROUP_MAX = { Database: 10, Engagement: 20, Recency: 20 };
const GROUPS = ['Database', 'Engagement', 'Recency'];

export default function ProductAdoptionDeepDive({ customer }) {
  const breakdown = getPABreakdown(customer);
  const pa = customer.pa_score || 0;
  const pct = (pa / 50) * 100;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-sm font-semibold text-slate-700">Product Adoption Deep Dive</h3>
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-slate-800 tabular-nums">
            {pa}<span className="text-sm font-normal text-slate-400">/50</span>
          </span>
          <span className={clsx('text-xs font-medium px-2.5 py-1 rounded-full', getPAStatusStyle(customer.pa_status))}>
            {customer.pa_status}
          </span>
        </div>
      </div>

      <div className="mt-3 mb-5">
        <div className="bg-gray-100 rounded-full h-2">
          <div className="bg-indigo-500 h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="space-y-5">
        {GROUPS.map(group => {
          const inds = INDICATORS.filter(i => i.group === group);
          const groupScore = inds.reduce((s, i) => s + i.getScore(breakdown), 0);
          return (
            <div key={group}>
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{group}</span>
                <span className="text-xs font-bold text-slate-600 tabular-nums">{groupScore}/{GROUP_MAX[group]}</span>
              </div>
              <div className="space-y-2">
                {inds.map(ind => {
                  const score = ind.getScore(breakdown);
                  const filled = (score / ind.max) * 100;
                  const barColor = filled >= 80 ? 'bg-green-500' : filled >= 60 ? 'bg-lime-500' : filled >= 40 ? 'bg-yellow-500' : filled >= 20 ? 'bg-orange-500' : 'bg-red-400';
                  return (
                    <div key={ind.key} className="flex items-center gap-3">
                      <span className="text-xs text-slate-500 w-44 shrink-0 truncate">{ind.label}</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-1.5 min-w-[60px]">
                        <div className={clsx('h-1.5 rounded-full', barColor)} style={{ width: `${filled}%` }} />
                      </div>
                      <span className="text-xs font-semibold text-slate-700 w-7 text-right tabular-nums">{score}/{ind.max}</span>
                      <span className="text-xs text-slate-400 w-36 text-right hidden sm:block truncate">{ind.getValue(breakdown)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
