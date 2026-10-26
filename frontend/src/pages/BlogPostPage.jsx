import { Link, Navigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { blogPosts } from '../data/content';
import { getBlog } from '../services/blogApi';

function BlogPostPage() {
  const { postId } = useParams();
  const [post, setPost] = useState(() => blogPosts.find((candidate) => candidate.id === postId));

  useEffect(() => {
    getBlog(postId).then(setPost).catch(() => {});
  }, [postId]);

  if (!post) {
    return <Navigate to="/blog" replace />;
  }

  return (
    <main className="blog-post-page">
      <article className="blog-post">
        <div className="blog-post__header">
          <p className="eyebrow">{post.category}</p>
          <h1>{post.title}</h1>
          <p className="blog-post__date">{post.date}</p>
        </div>
        <img className="blog-post__image" src={post.image} alt="" />
        <div className="blog-post__body">
          <p className="blog-post__lead">{post.excerpt}</p>
          <p>
            A colourful kitchen makes everyday cooking feel more inviting. Keep
            seasonal ingredients where you can see them, use your favourite
            serving dishes, and make room for simple meals that bring people
            together.
          </p>
          <p>
            From fresh produce to a well-stocked pantry, small changes can add
            more flavour and joy to your routine. There is no perfect kitchen;
            there is only a space that helps you enjoy making something lovely.
          </p>
          <Link className="text-link" to="/blog">Back to the journal <span>→</span></Link>
        </div>
      </article>
    </main>
  );
}

export default BlogPostPage;
