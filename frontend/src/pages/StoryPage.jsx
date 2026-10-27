import { Link } from 'react-router-dom';

function StoryPage() {
  return (
    <main className="story-page">
      <section className="story-hero">
        <p className="eyebrow">Our story</p>
        <h1>A community for<br /><em>good food.</em></h1>
        <p>Nourish is a welcoming place to discover recipes, share the meals you love, and learn from people who care about food as much as you do.</p>
      </section>
      <section className="story-content">
        <img src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=1100&q=85" alt="Friends cooking together in a bright kitchen" />
        <div>
          <p className="eyebrow">Why Nourish exists</p>
          <h2>Food is better when it brings people together.</h2>
          <p>We believe recipes are more than instructions. They are stories, shortcuts, traditions, experiments, and invitations. Share what you make and find inspiration from a community that celebrates every kind of table.</p>
          <Link className="pill-button pill-button--green" to="/create-recipe">Share your recipe <span>→</span></Link>
        </div>
      </section>
    </main>
  );
}

export default StoryPage;
