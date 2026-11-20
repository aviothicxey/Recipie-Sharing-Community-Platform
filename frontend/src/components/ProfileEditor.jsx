import { useEffect, useState } from 'react';
import { uploadImage } from '../services/recipeApi';
import { updateProfile } from '../services/authApi';

export default function ProfileEditor({ auth, onSaved, onCancel }) {
  const [name, setName] = useState(auth.user.name || '');
  const [bio, setBio] = useState(auth.user.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(auth.user.avatarUrl || '');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    return () => { if (preview) URL.revokeObjectURL(preview); };
  }, [preview]);

  function selectPhoto(event) {
    const selected = event.target.files?.[0];
    if (!selected) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(selected.type) || selected.size > 5 * 1024 * 1024) {
      setError('Choose a JPG, PNG or WebP image no larger than 5 MB.');
      event.target.value = '';
      return;
    }
    setError('');
    setPreview(URL.createObjectURL(selected));
    setFile(selected);
  }

  async function save(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const imageUrl = file ? await uploadImage(file, auth.token) : avatarUrl;
      // Retain the uploaded URL if saving fails, so retrying does not upload twice.
      setAvatarUrl(imageUrl);
      setFile(null);
      setPreview('');
      const user = await updateProfile({ name: name.trim(), bio: bio.trim(), avatarUrl: imageUrl }, auth.token);
      onSaved(user);
    } catch (failure) {
      setError(failure.message || 'Unable to save your profile. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="profile-editor" aria-labelledby="edit-profile-title">
      <h2 id="edit-profile-title">Edit profile</h2>
      <form onSubmit={save}>
        <fieldset disabled={saving}>
          <div className="profile-photo-editor">
            <div className="profile-avatar">
              {preview || avatarUrl ? <img src={preview || avatarUrl} alt="Profile preview" /> : name.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <label htmlFor="profile-photo">Change profile picture</label>
              <input id="profile-photo" type="file" accept="image/jpeg,image/png,image/webp" onChange={selectPhoto} aria-describedby="profile-photo-help" />
              <p id="profile-photo-help">JPG, PNG or WebP. Maximum 5 MB.</p>
              {(file || avatarUrl) && <button type="button" className="text-link" onClick={() => { setFile(null); setPreview(''); setAvatarUrl(''); document.getElementById('profile-photo').value = ''; }}>Remove picture</button>}
            </div>
          </div>
          <label htmlFor="profile-name">Name</label>
          <input id="profile-name" value={name} onChange={(event) => setName(event.target.value)} maxLength={80} required pattern=".*\S.*" />
          <label htmlFor="profile-bio">Bio</label>
          <textarea id="profile-bio" value={bio} onChange={(event) => setBio(event.target.value)} maxLength={500} rows={4} placeholder="Tell the community a little about yourself" />
          {error && <p className="auth-error" role="alert">{error}</p>}
          <div className="profile-actions">
            <button className="pill-button pill-button--green" type="submit">{saving ? 'Saving profile...' : 'Save changes'}</button>
            <button className="pill-button pill-button--white" type="button" onClick={onCancel}>Cancel</button>
          </div>
        </fieldset>
      </form>
    </section>
  );
}
