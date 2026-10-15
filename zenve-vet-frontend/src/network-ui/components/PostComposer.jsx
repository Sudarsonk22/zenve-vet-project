import { useRef, useState } from 'react';
import { ArrowUpRight, BriefcaseMedical, CirclePlus, ImagePlus, Stethoscope, Video, X } from 'lucide-react';
import { createPost, uploadMedia, getMeId } from '../api';

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

const VIDEO_TYPES = 'video/mp4,video/webm,video/quicktime,video/x-m4v';
const IMAGE_TYPES = 'image/jpeg,image/png,image/webp';
const MAX_MB = Number(import.meta.env.VITE_MAX_VIDEO_MB) || 50;

export default function PostComposer({ fixedType, onPosted }) {
  const start = fixedType || 'POST';
  const fileInput = useRef(null);
  const [kind, setKind] = useState(start);
  const [category, setCategory] = useState(defaultCategory[start]);
  const [body, setBody] = useState('');
  const [file, setFile] = useState(null);
  const [link, setLink] = useState('');
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const showMore = body.trim() !== '' || kind === 'SHORT_VIDEO' || kind === 'CLINICAL_CASE';
  const accept = kind === 'SHORT_VIDEO' ? VIDEO_TYPES : IMAGE_TYPES + ',' + VIDEO_TYPES;
  const chooseLabel = kind === 'SHORT_VIDEO' ? 'Choose video' : 'Choose photo or video';

  const chooseKind = value => {
    setKind(value);
    setCategory(defaultCategory[value]);
    setError('');
  };

  const pickFile = e => {
    const picked = e.target.files[0];
    e.target.value = '';
    if (!picked) return;
    if (picked.size > MAX_MB * 1024 * 1024) {
      setError('That file is larger than ' + MAX_MB + ' MB.');
      return;
    }
    setError('');
    setFile(picked);
  };

  const submit = async e => {
    e.preventDefault();
    if (!body.trim()) {
      setError('Write something first.');
      return;
    }
    if (kind === 'SHORT_VIDEO' && !file && !link.trim()) {
      setError('Choose a video to upload.');
      return;
    }
    setBusy(true);
    try {
      let mediaUrl = link.trim();
      if (file) {
        mediaUrl = await uploadMedia(file);
      }
      await createPost({
        authorId: getMeId(),
        type: kind,
        category,
        body,
        mediaUrl: mediaUrl || null,
        consentReviewed: consent,
      });
      setBody('');
      setFile(null);
      setLink('');
      setConsent(false);
      setCategory(defaultCategory[kind]);
      setError('');
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
            ref={fileInput}
            type="file"
            accept={accept}
            onChange={pickFile}
            style={{ display: 'none' }}
          />

          {file ? (
            <div className="zv-kind zv-kind-active" style={{ justifyContent: 'space-between' }}>
              <span>{file.name}</span>
              <button
                type="button"
                aria-label="Remove file"
                onClick={() => setFile(null)}
                style={{ border: 0, background: 'transparent', display: 'flex' }}
              >
                <X size={15} />
              </button>
            </div>
          ) : (
            <button type="button" className="zv-kind" onClick={() => fileInput.current.click()}>
              <ImagePlus size={15} /> {chooseLabel}
            </button>
          )}

          {!file && (
            <input
              type="text"
              value={link}
              onChange={e => setLink(e.target.value)}
              placeholder="Or paste a YouTube or photo link (optional)"
            />
          )}

          {kind === 'CLINICAL_CASE' && (
            <label className="zv-check">
              <input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} />
              Consent was reviewed and this case is de-identified
            </label>
          )}
        </div>
      )}

      {error && <p className="form-error zv-composer-note">{error}</p>}

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
        </div>
        <button className="zv-post-button" type="submit" disabled={busy}>
          {busy ? 'Posting...' : 'Post'} <ArrowUpRight size={15} />
        </button>
      </div>
    </form>
  );
}