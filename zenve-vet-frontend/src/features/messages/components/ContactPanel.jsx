import { Link } from 'react-router-dom';
import Avatar from '../../../components/common/Avatar';
import ErrorMessage from '../../../components/common/ErrorMessage';
import Icon from '../../../components/common/Icon';
import { appRoutes } from '../../../config/appRoutes';

const Row = ({ icon, value }) => (value ? <li><Icon name={icon} size={16} /><span>{value}</span></li> : null);

export default function ContactPanel({ state, open, onClose }) {
  const { selectedConversation: conv, profile, profileError } = state;
  if (!conv || !profile) return <aside className={`contactPanel ${open ? 'isOpen' : ''}`} aria-label="Contact details" />;
  return (
    <aside className={`contactPanel ${open ? 'isOpen' : ''}`} aria-label="Contact details">
      <button type="button" className="zvIconBtn contactPanelClose" onClick={onClose} aria-label="Close details"><Icon name="close" /></button>
      <div className="contactPanelHead">
        <Avatar src={profile.avatarUrl} name={profile.name} size={88} online={profile.online} />
        <h2>{profile.name || 'Member'}</h2>
        {profile.specialization && <p className="contactPanelSub">{profile.specialization}</p>}
      </div>
      <ul className="contactPanelList">
        <Row icon="clipboard" value={profile.qualification} />
        <Row icon="briefcase" value={profile.workplace} />
        <Row icon="mapPin" value={profile.location} />
      </ul>
      {profile.bio && <p className="contactPanelBio">{profile.bio}</p>}
      {profileError && <ErrorMessage compact message={profileError} />}
      <div className="contactPanelActions">
        {profile.id && <Link className="zvBtn zvBtnGhost" to={appRoutes.profile(profile.id)}><Icon name="user" size={16} /> View profile</Link>}
        <button type="button" className="zvBtn zvBtnGhost" onClick={state.togglePin}><Icon name="pin" size={16} /> {conv.pinned ? 'Unpin' : 'Pin'} conversation</button>
        <button type="button" className="zvBtn zvBtnGhost" onClick={state.toggleArchive}><Icon name="archive" size={16} /> {conv.archived ? 'Unarchive' : 'Archive'}</button>
      </div>
    </aside>
  );
}
