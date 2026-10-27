import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { editorialRecipes } from '../data/content';
import { getRecipe } from '../services/recipeApi';

function RecipeDetailPage({ auth }) {
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
  return (
    <main className="detail-page">
      <section className="detail-hero">
        <img src={recipe.image || recipe.coverUrl} alt={recipe.title} />
        <div>
          <p className="eyebrow">{recipe.category || recipe.cuisine || 'Recipe'}</p>
          <h1>{recipe.title}</h1>
          <p>{recipe.description || 'A Nourish community recipe made for sharing.'}</p>
          {canEdit && <Link className="pill-button pill-button--white" to={`/recipes/${recipe._id}/edit`}>Edit recipe <span>→</span></Link>}
          <div className="recipe-facts"><span>{recipe.time || `${recipe.cookTime || 20} min`}</span><span>{recipe.difficulty || 'Easy'}</span><span>{recipe.servings ? `${recipe.servings} servings` : 'Fresh and delicious'}</span></div>
        </div>
      </section>
      <section className="detail-content">
        <div><p className="eyebrow">What you need</p><h2>Ingredients</h2><ul>{ingredients.length ? ingredients.map((item, index) => <li key={index}>{item.qty} {item.unit} {item.name}</li>) : <li>Use your favourite fresh ingredients and make it your own.</li>}</ul></div>
        <div><p className="eyebrow">How to make it</p><h2>Method</h2><ol>{steps.length ? steps.map((step, index) => <li key={index}>{step.text || step}</li>) : <li>Follow along and enjoy the process.</li>}</ol></div>
      </section>
    </main>
  );
}

export default RecipeDetailPage;
