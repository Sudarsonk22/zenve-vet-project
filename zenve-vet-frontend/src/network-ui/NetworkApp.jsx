import { useEffect, useState } from 'react';
import './index.css';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import CreateProfileModal from './components/CreateProfileModal';
import VetNetwork from './pages/VetNetwork';
import ProfilePage from './pages/ProfilePage';
import ClinicalCases from './pages/ClinicalCases';
import Feed from './pages/Feed';
import { Search, CheckCircle2 } from 'lucide-react';
import { createVet, follow, unfollow, setMeId, getMeId } from './api';
import { appRoutes } from '../config/appRoutes';
import AdvertisePage from '../features/AdvertistPage/AdvertisePage';
import BenefitsPage from '../features/AdvertistPage/BenefitsPage';
import MessagesPage from '../features/messages/pages/MessagesPage';
import {
  AdvantagePage,
  CreateProfessionalPage,
  ProfessionalProfilePage,
} from '../features/profiles/pages/ProfessionalPages';
import SearchDiscover from './pages/SearchDiscover';
import SavedVideosPage from '../features/shortvideos/pages/SavedVideosPage';
import ShortVideosPage from '../features/shortvideos/pages/ShortVideosPage';
import WatchHistoryPage from '../features/shortvideos/pages/WatchHistoryPage';
import TeamReviewPage from '../features/team/TeamReviewPage';

const pages = {
  Feed: '/feed',
  'Vet network': '/network',
  'Clinical cases': '/clinical-cases',
  'Short videos': appRoutes.shortVideos,
  Messages: appRoutes.messages,
  Search: appRoutes.search,
  'Member benefits': appRoutes.benefits,
  Advertise: appRoutes.advertise,
};

export default function NetworkApp() {
  const navigate = useNavigate();
  const location = useLocation();
  const [active, setActive] = useState('Feed');
  const [modal, setModal] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [globalQuery, setGlobalQuery] = useState('');
  const [toast, setToast] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const path = location.pathname;
    if (path.startsWith('/profile')) {
      setActive('Vet network');
      return;
    }
    const found = Object.keys(pages).find(
      label => path === pages[label] || path.startsWith(pages[label] + '/')
    );
    setActive(found || 'Feed');
  }, [location.pathname]);

  const showToast = (text, time = 2800) => {
    setToast(text);
    setTimeout(() => setToast(''), time);
  };

  const go = label => {
    setActive(label);
    navigate(pages[label] || '/feed');
  };

  const create = async form => {
    const parts = form.city.split(',').map(x => x.trim());
    try {
      const vet = await createVet({
        fullName: form.name,
        specialty: form.specialty,
        city: parts[0] || form.city,
        state: parts[1] || 'India',
        bio: form.about,
        avatarUrl: '',
      });
      setMeId(vet.id);
      setModal(false);
      navigate('/profile/' + vet.slug);
      showToast('Your professional page was created', 3000);
      return true;
    } catch (error) {
      showToast(error.message);
      return false;
    }
  };

  const view = p => navigate('/profile/' + p.slug);

  const connect = async p => {
    const meId = getMeId();
    if (p.id === meId) {
      showToast('This is your own page');
      return;
    }
    try {
      if (p.following) {
        await unfollow(p.id, meId);
        showToast(`You unfollowed ${p.name}`);
      } else {
        await follow(p.id, meId);
        showToast(`You are now following ${p.name}`);
      }
      setRefreshKey(key => key + 1);
    } catch (error) {
      showToast(error.message);
    }
  };

  const back = () => {
    navigate('/network');
    setActive('Vet network');
  };

  const networkPage = (
    <VetNetwork
      onView={view}
      onConnect={connect}
      globalQuery={globalQuery}
      refreshKey={refreshKey}
    />
  );

  if (location.pathname.startsWith('/team-review')) {
    return <TeamReviewPage />;
  }

  return (
    <div className="app-shell">
      <Header
        onCreate={() => setModal(true)}
        query={globalQuery}
        setQuery={setGlobalQuery}
        onMenu={() => setMobileOpen(true)}
      />
      <div className="app-layout">
        <Sidebar
          active={active}
          onNavigate={go}
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
        />
        <Routes>
          <Route path="/" element={<Feed onExplore={() => go('Vet network')} onCreate={() => setModal(true)} />} />
          <Route path="/network" element={networkPage} />
          <Route path="/clinical-cases" element={<ClinicalCases />} />
          <Route
            path="/feed"
            element={<Feed onExplore={() => go('Vet network')} onCreate={() => setModal(true)} />}
          />
          <Route
            path="/profile/:slug"
            element={<ProfilePage onBack={back} onConnect={connect} refreshKey={refreshKey} />}
          />
          <Route path={appRoutes.shortVideos} element={<ShortVideosPage />} />
          <Route path={appRoutes.savedVideos} element={<SavedVideosPage />} />
          <Route path={appRoutes.watchHistory} element={<WatchHistoryPage />} />
          <Route path={appRoutes.messages} element={<MessagesPage />} />
          <Route
            path={appRoutes.search}
            element={
              <SearchDiscover onView={view} onConnect={connect} globalQuery={globalQuery} />
            }
          />
          <Route path={appRoutes.advertise} element={<AdvertisePage />} />
          <Route
            path={appRoutes.benefits}
            element={<BenefitsPage onCreate={() => setModal(true)} />}
          />
          <Route
            path={appRoutes.memberBenefits}
            element={<Navigate to={appRoutes.benefits} replace />}
          />
          <Route path={appRoutes.createProfessionalPage} element={<CreateProfessionalPage />} />
          <Route path="/professional/:id" element={<ProfessionalProfilePage />} />
          <Route path="/advantage/:topic" element={<AdvantagePage />} />
          <Route
            path="*"
            element={
              <div className="main-content">
                <div className="empty-state">
                  <Search size={32} />
                  <h3>{location.pathname.slice(1).replaceAll('-', ' ')}</h3>
                  <p>
                    This section is a UI preview. Use Vet network or Clinical cases to explore
                    the implemented pages.
                  </p>
                  <button className="button button-gold" onClick={() => go('Vet network')}>
                    Go to vet network
                  </button>
                </div>
              </div>
            }
          />
        </Routes>
      </div>
      <CreateProfileModal open={modal} onClose={() => setModal(false)} onCreate={create} />
      {toast && (
        <div className="toast">
          <CheckCircle2 size={18} />
          {toast}
        </div>
      )}
    </div>
  );
}