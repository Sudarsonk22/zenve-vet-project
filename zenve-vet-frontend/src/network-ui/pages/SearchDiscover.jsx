import { useEffect, useMemo, useRef, useState } from 'react';
import { Search } from 'lucide-react';
import ProfileCard from '../components/ProfileCard';
import PostCard from '../components/PostCard';
import { getMeId, getSearchTopics, getStates, searchAll } from '../api';

/**
 * Discover - people, cases and answers behind one query.
 *
 * Everything on screen comes from a single `/search` call. The tab counts are
 * always all four, whichever tab is open, so switching tabs never blanks the
 * numbers while a request is in flight.
 */

const TABS = [
  { key: 'all', label: 'All', count: (c) => c.all },
  { key: 'doctors', label: 'Doctors', count: (c) => c.doctors },
  { key: 'cases', label: 'Cases', count: (c) => c.cases },
  { key: 'stories-videos', label: 'Stories & videos', count: (c) => c.storiesAndVideos },
];

const EMPTY_COUNTS = { all: 0, doctors: 0, cases: 0, storiesAndVideos: 0, posts: 0 };

export default function SearchDiscover({ onView, onConnect, globalQuery }) {
  const [draft, setDraft] = useState('');
  const [query, setQuery] = useState('');
  const [topic, setTopic] = useState('');
  const [state, setState] = useState('');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [hasTakeaways, setHasTakeaways] = useState(false);
  const [tab, setTab] = useState('all');

  const [topics, setTopics] = useState([]);
  const [states, setStates] = useState([]);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const latest = useRef(0);

  // The header's search box drives this page too. Adjusting state during render
  // when a prop changes is React's documented pattern for this - an effect would
  // render once with the stale value and then again with the new one.
  const [lastGlobalQuery, setLastGlobalQuery] = useState(globalQuery);
  if (globalQuery !== lastGlobalQuery) {
    setLastGlobalQuery(globalQuery);
    setDraft(globalQuery ?? '');
  }

  // Typing waits; a chip, a tab or a checkbox fires straight away.
  useEffect(() => {
    const timer = setTimeout(() => setQuery(draft.trim()), draft ? 320 : 0);
    return () => clearTimeout(timer);
  }, [draft]);

  useEffect(() => {
    let cancelled = false;
    Promise.all([getSearchTopics(), getStates()])
      .then(([topicList, stateList]) => {
        if (cancelled) return;
        setTopics(topicList);
        setStates(stateList);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const ticket = ++latest.current;
    // Synchronising with the API is exactly what an effect is for, and the
    // spinner has to go up before the request, not after it resolves.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);

    searchAll({
      q: query,
      topic,
      state,
      verifiedOnly,
      hasTakeaways,
      tab,
      size: tab === 'doctors' ? 24 : 12,
      viewerId: getMeId(),
    })
      .then((result) => {
        // A slow earlier reply must not overwrite a newer one.
        if (ticket !== latest.current) return;
        setData(result);
        setError('');
      })
      .catch((e) => {
        if (ticket !== latest.current) return;
        setError(e.message || 'Search is unavailable right now.');
      })
      .finally(() => {
        if (ticket === latest.current) setLoading(false);
      });
  }, [query, topic, state, verifiedOnly, hasTakeaways, tab]);

  const counts = data?.counts ?? EMPTY_COUNTS;
  const doctors = data?.doctors ?? [];
  const posts = data?.posts ?? [];

  const showDoctors = tab === 'all' || tab === 'doctors';
  const showPosts = tab !== 'doctors';

  const nothingFound = useMemo(
    () => !loading && !error && doctors.length === 0 && posts.length === 0,
    [loading, error, doctors.length, posts.length],
  );

  return (
    <main className="main-content">
      <section className="network-hero">
        <div className="eyebrow gold-eyebrow">DISCOVER</div>
        <h1>Find people, cases &amp; answers.</h1>
      </section>

      <section className="discover-search">
        <label className="filter-search">
          <Search size={20} />
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder={'Try "pyoderma Kerala" or "dairy lameness"'}
            aria-label="Search people, cases and answers"
          />
        </label>
        <span className="select-wrap">
          <select value={state} onChange={(event) => setState(event.target.value)} aria-label="State">
            <option value="">All states</option>
            {states.map((entry) => (
              <option key={entry} value={entry}>{entry}</option>
            ))}
          </select>
        </span>
      </section>

      <section className="discover-chips">
        {topics.map((entry) => (
          <button
            key={entry}
            type="button"
            // A second tap on the active chip clears it, so the filter is escapable
            // without hunting for a reset control.
            className={`discover-chip${topic === entry ? ' is-on' : ''}`}
            aria-pressed={topic === entry}
            onClick={() => setTopic(topic === entry ? '' : entry)}
          >
            {entry}
          </button>
        ))}

        <label className="discover-toggle">
          <input
            type="checkbox"
            checked={verifiedOnly}
            onChange={(event) => setVerifiedOnly(event.target.checked)}
          />
          Verified only
        </label>
        <label className="discover-toggle">
          <input
            type="checkbox"
            checked={hasTakeaways}
            onChange={(event) => setHasTakeaways(event.target.checked)}
          />
          Has takeaways
        </label>
      </section>

      <nav className="discover-tabs" aria-label="Result type">
        {TABS.map((entry) => (
          <button
            key={entry.key}
            type="button"
            className={`discover-tab${tab === entry.key ? ' is-on' : ''}`}
            aria-current={tab === entry.key ? 'page' : undefined}
            onClick={() => setTab(entry.key)}
          >
            {entry.label}
            <span className="discover-tab__count">{entry.count(counts)}</span>
          </button>
        ))}
      </nav>

      {error && <div className="empty-state"><h3>{error}</h3></div>}

      {loading && !data && <p className="discover-note">Searching…</p>}

      {nothingFound && (
        <div className="empty-state">
          <Search size={32} />
          <h3>Nothing matches that yet</h3>
          <p>Try a broader term, or clear a filter.</p>
        </div>
      )}

      {showDoctors && doctors.length > 0 && (
        <section className="discover-section">
          <h2 className="discover-section__title">Doctors</h2>
          <div className="profile-grid">
            {doctors.map((profile) => (
              <ProfileCard
                key={profile.id}
                profile={profile}
                onView={onView}
                onConnect={onConnect}
              />
            ))}
          </div>
          {tab === 'all' && counts.doctors > doctors.length && (
            <button type="button" className="discover-more" onClick={() => setTab('doctors')}>
              See all {counts.doctors} doctors
            </button>
          )}
        </section>
      )}

      {showPosts && posts.length > 0 && (
        <section className="discover-section">
          <h2 className="discover-section__title">
            {tab === 'cases' ? 'Clinical cases' : tab === 'stories-videos' ? 'Stories & videos' : 'Posts & cases'}
          </h2>
          <div className="discover-posts">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
