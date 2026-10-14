import { useState } from 'react';
import { X, ArrowUpRight } from 'lucide-react';

const empty = { name: '', city: '', specialty: 'Small Animal Medicine', about: '' };

export default function CreateProfileModal({ open, onClose, onCreate }) {
  const [form, setForm] = useState(empty);
  const [error, setError] = useState('');

  if (!open) return null;

  const update = e => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async e => {
    e.preventDefault();
    if (!form.name.trim() || !form.city.trim()) {
      setError('Please enter your name and city to continue.');
      return;
    }
    const ok = await onCreate(form);
    if (ok) {
      setForm(empty);
      setError('');
    }
  };

  return (
    <div className="modal-backdrop" onMouseDown={e => e.target === e.currentTarget && onClose()}>
      <section className="profile-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <button className="modal-close" onClick={onClose} aria-label="Close">
          <X size={22} />
        </button>
        <h2 id="modal-title">Make your professional mark.</h2>
        <p className="modal-subtitle">Your own public veterinary page. Free, with no login required.</p>
        <form onSubmit={submit}>
          <label>
            Full name
            <input name="name" value={form.name} onChange={update} placeholder="Dr. Your name" />
          </label>
          <label>
            City &amp; state
            <input name="city" value={form.city} onChange={update} placeholder="Bengaluru, Karnataka" />
          </label>
          <label>
            Specialty
            <select name="specialty" value={form.specialty} onChange={update}>
              <option>Small Animal Medicine</option>
              <option>Veterinary Surgery</option>
              <option>Veterinary Dermatology</option>
              <option>Animal Nutrition</option>
              <option>Emergency & Critical Care</option>
              <option>Veterinary Dentistry</option>
              <option>Large Animal Medicine</option>
            </select>
          </label>
          <label>
            About you
            <textarea
              name="about"
              value={form.about}
              onChange={update}
              placeholder="Your approach to care, interests and professional story"
              rows="3"
            />
          </label>
          <p className="privacy-note">
            Your page and posts are public and unverified. Publishing access stays in this
            browser; keep its data to retain access.
          </p>
          {error && <p className="form-error">{error}</p>}
          <button className="button button-gold modal-submit" type="submit">
            Create my professional page <ArrowUpRight size={18} />
          </button>
        </form>
      </section>
    </div>
  );
}