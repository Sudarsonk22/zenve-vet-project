import { useEffect, useRef } from 'react';
import EmptyState from '../../../components/common/EmptyState';
import ErrorMessage from '../../../components/common/ErrorMessage';
import Loader from '../../../components/common/Loader';
import VideoCard from './VideoCard';
import '../styles/VideoFeed.css';

// `state` is the object returned by useShortVideos.
export default function VideoFeed({ state, empty, onNotify }) {
  const { items, loading, loadingMore, error, loadMoreError, hasMore, loadMore, refresh, pending, patchVideo } = state;
  const sentinelRef = useRef(null);

  // Infinite scroll: ask for the next page when the sentinel scrolls into view.
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore || typeof IntersectionObserver === 'undefined') return undefined;
    const observer = new IntersectionObserver((entries) => entries[0].isIntersecting && loadMore(), { rootMargin: '400px' });
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loadMore, items.length]);

  if (loading) return <Loader label="Loading videos…" />;
  if (error) return <ErrorMessage message={error} onRetry={refresh} />;
  if (items.length === 0) {
    return <EmptyState icon="video" title={empty?.title || 'No videos yet'} text={empty?.text} action={empty?.action} />;
  }

  return (
    <div className="videoFeed">
      {items.map((video) => (
        <VideoCard
          key={video.id}
          video={video}
          pending={pending}
          onLike={state.toggleLike}
          onSave={state.toggleSave}
          onFollow={state.toggleFollow}
          onDelete={state.removeVideo}
          onNotify={onNotify}
          onCommentAdded={(id, delta) => patchVideo(id, (v) => ({ commentCount: v.commentCount + delta }))}
        />
      ))}
      {hasMore && <div ref={sentinelRef} className="videoFeedSentinel" aria-hidden="true" />}
      {loadingMore && <Loader inline label="Loading more…" />}
      {loadMoreError && <ErrorMessage compact message={loadMoreError} onRetry={loadMore} />}
      {!hasMore && !loadingMore && <p className="videoFeedEnd">You're all caught up.</p>}
    </div>
  );
}
