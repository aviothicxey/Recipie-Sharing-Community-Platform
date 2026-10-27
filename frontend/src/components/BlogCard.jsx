import { Link } from 'react-router-dom';

function BlogCard({ post, featured = false }) {
  return (
    <article className={`blog-card${featured ? ' blog-card--featured' : ''}`}>
      <img src={post.image} alt="" />
      <div className="blog-card__body">
        <p className="eyebrow">{post.contentType === 'editorial' ? 'Editorial' : `By ${post.authorId?.name || 'Community member'}`} · {post.category}</p>
        <h2>{post.title}</h2>
        <p>{post.excerpt}</p>
        <div className="blog-card__meta">
          <span>{post.date || new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          <Link to={`/blog/${post.id}`} aria-label={`Read ${post.title}`}>Read more <span>→</span></Link>
        </div>
      </div>
    </article>
  );
}

export default BlogCard;
