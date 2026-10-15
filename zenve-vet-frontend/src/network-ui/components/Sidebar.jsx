import {
  Compass,
  Users,
  BriefcaseMedical,
  Video,
  MessageCircle,
  Search,
  Award,
  Megaphone,
  Lightbulb,
  Stethoscope,
  ArrowUpRight,
  Sparkles,
  X,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import './sidebarFooter.css';

const items = [
  { label: 'Feed', icon: Compass },
  { label: 'Vet network', icon: Users },
  { label: 'Clinical cases', icon: BriefcaseMedical },
  { label: 'Short videos', icon: Video },
  { label: 'Messages', icon: MessageCircle },
  { label: 'Search', icon: Search },
  { label: 'Member benefits', icon: Award },
  { label: 'Advertise', icon: Megaphone },
];

export default function Sidebar({ active, onNavigate, onCreate, open, onClose }) {
  const go = label => {
    onNavigate(label);
    onClose?.();
  };

  const join = () => {
    onCreate?.();
    onClose?.();
  };

  return (
    <>
      <aside className={open ? 'sidebar sidebar-open' : 'sidebar'}>
        <button className="side-close" onClick={onClose} aria-label="Close menu">
          <X size={20} />
        </button>

        <div className="side-intro">
          <span>YOUR PROFESSIONAL WORLD</span>
          <h2>Connect, learn and grow with vets everywhere.</h2>
        </div>

        <nav>
          {items.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                className={active === item.label ? 'nav-item active' : 'nav-item'}
                onClick={() => go(item.label)}
              >
                <Icon size={18} />
                {item.label}
                {active === item.label && <i />}
              </button>
            );
          })}
        </nav>

        <div className="sf">
          <span className="sf-kicker">DISCOVER &amp; GROW</span>

          <button type="button" className="sf-link">
            <Lightbulb size={16} />
            <span>Innovation &amp; scholarships</span>
            <ArrowUpRight size={14} />
          </button>
          <button type="button" className="sf-link">
            <Stethoscope size={16} />
            <span>Expert mentorship</span>
            <ArrowUpRight size={14} />
          </button>

          <div className="sf-card">
            <Sparkles size={20} />
            <h3>Your next chapter starts here.</h3>
            <p>A professional page. A stronger network. A world of possibilities.</p>
            <button onClick={join}>Join the community</button>
            <small>FREE MEMBERSHIP · NO LOGIN</small>
          </div>

          <div className="sf-foot">
            <span>PEOPLE · PETS · LIVESTOCK</span>
            <span>© 2026 Zenve Vet™</span>
            <Link to="/team-review" onClick={onClose}>
              Team review
            </Link>
          </div>
        </div>
      </aside>
      <div className={open ? 'mobile-scrim show' : 'mobile-scrim'} onClick={onClose} />
    </>
  );
}