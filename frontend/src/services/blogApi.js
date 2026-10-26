const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');

export async function getBlogs() {
  const response = await fetch(`${API_URL}/api/blogs`);
  if (!response.ok) throw new Error('Failed to load blogs');
  return response.json();
}

export async function getBlog(slug) {
  const response = await fetch(`${API_URL}/api/blogs/${slug}`);
  if (!response.ok) throw new Error('Blog post not found');
  return response.json();
}
