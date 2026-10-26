function RecipeCard({ recipe, isSaved = false, onToggleSave }) {
  return (
    <article className="recipe-card">
      <div className="recipe-card__image-wrap">
        <img src={recipe.image || recipe.coverUrl} alt={recipe.title} />
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
        <h3>{recipe.title}</h3>
        <p>{recipe.time || `${recipe.cookTime || 20} min`} · {recipe.difficulty || 'Easy'}</p>
      </div>
    </article>
  );
}

export default RecipeCard;
