import { API_URL } from './apiUrl';

async function submitAuth(path, body) {
  try {
    const response = await fetch(`${API_URL}/api/auth/${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Authentication failed');
    return result;
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error('Unable to connect to the server. Start the backend and try again.', { cause: error });
    }
    throw error;
  }
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
