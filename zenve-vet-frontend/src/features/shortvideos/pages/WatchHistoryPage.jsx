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

export default function WatchHistoryPage() {
  const state = useShortVideos({ source: 'history' });
  const [notice, setNotice] = useState(null);
  return (
    <div className="shortVideosPage">
      <div className="shortVideosInner">
        <header className="shortVideosHeader">
          <div>
            <h1>Watch history</h1>
            <p>Videos you have watched recently.</p>
          </div>
          <Link to={appRoutes.shortVideos} className="zvBtn zvBtnGhost zvBtnSm"><Icon name="back" size={14} /> Back to feed</Link>
        </header>
        <VideoFeed state={state} onNotify={setNotice} empty={{ title: 'No watch history', text: 'Videos you watch will show up here.' }} />
        {state.actionError && <ErrorMessage compact message={state.actionError} />}
      </div>
      <Toast notice={notice} onClose={() => setNotice(null)} />
    </div>
  );
}
