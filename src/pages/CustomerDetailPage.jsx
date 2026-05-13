import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import Header from '../components/Header';
import ActivationGauge from '../components/ActivationGauge';
import ActivationBadge from '../components/ActivationBadge';
import PillarCard from '../components/PillarCard';
import ProductAdoptionDeepDive from '../components/ProductAdoptionDeepDive';
import AddCustomerModal from '../components/AddCustomerModal';
import ConfirmDialog from '../components/ConfirmDialog';
import { PILLARS } from '../lib/pillars';
import { clsx } from 'clsx';

function InfoChip({ label, value, highlight }) {
  return (
    <div className="flex flex-col">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{label}</span>
      <span className={clsx('text-sm font-medium mt-0.5', highlight || 'text-slate-200')}>{value}</span>
    </div>
  );
}

export default function CustomerDetailPage() {
  const { siteId } = useParams();
  const { customers, deleteCustomer } = useData();
  const navigate = useNavigate();
  const customer = customers.find(c => String(c.site_id) === String(siteId));
  const [showEdit, setShowEdit] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!customer) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <div className="text-5xl mb-3 text-slate-300">?</div>
        <p className="text-slate-500 mb-4">Customer not found</p>
        <Link to="/" className="text-indigo-600 hover:underline text-sm">Back to Dashboard</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-6 space-y-5">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowEdit(true)}
              className="flex items-center gap-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-1.5 text-xs bg-white border border-red-200 text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete
            </button>
          </div>
        </div>

        {/* Customer hero */}
        <div className="bg-slate-900 rounded-2xl p-6 text-white">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold leading-tight">{customer.customer}</h1>
              <div className="flex flex-wrap gap-5 mt-3">
                <InfoChip label="Code" value={customer.code} />
                <InfoChip label="City" value={`${customer.city}, ${customer.state}`} />
                <InfoChip label="PA Status" value={customer.pa_status || '—'} />
                <InfoChip label="Signup" value={customer.signup_date || '—'} />
                <InfoChip label="Data As Of" value={customer.as_of_date || '—'} />
              </div>
            </div>
            <ActivationBadge status={customer.activationStatus} size="lg" />
          </div>
        </div>

        {/* Score + Pillars grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
          <div className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col items-center justify-center gap-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Activation Score</h2>
            <ActivationGauge score={customer.activationScore} status={customer.activationStatus} size={176} />
            <ActivationBadge status={customer.activationStatus} size="lg" />
            <p className="text-xs text-slate-400 text-center">
              {customer.pillarsActivated} of 10 pillars activated
            </p>
          </div>

          <div className="lg:col-span-3 bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-sm font-semibold text-slate-700 mb-4">Activation Pillars</h2>
            <div className="grid grid-cols-2 gap-2.5">
              {PILLARS.map(p => (
                <PillarCard
                  key={p.key}
                  pillar={p}
                  activation={customer.pillarActivations[p.key]}
                  onClick={() => navigate(`/pillar/${p.key}`)}
                />
              ))}
            </div>
          </div>
        </div>

        <ProductAdoptionDeepDive customer={customer} />
      </main>

      {showEdit && (
        <AddCustomerModal editCustomer={customer} onClose={() => setShowEdit(false)} />
      )}

      {showDeleteConfirm && (
        <ConfirmDialog
          title="Delete Customer"
          message={`Remove "${customer.customer}" permanently? This cannot be undone.`}
          confirmLabel="Delete"
          danger
          onConfirm={() => { deleteCustomer(customer.site_id); navigate('/'); }}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
    </div>
  );
}
