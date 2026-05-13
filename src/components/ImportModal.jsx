import { useRef, useState } from 'react';
import { clsx } from 'clsx';
import { useData } from '../context/DataContext';
import { downloadCSVTemplate } from '../lib/csvParser';

function todayFormatted() {
  return new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function ImportModal({ onClose }) {
  const { importCSV, importing, importError, setImportError } = useData();
  const fileRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState(null);
  const [asOfDate, setAsOfDate] = useState(todayFormatted());
  const [dateError, setDateError] = useState('');

  function handleFile(f) {
    if (!f) return;
    if (!f.name.endsWith('.csv')) { setImportError('Please select a .csv file'); return; }
    setFile(f);
    setImportError(null);
  }

  async function handleImport() {
    if (!file || importing) return;
    if (!asOfDate.trim()) { setDateError('Data As Of date is required'); return; }
    setDateError('');
    const ok = await importCSV(file, asOfDate.trim());
    if (ok) onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-slate-800">Import Activation Data</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-2xl leading-none">&times;</button>
        </div>

        <div className="px-6 py-5 space-y-4">

          {/* Data As Of date */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-600">
              Data As Of Date <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={asOfDate}
              onChange={e => { setAsOfDate(e.target.value); setDateError(''); }}
              placeholder="13 May 2026"
              className={clsx(
                'text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 w-full',
                dateError ? 'border-red-400 bg-red-50' : 'border-gray-200'
              )}
            />
            {dateError
              ? <span className="text-[10px] text-red-500">{dateError}</span>
              : <span className="text-[10px] text-slate-400">The date the data was exported from your backend (DD MMM YYYY). All PA recency scores are calculated relative to this date.</span>
            }
          </div>

          {/* File drop zone */}
          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
            onClick={() => fileRef.current?.click()}
            className={clsx(
              'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors',
              dragOver
                ? 'border-indigo-400 bg-indigo-50'
                : file
                  ? 'border-[#7ed957] bg-[#f2fde8]'
                  : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/40'
            )}
          >
            <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={e => handleFile(e.target.files[0])} />
            <div className="text-3xl mb-2">{file ? '✅' : '📄'}</div>
            {file ? (
              <div>
                <div className="text-sm font-semibold text-slate-700">{file.name}</div>
                <div className="text-xs text-slate-400 mt-1">{(file.size / 1024).toFixed(1)} KB · Click to change</div>
              </div>
            ) : (
              <div>
                <div className="text-sm font-medium text-slate-600">Drop your CSV here or click to browse</div>
                <div className="text-xs text-slate-400 mt-1">Must follow the Hoopstr Activation template format</div>
              </div>
            )}
          </div>

          {importError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-xs text-red-700 whitespace-pre-wrap font-mono leading-relaxed max-h-36 overflow-y-auto">
              {importError}
            </div>
          )}

          <button
            onClick={downloadCSVTemplate}
            className="text-xs text-indigo-600 hover:text-indigo-800 underline"
          >
            Download blank CSV template
          </button>
        </div>

        <div className="flex gap-3 px-6 pb-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 text-sm border border-gray-200 rounded-xl text-slate-600 hover:bg-gray-50 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={!file || importing}
            className="flex-1 px-4 py-2.5 text-sm bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-semibold"
          >
            {importing ? 'Importing…' : 'Import & Activate'}
          </button>
        </div>
      </div>
    </div>
  );
}
