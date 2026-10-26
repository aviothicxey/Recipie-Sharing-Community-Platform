const API_URL = import.meta.env.VITE_API_URL;

async function submitAuth(path, body) {
  const response = await fetch(`${API_URL}/api/auth/${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.message || 'Authentication failed');
  return result;
}

export function registerUser(body) {
  return submitAuth('register', body);
}

export function loginUser(body) {
  return submitAuth('login', body);
}
