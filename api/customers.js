import { getDB, ensureTables } from './_db.js';

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  const db = getDB();
  try {
    await ensureTables(db);

    if (req.method === 'GET') {
      const result = await db.execute('SELECT data FROM customers ORDER BY sort_ts ASC');
      return res.status(200).json(result.rows.map(r => JSON.parse(r.data)));
    }

    if (req.method === 'POST') {
      // Add a single customer
      const c = req.body;
      await db.execute({
        sql: 'INSERT OR REPLACE INTO customers (site_id, data, sort_ts) VALUES (?, ?, datetime("now"))',
        args: [c.site_id, JSON.stringify(c)],
      });
      return res.status(200).json({ ok: true });
    }

    if (req.method === 'PUT') {
      // Import: replace entire customer list atomically
      const customers = req.body; // array
      await db.batch(
        [
          { sql: 'DELETE FROM customers', args: [] },
          ...customers.map(c => ({
            sql: 'INSERT INTO customers (site_id, data) VALUES (?, ?)',
            args: [c.site_id, JSON.stringify(c)],
          })),
        ],
        'write',
      );
      return res.status(200).json({ ok: true });
    }

    if (req.method === 'DELETE') {
      await db.execute('DELETE FROM customers');
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('[api/customers]', err);
    return res.status(500).json({ error: err.message });
  }
}
