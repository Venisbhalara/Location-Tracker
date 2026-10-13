import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useAuth } from "../../context/AuthContext";
import HeroProductVisual from "../../components/home/HeroProductVisual";
import MorphingHeadline from "../../components/home/MorphingHeadline";
import {
  OpticalReveal,
  OpticalStaggerContainer,
  OpticalStaggerItem,
} from "../../components/common/OpticalReveal";

const comparisonRows = [
  {
    feature: "App Installation",
    traditional: "Mandatory on both devices via App Store / Play Store",
    nextrack: "Zero app downloads — runs instantly in Safari, Chrome & Firefox",
  },
  {
    feature: "Setup Friction",
    traditional:
      "5–10 min: account signups, phone verification, syncing contacts",
    nextrack: "5 seconds: generate link, paste into WhatsApp or SMS",
  },
  {
    feature: "Battery Drain",
    traditional:
      "24/7 background GPS polling drains phone batteries continuously",
    nextrack:
      "Zero background drain — active strictly while browser tab is open",
  },
  {
    feature: "Device Compatibility",
    traditional: "Siloed ecosystems (Apple Find My excludes Android contacts)",
    nextrack: "100% universal: iPhone tracks Android, Android tracks iPhone",
  },
  {
    feature: "Privacy & Session Lifespan",
    traditional:
      "Continuous background tracking without clear automatic expiration",
    nextrack: "Encrypted links auto-expire in 24 hours or on 1-click revoke",
  },
];

const realWorldSolutions = [
  {
    icon: "👨‍👩‍👧",
    title: "Family & Loved Ones",
    badge: "Arrival Peace of Mind",
    desc: "Verify kids or elderly parents reach destinations safely without distracting phone calls. Real-time updates with zero apps for them to install or configure.",
    features: [
      "Sub-meter GPS accuracy",
      "Battery level indicator",
      "Instant link revoke",
    ],
  },
  {
    icon: "🧭",
    title: "Meetups, Travel & Commutes",
    badge: "Events & Solo Safety",
    desc: "Find friends at crowded festivals, transit hubs, or unfamiliar cities. Share your route with trusted contacts during late-night rides with automated expiration.",
    features: [
      "Interactive vector map",
      "Reverse geocoded address",
      "Auto-expires in 24 hours",
    ],
  },
  {
    icon: "🚚",
    title: "Field Teams & Deliveries",
    badge: "Zero-Software Dispatch",
    desc: "Coordinate delivery drivers, couriers, or field staff on duty without deploying bulky enterprise software. Opens in Safari, Chrome, and Firefox instantly.",
    features: [
      "Bank-grade 256-bit TLS",
      "Live speed & direction",
      "Universal OS compatibility",
    ],
  },
];

const stats = [
  {
    value: "< 1s",
    label: "Update Latency",
    desc: "Real-time WebSocket stream",
  },
  {
    value: "100%",
    label: "Consent-Based",
    desc: "Browser permission required",
  },
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
        <meta
          property="og:title"
          content="NexTrack — Real-Time GPS Location Sharing, No App Needed"
        />
        <meta
          property="og:description"
          content="Share a link. Watch live GPS location on your map in real time. Consent-based, encrypted, zero app download."
        />
        <meta property="og:url" content="https://locationtracker.app/" />
        <meta property="og:type" content="website" />
        <script type="application/ld+json">
          {JSON.stringify(schemaWebApp)}
        </script>
        <script type="application/ld+json">{JSON.stringify(schemaFAQ)}</script>
      </Helmet>

      <div className="relative min-h-screen overflow-x-hidden">
        {/* ── HERO SECTION ── */}
        <section className="relative px-4 pt-12 pb-14 sm:pt-20 sm:pb-20 text-center max-w-5xl mx-auto">
          {/* Eyebrow badge */}
          <OpticalReveal delay={0.06} distance={12} blur={4}>
            <div className="inline-flex items-center gap-2 eyebrow-pill mb-6">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>100% Consent-Based · Zero App Install Needed</span>
            </div>
          </OpticalReveal>

          {/* Main Headline */}
          <OpticalReveal delay={0.12} distance={16} blur={5}>
            <MorphingHeadline />
          </OpticalReveal>

          {/* Subheading */}
          <OpticalReveal delay={0.18} distance={18} blur={5}>
            <p className="subheading-lead max-w-2xl mx-auto mb-8 text-center text-stone-600">
              Generate an encrypted tracking link in seconds and send it via
              WhatsApp or SMS. When your family member, meetup friend, or field
              worker taps{" "}
              <span className="text-stone-900 font-semibold">
                "Allow Location"
              </span>
              , their real-time GPS coordinates stream directly to your private
              radar map.
            </p>
          </OpticalReveal>

          {/* CTA Action Hierarchy */}
          <OpticalReveal delay={0.24} distance={16} blur={4}>
            <div className="flex flex-col sm:flex-row gap-3.5 justify-center items-center mb-5">
              {isAuthenticated ? (
                <Link
                  to="/dashboard"
                  className="btn-cta-primary text-base px-8 py-3.5 w-full sm:w-auto font-semibold shadow-md"
                >
                  Open Command Dashboard →
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="btn-cta-primary text-base px-8 py-3.5 w-full sm:w-auto font-semibold shadow-md"
                  >
                    Start Tracking Free →
                  </Link>
                  <a
                    href="#how-it-works"
                    className="btn-cta-secondary text-base px-7 py-3.5 w-full sm:w-auto font-semibold"
                  >
                    See How It Works
                  </a>
                </>
              )}
            </div>
          </OpticalReveal>

          {/* Immediate Reassurance Trust Proofs */}
          <OpticalReveal delay={0.28} distance={12} blur={4}>
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-stone-500 mb-8 sm:mb-12">
              <span className="flex items-center gap-1.5">
                <span className="text-emerald-600 font-bold">✓</span> No credit
                card required
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-emerald-600 font-bold">✓</span> Recipient
                downloads zero apps
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-emerald-600 font-bold">✓</span> 100%
                consent-based &amp; auto-expires in 24h
              </span>
            </div>
          </OpticalReveal>

          {/* ── THE HERO PRODUCT VISUAL ── */}
          <OpticalReveal delay={0.32} distance={22} blur={6} duration={0.75}>
            <HeroProductVisual />
          </OpticalReveal>

          {/* Statistics Strip */}
          <OpticalStaggerContainer
            delay={0.1}
            stagger={0.08}
            className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto pt-8 border-t border-stone-200/80"
          >
            {stats.map((s) => (
              <OpticalStaggerItem
                key={s.label}
                distance={14}
                blur={4}
                className="text-center sm:text-left px-2"
              >
                <div className="text-3xl font-extrabold text-stone-900 tracking-tight mb-0.5">
                  {s.value}
                </div>
                <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-0.5">
                  {s.label}
                </div>
                <div className="text-xs text-stone-600">{s.desc}</div>
              </OpticalStaggerItem>
            ))}
          </OpticalStaggerContainer>
        </section>

        {/* ── WHY NEXTRACK VS TRADITIONAL APPS ── */}
        <section
          id="how-it-works"
          className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-18"
          aria-label="Comparison"
        >
          <OpticalReveal distance={20} blur={6}>
            <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
              <h2 className="section-title mb-3">
                Why NexTrack Beats Traditional Tracking Apps
              </h2>
              <p className="body-primary text-stone-600">
                Traditional apps require invasive background software and
                permanent accounts. NexTrack gives you on-demand clarity in
                seconds.
              </p>
            </div>
          </OpticalReveal>

          <OpticalReveal delay={0.08} distance={22} blur={6}>
            <div className="surface-card rounded-2xl overflow-hidden border border-stone-200/90 shadow-sm">
              {/* Table Header */}
              <div className="grid grid-cols-1 md:grid-cols-12 bg-stone-50 border-b border-stone-200 p-4 sm:p-5 text-xs font-bold uppercase tracking-wider">
                <div className="md:col-span-4 text-stone-700">Core Factor</div>
                <div className="md:col-span-4 text-stone-500 hidden md:block">
                  Traditional Apps (Life360, Find My)
                </div>
                <div className="md:col-span-4 text-emerald-700 hidden md:block">
                  NexTrack (Link-Based Web GPS)
                </div>
              </div>

              {/* Comparison Rows with cascading focus */}
              <OpticalStaggerContainer
                stagger={0.06}
                className="divide-y divide-stone-100 text-sm"
              >
                {comparisonRows.map((row, idx) => (
                  <OpticalStaggerItem
                    key={idx}
                    distance={12}
                    blur={4}
                    className="grid grid-cols-1 md:grid-cols-12 p-4 sm:p-5 gap-3 md:gap-4 items-center hover:bg-stone-50/50 transition-colors"
                  >
                    <div className="md:col-span-4 font-semibold text-stone-900">
                      {row.feature}
                    </div>
                    <div className="md:col-span-4 text-xs text-stone-500 flex items-start gap-2">
                      <span className="text-rose-500 shrink-0 font-bold">✕</span>
                      <span>{row.traditional}</span>
                    </div>
                    <div className="md:col-span-4 text-xs text-stone-800 flex items-start gap-2 bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-200/80">
                      <span className="text-emerald-600 shrink-0 font-bold">
                        ✓
                      </span>
                      <span className="font-medium text-emerald-950">
                        {row.nextrack}
                      </span>
                    </div>
                  </OpticalStaggerItem>
                ))}
              </OpticalStaggerContainer>
            </div>
          </OpticalReveal>
        </section>

        {/* ── REAL-WORLD APPLICATIONS & CAPABILITIES ── */}
        <section
          className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-18"
          aria-label="Use cases and capabilities"
        >
          <OpticalReveal distance={20} blur={6}>
            <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
              <h2 className="section-title mb-3">
                Built for Real-World Scenarios
              </h2>
              <p className="body-primary text-stone-600">
                High-performance geolocation telemetry packaged for frictionless
                everyday coordination.
              </p>
            </div>
          </OpticalReveal>

          <OpticalStaggerContainer
            stagger={0.12}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8"
          >
            {realWorldSolutions.map((item) => (
              <OpticalStaggerItem
                key={item.title}
                distance={22}
                blur={6}
                className="h-full"
              >
                <div className="surface-card p-6 sm:p-8 flex flex-col justify-between h-full hover:border-stone-300 transition-all duration-200">
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <span className="text-2xl p-2.5 rounded-xl bg-stone-50 border border-stone-200 inline-flex items-center justify-center">
                        {item.icon}
                      </span>
                      <span className="text-[11px] font-semibold text-stone-700 bg-stone-100 px-2.5 py-1 rounded-full border border-stone-200">
                        {item.badge}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-stone-900 mb-2">
                      {item.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-stone-600 leading-relaxed mb-6">
                      {item.desc}
                    </p>
                  </div>

                  <ul className="pt-4 border-t border-stone-100 space-y-2 text-xs text-stone-600">
                    {item.features.map((feat, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <span className="text-emerald-600 font-bold text-[11px]">
                          ✓
                        </span>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </OpticalStaggerItem>
            ))}
          </OpticalStaggerContainer>
        </section>

        {/* ── FREQUENTLY ASKED QUESTIONS ── */}
        <section
          className="relative max-w-3xl mx-auto px-4 sm:px-6 py-14 sm:py-18"
          aria-label="FAQ"
        >
          <OpticalReveal distance={20} blur={6}>
            <div className="text-center mb-10">
              <h2 className="section-title mb-2.5">Frequently Asked Questions</h2>
              <p className="body-secondary text-stone-600">
                Straightforward answers about our privacy architecture and
                technology.
              </p>
            </div>
          </OpticalReveal>

          <OpticalStaggerContainer stagger={0.07} className="space-y-3">
            {faqs.map((f, i) => (
              <OpticalStaggerItem key={i} distance={14} blur={4}>
                <details className="surface-card group rounded-xl border border-stone-200/90 overflow-hidden transition-all duration-150">
                  <summary className="flex items-center justify-between px-6 py-4.5 cursor-pointer text-stone-900 font-semibold text-sm sm:text-base list-none select-none hover:text-indigo-700 transition-colors">
                    <span>{f.q}</span>
                    <span
                      className="ml-4 text-stone-400 group-open:rotate-45 transition-transform duration-200 text-xl font-light shrink-0"
                      aria-hidden="true"
                    >
                      +
                    </span>
                  </summary>
                  <div className="px-6 pb-5 pt-1 text-stone-600 text-sm leading-relaxed border-t border-stone-100">
                    {f.a}
                  </div>
                </details>
              </OpticalStaggerItem>
            ))}
          </OpticalStaggerContainer>
        </section>

        {/* ── CONVERSION CTA BANNER ── */}
        <section
          className="relative max-w-4xl mx-auto px-4 pb-18 sm:pb-24"
          aria-label="Call to action"
        >
          <OpticalReveal distance={22} blur={7} duration={0.7}>
            <div className="surface-elevated p-8 sm:p-12 text-center rounded-3xl border-stone-200/90 relative overflow-hidden bg-white">
              <div className="relative z-10 max-w-2xl mx-auto">
                <h2 className="section-title text-stone-900 font-bold mb-3">
                  Ready to Experience Frictionless Live Tracking?
                </h2>

                <p className="subheading-lead text-stone-600 mb-8 max-w-lg mx-auto">
                  No monthly subscriptions required. Recharge tracking slots only
                  when you need them.
                </p>

                <div className="flex flex-col sm:flex-row gap-3.5 justify-center items-center">
                  {isAuthenticated ? (
                    <Link
                      to="/dashboard"
                      className="btn-cta-primary text-base px-10 py-3.5 w-full sm:w-auto font-semibold"
                    >
                      Go to Your Dashboard →
                    </Link>
                  ) : (
                    <>
                      <Link
                        to="/register"
                        className="btn-cta-primary text-base px-10 py-3.5 w-full sm:w-auto font-semibold"
                      >
                        Start Tracking Free
                      </Link>
                      <Link
                        to="/pricing"
                        className="btn-cta-secondary text-base px-8 py-3.5 w-full sm:w-auto font-semibold"
                      >
                        Explore Pricing Plans
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          </OpticalReveal>
        </section>
      </div>
    </>
  );
};

export default Home;
