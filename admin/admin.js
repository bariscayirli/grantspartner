// Shared admin JS — included on every admin page

const TOKEN_KEY = 'gp_admin_token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(t) {
  localStorage.setItem(TOKEN_KEY, t);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function logout() {
  clearToken();
  location.href = '/admin/';
}

export async function api(path, opts = {}) {
  const token = getToken();
  const res = await fetch(path, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...(opts.headers || {}),
    },
  });

  if (res.status === 401) {
    clearToken();
    location.href = '/admin/';
    return null;
  }

  return res;
}

export function requireLogin() {
  if (!getToken()) {
    location.href = '/admin/';
    return false;
  }
  return true;
}

export function markActiveNav() {
  const path = location.pathname;
  document.querySelectorAll('.nav-item').forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === path);
  });
}

export function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric'
  });
}

export function showAlert(el, type, msg) {
  el.className = `alert alert-${type} show`;
  el.textContent = msg;
  if (type === 'success') setTimeout(() => el.classList.remove('show'), 3500);
}

// Simple markdown to HTML converter (for preview)
export function mdToHtml(md) {
  return md
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, s => `<ul>${s}</ul>`)
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(?!<[hupbcl])(.+)$/gm, (_, l) => l.trim() ? `<p>${l}</p>` : '')
    .trim();
}

// Slug generation
export function makeSlug(str) {
  return str.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

// Toolbar: insert markdown around selection
export function insertMd(textarea, before, after = '') {
  const s = textarea.selectionStart;
  const e = textarea.selectionEnd;
  const sel = textarea.value.substring(s, e);
  textarea.value = textarea.value.substring(0, s) + before + sel + after + textarea.value.substring(e);
  textarea.selectionStart = s + before.length;
  textarea.selectionEnd   = s + before.length + sel.length;
  textarea.focus();
  textarea.dispatchEvent(new Event('input'));
}
