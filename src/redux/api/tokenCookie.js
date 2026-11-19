const ACCESS_TOKEN_COOKIE = 'access_token';
const DEFAULT_TOKEN_LIFETIME_SECONDS = 60 * 60 * 24;

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

export function decodeAccessToken(token) {
  if (typeof token !== 'string') return null;

  const encodedPayload = token.split('.')[1];
  if (!encodedPayload) return null;

  try {
    const base64 = encodedPayload.replace(/-/g, '+').replace(/_/g, '/');
    const paddedBase64 = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
    const bytes = Uint8Array.from(atob(paddedBase64), (character) => character.charCodeAt(0));
    const payload = JSON.parse(new TextDecoder().decode(bytes));
    return isObject(payload) ? payload : null;
  } catch {
    return null;
  }
}

export function getUserFromAccessToken(token) {
  const payload = decodeAccessToken(token);
  if (!payload) return null;

  const nestedUser = isObject(payload.user) ? payload.user : {};
  const metadata = isObject(payload.user_metadata) ? payload.user_metadata : {};
  const claims = { ...payload, ...nestedUser, ...metadata };
  const firstName = claims.firstName ?? claims.first_name ?? claims.given_name;
  const lastName = claims.lastName ?? claims.last_name ?? claims.family_name;
  const combinedName = [firstName, lastName].filter(Boolean).join(' ');
  const user = {
    id: claims.id ?? claims.userId ?? claims.user_id ?? payload.sub,
    fullName: claims.fullName ?? claims.full_name ?? claims.displayName ?? claims.display_name ?? combinedName,
    name: claims.name,
    email: claims.email,
    role: claims.role ?? claims.userRole ?? claims.user_role,
  };

  return Object.fromEntries(Object.entries(user).filter(([, value]) => value != null && value !== ''));
}

export function getAccessToken() {
  const prefix = `${encodeURIComponent(ACCESS_TOKEN_COOKIE)}=`;
  const cookie = document.cookie.split('; ').find((item) => item.startsWith(prefix));
  return cookie ? decodeURIComponent(cookie.slice(prefix.length)) : null;
}

export function saveAccessToken(token, expiresIn) {
  if (!token) return;
  const lifetime = Number(expiresIn);
  const maxAge = Number.isFinite(lifetime) && lifetime > 0 ? lifetime : DEFAULT_TOKEN_LIFETIME_SECONDS;
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${encodeURIComponent(ACCESS_TOKEN_COOKIE)}=${encodeURIComponent(token)}; Path=/; Max-Age=${maxAge}; SameSite=Lax${secure}`;
}

export function removeAccessToken() {
  document.cookie = `${encodeURIComponent(ACCESS_TOKEN_COOKIE)}=; Path=/; Max-Age=0; SameSite=Lax`;
}
