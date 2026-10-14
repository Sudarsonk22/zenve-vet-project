import { useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/common/Icon';
import { appRoutes } from '../../../config/appRoutes';
import '../../shortvideos/styles/CommunityWidgets.css';

export default function MemberBenefitsPage() {
  const [teamMembers, setTeamMembers] = useState([]);
  const [name, setName] = useState('');
  const addMember = (event) => {
    event.preventDefault();
    if (!name.trim()) return;
    setTeamMembers((members) => [...members, name.trim()]);
    setName('');
  };
  return <div className="profilePage memberBenefitsPage">
    <Link className="profileBack" to={appRoutes.shortVideos}><Icon name="back" size={16} /> Back to community</Link>
    <p className="profileLabel">MEMBER BENEFITS</p><h1>Build better care, together.</h1><p className="memberIntro">Create your clinic team, connect with peers and unlock resources designed for veterinary professionals.</p>
    <div className="benefitGrid">
      <section><i><Icon name="users" /></i><h2>Create your team</h2><p>Add colleagues to your professional space and keep your clinic community connected.</p><form onSubmit={addMember}><input value={name} onChange={(e) => setName(e.target.value)} placeholder="Team member name" aria-label="Team member name" /><button type="submit">Add member</button></form>{teamMembers.length > 0 && <ul>{teamMembers.map((member) => <li key={member}><Icon name="user" size={15} /> {member}</li>)}</ul>}</section>
      <section><i><Icon name="message" /></i><h2>Meaningful connections</h2><p>Join conversations and learn with veterinary peers beyond your city.</p><Link to={appRoutes.search}>Discover members <Icon name="chevronRight" size={16} /></Link></section>
      <section><i><Icon name="briefcase" /></i><h2>Grow with possibility</h2><p>Access mentorship, clinical learning and professional opportunities.</p><Link to={appRoutes.shortVideos}>Explore community <Icon name="chevronRight" size={16} /></Link></section>
    </div>
  </div>;
}
