import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createRecipe, getRecipe, updateRecipe, uploadImage } from '../services/recipeApi';

const initialForm = { title: '', description: '', coverUrl: '', cuisine: '', diet: 'none', cookTime: '', servings: '', difficulty: 'easy', ingredients: '', steps: '' };

function CreateRecipePage({ auth, onCreated, isEditing = false }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (!isEditing) return;
    getRecipe(id).then((recipe) => {
      setForm({
        title: recipe.title || '',
        description: recipe.description || '',
        coverUrl: recipe.coverUrl || '',
        cuisine: recipe.cuisine || '',
        diet: recipe.diet || 'none',
        cookTime: recipe.cookTime || '',
        servings: recipe.servings || '',
        difficulty: recipe.difficulty || 'easy',
        ingredients: (recipe.ingredients || []).map((item) => [item.qty, item.unit, item.name].filter(Boolean).join(' ')).join('\n'),
        steps: (recipe.steps || []).map((step) => step.text || step).join('\n'),
      });
    }).catch((err) => setError(err.message));
  }, [id, isEditing]);

  function update(field, value) { setForm((current) => ({ ...current, [field]: value })); }

  async function handleImageChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setError('');
    setIsUploading(true);
    try {
      update('coverUrl', await uploadImage(file, auth.token));
    } catch (err) {
      setError(err.message);
    } finally {
      setIsUploading(false);
    }
  }

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
      const saved = isEditing
        ? await updateRecipe(id, recipe, auth.token)
        : await createRecipe(recipe, auth.token);
      onCreated(saved);
      navigate(`/recipes/${saved._id}`);
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
        <h1>{isEditing ? 'Edit your recipe.' : 'Share a recipe.'}</h1>
        <p className="create-intro">{isEditing ? 'Update your recipe and keep the community up to date.' : 'Tell the community how you make something delicious. Put each ingredient and step on its own line.'}</p>
        {error && <p className="auth-error">{error}</p>}
        <form onSubmit={handleSubmit}>
          <input required placeholder="Recipe title" value={form.title} onChange={(event) => update('title', event.target.value)} />
          <textarea required placeholder="What makes this recipe special?" value={form.description} onChange={(event) => update('description', event.target.value)} />
          <div className="form-row"><input required placeholder="Cuisine (e.g. Indian)" value={form.cuisine} onChange={(event) => update('cuisine', event.target.value)} /><input required type="number" min="1" placeholder="Minutes" value={form.cookTime} onChange={(event) => update('cookTime', event.target.value)} /><input required type="number" min="1" placeholder="Servings" value={form.servings} onChange={(event) => update('servings', event.target.value)} /></div>
          <label className="upload-field">Recipe photo
            <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageChange} disabled={isUploading} />
            <small>{isUploading ? 'Uploading image…' : 'JPG, PNG or WEBP up to 5 MB'}</small>
          </label>
          <input type="url" placeholder="Or paste a cover image URL (optional)" value={form.coverUrl} onChange={(event) => update('coverUrl', event.target.value)} />
          <textarea required rows="6" placeholder={'Ingredients, one per line\\n1 cup tomatoes'} value={form.ingredients} onChange={(event) => update('ingredients', event.target.value)} />
          <textarea required rows="6" placeholder={'Steps, one per line\\nChop the vegetables'} value={form.steps} onChange={(event) => update('steps', event.target.value)} />
          <button className="pill-button pill-button--green" type="submit" disabled={isSubmitting || isUploading}>{isSubmitting ? 'Saving…' : isEditing ? 'Save changes' : 'Publish recipe'} <span>→</span></button>
        </form>
      </section>
    </main>
  );
}

export default CreateRecipePage;
