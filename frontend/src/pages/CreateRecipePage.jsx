import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createRecipe } from '../services/recipeApi';

const initialForm = { title: '', description: '', coverUrl: '', cuisine: '', diet: 'none', cookTime: '', servings: '', difficulty: 'easy', ingredients: '', steps: '' };

function CreateRecipePage({ auth, onCreated }) {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  function update(field, value) { setForm((current) => ({ ...current, [field]: value })); }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const recipe = {
        ...form,
        cookTime: Number(form.cookTime),
        servings: Number(form.servings),
        tags: [],
        ingredients: form.ingredients.split('\n').filter(Boolean).map((line) => {
          const [qty = '1', unit = '', ...name] = line.trim().split(' ');
          return { qty, unit, name: name.join(' ') || unit };
        }),
        steps: form.steps.split('\n').filter(Boolean).map((text, index) => ({ order: index + 1, text })),
      };
      const created = await createRecipe(recipe, auth.token);
      onCreated(created);
      navigate(`/recipes/${created._id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="create-page">
      <section className="create-card">
        <p className="eyebrow">Your community contribution</p>
        <h1>Share a recipe.</h1>
        <p className="create-intro">Tell the community how you make something delicious. Put each ingredient and step on its own line.</p>
        {error && <p className="auth-error">{error}</p>}
        <form onSubmit={handleSubmit}>
          <input required placeholder="Recipe title" value={form.title} onChange={(event) => update('title', event.target.value)} />
          <textarea required placeholder="What makes this recipe special?" value={form.description} onChange={(event) => update('description', event.target.value)} />
          <div className="form-row"><input required placeholder="Cuisine (e.g. Indian)" value={form.cuisine} onChange={(event) => update('cuisine', event.target.value)} /><input required type="number" min="1" placeholder="Minutes" value={form.cookTime} onChange={(event) => update('cookTime', event.target.value)} /><input required type="number" min="1" placeholder="Servings" value={form.servings} onChange={(event) => update('servings', event.target.value)} /></div>
          <input type="url" placeholder="Cover image URL (optional)" value={form.coverUrl} onChange={(event) => update('coverUrl', event.target.value)} />
          <textarea required rows="6" placeholder={'Ingredients, one per line\\n1 cup tomatoes'} value={form.ingredients} onChange={(event) => update('ingredients', event.target.value)} />
          <textarea required rows="6" placeholder={'Steps, one per line\\nChop the vegetables'} value={form.steps} onChange={(event) => update('steps', event.target.value)} />
          <button className="pill-button pill-button--green" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Publishing…' : 'Publish recipe'} <span>→</span></button>
        </form>
      </section>
    </main>
  );
}

export default CreateRecipePage;
