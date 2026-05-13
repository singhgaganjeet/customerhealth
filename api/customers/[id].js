import { getDB, ensureTables } from '../_db.js';
import { requireAuth } from '../_auth.js';

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  const db = getDB();
  const { id } = req.query;

  try {
    await ensureTables(db);

    if (req.method === 'PUT') {
      if (!await requireAuth(req, res)) return;
      const c = req.body;
      await db.execute({
        sql: 'UPDATE customers SET data = ?, sort_ts = datetime("now") WHERE site_id = ?',
        args: [JSON.stringify(c), id],
      });
      return res.status(200).json({ ok: true });
    }

    if (req.method === 'DELETE') {
      if (!await requireAuth(req, res)) return;
      await db.execute({
        sql: 'DELETE FROM customers WHERE site_id = ?',
        args: [id],
      });
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('[api/customers/[id]]', err);
    return res.status(500).json({ error: err.message });
  }
}
