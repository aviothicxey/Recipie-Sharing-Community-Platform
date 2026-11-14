import { useEffect, useState } from 'react';
import { getChannel, getCreators, getOwnChannel, postChannelMessage, searchCreators, toggleFollow } from '../services/recipeApi';
import { useSearchParams } from 'react-router-dom';

function CommunityPage({ auth }) {
  const [creators, setCreators] = useState([]);
  const [selected, setSelected] = useState(null);
  const [channel, setChannel] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [searchParams] = useSearchParams();

  useEffect(() => {
    getCreators(auth.token).then(setCreators).catch((err) => setError(err.message));
    if (searchParams.get('mine')) {
      getOwnChannel(auth.token).then((result) => {
        setSelected({ id: result.channel.ownerId._id, name: result.channel.ownerId.name, following: true });
        setChannel(result);
      }).catch((err) => setError(err.message));
    }
  }, [auth.token, searchParams]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (selected) getChannel(selected.id, auth.token).then(setChannel).catch(() => {});
    }, 10000);
    return () => clearInterval(timer);
  }, [auth.token, selected]);

  function chooseCreator(creator) {
    setSelected(creator);
    setError('');
    getChannel(creator.id, auth.token).then(setChannel).catch((err) => setError(err.message));
  }

  function handleSearch(event) {
    event.preventDefault();
    (search.trim() ? searchCreators(search.trim(), auth.token) : getCreators(auth.token))
      .then(setCreators).catch((err) => setError(err.message));
  }

  async function handleFollow(creator) {
    try {
      const result = await toggleFollow(creator.id, auth.token);
      setCreators((current) => current.map((item) => item.id === creator.id
        ? { ...item, following: result.following, followerCount: result.followerCount }
        : item));
      if (selected?.id === creator.id) chooseCreator({ ...creator, following: result.following });
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleMessage(event) {
    event.preventDefault();
    if (!message.trim() || !selected) return;
    try {
      const newMessage = await postChannelMessage(selected.id, message, auth.token);
      setChannel((current) => ({ ...current, messages: [...current.messages, newMessage] }));
      setMessage('');
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <main className="community-page">
      <section className="community-hero">
        <p className="eyebrow">Nourish community</p>
        <h1>Cook together, learn together.</h1>
        <p>Follow recipe creators, join their kitchen broadcasts, and ask questions directly on every recipe.</p>
      </section>
      <section className="community-content">
        <div>
          <p className="eyebrow">Creators to follow</p>
          <form className="community-search" onSubmit={handleSearch}><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search creators..." /><button className="pill-button pill-button--green" type="submit">Search</button></form>
          {error && <p className="api-note">{error}</p>}
          <div className="creator-list">
            {creators.map((creator) => (
              <article className={`creator-card ${selected?.id === creator.id ? 'creator-card--active' : ''}`} key={creator.id}>
                <button type="button" className="creator-card__info" onClick={() => chooseCreator(creator)}>
                  <span className="user-avatar">{creator.name.charAt(0).toUpperCase()}</span>
                  <span><strong>{creator.name}</strong><small>{creator.followerCount} followers</small></span>
                </button>
                <button type="button" className="pill-button pill-button--green" disabled={creator.isOwner} onClick={() => handleFollow(creator)}>
                  {creator.isOwner ? 'Your group' : creator.following ? 'Following' : 'Follow'}
                </button>
              </article>
            ))}
          </div>
        </div>
        <div className="channel-panel">
          {channel ? (
            <>
              <p className="eyebrow">Broadcast channel</p>
              <h2>{channel.channel.name}</h2>
              <p>{channel.channel.description || 'A place to share cooking notes and ask questions.'}</p>
              <div className="channel-messages">
                {channel.messages.map((item) => <p key={item._id}><strong>{item.authorId.name}</strong> {item.text}</p>)}
              </div>
              <form className="comment-form" onSubmit={handleMessage}>
                <input value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Write to the channel..." maxLength={1000} />
                <button className="pill-button pill-button--green" type="submit">Send</button>
              </form>
            </>
          ) : <p>Select a creator to see their broadcast channel.</p>}
        </div>
      </section>
    </main>
  );
}

export default CommunityPage;
