/* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  ArrowLeft,
  BadgeCheck,
  Bell,
  Globe,
  ImagePlus,
  Link2,
  MapPin,
  Pencil,
  Stethoscope,
  Trash2,
  Users,
} from 'lucide-react';
import { getVet, updateVet, deleteVet, clearMeId, getPosts, getMeId, DEFAULT_IMAGE } from '../api';
import PostCard from '../components/PostCard';
import EditProfileModal from '../components/EditProfileModal';
import ClinicSection from '../components/ClinicSection';
import './profile.css';

const tabs = ['About', 'Posts', 'Cases', 'Videos'];
const tabType = { Posts: 'POST', Cases: 'CLINICAL_CASE', Videos: 'SHORT_VIDEO' };

export default function ProfilePage({ onBack, onConnect, refreshKey }) {
  const { slug } = useParams();
  const meId = getMeId();
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('About');
  const [tabPosts, setTabPosts] = useState([]);
  const [journal, setJournal] = useState([]);
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState('');
  const [reload, setReload] = useState(0);

  useEffect(() => {
    setTab('About');
    setMessage('');
  }, [slug]);

  useEffect(() => {
    getVet(slug, meId)
      .then(vet => {
        setProfile(vet);
        setError('');
      })
      .catch(e => setError(e.message));
  }, [slug, refreshKey, reload]);

  const profileId = profile ? profile.id : null;

  useEffect(() => {
    if (!profileId) return;
    getPosts({ type: 'CLINICAL_CASE', authorId: profileId, viewerId: meId, size: 3 })
      .then(page => setJournal(page.items))
      .catch(() => setJournal([]));
  }, [profileId]);

  useEffect(() => {
    const type = tabType[tab];
    setTabPosts([]);
    if (!profileId || !type) return;
    getPosts({ type, authorId: profileId, viewerId: meId, size: 20 })
      .then(page => setTabPosts(page.items))
      .catch(() => setTabPosts([]));
  }, [tab, profileId]);

  if (error) {
    return (
      <main className="main-content pf-main">
        <button className="pf-back" onClick={onBack}>
          <ArrowLeft size={13} /> Back to the community
        </button>
        <div className="empty-state">
          <h3>Profile not found</h3>
          <p>{error}</p>
        </div>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="main-content pf-main">
        <p>Loading...</p>
      </main>
    );
  }

  const owner = profile.id === meId;
  const hasPhoto = profile.image !== DEFAULT_IMAGE;
  const initial = profile.name.replace(/^dr\.?\s*/i, '').charAt(0);
  const hasStory = Boolean(profile.about && profile.about.trim());

  const checks = [
    ['Profile photo', hasPhoto],
    ['Story (bio)', hasStory],
    ['Location', Boolean(profile.city)],
    ['Verified badge', Boolean(profile.verified)],
  ];
  const strength = Math.round((checks.filter(c => c[1]).length / checks.length) * 100);

  const soon = () => setMessage('This feature is coming soon.');

  const share = () => {
    if (navigator.share) {
      navigator.share({ title: profile.name, url: location.href });
    } else {
      navigator.clipboard?.writeText(location.href);
      setMessage('Page link copied.');
    }
  };

  const save = async form => {
    const vet = await updateVet(profile.id, form);
    setProfile(vet);
    setEditing(false);
    setMessage('Your page was updated.');
    setReload(reload + 1);
  };

  const remove = async () => {
    if (!window.confirm('Delete this profile? This cannot be undone.')) return;
    try {
      await deleteVet(profile.id);
      if (owner) clearMeId();
      onBack();
    } catch (e) {
      setMessage(e.message);
    }
  };

  return (
    <main className="main-content pf-main">
      <button className="pf-back" onClick={onBack}>
        <ArrowLeft size={13} /> Back to the community
      </button>

      <section className="pf-banner">
        <div>
          <span className="pf-banner-eyebrow">THE PRACTICE OF POSSIBILITY</span>
          <h2>
            Care with purpose.
            <br />
            Progress with compassion.
          </h2>
        </div>
        <span className="pf-watermark">{initial}</span>
      </section>

      <section className="pf-identity">
        <div className="pf-avatar">
          {hasPhoto ? <img src={profile.image} alt={profile.name} /> : <span>{initial}</span>}
        </div>

        <div className="pf-info">
          <span className="eyebrow">INDEPENDENT PROFESSIONAL PAGE</span>
          <h1>{profile.name}</h1>
          <p className="pf-specialty">{profile.specialty}</p>
          <div className="pf-place">
            <MapPin size={13} /> {profile.city}
            <i />
            <Stethoscope size={13} />
          </div>
          <span className="pf-caption">
            {profile.verified ? 'Verified veterinary professional' : 'Veterinary professional'}
          </span>
        </div>

        <div className="pf-actions">
          {owner ? (
            <>
              <button className="pf-btn pf-btn-primary" onClick={() => setEditing(true)}>
                <Pencil size={14} /> Edit page
              </button>
              <button className="pf-btn" onClick={soon}>
                <BadgeCheck size={14} /> Get verified
              </button>
              <button className="pf-btn" onClick={soon}>
                <ImagePlus size={14} /> Banner &amp; journey
              </button>
              <button className="pf-btn" onClick={soon}>
                <Bell size={14} /> Phone alerts
              </button>
            </>
          ) : (
            <button className="pf-btn pf-btn-primary" onClick={() => onConnect(profile)}>
              <Users size={14} /> {profile.following ? 'Following' : 'Connect'}
            </button>
          )}
          <button className="pf-btn" onClick={share}>
            <Link2 size={14} /> Share page
          </button>
        </div>
      </section>

      {message && <p className="pf-message">{message}</p>}

      <nav className="pf-tabs">
        {tabs.map(t => (
          <button
            key={t}
            className={tab === t ? 'pf-tab pf-tab-active' : 'pf-tab'}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </nav>

      <div className="pf-body">
        <div className="pf-content">
          {tab === 'About' && (
            <>
              <section className="pf-section">
                <span className="eyebrow">BEHIND THE PRACTICE</span>
                <h2>{owner ? 'A little about my world.' : 'About ' + profile.name + '.'}</h2>
                <p>{hasStory ? profile.about : 'This professional has not added a story yet.'}</p>
                <div className="pf-chips">
                  <span className="pf-chip">{profile.specialty}</span>
                  <span className="pf-chip">Collaborative care</span>
                  <span className="pf-chip">Animal wellbeing</span>
                </div>
              </section>

              {owner && (
                <div className="pf-strength">
                  <div className="pf-strength-head">
                    <span>PAGE STRENGTH</span>
                    <b>{strength}%</b>
                  </div>
                  <div className="pf-bar">
                    <span style={{ width: strength + '%' }} />
                  </div>
                  <div className="pf-checklist">
                    {checks.map(([label, done]) => (
                      <span key={label} className={done ? 'pf-check-done' : ''}>
                        {done ? 'âœ“' : '+'} {label}
                      </span>
                    ))}
                  </div>
                  <button className="pf-wide" onClick={() => setEditing(true)}>
                    Complete my page
                  </button>
                </div>
              )}

              <ClinicSection vetId={profile.id} isOwner={owner} />

              <section className="pf-section pf-last">
                <span className="eyebrow">{owner ? 'MY CLINICAL JOURNAL' : 'CLINICAL JOURNAL'}</span>
                <h2>Perspectives from practice.</h2>
                {journal.length === 0 && <p>New perspectives will appear here as they are shared.</p>}
                {journal.map(p => (
                  <PostCard key={p.id} post={p} />
                ))}
              </section>
            </>
          )}

          {tab !== 'About' && (
            <section>
              {tabPosts.length === 0 && (
                <div className="pf-empty">
                  <p>Nothing here yet.</p>
                </div>
              )}
              {tabPosts.map(p => (
                <PostCard key={p.id} post={p} />
              ))}
            </section>
          )}
        </div>

        <aside className="pf-glance">
          <h3>At a glance</h3>
          <div className="pf-fact">
            <Stethoscope size={18} />
            <span>
              <small>Clinical interest</small>
              <b>{profile.specialty}</b>
            </span>
          </div>
          <div className="pf-fact">
            <MapPin size={18} />
            <span>
              <small>Based in</small>
              <b>{profile.city}</b>
            </span>
          </div>
          <div className="pf-fact">
            <Users size={18} />
            <span>
              <small>Community</small>
              <b>
                {profile.followersCount} {profile.followersCount === 1 ? 'connection' : 'connections'}
              </b>
            </span>
          </div>
          <div className="pf-fact">
            <Globe size={18} />
            <span>
              <small>Professional presence</small>
              <b>Zenve Vet network</b>
            </span>
          </div>
          <p className="pf-note">Self-created community profile. Credentials have not been verified.</p>
          {owner && (
            <button className="pf-delete" onClick={remove}>
              <Trash2 size={16} /> Delete profile
            </button>
          )}
        </aside>
      </div>

      <EditProfileModal
        open={editing}
        profile={profile}
        onClose={() => setEditing(false)}
        onSave={save}
      />
    </main>
  );
}
