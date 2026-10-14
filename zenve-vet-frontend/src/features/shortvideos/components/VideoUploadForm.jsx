import { useEffect, useMemo, useRef, useState } from 'react';
import ErrorMessage from '../../../components/common/ErrorMessage';
import Icon from '../../../components/common/Icon';
import { getErrorMessage, isCanceled } from '../../../services/apiClient';
import { formatBytes, parseHashtags } from '../../../utils/format';
import { fetchAnimalTypes, fetchCategories, fetchSpecialties, uploadVideo } from '../services/shortVideosService';
import '../styles/VideoUploadForm.css';

const MAX_VIDEO_MB = Number(import.meta.env.VITE_MAX_VIDEO_MB) || 200;
const MAX_THUMB_MB = 5;
const VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const VISIBILITY = [
  { value: 'PUBLIC', label: 'Public - everyone' },
  { value: 'FOLLOWERS', label: 'Followers only' },
  { value: 'PRIVATE', label: 'Only me' },
];

const initial = { title: '', description: '', category: '', animalType: '', specialty: '', hashtags: '', visibility: 'PUBLIC' };

// A <select> when the backend provides options, otherwise a plain text input (never invented options).
function OptionField({ id, label, value, onChange, options, loading, required, error }) {
  return (
    <div className={`uploadField ${error ? 'hasError' : ''}`}>
      <label htmlFor={id}>{label}{required && <span aria-hidden="true"> *</span>}</label>
      {options.length > 0 ? (
        <select id={id} value={value} onChange={(e) => onChange(e.target.value)} aria-invalid={Boolean(error)}>
          <option value="">{loading ? 'Loading…' : `Select ${label.toLowerCase()}`}</option>
          {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      ) : (
        <input id={id} type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={loading ? 'Loading…' : `Enter ${label.toLowerCase()}`} aria-invalid={Boolean(error)} />
      )}
      {error && <span className="uploadFieldError">{error}</span>}
    </div>
  );
}

export default function VideoUploadForm({ onClose, onUploaded }) {
  const [values, setValues] = useState(initial);
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [options, setOptions] = useState({ categories: [], specialties: [], animalTypes: [] });
  const [optionsLoading, setOptionsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const abortRef = useRef(null);

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    Promise.allSettled([fetchCategories({ signal }), fetchSpecialties({ signal }), fetchAnimalTypes({ signal })]).then((r) => {
      if (signal.aborted) return;
      const pick = (x) => (x.status === 'fulfilled' ? x.value : []);
      setOptions({ categories: pick(r[0]), specialties: pick(r[1]), animalTypes: pick(r[2]) });
      setOptionsLoading(false);
    });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && !uploading && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, uploading]);

  const thumbPreview = useMemo(() => (thumbnailFile ? URL.createObjectURL(thumbnailFile) : null), [thumbnailFile]);
  useEffect(() => () => thumbPreview && URL.revokeObjectURL(thumbPreview), [thumbPreview]);

  const set = (key) => (value) => setValues((v) => ({ ...v, [key]: value }));

  const pickVideo = (file) => {
    if (!file) return;
    let message = '';
    if (!VIDEO_TYPES.includes(file.type)) message = 'Use an MP4, WebM or MOV video.';
    else if (file.size > MAX_VIDEO_MB * 1048576) message = `Video must be ${MAX_VIDEO_MB} MB or smaller (this one is ${formatBytes(file.size)}).`;
    setErrors((e) => ({ ...e, videoFile: message }));
    setVideoFile(message ? null : file);
  };

  const pickThumb = (file) => {
    if (!file) return;
    let message = '';
    if (!IMAGE_TYPES.includes(file.type)) message = 'Use a JPG, PNG or WebP image.';
    else if (file.size > MAX_THUMB_MB * 1048576) message = `Thumbnail must be ${MAX_THUMB_MB} MB or smaller.`;
    setErrors((e) => ({ ...e, thumbnailFile: message }));
    setThumbnailFile(message ? null : file);
  };

  const validate = () => {
    const next = {};
    if (!values.title.trim()) next.title = 'Title is required.';
    else if (values.title.length > 120) next.title = 'Title must be 120 characters or fewer.';
    if (!values.category.trim()) next.category = 'Choose a category.';
    if (!videoFile) next.videoFile = errors.videoFile || 'Select a video file.';
    if (errors.thumbnailFile) next.thumbnailFile = errors.thumbnailFile;
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (uploading || !validate()) return;
    const controller = new AbortController();
    abortRef.current = controller;
    setUploading(true);
    setProgress(0);
    setSubmitError('');
    try {
      const created = await uploadVideo(
        { ...values, title: values.title.trim(), hashtags: parseHashtags(values.hashtags), videoFile, thumbnailFile },
        { onProgress: setProgress, signal: controller.signal },
      );
      onUploaded(created); // backend confirmed -> parent refreshes the feed and closes the form
    } catch (err) {
      if (!isCanceled(err)) setSubmitError(getErrorMessage(err, 'Upload failed.'));
      setUploading(false);
    }
  };

  const cancel = () => {
    abortRef.current?.abort();
    onClose();
  };

  return (
    <div className="uploadBackdrop" onClick={() => !uploading && onClose()}>
      <form className="uploadForm" onSubmit={submit} noValidate onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="uploadTitle">
        <header className="uploadHeader">
          <h2 id="uploadTitle">Upload a short video</h2>
          <button type="button" className="zvIconBtn" onClick={cancel} aria-label="Close"><Icon name="close" /></button>
        </header>

        <div className="uploadBody">
          <div className={`uploadField ${errors.title ? 'hasError' : ''}`}>
            <label htmlFor="uvTitle">Video title <span aria-hidden="true">*</span></label>
            <input id="uvTitle" type="text" value={values.title} maxLength={120} onChange={(e) => set('title')(e.target.value)} aria-invalid={Boolean(errors.title)} />
            {errors.title && <span className="uploadFieldError">{errors.title}</span>}
          </div>

          <div className="uploadField">
            <label htmlFor="uvDesc">Description</label>
            <textarea id="uvDesc" rows={3} value={values.description} maxLength={1000} onChange={(e) => set('description')(e.target.value)} />
          </div>

          <div className="uploadGrid">
            <OptionField id="uvCategory" label="Category" required value={values.category} onChange={set('category')} options={options.categories} loading={optionsLoading} error={errors.category} />
            <OptionField id="uvAnimal" label="Animal type" value={values.animalType} onChange={set('animalType')} options={options.animalTypes} loading={optionsLoading} />
            <OptionField id="uvSpecialty" label="Veterinary specialty" value={values.specialty} onChange={set('specialty')} options={options.specialties} loading={optionsLoading} />
            <div className="uploadField">
              <label htmlFor="uvVisibility">Visibility</label>
              <select id="uvVisibility" value={values.visibility} onChange={(e) => set('visibility')(e.target.value)}>
                {VISIBILITY.map((v) => <option key={v.value} value={v.value}>{v.label}</option>)}
              </select>
            </div>
          </div>

          <div className="uploadField">
            <label htmlFor="uvTags">Hashtags</label>
            <input id="uvTags" type="text" value={values.hashtags} onChange={(e) => set('hashtags')(e.target.value)} placeholder="#dentistry #surgery (separate with spaces or commas)" />
          </div>

          <div className="uploadGrid">
            <div className={`uploadField ${errors.videoFile ? 'hasError' : ''}`}>
              <label htmlFor="uvVideo">Video file <span aria-hidden="true">*</span></label>
              <label className="uploadDrop" htmlFor="uvVideo">
                <Icon name="upload" />
                <span>{videoFile ? `${videoFile.name} (${formatBytes(videoFile.size)})` : `MP4, WebM or MOV, up to ${MAX_VIDEO_MB} MB`}</span>
              </label>
              <input id="uvVideo" className="uploadFileInput" type="file" accept={VIDEO_TYPES.join(',')} onChange={(e) => pickVideo(e.target.files[0])} />
              {errors.videoFile && <span className="uploadFieldError">{errors.videoFile}</span>}
            </div>
            <div className={`uploadField ${errors.thumbnailFile ? 'hasError' : ''}`}>
              <label htmlFor="uvThumb">Thumbnail image</label>
              <label className="uploadDrop" htmlFor="uvThumb">
                {thumbPreview ? <img src={thumbPreview} alt="Thumbnail preview" className="uploadThumb" /> : <Icon name="image" />}
                <span>{thumbnailFile ? thumbnailFile.name : `JPG, PNG or WebP, up to ${MAX_THUMB_MB} MB`}</span>
              </label>
              <input id="uvThumb" className="uploadFileInput" type="file" accept={IMAGE_TYPES.join(',')} onChange={(e) => pickThumb(e.target.files[0])} />
              {errors.thumbnailFile && <span className="uploadFieldError">{errors.thumbnailFile}</span>}
            </div>
          </div>

          {uploading && (
            <div className="uploadProgress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}>
              <div className="uploadProgressBar" style={{ width: `${progress}%` }} />
              <span>{progress < 100 ? `Uploading… ${progress}%` : 'Processing on the server…'}</span>
            </div>
          )}
          {submitError && <ErrorMessage compact message={submitError} />}
        </div>

        <footer className="uploadFooter">
          <button type="button" className="zvBtn zvBtnGhost" onClick={cancel}>{uploading ? 'Cancel upload' : 'Cancel'}</button>
          <button type="submit" className="zvBtn zvBtnPrimary" disabled={uploading}>
            <Icon name="upload" size={16} /> {uploading ? 'Uploading…' : 'Upload video'}
          </button>
        </footer>
      </form>
    </div>
  );
}
