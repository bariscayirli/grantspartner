import { requireAuth, unauthorized, json } from './_helpers.js';

export async function onRequestGet({ request, env }) {
  if (!await requireAuth(request, env)) return unauthorized();

  const url    = new URL(request.url);
  const page   = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
  const limit  = 25;
  const offset = (page - 1) * limit;

  const [rows, total] = await Promise.all([
    env.DB.prepare(
      'SELECT id, name, organisation, email, created_at FROM subscribers ORDER BY created_at DESC LIMIT ? OFFSET ?'
    ).bind(limit, offset).all(),
    env.DB.prepare('SELECT COUNT(*) as n FROM subscribers').first(),
  ]);

  return json({
    subscribers: rows.results ?? [],
    total: total?.n ?? 0,
    page,
    pages: Math.ceil((total?.n ?? 0) / limit),
  });
}
