import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useAuth } from "../../context/AuthContext";
import AmbientBackground from "../../components/common/AmbientBackground";
import HeroProductVisual from "../../components/home/HeroProductVisual";
import MorphingHeadline from "../../components/home/MorphingHeadline";

const comparisonRows = [
  {
    feature: "App Installation",
    traditional: "Mandatory on both devices via App Store / Play Store",
    nextrack: "Zero app downloads — runs instantly in Safari, Chrome & Firefox",
  },
  {
    feature: "Setup Friction",
    traditional: "5–10 min: account signups, phone verification, syncing contacts",
    nextrack: "5 seconds: generate link, paste into WhatsApp or SMS",
  },
  {
    feature: "Battery Drain",
    traditional: "24/7 background GPS polling drains phone batteries continuously",
    nextrack: "Zero background drain — active strictly while browser tab is open",
  },
  {
    feature: "Device Compatibility",
    traditional: "Siloed ecosystems (Apple Find My excludes Android contacts)",
    nextrack: "100% universal: iPhone tracks Android, Android tracks iPhone",
  },
  {
    feature: "Privacy & Session Lifespan",
    traditional: "Continuous background tracking without clear automatic expiration",
    nextrack: "Encrypted links auto-expire in 24 hours or on 1-click revoke",
  },
];

const realWorldSolutions = [
  {
    icon: "👨‍👩‍👧",
    title: "Family & Loved Ones",
    badge: "Arrival Peace of Mind",
    desc: "Verify kids or elderly parents reach destinations safely without distracting phone calls. Real-time updates with zero apps for them to install or configure.",
    features: ["Sub-meter GPS accuracy", "Battery level indicator", "Instant link revoke"],
  },
  {
    icon: "🧭",
    title: "Meetups, Travel & Commutes",
    badge: "Events & Solo Safety",
    desc: "Find friends at crowded festivals, transit hubs, or unfamiliar cities. Share your route with trusted contacts during late-night rides with automated expiration.",
    features: ["Interactive vector map", "Reverse geocoded address", "Auto-expires in 24 hours"],
  },
  {
    icon: "🚚",
    title: "Field Teams & Deliveries",
    badge: "Zero-Software Dispatch",
    desc: "Coordinate delivery drivers, couriers, or field staff on duty without deploying bulky enterprise software. Opens in Safari, Chrome, and Firefox instantly.",
    features: ["Bank-grade 256-bit TLS", "Live speed & direction", "Universal OS compatibility"],
  },
];

const stats = [
  { value: "< 1s", label: "Update Latency", desc: "Real-time WebSocket stream" },
  { value: "100%", label: "Consent-Based", desc: "Browser permission required" },
  { value: "0", label: "Apps Required", desc: "Runs in any mobile browser" },
  { value: "256-bit", label: "Encryption", desc: "Bank-grade data transit" },
];

const faqs = [
  {
    q: "Does the recipient need to download an app?",
    a: "No. The recipient opens your link in any smartphone browser (Chrome, Safari, Firefox). No app download or account creation is required — they simply tap 'Allow Location' to start sharing.",
  },
  {
    q: "Can someone track me without my consent?",
    a: "Never. Every tracking session requires explicit browser-level hardware permission. If you click 'Block' or close the browser tab, location data transmission halts immediately. NexTrack cannot override browser security.",
  },
  {
    q: "How long does a tracking link remain active?",
    a: "Tracking links auto-expire after 24 hours. You can also manually delete or revoke any link at any moment directly from your command dashboard to stop tracking instantly.",
  },
  {
    q: "Is location history permanently stored on your servers?",
    a: "No. Live coordinates stream in real time via encrypted WebSockets and are never written to permanent database storage. Once you close the session, the temporary data ceases to exist.",
  },
];

const schemaWebApp = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "NexTrack",
  url: "https://locationtracker.app",
  description:
    "Real-time consent-based GPS location sharing via secure links. No app download required.",
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "Any",
  offers: {
    "@type": "Offer",
    price: "10",
    priceCurrency: "INR",
  },
};

const schemaFAQ = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <>
      <Helmet>
        <title>NexTrack — Real-Time GPS Location Sharing, No App Needed</title>
        <meta
          name="description"
          content="Create a secure tracking link in seconds. Share it via WhatsApp or SMS — watch your contact's live GPS location on an interactive map instantly. 100% consent-based. No app required."
        />
        <link rel="canonical" href="https://locationtracker.app/" />
        <meta property="og:title" content="NexTrack — Real-Time GPS Location Sharing, No App Needed" />
        <meta property="og:description" content="Share a link. Watch live GPS location on your map in real time. Consent-based, encrypted, zero app download." />
        <meta property="og:url" content="https://locationtracker.app/" />
        <meta property="og:type" content="website" />
        <script type="application/ld+json">{JSON.stringify(schemaWebApp)}</script>
        <script type="application/ld+json">{JSON.stringify(schemaFAQ)}</script>
      </Helmet>

      <div className="relative min-h-screen overflow-x-hidden">
        <AmbientBackground />

        {/* ── HERO SECTION (OPTIMIZED FOR 5-SECOND CLARITY) ── */}
        <section className="relative px-4 pt-12 pb-16 sm:pt-20 sm:pb-24 text-center max-w-5xl mx-auto">
          
          {/* Eyebrow badge (Authoritative product context) */}
          <div className="inline-flex items-center gap-2 eyebrow-pill mb-6">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>100% Consent-Based · Zero App Install Needed</span>
          </div>

          {/* Main Headline (DYNAMIC 3D WORD MORPH + SHIMMER — PRIMARY FOCAL POINT) */}
          <MorphingHeadline />

          {/* Subheading (ANSWERS WHAT, WHO & WHY IN 2 CONCISE SENTENCES) */}
          <p className="subheading-lead max-w-2xl mx-auto mb-8 text-center text-slate-300">
            Generate an encrypted tracking link in seconds and send it via WhatsApp or SMS.
            When your family member, meetup friend, or field worker taps <span className="text-white font-medium">"Allow Location"</span>,
            their real-time GPS coordinates stream directly to your private radar map.
          </p>

          {/* CTA Action Hierarchy (UNMISTAKABLE PRIMARY ACTION) */}
          <div className="flex flex-col sm:flex-row gap-3.5 justify-center items-center mb-5">
            {isAuthenticated ? (
              <Link to="/dashboard" className="btn-cta-primary text-base px-8 py-3.5 w-full sm:w-auto font-semibold shadow-lg shadow-indigo-500/25">
                Open Command Dashboard →
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn-cta-primary text-base px-8 py-3.5 w-full sm:w-auto font-semibold shadow-lg shadow-indigo-500/25">
                  Start Tracking Free →
                </Link>
                <a href="#how-it-works" className="btn-cta-secondary text-base px-7 py-3.5 w-full sm:w-auto font-medium">
                  See How It Works
                </a>
              </>
            )}
          </div>

          {/* Immediate Reassurance Trust Proofs */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-slate-400 mb-8 sm:mb-12">
            <span className="flex items-center gap-1.5"><span className="text-emerald-400 font-bold">✓</span> No credit card required</span>
            <span className="flex items-center gap-1.5"><span className="text-emerald-400 font-bold">✓</span> Recipient downloads zero apps</span>
            <span className="flex items-center gap-1.5"><span className="text-emerald-400 font-bold">✓</span> 100% consent-based &amp; auto-expires in 24h</span>
          </div>

          {/* ── THE HERO PRODUCT VISUAL (DUAL PERSPECTIVE PROOF) ── */}
          <HeroProductVisual />

          {/* Statistics Strip (SECONDARY PERFORMANCE & RELIABILITY PROOFS - BORDERLESS METRIC STRIP) */}
          <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto pt-8 border-t border-white/[0.08]">
            {stats.map((s) => (
              <div
                key={s.label}
                className="text-center sm:text-left px-2"
              >
                <div className="text-3xl font-extrabold text-white tracking-tight mb-1">
                  {s.value}
                </div>
                <div className="text-xs font-semibold text-indigo-300 uppercase tracking-wider mb-0.5">
                  {s.label}
                </div>
                <div className="text-xs text-slate-400">
                  {s.desc}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── WHY NEXTRACK VS TRADITIONAL APPS (DECISIVE VALUE DIFFERENTIATOR) ── */}
        <section className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20" aria-label="Comparison">
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
            <h2 className="section-title mb-4">
              Why NexTrack Beats Traditional Tracking Apps
            </h2>
            <p className="body-primary text-slate-400">
              Traditional apps require invasive background software and permanent accounts. NexTrack gives you on-demand clarity in seconds.
            </p>
          </div>

          <div className="surface-card rounded-2xl overflow-hidden border border-white/[0.1] shadow-2xl">
            {/* Table Header */}
            <div className="grid grid-cols-1 md:grid-cols-12 bg-white/[0.03] border-b border-white/[0.08] p-4 sm:p-5 text-xs font-bold uppercase tracking-wider">
              <div className="md:col-span-4 text-slate-400">Core Factor</div>
              <div className="md:col-span-4 text-rose-400/90 hidden md:block">Traditional Apps (Life360, Find My)</div>
              <div className="md:col-span-4 text-emerald-400 hidden md:block">NexTrack (Link-Based Web GPS)</div>
            </div>

            {/* Comparison Rows */}
            <div className="divide-y divide-white/[0.06] text-sm">
              {comparisonRows.map((row, idx) => (
                <div key={idx} className="grid grid-cols-1 md:grid-cols-12 p-4 sm:p-5 gap-3 md:gap-4 items-center hover:bg-white/[0.015] transition-colors">
                  <div className="md:col-span-4 font-semibold text-white">
                    {row.feature}
                  </div>
                  <div className="md:col-span-4 text-xs text-slate-400 flex items-start gap-2">
                    <span className="text-rose-400 shrink-0 font-bold">✕</span>
                    <span>{row.traditional}</span>
                  </div>
                  <div className="md:col-span-4 text-xs text-slate-200 flex items-start gap-2 bg-emerald-500/[0.04] p-2.5 rounded-xl border border-emerald-500/15">
                    <span className="text-emerald-400 shrink-0 font-bold">✓</span>
                    <span className="font-medium text-emerald-200">{row.nextrack}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── REAL-WORLD APPLICATIONS & CAPABILITIES (MERGED & STREAMLINED) ── */}
        <section className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20" aria-label="Use cases and capabilities">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-14">
            <h2 className="section-title mb-4">
              Built for Real-World Scenarios
            </h2>
            <p className="body-primary text-slate-400">
              High-performance geolocation telemetry packaged for frictionless everyday coordination.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {realWorldSolutions.map((item) => (
              <div
                key={item.title}
                className="surface-card p-6 sm:p-8 flex flex-col justify-between hover:border-indigo-500/30 transition-all duration-200"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-2xl p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] inline-flex items-center justify-center">
                      {item.icon}
                    </span>
                    <span className="text-[11px] font-semibold text-indigo-300 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">
                      {item.badge}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-2.5">
                    {item.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
                    {item.desc}
                  </p>
                </div>

                <ul className="pt-4 border-t border-white/[0.06] space-y-2 text-xs text-slate-400">
                  {item.features.map((feat, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="text-emerald-400 font-bold text-[11px]">✓</span>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* ── FREQUENTLY ASKED QUESTIONS ── */}
        <section className="relative max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-20" aria-label="FAQ">
          <div className="text-center mb-10 sm:mb-12">
            <h2 className="section-title mb-3">
              Frequently Asked Questions
            </h2>
            <p className="body-secondary text-slate-400">
              Straightforward answers about our privacy architecture and technology.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((f, i) => (
              <details
                key={i}
                className="surface-card group rounded-xl border border-white/[0.08] overflow-hidden transition-all duration-200"
              >
                <summary className="flex items-center justify-between px-6 py-4.5 cursor-pointer text-white font-medium text-sm sm:text-base list-none select-none hover:text-indigo-300 transition-colors">
                  <span>{f.q}</span>
                  <span className="ml-4 text-slate-400 group-open:rotate-45 transition-transform duration-200 text-xl font-light shrink-0" aria-hidden="true">
                    +
                  </span>
                </summary>
                <div className="px-6 pb-5 pt-1 text-slate-400 text-sm leading-relaxed border-t border-white/[0.04]">
                  {f.a}
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* ── CONVERSION CTA BANNER (DECISIVE PRIMARY ACTION) ── */}
        <section className="relative max-w-4xl mx-auto px-4 pb-20 sm:pb-28" aria-label="Call to action">
          <div className="surface-elevated p-8 sm:p-12 text-center rounded-3xl border-indigo-500/40 relative overflow-hidden">
            <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="section-title text-white font-bold mb-4">
                Ready to Experience Frictionless Live Tracking?
              </h2>

              <p className="subheading-lead text-slate-300 mb-8 max-w-lg mx-auto">
                No monthly subscriptions required. Recharge tracking slots only when you need them.
              </p>

              {/* Decisive CTA action */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                {isAuthenticated ? (
                  <Link to="/dashboard" className="btn-cta-primary text-base px-10 py-4 w-full sm:w-auto">
                    Go to Your Dashboard →
                  </Link>
                ) : (
                  <>
                    <Link to="/register" className="btn-cta-primary text-base px-10 py-4 w-full sm:w-auto">
                      Start Tracking Free
                    </Link>
                    <Link to="/pricing" className="btn-cta-secondary text-base px-8 py-4 w-full sm:w-auto">
                      Explore Pricing Plans
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

      </div>
    </>
  );
};

export default Home;
