import { useRef, useState } from 'react';
import Icon from '../../../components/common/Icon';
import { formatBytes } from '../../../utils/format';
import { ATTACHMENT_ACCEPT, ATTACHMENT_LIMIT_BYTES } from '../services/messagesService';
import AttachmentPreview from './AttachmentPreview';
import '../styles/MessageInput.css';

const EMOJIS = ['😀', '😊', '😂', '😍', '🙏', '👍', '👏', '🎉', '❤️', '🐶', '🐱', '🐴', '🐄', '🩺', '💉', '🦴'];

export default function MessageInput({ onSend, sending, replyTo, onCancelReply }) {
  const [text, setText] = useState('');
  const [files, setFiles] = useState([]);
  const [fileError, setFileError] = useState('');
  const [emojiOpen, setEmojiOpen] = useState(false);
  const fileRef = useRef(null);
  const textRef = useRef(null);

  const addFiles = (list) => {
    const accepted = [];
    let problem = '';
    Array.from(list).forEach((f) => {
      if (f.size > ATTACHMENT_LIMIT_BYTES) problem = `${f.name} is too large (${formatBytes(f.size)}). Limit is ${formatBytes(ATTACHMENT_LIMIT_BYTES)}.`;
      else accepted.push(f);
    });
    setFileError(problem);
    setFiles((prev) => [...prev, ...accepted].slice(0, 5));
    if (fileRef.current) fileRef.current.value = '';
  };

  const insertEmoji = (emoji) => {
    const el = textRef.current;
    const start = el?.selectionStart ?? text.length;
    const end = el?.selectionEnd ?? text.length;
    setText(text.slice(0, start) + emoji + text.slice(end));
    setEmojiOpen(false);
    requestAnimationFrame(() => {
      el?.focus();
      el?.setSelectionRange(start + emoji.length, start + emoji.length);
    });
  };

  const canSend = (text.trim() || files.length > 0) && !sending;

  const submit = async (e) => {
    e?.preventDefault();
    if (!canSend) return;
    const ok = await onSend({ text: text.trim(), files, replyTo });
    if (ok) {
      setText('');
      setFiles([]);
      setFileError('');
      onCancelReply();
    }
  };

  return (
    <form className="messageInput" onSubmit={submit}>
      {replyTo && (
        <div className="messageInputReply">
          <Icon name="reply" size={14} />
          <span>Replying to: {replyTo.text || 'attachment'}</span>
          <button type="button" className="zvIconBtn" onClick={onCancelReply} aria-label="Cancel reply"><Icon name="close" size={14} /></button>
        </div>
      )}
      {files.length > 0 && (
        <div className="messageInputFiles">
          {files.map((f, i) => <AttachmentPreview key={`${f.name}-${i}`} file={f} onRemove={() => setFiles((prev) => prev.filter((_, j) => j !== i))} />)}
        </div>
      )}
      {fileError && <p className="messageInputError" role="alert">{fileError}</p>}
      <div className="messageInputRow">
        <input ref={fileRef} type="file" multiple hidden accept={ATTACHMENT_ACCEPT} onChange={(e) => addFiles(e.target.files)} />
        <button type="button" className="zvIconBtn" onClick={() => fileRef.current?.click()} aria-label="Attach a file" disabled={sending}><Icon name="paperclip" /></button>
        <div className="messageInputEmojiWrap">
          <button type="button" className="zvIconBtn" onClick={() => setEmojiOpen((o) => !o)} aria-label="Insert emoji" aria-expanded={emojiOpen}><Icon name="smile" /></button>
          {emojiOpen && (
            <div className="messageEmojiPalette" role="menu">
              {EMOJIS.map((em) => <button key={em} type="button" role="menuitem" onClick={() => insertEmoji(em)}>{em}</button>)}
            </div>
          )}
        </div>
        <textarea
          ref={textRef}
          rows={1}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) submit(e);
          }}
          placeholder="Write a message…"
          aria-label="Message"
          maxLength={4000}
        />
        <button type="submit" className="messageSendBtn" disabled={!canSend} aria-label="Send message">
          {sending ? <span className="zvSpinner" /> : <Icon name="send" size={18} />}
        </button>
      </div>
    </form>
  );
}
