import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { useEffect, useState } from 'react';
import SiteFooter from './components/SiteFooter';
import SiteHeader from './components/SiteHeader';
import BlogPage from './pages/BlogPage';
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import ProfilePage from './pages/ProfilePage';
import RecipesPage from './pages/RecipesPage';
import StoryPage from './pages/StoryPage';
import RecipeDetailPage from './pages/RecipeDetailPage';
import CreateRecipePage from './pages/CreateRecipePage';
import BlogPostPage from './pages/BlogPostPage';
import CreateBlogPage from './pages/CreateBlogPage';
import { getBlogs } from './services/recipeApi';
import './App.css';

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [auth, setAuth] = useState(() => JSON.parse(localStorage.getItem('nourishAuth') || 'null'));
  const [savedRecipes, setSavedRecipes] = useState(() => JSON.parse(localStorage.getItem('nourishSavedRecipes') || '[]'));
  const [myRecipes, setMyRecipes] = useState(() => JSON.parse(localStorage.getItem('nourishMyRecipes') || '[]'));
  const [communityBlogPosts, setCommunityBlogPosts] = useState([]);
  const [userBlogPosts, setUserBlogPosts] = useState(() => JSON.parse(localStorage.getItem('nourishUserBlogPosts') || '[]'));

  useEffect(() => {
    getBlogs().then((response) => {
      const posts = response.data || response;
      setCommunityBlogPosts(posts);
      setUserBlogPosts(auth ? posts.filter((post) => {
        const authorId = typeof post.authorId === 'object' ? post.authorId?._id : post.authorId;
        return authorId && String(authorId) === String(auth.user?.id);
      }) : []);
    }).catch(() => {
      // The blog page still shows editorial content when the API is unavailable.
    });
  }, [auth]);

  function handleToggleSave(recipe) {
    setSavedRecipes((current) => {
      const recipeId = recipe._id || recipe.id;
      const next = current.some((saved) => (saved._id || saved.id) === recipeId)
        ? current.filter((saved) => (saved._id || saved.id) !== recipeId)
        : [...current, recipe];
      localStorage.setItem('nourishSavedRecipes', JSON.stringify(next));
      return next;
    });
  }

  function handleLogout() {
    localStorage.removeItem('nourishAuth');
    setAuth(null);
  }

  function handleRecipeCreated(recipe) {
    setMyRecipes((current) => {
      const next = [recipe, ...current.filter((item) => item._id !== recipe._id)];
      localStorage.setItem('nourishMyRecipes', JSON.stringify(next));
      return next;
    });
  }

  function handleBlogCreated(post) {
    setCommunityBlogPosts((current) => [post, ...current]);
    setUserBlogPosts((current) => {
      const next = [post, ...current];
      localStorage.setItem('nourishUserBlogPosts', JSON.stringify(next));
      return next;
    });
  }

  return (
    <BrowserRouter>
      <div className="site-shell">
        <SiteHeader onSearch={setSearchQuery} isAuthenticated={Boolean(auth)} user={auth?.user} />
        <Routes>
          <Route path="/" element={<HomePage searchQuery={searchQuery} savedRecipes={savedRecipes} onToggleSave={handleToggleSave} />} />
          <Route path="/blog" element={<BlogPage isAuthenticated={Boolean(auth)} posts={communityBlogPosts} />} />
          <Route path="/blog/:id" element={<BlogPostPage posts={communityBlogPosts} />} />
          <Route path="/recipes" element={<RecipesPage savedRecipes={savedRecipes} onToggleSave={handleToggleSave} />} />
          <Route path="/recipes/:id/edit" element={auth ? <CreateRecipePage auth={auth} isEditing onCreated={handleRecipeCreated} /> : <AuthPage mode="signin" onAuthenticated={setAuth} />} />
          <Route path="/recipes/:id" element={auth ? <RecipeDetailPage auth={auth} /> : <AuthPage mode="signin" onAuthenticated={setAuth} />} />
          <Route path="/story" element={<StoryPage />} />
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
