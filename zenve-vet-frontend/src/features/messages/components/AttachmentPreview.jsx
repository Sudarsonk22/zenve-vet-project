import { useEffect, useMemo } from 'react';
import Icon from '../../../components/common/Icon';
import { formatBytes } from '../../../utils/format';
import '../styles/MessageBubble.css';

// Either a pending local `file` (with onRemove) or a sent `attachment` returned by the backend.
export default function AttachmentPreview({ file, attachment, onRemove }) {
  const localUrl = useMemo(() => (file && file.type.startsWith('image/') ? URL.createObjectURL(file) : null), [file]);
  useEffect(() => () => localUrl && URL.revokeObjectURL(localUrl), [localUrl]);

  const name = file?.name ?? attachment?.name;
  const size = file?.size ?? attachment?.size;
  const imageUrl = localUrl || (attachment?.isImage ? attachment.url : null);

  const body = imageUrl ? (
    <img src={imageUrl} alt={name} className="attachmentImage" loading="lazy" />
  ) : (
    <span className="attachmentFile">
      <Icon name="file" size={20} />
      <span className="attachmentFileText"><strong>{name}</strong>{size ? <span>{formatBytes(size)}</span> : null}</span>
      {attachment?.url && <Icon name="download" size={16} />}
    </span>
  );

  return (
    <div className={`attachmentPreview ${onRemove ? 'isPending' : ''}`}>
      {attachment?.url ? <a href={attachment.url} target="_blank" rel="noopener noreferrer" aria-label={`Open ${name}`}>{body}</a> : body}
      {onRemove && (
        <button type="button" className="attachmentRemove" onClick={onRemove} aria-label={`Remove ${name}`}>
          <Icon name="close" size={12} />
        </button>
      )}
    </div>
  );
}
