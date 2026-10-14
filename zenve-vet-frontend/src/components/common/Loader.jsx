import './common.css';

export default function Loader({ label = 'Loading…', inline = false }) {
  return (
    <div className={`zvLoader ${inline ? 'isInline' : ''}`} role="status" aria-live="polite">
      <span className="zvSpinner" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}
