import { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import ErrorMessage from '../../../components/common/ErrorMessage';
import Icon from '../../../components/common/Icon';
import Toast from '../../../components/common/Toast';
import { appRoutes } from '../../../config/appRoutes';
import VideoFeed from '../components/VideoFeed';
import VideoUploadForm from '../components/VideoUploadForm';
import useShortVideos from '../hooks/useShortVideos';
import { sampleStories, suggestedPeople } from '../../../data/sampleData';
import { PeopleSuggestions, StoriesBar, StoryViewer } from '../components/CommunityWidgets';
import '../../../components/common/common.css';
import '../styles/ShortVideosPage.css';

export default function ShortVideosPage() {
  const [params, setParams] = useSearchParams();
  const videoId = params.get('video') || '';
  const rawFeed = params.get('feed');
  const feed = rawFeed === 'following' || rawFeed === 'popular' ? rawFeed : 'forYou';
  const category = params.get('category') || '';
  const specialty = params.get('specialty') || '';
  const region = params.get('state') || '';
  const caseType = params.get('caseType') || '';
  const q = params.get('q') || '';

  const [searchText, setSearchText] = useState(q);
  const [showUpload, setShowUpload] = useState(false);
  const [notice, setNotice] = useState(null);
  const [activeStory, setActiveStory] = useState(null);

  const state = useShortVideos(videoId ?
     { source: 'single', videoId } :
      { source: 'feed', feed, category, specialty, state: region, caseType, q });

  useEffect(() => setSearchText(q), [q]);

  const update = useCallback(
    (patch) => {
      const next = new URLSearchParams(params);
      next.delete('video');
      Object.entries(patch).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
      setParams(next);
    },
    [params, setParams],
  );

  const onUploaded = () => {
    setShowUpload(false);
    setNotice({ type: 'success', text: 'Video uploaded successfully.' });
    state.refresh();
  };

  return (
    <div className="shortVideosPage">
      <div className="shortVideosLayout">
      <div className="shortVideosInner">
        <header className="shortVideosHeader">
          <div>
            <h1>Short Videos</h1>
            <p>Clinical tips, procedures and case insights from veterinary professionals.</p>
          </div>
          <div className="shortVideosHeaderActions">
            <Link to={appRoutes.savedVideos} className="zvBtn zvBtnGhost zvBtnSm">
            <Icon name="bookmark" size={14} /> Saved</Link>
            <Link to={appRoutes.watchHistory} className="zvBtn zvBtnGhost zvBtnSm">
            <Icon name="clock" size={14} /> History</Link>
            <button type="button" className="zvBtn zvBtnPrimary"
             onClick={() => setShowUpload(true)}>
              <Icon name="plus" size={16} /> Upload</button>
          </div>
        </header>

        {videoId ? (
          <>
            <button type="button" className="zvBtn zvBtnGhost zvBtnSm shortVideosBack" onClick={() => update({})}>
              <Icon name="back" size={14} /> Back to feed
            </button>
            <VideoFeed state={state} onNotify={setNotice} empty={{ title: 'Video not found', text: 'It may have been removed or made private.' }} />
          </>
        ) : (
          <>
            <StoriesBar stories={sampleStories} onOpen={setActiveStory} />
            <div className="shortVideosToolbar">
              <div className="shortVideosTabs" role="tablist" aria-label="Feed">
                <button type="button" role="tab" aria-selected={feed === 'forYou'} className={feed === 'forYou' ? 'isActive' : ''} onClick={() => update({ feed: '', category, q })}>For you</button>
                <button type="button" role="tab" aria-selected={feed === 'popular'} className={feed === 'popular' ? 'isActive' : ''} onClick={() => update({ feed: 'popular', category, q })}>Popular</button>
                <button type="button" role="tab" aria-selected={feed === 'following'} className={feed === 'following' ? 'isActive' : ''} onClick={() => update({ feed: 'following', category, q })}>Following</button>
              </div>
              <form
                className="shortVideosSearch"
                role="search"
                onSubmit={(e) => {
                  e.preventDefault();
                  update({ feed: feed === 'following' ? 'following' : '', category, q: searchText.trim() });
                }}
              >
                <Icon name="search" size={16} />
                <input type="search" value={searchText} onChange={(e) => setSearchText(e.target.value)} placeholder="Search videos" aria-label="Search within videos" />
                <button type="submit" aria-label="Search videos"><Icon name="search" size={16} /></button>
              </form>
            </div>

            <div className="shortVideosDiscoveryFilters" aria-label="Video filters">
              <label>
                <select value={specialty} onChange={(e) => update({ specialty: e.target.value })}>
                  <option value="">Veterinary specialty</option><option value="Small Animal Medicine">Small animal medicine</option><option value="Feline Medicine">Feline medicine</option><option value="Equine Medicine">Equine medicine</option><option value="Veterinary Surgery">Veterinary surgery</option>
                </select>
              </label>
              <label><select value={region} onChange={(e) => update({ state: e.target.value })}><option value="">All states</option><option value="Kerala">Kerala</option><option value="Maharashtra">Maharashtra</option><option value="Rajasthan">Rajasthan</option><option value="Tamil Nadu">Tamil Nadu</option></select></label>
              <label><select value={caseType} onChange={(e) => update({ caseType: e.target.value })}><option value="">Clinical content</option><option value="Clinical cases">Clinical cases</option><option value="Clinical perspectives">Clinical perspectives</option><option value="Procedures">Procedures</option></select></label>
              {(specialty || region || caseType || q) && <button type="button" className="clearDiscoveryFilters" onClick={() => { setSearchText(''); update({ specialty: '', state: '', caseType: '', q: '' }); }}><Icon name="close" size={16} /> Clear</button>}
              <span className="discoveryResultCount">{state.total ?? state.items.length} results</span>
            </div>

            <VideoFeed
              state={state}
              onNotify={setNotice}
              empty={{
                title: q || category ? 'No videos match your filters' : feed === 'following' ? 'Nothing from people you follow yet' : 'No videos yet',
                text: q || category ? 'Try a different search or category.' : feed === 'following' ? 'Follow veterinarians to see their videos here.' : 'Be the first to share a clinical tip.',
                action: !q && !category && feed === 'forYou' ? <button type="button" className="zvBtn zvBtnPrimary" onClick={() => setShowUpload(true)}>Upload a video</button> : null,
              }}
            />
          </>
        )}

        {state.actionError && <ErrorMessage compact message={state.actionError} />}
      </div>
      <PeopleSuggestions people={suggestedPeople} />
      </div>

      {showUpload && <VideoUploadForm onClose={() => setShowUpload(false)} onUploaded={onUploaded} />}
      <StoryViewer story={activeStory} onClose={() => setActiveStory(null)} />
      <Toast notice={notice} onClose={() => setNotice(null)} />
    </div>
  );
}

