const API_URL = import.meta.env.VITE_API_URL;

export async function getRecipes() {
  const response = await fetch(`${API_URL}/api/recipes`);

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