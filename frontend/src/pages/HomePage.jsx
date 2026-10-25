import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getRecipes } from '../services/recipeApi';
import { editorialRecipes } from '../data/content';
import RecipeCard from '../components/RecipeCard';

function HomePage({ searchQuery, savedRecipes, onToggleSave }) {
  const [recipes, setRecipes] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadRecipes() {
      try {
        const response = await getRecipes();
        setRecipes(response.data || response);
      } catch (err) {
        setError(err.message);
      }
    }
    loadRecipes();
  }, []);

  const allRecipes = recipes.length ? recipes : editorialRecipes;
  const normalizedQuery = searchQuery.toLowerCase();
  const displayedRecipes = allRecipes
    .filter((recipe) => {
      const searchableText = [
        recipe.title,
        recipe.category,
        recipe.cuisine,
        recipe.description,
        ...(recipe.tags || []),
      ].filter(Boolean).join(' ').toLowerCase();
      return searchableText.includes(normalizedQuery);
    })
    .slice(0, 4);

  return (
    <main id="top">
      <section className="hero-section">
        <div className="hero-copy">
          <p className="eyebrow">Good food, good mood</p>
          <h1>Trying to eat healthy without hating it?</h1>
          <p className="hero-description">Easy, colourful recipes for real life. Make something delicious today and feel good about it tomorrow.</p>
          <Link className="pill-button pill-button--light" to="/#recipes">View recipes <span>→</span></Link>
        </div>
        <div className="hero-art" role="img" aria-label="A colourful healthy toast plate">
          <div className="hero-sun"></div>
          <img src="https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?auto=format&fit=crop&w=900&q=85" alt="Avocado toast with vegetables" />
          <span className="hero-sticker sticker-one">so tasty!</span>
          <span className="hero-sticker sticker-two">plant based</span>
        </div>
      </section>

      <section className="intro-grid" id="stories">
        <div className="intro-photo"><img src="https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=1000&q=85" alt="Colourful fresh ingredients" /></div>
        <div className="intro-copy">
          <p className="eyebrow">A little bit about us</p>
          <h2>Gourmet but good for ya!</h2>
          <p>Welcome to Nourish, where healthy eating doesn&apos;t mean saying goodbye to joy, chocolate, or carbs. We&apos;re breaking up with food shame and redefining what it means to nourish your body.</p>
          <Link className="pill-button pill-button--white" to="/blog">Our story <span>→</span></Link>
        </div>
      </section>

      <section className="recipes-section" id="recipes">
        <div className="section-heading">
          <div><p className="eyebrow">Made for your table</p><h2>Fancy looking meals<br />that are actually delicious</h2></div>
          <Link className="text-link" to="/#recipes">View all recipes <span>→</span></Link>
        </div>
        {error && <p className="api-note">Showing our favourites while recipes load: {error}</p>}
        {searchQuery && <p className="search-summary">Search results for <strong>&quot;{searchQuery}&quot;</strong></p>}
        {displayedRecipes.length ? (
          <div className="recipe-grid">{displayedRecipes.map((recipe, index) => <RecipeCard key={recipe._id || recipe.id || index} recipe={recipe} isSaved={savedRecipes.some((saved) => (saved._id || saved.id) === (recipe._id || recipe.id))} onToggleSave={onToggleSave} />)}</div>
        ) : (
          <p className="empty-results">No recipes found. Try a different search.</p>
        )}
      </section>

      <section className="feature-banner" id="journal">
        <div className="feature-banner__copy">
          <p className="eyebrow">Today&apos;s nourish</p>
          <h2>There&apos;s always time<br />for something lovely.</h2>
          <p>Simple recipes, big flavours, and a little inspiration for every kind of day.</p>
          <Link className="pill-button pill-button--white" to="/blog">Explore the journal <span>→</span></Link>
        </div>
        <img src="https://images.unsplash.com/photo-1543353071-873f17a7a088?auto=format&fit=crop&w=1000&q=85" alt="A table set with a healthy meal" />
      </section>
    </main>
  );
}

export default HomePage;
