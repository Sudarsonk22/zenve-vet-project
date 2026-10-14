import ErrorMessage from '../../../components/common/ErrorMessage';

export default function VideoCategories({ categories, selected, onSelect, loading, error }) {
  if (error) return <ErrorMessage compact message={`Categories unavailable: ${error}`} />;
  if (loading || categories.length === 0) return null; // nothing to filter by yet
  return (
    <div className="videoCategories" role="toolbar" aria-label="Video categories">
      {categories.map((c) => (
        <button key={c.value} type="button" className={`videoCategoryChip ${selected === c.value ? 'isSelected' : ''}`} onClick={() => onSelect(c.value)} aria-pressed={selected === c.value}>
          {c.label}
        </button>
      ))}
    </div>
  );
}
