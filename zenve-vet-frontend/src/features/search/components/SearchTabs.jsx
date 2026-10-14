import { SEARCH_TYPES } from '../services/searchService';
import '../styles/SearchTabs.css';

export default function SearchTabs({ active, onChange }) {
  return (
    <div className="searchTabs" role="tablist" aria-label="Search categories">
      {SEARCH_TYPES.map((t) => (
        <button key={t.id} type="button" role="tab"
         aria-selected={active === t.id} className={active === t.id ? 'isActive' : ''}
          onClick={() => onChange(t.id)}>
          {t.label}
        </button>
      ))}
    </div>
  );
}
