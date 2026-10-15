import { useEffect, useState } from 'react';
import { X, ArrowUpRight } from 'lucide-react';


const empty = { name: '', city: '', specialty: '', about: '' };

export default function CreateProfileModal({ open, onClose, onCreate }) {
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) setForm(empty);
  }, [open]);

  if (!open) return null;

  const change = e => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async e => {
    e.preventDefault();
    setSaving(true);
    await onCreate(form);
    setSaving(false);
  };

  return (
    <div className="cp-overlay" onClick={onClose}>
      <form className="cp-modal" onClick={e => e.stopPropagation()} onSubmit={submit}>
        <button type="button" className="cp-close" onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>

        <h2 className="cp-title">Make your professional mark.</h2>
        <p className="cp-sub">Your own public veterinary page. Free, with no login required.</p>

        <label className="cp-label" htmlFor="cp-name">Full name</label>
        <input
          id="cp-name"
          className="cp-input"
          name="name"
          value={form.name}
          onChange={change}
          placeholder="Dr. Your name"
          required
          autoFocus
        />

        <label className="cp-label" htmlFor="cp-city">City &amp; state</label>
        <input
          id="cp-city"
          className="cp-input"
          name="city"
          value={form.city}
          onChange={change}
          placeholder="Bengaluru, Karnataka"
          required
        />

        <label className="cp-label" htmlFor="cp-specialty">Specialty</label>
        <input
          id="cp-specialty"
          className="cp-input"
          name="specialty"
          value={form.specialty}
          onChange={change}
          placeholder="Small Animal Medicine"
          required
        />

        <label className="cp-label" htmlFor="cp-about">About you</label>
        <textarea
          id="cp-about"
          className="cp-textarea"
          name="about"
          value={form.about}
          onChange={change}
          placeholder="Your approach to care, interests and professional story"
        />

        <p className="cp-note">
          Your page and posts are public and unverified. Publishing access stays in this browser;
          keep its data to retain access.
        </p>

        <button type="submit" className="cp-submit" disabled={saving}>
          {saving ? 'Creating...' : 'Create my professional page'}
          {!saving && <ArrowUpRight size={14} />}
        </button>
      </form>
    </div>
  );
}