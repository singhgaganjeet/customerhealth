import Papa from 'papaparse';

export function exportToCSV(customers, reportDate) {
  const rows = customers.map(c => ({
    'Institution Name':    c.customer,
    'Code':                c.code,
    'City':                c.city,
    'State':               c.state,
    'Signup Date':         c.signup_date,
    'Data As Of':          c.as_of_date,
    'Registered Members':  c.registered_db,
    'Unregistered Members':c.unregistered_db,
    'Pending Approval':    c.pend_app,
    'Events':              c.events,
    'Last Event Date':     c.last_event_date,
    'News Posts':          c.news,
    'Last News Date':      c.last_news_date,
    'Chapters':            c.chapters,
    'SIGs':                c.sigs,
    'Last Login Date':     c.last_login_date,
    'Last Mailer Date':    c.last_mailer_date,
    'ALP':                 c.alp,
    'Ascend Elite':        c.ascend_elite,
    'Group Insurance':     c.group_insurance,
    'Hoopstr Live':        c.hoopstr_live,
    'Hoopstr Affinity':    c.hoopstr_affinity,
    'Vanguard':            c.vanguard,
    'Magic AI':            c.magic_ai,
    'Campus Visited':      c.campus_visited,
    'Campus Visit Date':   c.campus_visit_date,
    'Last Demo Date':      c.last_demo_date,
    'PA Score':            c.pa_score,
    'PA Status':           c.pa_status,
    'Activation Score':    c.activationScore,
    'Activation Status':   c.activationStatus?.label,
    'Pillars Activated':   c.pillarsActivated,
  }));

  const csv = Papa.unparse(rows);
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `customer-activation${reportDate ? `-${reportDate}` : ''}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
