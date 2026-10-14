import { useState } from 'react';
import { ArrowUpRight, BriefcaseMedical, CirclePlus, ImagePlus, Sparkles, Stethoscope, Video } from 'lucide-react';
import { createPost, getMeId } from '../api';

const kinds = [
  { value: 'POST', label: 'Photo / Post', icon: ImagePlus },
  { value: 'CLINICAL_CASE', label: 'Clinical case', icon: BriefcaseMedical },
  { value: 'STORY', label: 'Story', icon: CirclePlus },
  { value: 'SHORT_VIDEO', label: 'Short video', icon: Video },
];

const defaultCategory = {
  POST: 'Community',
  CLINICAL_CASE: 'Clinical perspectives',
  STORY: 'Moments',
  SHORT_VIDEO: 'Learning',
};

export default function PostComposer({ fixedType, onPosted }) {
  const start = fixedType || 'POST';
  const [kind, setKind] = useState(start);
  const [category, setCategory] = useState(defaultCategory[start]);
  const [body, setBody] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);

  const showMore = body.trim() !== '' || kind === 'SHORT_VIDEO' || kind === 'CLINICAL_CASE';

  const chooseKind = value => {
    setKind(value);
    setCategory(defaultCategory[value]);
    setError('');
    setNotice('');
  };

  const mediaPlaceholder =
    kind === 'SHORT_VIDEO'
      ? 'Video link (required)'
      : kind === 'CLINICAL_CASE'
      ? 'Photo link (optional)'
      : 'Photo or video link (optional)';

  const submit = async e => {
    e.preventDefault();
    if (!body.trim()) {
      setError('Write something first.');
      return;
    }
    setBusy(true);
    try {
      await createPost({
        authorId: getMeId(),
        type: kind,
        category,
        body,
        mediaUrl: mediaUrl.trim() || null,
        consentReviewed: consent,
      });
      setBody('');
      setMediaUrl('');
      setConsent(false);
      setCategory(defaultCategory[kind]);
      setError('');
      setNotice('');
      onPosted();
    } catch (err) {
      setError(err.message);
    }
    setBusy(false);
  };

  return (
    <form className="zv-composer" onSubmit={submit}>
      <div className="zv-composer-top">
        <span className="zv-composer-icon">
          <Stethoscope size={20} />
        </span>
        <textarea
          rows="2"
          value={body}
          onChange={e => setBody(e.target.value)}
          placeholder={
            kind === 'CLINICAL_CASE'
              ? 'Describe the case. Keep it de-identified.'
              : 'Share a discovery, a case, a little inspiration...'
          }
        />
      </div>

      {showMore && (
        <div className="zv-composer-more">
          <input
            type="text"
            value={category}
            onChange={e => setCategory(e.target.value)}
            placeholder="Category"
          />
          <input
            type="text"
            value={mediaUrl}
            onChange={e => setMediaUrl(e.target.value)}
            placeholder={mediaPlaceholder}
          />
          {kind === 'CLINICAL_CASE' && (
            <label className="zv-check">
              <input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} />
              Consent was reviewed and this case is de-identified
            </label>
          )}
        </div>
      )}

      {error && <p className="form-error zv-composer-note">{error}</p>}
      {notice && <p className="zv-composer-note zv-notice">{notice}</p>}

      <div className="zv-composer-bar">
        <div className="zv-kinds">
          {kinds
            .filter(k => !fixedType || k.value === fixedType)
            .map(k => {
              const Icon = k.icon;
              return (
                <button
                  key={k.value}
                  type="button"
                  className={kind === k.value ? 'zv-kind zv-kind-active' : 'zv-kind'}
                  onClick={() => chooseKind(k.value)}
                >
                  <Icon size={15} /> {k.label}
                </button>
              );
            })}
          <button
            type="button"
            className="zv-kind zv-kind-ai"
            onClick={() => setNotice('The AI case assistant is coming soon.')}
          >
            <Sparkles size={15} /> AI case assistant
          </button>
        </div>
        <button className="zv-post-button" type="submit" disabled={busy}>
          {busy ? 'Posting...' : 'Post'} <ArrowUpRight size={15} />
        </button>
      </div>
    </form>
  );
}