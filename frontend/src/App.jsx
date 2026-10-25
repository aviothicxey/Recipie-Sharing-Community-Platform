import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { useState } from 'react';
import SiteFooter from './components/SiteFooter';
import SiteHeader from './components/SiteHeader';
import BlogPage from './pages/BlogPage';
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import ProfilePage from './pages/ProfilePage';
import './App.css';

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [auth, setAuth] = useState(() => JSON.parse(localStorage.getItem('nourishAuth') || 'null'));
  const [savedRecipes, setSavedRecipes] = useState(() => JSON.parse(localStorage.getItem('nourishSavedRecipes') || '[]'));

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

  return (
    <BrowserRouter>
      <div className="site-shell">
        <SiteHeader onSearch={setSearchQuery} isAuthenticated={Boolean(auth)} user={auth?.user} />
        <Routes>
          <Route path="/" element={<HomePage searchQuery={searchQuery} savedRecipes={savedRecipes} onToggleSave={handleToggleSave} />} />
          <Route path="/blog" element={<BlogPage isAuthenticated={Boolean(auth)} />} />
          <Route path="/signin" element={<AuthPage mode="signin" onAuthenticated={setAuth} />} />
          <Route path="/signup" element={<AuthPage mode="signup" onAuthenticated={setAuth} />} />
          <Route path="/profile" element={auth ? <ProfilePage auth={auth} savedRecipes={savedRecipes} onToggleSave={handleToggleSave} onLogout={handleLogout} /> : <AuthPage mode="signin" onAuthenticated={setAuth} />} />
        </Routes>
        <SiteFooter isAuthenticated={Boolean(auth)} />
      </div>
    </BrowserRouter>
  );
}

export default App;
