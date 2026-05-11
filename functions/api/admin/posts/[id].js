import { requireAuth, unauthorized, json, slug, now } from '../_helpers.js';

export async function onRequestGet({ request, env, params }) {
  if (!await requireAuth(request, env)) return unauthorized();

  const post = await env.DB
    .prepare('SELECT * FROM posts WHERE id = ?')
    .bind(params.id)
    .first();

  if (!post) return json({ error: 'Not found' }, 404);
  return json(post);
}

export async function onRequestPut({ request, env, params }) {
  if (!await requireAuth(request, env)) return unauthorized();

  const body = await request.json().catch(() => null);
  if (!body) return json({ error: 'Invalid body' }, 400);

  const existing = await env.DB
    .prepare('SELECT * FROM posts WHERE id = ?')
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

  const postSlug = body.slug?.trim() || slug(body.title || existing.title);

  try {
    await env.DB
      .prepare(`UPDATE posts SET title=?, slug=?, excerpt=?, content=?, status=?, updated_at=?, published_at=? WHERE id=?`)
      .bind(
        (body.title || existing.title).trim(),
        postSlug,
        body.excerpt?.trim() ?? existing.excerpt,
        body.content ?? existing.content,
        newStatus,
        ts,
        pubAt,
        params.id
      )
      .run();

    return json({ id: parseInt(params.id), slug: postSlug, status: newStatus });
  } catch (err) {
    if (err.message?.includes('UNIQUE')) return json({ error: 'A post with that slug already exists.' }, 409);
    throw err;
  }
}

export async function onRequestDelete({ request, env, params }) {
  if (!await requireAuth(request, env)) return unauthorized();

  const existing = await env.DB
    .prepare('SELECT id FROM posts WHERE id = ?')
    .bind(params.id)
    .first();

  if (!existing) return json({ error: 'Not found' }, 404);

  await env.DB.prepare('DELETE FROM posts WHERE id = ?').bind(params.id).run();
  return json({ deleted: true });
}
