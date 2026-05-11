import { createToken, json } from './_helpers.js';

export async function onRequestPost({ request, env }) {
  try {
    const body = await request.json().catch(() => null);
    if (!body?.password) return json({ error: 'Password required' }, 400);

    if (body.password !== env.ADMIN_PASSWORD) {
      return json({ error: 'Incorrect password' }, 401);
    }

    const token = await createToken(env.JWT_SECRET);
    return json({ token });
  } catch (err) {
    console.error('auth error:', err);
    return json({ error: 'Server error' }, 500);
  }
}
