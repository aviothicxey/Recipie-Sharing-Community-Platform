import { API_URL } from './apiUrl';

export async function getAuthHeader(tokenSource) {
  const token = typeof tokenSource === 'function' ? await tokenSource() : tokenSource;
  if (!token) throw new Error('Please sign in again.');
  return { Authorization: `Bearer ${token}` };
}

export async function getClerkSession(getToken, signal) {
  const response = await fetch(`${API_URL}/api/auth/session`, {
    headers: await getAuthHeader(getToken),
    signal,
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.message || 'Unable to load your DishCircle account.');
  return result.user;
}

export async function updateProfile(profile, token) {
  const response = await fetch(`${API_URL}/api/auth/profile`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...await getAuthHeader(token) },
    body: JSON.stringify(profile),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.message || 'Unable to save your profile.');
  return result.user;
}

async function submitAuth(path, body) {
  let response;
  try {
    response = await fetch(`${API_URL}/api/auth/${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error('Unable to connect to the API. Make sure the backend is running.');
  }

  const responseText = await response.text();
  let result = {};
  if (responseText) {
    try {
      result = JSON.parse(responseText);
    } catch {
      throw new Error(`The API returned an invalid response (HTTP ${response.status}).`);
    }
  }

  if (!response.ok) throw new Error(result.message || 'Authentication failed');
  return result;
}

export function registerUser(body) {
  return submitAuth('register', body);
}

export function loginUser(body) {
  return submitAuth('login', body);
}

export function loginAdmin(body) {
  return submitAuth('admin-login', body);
}
