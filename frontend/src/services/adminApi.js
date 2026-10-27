const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');

async function request(path, auth, options = {}) {
  const response = await fetch(`${API_URL}/api/admin/${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${auth.token}`,
      ...(options.headers || {}),
    },
  });
  if (response.status === 204) return null;
  const result = await response.json();
  if (!response.ok) throw new Error(result.message || 'Admin request failed');
  return result;
}

export function getAdminResources(resource, auth) {
  return request(resource, auth);
}

export function setAdminResourceStatus(resource, id, status, auth) {
  return request(`${resource}/${id}/status`, auth, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export function deleteAdminResource(resource, id, auth) {
  return request(`${resource}/${id}`, auth, { method: 'DELETE' });
}
