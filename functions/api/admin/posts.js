import { requireAuth, unauthorized, json, slug, now } from './_helpers.js';

export async function onRequestGet({ request, env }) {
  if (!await requireAuth(request, env)) return unauthorized();

  const rows = await env.DB
    .prepare('SELECT id, title, slug, status, created_at, updated_at, published_at FROM posts ORDER BY updated_at DESC')
    .all();

  return json({ posts: rows.results ?? [] });
}

export async function onRequestPost({ request, env }) {
  if (!await requireAuth(request, env)) return unauthorized();

  const body = await request.json().catch(() => null);
  if (!body?.title) return json({ error: 'Title is required' }, 400);

  const ts      = now();
  const postSlug = body.slug?.trim() || slug(body.title);
  const status  = body.status === 'published' ? 'published' : 'draft';
  const pubAt   = status === 'published' ? ts : null;

  try {
    const result = await env.DB
      .prepare(`INSERT INTO posts (title, slug, excerpt, content, status, created_at, updated_at, published_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
      .bind(
        body.title.trim(),
        postSlug,
        body.excerpt?.trim() || null,
        body.content || '',
        status,
        ts, ts,
        pubAt
      )
      .run();

    return json({ id: result.meta.last_row_id, slug: postSlug, status }, 201);
  } catch (err) {
    if (err.message?.includes('UNIQUE')) return json({ error: 'A post with that slug already exists.' }, 409);
    throw err;
  }
}
