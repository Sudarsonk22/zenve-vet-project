import { useState } from 'react';
import { X, ArrowRight, User, MapPin, Stethoscope, FileText, Lock, ShieldCheck } from 'lucide-react';
import logo from '../../assets/zenve-vet-logo.png';
import heroPhoto from '../../assets/profile-hero.png';
import './createProfileModal.css';

const empty = { name: '', city: '', specialty: '', about: '' };

export default function CreateProfileModal({ open, onClose, onCreate }) {
  const [form, setForm] = useState(empty);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (!open) return null;

  const update = e => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async e => {
    e.preventDefault();
    if (!form.name.trim() || !form.city.trim() || !form.specialty.trim()) {
      setError('Please enter your name, city and specialty to continue.');
      return;
    }
    setBusy(true);
    const ok = await onCreate(form);
    setBusy(false);
    if (ok) {
      setForm(empty);
      setError('');
    }
  };

  return (
    <div className="cp-backdrop" onMouseDown={e => e.target === e.currentTarget && onClose()}>
      <section className="cp-modal" role="dialog" aria-modal="true" aria-labelledby="cp-title">
        <div className="cp-top">
          <img className="cp-logo" src={logo} alt="Zenve Vet" />
          <span className="cp-trust">
            <ShieldCheck size={18} /> Trusted by pet lovers &amp; professionals
          </span>
          <button className="cp-close" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div className="cp-hero">
          <div className="cp-hero-text">
            <h2 id="cp-title">
              Make your <br />
              <span>professional</span> mark.
            </h2>
            <p>Your own public veterinary page. Free, with no login required.</p>
          </div>
          <img className="cp-hero-photo" src={heroPhoto} alt="" />
        </div>

        <form className="cp-card" onSubmit={submit}>
          <div className="cp-row">
            <span className="cp-icon"><User size={20} /></span>
            <div className="cp-field">
              <label htmlFor="cp-name">Full name</label>
              <input id="cp-name" name="name" value={form.name} onChange={update} placeholder="Dr. Your name" autoFocus />
            </div>
          </div>

          <div className="cp-row">
            <span className="cp-icon"><MapPin size={20} /></span>
            <div className="cp-field">
              <label htmlFor="cp-city">City &amp; state</label>
              <input id="cp-city" name="city" value={form.city} onChange={update} placeholder="Bengaluru, Karnataka" />
            </div>
          </div>

          <div className="cp-row">
            <span className="cp-icon"><Stethoscope size={20} /></span>
            <div className="cp-field">
              <label htmlFor="cp-specialty">Specialty</label>
              <input id="cp-specialty" name="specialty" value={form.specialty} onChange={update} placeholder="Small Animal Medicine" />
            </div>
          </div>

          <div className="cp-row">
            <span className="cp-icon"><FileText size={20} /></span>
            <div className="cp-field">
              <label htmlFor="cp-about">About you</label>
              <textarea id="cp-about" name="about" value={form.about} onChange={update} placeholder="Your approach to care, interests and professional story" rows="4" />
            </div>
          </div>

          <div className="cp-row cp-note-row">
            <span className="cp-icon cp-icon-small"><Lock size={15} /></span>
            <p className="cp-note">
              Your page and posts are public and unverified. Publishing access stays in this browser; keep its data to retain access.
            </p>
          </div>

          {error && <p className="cp-error">{error}</p>}

          <button className="cp-submit" type="submit" disabled={busy}>
            {busy ? 'Creating...' : 'Create my professional page'} <ArrowRight size={20} />
          </button>
        </form>
      </section>
    </div>
  );
}