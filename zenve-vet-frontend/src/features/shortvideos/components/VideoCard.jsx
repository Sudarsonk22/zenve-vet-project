import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Avatar from '../../../components/common/Avatar';
import ConfirmDialog from '../../../components/common/ConfirmDialog';
import Icon from '../../../components/common/Icon';
import { appRoutes } from '../../../config/appRoutes';
import { formatDuration, timeAgo } from '../../../utils/format';
import { recordShare, recordView } from '../services/shortVideosService';
import VideoActions from './VideoActions';
import VideoComments from './VideoComments';
import '../styles/VideoCard.css';

export default function VideoCard({ video, pending, onLike, onSave, onFollow, onDelete, onCommentAdded, onNotify }) {
  const videoRef = useRef(null);
  const viewedRef = useRef(false);
  const [showComments, setShowComments] = useState(false);
  const [mediaError, setMediaError] = useState(false);
  const [measuredDuration, setMeasuredDuration] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const { creator } = video;

  // Play only the video that is mostly on screen.
  useEffect(() => {
    const el = videoRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.intersectionRatio >= 0.6) el.play().catch(() => {});
        else el.pause();
      },
      { threshold: [0, 0.6] },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [video.videoUrl]);

  const handlePlay = () => {
    if (viewedRef.current) return;
    viewedRef.current = true;
    recordView(video.id).catch(() => {}); // history is best-effort; playback must not depend on it
  };

  const handleShare = async () => {
    const url = `${window.location.origin}${appRoutes.video(video.id)}`;
    try {
      if (navigator.share) await navigator.share({ title: video.title, url });
      else {
        await navigator.clipboard.writeText(url);
        onNotify({ type: 'success', text: 'Link copied to clipboard.' });
      }
      recordShare(video.id).catch(() => {});
    } catch (e) {
      if (e?.name !== 'AbortError') onNotify({ type: 'error', text: 'Sharing is not available in this browser.' });
    }
  };

  const duration = formatDuration(video.durationSeconds ?? measuredDuration);
  const canFollow = creator?.id && !creator.isSelf && !video.isOwner;

  return (
    <article className="videoCard">
      <header className="videoCardHeader">
        <Link to={appRoutes.profile(creator?.id)} className="videoCreator">
          <Avatar src={creator?.avatarUrl} name={creator?.name} size={44} />
          <span className="videoCreatorText">
            <strong>{creator?.name || 'Veterinary professional'}</strong>
            {creator?.specialization && <span>{creator.specialization}</span>}
          </span>
        </Link>
        {canFollow && (
          <button
            type="button"
            className={`zvBtn zvBtnSm ${creator.following ? 'zvBtnGhost' : 'zvBtnPrimary'}`}
            onClick={() => onFollow(creator)}
            disabled={pending[`follow:${creator.id}`]}
            aria-pressed={Boolean(creator.following)}
          >
            {creator.following ? 'Following' : 'Follow'}
          </button>
        )}
        {video.isOwner && (
          <button type="button" className="zvIconBtn" onClick={() => setConfirmDelete(true)} aria-label="Delete video">
            <Icon name="trash" size={18} />
          </button>
        )}
      </header>

      <div className="videoPlayer">
        {mediaError || !video.videoUrl ? (
          <div className="videoPlayerFallback">
            <Icon name="video" size={32} />
            <p>This video could not be loaded.</p>
          </div>
        ) : (
          <video
            ref={videoRef}
            src={video.videoUrl}
            poster={video.thumbnailUrl || undefined}
            controls
            muted
            loop
            playsInline
            preload="metadata"
            onPlay={handlePlay}
            onError={() => setMediaError(true)}
            onLoadedMetadata={(e) => setMeasuredDuration(e.currentTarget.duration)}
          />
        )}
        {duration && <span className="videoDuration"><Icon name="clock" size={12} /> {duration}</span>}
      </div>

      <VideoActions
        video={video}
        pending={pending}
        commentsOpen={showComments}
        onLike={() => onLike(video)}
        onSave={() => onSave(video)}
        onComment={() => setShowComments((s) => !s)}
        onShare={handleShare}
      />

      <div className="videoBody">
        <h2 className="videoTitle">{video.title}</h2>
        {video.description && <p className="videoDescription">{video.description}</p>}
        {video.hashtags.length > 0 && (
          <p className="videoHashtags">
            {video.hashtags.map((t) => (
              <Link key={t} to={`${appRoutes.search}?type=videos&q=${encodeURIComponent(`#${t}`)}`}>#{t}</Link>
            ))}
          </p>
        )}
        <p className="videoMeta">
          {[video.category, video.createdAt && timeAgo(video.createdAt)].filter(Boolean).join(' • ')}
        </p>
      </div>

      {showComments && <VideoComments videoId={video.id} onCountChange={(d) => onCommentAdded(video.id, d)} />}

      {confirmDelete && (
        <ConfirmDialog
          title="Delete this video?"
          message="This permanently removes the video, its comments and likes."
          confirmLabel="Delete"
          busy={pending[`delete:${video.id}`]}
          onCancel={() => setConfirmDelete(false)}
          onConfirm={async () => {
            await onDelete(video);
            setConfirmDelete(false);
          }}
        />
      )}
    </article>
  );
}
