import { ArrowUpRight, Plus, Stethoscope } from 'lucide-react';
import PostFeed from '../components/PostFeed';

export default function ClinicalCases() {
  return (
    <main className="main-content cases-main">
      <section className="cases-hero">
        <div className="cases-copy">
          <span className="eyebrow gold-eyebrow">LEARN · SHARE · IMPROVE</span>
          <h1>Better care begins with a conversation.</h1>
          <p>
            A collaborative space for veterinary professionals to share clinical learnings,
            explore cases and grow together.
          </p>
          <button
            className="button button-gold"
            onClick={() => document.getElementById('case-feed')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Explore clinical cases <ArrowUpRight size={17} />
          </button>
        </div>
        <div className="cases-hero-art">
          <div className="art-circle">
            <Stethoscope size={64} />
          </div>
          <span className="art-label">COMPASSION IN PRACTICE</span>
        </div>
      </section>

      <div className="feed-heading" id="case-feed">
        <div>
          <span className="eyebrow">THE COMMUNITY FEED</span>
          <h2>Clinical cases &amp; perspectives</h2>
        </div>
        <button
          className="button button-outline"
          onClick={() => document.getElementById('composer')?.scrollIntoView({ behavior: 'smooth' })}
        >
          <Plus size={17} /> Share a case
        </button>
      </div>

      <PostFeed type="CLINICAL_CASE" />

      <p className="demo-disclaimer">
        Clinical examples are shared by community members and are not medical advice.
      </p>
    </main>
  );
}