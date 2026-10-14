import { useState } from 'react';
import EmptyState from '../../../components/common/EmptyState';
import ErrorMessage from '../../../components/common/ErrorMessage';
import Icon from '../../../components/common/Icon';
import Loader from '../../../components/common/Loader';
import ConversationItem from './ConversationItem';
import '../styles/ConversationList.css';

export default function ConversationList({ conversations, loading, error, selectedId, onSelect, onCreateProfile, filter, query, onQuery, onRetry }) {
  const [formOpen, setFormOpen] = useState(false);
  const [values, setValues] = useState({ name: '', city: '', specialization: '', about: '' });
  const emptyText = query
    ? `No conversations match "${query}".`
    : filter === 'all'
      ? 'Start a conversation from a veterinarian’s profile.'
      : `You have no ${filter} conversations.`;

  return (
    <section className="conversationList" aria-label="Conversations">
      <header className="conversationListHeader">
        <div className="conversationListTitle"><h1>Messages</h1><button type="button" onClick={() => setFormOpen((open) => !open)}>Create profile</button></div>
        <div className="conversationSearch">
          <Icon name="search" size={16} />
          <input type="search" value={query} onChange={(e) => onQuery(e.target.value)} placeholder="Search conversations" aria-label="Search conversations" />
        </div>
      </header>

      {formOpen && <form className="messageProfileForm" onSubmit={(event) => { event.preventDefault(); onCreateProfile(values); setValues({ name: '', city: '', specialization: '', about: '' }); setFormOpen(false); }}><strong>Create professional profile</strong>{[['name', 'Name'], ['city', 'City'], ['specialization', 'Specialty']].map(([field, label]) => <label key={field}>{label}<input required value={values[field]} onChange={(event) => setValues({ ...values, [field]: event.target.value })} /></label>)}<label>About<textarea required rows="3" value={values.about} onChange={(event) => setValues({ ...values, about: event.target.value })} /></label><div className="messageProfileFormActions"><button type="submit">Create & start chat</button><button type="button" className="messageProfileCancel" onClick={() => { setValues({ name: '', city: '', specialization: '', about: '' }); setFormOpen(false); }}>Cancel</button></div></form>}

      <div className="conversationListBody">
        {loading ? (
          <Loader label="Loading conversations…" />
        ) : error && conversations.length === 0 ? (
          <ErrorMessage message={error} onRetry={onRetry} />
        ) : conversations.length === 0 ? (
          <EmptyState icon="message" title={query ? 'No results' : 'No conversations'} text={emptyText} />
        ) : (
          <>
            {error && <ErrorMessage compact message={error} onRetry={onRetry} />}
            <p className="conversationPeopleLabel">PEOPLE</p>
            <ul className="conversationItems">
              {conversations.map((c) => (
                <ConversationItem key={c.id} conversation={c} active={c.id === selectedId} onSelect={onSelect} />
              ))}
            </ul>
          </>
        )}
      </div>
    </section>
  );
}
