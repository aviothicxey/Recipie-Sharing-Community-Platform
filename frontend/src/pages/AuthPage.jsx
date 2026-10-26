import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser, registerUser } from '../services/authApi';

function AuthPage({ mode = 'signin', onAuthenticated }) {
  const isSignUp = mode === 'signup';
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const result = isSignUp ? await registerUser(form) : await loginUser({ email: form.email, password: form.password });
      localStorage.setItem('nourishAuth', JSON.stringify(result));
      onAuthenticated(result);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <p className="eyebrow">{isSignUp ? 'Welcome to Nourish' : 'Welcome back'}</p>
        <h1>{isSignUp ? 'Create your account.' : 'Sign in to your account.'}</h1>
        {error && <p className="auth-error">{error}</p>}
        <form onSubmit={handleSubmit}>
          {isSignUp && <input required placeholder="Your name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />}
          <input required type="email" placeholder="Email address" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
          <input required minLength="8" type="password" placeholder="Password (8+ characters)" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
          <button className="pill-button pill-button--green" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Please wait…' : isSignUp ? 'Sign up' : 'Sign in'} <span>→</span></button>
        </form>
        <p className="auth-switch">{isSignUp ? 'Already have an account?' : 'New to Nourish?'} <Link to={isSignUp ? '/signin' : '/signup'}>{isSignUp ? 'Sign in' : 'Sign up'}</Link></p>
      </section>
    </main>
  );
}

export default AuthPage;
