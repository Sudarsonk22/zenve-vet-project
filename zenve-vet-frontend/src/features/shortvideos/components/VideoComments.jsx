import { useCallback, useEffect, useState } from 'react';
import Avatar from '../../../components/common/Avatar';
import ErrorMessage from '../../../components/common/ErrorMessage';
import Loader from '../../../components/common/Loader';
import Icon from '../../../components/common/Icon';
import { getErrorMessage, isCanceled } from '../../../services/apiClient';
import { timeAgo } from '../../../utils/format';
import { addComment, fetchComments } from '../services/shortVideosService';
import '../styles/VideoComments.css';

export default function VideoComments({ videoId, onCountChange }) {
  const [comments, setComments] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [text, setText] = useState('');
  const [posting, setPosting] = useState(false);
  const [postError, setPostError] = useState('');

  const load = useCallback(
    async (signal) => {
      setLoading(true);
      setError('');
      try {
        const result = await fetchComments(videoId, { page: 0, signal });
        setComments(result.items);
        setPage(result.page ?? 0);
        setHasMore(result.hasMore);
      } catch (e) {
        if (!isCanceled(e)) setError(getErrorMessage(e, 'Could not load comments.'));
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    },
    [videoId],
  );

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, [load]);

  const loadMore = async () => {
    setLoadingMore(true);
    try {
      const result = await fetchComments(videoId, { page: page + 1 });
      setComments((prev) => [...prev, ...result.items.filter((c) => !prev.some((p) => p.id === c.id))]);
      setPage(result.page ?? page + 1);
      setHasMore(result.hasMore);
    } catch (e) {
      setError(getErrorMessage(e, 'Could not load more comments.'));
    } finally {
      setLoadingMore(false);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    const value = text.trim();
    if (!value || posting) return;
    setPosting(true);
    setPostError('');
    try {
      const created = await addComment(videoId, value); // shown only after the backend saved it
      setComments((prev) => [created, ...prev]);
      setText('');
      onCountChange?.(1);
    } catch (err) {
      setPostError(getErrorMessage(err, 'Your comment could not be posted.'));
    } finally {
      setPosting(false);
    }
  };

  return (
    <section className="videoComments" aria-label="Comments">
      <form className="videoCommentForm" onSubmit={submit}>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add a comment…"
          maxLength={1000}
          aria-label="Add a comment"
        />
        <button type="submit" className="zvBtn zvBtnPrimary zvBtnSm" disabled={!text.trim() || posting}>
          <Icon name="send" size={14} /> {posting ? 'Posting…' : 'Post'}
        </button>
      </form>
      {postError && <ErrorMessage compact message={postError} />}
      {loading ? (
        <Loader inline label="Loading comments…" />
      ) : error && comments.length === 0 ? (
        <ErrorMessage compact message={error} onRetry={() => load()} />
      ) : comments.length === 0 ? (
        <p className="videoCommentsEmpty">No comments yet. Start the conversation.</p>
      ) : (
        <ul className="videoCommentList">
          {comments.map((c) => (
            <li key={c.id} className="videoCommentItem">
              <Avatar src={c.author.avatarUrl} name={c.author.name} size={32} />
              <div>
                <p className="videoCommentMeta">
                  <strong>{c.author.name || 'Member'}</strong> <time dateTime={c.createdAt}>{timeAgo(c.createdAt)}</time>
                </p>
                <p className="videoCommentText">{c.text}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
      {hasMore && (
        <button type="button" className="zvBtn zvBtnGhost zvBtnSm" onClick={loadMore} disabled={loadingMore}>
          {loadingMore ? 'Loading…' : 'Load more comments'}
        </button>
      )}
    </section>
  );
}
