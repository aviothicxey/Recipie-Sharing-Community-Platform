import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import RecipeCard from '../components/RecipeCard';
import ProfileEditor from '../components/ProfileEditor';
import { createChannel, getMyRecipes, getRecipes } from '../services/recipeApi';

function ProfilePage({ auth, savedRecipes, myRecipes, blogPosts, onToggleSave, onLogout, onProfileUpdated }) {
  const navigate = useNavigate();
  const user = auth?.user || {};
  const [ownedRecipes, setOwnedRecipes] = useState(myRecipes || []);
  const [recipeLoadError, setRecipeLoadError] = useState('');
  const [isLoadingRecipes, setIsLoadingRecipes] = useState(true);
  const [channelName, setChannelName] = useState('');
  const [channelDescription, setChannelDescription] = useState('');
  const [channelMessage, setChannelMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [profileMessage, setProfileMessage] = useState('');
  const avatar = <div className="profile-avatar">{user.avatarUrl ? <img src={user.avatarUrl} alt={`${user.name || 'Your'} profile`} /> : user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}</div>;
  const editButton = user.id !== 'configured-admin' && <button className="pill-button pill-button--white" type="button" aria-expanded={isEditing} onClick={() => { setIsEditing(true); setProfileMessage(''); }}>Edit profile</button>;
  const editor = isEditing ? <ProfileEditor auth={auth} onCancel={() => setIsEditing(false)} onSaved={(updatedUser) => { onProfileUpdated(updatedUser); setIsEditing(false); setProfileMessage('Your profile has been updated.'); }} /> : profileMessage && <p className="profile-save-message" role="status">{profileMessage}</p>;

  useEffect(() => {
    let isMounted = true;

    getMyRecipes(auth.token)
      .then((response) => {
        const recipes = response.data || response;
        if (isMounted) {
          setOwnedRecipes((current) => {
            const merged = [...recipes, ...current];
            return merged.filter((recipe, index, list) => (
              list.findIndex((item) => String(item._id || item.id) === String(recipe._id || recipe.id)) === index
            ));
          });
        }
      })
      .catch((error) => {
        // Keep profiles working while an older deployment is rolling out the
        // authenticated endpoint. The public list is still filtered by owner.
        return getRecipes()
          .then((response) => {
            const recipes = response.data || response;
            const userRecipes = recipes.filter((recipe) => String(recipe.authorId?._id || recipe.authorId) === String(user.id));
            if (isMounted) {
              setOwnedRecipes((current) => [...userRecipes, ...current].filter((recipe, index, list) => (
                list.findIndex((item) => String(item._id || item.id) === String(recipe._id || recipe.id)) === index
              )));
              setRecipeLoadError('');
            }
          })
          .catch(() => {
            if (isMounted) setRecipeLoadError(error.message);
          });
      })
      .finally(() => {
        if (isMounted) setIsLoadingRecipes(false);
      });

    return () => {
      isMounted = false;
    };
  }, [auth.token, user.id]);

  function handleLogout() {
    onLogout();
    navigate('/');
  }

  async function handleCreateChannel(event) {
    event.preventDefault();
    try {
      await createChannel(channelName, channelDescription, auth.token);
      setChannelMessage('Your broadcast group is ready. Members can find it in Community.');
      setChannelName('');
      setChannelDescription('');
    } catch (error) {
      setChannelMessage(error.message);
    }
  }

  if (user.role === 'admin') {
    return (
      <main className="profile-page">
        <section className="profile-hero">
          {avatar}
          <div>
            <p className="eyebrow">Nourish administration</p>
            <h1>{user.name || 'Administrator'}</h1>
            <p>{user.email}</p>
          </div>
          <div className="profile-hero-actions">
            {editButton}
            <Link className="pill-button pill-button--white" to="/admin">Administrator page <span>→</span></Link>
            <button className="profile-logout" type="button" onClick={handleLogout}>Sign out</button>
          </div>
        </section>
        {editor}
      </main>
    );
  }

  return (
    <main className="profile-page">
      <section className="profile-hero">
        {avatar}
        <div>
          <p className="eyebrow">Your Nourish profile</p>
          <h1>{user.name || 'Nourish member'}</h1>
          <p>{user.email}</p>
          {user.bio && <p>{user.bio}</p>}
        </div>
        <div className="profile-hero-actions">
          {editButton}
          <button className="profile-logout" type="button" onClick={handleLogout}>Sign out</button>
        </div>
      </section>
      {editor}
      <section className="profile-content profile-content--owned">
        <div className="profile-heading">
          <div><p className="eyebrow">Your contributions</p><h2>Your recipes & blogs</h2></div>
          <div className="profile-actions">
            <Link className="pill-button pill-button--green" to="/create-recipe">Add recipe <span>→</span></Link>
            <Link className="pill-button pill-button--white" to="/create-blog">Add blog <span>→</span></Link>
          </div>
        </div>
        {recipeLoadError && !ownedRecipes.length && <p className="api-note">We could not connect to the recipe service: {recipeLoadError}. Please refresh after the backend is available.</p>}
        {isLoadingRecipes ? <p className="empty-profile">Loading your recipes...</p> : ownedRecipes.length ? (
          <div className="recipe-grid">{ownedRecipes.map((recipe) => <RecipeCard key={recipe._id || recipe.id} recipe={recipe} onToggleSave={onToggleSave} />)}</div>
        ) : <div className="empty-profile"><h3>You have not shared a recipe yet.</h3><Link className="text-link" to="/create-recipe">Add your first recipe <span>→</span></Link></div>}
        {blogPosts?.length ? (
          <div className="blog-grid profile-blog-grid">{blogPosts.map((post) => <article className="profile-blog-item" key={post.id}><p className="eyebrow">{post.category}</p><h3>{post.title}</h3><Link className="text-link" to={`/blog/${post.id}`}>Read post <span>→</span></Link></article>)}</div>
        ) : <div className="empty-profile"><h3>You have not written a blog post yet.</h3><Link className="text-link" to="/create-blog">Write your first post <span>→</span></Link></div>}
      </section>
      <section className="profile-content">
        <div className="profile-heading">
          <div><p className="eyebrow">Your community</p><h2>Start a broadcast group</h2></div>
          <div className="profile-actions"><Link className="text-link" to="/community">Explore community <span>→</span></Link><Link className="text-link" to="/community?mine=1">Open your group <span>→</span></Link></div>
        </div>
        <p>Only create a group when you want to share updates, posts, and cooking conversations with followers.</p>
        <form className="channel-create-form" onSubmit={handleCreateChannel}>
          <input value={channelName} onChange={(event) => setChannelName(event.target.value)} placeholder="Group name" maxLength={100} required />
          <input value={channelDescription} onChange={(event) => setChannelDescription(event.target.value)} placeholder="What will you share?" maxLength={500} />
          <button className="pill-button pill-button--green" type="submit">Create group</button>
        </form>
        {channelMessage && <p className="api-note">{channelMessage}</p>}
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
