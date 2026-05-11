export async function onRequestPost({ request, env }) {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': 'https://grantspartner.com',
  };

  try {
    const body = await request.json().catch(() => null);
    if (!body) {
      return json({ error: 'Invalid request body' }, 400, headers);
    }

    const { name, organisation, email } = body;

    if (!name || name.trim().length < 2) {
      return json({ error: 'Please provide your full name.' }, 400, headers);
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailPattern.test(email.trim())) {
      return json({ error: 'Please provide a valid email address.' }, 400, headers);
    }

    const normalised = email.toLowerCase().trim();

    const existing = await env.DB
      .prepare('SELECT id FROM subscribers WHERE email = ?')
      .bind(normalised)
      .first();

    if (existing) {
      return json({ error: 'already_registered' }, 409, headers);
    }

    await env.DB
      .prepare(
        `INSERT INTO subscribers (name, organisation, email, created_at)
         VALUES (?, ?, ?, ?)`
      )
      .bind(
        name.trim(),
        organisation?.trim() || null,
        normalised,
        new Date().toISOString()
      )
      .run();

    return json({ success: true }, 200, headers);

  } catch (err) {
    console.error('subscribe error:', err);
    return json({ error: 'Server error. Please try again.' }, 500, headers);
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': 'https://grantspartner.com',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

function json(data, status, headers) {
  return new Response(JSON.stringify(data), { status, headers });
}
