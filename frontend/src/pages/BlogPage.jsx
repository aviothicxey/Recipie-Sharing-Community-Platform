import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import { blogPosts } from '../data/content';
import BlogCard from '../components/BlogCard';

function BlogPage({ isAuthenticated }) {
  const [featuredPost, ...posts] = blogPosts;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  return (
    <main className="blog-page">
      <section className="blog-hero">
        <p className="eyebrow">The Nourish journal</p>
        <h1>Watch, eat,<br /><em>learn.</em></h1>
        <p>Thoughtful stories, practical tips, and a little inspiration for making everyday eating feel more joyful.</p>
      </section>
      <section className="blog-content">
        <div className="blog-heading">
          <div><p className="eyebrow">Fresh from the journal</p><h2>Good things to read</h2></div>
          <Link className="text-link" to="/">Back to recipes <span>→</span></Link>
        </div>
        <BlogCard post={featuredPost} featured />
        <div className="blog-grid">{posts.map((post) => <BlogCard key={post.id} post={post} />)}</div>
      </section>
      {!isAuthenticated && <section className="blog-signup">
        <p className="eyebrow">A note from us</p>
        <h2>Good food is a form of self-care.</h2>
        <p>Join our little corner of the internet for fresh recipes and nourishing ideas.</p>
        <form onSubmit={(event) => event.preventDefault()}>
          <label className="sr-only" htmlFor="email">Email address</label>
          <input id="email" type="email" placeholder="Your email address" required />
          <button className="pill-button pill-button--white" type="submit">Sign me up <span>→</span></button>
        </form>
      </section>}
    </main>
  );
}

export default BlogPage;
