import { useEffect } from 'react';
import './common.css';

// Only render this with messages that the backend (or the browser) actually confirmed.
export default function Toast({ notice, onClose }) {
  useEffect(() => {
    if (!notice) return undefined;
    const t = setTimeout(onClose, 4500);
    return () => clearTimeout(t);
  }, [notice, onClose]);
  if (!notice) return null;
  return (
    <div className={`zvToast ${notice.type === 'error' ? 'isError' : 'isSuccess'}`} role="status" aria-live="polite">
      {notice.text}
    </div>
  );
}
