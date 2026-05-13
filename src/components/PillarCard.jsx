import { clsx } from 'clsx';

export default function PillarCard({ pillar, activation, onClick }) {
  const { activated, detail } = activation || {};
  return (
    <div
      onClick={onClick}
      title={`Click to explore ${pillar.label}`}
      className={clsx(
        'rounded-xl border p-3.5 cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5',
        activated
          ? 'bg-green-50 border-green-200 hover:border-green-400'
          : 'bg-gray-50 border-gray-200 hover:border-gray-300'
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="text-xs font-semibold text-slate-700 leading-snug">{pillar.label}</span>
        <span className={clsx(
          'shrink-0 text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center',
          activated ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
        )}>
          {activated ? '✓' : '✗'}
        </span>
      </div>
      <p className="text-[11px] text-slate-500 leading-snug mb-2">{detail}</p>
      <div className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">{pillar.weight} pts</div>
    </div>
  );
}
