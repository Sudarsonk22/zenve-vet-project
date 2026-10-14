import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Toast from '../../../components/common/Toast';
import { getErrorMessage, isCanceled } from '../../../services/apiClient';
import GlobalSearchBar from '../components/GlobalSearchBar';
import SearchFilters from '../components/SearchFilters';
import SearchResults from '../components/SearchResults';
import SearchTabs from '../components/SearchTabs';
import useSearch from '../hooks/useSearch';
import { FILTERS_BY_TYPE, SEARCH_TYPES,
   fetchFilterOptions, followUser, unfollowUser } from '../services/searchService';
import '../../../components/common/common.css';
import '../styles/SearchPage.css';

const FILTER_KEYS = ['specialty', 'location', 'animalType', 'category', 'sort'];
const LIVE_DEBOUNCE_MS = 450;

export default function SearchPage() {
  const [params, setParams] = useSearchParams();
  const q = params.get('q') || '';
  const type = SEARCH_TYPES.some((t) => t.id === params.get('type')) ? params.get('type') : 'all';
  const page = Math.max(0, Number(params.get('page')) || 0);
  const filters = Object.fromEntries(FILTER_KEYS.map((k) => [k, params.get(k) || '']));

  const [input, setInput] = useState(q);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [options, setOptions] = useState({ specialty: [], animalType: [], category: [] });
  const [followingId, setFollowingId] = useState(null);
  const [notice, setNotice] = useState(null);
  const debounceRef = useRef(null);

  const { single, sections, patchItem } = useSearch({ q, type, page, filters });
  const loading = type === 'all' ? Object.values(sections).some((s) =>
     s.status === 'loading') : single.status === 'loading';

  useEffect(() => setInput(q), [q]);
  useEffect(() => () => clearTimeout(debounceRef.current), []);

  useEffect(() => {
    const controller = new AbortController();
    fetchFilterOptions({ signal: controller.signal }).then((o) =>
       !controller.signal.aborted && setOptions(o)).catch(() => {});
    return () => controller.abort();
  }, []);

  // Single place that writes the URL, so the category and filters survive navigation and refresh.
  const update = useCallback(
    (patch, { replace = false, keepPage = false } = {}) => {
      const next = new URLSearchParams(params);
      Object.entries(patch).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
      if (!keepPage && !('page' in patch)) next.delete('page');
      setParams(next, { replace });
    },
    [params, setParams],
  );

  const submit = (value) => {
    clearTimeout(debounceRef.current);
    setInput(value);
    update({ q: value.trim() });
  };

  // Live search: wait until typing pauses.
  const onInput = (value) => {
    setInput(value);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const term = value.trim();
      if (term.length >= 2 || term.length === 0) update({ q: term }, { replace: true });
    }, LIVE_DEBOUNCE_MS);
  };

  const changeType = (next) => {
    const reset = Object.fromEntries(FILTER_KEYS.filter((k) =>
       !(FILTERS_BY_TYPE[next] || []).includes(k)).map((k) => [k, '']));
    update({ type: next === 'all' ? '' : next, ...reset });
  };

  const toggleFollow = async (person) => {
    setFollowingId(person.id);
    try {
      if (person.following) await unfollowUser(person.id);
      else await followUser(person.id);
      patchItem('people', person.id, { following: !person.following });
    } catch (e) {
      if (!isCanceled(e)) setNotice({ type: 'error', text: getErrorMessage(e) });
    } finally {
      setFollowingId(null);
    }
  };

  return (
    <div className="searchPage">
      <div className="searchPageInner">
        <header className="searchPageHeader">
          <h1>Search</h1>
          <p>Veterinarians, short videos, posts and clinical cases.</p>
        </header>

        <GlobalSearchBar value={input} onChange={onInput} onSubmit={submit}
         onClear={() => submit('')} loading={loading} />
        <SearchTabs active={type} onChange={changeType} />

        <div className={`searchLayout ${(FILTERS_BY_TYPE[type] || []).length ? 'hasFilters' : ''}`}>
          <SearchFilters
            type={type}
            filters={filters}
            options={options}
            open={filtersOpen}
            onToggle={() => setFiltersOpen((o) => !o)}
            onChange={(name, value) => update({ [name]: value })}
            onReset={() => update(Object.fromEntries(FILTER_KEYS.map((k) => [k, ''])))}
          />
          <main className="searchMain" aria-live="polite">
            <SearchResults
              q={q}
              type={type}
              single={single}
              sections={sections}
              onPage={(p) => update({ page: p ? String(p) : '' }, { keepPage: true })}
              onSeeAll={changeType}
              onFollow={toggleFollow}
              followingId={followingId}
            />
          </main>
        </div>
      </div>
      <Toast notice={notice} onClose={() => setNotice(null)} />
    </div>
  );
}
