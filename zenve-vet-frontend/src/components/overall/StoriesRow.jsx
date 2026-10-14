import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, Plus } from 'lucide-react';
import { getStories, getVets, getPosts, createPost, getMeId, DEFAULT_IMAGE } from '../api';

export default function StoriesRow() {
  const navigate = useNavigate();
  const meId = getMeId();
  const [stories, setStories] = useState([]);
  const [people, setPeople] = useState([]);
  const [open, setOpen] = useState(null);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    Promise.all([getStories(), getVets(meId)])
      .then(([storyList, vetList]) => {
        setStories(storyList);
        setPeople(vetList);
      })
      .catch(() => {});
  }, [reload, meId]);

  const withStory = new Set(stories.map(s => s.author.id));
  const others = people.filter(v => !withStory.has(v.id)).slice(0, 8);

  const firstName = name => name.replace('Dr. ', '').split(' ')[0];

  const openStory = async story => {
    const page = await getPosts({ type: 'STORY', authorId: story.author.id, viewerId: meId, size: 20 });
    const recent = page.items.filter(p => Date.now() - new Date(p.createdAt).getTime() < 86400000);
    setOpen({ author: story.author, items: recent });
  };

  const addStory = async () => {
    const text = window.prompt('Share a moment from your day');
    if (!text || !text.trim()) return;
    try {
      await createPost({ authorId: meId, type: 'STORY', category: 'Moments', body: text.trim() });
      setReload(reload + 1);
    } catch (error) {
      window.alert(error.message);
    }
  };

  return (
    <section>
      <div className="zv-section-head">
        <span>Moments from the community</span>
        <span className="zv-section-link">
          STORIES <ArrowUpRight size={12} />
        </span>
      </div>

      <div className="zv-stories">
        <button className="zv-story" onClick={addStory}>
          <span className="zv-story-ring zv-story-add">
            <Plus size={20} />
          </span>
          <small>Your story</small>
        </button>

        {stories.map(s => (
          <button className="zv-story" key={s.author.id} onClick={() => openStory(s)}>
            <img className="zv-story-ring" src={s.author.avatarUrl || DEFAULT_IMAGE} alt="" />
            <small>{firstName(s.author.fullName)}</small>
          </button>
        ))}

        {others.map(v => (
          <button className="zv-story" key={v.id} onClick={() => navigate('/profile/' + v.slug)}>
            <img
              className="zv-story-ring"
              style={{ borderColor: '#d9dcd5' }}
              src={v.image}
              alt=""
            />
            <small>{firstName(v.name)}</small>
          </button>
        ))}
      </div>

      {open && (
        <div className="zv-story-viewer">
          <div className="zv-story-head">
            <b>{open.author.fullName}</b>
            <button className="button button-outline" onClick={() => setOpen(null)}>
              Close
            </button>
          </div>
          {open.items.length === 0 && <p>No stories in the last 24 hours.</p>}
          {open.items.map(p => (
            <p key={p.id}>{p.body}</p>
          ))}
        </div>
      )}
    </section>
  );
}


