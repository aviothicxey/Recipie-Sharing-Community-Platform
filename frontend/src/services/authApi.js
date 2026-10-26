const API_URL = import.meta.env.VITE_API_URL;

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
