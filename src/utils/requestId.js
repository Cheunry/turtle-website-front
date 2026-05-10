function shortRandomId() {
  if (window.crypto && typeof window.crypto.randomUUID === 'function') {
    return window.crypto.randomUUID().replace(/-/g, '').slice(0, 16);
  }
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
}

function normalizePart(part) {
  if (part === undefined || part === null || part === '') {
    return 'none';
  }
  return String(part)
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .slice(0, 24);
}

export function hashRequestPart(value) {
  const text = value === undefined || value === null ? '' : String(value);
  let hash = 0;
  for (let i = 0; i < text.length; i += 1) {
    hash = ((hash << 5) - hash + text.charCodeAt(i)) | 0;
  }
  return Math.abs(hash).toString(36);
}

export function createAuthorPointsRequestId(type, parts = [], withNonce = true) {
  const base = [type, ...parts.map(normalizePart)].join(':');
  return withNonce ? `${base}:${shortRandomId()}` : base;
}
