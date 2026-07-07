// src/api/auth.js
import {api, apiRequest, setTokens, getTokens} from './client';

/** Step 1: username + password -> otp_token */
export function login(username, password) {
  return apiRequest('/auth/login', {
    method: 'POST',
    body: {username, password},
    skipAuth: true,
  });
}

/** Step 2: otp_token + 6-digit code -> real tokens, persisted on success */
export async function verifyOtp(otpToken, code, deviceId) {
  const tokens = await apiRequest('/auth/verify-otp', {
    method: 'POST',
    body: {otp_token: otpToken, code, device_id: deviceId},
    skipAuth: true,
  });
  await setTokens(tokens);
  return tokens;
}

export function getMe() {
  return api.get('/auth/me');
}

export function changePassword(oldPassword, newPassword) {
  return api.post('/auth/change-password', {old_password: oldPassword, new_password: newPassword});
}

export async function logout() {
  try {
    await api.post('/auth/logout', {});
  } catch (e) {
    // best-effort - we clear local tokens regardless of whether this call succeeds
  }
  await setTokens(null);
}

export async function hasStoredSession() {
  const tokens = await getTokens();
  return !!tokens?.access_token;
}
