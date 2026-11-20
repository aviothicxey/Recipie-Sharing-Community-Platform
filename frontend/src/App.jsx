import { useEffect, useState } from 'react';
import { SignIn, SignUp } from '@clerk/react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import SiteFooter from './components/SiteFooter';
import SiteHeader from './components/SiteHeader';
import AuthPage from './pages/AuthPage';
import AdminPage from './pages/AdminPage';
import BlogPage from './pages/BlogPage';
import CommunityPage from './pages/CommunityPage';
import BlogPostPage from './pages/BlogPostPage';
import CreateBlogPage from './pages/CreateBlogPage';
import CreateRecipePage from './pages/CreateRecipePage';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import RecipesPage from './pages/RecipesPage';
import RecipeDetailPage from './pages/RecipeDetailPage';
import StoryPage from './pages/StoryPage';
import { getBlogs, getRecipes } from './services/recipeApi';

function App({ googleEnabled, clerkSignedIn, clerkAuth, clerkError, clerkSignOut, onClerkProfileUpdated }) {
  const [passwordAuth, setAuth] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('nourishAuth')) || null;
    } catch {
      return null;
    }
  });
  const auth = clerkSignedIn ? clerkAuth : passwordAuth;
  const [savedRecipes, setSavedRecipes] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('nourishSavedRecipes')) || [];
    } catch {
      return [];
    }
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [communityRecipes, setCommunityRecipes] = useState([]);
  const [communityBlogPosts, setCommunityBlogPosts] = useState([]);

  useEffect(() => {
    getRecipes().then((result) => setCommunityRecipes(result.data || result)).catch(() => {});
    getBlogs().then((result) => setCommunityBlogPosts(result.data || result)).catch(() => {});
  }, []);

  function handleAuthenticated(result) {
    setAuth(result);
  }

  function handleProfileUpdated(user) {
    if (clerkSignedIn) {
      onClerkProfileUpdated(user);
    } else {
      const updatedAuth = { ...passwordAuth, user };
      localStorage.setItem('nourishAuth', JSON.stringify(updatedAuth));
      setAuth(updatedAuth);
    }
  }

  async function handleLogout() {
    localStorage.removeItem('nourishAuth');
    setAuth(null);
    if (clerkSignedIn) await clerkSignOut();
  }

  function handleToggleSave(recipe) {
    const recipeId = recipe._id || recipe.id;
    setSavedRecipes((current) => {
      const next = current.some((saved) => (saved._id || saved.id) === recipeId)
        ? current.filter((saved) => (saved._id || saved.id) !== recipeId)
        : [...current, recipe];
      localStorage.setItem('nourishSavedRecipes', JSON.stringify(next));
      return next;
    });
  }

  function handleRecipeCreated(recipe) {
    setCommunityRecipes((current) => [recipe, ...current.filter((item) => item._id !== recipe._id)]);
  }

  function handleBlogCreated(post) {
    setCommunityBlogPosts((current) => [post, ...current.filter((item) => item._id !== post._id)]);
  }

  const userId = auth?.user?._id || auth?.user?.id;
  const myRecipes = communityRecipes.filter((recipe) => String(recipe.authorId?._id || recipe.authorId) === String(userId));
  const userBlogPosts = communityBlogPosts.filter((post) => String(post.authorId?._id || post.authorId) === String(userId));

  const signIn = clerkSignedIn ? (
    <main className="auth-page">
      <section className="auth-card">
        {clerkError ? (
          <>
            <p className="auth-error" role="alert">{clerkError}</p>
            <button className="pill-button pill-button--green" type="button" onClick={handleLogout}>Sign out of Google session</button>
          </>
        ) : <p role="status">Loading your account…</p>}
      </section>
    </main>
  ) : <AuthPage mode="signin" googleEnabled={googleEnabled} onAuthenticated={setAuth} />;

  return (
    <BrowserRouter>
      <div className="site-shell">
        <SiteHeader
          onSearch={setSearchQuery}
          isAuthenticated={Boolean(auth)}
          user={auth?.user}
          token={auth?.token}
        />
        <Routes>
          <Route path="/" element={<HomePage searchQuery={searchQuery} savedRecipes={savedRecipes} onToggleSave={handleToggleSave} />} />
          <Route path="/blog" element={<BlogPage isAuthenticated={Boolean(auth)} posts={communityBlogPosts} />} />
          <Route path="/community" element={auth ? <CommunityPage key={userId} auth={auth} /> : signIn} />
          <Route path="/blog/:id" element={<BlogPostPage posts={communityBlogPosts} />} />
          <Route path="/recipes" element={<RecipesPage savedRecipes={savedRecipes} onToggleSave={handleToggleSave} />} />
          <Route path="/recipes/:id/edit" element={auth ? <CreateRecipePage auth={auth} isEditing onCreated={handleRecipeCreated} /> : signIn} />
          <Route path="/recipes/:id" element={auth ? <RecipeDetailPage auth={auth} savedRecipes={savedRecipes} onToggleSave={handleToggleSave} /> : signIn} />
          <Route path="/story" element={<StoryPage />} />
          <Route path="/admin" element={clerkSignedIn && !auth ? signIn : <AdminPage key={userId} auth={auth} onAuthenticated={handleAuthenticated} />} />
          <Route path="/create-recipe" element={auth ? <CreateRecipePage auth={auth} onCreated={handleRecipeCreated} /> : signIn} />
          <Route path="/create-blog" element={auth ? <CreateBlogPage auth={auth} onCreated={handleBlogCreated} /> : signIn} />
          <Route path="/signin" element={auth ? <Navigate to="/profile" replace /> : signIn} />
          <Route path="/signup" element={auth ? <Navigate to="/profile" replace /> : clerkSignedIn ? signIn : <AuthPage mode="signup" googleEnabled={googleEnabled} onAuthenticated={setAuth} />} />
          {googleEnabled && (
            <>
              <Route path="/google" element={clerkSignedIn ? (clerkAuth ? <Navigate to="/profile" replace /> : signIn) : (
                <main className="auth-page">
                  <SignIn routing="hash" signUpUrl="/google/signup" forceRedirectUrl="/profile" signUpForceRedirectUrl="/profile" />
                </main>
              )} />
              <Route path="/google/signup" element={clerkSignedIn ? (clerkAuth ? <Navigate to="/profile" replace /> : signIn) : (
                <main className="auth-page">
                  <SignUp routing="hash" signInUrl="/google" forceRedirectUrl="/profile" signInForceRedirectUrl="/profile" />
                </main>
              )} />
            </>
          )}
          <Route path="/profile" element={auth ? <ProfilePage key={userId} auth={auth} savedRecipes={savedRecipes} myRecipes={myRecipes} blogPosts={userBlogPosts} onToggleSave={handleToggleSave} onLogout={handleLogout} onProfileUpdated={handleProfileUpdated} /> : signIn} />
        </Routes>
        <SiteFooter isAuthenticated={Boolean(auth)} />
      </div>
    </BrowserRouter>
  );
}

export default App;
