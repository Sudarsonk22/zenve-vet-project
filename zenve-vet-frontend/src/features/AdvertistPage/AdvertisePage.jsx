import "./style3.css";

const FEATURES = [
  {
    icon: "👥",
    title: "Doctors & clinics",
    text: "Small-animal, livestock, equine and research professionals across India.",
  },
  {
    icon: "🛡️",
    title: "Reviewed before going live",
    text: "Every campaign is checked by the Zenve Vet team, keeping the feed trustworthy.",
  },
  {
    icon: "📊",
    title: "Transparent reports",
    text: "Views, clicks and click-through rate by day and by campaign.",
  },
];

const INPUT_CLASSES =
  "w-full px-3.5 py-2.5 text-sm rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-700 bg-stone-50/50 text-stone-900 placeholder:text-stone-400";

const LABEL_CLASSES =
  "block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5";

function FeatureCard({ icon, title, text }) {
  return (
    <div className="card bg-emerald-950/40 border border-emerald-800/50 p-5 rounded-2xl backdrop-blur-sm transition-all duration-300">
      <div className="text-[#f0d5b7] mb-2 text-xl">{icon}</div>
      <h3 className="text-sm font-bold mb-1 text-[#fffcf7]">{title}</h3>
      <p className="text-xs text-stone-300 leading-relaxed">{text}</p>
    </div>
  );
}

function Banner() {
  return (
    <section className="banner rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden transition-all duration-300">
      <div className="overlay"></div>

      <div className="relative z-10 max-w-5xl">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#f0d5b7] mb-3">
          Advertise on Zenve Vet
        </p>

        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight mb-4 leading-snug text-[#fffcf7]">
          Reach India’s veterinary professionals where they share
          <br className="hidden sm:inline" /> their work.
        </h1>

        <p className="text-xs sm:text-sm text-stone-200 mb-8 max-w-3xl leading-relaxed">
          Your poster appears as a sponsored post inside the doctors’ feed —
          clearly labelled, reviewed by our team, measured with daily views and
          clicks.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          {FEATURES.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>

        <div className="text-center pt-4 border-t border-emerald-800/60">
          <p className="text-xs sm:text-sm text-stone-200">
            Pricing on request — write to{" "}
            <a
              href="mailto:zenvefashions@gmail.com"
              className="text-[#f0d5b7] underline hover:text-white transition-colors"
            >
              zenvefashions@gmail.com
            </a>
            .
          </p>
        </div>
      </div>
    </section>
  );
}

function CreateAccountBox() {
  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-stone-200 flex flex-col justify-between">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-stone-900 mb-1">
          Create an advertiser account
        </h2>
        <p className="text-xs text-stone-500 mb-6">
          No login needed. Free to set up.
        </p>

        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label className={LABEL_CLASSES}>
              Brand name <span className="text-emerald-700">*</span>
            </label>
            <input
              type="text"
              placeholder="Your brand"
              required
              className={INPUT_CLASSES}
            />
          </div>

          <div>
            <label className={LABEL_CLASSES}>
              Contact email <span className="text-emerald-700">*</span>
            </label>
            <input
              type="email"
              placeholder="you@brand.com"
              required
              className={INPUT_CLASSES}
            />
          </div>

          <div>
            <label className={LABEL_CLASSES}>Website</label>
            <input
              type="text"
              placeholder="brand.com"
              className={INPUT_CLASSES}
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 px-6 rounded-xl font-medium text-sm transition-all shadow-sm cursor-pointer bg-white text-stone-900 border border-stone-200 hover:bg-[#c59b27] hover:text-white hover:border-[#b38822]"
            >
              Start advertising ↗
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AccessKeyBox() {
  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-stone-200 flex flex-col justify-between">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-stone-900 mb-1">
          Already advertising?
        </h2>
        <p className="text-xs text-stone-500 mb-6">
          Access your active dashboard.
        </p>

        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label className={LABEL_CLASSES}>
              Paste your access key <span className="text-emerald-700">*</span>
            </label>
            <input
              type="text"
              placeholder="ZENVE-ADV:…"
              required
              className={`${INPUT_CLASSES} font-mono`}
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 px-6 rounded-xl font-medium text-sm transition-all shadow-sm cursor-pointer bg-white text-stone-900 border border-stone-200 hover:bg-[#c59b27] hover:text-white hover:border-[#b38822]"
            >
              🔍 Open dashboard
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdvertisePage() {
  return (
    <div className="advertisePage bg-stone-50 text-stone-900 font-sans antialiased py-8 px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <Banner />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CreateAccountBox />
          <AccessKeyBox />
        </div>
      </div>
    </div>
  );
}