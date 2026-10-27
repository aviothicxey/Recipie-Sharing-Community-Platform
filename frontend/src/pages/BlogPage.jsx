import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { blogPosts } from '../data/content';
import BlogCard from '../components/BlogCard';
import { getBlogs } from '../services/blogApi';

function BlogPage({ isAuthenticated, posts: suppliedPosts }) {
  const communityPosts = suppliedPosts || [];
  const [featuredPost, ...posts] = communityPosts;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    getBlogs()
      .then((response) => {
        const posts = Array.isArray(response) ? response : response.data;
        if (Array.isArray(posts) && posts.length > 0) {
          setPostsData(posts.map((post) => ({ ...post, id: post.id || post.slug })));
        }
      })
      .catch(() => {});
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
        <h3 className="content-subheading">Editorial journal</h3>
        <div className="blog-grid">{blogPosts.map((post) => <BlogCard key={post.id} post={post} />)}</div>
        <h3 className="content-subheading">Community blogs</h3>
        {featuredPost ? <><BlogCard post={featuredPost} featured /><div className="blog-grid">{posts.map((post) => <BlogCard key={post._id || post.id} post={post} />)}</div></> : <p className="empty-results">No community blog posts yet. Be the first to share one.</p>}
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
