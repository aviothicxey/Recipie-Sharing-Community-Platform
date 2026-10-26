import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { editorialRecipes } from '../data/content';
import { getRecipes } from '../services/recipeApi';
import RecipeCard from '../components/RecipeCard';

function RecipesPage({ savedRecipes, onToggleSave }) {
  const [communityRecipes, setCommunityRecipes] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [ingredientInput, setIngredientInput] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    getRecipes(ingredients)
      .then((response) => setCommunityRecipes(response.data || response))
      .catch((err) => setError(err.message));
  }, [ingredients]);

  function addIngredient(event) {
    event.preventDefault();
    const value = ingredientInput.trim().toLowerCase();
    if (value && !ingredients.includes(value)) setIngredients((current) => [...current, value]);
    setIngredientInput('');
  }

  const filteredEditorialRecipes = ingredients.length
    ? editorialRecipes.filter((recipe) => ingredients.some((ingredient) => (
      (recipe.ingredients || []).some((item) => item.name.toLowerCase() === ingredient)
    )))
    : editorialRecipes;

  return (
    <main className="listing-page">
      <section className="listing-hero">
        <p className="eyebrow">The Nourish table</p>
        <h1>Recipes made<br /><em>to share.</em></h1>
        <p>Discover community favourites, everyday comfort food, and colourful ideas for your next meal.</p>
      </section>
      <section className="listing-content" id="recipes">
        <div className="section-heading">
          <div><p className="eyebrow">Community recipes</p><h2>Find your next favourite</h2></div>
          <Link className="pill-button pill-button--green" to="/create-recipe">Share a recipe <span>→</span></Link>
        </div>
        <form className="ingredient-filter" onSubmit={addIngredient}>
          <label htmlFor="ingredient-search">Filter by ingredients</label>
          <div><input id="ingredient-search" value={ingredientInput} onChange={(event) => setIngredientInput(event.target.value)} placeholder="Add an ingredient, e.g. tomato" /><button className="pill-button pill-button--green" type="submit">Add</button></div>
          <div className="ingredient-chips">{ingredients.map((ingredient) => <button type="button" key={ingredient} onClick={() => setIngredients((current) => current.filter((item) => item !== ingredient))}>{ingredient} ×</button>)}</div>
          <small>A recipe appears when it contains any one of the ingredients you add.</small>
        </form>
        {error && <p className="api-note">Community recipes could not load: {error}</p>}
        <h3 className="content-subheading">Editorial favourites</h3>
        <div className="recipe-grid">
          {filteredEditorialRecipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              isSaved={savedRecipes.some((saved) => (saved._id || saved.id) === (recipe._id || recipe.id))}
              onToggleSave={onToggleSave}
            />
          ))}
        </div>
        {!filteredEditorialRecipes.length && <p className="empty-results">No editorial recipes contain those ingredients.</p>}
        <h3 className="content-subheading">Community recipes</h3>
        {communityRecipes.length ? <div className="recipe-grid">{communityRecipes.map((recipe) => <RecipeCard key={recipe._id} recipe={recipe} isSaved={savedRecipes.some((saved) => (saved._id || saved.id) === recipe._id)} onToggleSave={onToggleSave} />)}</div> : <p className="empty-results">No community recipes match those ingredients yet.</p>}
      </section>
    </main>
  );
}

export default RecipesPage;
