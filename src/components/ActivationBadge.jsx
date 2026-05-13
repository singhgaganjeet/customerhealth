import { clsx } from 'clsx';

export default function ActivationBadge({ status, size = 'sm' }) {
  if (!status) return null;
  const sizeClass = size === 'lg'
    ? 'text-sm px-3 py-1.5 font-semibold'
    : 'text-xs px-2.5 py-1 font-medium';
  return (
    <span className={clsx(
      'inline-flex items-center gap-1.5 rounded-full border whitespace-nowrap',
      status.bgColor, status.textColor, status.borderColor, sizeClass
    )}>
      <span className={clsx('w-2 h-2 rounded-full shrink-0', status.dotColor)} />
      {status.label}
    </span>
  );
}
