import { useCallback, useEffect, useRef, useState } from 'react';
import { isCanceled, isNotSupported } from '../../../services/apiClient';
import { PAGE_SIZE, PREVIEW_SIZE, SEARCH_TYPES, fetchSuggestions, searchType } from '../services/searchService';
import { sampleSearch } from '../../../data/sampleData';

const CONTENT_TYPES = SEARCH_TYPES.filter((t) => t.id !== 'all').map((t) => t.id);
const idle = { status: 'idle', error: '', items: [], total: null, page: 0, totalPages: null, hasMore: false };
const offlineSearch = (kind, q) => {
  const term = q.toLowerCase().replace('#', '');
  const items = (sampleSearch[kind] || []).filter((item) => JSON.stringify(item).toLowerCase().includes(term));
  return { items, page: 0, total: items.length, totalPages: 1, hasMore: false };
};

// Runs the search for the current URL state. Newer searches abort older ones, so stale results never show.
export default function useSearch({ q, type, page, filters }) {
  const [single, setSingle] = useState(idle);
  const [sections, setSections] = useState({}); // used by the "All" tab: { people: {...}, videos: {...} }
  const filtersKey = JSON.stringify(filters);
  const filtersRef = useRef(filters);
  useEffect(() => {
    filtersRef.current = filters;
  });

  useEffect(() => {
    if (!q) {
      setSingle(idle);
      setSections({});
      return undefined;
    }
    const controller = new AbortController();
    const { signal } = controller;
    const loadingState = { ...idle, status: 'loading' };

    if (type === 'all') {
      setSections(Object.fromEntries(CONTENT_TYPES.map((t) => [t, loadingState])));
      CONTENT_TYPES.forEach(async (t) => {
        try {
          const r = await searchType(t, { q, size: PREVIEW_SIZE, signal });
          if (!signal.aborted) setSections((s) => ({ ...s, [t]: { ...idle, ...r, status: 'success' } }));
        } catch (e) {
          if (!isCanceled(e)) setSections((s) => ({ ...s, [t]: { ...idle, ...offlineSearch(t, q), status: 'success' } }));
        }
      });
    } else {
      setSingle(loadingState);
      searchType(type, { q, page, size: PAGE_SIZE, filters: filtersRef.current, signal })
        .then((r) => !signal.aborted && setSingle({ ...idle, ...r, status: 'success' }))
        .catch((e) => !isCanceled(e) && setSingle({ ...idle, ...offlineSearch(type, q), status: 'success' }));
    }
    return () => controller.abort();
  }, [q, type, page, filtersKey]);

  const patchItem = useCallback((kind, id, patch) => {
    const apply = (state) => ({ ...state, items: state.items.map((it) => (it.id === id ? { ...it, ...patch } : it)) });
    setSingle((s) => (kind ? apply(s) : s));
    setSections((all) => (all[kind] ? { ...all, [kind]: apply(all[kind]) } : all));
  }, []);

  return { single, sections, patchItem };
}

// Suggestions are only shown when the backend endpoint exists; the first 404/405 turns them off.
export function useSuggestions(value, enabled) {
  const [items, setItems] = useState([]);
  const supportedRef = useRef(true);

  useEffect(() => {
    const term = value.trim();
    if (!enabled || !supportedRef.current || term.length < 2) {
      setItems([]);
      return undefined;
    }
    const controller = new AbortController();
    const t = setTimeout(async () => {
      try {
        const list = await fetchSuggestions(term, { signal: controller.signal });
        if (!controller.signal.aborted) setItems(list);
      } catch (e) {
        if (isCanceled(e)) return;
        if (isNotSupported(e)) supportedRef.current = false;
        setItems([]);
      }
    }, 300);
    return () => {
      clearTimeout(t);
      controller.abort();
    };
  }, [value, enabled]);

  return items;
}
