import { useState } from 'react';
import { Link } from 'react-router-dom';
import ErrorMessage from '../../../components/common/ErrorMessage';
import Icon from '../../../components/common/Icon';
import Toast from '../../../components/common/Toast';
import { appRoutes } from '../../../config/appRoutes';
import VideoFeed from '../components/VideoFeed';
import useShortVideos from '../hooks/useShortVideos';
import '../../../components/common/common.css';
import '../styles/ShortVideosPage.css';

export default function SavedVideosPage() {
  const state = useShortVideos({ source: 'saved' });
  const [notice, setNotice] = useState(null);
  return (
    <div className="shortVideosPage">
      <div className="shortVideosInner">
        <header className="shortVideosHeader">
          <div>
            <h1>Saved videos</h1>
            <p>Your bookmarked clinical videos.</p>
          </div>
          <Link to={appRoutes.shortVideos} className="zvBtn zvBtnGhost zvBtnSm"><Icon name="back" size={14} /> Back to feed</Link>
        </header>
        <VideoFeed state={state} onNotify={setNotice} empty={{ title: 'No saved videos', text: 'Tap the bookmark on any video to keep it here.' }} />
        {state.actionError && <ErrorMessage compact message={state.actionError} />}
      </div>
      <Toast notice={notice} onClose={() => setNotice(null)} />
    </div>
  );
}
