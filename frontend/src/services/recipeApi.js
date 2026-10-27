const API_URL = import.meta.env.VITE_API_URL;

export async function getRecipes(ingredients = []) {
  const params = new URLSearchParams();
  ingredients.forEach((ingredient) => params.append('ingredients', ingredient));
  const query = params.toString();
  const response = await fetch(`${API_URL}/api/recipes${query ? `?${query}` : ''}`);

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