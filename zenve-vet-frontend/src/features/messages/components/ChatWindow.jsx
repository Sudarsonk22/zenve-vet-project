import { useEffect, useRef, useState } from 'react';
import Avatar from '../../../components/common/Avatar';
import EmptyState from '../../../components/common/EmptyState';
import ErrorMessage from '../../../components/common/ErrorMessage';
import Icon from '../../../components/common/Icon';
import Loader from '../../../components/common/Loader';
import { formatDayLabel, sameDay } from '../../../utils/format';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import '../styles/ChatWindow.css';

export default function ChatWindow({ state, onBack, onToggleInfo }) {
  const { selectedConversation: conv, messages, msgLoading, msgError, hasOlder, loadingOlder, loadOlder, isMine, send, sending, sendError, actionError, meError } = state;
  const [replyTo, setReplyTo] = useState(null);
  const bottomRef = useRef(null);
  const lastId = messages[messages.length - 1]?.id;

  useEffect(() => setReplyTo(null), [conv?.id]);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' });
  }, [lastId, conv?.id]);

  if (!conv) {
    return (
      <section className="chatWindow isPlaceholder">
        <EmptyState icon="message" title="Select a conversation" text="Choose a conversation on the left to read and send messages." />
      </section>
    );
  }

  const { participant } = conv;
  return (
    <section className="chatWindow" aria-label={`Conversation with ${participant.name || 'member'}`}>
      <header className="chatHeader">
        <button type="button" className="zvIconBtn chatBackBtn" onClick={onBack} aria-label="Back to conversations"><Icon name="back" /></button>
        <Avatar src={participant.avatarUrl} name={participant.name} size={42} online={participant.online} />
        <div className="chatHeaderText">
          <strong>{participant.name || 'Member'}</strong>
          {participant.specialization && <span>{participant.specialization}</span>}
        </div>
        <button type="button" className="chatDeleteProfile" onClick={() => { const isLocalProfile = String(participant.id ?? '').startsWith('local-profile-'); if (window.confirm(isLocalProfile ? `Delete ${participant.name}'s profile?` : `Delete this chat with ${participant.name}?`)) state.deleteConversation(conv.id); }}><Icon name="trash" size={16} /> {String(participant.id ?? '').startsWith('local-profile-') ? 'Delete profile' : 'Delete chat'}</button>
        <button type="button" className="zvIconBtn" onClick={state.refreshAll} aria-label="Refresh messages"><Icon name="refresh" size={18} /></button>
        <button type="button" className="zvIconBtn chatInfoBtn" onClick={onToggleInfo} aria-label="Contact details"><Icon name="info" /></button>
      </header>

      <div className="chatMessages">
        {msgLoading ? (
          <Loader label="Loading messages…" />
        ) : msgError && messages.length === 0 ? (
          <ErrorMessage message={msgError} onRetry={state.reloadMessages} />
        ) : messages.length === 0 ? (
          <EmptyState icon="message" title="No messages yet" text={`Say hello to ${participant.name || 'this contact'}.`} />
        ) : (
          <>
            {hasOlder && (
              <button type="button" className="zvBtn zvBtnGhost zvBtnSm chatLoadOlder" onClick={loadOlder} disabled={loadingOlder}>
                {loadingOlder ? 'Loading…' : 'Load earlier messages'}
              </button>
            )}
            {msgError && <ErrorMessage compact message={msgError} onRetry={state.reloadMessages} />}
            {messages.map((m, i) => (
              <div key={m.id}>
                {(i === 0 || !sameDay(messages[i - 1].createdAt, m.createdAt)) && (
                  <div className="chatDayLabel"><span>{formatDayLabel(m.createdAt)}</span></div>
                )}
                <MessageBubble message={m} mine={isMine(m)} onReply={setReplyTo} onReact={state.react} />
              </div>
            ))}
          </>
        )}
        <div ref={bottomRef} />
      </div>

      {(meError || actionError) && <div className="chatNotice"><ErrorMessage compact message={meError || actionError} /></div>}
      {sendError && <div className="chatNotice"><ErrorMessage compact message={sendError} /></div>}
      <MessageInput onSend={send} sending={sending} replyTo={replyTo} onCancelReply={() => setReplyTo(null)} />
    </section>
  );
}
