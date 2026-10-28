import { useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import SiteFooter from './components/SiteFooter';
import SiteHeader from './components/SiteHeader';
import AuthPage from './pages/AuthPage';
import AdminPage from './pages/AdminPage';
import BlogPage from './pages/BlogPage';
import BlogPostPage from './pages/BlogPostPage';
import CreateBlogPage from './pages/CreateBlogPage';
import CreateRecipePage from './pages/CreateRecipePage';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import RecipesPage from './pages/RecipesPage';
import RecipeDetailPage from './pages/RecipeDetailPage';
import StoryPage from './pages/StoryPage';
import { getBlogs, getRecipes } from './services/recipeApi';

function App() {
  const [auth, setAuth] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('nourishAuth')) || null;
    } catch {
      return null;
    }
  });
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

  function handleLogout() {
    localStorage.removeItem('nourishAuth');
    setAuth(null);
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

  return (
    <BrowserRouter>
      <div className="site-shell">
        <SiteHeader
          onSearch={setSearchQuery}
          isAuthenticated={Boolean(auth)}
          user={auth?.user}
        />
        <Routes>
          <Route path="/" element={<HomePage searchQuery={searchQuery} savedRecipes={savedRecipes} onToggleSave={handleToggleSave} />} />
          <Route path="/blog" element={<BlogPage isAuthenticated={Boolean(auth)} posts={communityBlogPosts} />} />
          <Route path="/blog/:id" element={<BlogPostPage posts={communityBlogPosts} />} />
          <Route path="/recipes" element={<RecipesPage savedRecipes={savedRecipes} onToggleSave={handleToggleSave} />} />
          <Route path="/recipes/:id/edit" element={auth ? <CreateRecipePage auth={auth} isEditing onCreated={handleRecipeCreated} /> : <AuthPage mode="signin" onAuthenticated={setAuth} />} />
          <Route path="/recipes/:id" element={auth ? <RecipeDetailPage auth={auth} savedRecipes={savedRecipes} onToggleSave={handleToggleSave} /> : <AuthPage mode="signin" onAuthenticated={setAuth} />} />
          <Route path="/story" element={<StoryPage />} />
          <Route path="/admin" element={<AdminPage auth={auth} onAuthenticated={handleAuthenticated} />} />
          <Route path="/create-recipe" element={auth ? <CreateRecipePage auth={auth} onCreated={handleRecipeCreated} /> : <AuthPage mode="signin" onAuthenticated={setAuth} />} />
          <Route path="/create-blog" element={auth ? <CreateBlogPage auth={auth} onCreated={handleBlogCreated} /> : <AuthPage mode="signin" onAuthenticated={setAuth} />} />
          <Route path="/signin" element={<AuthPage mode="signin" onAuthenticated={setAuth} />} />
          <Route path="/signup" element={<AuthPage mode="signup" onAuthenticated={setAuth} />} />
          <Route path="/profile" element={auth ? <ProfilePage auth={auth} savedRecipes={savedRecipes} myRecipes={myRecipes} blogPosts={userBlogPosts} onToggleSave={handleToggleSave} onLogout={handleLogout} /> : <AuthPage mode="signin" onAuthenticated={setAuth} />} />
        </Routes>
        <SiteFooter isAuthenticated={Boolean(auth)} />
      </div>
    </BrowserRouter>
  );
}

export default App;
