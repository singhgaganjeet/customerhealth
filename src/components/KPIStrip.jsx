import { clsx } from 'clsx';

const CARDS = [
  { label: 'Total Customers', key: 'total',    bg: 'bg-slate-800',  text: 'text-white',       border: 'border-slate-700', dot: null },
  { label: 'Fully Activated',      key: 'fully',    bg: 'bg-[#f2fde8]',  text: 'text-[#3a7a1a]',   border: 'border-[#7ed957]', dot: 'bg-[#7ed957]' },
  { label: 'Highly Activated',     key: 'highly',   bg: 'bg-green-50',   text: 'text-green-700',   border: 'border-green-200', dot: 'bg-green-500' },
  { label: 'Moderately Activated', key: 'moderate', bg: 'bg-yellow-50',  text: 'text-yellow-700',  border: 'border-yellow-200', dot: 'bg-yellow-500' },
  { label: 'Low Activation',       key: 'low',      bg: 'bg-red-50',     text: 'text-red-700',     border: 'border-red-200',   dot: 'bg-red-500' },
  { label: 'Not Activated',        key: 'none',     bg: 'bg-gray-50',    text: 'text-gray-600',    border: 'border-gray-200',  dot: 'bg-gray-400' },
];

export default function KPIStrip({ customers }) {
  const counts = {
    total:    customers.length,
    fully:    customers.filter(c => c.activationScore >= 80).length,
    highly:   customers.filter(c => c.activationScore >= 60 && c.activationScore < 80).length,
    moderate: customers.filter(c => c.activationScore >= 40 && c.activationScore < 60).length,
    low:      customers.filter(c => c.activationScore >= 20 && c.activationScore < 40).length,
    none:     customers.filter(c => c.activationScore < 20).length,
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {CARDS.map(card => (
        <div key={card.key} className={clsx('rounded-xl border px-4 py-3 flex flex-col gap-1.5', card.bg, card.border)}>
          <div className={clsx('text-3xl font-bold tabular-nums', card.text)}>{counts[card.key]}</div>
          <div className="flex items-center gap-1.5">
            {card.dot && <span className={clsx('w-2 h-2 rounded-full shrink-0', card.dot)} />}
            <span className={clsx('text-xs leading-snug', card.text)}>{card.label}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
