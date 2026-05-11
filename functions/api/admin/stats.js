import { requireAuth, unauthorized, json } from './_helpers.js';

export async function onRequestGet({ request, env }) {
  if (!await requireAuth(request, env)) return unauthorized();

  const [subs, posts, pages] = await Promise.all([
    env.DB.prepare('SELECT COUNT(*) as n FROM subscribers').first(),
    env.DB.prepare("SELECT COUNT(*) as n FROM posts WHERE status='published'").first(),
    env.DB.prepare("SELECT COUNT(*) as n FROM site_pages WHERE status='published'").first(),
  ]);

  const drafts = await env.DB
    .prepare("SELECT COUNT(*) as n FROM posts WHERE status='draft'")
    .first();

  const recent = await env.DB
    .prepare('SELECT name, organisation, email, created_at FROM subscribers ORDER BY created_at DESC LIMIT 8')
    .all();

  return json({
    subscribers:      subs?.n ?? 0,
    published_posts:  posts?.n ?? 0,
    published_pages:  pages?.n ?? 0,
    draft_posts:      drafts?.n ?? 0,
    recent_subscribers: recent.results ?? [],
  });
}
