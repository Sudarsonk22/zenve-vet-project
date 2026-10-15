import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Avatar from '../../../components/common/Avatar';
import Icon from '../../../components/common/Icon';
import { appRoutes } from '../../../config/appRoutes';
import { sampleSearch, sampleVideos, suggestedPeople } from '../../../data/sampleData';
import { createVet, setMeId } from '../../../network-ui/api';
import '../../shortvideos/styles/CommunityWidgets.css';

const ownProfileKey = 'zenve-professional-profile';
const readOwn = () => { try { return JSON.parse(localStorage.getItem(ownProfileKey)); } catch { return null; } };
const professionalPageBenefits = [
  ['user', 'A page that is entirely you', 'A shareable professional presence with your story, specialty, clinical journal and community contributions.'],
  ['users', 'Peers beyond your postcode', 'Discover doctors across India, make connections and bring new perspectives into your practice.'],
  ['briefcase', 'Knowledge that travels', 'Share de-identified cases, discuss clinical questions and learn through thoughtful conversations.'],
  ['video', 'Your voice, in every format', 'Bring your short videos, insights and everyday learnings to your professional community.'],
  ['sparkles', 'Ideas with a future', 'Exchange ideas, find mentors and turn professional curiosity into meaningful work.'],
  ['clipboard', 'Room to grow', 'Build a body of work that grows with every case, contribution and connection.'],
];
const connectionBenefits = [
  ['users', 'Peers who understand', 'Meet veterinary professionals who share your interests, specialty and everyday clinical realities.'],
  ['message', 'Conversations that matter', 'Discuss cases, exchange perspectives and learn from practical experience across the community.'],
  ['mapPin', 'Beyond your city', 'Build relationships with thoughtful peers from clinics and hospitals across India.'],
  ['video', 'Learn in the open', 'Watch clinical insights and short videos that make new ideas easy to explore together.'],
  ['sparkles', 'Find your mentors', 'Connect with experienced professionals whose guidance can shape your next chapter.'],
  ['clipboard', 'A network you can trust', 'Keep growing a professional circle that supports better decisions and better care.'],
];
const growthBenefits = [
  ['briefcase', 'Opportunities with purpose', 'Discover new roles, collaborations and projects that fit the work you want to do.'],
  ['users', 'Mentorship that moves you', 'Learn directly from peers and mentors who can help you navigate your career with confidence.'],
  ['clipboard', 'Knowledge for every next step', 'Turn real clinical questions and shared cases into learning you can carry into practice.'],
  ['video', 'Share what you know', 'Build credibility by sharing insights, experiences and everyday lessons with your community.'],
  ['sparkles', 'Ideas with a future', 'Explore research, innovation and conversations that open up new directions for your work.'],
  ['user', 'A career that keeps growing', 'Create a professional presence and body of work that evolves with every contribution.'],
];

export function ProfessionalProfilePage() {
  const { id } = useParams();
  const person = id === 'my-professional-page' ? readOwn() : suggestedPeople.find((p) => p.id === id);
  const [shareMessage, setShareMessage] = useState('');
  const [isFollowing, setIsFollowing] = useState(Boolean(person?.following));
  if (!person) return <div className="profilePage"><p>Professional page not found.</p><Link to={appRoutes.shortVideos}>Back to short videos</Link></div>;
  const videos = sampleVideos.filter((video) => video.creator.id === person.id);
  const posts = sampleSearch.posts.filter((post) => post.author.id === person.id);
  const communities = person.specialization?.includes('Equine') ? ['Equine Medicine India', 'Clinical Case Exchange'] : person.specialization?.includes('Surgery') ? ['Veterinary Surgery Network', 'Clinical Case Exchange'] : ['Companion Animal Care', 'Clinical Case Exchange'];
  const shareProfile = async () => {
    const shareData = { title: `${person.name} | Zenve Vet`, text: `View ${person.name}'s veterinary profile on Zenve Vet.`, url: window.location.href };
    try {
      if (navigator.share) await navigator.share(shareData);
      else if (navigator.clipboard?.writeText) { await navigator.clipboard.writeText(shareData.url); setShareMessage('Profile link copied'); }
      else setShareMessage('Copy this profile URL from your browser address bar.');
    } catch (error) { if (error?.name !== 'AbortError') setShareMessage('Could not share profile'); }
  };
  return <div className="profilePage doctorProfilePage"><Link className="profileBack" to={appRoutes.shortVideos}><Icon name="back" size={16} /> Back to community</Link><section className="profileCard"><Avatar src={person.avatarUrl} name={person.name} size={96} /><div><p className="profileLabel">VETERINARY PROFESSIONAL</p><h1>{person.name}</h1><h2>{person.specialization}</h2><p className="profileCity"><Icon name="mapPin" size={16} /> {person.city || 'India'}</p><p className="profileAbout">{person.about || 'Dedicated to compassionate, evidence-led animal care.'}</p></div><div className="profileActions"><button className="profileFollow" type="button" aria-pressed={isFollowing} onClick={() => setIsFollowing((value) => !value)}>{isFollowing ? 'Following' : 'Follow'}</button><button className="profileShare" type="button" onClick={shareProfile}><Icon name="share" size={16} /> Share profile</button>{shareMessage && <small role="status">{shareMessage}</small>}</div></section><section className="doctorDetails"><div><Icon name="briefcase" size={19} /><span><small>SPECIALTY</small><strong>{person.specialization}</strong></span></div><div><Icon name="mapPin" size={19} /><span><small>LOCATION</small><strong>{person.city || 'India'}, India</strong></span></div><div><Icon name="users" size={19} /><span><small>COMMUNITY</small><strong>{communities.length} groups</strong></span></div><div><Icon name="video" size={19} /><span><small>CONTRIBUTIONS</small><strong>{videos.length + posts.length} shared</strong></span></div></section><section className="profileContent"><div className="profileSection"><div className="profileSectionTitle"><h2>Communities</h2><span>MEMBER OF</span></div><div className="communityChips">{communities.map((community) => <span key={community}><Icon name="users" size={15} /> {community}</span>)}</div></div><div className="profileSection"><div className="profileSectionTitle"><h2>Videos & photos</h2><span>{videos.length} SHARED</span></div>{videos.length ? <div className="profileMediaGrid">{videos.map((video) => <Link to={appRoutes.video(video.id)} key={video.id} className="profileMedia"><img src={video.thumbnailUrl} alt={video.title} /><span><Icon name="play" size={15} /> {video.title}</span></Link>)}</div> : <p className="profileEmpty">No videos shared yet.</p>}</div><div className="profileSection"><div className="profileSectionTitle"><h2>Posts & clinical notes</h2><span>{posts.length} POSTS</span></div>{posts.length ? posts.map((post) => <article className="profilePost" key={post.id}><p className="profileLabel">{post.category}</p><h3>{post.title}</h3><p>{post.preview}</p></article>) : <p className="profileEmpty">No posts shared yet.</p>}</div></section></div>;
}

export function CreateProfessionalPage() {
  const [values, setValues] = useState({ name: '', city: '', specialization: '', about: '' });
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  /**
   * Creates the page on the backend.
   *
   * It used to write a single localStorage record under a fixed id, which meant
   * the page existed only in that one browser, nobody else could open it, and a
   * second profile overwrote the first. It is a real vet_profiles row now, so it
   * appears in the network, in search, and can be messaged.
   */
  const submit = async (e) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    setError('');

    // The form collects one "City" field, but the backend keeps city and state
    // apart so the state filter works. "Kochi, Kerala" splits; a bare city does not.
    const [city, state] = values.city.split(',').map((part) => part.trim());

    try {
      const vet = await createVet({
        fullName: values.name.trim(),
        specialty: values.specialization.trim(),
        city: city || values.city.trim(),
        state: state || '',
        bio: values.about.trim(),
        avatarUrl: '',
      });
      // Whoever just made a page is now the viewer, so the rest of the app
      // (follows, messages, liked state) acts as them.
      setMeId(vet.id);
      navigate(appRoutes.profile(vet.slug));
    } catch (err) {
      setError(err.message || 'Your page could not be created. Please try again.');
      setSaving(false);
    }
  };
  const benefits = [
    ['user', 'A page that is entirely you', 'A shareable professional presence with your story, specialty, clinical journal and community contributions.'],
    ['users', 'Peers beyond your postcode', 'Discover doctors across India, make connections and bring new perspectives into your practice.'],
    ['briefcase', 'Knowledge that travels', 'Share de-identified cases, discuss clinical questions and learn through thoughtful conversations.'],
    ['video', 'Your voice, in every format', 'Bring your short videos, insights and everyday learnings to your professional community.'],
    ['sparkles', 'Ideas with a future', 'Exchange ideas, find mentors and turn professional curiosity into meaningful work.'],
    ['clipboard', 'Room to grow', 'Build a body of work that grows with every case, contribution and connection.'],
  ];
  return <div className="membershipPage"><Link className="profileBack" to={appRoutes.shortVideos}><Icon name="back" size={16} /> Back to community</Link><header><p className="profileLabel">FOR VETERINARY PROFESSIONALS</p><h1>Space for your work.<br />Support for your ambition.</h1><p>â‚¹0 membership Â· No login required</p></header><div className="membershipGrid">{benefits.map(([icon, title, text]) => <article key={title}><Icon name={icon} size={31} /><h2>{title}</h2><p>{text}</p></article>)}</div><div className="membershipAction"><button type="button" className="createPageBtn" onClick={() => setShowForm(true)}>Create your professional page <Icon name="chevronRight" size={17} /></button></div>{showForm && <form className="professionalForm" onSubmit={submit}><p className="profileLabel">YOUR PROFESSIONAL PAGE</p><h2>Tell the community about you</h2>{[['name', 'Your name'], ['city', 'City'], ['specialization', 'Specialty']].map(([name, label]) => <label key={name}>{label}<input required value={values[name]} onChange={(e) => setValues({ ...values, [name]: e.target.value })} placeholder={label} /></label>)}<label>About<textarea required value={values.about} onChange={(e) => setValues({ ...values, about: e.target.value })} placeholder="Tell the community about your work" rows="4" /></label>{error && <p className="profileEmpty" role="alert">{error}</p>}<button className="createPageBtn" type="submit" disabled={saving}>{saving ? 'Creating…' : 'Create professional page'} <Icon name="chevronRight" size={17} /></button></form>}</div>;
}

const advantageContent = {
  'professional-page': { icon: 'user', title: 'Your own professional page', text: 'Bring your work, expertise and voice together in one place that colleagues can discover.', action: 'Create your professional page', image: 'https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?auto=format&fit=crop&w=1200&q=85', benefitsTitle: 'Space for your work. Support for your ambition.', benefits: professionalPageBenefits },
  connections: { icon: 'users', title: 'Meaningful connections', text: 'Find veterinary peers with shared interests, learn from their cases and build your trusted professional network.', action: 'Explore people to know', image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=85', benefitsTitle: 'Better care begins with better connections.', benefits: connectionBenefits },
  growth: { icon: 'briefcase', title: 'Grow with possibility', text: 'Discover mentorship, research discussions and new opportunities that move your veterinary career forward.', action: 'Explore opportunities', image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1200&q=85', benefitsTitle: 'Make room for your next possibility.', benefits: growthBenefits },
};

export function AdvantagePage() {
  const { topic } = useParams();
  const item = advantageContent[topic];
  if (!item) return <div className="profilePage"><Link className="profileBack" to={appRoutes.shortVideos}><Icon name="back" size={16} /> Back to community</Link><p>Page not found.</p></div>;
  const destination = topic === 'professional-page' ? appRoutes.createProfessionalPage : topic === 'connections' ? appRoutes.search : appRoutes.shortVideos;
  return <div className="profilePage advantagePage"><Link className="profileBack" to={appRoutes.shortVideos}><Icon name="back" size={16} /> Back to community</Link><section className="advantageHero"><img src={item.image} alt="" /><div><i><Icon name={item.icon} size={26} /></i><p className="profileLabel">THE ZENVE ADVANTAGE</p><h1>{item.title}</h1><p>{item.text}</p><Link className="createPageBtn" to={destination}>{item.action} <Icon name="chevronRight" size={17} /></Link></div></section><section className="advantageBenefits" aria-labelledby="advantage-benefits-title"><div className="advantageBenefitsIntro"><p className="profileLabel">THE ZENVE ADVANTAGE</p><h2 id="advantage-benefits-title">{item.benefitsTitle}</h2></div><div className="advantageBenefitsGrid">{item.benefits.map(([icon, title, text]) => <article key={title}><Icon name={icon} size={28} /><h3>{title}</h3><p>{text}</p></article>)}</div></section></div>;
}

