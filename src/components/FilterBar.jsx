import { useMemo } from 'react';
import { clsx } from 'clsx';

export default function FilterBar({ customers, filters, onChange }) {
  const opts = useMemo(() => {
    const uniq = key => [...new Set(customers.map(c => c[key]).filter(Boolean))].sort();
    return {
      state: uniq('state'),
      city:  uniq('city'),
      activationStatus: ['Fully Activated', 'Highly Activated', 'Moderately Activated', 'Low Activation', 'Not Activated'],
      paStatus: ['Very Active', 'Active', 'Average', 'Dormant', 'Very Dormant'],
    };
  }, [customers]);

  const hasActive = Object.values(filters).some(Boolean);

  const Sel = ({ field, label }) => (
    <select
      value={filters[field]}
      onChange={e => onChange({ ...filters, [field]: e.target.value })}
      className={clsx(
        'text-xs border rounded-lg px-2.5 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 cursor-pointer transition-colors',
        filters[field]
          ? 'border-indigo-400 bg-indigo-50 text-indigo-700 font-medium'
          : 'border-gray-200 hover:border-gray-300'
      )}
    >
      <option value="">{label}</option>
      {opts[field].map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <Sel field="state"            label="All States"   />
      <Sel field="city"             label="All Cities"   />
      <Sel field="activationStatus" label="All Statuses" />
      <Sel field="paStatus"         label="PA Status"    />
      {hasActive && (
        <button
          onClick={() => onChange({ state: '', city: '', activationStatus: '', paStatus: '' })}
          className="text-xs text-indigo-600 hover:text-indigo-800 font-medium underline"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
