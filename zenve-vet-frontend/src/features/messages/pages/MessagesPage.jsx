import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ChatWindow from '../components/ChatWindow';
import ContactPanel from '../components/ContactPanel';
import ConversationList from '../components/ConversationList';
import useMessages from '../hooks/useMessages';
import '../../../components/common/common.css';
import '../styles/MessagesPage.css';

export default function MessagesPage() {
  const state = useMessages();
  const [params, setParams] = useSearchParams();
  const [infoOpen, setInfoOpen] = useState(false);
  const startedRef = useRef(null);

  // /messages?userId=123 opens (or creates, via the backend) a conversation with that user.
  const targetUser = params.get('userId');
  const { openWithUser } = state;
  useEffect(() => {
    if (!targetUser || startedRef.current === targetUser) return;
    startedRef.current = targetUser;
    openWithUser(targetUser).finally(() => setParams({}, { replace: true }));
  }, [targetUser, openWithUser, setParams]);

  const hasSelection = state.selectedId !== null;

  return (
    <div className={`messagesPage ${hasSelection ? 'hasSelection' : ''}`}>
      <div className="messagesLayout">
        <ConversationList
          conversations={state.conversations}
          loading={state.convLoading}
          error={state.convError}
          selectedId={state.selectedId}
          onSelect={state.selectConversation}
          filter={state.filter}
          onFilter={state.setFilter}
          query={state.query}
          onQuery={state.setQuery}
          onRetry={() => state.reloadConversations()}
        />
        <ChatWindow state={state} onBack={() => { setInfoOpen(false); state.selectConversation(null); }} onToggleInfo={() => setInfoOpen((o) => !o)} />
        <ContactPanel state={state} open={infoOpen} onClose={() => setInfoOpen(false)} />
      </div>
    </div>
  );
}
