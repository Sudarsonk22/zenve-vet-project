import { ArrowUpRight, Stethoscope } from 'lucide-react';
import StoriesRow from '../components/StoriesRow';
import PostFeed from '../components/PostFeed';
import FeedRail from '../components/FeedRail';

export default function Feed({ onExplore, onCreate, initialType }) {
  return (
    <main className="main-content">
      <div className="feed-layout">
        <div className="feed-column">
          <section className="zv-hero">
            <div>
              <span className="eyebrow">THE ZENVE VET COMMUNITY</span>
              <h1>A world of care. Connected.</h1>
              <p>Meet your peers. Share your practice. Move veterinary care forward.</p>
              <button className="zv-hero-link" onClick={onCreate}>
                Make your mark <ArrowUpRight size={14} />
              </button>
            </div>
            <div className="zv-hero-art">
              <Stethoscope size={52} strokeWidth={1.2} />
              <span>
                BETTER
                <br />
                TOGETHER
              </span>
            </div>
          </section>

          <StoriesRow />
          <PostFeed initialType={initialType} />
        </div>

        <FeedRail onCreate={onCreate} onExplore={onExplore} />
      </div>
    </main>
  );
}