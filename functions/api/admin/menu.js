import { requireAuth, unauthorized, json, now } from './_helpers.js';

const DEFAULT_MENU = JSON.stringify([
  { label: 'Home',    url: '/' },
  { label: 'Contact', url: 'mailto:hello@grantspartner.com' },
]);

export async function onRequestGet({ request, env }) {
  if (!await requireAuth(request, env)) return unauthorized();

  const row = await env.DB
    .prepare("SELECT value FROM settings WHERE key='menu'")
    .first();

  return json({ menu: JSON.parse(row?.value ?? DEFAULT_MENU) });
}

export async function onRequestPut({ request, env }) {
  if (!await requireAuth(request, env)) return unauthorized();

  const body = await request.json().catch(() => null);
  if (!Array.isArray(body?.menu)) return json({ error: 'Invalid menu format' }, 400);

  for (const item of body.menu) {
    if (!item.label?.trim() || !item.url?.trim()) {
      return json({ error: 'Each menu item needs a label and a URL' }, 400);
    }
  }

  await env.DB
    .prepare("INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES ('menu', ?, ?)")
    .bind(JSON.stringify(body.menu), now())
    .run();

  return json({ ok: true });
}
