import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { deleteAdminResource, getAdminResources, setAdminResourceStatus } from '../services/adminApi';
import { loginAdmin } from '../services/authApi';

const resourceConfig = {
  users: { label: 'Users', title: (item) => item.name, detail: (item) => item.email, statuses: ['active', 'hidden'] },
  blogs: { label: 'Blogs', title: (item) => item.title, detail: (item) => item.category, statuses: ['published', 'hidden'] },
  recipes: { label: 'Recipes', title: (item) => item.title, detail: (item) => item.cuisine, statuses: ['published', 'hidden'] },
};

function AdminPage({ auth, onAuthenticated }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [resources, setResources] = useState({ users: [], blogs: [], recipes: [] });
  const [activeTab, setActiveTab] = useState('users');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!auth || auth.user?.role !== 'admin') return;
    Promise.all(Object.keys(resourceConfig).map(async (resource) => [resource, await getAdminResources(resource, auth)]))
      .then((entries) => setResources(Object.fromEntries(entries)))
      .catch((err) => setError(err.message));
  }, [auth]);

  if (auth?.user?.role === 'admin') {
    const config = resourceConfig[activeTab];
    const items = resources[activeTab];

    async function changeStatus(item, status) {
      try {
        const updated = await setAdminResourceStatus(activeTab, item._id, status, auth);
        setResources((current) => ({ ...current, [activeTab]: current[activeTab].map((candidate) => candidate._id === item._id ? updated : candidate) }));
      } catch (err) {
        setError(err.message);
      }
    }

    async function remove(item) {
      if (!window.confirm(`Delete ${config.title(item)} permanently?`)) return;
      try {
        await deleteAdminResource(activeTab, item._id, auth);
        setResources((current) => ({ ...current, [activeTab]: current[activeTab].filter((candidate) => candidate._id !== item._id) }));
      } catch (err) {
        setError(err.message);
      }
    }

    return (
      <main className="admin-page admin-page--dashboard">
        <section className="admin-dashboard">
          <div className="admin-dashboard__heading">
            <div><p className="eyebrow">Nourish administration</p><h1>Keep the community in good hands.</h1></div>
            <p>Publish, hide, or remove content and member accounts from one place.</p>
          </div>
          {error && <p className="auth-error">{error}</p>}
          <div className="admin-tabs" role="tablist">
            {Object.entries(resourceConfig).map(([key, value]) => <button key={key} className={activeTab === key ? 'is-active' : ''} type="button" onClick={() => setActiveTab(key)}>{value.label} <span>{resources[key].length}</span></button>)}
          </div>
          <div className="admin-list">
            {items.length === 0 && <p className="admin-empty">No {config.label.toLowerCase()} found.</p>}
            {items.map((item) => (
              <article className="admin-row" key={item._id}>
                <div><strong>{config.title(item)}</strong><small>{config.detail(item)}</small></div>
                <span className={`admin-status admin-status--${item.status}`}>{item.status}</span>
                <div className="admin-row__actions">
                  {config.statuses.filter((status) => status !== item.status).map((status) => <button key={status} type="button" onClick={() => changeStatus(item, status)}>{item.status === 'hidden' && status !== 'hidden' ? 'Unhide' : status === 'hidden' ? 'Hide' : 'Publish'}</button>)}
                  <button className="admin-delete" type="button" onClick={() => remove(item)}>Delete</button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    );
  }

  if (auth) return <Navigate to="/profile" replace />;

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const result = await loginAdmin(form);
      localStorage.setItem('nourishAuth', JSON.stringify(result));
      onAuthenticated(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="admin-page">
      <section className="admin-card">
        <p className="eyebrow">Restricted area</p><h1>Admin sign in.</h1>
        {error && <p className="auth-error">{error}</p>}
        <form onSubmit={handleSubmit}>
          <label htmlFor="admin-email">Admin email</label>
          <input id="admin-email" required type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
          <label htmlFor="admin-password">Password</label>
          <input id="admin-password" required type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
          <button className="pill-button pill-button--green" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Signing in…' : 'Sign in as admin'} <span>→</span></button>
        </form>
      </section>
    </main>
  );
}

export default AdminPage;
