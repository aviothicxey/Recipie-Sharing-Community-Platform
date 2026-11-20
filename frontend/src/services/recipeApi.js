import { API_URL } from './apiUrl';
import { getAuthHeader } from './authApi';

async function readApiResponse(response, fallbackMessage) {
  const contentType = response.headers.get('content-type') || '';
  const result = contentType.includes('application/json')
    ? await response.json()
    : null;
  if (!response.ok) {
    throw new Error(result?.message || `${fallbackMessage} (HTTP ${response.status})`);
  }
  return result;
}

export async function getRecipes(ingredients = []) {
  const params = new URLSearchParams();
  ingredients.forEach((ingredient) => params.append('ingredients', ingredient));
  const query = params.toString();
  const response = await fetch(`${API_URL}/api/recipes${query ? `?${query}` : ''}`, { cache: 'no-store' });

  return readApiResponse(response, 'Failed to load recipes');
}

export async function getRecipe(id) {
  const response = await fetch(`${API_URL}/api/recipes/${id}`);

  return readApiResponse(response, 'Failed to load recipe');
}

export async function getMyRecipes(token) {
  const response = await fetch(`${API_URL}/api/recipes/mine`, {
    cache: 'no-store',
    headers: await getAuthHeader(token)
  });
  return readApiResponse(response, 'Failed to load your recipes');
}

export async function createRecipe(recipe, token) {
  const response = await fetch(`${API_URL}/api/recipes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...await getAuthHeader(token),
    },
    body: JSON.stringify(recipe),
  });

  return readApiResponse(response, 'Failed to publish recipe');
}

export async function updateRecipe(id, recipe, token) {
  const response = await fetch(`${API_URL}/api/recipes/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...await getAuthHeader(token),
    },
    body: JSON.stringify(recipe),
  });

  return readApiResponse(response, 'Failed to update recipe');
}

export async function uploadImage(file, token) {
  const formData = new FormData();
  formData.append('image', file);
  const response = await fetch(`${API_URL}/api/uploads/image`, {
    method: 'POST',
    headers: await getAuthHeader(token),
    body: formData,
  });
  const result = await readApiResponse(response, 'Image upload failed');
  return result.imageUrl;
}

export async function getBlogs() {
  const response = await fetch(`${API_URL}/api/blogs`);
  return readApiResponse(response, 'Failed to load community blogs');
}

export async function getBlog(id) {
  const response = await fetch(`${API_URL}/api/blogs/${id}`);
  return readApiResponse(response, 'Failed to load blog post');
}

export async function createBlog(post, token) {
  const response = await fetch(`${API_URL}/api/blogs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...await getAuthHeader(token) },
    body: JSON.stringify(post),
  });
  return readApiResponse(response, 'Failed to publish blog post');
}

async function communityRequest(path, token, options = {}) {
  const response = await fetch(`${API_URL}/api/community${path}`, {
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? await getAuthHeader(token) : {}),
      ...(options.headers || {})
    }
  });
  if (response.status === 204) return null;
  return readApiResponse(response, 'Community request failed');
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
