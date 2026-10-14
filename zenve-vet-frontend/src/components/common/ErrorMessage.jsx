import Icon from './Icon';
import './common.css';

export default function ErrorMessage({ message, onRetry, compact = false }) {
  if (!message) return null;
  return (
    <div className={`zvError ${compact ? 'isCompact' : ''}`} role="alert">
      <Icon name="alert" size={compact ? 16 : 22} />
      <p>{message}</p>
      {onRetry && (
        <button type="button" className="zvBtn zvBtnGhost zvBtnSm" onClick={onRetry}>
          <Icon name="refresh" size={14} /> Retry
        </button>
      )}
    </div>
  );
}
