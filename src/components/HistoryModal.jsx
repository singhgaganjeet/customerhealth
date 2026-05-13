import { clsx } from 'clsx';
import { useData } from '../context/DataContext';

const ACTION_META = {
  added:    { label: 'Added',    bg: 'bg-[#f2fde8]',  text: 'text-[#3a7a1a]',  dot: 'bg-[#7ed957]' },
  edited:   { label: 'Edited',   bg: 'bg-blue-50',    text: 'text-blue-700',   dot: 'bg-blue-500'  },
  deleted:  { label: 'Deleted',  bg: 'bg-red-50',     text: 'text-red-700',    dot: 'bg-red-500'   },
  imported: { label: 'Imported', bg: 'bg-indigo-50',  text: 'text-indigo-700', dot: 'bg-indigo-500'},
  cleared:  { label: 'Cleared',  bg: 'bg-orange-50',  text: 'text-orange-700', dot: 'bg-orange-400'},
};

function formatTime(iso) {
  return new Date(iso).toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function EntryDescription({ entry }) {
  if (entry.action === 'imported') return (
    <span className="text-sm font-medium text-slate-700">
      {entry.count} customers imported
      {entry.fileName && <span className="text-slate-400 font-normal"> · {entry.fileName}</span>}
    </span>
  );
  if (entry.action === 'cleared') return (
    <span className="text-sm font-medium text-slate-700">All data cleared ({entry.count} customers removed)</span>
  );
  return <span className="text-sm font-medium text-slate-700">{entry.customerName || '—'}</span>;
}

export default function HistoryModal({ onClose }) {
  const { history, clearHistory } = useData();

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col">

        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-base font-semibold text-slate-800">Change History</h2>
            <p className="text-[11px] text-slate-400 mt-0.5">{history.length} event{history.length !== 1 ? 's' : ''}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-2xl leading-none">&times;</button>
        </div>

        <div className="overflow-y-auto px-6 py-4 flex-1">
          {history.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-3xl text-slate-200 mb-3">◷</div>
              <p className="text-sm text-slate-400">No changes recorded yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map(entry => {
                const meta = ACTION_META[entry.action] || ACTION_META.edited;
                return (
                  <div key={entry.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={clsx('w-2.5 h-2.5 rounded-full shrink-0 mt-1.5', meta.dot)} />
                      <div className="w-px flex-1 bg-gray-100 mt-1" />
                    </div>
                    <div className="flex-1 pb-3 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <span className={clsx('text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide', meta.bg, meta.text)}>
                          {meta.label}
                        </span>
                        <EntryDescription entry={entry} />
                      </div>
                      {entry.action === 'edited' && entry.changes?.length > 0 && (
                        <div className="mt-1.5 bg-slate-50 rounded-lg px-3 py-2 space-y-1">
                          {entry.changes.map((ch, i) => (
                            <div key={i} className="text-xs text-slate-500 flex gap-1.5 flex-wrap">
                              <span className="font-semibold text-slate-600 shrink-0">{ch.field}:</span>
                              <span className="line-through text-slate-400">{ch.before || '—'}</span>
                              <span className="text-slate-400">→</span>
                              <span className="text-slate-700">{ch.after || '—'}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {entry.action === 'edited' && (!entry.changes || entry.changes.length === 0) && (
                        <p className="text-xs text-slate-400 mt-0.5">Saved with no field changes</p>
                      )}
                      <p className="text-[10px] text-slate-400 mt-1">{formatTime(entry.timestamp)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex gap-3 px-6 pb-6 pt-4 border-t border-gray-100 shrink-0">
          {history.length > 0 && (
            <button
              onClick={clearHistory}
              className="text-xs text-red-500 hover:text-red-700 font-medium transition-colors"
            >
              Clear history
            </button>
          )}
          <div className="flex-1" />
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm border border-gray-200 rounded-xl text-slate-600 hover:bg-gray-50 font-medium transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
