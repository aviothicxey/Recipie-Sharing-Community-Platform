import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { editorialRecipes } from '../data/content';
import BackButton from '../components/BackButton';
import { createComment, getComments, getRecipe } from '../services/recipeApi';

function RecipeDetailPage({ auth, savedRecipes, onToggleSave }) {
  const { id } = useParams();
  const fallback = editorialRecipes.find((recipe) => recipe.id === id);
  const [recipe, setRecipe] = useState(fallback);
  const [error, setError] = useState('');
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [replyText, setReplyText] = useState('');

  
useEffect(() => {
  if (fallback) return;

  let cancelled = false;

  async function loadRecipe() {
    try {
      const loadedRecipe = await getRecipe(id);

      if (cancelled) return;

      setRecipe(loadedRecipe);

      try {
        const loadedComments = await getComments(
          loadedRecipe._id || id
        );

        if (!cancelled) {
          setComments(loadedComments);
        }
      } catch (commentError) {
        console.error("Failed to load comments:", commentError);
      }

    } catch (err) {
      if (!cancelled) {
        setError(err.message);
      }
    }
  }

  loadRecipe();

  return () => {
    cancelled = true;
  };
}, [id, fallback]);


  if (error) {
    return <main className="detail-page"><BackButton fallback="/recipes" label="recipes" /><div className="empty-results"><h1>Recipe unavailable</h1><p>{error}</p><Link className="pill-button pill-button--green" to="/recipes">Back to recipes <span>→</span></Link></div></main>;
  }
  if (!recipe) return <main className="detail-page"><BackButton fallback="/recipes" label="recipes" /><p>Loading recipe…</p></main>;

  const ingredients = recipe.ingredients || [];
  const steps = recipe.steps || [];
  const authorId = typeof recipe.authorId === 'object' ? recipe.authorId?._id : recipe.authorId;
  const canEdit = recipe.contentType !== 'editorial' && String(authorId) === String(auth?.user?.id);
  const recipeId = recipe._id || recipe.id;
  const isSaved = savedRecipes.some((saved) => (saved._id || saved.id) === recipeId);
  const category = recipe.category || recipe.cuisine || 'Recipe';
  const time = recipe.time || `${recipe.cookTime || 20} mins`;
  const servings = recipe.servings ? `${recipe.servings} servings` : 'Fresh and delicious';
  async function handleComment(event) {
    event.preventDefault();
    if (!commentText.trim()) return;
    try {
      const comment = await createComment(recipeId, commentText, auth.token);
      setComments((current) => [...current, comment]);
      setCommentText('');
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleReply(event) {
    event.preventDefault();
    if (!replyText.trim()) return;
    try {
      const reply = await createComment(recipeId, replyText, auth.token, replyTo);
      setComments((current) => [...current, reply]);
      setReplyTo(null);
      setReplyText('');
    } catch (err) {
      setError(err.message);
    }
  }
  return (
    <main className="detail-page">
      <BackButton fallback="/recipes" label="recipes" />
      <section className="detail-intro">
        <div className="detail-intro__copy">
          <div className="recipe-facts">
            <span>◷ {time}</span>
            <span>♧ {servings}</span>
            <span>≡ {category}</span>
          </div>
          <div className="detail-intro__art detail-intro__art--subtle" aria-hidden="true">🥨</div>
          <h1>{recipe.title}</h1>
          <p>{recipe.description || 'A Nourish community recipe made for sharing.'}</p>
          <div className="detail-actions">
            <button className="detail-save-button" type="button" onClick={() => onToggleSave(recipe)}>
              {isSaved ? 'Saved Recipe' : 'Save Recipe'}
            </button>
            {canEdit && <Link className="detail-edit-link" to={`/recipes/${recipe._id}/edit`}>Edit recipe <span>→</span></Link>}
          </div>
        </div>
        <div className="detail-intro__art" aria-hidden="true">🥨</div>
      </section>
      <section className="detail-recipe">
        <div className="detail-recipe__image">
          <img src={recipe.image || recipe.coverUrl} alt={recipe.title} />
          <span className="detail-badge">Made<br />with love</span>
        </div>
        <div className="detail-ingredients">
          <p className="eyebrow">What you need</p>
          <h2>Ingredients</h2>
          <ul>{ingredients.length ? ingredients.map((item, index) => <li key={index}>{item.qty} {item.unit} {item.name}</li>) : <li>Use your favourite fresh ingredients and make it your own.</li>}</ul>
        </div>
        
      </section>
      <section className="detail-method">
        <p className="eyebrow">Take your time</p>
        <h2>How to make it</h2>
        <ol>{steps.length ? steps.map((step, index) => <li key={index}><span>{String(index + 1).padStart(2, '0')}</span>{step.text || step}</li>) : <li>Follow along and enjoy the process.</li>}</ol>
      </section>
      {!fallback && <section className="recipe-comments">
        <p className="eyebrow">Cook together</p>
        <h2>Questions & answers</h2>
        <form className="comment-form" onSubmit={handleComment}>
          <input value={commentText} onChange={(event) => setCommentText(event.target.value)} placeholder="Ask the recipe creator a question..." maxLength={1000} />
          <button className="pill-button pill-button--green" type="submit">Ask</button>
        </form>
        <div className="comment-list">
          {comments.filter((comment) => !comment.parentId).map((comment) => <article className="comment-item" key={comment._id}>
            <strong>{comment.authorId.name}</strong><p>{comment.text}</p>
            <button type="button" className="comment-reply" onClick={() => setReplyTo(comment._id)}>Reply</button>
            {comments.filter((reply) => String(reply.parentId) === String(comment._id)).map((reply) => <div className="comment-reply-item" key={reply._id}><strong>{reply.authorId.name}</strong><p>{reply.text}</p></div>)}
            {replyTo === comment._id && <form className="comment-form comment-form--reply" onSubmit={handleReply}><input value={replyText} onChange={(event) => setReplyText(event.target.value)} placeholder="Write an answer..." maxLength={1000} /><button className="pill-button pill-button--green" type="submit">Reply</button></form>}
          </article>)}
          {!comments.length && <p className="api-note">Be the first to ask a question about this recipe.</p>}
        </div>
      </section>}
    </main>
  );
}

export default RecipeDetailPage;
