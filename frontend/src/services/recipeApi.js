import { API_URL } from './apiUrl';

export async function getRecipes() {
  const response = await fetch(`${API_URL}/api/recipes`);

  if (!response.ok) {
    throw new Error('Failed to load recipes');
  }

  return response.json();
}