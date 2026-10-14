import EmptyState from '../../../components/common/EmptyState';
import ErrorMessage from '../../../components/common/ErrorMessage';
import Icon from '../../../components/common/Icon';
import Loader from '../../../components/common/Loader';
import { SEARCH_TYPES } from '../services/searchService';
import SearchResultCard from './SearchResultCard';
import '../styles/SearchResults.css';

const label = (id) => SEARCH_TYPES.find((t) => t.id === id)?.label || id;

function Pagination({ state, onPage }) {
  if (!state.hasMore && state.page === 0) return null;
  return (
    <nav className="searchPagination" aria-label="Pagination">
      <button type="button" className="zvBtn zvBtnGhost zvBtnSm" disabled={state.page === 0}
       onClick={() => onPage(state.page - 1)}><Icon name="chevronLeft" size={14} /> Previous</button>
      <span>Page {state.page + 1}{state.totalPages ? ` of ${state.totalPages}` : ''}</span>
      <button type="button" className="zvBtn zvBtnGhost zvBtnSm" disabled={!state.hasMore}
       onClick={() => onPage(state.page + 1)}>Next <Icon name="chevronRight" size={14} /></button>
    </nav>
  );
}

function List({ kind, items, onFollow, followingId }) {
  return (
    <ul className="searchResultList">
      {items.map((it) => <SearchResultCard key={it.id} kind={kind} item={it} onFollow={onFollow}
       followPending={followingId === it.id} />)}
    </ul>
  );
}

export default function SearchResults({ q, type, single, sections, onPage, onSeeAll, onFollow, followingId }) {
  if (!q) {
    return <EmptyState icon="search" title="Search Zenve Vet"
     text="Find veterinarians, short videos, posts and clinical cases." />;
  }

  if (type === 'all') {
    const order = Object.keys(sections);
    const settled = order.length > 0 && order.every((k) => sections[k].status !== 'loading');
    const allEmpty = settled && order.every((k) => sections[k].status === 'success' && sections[k].items.length === 0);
    if (order.length === 0) return <Loader label="Searching…" />;
    if (allEmpty) return <NoResults q={q} />;
    return (
      <div className="searchResults">
        {order.map((k) => {
          const s = sections[k];
          if (s.status === 'success' && s.items.length === 0) return null;
          return (
            <section key={k} className="searchSection">
              <header><h2>{label(k)}</h2>{s.status === 'success' && s.hasMore && <button type="button" className="searchSeeAll" onClick={() => onSeeAll(k)}>See all</button>}</header>
              {s.status === 'loading' && <Loader inline label={`Searching ${label(k).toLowerCase()}…`} />}
              {s.status === 'error' && <ErrorMessage compact message={s.error} />}
              {s.status === 'success' && <List kind={k} items={s.items} onFollow={onFollow} followingId={followingId} />}
            </section>
          );
        })}
      </div>
    );
  }

  if (single.status === 'loading' || single.status === 'idle') return <Loader label="Searching…" />;
  if (single.status === 'error') return <ErrorMessage message={single.error} />;
  if (single.items.length === 0) return <NoResults q={q} type={type} />;
  return (
    <div className="searchResults">
      {single.total !== null && <p className="searchCount">{single.total}
         {single.total === 1 ? 'result' : 'results'} for “{q}”</p>}
      <List kind={type} items={single.items} onFollow={onFollow} followingId={followingId} />
      <Pagination state={single} onPage={onPage} />
    </div>
  );
}

function NoResults({ q, type }) {
  return (
    <EmptyState
      icon="search"
      title={`No ${type ? label(type).toLowerCase() : 'results'} found for “${q}”`}
      text="Check the spelling, try broader keywords, or remove some filters."
    />
  );
}
