/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from 'react';
import { getPosts, getSpecialties, getStates, getMeId } from '../api';
import PostCard from './PostCard';
import PostComposer from './PostComposer';

const tabs = [
  ['for-you', 'For you'],
  ['popular', 'Popular'],
  ['following', 'Following'],
];

export default function PostFeed({ type }) {
  const meId = getMeId();
  const [tab, setTab] = useState('for-you');
  const [specialty, setSpecialty] = useState('');
  const [state, setState] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [specialties, setSpecialties] = useState([]);
  const [states, setStates] = useState([]);
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reload, setReload] = useState(0);

  const activeType = type || typeFilter;

  useEffect(() => {
    getSpecialties().then(setSpecialties).catch(() => {});
    getStates().then(setStates).catch(() => {});
  }, []);

  const load = async pageNumber => {
    setLoading(true);
    try {
      const result = await getPosts({
        tab,
        specialty,
        state,
        type: activeType,
        page: pageNumber,
        size: 10,
        viewerId: meId,
      });
      const items = activeType ? result.items : result.items.filter(p => p.type !== 'STORY');
      setPosts(pageNumber === 0 ? items : [...posts, ...items]);
      setPage(pageNumber);
      setTotalPages(result.totalPages);
      setError('');
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    load(0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, specialty, state, activeType, reload]);

  return (
    <section>
      <div id="composer">
        <PostComposer fixedType={type} onPosted={() => setReload(reload + 1)} />
      </div>

      <div className="zv-tabs">
        {tabs.map(([value, label]) => (
          <button
            key={value}
            className={tab === value ? 'zv-tab zv-tab-active' : 'zv-tab'}
            onClick={() => setTab(value)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="zv-filters">
        <select value={specialty} onChange={e => setSpecialty(e.target.value)}>
          <option value="">All specialties</option>
          {specialties.map(s => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <select value={state} onChange={e => setState(e.target.value)}>
          <option value="">All states</option>
          {states.map(s => (
            <option key={s}>{s}</option>
          ))}
        </select>
        {!type && (
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
            <option value="">All post types</option>
            <option value="POST">Post</option>
            <option value="CLINICAL_CASE">Clinical case</option>
            <option value="SHORT_VIDEO">Short video</option>
          </select>
        )}
      </div>

      {error && <p className="form-error">{error}</p>}

      {posts.map(p => (
        <PostCard key={p.id} post={p} />
      ))}

      {!loading && !error && posts.length === 0 && (
        <div className="empty-state">
          <h3>Nothing here yet</h3>
          <p>
            {tab === 'following'
              ? 'Follow some professionals in the vet network to see their posts here.'
              : 'Be the first to share something.'}
          </p>
        </div>
      )}

      {loading && <p>Loading...</p>}

      {!loading && page + 1 < totalPages && (
        <button className="button button-outline" onClick={() => load(page + 1)}>
          Load more
        </button>
      )}
    </section>
  );
}


