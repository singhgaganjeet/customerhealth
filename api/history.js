import { getDB, ensureTables } from './_db.js';
import { requireAuth } from './_auth.js';

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  const db = getDB();

  try {
    await ensureTables(db);

    if (req.method === 'GET') {
      const result = await db.execute('SELECT data FROM history ORDER BY ts DESC');
      return res.status(200).json(result.rows.map(r => JSON.parse(r.data)));
    }

    if (req.method === 'POST') {
      if (!await requireAuth(req, res)) return;
      const entry = req.body;
      await db.execute({
        sql: 'INSERT OR REPLACE INTO history (id, data, ts) VALUES (?, ?, ?)',
        args: [entry.id, JSON.stringify(entry), entry.timestamp],
      });
      return res.status(200).json({ ok: true });
    }

    if (req.method === 'DELETE') {
      if (!await requireAuth(req, res)) return;
      await db.execute('DELETE FROM history');
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('[api/history]', err);
    return res.status(500).json({ error: err.message });
  }
}
