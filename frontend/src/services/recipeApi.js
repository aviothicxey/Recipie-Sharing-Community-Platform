import { API_URL } from './apiUrl';

export async function getRecipes(ingredients = []) {
  const params = new URLSearchParams();
  ingredients.forEach((ingredient) => params.append('ingredients', ingredient));
  const query = params.toString();
  const response = await fetch(`${API_URL}/api/recipes${query ? `?${query}` : ''}`, { cache: 'no-store' });

  if (!response.ok) {
    throw new Error('Failed to load recipes');
  }

  return response.json();
}

export async function getRecipe(id) {
  const response = await fetch(`${API_URL}/api/recipes/${id}`);

  if (!response.ok) {
    throw new Error('Failed to load recipe');
  }

  return response.json();
}

export async function getMyRecipes(token) {
  const response = await fetch(`${API_URL}/api/recipes/mine`, {
    cache: 'no-store',
    headers: { Authorization: `Bearer ${token}` }
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.message || 'Failed to load your recipes');
  return result;
}

export async function createRecipe(recipe, token) {
  const response = await fetch(`${API_URL}/api/recipes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(recipe),
  });

  const result = await response.json();
  if (!response.ok) throw new Error(result.message || 'Failed to publish recipe');
  return result;
}

export async function updateRecipe(id, recipe, token) {
  const response = await fetch(`${API_URL}/api/recipes/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(recipe),
  });

  const result = await response.json();
  if (!response.ok) throw new Error(result.message || 'Failed to update recipe');
  return result;
}

export async function uploadImage(file, token) {
  const formData = new FormData();
  formData.append('image', file);
  const response = await fetch(`${API_URL}/api/uploads/image`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.message || 'Image upload failed');
  return result.imageUrl;
}

export async function getBlogs() {
  const response = await fetch(`${API_URL}/api/blogs`);
  if (!response.ok) throw new Error('Failed to load community blogs');
  return response.json();
}

export async function getBlog(id) {
  const response = await fetch(`${API_URL}/api/blogs/${id}`);
  if (!response.ok) throw new Error('Failed to load blog post');
  return response.json();
}

export async function createBlog(post, token) {
  const response = await fetch(`${API_URL}/api/blogs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(post),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.message || 'Failed to publish blog post');
  return result;
}

async function communityRequest(path, token, options = {}) {
  const response = await fetch(`${API_URL}/api/community${path}`, {
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    }
  });
  if (response.status === 204) return null;
  const result = await response.json();
  if (!response.ok) throw new Error(result.message || 'Community request failed');
  return result;
}

export function getCreators(token) {
  return communityRequest('/creators', token);
}

export function searchCreators(query, token) {
  return communityRequest(`/creators?search=${encodeURIComponent(query)}`, token);
}

export function createChannel(name, description, token) {
  return communityRequest('/channels', token, {
    method: 'POST',
    body: JSON.stringify({ name, description })
  });
}

export function getNotifications(token) {
  return communityRequest('/notifications', token);
}

export function markNotificationsRead(token) {
  return communityRequest('/notifications/read', token, { method: 'POST' });
}

export function toggleFollow(creatorId, token) {
  return communityRequest(`/creators/${creatorId}/follow`, token, { method: 'POST' });
}

export function getChannel(creatorId, token) {
  return communityRequest(`/channels/${creatorId}`, token);
}

export function getOwnChannel(token) {
  return communityRequest('/channels/me', token);
}

export function postChannelMessage(creatorId, text, token) {
  return communityRequest(`/channels/${creatorId}/messages`, token, {
    method: 'POST',
    body: JSON.stringify({ text })
  });
}

export function getComments(recipeId) {
  return communityRequest(`/recipes/${recipeId}/comments`);
}

export function createComment(recipeId, text, token, parentId = null) {
  return communityRequest(`/recipes/${recipeId}/comments`, token, {
    method: 'POST',
    body: JSON.stringify({ text, parentId })
  });
}