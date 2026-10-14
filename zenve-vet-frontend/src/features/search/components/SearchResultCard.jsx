import { Link } from 'react-router-dom';
import Avatar from '../../../components/common/Avatar';
import Icon from '../../../components/common/Icon';
import { appRoutes } from '../../../config/appRoutes';
import { formatCount, timeAgo } from '../../../utils/format';

const Meta = ({ icon, children }) => (children ?
   <span className="searchMeta"><Icon name={icon} size={14} />{children}</span> : null);

function Person({ item, onFollow, pending }) {
  const canFollow = item.following !== undefined && !item.isSelf;
  return (
    <>
      <Avatar src={item.avatarUrl} name={item.name} size={56} />
      <div className="searchResultMain">
        <h3>{item.name || 'Veterinary professional'}</h3>
        {item.specialization && <p className="searchResultAccent">{item.specialization}</p>}
        <div className="searchMetaRow">
          <Meta icon="clipboard">{item.qualification}</Meta>
          <Meta icon="mapPin">{item.location}</Meta>
          <Meta icon="briefcase">{item.workplace}</Meta>
        </div>
      </div>
      <div className="searchResultActions">
        {canFollow && (
          <button type="button"
           className={`zvBtn zvBtnSm ${item.following ? 'zvBtnGhost' : 'zvBtnPrimary'}`}
            disabled={pending} onClick={() => onFollow(item)}
             aria-pressed={item.following}>
            {item.following ? 'Following' : 'Follow'}
          </button>
        )}
        <Link className="zvBtn zvBtnGhost zvBtnSm" to={appRoutes.profile(item.id)}>View Profile</Link>
      </div>
    </>
  );
}

function Video({ item }) {
  return (
    <>
      <Link to={appRoutes.video(item.id)}
       className="searchThumb" aria-label={`Open ${item.title}`}>
        {item.thumbnailUrl ? <img src={item.thumbnailUrl}
         alt="" loading="lazy" /> : <Icon name="video" size={28} />}
        <span className="searchThumbPlay"><Icon name="play" size={16} filled /></span>
      </Link>
      <div className="searchResultMain">
        <h3>{item.title}</h3>
        <p className="searchResultSub">{item.creator?.name}</p>
        <div className="searchMetaRow">
          <Meta icon="video">{item.category}</Meta>
          <Meta icon="eye">{formatCount(item.viewCount)
           !== null ? `${formatCount(item.viewCount)} views` : null}</Meta>
        </div>
      </div>
      <div className="searchResultActions"><Link className="zvBtn zvBtnPrimary zvBtnSm" to={appRoutes.video(item.id)}>Open Video</Link></div>
    </>
  );
}

function Post({ item, route, label }) {
  return (
    <>
      <div className="searchResultMain">
        <h3>{item.title || item.preview || 'Untitled'}</h3>
        {item.title && item.preview && <p className="searchResultSnippet">{item.preview}</p>}
        <div className="searchMetaRow">
          <Meta icon="user">{item.author?.name}</Meta>
          <Meta icon="clock">{item.createdAt ? timeAgo(item.createdAt) : null}</Meta>
          <Meta icon="clipboard">{item.category}</Meta>
          <Meta icon="briefcase">{item.specialty}</Meta>
          <Meta icon="users">{item.animalType}</Meta>
        </div>
      </div>
      <div className="searchResultActions"><Link className="zvBtn zvBtnGhost zvBtnSm" to={route(item.id)}>{label}</Link></div>
    </>
  );
}

function Community({ item }) {
  return (
    <>
      <Avatar src={item.avatarUrl} name={item.name} size={56} />
      <div className="searchResultMain">
        <h3>{item.name}</h3>
        {item.description && <p className="searchResultSnippet">{item.description}</p>}
        <div className="searchMetaRow"><Meta icon="users">{formatCount(item.memberCount)
         !== null ? `${formatCount(item.memberCount)} members` : null}</Meta></div>
      </div>
      <div className="searchResultActions"><Link className="zvBtn zvBtnPrimary zvBtnSm"
       to={appRoutes.community(item.id)}>Open Community</Link></div>
    </>
  );
}

export default function SearchResultCard({ kind, item, onFollow, followPending }) {
  return (
    <li className={`searchResultCard is-${kind}`}>
      {kind === 'people' && <Person item={item} onFollow={onFollow} pending={followPending} />}
      {kind === 'videos' && <Video item={item} />}
      {kind === 'posts' && <Post item={item} route={appRoutes.post} label="Read Post" />}
      {kind === 'cases' && <Post item={item} route={appRoutes.clinicalCase} label="View Case" />}
      {kind === 'communities' && <Community item={item} />}
    </li>
  );
}
