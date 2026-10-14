/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useMemo, useState } from 'react';
import { Search, SlidersHorizontal, Users } from 'lucide-react';
import ProfileCard from '../components/ProfileCard';
import { getVets, getSpecialties, getStates, getMeId } from '../api';

export default function VetNetwork({ onView, onConnect, globalQuery, refreshKey }) {
  const [vets, setVets] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [states, setStates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [specialty, setSpecialty] = useState('All specialties');
  const [state, setState] = useState('All states');
  const [group, setGroup] = useState('Everyone');

  useEffect(() => {
    setLoading(true);
    Promise.all([getVets(getMeId()), getSpecialties(), getStates()])
      .then(([vetList, specialtyList, stateList]) => {
        setVets(vetList);
        setSpecialties(specialtyList);
        setStates(stateList);
        setError('');
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [refreshKey]);

  const shown = useMemo(() => {
    const q = (query + ' ' + (globalQuery || '')).trim().toLowerCase();
    return vets.filter(p => {
      const text = `${p.name} ${p.specialty} ${p.city} ${p.state}`.toLowerCase();
      return (
        (!q || text.includes(q)) &&
        (specialty === 'All specialties' || p.specialty === specialty) &&
        (state === 'All states' || p.state === state) &&
        (group === 'Everyone' || p.following)
      );
    });
  }, [vets, query, globalQuery, specialty, state, group]);

  return (
    <main className="main-content">
      <section className="network-hero">
        <div className="eyebrow gold-eyebrow">A COMMUNITY WITHOUT BOUNDARIES</div>
        <h1>Find your kind of brilliant.</h1>
        <p>Veterinary perspectives from every corner of India.</p>
      </section>

      <section className="filters">
        <label className="filter-search">
          <Search size={20} />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Name, specialty or city"
          />
        </label>
        <label className="select-wrap">
          <select value={specialty} onChange={e => setSpecialty(e.target.value)}>
            <option>All specialties</option>
            {specialties.map(s => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        <label className="select-wrap">
          <select value={state} onChange={e => setState(e.target.value)}>
            <option>All states</option>
            {states.map(s => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        <label className="select-wrap compact-select">
          <select value={group} onChange={e => setGroup(e.target.value)}>
            <option>Everyone</option>
            <option>Following</option>
          </select>
        </label>
      </section>

      <div className="results-line">
        <span>
          {shown.length} professional {shown.length === 1 ? 'page' : 'pages'}
        </span>
        <span>
          <SlidersHorizontal size={14} /> Credentials not verified
        </span>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <div className="empty-state">
          <Users size={32} />
          <h3>Could not load professionals</h3>
          <p>{error}</p>
        </div>
      ) : shown.length ? (
        <section className="profile-grid">
          {shown.map(p => (
            <ProfileCard key={p.id} profile={p} onView={onView} onConnect={onConnect} />
          ))}
        </section>
      ) : (
        <div className="empty-state">
          <Users size={32} />
          <h3>No professionals found</h3>
          <p>Try changing the search or filters.</p>
        </div>
      )}
    </main>
  );
}
