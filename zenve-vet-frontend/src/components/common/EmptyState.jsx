import Icon from './Icon';
import './common.css';

export default function EmptyState({ icon = 'search', title, text, action }) {
  return (
    <div className="zvEmpty">
      <span className="zvEmptyIcon"><Icon name={icon} size={26} /></span>
      <h3>{title}</h3>
      {text && <p>{text}</p>}
      {action}
    </div>
  );
}
