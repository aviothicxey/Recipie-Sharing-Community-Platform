import { Link } from 'react-router-dom';
import { useState } from 'react';

function SiteHeader({ onSearch, isAuthenticated, user }) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [query, setQuery] = useState('');

  function handleSubmit(event) {
    event.preventDefault();
    onSearch(query.trim());
    document.getElementById('recipes')?.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <header className="site-header">
      <Link className="brand" to="/" aria-label="Nourish home">nourish<span>.</span></Link>
      <div className="header-right">
        <nav className="main-nav" aria-label="Main navigation">
          <Link to="/recipes">Recipes <small>⌄</small></Link>
          <Link to="/story">Our story <small>⌄</small></Link>
          <Link to="/blog">Journal <small>⌄</small></Link>
        </nav>
        <div className="header-actions">
          {isSearchOpen && (
            <form className="navbar-search" onSubmit={handleSubmit}>
              <label className="sr-only" htmlFor="navbar-search-input">Search recipes</label>
              <input
                id="navbar-search-input"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search recipes"
                autoFocus
              />
            </form>
          )}
          <button
            type="button"
            aria-label={isSearchOpen ? 'Close search' : 'Search'}
            onClick={() => setIsSearchOpen((open) => !open)}
          >
            {isSearchOpen ? '×' : '⌕'}
          </button>
          {!isAuthenticated && <div className="auth-links"><Link to="/signin">Sign in</Link><Link className="auth-signup" to="/signup">Sign up</Link></div>}
          {isAuthenticated && (
            <Link className="user-avatar" to="/profile" aria-label="Open your profile">
              {user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
            </Link>
          )}
          <button className="menu-button" type="button" aria-label="Open menu">☰</button>
        </div>
      </div>
    </header>
  );
}

export default SiteHeader;
