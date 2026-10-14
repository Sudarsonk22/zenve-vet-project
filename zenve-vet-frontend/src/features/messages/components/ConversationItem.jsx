import Avatar from '../../../components/common/Avatar';

export default function ConversationItem({ conversation, active, onSelect }) {
  const { participant, unreadCount } = conversation;
  return (
    <li>
      <button type="button" className={`conversationItem ${active ? 'isActive' : ''} ${unreadCount > 0 ? 'isUnread' : ''}`} onClick={() => onSelect(conversation.id)} aria-current={active ? 'true' : undefined}>
        <Avatar src={participant.avatarUrl} name={participant.name} size={48} online={participant.online} />
        <span className="conversationItemText">
          <strong>{participant.name || 'Member'}</strong>
        </span>
        {unreadCount > 0 && <span className="conversationItemBadge" aria-label={`${unreadCount} unread`}>{unreadCount > 99 ? '99+' : unreadCount}</span>}
      </button>
    </li>
  );
}
