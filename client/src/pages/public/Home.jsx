import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useAuth } from "../../context/AuthContext";

const features = [
  {
    icon: "🔗",
    title: "Secure Tracking Links",
    desc: "Generate encrypted, UUID-secured tracking links that auto-expire — no account needed for recipients.",
    color: "from-indigo-500/20 to-indigo-500/5",
    border: "hover:border-indigo-500/40",
    glow: "hover:shadow-[0_0_40px_rgba(99,102,241,0.12)]",
    iconBg: "bg-indigo-500/15 border-indigo-500/30",
  },
  {
    icon: (
      <img src="/location.png" alt="Live GPS Tracking icon" className="w-8 h-8 object-contain" />
    ),
    title: "Live GPS Tracking",
    desc: "Real-time location updates via WebSocket with near-zero latency and sub-meter precision.",
    color: "from-cyan-500/20 to-cyan-500/5",
    border: "hover:border-cyan-500/40",
    glow: "hover:shadow-[0_0_40px_rgba(34,211,238,0.12)]",
    iconBg: "bg-cyan-500/15 border-cyan-500/30",
  },
  {
    icon: "🗺️",
    title: "Interactive Map",
    desc: "View live position on a full Leaflet map with movement path history and accuracy overlay.",
    color: "from-purple-500/20 to-purple-500/5",
    border: "hover:border-purple-500/40",
    glow: "hover:shadow-[0_0_40px_rgba(168,85,247,0.12)]",
    iconBg: "bg-purple-500/15 border-purple-500/30",
  },
  {
    icon: "🔒",
    title: "Privacy First",
    desc: "Location sharing requires explicit consent — always. You are always in full control.",
    color: "from-emerald-500/20 to-emerald-500/5",
    border: "hover:border-emerald-500/40",
    glow: "hover:shadow-[0_0_40px_rgba(16,185,129,0.12)]",
    iconBg: "bg-emerald-500/15 border-emerald-500/30",
  },
  {
    icon: "⚡",
    title: "Real-Time Updates",
    desc: "Socket.IO powered live sync — no page refresh needed. Updates flow instantly as they happen.",
    color: "from-amber-500/20 to-amber-500/5",
    border: "hover:border-amber-500/40",
    glow: "hover:shadow-[0_0_40px_rgba(245,158,11,0.12)]",
    iconBg: "bg-amber-500/15 border-amber-500/30",
  },
  {
    icon: "📱",
    title: "No App Needed",
    desc: "Recipients simply open a link in any browser — no download, no signup, no friction.",
    color: "from-pink-500/20 to-pink-500/5",
    border: "hover:border-pink-500/40",
    glow: "hover:shadow-[0_0_40px_rgba(236,72,153,0.12)]",
    iconBg: "bg-pink-500/15 border-pink-500/30",
  },
];

const steps = [
  {
    num: "01",
    icon: "🔗",
    title: "Generate a Tracking Link",
    desc: "Log in and create a unique, encrypted tracking link in one click. UUID-secured and set to auto-expire for maximum privacy.",
    accentFrom: "from-indigo-500",
    accentTo: "to-purple-500",
    iconBg: "bg-indigo-500/15 border-indigo-500/30",
    hoverBorder: "hover:border-indigo-500/50",
    hoverShadow: "hover:shadow-[0_0_50px_rgba(99,102,241,0.15)]",
    overlayColor: "from-indigo-600/8",
  },
  {
    num: "02",
    icon: "📨",
    title: "Share with Your Contact",
    desc: "Send the link via WhatsApp, SMS, or email. When they open it and tap 'Allow Location,' sharing begins — instantly and securely.",
    accentFrom: "from-purple-500",
    accentTo: "to-cyan-500",
    iconBg: "bg-purple-500/15 border-purple-500/30",
    hoverBorder: "hover:border-purple-500/50",
    hoverShadow: "hover:shadow-[0_0_50px_rgba(168,85,247,0.15)]",
    overlayColor: "from-purple-600/8",
  },
  {
    num: "03",
    icon: "🗺️",
    title: "Watch Live on the Map",
    desc: "Their location appears on your interactive map in real time via WebSocket. Track movement paths and stay connected.",
    accentFrom: "from-cyan-500",
    accentTo: "to-indigo-500",
    iconBg: "bg-cyan-500/15 border-cyan-500/30",
    hoverBorder: "hover:border-cyan-500/50",
    hoverShadow: "hover:shadow-[0_0_50px_rgba(34,211,238,0.15)]",
    overlayColor: "from-cyan-600/8",
  },
];

const stats = [
  { value: "< 1s", label: "Update Latency" },
  { value: "100%", label: "Consent-Based" },
  { value: "0", label: "App Downloads" },
  { value: "256-bit", label: "Encryption" },
];

const useCases = [
  { icon: "👨‍👩‍👧", title: "Family Safety", desc: "Know when your child arrives home safely — without constant phone calls." },
  { icon: "🎉", title: "Event Meetups", desc: "Find friends in crowded festivals or venues using a shared live map." },
  { icon: "🚨", title: "Emergency Check-ins", desc: "Share your location during travel or emergencies with a trusted contact." },
  { icon: "🚚", title: "Field Teams", desc: "Monitor drivers or delivery agents in real time without installing any fleet app." },
];

const faqs = [
  {
    q: "Does the recipient need to install an app?",
    a: "No. The recipient opens your link in any smartphone browser. No app download, no account creation — just tap 'Allow Location' and sharing begins instantly.",
  },
  {
    q: "Can someone track me without my knowledge?",
    a: "Never. Every tracking session requires your explicit browser permission. If you click 'Block' or close the page, your location is never transmitted. NexTrack cannot override browser permissions.",
  },
  {
    q: "How long does a tracking link stay active?",
    a: "Tracking links automatically expire after 24 hours. You can also delete a link at any time from your dashboard, which instantly stops all tracking.",
  },
  {
    q: "Is my location data stored?",
    a: "No. Location coordinates are streamed live via WebSocket and are never permanently stored on our servers. Once you close the tracking page, your location data is gone.",
  },
  {
    q: "How accurate is the live location?",
    a: "Accuracy depends on the recipient's device GPS. On modern smartphones outdoors, this is typically within 5–10 metres. The map shows an accuracy circle so you always know the precision.",
  },
  {
    q: "Can I track multiple people at once?",
    a: "Yes. NexTrack supports group tracking — create a group, invite members, and watch all their live positions on a single shared map with colour-coded markers.",
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

      <div className="min-h-screen overflow-x-hidden bg-[#0a0a10]">
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes blob {
            0% { transform: translate(0px, 0px) scale(1); }
            33% { transform: translate(50px, -50px) scale(1.1); }
            66% { transform: translate(-40px, 20px) scale(0.9); }
            100% { transform: translate(0px, 0px) scale(1); }
          }
          .animate-blob { animation: blob 10s infinite alternate ease-in-out; }
          .animation-delay-2000 { animation-delay: 2s; }
          .animation-delay-4000 { animation-delay: 4s; }
          .bg-grid {
            background-size: 40px 40px;
            background-image: linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
                              linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
            mask-image: linear-gradient(to bottom, transparent, black 10%, black 90%, transparent);
            -webkit-mask-image: linear-gradient(to bottom, transparent, black 10%, black 90%, transparent);
          }
        `}} />
        
        {/* Animated Premium LED Grid & Orbs Background */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden flex justify-center">
          <div className="absolute inset-0 bg-grid opacity-70"></div>
          
          <div className="absolute -top-[10%] -left-[10%] w-[50vw] h-[50vw] max-w-[700px] max-h-[700px] rounded-full bg-indigo-600/20 blur-[100px] mix-blend-screen animate-blob" />
          <div className="absolute top-[20%] -right-[10%] w-[40vw] h-[40vw] max-w-[600px] max-h-[600px] rounded-full bg-purple-600/20 blur-[100px] mix-blend-screen animate-blob animation-delay-2000" />
          <div className="absolute -bottom-[10%] left-[20%] w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] rounded-full bg-cyan-600/15 blur-[120px] mix-blend-screen animate-blob animation-delay-4000" />
        </div>

        {/* ── HERO */}
        <section className="relative flex flex-col items-center justify-center text-center px-4 pt-16 pb-20 sm:pt-24 sm:pb-28">
          <div className="inline-flex items-center gap-2.5 bg-white/5 border border-white/10 backdrop-blur-sm rounded-full px-5 py-2 text-sm text-slate-300 mb-8 shadow-lg">
            <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-400" />
            </span>
            <span className="font-medium tracking-wide">Real-time location tracking — live now</span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white leading-[1.08] tracking-tight mb-6 max-w-4xl">
            Share Live Location,{" "}
            <span
              className="text-transparent bg-clip-text"
              style={{ backgroundImage: "linear-gradient(135deg, #a3a6ff 0%, #c180ff 50%, #7de9ff 100%)" }}
            >
              No App Required
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Send a private link via WhatsApp or SMS. The moment your contact taps{" "}
            <span className="text-slate-300 font-medium">'Allow Location'</span>, their live GPS
            position updates on your interactive map — in under a second.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isAuthenticated ? (
              <Link to="/dashboard" className="nextrack-btn-primary text-base px-10 py-4">
                Go to Dashboard →
              </Link>
            ) : (
              <>
                <Link to="/register" className="nextrack-btn-primary text-base px-10 py-4">
                  Start Tracking Free
                </Link>
                <Link to="/login" className="nextrack-btn-ghost text-base px-10 py-4">
                  Sign In
                </Link>
              </>
            )}
          </div>

          {/* Stats strip */}
          <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-px bg-white/[0.06] rounded-2xl overflow-hidden border border-white/[0.06] max-w-3xl w-full mx-auto">
            {stats.map((s) => (
              <div key={s.label} className="flex flex-col items-center py-6 px-4" style={{ background: "rgba(255,255,255,0.02)" }}>
                <span className="text-2xl font-bold text-white tracking-tight" style={{ backgroundImage: "linear-gradient(135deg, #a3a6ff, #c180ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  {s.value}
                </span>
                <span className="text-xs text-slate-500 mt-1 font-medium uppercase tracking-wider">{s.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── FEATURES GRID */}
        <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16" aria-label="Features">
          <div className="flex flex-col items-center text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-5 py-2 text-xs font-bold text-indigo-400 uppercase tracking-widest mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
              Features
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
              Everything you need,{" "}
              <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(135deg, #a3a6ff, #c180ff)" }}>
                nothing you don't
              </span>
            </h2>
            <p className="text-slate-400 max-w-xl text-lg">
              Advanced tools for real-time location sharing — built with privacy at the core.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f) => (
              <div
                key={f.title}
                className={`group relative rounded-2xl p-6 border border-white/[0.07] backdrop-blur-sm transition-all duration-500 cursor-default ${f.border} ${f.glow} hover:-translate-y-1`}
                style={{ background: "rgba(255,255,255,0.02)" }}
              >
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${f.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />
                <div className="relative z-10">
                  <div className={`w-12 h-12 flex items-center justify-center rounded-xl border text-2xl mb-5 ${f.iconBg} shadow-inner transition-transform duration-300 group-hover:scale-110`}>
                    {f.icon}
                  </div>
                  <h3 className="text-white font-semibold text-lg mb-2">{f.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
                </div>
                <div className={`absolute bottom-0 left-6 right-6 h-px bg-gradient-to-r ${f.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              </div>
            ))}
          </div>
        </section>

        {/* ── HOW IT WORKS */}
        <section className="relative py-16 px-4 overflow-hidden" aria-label="How it works">
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full opacity-20" style={{ background: "radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 65%)" }} />
          </div>

          <div className="relative z-10 max-w-6xl mx-auto">
            <div className="flex flex-col items-center text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-5 py-2 text-xs font-bold text-indigo-400 uppercase tracking-widest mb-5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                How It Works
              </div>
              <h2 className="text-3xl sm:text-5xl font-bold text-white tracking-tight mb-4 leading-tight">
                Start Tracking in{" "}
                <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(135deg, #a3a6ff 0%, #c180ff 50%, #7de9ff 100%)" }}>
                  3 Simple Steps
                </span>
              </h2>
              <p className="text-slate-400 max-w-xl text-lg">
                No app installation. No complicated setup. Just seamless, real-time location sharing in minutes.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-4 relative">
              <div className="hidden lg:block absolute top-16 left-[calc(33.33%+8px)] right-[calc(33.33%+8px)] h-px z-0" style={{ background: "linear-gradient(90deg, rgba(99,102,241,0.5), rgba(168,85,247,0.5), rgba(34,211,238,0.5))" }} />
              {steps.map((s, i) => (
                <div key={s.num} className={`relative group z-10 ${i === 1 ? "lg:mt-10" : ""}`}>
                  <div className={`relative rounded-3xl p-8 h-full border border-white/[0.07] backdrop-blur-sm transition-all duration-500 ${s.hoverBorder} ${s.hoverShadow} hover:-translate-y-1.5`} style={{ background: "rgba(255,255,255,0.025)" }}>
                    <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${s.overlayColor} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-7">
                        <div className={`w-14 h-14 flex items-center justify-center rounded-2xl border text-2xl ${s.iconBg} transition-transform duration-300 group-hover:scale-110`}>{s.icon}</div>
                        <span className="text-6xl font-black select-none" style={{ color: "rgba(255,255,255,0.06)" }}>{s.num}</span>
                      </div>
                      <h3 className="text-xl font-bold text-white mb-3">{s.title}</h3>
                      <p className="text-slate-400 text-sm leading-relaxed">{s.desc}</p>
                      <div className={`mt-7 h-0.5 w-10 rounded-full bg-gradient-to-r ${s.accentFrom} ${s.accentTo} group-hover:w-20 transition-all duration-500`} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── USE CASES */}
        <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16" aria-label="Use cases">
          <div className="flex flex-col items-center text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-5 py-2 text-xs font-bold text-purple-400 uppercase tracking-widest mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
              Use Cases
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
              Built for{" "}
              <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(135deg, #a3a6ff, #c180ff)" }}>
                real situations
              </span>
            </h2>
            <p className="text-slate-400 max-w-xl text-lg">
              From family check-ins to field team tracking — NexTrack adapts to how you actually need it.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {useCases.map((u) => (
              <div key={u.title} className="group rounded-2xl p-6 border border-white/[0.07] hover:border-purple-500/40 transition-all duration-300 hover:-translate-y-1" style={{ background: "rgba(255,255,255,0.02)" }}>
                <div className="text-3xl mb-4">{u.icon}</div>
                <h3 className="text-white font-semibold text-base mb-2">{u.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{u.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── FAQ */}
        <section className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-20" aria-label="Frequently asked questions">
          <div className="flex flex-col items-center text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-5 py-2 text-xs font-bold text-cyan-400 uppercase tracking-widest mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              FAQ
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
              Common Questions
            </h2>
          </div>
          <div className="flex flex-col gap-4">
            {faqs.map((f, i) => (
              <details key={i} className="group rounded-2xl border border-white/[0.07] overflow-hidden" style={{ background: "rgba(255,255,255,0.02)" }}>
                <summary className="flex items-center justify-between px-6 py-4 cursor-pointer text-white font-semibold text-sm list-none select-none">
                  {f.q}
                  <span className="ml-4 text-slate-400 group-open:rotate-45 transition-transform duration-300 text-xl flex-shrink-0">+</span>
                </summary>
                <div className="px-6 pb-5 text-slate-400 text-sm leading-relaxed border-t border-white/[0.05] pt-4">
                  {f.a}
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* ── CTA BANNER */}
        <section className="relative px-4 pb-16" aria-label="Call to action">
          <div className="max-w-4xl mx-auto">
            <div className="relative rounded-3xl overflow-hidden border border-white/[0.08] p-1" style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.15), rgba(168,85,247,0.1), rgba(34,211,238,0.08))" }}>
              <div className="rounded-[22px] p-10 text-center relative overflow-hidden" style={{ background: "rgba(13,13,23,0.9)", backdropFilter: "blur(40px)" }}>
                <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-40 rounded-full opacity-30" style={{ background: "radial-gradient(ellipse, rgba(99,102,241,0.3) 0%, transparent 70%)" }} />
                <div className="relative z-10">
                  <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-xs font-bold text-cyan-400 uppercase tracking-widest mb-6">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                    Zero friction
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 tracking-tight">
                    Ready to try{" "}
                    <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(135deg, #a3a6ff, #c180ff)" }}>
                      NexTrack for free?
                    </span>
                  </h2>
                  <p className="text-slate-400 mb-10 max-w-xl mx-auto text-lg leading-relaxed">
                    Every plan includes live GPS tracking, end-to-end encryption, and instant activation.
                    <strong className="text-slate-200 font-semibold"> No subscriptions — buy slots when you need them.</strong>
                  </p>
                  {isAuthenticated ? (
                    <Link to="/dashboard" className="nextrack-btn-primary text-base px-12 py-4 inline-flex">
                      Open Dashboard →
                    </Link>
                  ) : (
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <Link to="/register" className="nextrack-btn-primary text-base px-12 py-4">
                        Start Tracking Free
                      </Link>
                      <Link to="/pricing" className="nextrack-btn-ghost text-base px-10 py-4">
                        View Plans
                      </Link>
                      <Link to="/blog" className="nextrack-btn-ghost text-base px-10 py-4">
                        Read Our Blog
                      </Link>
                    </div>
                  )}
                  <div className="flex flex-wrap items-center justify-center gap-6 mt-10 text-xs text-slate-500">
                    {["🔒 End-to-end encrypted", "✅ Consent-based only", "⚡ Real-time WebSocket", "🌐 No app required"].map((t) => (
                      <span key={t} className="flex items-center gap-1.5">{t}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Home;
