import { useEffect } from 'react';
import './common.css';

export default function ConfirmDialog({ title, message, confirmLabel = 'Confirm', busy = false, onConfirm, onCancel }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && !busy && onCancel();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [busy, onCancel]);

  return (
    <div className="zvDialogBackdrop" onClick={() => !busy && onCancel()}>
      <div className="zvDialog" role="alertdialog" aria-modal="true" aria-labelledby="zvDialogTitle" onClick={(e) => e.stopPropagation()}>
        <h3 id="zvDialogTitle">{title}</h3>
        <p>{message}</p>
        <div className="zvDialogActions">
          <button type="button" className="zvBtn zvBtnGhost" onClick={onCancel} disabled={busy}>Cancel</button>
          <button type="button" className="zvBtn zvBtnDanger" onClick={onConfirm} disabled={busy}>
            {busy ? 'Working…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
