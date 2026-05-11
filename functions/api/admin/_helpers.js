// Shared JWT utilities for admin API functions

function b64url(str) {
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function b64urlFromBuffer(buf) {
  return b64url(String.fromCharCode(...new Uint8Array(buf)));
}

function b64urlDecode(str) {
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const pad = base64.length % 4 === 0 ? '' : '='.repeat(4 - (base64.length % 4));
  return atob(base64 + pad);
}

async function getKey(secret, usage) {
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    usage
  );
}

export async function createToken(secret) {
  const header  = b64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = b64url(JSON.stringify({
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7, // 7 days
  }));
  const data = `${header}.${payload}`;
  const key  = await getKey(secret, ['sign']);
  const sig  = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data));
  return `${data}.${b64urlFromBuffer(sig)}`;
}

export async function verifyToken(token, secret) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    const [header, payload, sig] = parts;
    const data = `${header}.${payload}`;
    const key  = await getKey(secret, ['verify']);
    const sigBytes = Uint8Array.from(b64urlDecode(sig), c => c.charCodeAt(0));
    const valid = await crypto.subtle.verify('HMAC', key, sigBytes, new TextEncoder().encode(data));
    if (!valid) return false;
    const claims = JSON.parse(b64urlDecode(payload));
    return claims.exp > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}

export async function requireAuth(request, env) {
  const auth  = request.headers.get('Authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return false;
  return verifyToken(token, env.JWT_SECRET);
}

export function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export function unauthorized() {
  return json({ error: 'Unauthorized' }, 401);
}

export function slug(str) {
  return str.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/[\s]+/g, '-')
    .replace(/-+/g, '-');
}

export function now() {
  return new Date().toISOString();
}
