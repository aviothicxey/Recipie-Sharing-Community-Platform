import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createBlog } from '../services/recipeApi';

function CreateBlogPage({ auth, onCreated }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', category: 'Community', excerpt: '', content: '', image: '' });
  const [error, setError] = useState('');

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!form.content.trim()) {
      setError('Add some content to your blog post before publishing.');
      return;
    }

    const post = {
      ...form,
      image: form.image || 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=1200&q=85',
    };
    try {
      const created = await createBlog(post, auth.token);
      onCreated(created);
      navigate(`/blog/${created._id}`);
    } catch (submitError) {
      setError(submitError.message);
    }
  }

  return (
    <main className="create-page">
      <section className="create-card">
        <p className="eyebrow">Your voice in the community</p>
        <h1>Write a blog post.</h1>
        <p className="create-intro">Share a cooking story, a helpful tip, or something that makes eating well feel more joyful.</p>
        {error && <p className="auth-error">{error}</p>}
        <form onSubmit={handleSubmit}>
          <input required placeholder="Post title" value={form.title} onChange={(event) => update('title', event.target.value)} />
          <input required placeholder="Category (e.g. Wellness)" value={form.category} onChange={(event) => update('category', event.target.value)} />
          <input type="url" placeholder="Cover image URL (optional)" value={form.image} onChange={(event) => update('image', event.target.value)} />
          <textarea required rows="3" placeholder="Short introduction" value={form.excerpt} onChange={(event) => update('excerpt', event.target.value)} />
          <textarea required rows="12" placeholder="Write your story here…" value={form.content} onChange={(event) => update('content', event.target.value)} />
          <button className="pill-button pill-button--green" type="submit">Publish blog post <span>→</span></button>
        </form>
      </section>
    </main>
  );
}

export default CreateBlogPage;
