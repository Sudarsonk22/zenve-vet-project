import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, Bookmark, Share2, Flag } from 'lucide-react';
import {
  appreciate,
  unappreciate,
  savePost,
  unsavePost,
  getComments,
  addComment,
  sharePost,
  viewPost,
  reportPost,
  getMeId,
  DEFAULT_IMAGE,
  mediaSrc,
} from '../api';

function timeAgo(date) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return Math.floor(seconds / 60) + ' min ago';
  if (seconds < 86400) return Math.floor(seconds / 3600) + ' hr ago';
  return Math.floor(seconds / 86400) + ' days ago';
}

function youtubeId(url) {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/|live\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/
  );
  return match ? match[1] : null;
}

function isVideoFile(url) {
  return /\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i.test(url);
}

function Media({ url }) {
  const id = youtubeId(url);

  if (id) {
    return (
      <iframe
        className="post-image"
        src={'https://www.youtube.com/embed/' + id}
        title="YouTube video"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        style={{ width: '100%', aspectRatio: '16 / 9', border: 0 }}
      />
    );
  }

  if (isVideoFile(url)) {
    return (
      <video
        className="post-image"
        src={mediaSrc(url)}
        controls
        style={{
          display: 'block',
          margin: '0 auto',
          width: 'auto',
          maxWidth: '100%',
          maxHeight: 520,
          objectFit: 'contain',
        }}
      />
    );
  }

  return <img className="post-image" src={mediaSrc(url)} alt="" />;
}

export default function PostCard({ post: first }) {
  const navigate = useNavigate();
  const meId = getMeId();
  const [post, setPost] = useState(first);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');
  const [message, setMessage] = useState('');

  const run = async action => {
    try {
      setMessage('');
      await action();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const toggleAppreciate = () =>
    run(async () => {
      const result = post.appreciated
        ? await unappreciate(post.id, meId)
        : await appreciate(post.id, meId);
      setPost({
        ...post,
        appreciated: result.appreciated,
        appreciationCount: result.appreciationCount,
      });
    });

  const toggleSave = () =>
    run(async () => {
      const result = post.saved ? await unsavePost(post.id, meId) : await savePost(post.id, meId);
      setPost({ ...post, saved: result.saved });
    });

  const toggleComments = () =>
    run(async () => {
      if (showComments) {
        setShowComments(false);
        return;
      }
      setComments(await getComments(post.id));
      setShowComments(true);
      await viewPost(post.id);
      setPost({ ...post, viewCount: post.viewCount + 1 });
    });

  const sendComment = e => {
    e.preventDefault();
    if (!text.trim()) return;
    run(async () => {
      const comment = await addComment(post.id, meId, text);
      setComments([...comments, comment]);
      setPost({ ...post, commentCount: post.commentCount + 1 });
      setText('');
    });
  };

  const share = () =>
    run(async () => {
      const result = await sharePost(post.id);
      setPost({ ...post, shareCount: result.shareCount });
      navigator.clipboard?.writeText(location.origin + '/feed');
      setMessage('Link copied');
    });

  const report = () =>
    run(async () => {
      const reason = window.prompt('Why are you reporting this post?');
      if (!reason || !reason.trim()) return;
      await reportPost(post.id, meId, reason.trim(), '');
      setMessage('Thanks, your report was sent to the admins.');
    });

  return (
    <article className="feed-post">
      <div
        className="post-author zv-clickable"
        onClick={() => navigate('/profile/' + post.author.slug)}
      >
        <img className="zv-avatar" src={post.author.avatarUrl || DEFAULT_IMAGE} alt="" />
        <span>
          <b>{post.author.fullName}</b>
          <small>
            {post.author.specialty} · {post.author.city} · {timeAgo(post.createdAt)}
          </small>
        </span>
      </div>

      {post.category && <span className="eyebrow gold-eyebrow">{post.category}</span>}
      <p>{post.body}</p>

      {post.mediaUrl && <Media url={post.mediaUrl} />}

      {post.type === 'CLINICAL_CASE' && post.consentReviewed && (
        <p className="zv-note">Consent reviewed · De-identified for peer discussion</p>
      )}

      <div className="zv-stats">
        <span>{post.viewCount} views</span>
        <span>{post.appreciationCount} appreciations</span>
        <span>{post.commentCount} comments</span>
        <span>{post.shareCount} shares</span>
      </div>

      <div className="case-actions">
        <button className={post.appreciated ? 'liked' : ''} onClick={toggleAppreciate}>
          <Heart size={17} /> Appreciate
        </button>
        <button onClick={toggleComments}>
          <MessageCircle size={17} /> Discuss
        </button>
        <button onClick={share}>
          <Share2 size={17} /> Share
        </button>
        <button aria-label="Save post" className={post.saved ? 'saved' : ''} onClick={toggleSave}>
          <Bookmark size={17} />
        </button>
        <button aria-label="Report post" onClick={report}>
          <Flag size={17} />
        </button>
      </div>

      {message && <p className="zv-message">{message}</p>}

      {showComments && (
        <div className="zv-comments">
          {comments.length === 0 && <p className="zv-message">No comments yet.</p>}
          {comments.map(c => (
            <div className="zv-comment" key={c.id}>
              <b>{c.author.fullName}</b>
              <span>{c.body}</span>
            </div>
          ))}
          <form className="zv-comment-form" onSubmit={sendComment}>
            <input
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Add to the discussion"
            />
            <button className="button button-outline" type="submit">
              Post
            </button>
          </form>
        </div>
      )}
    </article>
  );
}