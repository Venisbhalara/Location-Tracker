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
  { name: "React 18", role: "Frontend UI", desc: "Component architecture with sub-second reactive state updates" },
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
          <ol className="flex items-center gap-2 text-xs text-slate-400">
            <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
            <li className="text-slate-600">/</li>
            <li className="text-indigo-300 font-medium">About</li>
          </ol>
        </nav>

        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="eyebrow-pill mb-4">Our Mission &amp; Purpose</span>
          <h1 className="display-title mb-6">
            Location Sharing Grounded in{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-purple-300 to-indigo-300">
              Consent &amp; Simplicity
            </span>
          </h1>
          <p className="subheading-lead text-slate-300 leading-relaxed">
            We built NexTrack because staying connected with family, friends, or team members shouldn’t require invasive app surveillance or complex configurations.
          </p>
        </div>

        {/* Mission Statement Box */}
        <div className="surface-elevated p-8 sm:p-10 rounded-3xl mb-16 border-indigo-500/30">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">
            The Problem with Traditional Tracking Apps
          </h2>
          <div className="space-y-4 text-slate-300 text-sm sm:text-base leading-relaxed">
            <p>
              Most existing tracking solutions operate by having both parties install native apps, granting broad background permissions, and storing permanent movement logs on cloud servers. This approach creates security vulnerabilities and feels invasive.
            </p>
            <p>
              NexTrack operates on a completely different model: <strong className="text-white">temporary, browser-native sessions with explicit recipient permission</strong>. When a session ends, the connection closes and no permanent location records remain.
            </p>
          </div>
        </div>

        {/* Core Principles */}
        <div className="mb-20">
          <div className="text-center mb-10">
            <h2 className="section-title">What We Stand For</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {values.map((v) => (
              <div
                key={v.title}
                className="surface-card p-7 hover:border-indigo-500/30 transition-all duration-200"
              >
                <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-2xl mb-4">
                  {v.icon}
                </div>
                <h3 className="card-title font-bold text-white mb-2">{v.title}</h3>
                <p className="body-secondary text-slate-400 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Technical Architecture */}
        <div className="mb-20">
          <div className="text-center mb-10">
            <h2 className="section-title">Technology Architecture</h2>
            <p className="body-secondary text-slate-400 mt-2">
              Engineered with modern, reliable web technologies for ultra-low latency.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {techStack.map((t) => (
              <div key={t.name} className="surface-card p-6 border-white/[0.07]">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-base font-bold text-white">{t.name}</h3>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    {t.role}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="surface-card p-10 text-center rounded-3xl border-white/10">
          <h2 className="text-2xl font-bold text-white mb-3">
            Ready to experience safe, consent-based tracking?
          </h2>
          <p className="text-sm text-slate-400 mb-6 max-w-md mx-auto">
            Get started in under 30 seconds with no app download required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="btn-cta-primary px-8 py-3.5 text-sm font-semibold">
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
