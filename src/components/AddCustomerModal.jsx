import { useState } from 'react';
import { clsx } from 'clsx';
import { useData } from '../context/DataContext';
import { enrichCustomer } from '../lib/scoring';

const BLANK = {
  code: '', customer: '', city: '', state: '', signup_date: '',
  registered_db: '', unregistered_db: '', pend_app: '',
  events: '', last_event_date: '', news: '', last_news_date: '',
  chapters: '', sigs: '',
  last_login_date: '', last_mailer_date: '',
  alp: 'No',
  ascend_elite: 'No', group_insurance: 'No',
  hoopstr_live: 'No', hoopstr_affinity: 'No',
  vanguard: 'No', magic_ai: 'No',
  campus_visited: 'No', campus_visit_date: '', last_demo_date: '',
};

function Field({ label, required, children, hint }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-slate-600">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {hint && <span className="text-[10px] text-slate-400">{hint}</span>}
    </div>
  );
}

const inputCls = (err) => clsx(
  'text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 w-full',
  err ? 'border-red-400 bg-red-50' : 'border-gray-200'
);

const selectCls = 'text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 w-full bg-white';

function Toggle({ value, onChange }) {
  return (
    <div className="flex rounded-lg overflow-hidden border border-gray-200 text-xs font-medium w-fit">
      {['No', 'Yes'].map(opt => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={clsx(
            'px-4 py-2 transition-colors',
            value === opt
              ? opt === 'Yes' ? 'bg-green-600 text-white' : 'bg-slate-700 text-white'
              : 'text-slate-500 hover:bg-gray-50'
          )}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
        <span>{title}</span>
        <div className="flex-1 h-px bg-gray-100" />
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-3">{children}</div>
    </div>
  );
}

function validate(form) {
  const errs = {};
  if (!form.customer.trim())   errs.customer = 'Required';
  if (!form.code.trim())       errs.code = 'Required';
  if (!form.city.trim())       errs.city = 'Required';
  if (!form.state.trim())      errs.state = 'Required';
  if (!form.signup_date.trim()) errs.signup_date = 'Required';
  if (!form.registered_db)     errs.registered_db = 'Required';
  if (!form.unregistered_db)   errs.unregistered_db = 'Required';
  if (!form.events && form.events !== '0') errs.events = 'Required';
  if (!form.news && form.news !== '0')     errs.news = 'Required';
  if (form.campus_visited === 'Yes' && !form.campus_visit_date.trim())
    errs.campus_visit_date = 'Required when campus visited';
  return errs;
}

export default function AddCustomerModal({ onClose, editCustomer }) {
  const { customers, addCustomer, updateCustomer } = useData();
  const isEdit = !!editCustomer;
  const [form, setForm] = useState(isEdit ? { ...BLANK, ...editCustomer } : { ...BLANK });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  function set(key, val) {
    setForm(f => ({ ...f, [key]: val }));
    if (submitted) setErrors(e => ({ ...e, [key]: undefined }));
  }

  function handleSubmit() {
    setSubmitted(true);
    const errs = validate(form);
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    const site_id = isEdit ? editCustomer.site_id : String(Date.now());
    const enriched = enrichCustomer({ ...form, site_id });
    if (isEdit) updateCustomer(enriched);
    else addCustomer(enriched);
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">

        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <h2 className="text-base font-semibold text-slate-800">
            {isEdit ? `Edit — ${editCustomer.customer}` : 'Add Customer Manually'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-2xl leading-none">&times;</button>
        </div>

        <div className="overflow-y-auto px-6 py-5 space-y-6">

          <Section title="Basic Information">
            <Field label="Code" required>
              <input value={form.code} onChange={e => set('code', e.target.value)}
                className={inputCls(errors.code)} placeholder="e.g. IIMB" />
              {errors.code && <span className="text-[10px] text-red-500">{errors.code}</span>}
            </Field>
            <Field label="Institution Name" required>
              <input value={form.customer} onChange={e => set('customer', e.target.value)}
                className={inputCls(errors.customer)} placeholder="e.g. IIM Bangalore" />
              {errors.customer && <span className="text-[10px] text-red-500">{errors.customer}</span>}
            </Field>
            <Field label="Signup Date" required hint="Format: DD MMM YYYY or YYYY-MM-DD">
              <input value={form.signup_date} onChange={e => set('signup_date', e.target.value)}
                className={inputCls(errors.signup_date)} placeholder="13 May 2022" />
              {errors.signup_date && <span className="text-[10px] text-red-500">{errors.signup_date}</span>}
            </Field>
            <Field label="City" required>
              <input value={form.city} onChange={e => set('city', e.target.value)}
                className={inputCls(errors.city)} placeholder="e.g. Bengaluru" />
              {errors.city && <span className="text-[10px] text-red-500">{errors.city}</span>}
            </Field>
            <Field label="State" required>
              <input value={form.state} onChange={e => set('state', e.target.value)}
                className={inputCls(errors.state)} placeholder="e.g. Karnataka" />
              {errors.state && <span className="text-[10px] text-red-500">{errors.state}</span>}
            </Field>
          </Section>

          <Section title="Database">
            <Field label="Registered Members" required>
              <input type="number" min="0" value={form.registered_db} onChange={e => set('registered_db', e.target.value)}
                className={inputCls(errors.registered_db)} placeholder="0" />
              {errors.registered_db && <span className="text-[10px] text-red-500">{errors.registered_db}</span>}
            </Field>
            <Field label="Unregistered Members" required>
              <input type="number" min="0" value={form.unregistered_db} onChange={e => set('unregistered_db', e.target.value)}
                className={inputCls(errors.unregistered_db)} placeholder="0" />
              {errors.unregistered_db && <span className="text-[10px] text-red-500">{errors.unregistered_db}</span>}
            </Field>
            <Field label="Pending Approval">
              <input type="number" min="0" value={form.pend_app} onChange={e => set('pend_app', e.target.value)}
                className={inputCls()} placeholder="0" />
            </Field>
          </Section>

          <Section title="Engagement">
            <Field label="Total Events" required>
              <input type="number" min="0" value={form.events} onChange={e => set('events', e.target.value)}
                className={inputCls(errors.events)} placeholder="0" />
              {errors.events && <span className="text-[10px] text-red-500">{errors.events}</span>}
            </Field>
            <Field label="Last Event Date" hint="DD MMM YYYY">
              <input value={form.last_event_date} onChange={e => set('last_event_date', e.target.value)}
                className={inputCls()} placeholder="01 Apr 2026" />
            </Field>
            <Field label="Total News Posts" required>
              <input type="number" min="0" value={form.news} onChange={e => set('news', e.target.value)}
                className={inputCls(errors.news)} placeholder="0" />
              {errors.news && <span className="text-[10px] text-red-500">{errors.news}</span>}
            </Field>
            <Field label="Last News Date" hint="DD MMM YYYY">
              <input value={form.last_news_date} onChange={e => set('last_news_date', e.target.value)}
                className={inputCls()} placeholder="01 Apr 2026" />
            </Field>
            <Field label="Chapters">
              <input type="number" min="0" value={form.chapters} onChange={e => set('chapters', e.target.value)}
                className={inputCls()} placeholder="0" />
            </Field>
            <Field label="SIGs">
              <input type="number" min="0" value={form.sigs} onChange={e => set('sigs', e.target.value)}
                className={inputCls()} placeholder="0" />
            </Field>
          </Section>

          <Section title="Recency">
            <Field label="Last Login Date" hint="DD MMM YYYY">
              <input value={form.last_login_date} onChange={e => set('last_login_date', e.target.value)}
                className={inputCls()} placeholder="01 May 2026" />
            </Field>
            <Field label="Last Mailer Date" hint="DD MMM YYYY">
              <input value={form.last_mailer_date} onChange={e => set('last_mailer_date', e.target.value)}
                className={inputCls()} placeholder="15 Apr 2026" />
            </Field>
          </Section>

          <Section title="Activation Pillars">
            <Field label="ALP City">
              <select value={form.alp} onChange={e => set('alp', e.target.value)} className={selectCls}>
                <option value="No">Not Attended</option>
                <option value="MUM">Mumbai</option>
                <option value="PUN">Pune</option>
                <option value="BLR">Bengaluru</option>
                <option value="DEL">Delhi</option>
                <option value="HYD">Hyderabad</option>
              </select>
            </Field>
            <Field label="Ascend Elite">
              <Toggle value={form.ascend_elite} onChange={v => set('ascend_elite', v)} />
            </Field>
            <Field label="Group Insurance">
              <Toggle value={form.group_insurance} onChange={v => set('group_insurance', v)} />
            </Field>
            <Field label="Hoopstr Live">
              <Toggle value={form.hoopstr_live} onChange={v => set('hoopstr_live', v)} />
            </Field>
            <Field label="Hoopstr Affinity">
              <Toggle value={form.hoopstr_affinity} onChange={v => set('hoopstr_affinity', v)} />
            </Field>
            <Field label="Vanguard">
              <Toggle value={form.vanguard} onChange={v => set('vanguard', v)} />
            </Field>
            <Field label="Magic AI">
              <Toggle value={form.magic_ai} onChange={v => set('magic_ai', v)} />
            </Field>
          </Section>

          <Section title="CS Activity">
            <Field label="Campus Visited">
              <Toggle value={form.campus_visited} onChange={v => set('campus_visited', v)} />
            </Field>
            <Field label="Campus Visit Date" hint={form.campus_visited === 'Yes' ? 'Required — DD MMM YYYY' : 'DD MMM YYYY'}>
              <input
                value={form.campus_visit_date}
                onChange={e => set('campus_visit_date', e.target.value)}
                className={inputCls(errors.campus_visit_date)}
                placeholder="10 Jan 2026"
                disabled={form.campus_visited !== 'Yes'}
              />
              {errors.campus_visit_date && <span className="text-[10px] text-red-500">{errors.campus_visit_date}</span>}
            </Field>
            <Field label="Last Upsell Demo Date" hint="DD MMM YYYY — leave blank if no demo yet">
              <input value={form.last_demo_date} onChange={e => set('last_demo_date', e.target.value)}
                className={inputCls()} placeholder="05 Apr 2026" />
            </Field>
          </Section>

        </div>

        <div className="flex gap-3 px-6 pb-6 pt-4 border-t border-gray-100 shrink-0">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 text-sm border border-gray-200 rounded-xl text-slate-600 hover:bg-gray-50 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 px-4 py-2.5 text-sm bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-semibold"
          >
            {isEdit ? 'Save Changes' : 'Add Customer'}
          </button>
        </div>

      </div>
    </div>
  );
}
