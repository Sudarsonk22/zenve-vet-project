import { useState } from 'react';
import { X, ImagePlus } from 'lucide-react';

const empty = {
  name: '',
  location: '',
  address: '',
  phone: '',
  openingHours: '',
  services: '',
  about: '',
  photoUrl: '',
};

export default function ClinicModal({ clinic, onClose, onSave }) {
  const [form, setForm] = useState(
    clinic
      ? { ...empty, ...clinic, services: (clinic.services || []).join(', ') }
      : empty
  );
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const pickPhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setError('Photo must be under 2 MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setForm((f) => ({ ...f, photoUrl: reader.result }));
      setError('');
    };
    reader.readAsDataURL(file);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError('Clinic name is required');
      return;
    }
    setSaving(true);
    try {
      await onSave(form);
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  return (
    <div className="cl-overlay" onClick={onClose}>
      <form className="cl-modal" onClick={(e) => e.stopPropagation()} onSubmit={submit}>
        <button type="button" className="cl-close" onClick={onClose} aria-label="Close">
          <X size={20} />
        </button>

        <h2>{clinic ? 'Edit clinic page' : 'Add your clinic page'}</h2>
        <p className="cl-sub">Share where you practise so pet owners and colleagues can find you.</p>

        <label className="cl-label">Clinic photo</label>
        <div className="cl-photo-row">
          <div className="cl-photo">
            {form.photoUrl ? <img src={form.photoUrl} alt="Clinic" /> : <ImagePlus size={26} />}
          </div>
          <label className="cl-upload">
            Upload photo
            <input type="file" accept="image/*" onChange={pickPhoto} hidden />
          </label>
        </div>

        <label className="cl-label">Clinic name</label>
        <input name="name" value={form.name} onChange={change} placeholder="Paws & Care Veterinary Clinic" />

        <label className="cl-label">City &amp; state</label>
        <input name="location" value={form.location} onChange={change} placeholder="Kochi, Kerala" />

        <label className="cl-label">Address</label>
        <input name="address" value={form.address} onChange={change} placeholder="Street, area, landmark" />

        <label className="cl-label">Phone</label>
        <input name="phone" value={form.phone} onChange={change} placeholder="+91 ..." />

        <label className="cl-label">Opening hours</label>
        <input name="openingHours" value={form.openingHours} onChange={change} placeholder="Mon–Sat 9am – 8pm" />

        <label className="cl-label">Services (comma separated)</label>
        <input name="services" value={form.services} onChange={change} placeholder="Vaccination, Surgery, Dental care" />

        <label className="cl-label">About the clinic</label>
        <textarea name="about" rows="4" value={form.about} onChange={change} placeholder="Tell visitors what makes your clinic special" />

        {error && <p className="cl-error">{error}</p>}

        <button type="submit" className="cl-save" disabled={saving}>
          {saving ? 'Saving...' : 'Save clinic page'}
        </button>
      </form>
    </div>
  );
}