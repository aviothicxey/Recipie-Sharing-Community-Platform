import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import RecipeCard from '../components/RecipeCard';
import { getRecipes } from '../services/recipeApi';

function ProfilePage({ auth, savedRecipes, myRecipes, blogPosts, onToggleSave, onLogout }) {
  const navigate = useNavigate();
  const user = auth?.user || {};
  const [ownedRecipes, setOwnedRecipes] = useState(myRecipes || []);
  const [recipeLoadError, setRecipeLoadError] = useState('');

  useEffect(() => {
    let isMounted = true;

    getRecipes()
      .then((response) => {
        const recipes = response.data || response;
        const userRecipes = recipes.filter((recipe) => {
          const authorId = typeof recipe.authorId === 'object' ? recipe.authorId?._id : recipe.authorId;
          return authorId && String(authorId) === String(user.id);
        });
        if (isMounted) {
          setOwnedRecipes((current) => {
            const merged = [...userRecipes, ...current];
            return merged.filter((recipe, index, list) => (
              list.findIndex((item) => String(item._id || item.id) === String(recipe._id || recipe.id)) === index
            ));
          });
        }
      })
      .catch((error) => {
        if (isMounted) setRecipeLoadError(error.message);
      });

    return () => {
      isMounted = false;
    };
  }, [user.id]);

  function handleLogout() {
    onLogout();
    navigate('/');
  }

  return (
    <main className="profile-page">
      <section className="profile-hero">
        <div className="profile-avatar">{user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}</div>
        <div>
          <p className="eyebrow">Your Nourish profile</p>
          <h1>{user.name || 'Nourish member'}</h1>
          <p>{user.email}</p>
        </div>
        <button className="profile-logout" type="button" onClick={handleLogout}>Sign out</button>
      </section>
      <section className="profile-content profile-content--owned">
        <div className="profile-heading">
          <div><p className="eyebrow">Your contributions</p><h2>Your recipes & blogs</h2></div>
          <div className="profile-actions">
            <Link className="pill-button pill-button--green" to="/create-recipe">Add recipe <span>→</span></Link>
            <Link className="pill-button pill-button--white" to="/create-blog">Add blog <span>→</span></Link>
          </div>
        </div>
        {recipeLoadError && !ownedRecipes.length && <p className="api-note">We could not load your published recipes: {recipeLoadError}</p>}
        {ownedRecipes.length ? (
          <div className="recipe-grid">{ownedRecipes.map((recipe) => <RecipeCard key={recipe._id || recipe.id} recipe={recipe} onToggleSave={onToggleSave} />)}</div>
        ) : <div className="empty-profile"><h3>You have not shared a recipe yet.</h3><Link className="text-link" to="/create-recipe">Add your first recipe <span>→</span></Link></div>}
        {blogPosts?.length ? (
          <div className="blog-grid profile-blog-grid">{blogPosts.map((post) => <article className="profile-blog-item" key={post.id}><p className="eyebrow">{post.category}</p><h3>{post.title}</h3><Link className="text-link" to={`/blog/${post.id}`}>Read post <span>→</span></Link></article>)}</div>
        ) : <div className="empty-profile"><h3>You have not written a blog post yet.</h3><Link className="text-link" to="/create-blog">Write your first post <span>→</span></Link></div>}
      </section>
      <section className="profile-content">
        <div className="profile-heading">
          <div><p className="eyebrow">Your collection</p><h2>Saved recipes</h2></div>
          <div className="profile-actions">
            <Link className="pill-button pill-button--green" to="/create-recipe">Share a recipe <span>→</span></Link>
            <Link className="text-link" to="/recipes">Discover recipes <span>→</span></Link>
          </div>
        </div>
        {savedRecipes.length ? (
          <div className="recipe-grid">
            {savedRecipes.map((recipe) => <RecipeCard key={recipe._id || recipe.id} recipe={recipe} isSaved onToggleSave={onToggleSave} />)}
          </div>
        ) : (
          <div className="empty-profile">
            <h3>Your saved recipes will appear here.</h3>
            <p>Tap the heart on any recipe you want to make later.</p>
            <Link className="pill-button pill-button--green" to="/recipes">Find a recipe <span>→</span></Link>
          </div>
        )}
      </section>
    </main>
  );
}

export default ProfilePage;
