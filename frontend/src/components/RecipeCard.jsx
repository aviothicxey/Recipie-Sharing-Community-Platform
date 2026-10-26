import { Link } from 'react-router-dom';

function RecipeCard({ recipe, isSaved = false, onToggleSave }) {
  const recipeId = recipe._id || recipe.id;

  return (
    <article className="recipe-card">
      <div className="recipe-card__image-wrap">
        <Link to={`/recipes/${recipeId}`} aria-label={`View ${recipe.title}`}>
          <img src={recipe.image || recipe.coverUrl} alt={recipe.title} />
        </Link>
        <button
          className={`save-button${isSaved ? ' save-button--active' : ''}`}
          type="button"
          aria-label={`${isSaved ? 'Remove' : 'Save'} ${recipe.title}`}
          onClick={() => onToggleSave(recipe)}
        >
          {isSaved ? '♥' : '♡'}
        </button>
      </div>
      <div className="recipe-card__body">
        <span>{recipe.category || recipe.cuisine || 'Recipe'}</span>
        <h3><Link to={`/recipes/${recipeId}`}>{recipe.title}</Link></h3>
        <p>{recipe.time || `${recipe.cookTime || 20} min`} · {recipe.difficulty || 'Easy'}</p>
      </div>
    </article>
  );
}

export default RecipeCard;
