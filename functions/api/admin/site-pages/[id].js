import { requireAuth, unauthorized, json, slug, now } from '../_helpers.js';

export async function onRequestGet({ request, env, params }) {
  if (!await requireAuth(request, env)) return unauthorized();

  const page = await env.DB
    .prepare('SELECT * FROM site_pages WHERE id = ?')
    .bind(params.id)
    .first();

  if (!page) return json({ error: 'Not found' }, 404);
  return json(page);
}

export async function onRequestPut({ request, env, params }) {
  if (!await requireAuth(request, env)) return unauthorized();

  const body = await request.json().catch(() => null);
  if (!body) return json({ error: 'Invalid body' }, 400);

  const existing = await env.DB
    .prepare('SELECT * FROM site_pages WHERE id = ?')
    .bind(params.id)
    .first();

  if (!existing) return json({ error: 'Not found' }, 404);

  const ts         = now();
  const newStatus  = body.status === 'published' ? 'published' : 'draft';
  const wasPublished = existing.status === 'published';
  const nowPublished = newStatus === 'published';
  const pubAt = nowPublished
    ? (wasPublished ? existing.published_at : ts)
    : null;

  const pageSlug = body.slug?.trim() || slug(body.title || existing.title);

  try {
    await env.DB
      .prepare(`UPDATE site_pages SET title=?, slug=?, content=?, meta_description=?, status=?, updated_at=?, published_at=? WHERE id=?`)
      .bind(
        (body.title || existing.title).trim(),
        pageSlug,
        body.content ?? existing.content,
        body.meta_description?.trim() ?? existing.meta_description,
        newStatus,
        ts,
        pubAt,
        params.id
      )
      .run();

    return json({ id: parseInt(params.id), slug: pageSlug, status: newStatus });
  } catch (err) {
    if (err.message?.includes('UNIQUE')) return json({ error: 'A page with that slug already exists.' }, 409);
    throw err;
  }
}

export async function onRequestDelete({ request, env, params }) {
  if (!await requireAuth(request, env)) return unauthorized();

  const existing = await env.DB
    .prepare('SELECT id FROM site_pages WHERE id = ?')
    .bind(params.id)
    .first();

  if (!existing) return json({ error: 'Not found' }, 404);

  await env.DB.prepare('DELETE FROM site_pages WHERE id = ?').bind(params.id).run();
  return json({ deleted: true });
}
