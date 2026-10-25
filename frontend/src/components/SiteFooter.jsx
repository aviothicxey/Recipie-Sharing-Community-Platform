import { Link } from 'react-router-dom';

function SiteFooter({ isAuthenticated }) {
  return (
    <footer className="site-footer">
      <Link className="brand" to="/">nourish<span>.</span></Link>
      <p>Eat well. Feel well. Live well.</p>
      <div className="footer-links">
        <Link to="/#recipes">Recipes</Link>
        <Link to="/#stories">Our story</Link>
        <Link to="/blog">Journal</Link>
        {isAuthenticated ? <Link to="/profile">Profile</Link> : <><Link to="/signin">Sign in</Link><Link to="/signup">Sign up</Link></>}
      </div>
    </footer>
  );
}

export default SiteFooter;
