import { useState } from 'react';
import { ImagePlus, X } from 'lucide-react';

function nowLocal() {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 16);
}

export default function NewCampaignModal({ onClose, onSubmit }) {
  const [form, setForm] = useState({
    headline: '',
    buttonText: 'Learn more',
    destinationUrl: '',
    posterUrl: '',
    startsAt: nowLocal(),
    endsAt: '',
    consent: false,
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const change = e => setForm({ ...form, [e.target.name]: e.target.value });

  const pickPoster = e => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setError('Poster must be under 2 MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setForm(f => ({ ...f, posterUrl: reader.result }));
      setError('');
    };
    reader.readAsDataURL(file);
  };

  const submit = async e => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await onSubmit({
        ...form,
        endsAt: form.endsAt || null,
      });
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  return (
    <div className="nc-overlay" onClick={onClose}>
      <form className="nc-modal" onClick={e => e.stopPropagation()} onSubmit={submit}>
        <button type="button" className="nc-close" onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>

        <h2>New campaign</h2>
        <p className="nc-sub">Our team reviews every campaign before it appears in the feed.</p>

        <div className="nc-poster-row">
          <div className="nc-poster">
            {form.posterUrl ? <img src={form.posterUrl} alt="Poster" /> : <span>No poster yet</span>}
          </div>
          <label className="nc-upload">
            <ImagePlus size={16} />
            <span>Upload poster</span>
            <input type="file" accept="image/*" onChange={pickPoster} hidden />
          </label>
        </div>

        <label className="nc-label" htmlFor="nc-headline">Headline</label>
        <input
          id="nc-headline"
          className="nc-input"
          name="headline"
          value={form.headline}
          onChange={change}
          placeholder="One line shown above your poster"
          required
        />

        <div className="nc-two">
          <div>
            <label className="nc-label" htmlFor="nc-button">Button text</label>
            <input
              id="nc-button"
              className="nc-input"
              name="buttonText"
              value={form.buttonText}
              onChange={change}
            />
          </div>
          <div>
            <label className="nc-label" htmlFor="nc-link">Destination link</label>
            <input
              id="nc-link"
              className="nc-input"
              name="destinationUrl"
              value={form.destinationUrl}
              onChange={change}
              placeholder="https://yourbrand.com"
              required
            />
          </div>
        </div>

        <div className="nc-two">
          <div>
            <label className="nc-label" htmlFor="nc-start">Starts</label>
            <input
              id="nc-start"
              className="nc-input"
              type="datetime-local"
              name="startsAt"
              value={form.startsAt}
              onChange={change}
              required
            />
          </div>
          <div>
            <label className="nc-label" htmlFor="nc-end">Ends (optional)</label>
            <input
              id="nc-end"
              className="nc-input"
              type="datetime-local"
              name="endsAt"
              value={form.endsAt}
              onChange={change}
            />
          </div>
        </div>

        <label className="nc-consent">
          <input
            type="checkbox"
            checked={form.consent}
            onChange={e => setForm({ ...form, consent: e.target.checked })}
          />
          <span>
            I confirm this ad makes no misleading or guaranteed health claims, doesn’t promote
            prescription medicines without approval, uses images and brands I have rights to, and
            the link matches the offer.
          </span>
        </label>

        {error && <p className="nc-error">{error}</p>}

        <button type="submit" className="nc-submit" disabled={saving}>
          {saving ? 'Submitting...' : 'Submit for review'}
        </button>
      </form>
    </div>
  );
}