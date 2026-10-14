import { useState } from 'react';
import Icon from '../../../components/common/Icon';
import { formatTime } from '../../../utils/format';
import AttachmentPreview from './AttachmentPreview';
import '../styles/MessageBubble.css';

const REACTIONS = ['👍', '❤️', '😂', '🙏'];

function Status({ status }) {
  if (!status) return null;
  const read = status === 'READ';
  const delivered = status === 'DELIVERED' || read;
  const label = read ? 'Read' : delivered ? 'Delivered' : 'Sent';
  return (
    <span className={`messageStatus ${read ? 'isRead' : ''}`} title={label} aria-label={label}>
      <Icon name="check" size={13} />
      {delivered && <Icon name="check" size={13} className="messageStatusSecond" />}
    </span>
  );
}

export default function MessageBubble({ message, mine, onReply, onReact }) {
  const [pickerOpen, setPickerOpen] = useState(false);
  return (
    <div className={`messageRow ${mine ? 'isMine' : 'isTheirs'}`}>
      <div className="messageBubbleWrap">
        <div className="messageBubble">
          {message.replyTo && (
            <blockquote className="messageReplyQuote">
              {message.replyTo.senderName && <strong>{message.replyTo.senderName}</strong>}
              <span>{message.replyTo.text || 'Attachment'}</span>
            </blockquote>
          )}
          {message.attachments.length > 0 && (
            <div className="messageAttachments">
              {message.attachments.map((a) => <AttachmentPreview key={a.id} attachment={a} />)}
            </div>
          )}
          {message.text && <p className="messageText">{message.text}</p>}
          <span className="messageMeta">
            <time dateTime={message.createdAt}>{formatTime(message.createdAt)}</time>
            {mine && <Status status={message.status} />}
          </span>
        </div>

        {message.reactions.length > 0 && (
          <div className="messageReactions">
            {message.reactions.map((r) => (
              <button key={r.emoji} type="button" className={r.reactedByMe ? 'isMine' : ''} onClick={() => onReact(message, r.emoji)} aria-pressed={r.reactedByMe}>
                {r.emoji} {r.count > 1 ? r.count : ''}
              </button>
            ))}
          </div>
        )}

        <div className="messageTools">
          <button type="button" className="messageTool" onClick={() => onReply(message)} aria-label="Reply"><Icon name="reply" size={15} /></button>
          <button type="button" className="messageTool" onClick={() => setPickerOpen((o) => !o)} aria-label="React" aria-expanded={pickerOpen}><Icon name="smile" size={15} /></button>
          {pickerOpen && (
            <div className="messageReactionPicker" role="menu">
              {REACTIONS.map((e) => (
                <button key={e} type="button" role="menuitem" onClick={() => { setPickerOpen(false); onReact(message, e); }}>{e}</button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
