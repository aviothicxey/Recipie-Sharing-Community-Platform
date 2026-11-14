import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getNotifications, markNotificationsRead } from '../services/recipeApi';

function SiteHeader({ onSearch, isAuthenticated, user, token }) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [areNotificationsOpen, setAreNotificationsOpen] = useState(false);
  const [notificationError, setNotificationError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      return undefined;
    }

    let cancelled = false;
    async function loadNotifications() {
      try {
        const loadedNotifications = await getNotifications(token);
        if (!cancelled) {
          setNotifications(loadedNotifications);
          setNotificationError('');
        }
      } catch (error) {
        if (!cancelled) setNotificationError(error.message);
      }
    }

    loadNotifications();
    const timer = setInterval(loadNotifications, 10000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [isAuthenticated, token]);

  async function handleNotificationsToggle() {
    const opening = !areNotificationsOpen;
    setAreNotificationsOpen(opening);
    if (!opening) return;

    try {
      await markNotificationsRead(token);
      setNotifications((current) => current.map((notification) => ({
        ...notification,
        readAt: notification.readAt || new Date().toISOString()
      })));
    } catch (error) {
      setNotificationError(error.message);
    }
  }

  function closeMenu() {
    setIsMenuOpen(false);
  }

  function handleSubmit(event) {
    event.preventDefault();
    onSearch(query.trim());
    document.getElementById('recipes')?.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <header className="site-header">
      <Link className="brand" to="/" aria-label="Nourish home">nourish<span>.</span></Link>
      <div className="header-right">
        <nav className={`main-nav${isMenuOpen ? ' main-nav--open' : ''}`} aria-label="Main navigation">
          <Link to="/recipes" onClick={closeMenu}>Recipes <small>⌄</small></Link>
          <Link to="/story" onClick={closeMenu}>Our story <small>⌄</small></Link>
          <Link to="/blog" onClick={closeMenu}>Journal <small>⌄</small></Link>
          {isAuthenticated && <Link to="/community" onClick={closeMenu}>Community <small>⌄</small></Link>}
          {isAuthenticated && user?.role === 'admin' && <Link className="mobile-admin-link" to="/admin" onClick={closeMenu}>Administrator</Link>}
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
          {isAuthenticated && (
            <div className="notification-menu">
              <button
                className="notification-button"
                type="button"
                aria-label="Open notifications"
                aria-expanded={areNotificationsOpen}
                onClick={handleNotificationsToggle}
              >
                ⩍
                {notifications.some((notification) => !notification.readAt) && <span className="notification-count">!</span>}
              </button>
              {areNotificationsOpen && (
                <div className="notification-popover" role="region" aria-label="Notifications">
                  <strong>Notifications</strong>
                  {notificationError && <p className="notification-error">{notificationError}</p>}
                  {!notificationError && !notifications.length && <p className="notification-empty">You are all caught up.</p>}
                  {notifications.map((notification) => (
                    <p className="notification-item" key={notification._id}>
                      {notification.text}
                      <small>{new Date(notification.createdAt).toLocaleString()}</small>
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}
          {!isAuthenticated && <div className="auth-links"><Link to="/signin">Sign in</Link><Link className="auth-signup" to="/signup">Sign up</Link></div>}
          {isAuthenticated && (
            <Link className="user-avatar" to="/profile" aria-label="Open your profile">
              {user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
            </Link>
          )}
          <button className="menu-button" type="button" aria-label={isMenuOpen ? 'Close menu' : 'Open menu'} aria-expanded={isMenuOpen} onClick={() => setIsMenuOpen((open) => !open)}>☰</button>
        </div>
      </div>
    </header>
  );
}

export default SiteHeader;
