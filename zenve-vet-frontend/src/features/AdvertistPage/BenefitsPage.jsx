import "./style.css";
import "./benefitsHero.css";
import { ArrowUpRight } from "lucide-react";
  import heroBg from "../../assets/benefits-hero.jpg";;

const BENEFITS = [
  {
    icon: "",
    title: "A page that is entirely you",
    text: "A shareable professional presence with your story, specialty, clinical journal and community contributions.",
  },
  {
    icon: "",
    title: "Peers beyond your postcode",
    text: "Discover doctors across India, make connections and bring new perspectives into your practice.",
  },
  {
    icon: "",
    title: "Knowledge that travels",
    text: "Share de-identified cases, discuss clinical questions and learn through thoughtful conversations.",
  },
  {
    icon: "",
    title: "Your voice, in every format",
    text: "Publish photos, stories and short videos that bring your practice and ideas to life.",
  },
  {
    icon: "",
    title: "Ideas with a future",
    text: "Explore innovation scholarship, technology guidance and pilot pathways. Selection and support are subject to program criteria.",
  },
  {
    icon: "",
    title: "Room to grow",
    text: "Discover potential mentorship, research collaboration and professional visibility through the Zenve community. Program opportunities are not guaranteed.",
  },
];

function HeroSection({ onOpen }) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <section className="bh-hero" style={{ backgroundImage: `url(${heroBg})` }}>
        <div className="bh-body">
          <span className="bh-kicker">The Zenve Advantage</span>
          <h1>
            More than a network.
            <br />
            A place to become.
          </h1>
          <p>
            Bring your expertise. Find your people.
            <br />
            Create what comes next for animal health.
          </p>
          <button className="bh-button" onClick={onOpen}>
            Create your free page
            <ArrowUpRight size={15} />
          </button>
        </div>
      </section>
    </div>
  );
}

function BenefitCard({ icon, title, text }) {
  return (
    <div className="benefit-card pt-6 border-t border-teal-200/60 bg-white/70 p-7 rounded-2xl shadow-sm border border-stone-100 transition-all duration-300">
      <div className="text-teal-600 mb-3 text-2xl">{icon}</div>
      <h3 className="text-lg font-semibold text-stone-900 mb-2">{title}</h3>
      <p className="text-sm text-stone-600 leading-relaxed">{text}</p>
    </div>
  );
}

function BenefitsSection({ onOpen }) {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-amber-50/40 text-stone-900">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-xs font-semibold uppercase tracking-widest gold-accent-text mb-3">
            Your membership, reimagined
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-stone-900 mb-4">
            Space for your work. Support for your ambition.
          </h2>
          <div className="inline-block text-xs font-medium bg-teal-100 text-teal-900 px-3.5 py-1.5 rounded-full border border-teal-200">
            ₹0 membership · No login required
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10">
          {BENEFITS.map((benefit) => (
            <BenefitCard key={benefit.title} {...benefit} />
          ))}
        </div>

        <div className="mt-24 pt-12 border-t border-stone-200 text-center bg-white p-8 rounded-3xl shadow-sm border border-stone-200/60">
          <h3 className="text-2xl font-bold tracking-tight text-stone-900 mb-6">
            Your work deserves a wider world.
          </h3>
          <button
            onClick={onOpen}
            className="interactive-btn inline-flex items-center justify-center px-8 py-3.5 rounded-xl bg-teal-700 text-white font-medium text-sm transition-all shadow-md cursor-pointer"
          >
            Join the community →
          </button>
        </div>
      </div>
    </section>
  );
}

export default function BenefitsPage({ onCreate }) {
  return (
    <div className="benefitsPage bg-stone-50 text-stone-900 font-sans antialiased relative selection:bg-teal-500 selection:text-white">
      <HeroSection onOpen={onCreate} />
      <BenefitsSection onOpen={onCreate} />
    </div>
  );
}