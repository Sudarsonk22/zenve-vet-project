/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from 'react';
import { Search, Plus, Menu } from 'lucide-react';
import { searchAll, getMeId, DEFAULT_IMAGE } from '../api';
import logo from '../../assets/zenve-vet-logo.png';
import './HeaderSearch.css';

export default function Header({ onCreate, query, setQuery, onMenu, onSearch, onSelectDoctor }) {
  const [open, setOpen] = useState(false);
  const [doctors, setDoctors] = useState([]);

  const text = query.trim();
  const showList = open && text.length >= 2;

  useEffect(() => {
    if (text.length < 2) {
      setDoctors([]);
      return;
    }
    const timer = setTimeout(() => {
      searchAll({ q: text, size: 5, viewerId: getMeId() })
        .then(result => setDoctors(result.doctors.slice(0, 5)))
        .catch(() => setDoctors([]));
    }, 250);
    return () => clearTimeout(timer);
  }, [text]);

  const submit = event => {
    event.preventDefault();
    setOpen(false);
    onSearch?.();
  };

  const chooseDoctor = doctor => {
    setOpen(false);
    onSelectDoctor?.(doctor);
  };

  const searchEverything = () => {
    setOpen(false);
    onSearch?.();
  };

  return (
    <header className="topbar">
      <button className="mobile-menu" onClick={onMenu} aria-label="Open menu">
        <Menu size={21} />
      </button>

      <a className="brand" href="#/" aria-label="Zenve Vet home">
        <img
          src={logo}
          alt="Zenve Vet"
          style={{ width: 56, height: 56, objectFit: 'contain', flexShrink: 0 }}
        />
        <span>
          <b>
            ZENVE VET<sup>™</sup>
          </b>
          <small>THE PROFESSIONAL NETWORK</small>
        </span>
      </a>

      <form className="top-search hs-box" onSubmit={submit}>
        <Search size={18} />
        <input
          value={query}
          onChange={e => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder="Search doctors, specialties, cities..."
        />
        <span>INDIA</span>

        {showList && (
          <div className="hs-panel">
            {doctors.map(d => (
              <button
                type="button"
                key={d.id}
                className="hs-item"
                onMouseDown={e => {
                  e.preventDefault();
                  chooseDoctor(d);
                }}
              >
                <img src={d.image || DEFAULT_IMAGE} alt="" />
                <span className="hs-text">
                  <small>{d.name}</small>
                  <b>
                    {d.specialty} · {d.city}
                    {d.state && d.state !== 'India' ? ', ' + d.state : ''}
                  </b>
                </span>
              </button>
            ))}

            <button
              type="button"
              className="hs-all"
              onMouseDown={e => {
                e.preventDefault();
                searchEverything();
              }}
            >
              <Search size={16} />
              Search posts, cases &amp; takeaways for “{text}”
            </button>
          </div>
        )}
      </form>

      <div className="header-actions">
        <button className="button button-gold" onClick={onCreate}>
          <Plus size={18} />
          Create your profile
        </button>
      </div>
    </header>
  );
}