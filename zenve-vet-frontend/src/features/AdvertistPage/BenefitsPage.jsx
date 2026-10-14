import { useState } from "react";
import "./style.css";
//import heroBg from "./assets/pro_img.jpg"; // Adjust path to where your image is saved


const BENEFITS = [
  {
    icon: "🐾",
    title: "A page that is entirely you",
    text: "A shareable professional presence with your story, specialty, clinical journal and community contributions.",
  },
  {
    icon: "🐶",
    title: "Peers beyond your postcode",
    text: "Discover doctors across India, make connections and bring new perspectives into your practice.",
  },
  {
    icon: "🐱",
    title: "Knowledge that travels",
    text: "Share de-identified cases, discuss clinical questions and learn through thoughtful conversations.",
  },
  {
    icon: "🩺",
    title: "Your voice, in every format",
    text: "Publish photos, stories and short videos that bring your practice and ideas to life.",
  },
  {
    icon: "💡",
    title: "Ideas with a future",
    text: "Explore innovation scholarship, technology guidance and pilot pathways. Selection and support are subject to program criteria.",
  },
  {
    icon: "🌱",
    title: "Room to grow",
    text: "Discover potential mentorship, research collaboration and professional visibility through the Zenve community. Program opportunities are not guaranteed.",
  },
];

const FORM_FIELDS = [
  { label: "Full name", placeholder: "Dr. Your name", required: true },
  { label: "City & state", placeholder: "Bengaluru, Karnataka", required: true },
  { label: "Specialty", placeholder: "Small Animal Medicine", required: true },
];

const INPUT_CLASSES =
  "w-full px-3.5 py-2.5 text-sm rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-teal-600 text-stone-900 bg-stone-50/50";

const LABEL_CLASSES =
  "block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5";

function HeroSection({ onOpen }) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
      <section className="hero-banner-section rounded-3xl overflow-hidden shadow-xl">
        <div className="hero-overlay"></div>
        <div className="hero-container">
          <div className="max-w-xl text-white">
            <p className="text-xs font-semibold uppercase tracking-widest gold-accent mb-3">
              # The Zenve Advantage
            </p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-4 leading-tight">
              More than a network. <br />
              A place to become.
            </h1>
            <p className="text-sm sm:text-base text-stone-100 mb-6 leading-relaxed">
              Bring your expertise. Find your people. Create what comes next for
              animal health.
            </p>
            <button
              onClick={onOpen}
              className="interactive-btn inline-flex items-center justify-center px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-medium text-sm transition-all shadow-lg cursor-pointer"
            >
              Create your free page ↗
            </button>
          </div>
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
          <div className="text-teal-600 text-lg mb-2">✨</div>
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

function CommunityModal({ onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-sm p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-stone-200 p-6 sm:p-8 text-stone-900">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-stone-400 hover:text-stone-700 transition-colors p-1 cursor-pointer"
          aria-label="Close modal"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <div className="mb-6">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900 mb-1">
            Make your professional mark.
          </h2>
          <p className="text-xs sm:text-sm text-stone-600">
            Your own public veterinary page. Free, with no login required.
          </p>
        </div>

        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          {FORM_FIELDS.map((field) => (
            <div key={field.label}>
              <label className={LABEL_CLASSES}>
                {field.label} <span className="text-teal-600">*</span>
              </label>
              <input
                type="text"
                placeholder={field.placeholder}
                required={field.required}
                className={INPUT_CLASSES}
              />
            </div>
          ))}

          <div>
            <label className={LABEL_CLASSES}>About you</label>
            <textarea
              rows="3"
              placeholder="Your approach to care, interests and professional story"
              className={`${INPUT_CLASSES} resize-none`}
            ></textarea>
          </div>

          <p className="text-[11px] text-stone-500 leading-normal pt-1">
            Your page and posts are public and unverified. Publishing access
            stays in this browser; keep its data to retain access.
          </p>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full flex items-center justify-center py-3 px-4 rounded-xl bg-teal-700 hover:bg-teal-600 text-white font-medium text-sm transition-colors shadow-sm cursor-pointer"
            >
              Create my professional page →
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function BenefitsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <div className="benefitsPage bg-stone-50 text-stone-900 font-sans antialiased relative selection:bg-teal-500 selection:text-white">
      <HeroSection onOpen={openModal} />
      <BenefitsSection onOpen={openModal} />
      {isModalOpen && <CommunityModal onClose={closeModal} />}
    </div>
  );
}