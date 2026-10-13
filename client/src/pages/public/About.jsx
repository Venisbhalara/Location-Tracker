import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import AmbientBackground from "../../components/common/AmbientBackground";

const values = [
  {
    icon: "🔒",
    title: "Privacy First",
    desc: "We built consent into the foundation of our architecture — not as an afterthought. Location transmission requires explicit hardware-level browser permission every single time.",
  },
  {
    icon: "⚡",
    title: "Sub-Second Precision",
    desc: "Powered by bidirectional WebSocket streams, coordinates update across clients in milliseconds rather than minutes. Zero polling, zero delays.",
  },
  {
    icon: "🌍",
    title: "Accessible to Everyone",
    desc: "No app installations, no accounts for recipients, and no complicated setup. Anyone with a smartphone browser can share their location safely.",
  },
  {
    icon: "🛡️",
    title: "Complete Transparency",
    desc: "We are clear about what telemetry is gathered, how it is routed, and when it is discarded. Coordinates are never written to permanent storage.",
  },
];

const techStack = [
  { name: "React 19", role: "Frontend UI", desc: "Component architecture with sub-second reactive state updates" },
  { name: "Node.js & Express", role: "Backend API", desc: "High-throughput asynchronous REST endpoint routing" },
  { name: "Socket.IO", role: "Telemetry Stream", desc: "Bidirectional WebSocket connection for live GPS transmission" },
  { name: "MySQL & Sequelize", role: "Relational DB", desc: "Encrypted token metadata and session access control" },
  { name: "Leaflet.js", role: "Map Engine", desc: "Vector mapping with custom accuracy circles and path history" },
  { name: "JWT & Bcrypt", role: "Authentication", desc: "Stateless session authentication with cryptographic hashing" },
];

const schemaOrg = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "NexTrack",
  url: "https://locationtracker.app",
  logo: "https://locationtracker.app/location.png",
  description:
    "NexTrack is a privacy-first, real-time GPS location sharing platform. No app download required.",
  contactPoint: {
    "@type": "ContactPoint",
    email: "support@locationtracker.app",
    contactType: "customer support",
  },
};

const breadcrumb = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://locationtracker.app/" },
    { "@type": "ListItem", position: 2, name: "About", item: "https://locationtracker.app/about" },
  ],
};

const About = () => {
  return (
    <>
      <Helmet>
        <title>About NexTrack | Consent-Based Real-Time GPS Location Sharing</title>
        <meta
          name="description"
          content="Learn why we built NexTrack — a privacy-first, real-time location sharing platform where every location access requires explicit consent. No app download, no hidden tracking."
        />
        <link rel="canonical" href="https://locationtracker.app/about" />
        <meta property="og:title" content="About NexTrack | Privacy-First Location Sharing" />
        <meta property="og:description" content="NexTrack was built so families, friends, and teams can share live location safely — with full consent, zero app downloads." />
        <meta property="og:url" content="https://locationtracker.app/about" />
        <script type="application/ld+json">{JSON.stringify(schemaOrg)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumb)}</script>
      </Helmet>

      <div className="relative min-h-screen pt-10 pb-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <AmbientBackground />

        {/* Breadcrumb Hierarchy */}
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex items-center gap-2 text-xs text-stone-500">
            <li><Link to="/" className="hover:text-stone-900 transition-colors">Home</Link></li>
            <li className="text-stone-300">/</li>
            <li className="text-stone-900 font-medium">About</li>
          </ol>
        </nav>

        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="eyebrow-pill mb-4">Our Mission &amp; Architectural Purpose</span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-stone-900 mb-6 font-serif">
            Location Sharing Grounded in{" "}
            <span className="italic font-normal text-stone-600">
              Consent &amp; Simplicity
            </span>
          </h1>
          <p className="text-base sm:text-lg text-stone-600 leading-relaxed max-w-2xl mx-auto">
            We built NexTrack because staying connected with family, friends, or team members shouldn’t require invasive app surveillance, background tracking, or complex configurations.
          </p>
        </div>

        {/* Mission Statement Box */}
        <div className="surface-card p-8 sm:p-10 rounded-3xl mb-16 border border-[#ded7ca] shadow-xs">
          <h2 className="text-xl sm:text-2xl font-bold text-stone-900 mb-4 font-serif">
            The Problem with Traditional Tracking Software
          </h2>
          <div className="space-y-4 text-stone-600 text-sm sm:text-base leading-relaxed">
            <p>
              Most existing tracking solutions operate by having both parties install native apps, granting broad background permissions, and storing permanent movement logs on cloud servers. This approach creates security vulnerabilities and feels invasive.
            </p>
            <p>
              NexTrack operates on a completely different model: <strong className="text-stone-900 font-semibold">temporary, browser-native sessions with explicit recipient permission</strong>. When a session ends, the connection closes and no permanent location records remain.
            </p>
          </div>
        </div>

        {/* Core Principles */}
        <div className="mb-20">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 font-serif">What We Stand For</h2>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">Foundational values that dictate our engineering decisions.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {values.map((v) => (
              <div
                key={v.title}
                className="surface-card p-7 rounded-2xl border border-[#e7e0d3] hover:border-stone-400 hover:shadow-md transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-[#ece6da] border border-[#ded7ca] flex items-center justify-center text-2xl mb-4 shadow-inner">
                  {v.icon}
                </div>
                <h3 className="font-bold text-stone-900 mb-2 font-serif text-lg">{v.title}</h3>
                <p className="text-stone-600 text-sm leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Technical Architecture */}
        <div className="mb-20">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 font-serif">Technology Architecture</h2>
            <p className="text-stone-500 text-xs sm:text-sm mt-1">
              Engineered with modern, reliable web standards for sub-second telemetry delivery.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {techStack.map((t) => (
              <div key={t.name} className="surface-card p-6 rounded-2xl border border-[#e7e0d3] shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-base font-bold text-stone-900">{t.name}</h3>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#ece6da] text-stone-800 border border-[#ded7ca]">
                    {t.role}
                  </span>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="surface-card p-10 text-center rounded-3xl border border-[#ded7ca] shadow-xs">
          <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 mb-3 font-serif">
            Ready to experience safe, consent-based tracking?
          </h2>
          <p className="text-sm text-stone-600 mb-6 max-w-md mx-auto leading-relaxed">
            Get started in under 30 seconds with no app download required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="btn-cta-primary px-8 py-3.5 text-sm font-semibold shadow-xs">
              Start Tracking Free
            </Link>
            <Link to="/pricing" className="btn-cta-secondary px-8 py-3.5 text-sm font-medium">
              View Pricing Plans
            </Link>
          </div>
        </div>

      </div>
    </>
  );
};

export default About;
