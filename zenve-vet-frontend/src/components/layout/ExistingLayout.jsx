import { NavLink, Outlet } from 'react-router-dom';
import Icon from '../common/Icon';
import { appRoutes } from '../../config/appRoutes';
import './ExistingLayout.css';

// Minimal navigation shell. Replace it with your real layout/navbar and simply keep <Outlet />.
export default function ExistingLayout() {
  return (
    <div className="zvShell">
      <aside className="zvSidebar">
        <NavLink to={appRoutes.shortVideos} className="zvShellBrand">zenve<span>vet</span></NavLink>
        <p className="zvSidebarKicker">YOUR PROFESSIONAL WORLD</p>
        <p className="zvSidebarTagline">Great minds.<br />Healthier tomorrows.</p>
        <nav className="zvShellNav" aria-label="Main">
          <NavLink to={appRoutes.shortVideos}><Icon name="video" size={19} /> Short videos</NavLink>
          <NavLink to={appRoutes.messages}><Icon name="message" size={19} /> Messages</NavLink>
          <NavLink to={appRoutes.search}><Icon name="search" size={19} /> Search</NavLink>
          <NavLink to={appRoutes.advertise}><Icon name="briefcase" size={19} /> Advertise</NavLink>
          <NavLink to={appRoutes.benefits}><Icon name="users" size={19} /> Benefits</NavLink>
        </nav>
        <div className="zvSidebarFooter">THE ZENVE VET COMMUNITY<br /><strong>Better care, together.</strong></div>
      </aside>
      <main className="zvShellMain"><Outlet /></main>
    </div>
  );
}
