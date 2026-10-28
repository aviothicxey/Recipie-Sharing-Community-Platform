import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { editorialRecipes } from '../data/content';
import { getRecipe } from '../services/recipeApi';

function RecipeDetailPage({ auth, savedRecipes, onToggleSave }) {
  const { id } = useParams();
  const fallback = editorialRecipes.find((recipe) => recipe.id === id);
  const [recipe, setRecipe] = useState(fallback);
  const [error, setError] = useState('');

  useEffect(() => {
    if (fallback) return;
    getRecipe(id).then(setRecipe).catch((err) => setError(err.message));
  }, [id, fallback]);

  if (error) {
    return <main className="detail-page"><div className="empty-results"><h1>Recipe unavailable</h1><p>{error}</p><Link className="pill-button pill-button--green" to="/recipes">Back to recipes <span>→</span></Link></div></main>;
  }
  if (!recipe) return <main className="detail-page"><p>Loading recipe…</p></main>;

  const ingredients = recipe.ingredients || [];
  const steps = recipe.steps || [];
  const authorId = typeof recipe.authorId === 'object' ? recipe.authorId?._id : recipe.authorId;
  const canEdit = recipe.contentType !== 'editorial' && String(authorId) === String(auth?.user?.id);
  const recipeId = recipe._id || recipe.id;
  const isSaved = savedRecipes.some((saved) => (saved._id || saved.id) === recipeId);
  const category = recipe.category || recipe.cuisine || 'Recipe';
  const time = recipe.time || `${recipe.cookTime || 20} mins`;
  const servings = recipe.servings ? `${recipe.servings} servings` : 'Fresh and delicious';
  return (
    <main className="detail-page">
      <section className="detail-intro">
        <div className="detail-intro__copy">
          <div className="recipe-facts">
            <span>◷ {time}</span>
            <span>♧ {servings}</span>
            <span>≡ {category}</span>
          </div>
          <h1>{recipe.title}</h1>
          <p>{recipe.description || 'A Nourish community recipe made for sharing.'}</p>
          <div className="detail-actions">
            <button className="detail-save-button" type="button" onClick={() => onToggleSave(recipe)}>
              {isSaved ? 'Saved Recipe' : 'Save Recipe'} <span>↗</span>
            </button>
            {canEdit && <Link className="detail-edit-link" to={`/recipes/${recipe._id}/edit`}>Edit recipe <span>→</span></Link>}
          </div>
        </div>
        <div className="detail-intro__art" aria-hidden="true">✦</div>
      </section>
      <section className="detail-recipe">
        <div className="detail-recipe__image">
          <img src={recipe.image || recipe.coverUrl} alt={recipe.title} />
          <span className="detail-badge">Made<br />with love</span>
        </div>
        <div className="detail-ingredients">
          <p className="eyebrow">What you need</p>
          <h2>Ingredients</h2>
          <ul>{ingredients.length ? ingredients.map((item, index) => <li key={index}>{item.qty} {item.unit} {item.name}</li>) : <li>Use your favourite fresh ingredients and make it your own.</li>}</ul>
        </div>
      </section>
      <section className="detail-method">
        <p className="eyebrow">Take your time</p>
        <h2>How to make it</h2>
        <ol>{steps.length ? steps.map((step, index) => <li key={index}><span>{String(index + 1).padStart(2, '0')}</span>{step.text || step}</li>) : <li>Follow along and enjoy the process.</li>}</ol>
      </section>
    </main>
  );
}

export default RecipeDetailPage;
