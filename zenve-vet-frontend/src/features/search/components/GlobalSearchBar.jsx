import { useState } from 'react';
import Icon from '../../../components/common/Icon';
import { useSuggestions } from '../hooks/useSearch';
import '../styles/GlobalSearchBar.css';

export default function GlobalSearchBar({ value, onChange, onSubmit, onClear, loading }) {
  const [focused, setFocused] = useState(false);
  const suggestions = useSuggestions(value, focused);
  const showList = focused && suggestions.length > 0;

  return (
    <form className="globalSearchBar" role="search" onSubmit={(e) => 
    { e.preventDefault(); setFocused(false); onSubmit(value); }}>
      <div className="globalSearchField">
        <Icon name="search" size={20} />
        <input
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 120)}
          placeholder="Search veterinarians, videos, posts, specialties..."
          aria-label="Search"
          aria-autocomplete="list"
          autoComplete="off"
        />
        {loading && <span className="zvSpinner" aria-label="Searching" />}
        {value && (
          <button type="button"
           className="zvIconBtn globalSearchClear"
           onClick={onClear} aria-label="Clear search"><Icon name="close" size={16} /></button>
        )}
        {showList && (
          <ul className="globalSearchSuggestions" role="listbox">
            {suggestions.map((s) => (
              <li key={s} role="option" aria-selected="false">
                <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => { setFocused(false); onSubmit(s); }}>
                  <Icon name="search" size={14} /> {s}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <button type="submit"
       className="zvBtn zvBtnPrimary globalSearchSubmit"
        disabled={!value.trim()}>Search</button>
    </form>
  );
}
