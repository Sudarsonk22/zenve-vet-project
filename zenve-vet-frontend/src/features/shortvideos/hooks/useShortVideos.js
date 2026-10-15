import { useCallback, useEffect, useRef, useState } from 'react';
import { getErrorMessage, isCanceled } from '../../../services/apiClient';
import {
  deleteVideo, fetchSavedVideos, fetchVideoById, fetchVideos, fetchWatchHistory,
  followCreator, likeVideo, saveVideo, unfollowCreator, unlikeVideo, unsaveVideo,
} from '../services/shortVideosService';
import { sampleVideos } from '../../../data/sampleData';

const offlinePage = ({ source, feed, category, animalType, specialty, state, caseType, q, videoId }) => {
  let items = [...sampleVideos];
  if (source === 'saved') items = items.filter((video) => video.saved);
  if (source === 'history') items = items.slice(0, 2);
  if (source === 'single') items = items.filter((video) => video.id === videoId);
  if (feed === 'following') items = items.filter((video) => video.creator.following);
  if (feed === 'popular') items = items.sort((a, b) => b.viewCount - a.viewCount);
  const term = q.toLowerCase().replace('#', '');
  if (term) items = items.filter((video) => `${video.title} ${video.description} ${video.hashtags.join(' ')}`.toLowerCase().includes(term));
  if (category) items = items.filter((video) => video.category.toLowerCase() === category.toLowerCase() || video.category.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') === category.toLowerCase());
  if (animalType) items = items.filter((video) => video.animalType.toLowerCase() === animalType.toLowerCase());
  if (specialty) items = items.filter((video) => video.specialty.toLowerCase() === specialty.toLowerCase());
  if (state) items = items.filter((video) => video.state === state);
  if (caseType) items = items.filter((video) => video.caseType === caseType);
  return { items, page: 0, hasMore: false };
};

// source: 'feed' | 'saved' | 'history' | 'single'
export default function useShortVideos({ source = 'feed', feed = 'forYou', category = '', animalType = '', specialty = '', state = '', caseType = '', q = '', videoId = '' } = {}) {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  // How many match the filters, which is not the same as how many are loaded -
  // this is an infinite-scroll page, so items.length only ever means "so far".
  const [total, setTotal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [loadMoreError, setLoadMoreError] = useState('');
  const [actionError, setActionError] = useState('');
  const [pending, setPending] = useState({});
  const controllerRef = useRef(null);
  const busyMoreRef = useRef(false);

  const fetchPage = useCallback(
    (pageNumber, signal) => {
      if (source === 'saved') return fetchSavedVideos({ page: pageNumber, signal });
      if (source === 'history') return fetchWatchHistory({ page: pageNumber, signal });
      if (source === 'single') {
        return fetchVideoById(videoId, { signal }).then((v) => ({ items: [v], page: 0, hasMore: false }));
      }
      return fetchVideos({ feed, category, animalType, specialty, state, caseType, q, page: pageNumber, signal });
    },
    [source, feed, category, animalType, specialty, state, caseType, q, videoId],
  );

  const loadFirst = useCallback(async () => {
    controllerRef.current?.abort(); // ignore any stale request
    const controller = new AbortController();
    controllerRef.current = controller;
    busyMoreRef.current = false;
    setLoading(true);
    setLoadingMore(false);
    setError('');
    setLoadMoreError('');
    try {
      const result = await fetchPage(0, controller.signal);
      setItems(result.items);
      setPage(result.page ?? 0);
      setHasMore(result.hasMore);
      setTotal(result.total ?? result.items.length);
    } catch (e) {
      if (isCanceled(e)) return;
      // Backend data always wins; these animal-care samples only keep the UI usable offline.
      const fallback = offlinePage({ source, feed, category, animalType, specialty, state, caseType, q, videoId });
      setItems(fallback.items);
      setHasMore(false);
      setError('');
    } finally {
      if (controllerRef.current === controller) setLoading(false);
    }
  }, [fetchPage, source, feed, category, animalType, specialty, state, caseType, q, videoId]);

  useEffect(() => {
    loadFirst();
    return () => controllerRef.current?.abort();
  }, [loadFirst]);

  const loadMore = useCallback(async () => {
    if (busyMoreRef.current || loading || !hasMore) return;
    busyMoreRef.current = true;
    setLoadingMore(true);
    setLoadMoreError('');
    const controller = controllerRef.current;
    try {
      const result = await fetchPage(page + 1, controller?.signal);
      if (controllerRef.current !== controller) return;
      setItems((prev) => {
        const known = new Set(prev.map((v) => v.id));
        return [...prev, ...result.items.filter((v) => !known.has(v.id))];
      });
      setPage(result.page ?? page + 1);
      setHasMore(result.hasMore);
      if (result.total != null) setTotal(result.total);
    } catch (e) {
      if (!isCanceled(e)) setLoadMoreError(getErrorMessage(e, 'Could not load more videos.'));
    } finally {
      busyMoreRef.current = false;
      setLoadingMore(false);
    }
  }, [fetchPage, hasMore, loading, page]);

  const patchVideo = useCallback((id, patch) => {
    setItems((prev) => prev.map((v) => (v.id === id ? { ...v, ...(typeof patch === 'function' ? patch(v) : patch) } : v)));
  }, []);

  const run = useCallback(async (key, fn) => {
    setPending((p) => ({ ...p, [key]: true }));
    setActionError('');
    try {
      await fn();
    } catch (e) {
      setActionError(getErrorMessage(e));
    } finally {
      setPending((p) => {
        const next = { ...p };
        delete next[key];
        return next;
      });
    }
  }, []);

  // The UI only changes after the backend confirmed the action.
  const toggleLike = useCallback(
    (video) =>
      run(`like:${video.id}`, async () => {
        const res = video.liked ? await unlikeVideo(video.id) : await likeVideo(video.id);
        patchVideo(video.id, (v) => ({
          liked: !v.liked,
          likeCount: res?.likeCount ?? Math.max(0, v.likeCount + (v.liked ? -1 : 1)),
        }));
      }),
    [patchVideo, run],
  );

  const toggleSave = useCallback(
    (video) =>
      run(`save:${video.id}`, async () => {
        if (video.saved) await unsaveVideo(video.id);
        else await saveVideo(video.id);
        if (source === 'saved' && video.saved) setItems((prev) => prev.filter((v) => v.id !== video.id));
        else patchVideo(video.id, { saved: !video.saved });
      }),
    [patchVideo, run, source],
  );

  const toggleFollow = useCallback(
    (creator) =>
      run(`follow:${creator.id}`, async () => {
        if (creator.following) await unfollowCreator(creator.id);
        else await followCreator(creator.id);
        setItems((prev) =>
          prev.map((v) => (v.creator?.id === creator.id ? { ...v, creator: { ...v.creator, following: !creator.following } } : v)),
        );
      }),
    [run],
  );

  const removeVideo = useCallback(
    (video) =>
      run(`delete:${video.id}`, async () => {
        await deleteVideo(video.id);
        setItems((prev) => prev.filter((v) => v.id !== video.id));
      }),
    [run],
  );

  return {
    items, total, loading, loadingMore, error, loadMoreError, hasMore, loadMore, refresh: loadFirst,
    pending, actionError, clearActionError: () => setActionError(''),
    patchVideo, toggleLike, toggleSave, toggleFollow, removeVideo,
  };
}
