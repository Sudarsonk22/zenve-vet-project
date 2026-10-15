import { Link } from 'react-router-dom';
import {
  Compass,
  Users,
  BriefcaseMedical,
  Video,
  MessageCircle,
  Search,
  Award,
  Megaphone,
  X,
} from 'lucide-react';

const main = [
  { label: 'Feed', icon: Compass },
  { label: 'Vet network', icon: Users },
  { label: 'Clinical cases', icon: BriefcaseMedical },
  { label: 'Short videos', icon: Video },
  { label: 'Messages', icon: MessageCircle },
  { label: 'Search', icon: Search },
  { label: 'Member benefits', icon: Award },
  { label: 'Advertise', icon: Megaphone },
];

export default function Sidebar({ active, onNavigate, open, onClose }) {
  return (
    <>
      <div className={`mobile-scrim ${open ? 'show' : ''}`} onClick={onClose} />
      <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>
        <div className="side-intro">
          <span>YOUR PROFESSIONAL WORLD</span>
        </div>

        <nav>
          {main.map(({ label, icon: Icon }) => (
            <button
              key={label}
              onClick={() => {
                onNavigate(label);
                onClose?.();
              }}
              className={`nav-item ${active === label ? 'active' : ''}`}
            >
              <Icon size={20} />
              <span>{label}</span>
              {active === label && <i />}
            </button>
          ))}
        </nav>

        <div className="side-bottom">
          <Link to="/team-review" onClick={onClose}>
            Team review
          </Link>
        </div>

        <button className="side-close" onClick={onClose}>
          <X size={20} />
        </button>
      </aside>
    </>
  );
}