import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";

const values = [
  {
    icon: "🔒",
    title: "Privacy First",
    color: "indigo",
    desc: "We built consent into the core of our system — not as an afterthought. Location access requires your explicit permission, every single time.",
  },
  {
    icon: "⚡",
    title: "Real-Time Precision",
    color: "purple",
    desc: "Powered by WebSocket technology, location updates appear on the map in milliseconds — not minutes. No polling. No delays.",
  },
  {
    icon: "🌍",
    title: "Accessible to All",
    color: "cyan",
    desc: "No app download. No complicated setup. Just a link and a browser. Anyone can share their location in seconds from any smartphone.",
  },
  {
    icon: "🛡️",
    title: "Transparency",
    color: "emerald",
    desc: "We are clear about what data we collect, how we use it, and how long we keep it. No hidden tracking. No secret profiling.",
  },
];

const techStack = [
  { name: "React 18", desc: "Fast, component-driven frontend UI" },
  { name: "Node.js + Express", desc: "Scalable REST API backend" },
  { name: "Socket.IO", desc: "Sub-second real-time communication" },
  { name: "MySQL + Sequelize", desc: "Reliable relational database" },
  { name: "Leaflet.js", desc: "Interactive, open-source maps" },
  { name: "JWT Auth", desc: "Stateless, secure session management" },
];

const colorMap = {
  indigo: "bg-indigo-500/10 border-indigo-500/30 text-indigo-400",
  purple: "bg-purple-500/10 border-purple-500/30 text-purple-400",
  cyan: "bg-cyan-500/10 border-cyan-500/30 text-cyan-400",
  emerald: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
};

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

      <div className="min-h-screen py-16 px-4">
        <div className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] rounded-full bg-indigo-700/10 blur-3xl" />
        <div className="pointer-events-none fixed bottom-0 right-0 w-96 h-96 rounded-full bg-purple-700/8 blur-3xl" />

        <div className="relative z-10 max-w-4xl mx-auto">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-10">
            <ol className="flex items-center gap-2 text-xs text-slate-500">
              <li><Link to="/" className="hover:text-indigo-400 transition-colors">Home</Link></li>
              <li className="text-slate-700">/</li>
              <li className="text-slate-400">About</li>
            </ol>
          </nav>

          {/* Header */}
          <div className="mb-16 text-center">
            <span className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/30 rounded-full px-4 py-1.5 text-xs text-indigo-400 uppercase tracking-widest mb-5">
              Our Story
            </span>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-5 leading-tight">
              About NexTrack —{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400">
                Built for Trust, Designed for Safety
              </span>
            </h1>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed">
              NexTrack was created with a simple belief: knowing where your loved ones are should be
              safe, easy, and respectful of everyone's privacy. No app downloads. No silent
              tracking. Just a link and explicit consent.
            </p>
          </div>

          {/* Mission card */}
          <div className="relative mb-12">
            <div className="absolute -inset-px rounded-3xl bg-gradient-to-r from-indigo-500/50 via-purple-500/50 to-cyan-500/50 blur-sm opacity-30" />
            <div className="relative bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-10">
              <h2 className="text-2xl font-bold text-white mb-4">Our Mission</h2>
              <p className="text-slate-400 leading-relaxed mb-4">
                We built NexTrack to solve a real problem: parents wanting to know their child
                arrived safely, friends trying to find each other at a crowded festival, families
                coordinating during emergencies, field teams needing live driver visibility without
                a dedicated fleet app.
              </p>
              <p className="text-slate-400 leading-relaxed mb-4">
                Every existing solution either required a dedicated app, demanded account creation
                on both ends, or silently harvested data in the background. We said — there has to
                be a better way.
              </p>
              <p className="text-slate-400 leading-relaxed">
                So we built NexTrack: a single link replaces an entire app. The recipient sees
                exactly what they're sharing, decides whether to share it, and can stop at any
                moment by closing their browser tab.{" "}
                <strong className="text-white">
                  No background tracking. No data harvesting. No surprises.
                </strong>
              </p>
            </div>
          </div>

          {/* Values grid */}
          <h2 className="text-2xl font-bold text-white text-center mb-8">What We Stand For</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-12">
            {values.map((v) => (
              <div
                key={v.title}
                className="group bg-slate-900/70 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
              >
                <div className={`w-12 h-12 rounded-xl border flex items-center justify-center text-2xl mb-4 ${colorMap[v.color]}`}>
                  {v.icon}
                </div>
                <h3 className="text-white font-semibold text-base mb-2">{v.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>

          {/* Who Uses NexTrack */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 mb-12">
            <h2 className="text-xl font-bold text-white mb-6 text-center">Who Uses NexTrack?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
              {[
                { icon: "👨‍👩‍👧‍👦", title: "Families", desc: "Parents tracking kids' commutes, checking arrivals, coordinating pickups — without phone tag." },
                { icon: "🎉", title: "Friends & Groups", desc: "Meet-ups, festivals, road trips — everyone on one live map, no confusion about 'where are you?'" },
                { icon: "🚚", title: "Field & Delivery Teams", desc: "Lightweight location sharing for drivers, field agents, or couriers — no fleet software required." },
              ].map((u) => (
                <div key={u.title}>
                  <div className="text-3xl mb-3">{u.icon}</div>
                  <h3 className="text-white font-semibold text-sm mb-2">{u.title}</h3>
                  <p className="text-slate-500 text-xs leading-relaxed">{u.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Tech Stack */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 mb-12">
            <h2 className="text-xl font-bold text-white mb-6 text-center">Built With Modern Technology</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {techStack.map((t) => (
                <div key={t.name} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center hover:border-indigo-500/40 transition-colors duration-300">
                  <p className="text-white font-medium text-sm">{t.name}</p>
                  <p className="text-slate-500 text-xs mt-0.5">{t.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <p className="text-slate-400 mb-6">
              Ready to experience safe, consent-based location sharing?
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register" className="nextrack-btn-primary text-base px-10 py-3.5">
                Get Started Free
              </Link>
              <Link to="/pricing" className="nextrack-btn-ghost text-base px-8 py-3.5">
                View Pricing
              </Link>
              <Link to="/contact" className="nextrack-btn-ghost text-base px-8 py-3.5">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default About;
