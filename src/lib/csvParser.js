import Papa from 'papaparse';
import { enrichCustomer } from './scoring';

const REQUIRED_COLUMNS = [
  'customer', 'code', 'city', 'state',
  'signup_date', 'registered_db', 'unregistered_db', 'pend_app',
  'events', 'news',
];

const CONDITIONAL_RULES = [
  { if: r => r.campus_visited === 'Yes', thenNotEmpty: 'campus_visit_date', message: 'campus_visit_date required when campus_visited = Yes' },
];

export function parseAndValidateCSV(file) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: h => h.trim(),
      complete: (results) => {
        const rows = results.data;
        if (rows.length === 0) { reject(new Error('CSV file is empty')); return; }

        const headers = Object.keys(rows[0] || {});
        const missingCols = REQUIRED_COLUMNS.filter(c => !headers.includes(c));
        if (missingCols.length > 0) {
          reject(new Error(`Missing required columns: ${missingCols.join(', ')}`));
          return;
        }

        const rowErrors = [];

        rows.forEach((row, i) => {
          row.site_id = row.site_id?.trim() || String(Date.now() + i);
          const rowNum = i + 2;

          if (!row.signup_date) {
            rowErrors.push(`Row ${rowNum} (${row.customer}): signup_date is required`);
          }

          for (const rule of CONDITIONAL_RULES) {
            if (rule.if(row) && !row[rule.thenNotEmpty]) {
              rowErrors.push(`Row ${rowNum} (${row.customer}): ${rule.message}`);
            }
          }
        });

        if (rowErrors.length > 0) {
          const shown = rowErrors.slice(0, 8);
          const extra = rowErrors.length > 8 ? `\n...and ${rowErrors.length - 8} more errors` : '';
          reject(new Error(shown.join('\n') + extra));
          return;
        }

        resolve(rows.map(enrichCustomer));
      },
      error: (err) => reject(new Error(err.message)),
    });
  });
}

// Column order matches exactly what the user will export from their systems
export const CSV_TEMPLATE_HEADERS = [
  'code', 'customer', 'city', 'state',
  'signup_date',
  'registered_db', 'unregistered_db', 'pend_app',
  'events', 'last_event_date',
  'news', 'last_news_date',
  'chapters', 'sigs',
  'last_login_date', 'last_mailer_date',
  'alp',
  'ascend_elite',
  'group_insurance',
  'hoopstr_live',
  'hoopstr_affinity',
  'vanguard',
  'magic_ai',
  'campus_visited', 'campus_visit_date',
  'last_demo_date',
];

export function downloadCSVTemplate() {
  const csv = CSV_TEMPLATE_HEADERS.join(',') + '\n';
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'hoopstr_activation_template.csv';
  a.click();
  URL.revokeObjectURL(url);
}
