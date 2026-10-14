import {
  Award,
  BriefcaseMedical,
  Compass,
  MessageCircle,
  Search,
  Users,
  Video,
  X,
} from 'lucide-react';

const navigationItems = [
  { label: 'Feed', icon: Compass },
  { label: 'Vet network', icon: Users },
  { label: 'Clinical cases', icon: BriefcaseMedical },
  { label: 'Short videos', icon: Video },
  { label: 'Messages', icon: MessageCircle },
  { label: 'Search', icon: Search },
  { label: 'Member benefits', icon: Award },
  { label: 'Advertise', icon: BriefcaseMedical },
];

export default function Sidebar({ active, onNavigate, open, onClose }) {
  return (
    <>
      <div className={`mobile-scrim ${open ? 'show' : ''}`} onClick={onClose} />
      <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>
        <div className="side-intro"><span>YOUR PROFESSIONAL WORLD</span></div>
        <nav aria-label="Main navigation">
          {navigationItems.map(({ label, icon: Icon }) => (
            <button
              key={label}
              type="button"
              onClick={() => { onNavigate(label); onClose?.(); }}
              className={`nav-item ${active === label ? 'active' : ''}`}
            >
              <Icon size={20} />
              <span>{label}</span>
              {active === label && <i />}
            </button>
          ))}
        </nav>
        <button type="button" className="side-close" onClick={onClose} aria-label="Close menu"><X size={20} /></button>
      </aside>
    </>
  );
}


