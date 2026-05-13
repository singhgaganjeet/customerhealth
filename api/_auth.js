import { createClerkClient } from '@clerk/backend';

export async function requireAuth(req, res) {
  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey) {
    res.status(500).json({ error: 'CLERK_SECRET_KEY not configured' });
    return false;
  }
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    res.status(401).json({ error: 'Unauthorized' });
    return false;
  }
  try {
    const clerk = createClerkClient({ secretKey });
    await clerk.verifyToken(token);
    return true;
  } catch {
    res.status(401).json({ error: 'Unauthorized' });
    return false;
  }
}
