import { Link, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { blogPosts } from '../data/content';
import { getBlog } from '../services/recipeApi';

function BlogPostPage({ posts: suppliedPosts }) {
  const { id } = useParams();
  const post = [...(suppliedPosts || []), ...blogPosts].find((item) => String(item.id || item._id) === id);
  const [loadedPost, setLoadedPost] = useState(post);
  const [error, setError] = useState('');

  useEffect(() => {
    if (post) return;
    getBlog(id).then(setLoadedPost).catch((loadError) => setError(loadError.message));
  }, [id, post]);

  if (!loadedPost) {
    return <main className="detail-page"><div className="empty-results"><h1>{error || 'Loading story…'}</h1><Link className="pill-button pill-button--green" to="/blog">Back to journal <span>→</span></Link></div></main>;
  }

  return (
    <main className="blog-post-page">
      <img src={loadedPost.image} alt="" />
      <article>
        <p className="eyebrow">{loadedPost.contentType === 'editorial' ? 'Editorial' : `By ${loadedPost.authorId?.name || 'Community member'}`} · {loadedPost.category}</p>
        <h1>{loadedPost.title}</h1>
        <p className="blog-post-lede">{loadedPost.excerpt}</p>
        <p>{loadedPost.content || 'Good food does not have to be complicated. A few thoughtful choices, a little preparation, and the freedom to enjoy the process can make everyday eating feel more joyful. Start small, use what you have, and make this idea your own.'}</p>
        <Link className="text-link" to="/blog">More from the journal <span>→</span></Link>
      </article>
    </main>
  );
}

export default BlogPostPage;
