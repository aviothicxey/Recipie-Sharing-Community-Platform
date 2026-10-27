import { useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import SiteFooter from './components/SiteFooter';
import SiteHeader from './components/SiteHeader';
import AuthPage from './pages/AuthPage';
import AdminPage from './pages/AdminPage';
import BlogPage from './pages/BlogPage';
import BlogPostPage from './pages/BlogPostPage';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';

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
