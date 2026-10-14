/* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { DEFAULT_IMAGE } from '../api';

export default function EditProfileModal({ open, profile, onClose, onSave }) {
  const [form, setForm] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) {
      setForm({
        fullName: profile.name,
        specialty: profile.specialty,
        city: profile.city,
        state: profile.state,
        bio: profile.about || '',
        avatarUrl: profile.image === DEFAULT_IMAGE ? '' : profile.image,
      });
      setError('');
    }
  }, [open]);

  if (!open || !form) return null;

  const update = e => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async e => {
    e.preventDefault();
    if (!form.fullName.trim() || !form.city.trim()) {
      setError('Please enter your name and city.');
      return;
    }
    setBusy(true);
    try {
      await onSave(form);
    } catch (err) {
      setError(err.message);
    }
    setBusy(false);
  };

  return (
    <div className="modal-backdrop" onMouseDown={e => e.target === e.currentTarget && onClose()}>
      <section className="profile-modal" role="dialog" aria-modal="true" aria-labelledby="edit-title">
        <button className="modal-close" onClick={onClose} aria-label="Close">
          <X size={22} />
        </button>
        <h2 id="edit-title">Edit your page.</h2>
        <p className="modal-subtitle">Keep your professional details up to date.</p>
        <form onSubmit={submit}>
          <label>
            Full name
            <input name="fullName" value={form.fullName} onChange={update} />
          </label>
          <label>
            City
            <input name="city" value={form.city} onChange={update} />
          </label>
          <label>
            State
            <input name="state" value={form.state} onChange={update} />
          </label>
          <label>
            Specialty
            <input name="specialty" value={form.specialty} onChange={update} list="specialty-options" />
            <datalist id="specialty-options">
              <option value="Small Animal Medicine" />
              <option value="Veterinary Surgery" />
              <option value="Veterinary Dermatology" />
              <option value="Animal Nutrition" />
              <option value="Emergency & Critical Care" />
              <option value="Veterinary Dentistry" />
              <option value="Large Animal Medicine" />
            </datalist>
          </label>
          <label>
            Your story
            <textarea
              name="bio"
              value={form.bio}
              onChange={update}
              rows="4"
              placeholder="Your approach to care, interests and professional story"
            />
          </label>
          <label>
            Profile photo link
            <input name="avatarUrl" value={form.avatarUrl} onChange={update} placeholder="https://..." />
          </label>
          {error && <p className="form-error">{error}</p>}
          <button className="button button-gold modal-submit" type="submit" disabled={busy}>
            {busy ? 'Saving...' : 'Save changes'}
          </button>
        </form>
      </section>
    </div>
  );
}

