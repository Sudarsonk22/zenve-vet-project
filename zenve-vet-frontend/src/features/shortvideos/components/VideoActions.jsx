import Icon from '../../../components/common/Icon';
import { formatCount } from '../../../utils/format';

export default function VideoActions({ video, pending, commentsOpen, onLike, onComment, onSave, onShare }) {
  return (
    <div className="videoActions" role="group" aria-label="Video actions">
      <button type="button" className={`videoActionBtn ${video.liked ? 'isActive isLiked' : ''}`} onClick={onLike} disabled={pending[`like:${video.id}`]} aria-pressed={video.liked} aria-label={video.liked ? 'Unlike' : 'Like'}>
        <Icon name="heart" filled={video.liked} />
        <span>{formatCount(video.likeCount) ?? 0}</span>
      </button>
      <button type="button" className={`videoActionBtn ${commentsOpen ? 'isActive' : ''}`} onClick={onComment} aria-expanded={commentsOpen} aria-label="Comments">
        <Icon name="comment" />
        <span>{formatCount(video.commentCount) ?? 0}</span>
      </button>
      <button type="button" className={`videoActionBtn ${video.saved ? 'isActive' : ''}`} onClick={onSave} disabled={pending[`save:${video.id}`]} aria-pressed={video.saved} aria-label={video.saved ? 'Remove from saved' : 'Save'}>
        <Icon name="bookmark" filled={video.saved} />
        <span>{video.saved ? 'Saved' : 'Save'}</span>
      </button>
      <button type="button" className="videoActionBtn" onClick={onShare} aria-label="Share">
        <Icon name="share" />
        <span>Share</span>
      </button>
      {formatCount(video.viewCount) !== null && (
        <span className="videoViews" title="Views">
          <Icon name="eye" size={16} /> {formatCount(video.viewCount)}
        </span>
      )}
    </div>
  );
}
