import Icon from '../../../components/common/Icon';
import { FILTERS_BY_TYPE } from '../services/searchService';
import '../styles/SearchFilters.css';

const LABELS = { specialty: 'Veterinary specialty',
   location: 'Location', animalType: 'Animal type',
    category: 'Category', sort: 'Sort by' };
const SORTS = {
  videos: [{ value: 'recent', label: 'Recently uploaded' },
     { value: 'views', label: 'Most viewed' }],
  posts: [{ value: 'recent', label: 'Most recent' }],
  cases: [{ value: 'recent', label: 'Most recent' }],
};

function Field({ name, type, value, options, onChange }) {
  const id = `sf-${name}`;
  const list = name === 'sort' ? SORTS[type] : options[name] || [];
  return (
    <div className="searchFilterField">
      <label htmlFor={id}>{LABELS[name]}</label>
      {name === 'sort' || list.length > 0 ? (
        <select id={id} value={value} onChange={(e) => onChange(name, e.target.value)}>
          <option value="">{name === 'sort' ? 'Best match' : 'Any'}</option>
          {list.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      ) : (
        <input id={id} type="text" value={value}
         onChange={(e) => onChange(name, e.target.value)} placeholder="Any" />
      )}
    </div>
  );
}

export default function SearchFilters({ type, filters, options, open, onToggle, onChange, onReset }) {
  const names = FILTERS_BY_TYPE[type] || [];
  if (names.length === 0) return null;
  const activeCount = names.filter((n) => filters[n]).length;
  return (
    <section className={`searchFilters ${open ? 'isOpen' : ''}`} aria-label="Filters">
      <button type="button" className="searchFiltersToggle zvBtn zvBtnGhost zvBtnSm"
       onClick={onToggle} aria-expanded={open}>
        <Icon name="sliders" size={14} /> Filters{activeCount > 0 ? ` (${activeCount})` : ''}
      </button>
      <div className="searchFiltersBody">
        {names.map((n) => <Field key={n} name={n} type={type} value={filters[n] || ''}
         options={options} onChange={onChange} />)}
        {activeCount > 0 && <button type="button" className="zvBtn zvBtnGhost zvBtnSm"
         onClick={onReset}>Reset filters</button>}
      </div>
    </section>
  );
}
