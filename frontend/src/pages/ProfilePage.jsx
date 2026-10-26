import { Link, useNavigate } from 'react-router-dom';
import RecipeCard from '../components/RecipeCard';

function ProfilePage({ auth, savedRecipes, onToggleSave, onLogout }) {
  const navigate = useNavigate();
  const user = auth?.user || {};

  function handleLogout() {
    onLogout();
    navigate('/');
  }

  if (user.role === 'admin') {
    return (
      <main className="profile-page">
        <section className="profile-hero">
          <div className="profile-avatar">{user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'A'}</div>
          <div>
            <p className="eyebrow">Nourish administration</p>
            <h1>{user.name || 'Administrator'}</h1>
            <p>{user.email}</p>
          </div>
          <button className="profile-logout" type="button" onClick={handleLogout}>Sign out</button>
        </section>
      </main>
    );
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
      <section className="profile-content">
        <div className="profile-heading">
          <div><p className="eyebrow">Your collection</p><h2>Saved recipes</h2></div>
          <Link className="text-link" to="/#recipes">Discover recipes <span>→</span></Link>
        </div>
        {savedRecipes.length ? (
          <div className="recipe-grid">
            {savedRecipes.map((recipe) => <RecipeCard key={recipe._id || recipe.id} recipe={recipe} isSaved onToggleSave={onToggleSave} />)}
          </div>
        ) : (
          <div className="empty-profile">
            <h3>Your saved recipes will appear here.</h3>
            <p>Tap the heart on any recipe you want to make later.</p>
            <Link className="pill-button pill-button--green" to="/#recipes">Find a recipe <span>→</span></Link>
          </div>
        )}
      </section>
    </main>
  );
}

export default ProfilePage;
