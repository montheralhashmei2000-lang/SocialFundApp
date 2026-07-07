// src/api/client.js
/**
 * Thin fetch wrapper around the FastAPI backend.
 *
 * - Attaches the current access token to every request.
 * - On a 401, tries exactly one silent refresh via /auth/refresh, then
 *   retries the original request once. If that also fails, throws
 *   AuthError so the caller (usually DataContext) can log the user out.
 * - Distinguishes network failures (offline) from server errors so the
 *   sync engine can decide whether to queue for later or surface a real error.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

// Change this to your deployed backend URL. 10.0.2.2 is the special alias
// the Android emulator uses to reach "localhost" on the host machine during
// development; a real device on the same network needs your computer's LAN IP,
// and a production build needs your real server domain (https://...).
export const API_BASE_URL = 'http://10.0.2.2:8000';

const TOKEN_KEY = '@social_fund_tokens_v1';

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

export class AuthError extends Error {}
export class NetworkError extends Error {}

let cachedTokens = null;
let refreshPromise = null;

export async function getTokens() {
  if (cachedTokens) return cachedTokens;
  const raw = await AsyncStorage.getItem(TOKEN_KEY);
  cachedTokens = raw ? JSON.parse(raw) : null;
  return cachedTokens;
}

export async function setTokens(tokens) {
  cachedTokens = tokens;
  if (tokens) {
    await AsyncStorage.setItem(TOKEN_KEY, JSON.stringify(tokens));
  } else {
    await AsyncStorage.removeItem(TOKEN_KEY);
  }
}

async function refreshAccessToken() {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const tokens = await getTokens();
    if (!tokens?.refresh_token) throw new AuthError('لا يوجد رمز تحديث');

    const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({refresh_token: tokens.refresh_token}),
    });
    if (!res.ok) throw new AuthError('انتهت الجلسة، يرجى تسجيل الدخول من جديد');

    const data = await res.json();
    await setTokens(data);
    return data;
  })();

  try {
    return await refreshPromise;
  } finally {
    refreshPromise = null;
  }
}

export async function apiRequest(path, opts = {}) {
  const {method = 'GET', body, query, skipAuth = false, isRetry = false} = opts;

  let url = `${API_BASE_URL}${path}`;
  if (query) {
    const qs = new URLSearchParams(
      Object.entries(query).filter(([, v]) => v !== undefined && v !== null),
    ).toString();
    if (qs) url += `?${qs}`;
  }

  const headers = {'Content-Type': 'application/json'};
  if (!skipAuth) {
    const tokens = await getTokens();
    if (tokens?.access_token) {
      headers.Authorization = `Bearer ${tokens.access_token}`;
    }
  }

  let res;
  try {
    res = await fetch(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (e) {
    throw new NetworkError('لا يوجد اتصال بالخادم');
  }

  if (res.status === 401 && !skipAuth && !isRetry) {
    try {
      await refreshAccessToken();
      return apiRequest(path, {...opts, isRetry: true});
    } catch (e) {
      await setTokens(null);
      throw new AuthError('انتهت الجلسة، يرجى تسجيل الدخول من جديد');
    }
  }

  const contentType = res.headers.get('content-type') || '';
  const payload = contentType.includes('application/json') ? await res.json().catch(() => null) : null;

  if (!res.ok) {
    const message = payload?.detail || `خطأ في الخادم (${res.status})`;
    throw new ApiError(message, res.status, payload);
  }

  return payload;
}

export const api = {
  get: (path, query) => apiRequest(path, {method: 'GET', query}),
  post: (path, body, opts) => apiRequest(path, {method: 'POST', body, ...opts}),
  put: (path, body) => apiRequest(path, {method: 'PUT', body}),
  patch: (path, body) => apiRequest(path, {method: 'PATCH', body}),
  delete: path => apiRequest(path, {method: 'DELETE'}),
};
