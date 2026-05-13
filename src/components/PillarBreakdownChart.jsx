import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { PILLARS } from '../lib/pillars';

function barColor(pct) {
  if (pct >= 80) return '#16a34a';
  if (pct >= 60) return '#65a30d';
  if (pct >= 40) return '#ca8a04';
  if (pct >= 20) return '#ea580c';
  return '#dc2626';
}

function TooltipContent({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2 text-xs">
      <div className="font-semibold text-slate-800 mb-1">{d.fullLabel}</div>
      <div className="text-slate-500">{d.activated} of {d.total} activated</div>
      <div className="font-bold text-slate-800 mt-0.5">{d.pct}%</div>
      <div className="text-indigo-500 mt-1">Click to explore →</div>
    </div>
  );
}

export default function PillarBreakdownChart({ customers }) {
  const navigate = useNavigate();

  const data = PILLARS.map(p => {
    const activated = customers.filter(c => c.pillarActivations[p.key]?.activated).length;
    const pct = customers.length > 0 ? Math.round((activated / customers.length) * 100) : 0;
    return { key: p.key, name: p.shortLabel, fullLabel: p.label, pct, activated, total: customers.length };
  }).sort((a, b) => b.pct - a.pct);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-slate-700">Pillar Activation Rates</h2>
        <span className="text-xs text-slate-400">Click a bar to explore</span>
      </div>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 0, right: 52, left: 70, bottom: 0 }}
          onClick={e => e?.activePayload?.[0] && navigate(`/pillar/${e.activePayload[0].payload.key}`)}
          style={{ cursor: 'pointer' }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
          <XAxis type="number" domain={[0, 100]} tickFormatter={v => `${v}%`} tick={{ fontSize: 10, fill: '#94a3b8' }} />
          <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#475569' }} width={68} />
          <Tooltip content={<TooltipContent />} cursor={{ fill: '#f8fafc' }} />
          <Bar dataKey="pct" radius={[0, 4, 4, 0]}
            label={{ position: 'right', formatter: v => `${v}%`, fontSize: 10, fill: '#64748b' }}
          >
            {data.map(entry => <Cell key={entry.key} fill={barColor(entry.pct)} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
