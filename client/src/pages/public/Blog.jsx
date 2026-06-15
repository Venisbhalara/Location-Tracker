import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";

export const blogArticles = [
  {
    slug: "how-gps-location-tracking-works",
    title: "How GPS Location Tracking Works: A Complete Guide",
    excerpt:
      "Ever wondered how your smartphone knows exactly where you are within a few metres? This in-depth guide breaks down the science behind GPS, cell-tower triangulation, and Wi-Fi positioning — and explains how NexTrack uses all three to deliver near-instant location updates.",
    category: "Technology",
    author: "NexTrack Team",
    date: "June 10, 2026",
    readTime: "7 min read",
    icon: "📡",
    color: "indigo",
  },
  {
    slug: "top-5-use-cases-for-location-trackers",
    title: "Top 5 Real-World Use Cases for Live Location Trackers",
    excerpt:
      "From keeping children safe on their school commute to monitoring field delivery teams without expensive fleet software — real-time location trackers solve problems that no amount of phone calls can. Discover the five most impactful scenarios where NexTrack makes a real difference.",
    category: "Use Cases",
    author: "NexTrack Team",
    date: "June 5, 2026",
    readTime: "6 min read",
    icon: "🗺️",
    color: "purple",
  },
  {
    slug: "how-to-share-your-location-safely",
    title: "How to Share Your Real-Time Location Safely: Privacy Tips & Best Practices",
    excerpt:
      "Sharing your live location with someone is incredibly useful — but only when done on your own terms. This guide covers everything you need to know about consent-based location sharing, what data is actually transmitted, how to revoke access instantly, and the red flags to watch for in other tracking apps.",
    category: "Privacy & Safety",
    author: "NexTrack Team",
    date: "May 28, 2026",
    readTime: "8 min read",
    icon: "🔒",
    color: "cyan",
  },
];

const colorMap = {
  indigo: {
    badge: "bg-indigo-500/10 border-indigo-500/30 text-indigo-400",
    hover: "hover:border-indigo-500/40",
    glow: "hover:shadow-[0_0_40px_rgba(99,102,241,0.12)]",
    iconBg: "bg-indigo-500/10 border-indigo-500/20",
  },
  purple: {
    badge: "bg-purple-500/10 border-purple-500/30 text-purple-400",
    hover: "hover:border-purple-500/40",
    glow: "hover:shadow-[0_0_40px_rgba(168,85,247,0.12)]",
    iconBg: "bg-purple-500/10 border-purple-500/20",
  },
  cyan: {
    badge: "bg-cyan-500/10 border-cyan-500/30 text-cyan-400",
    hover: "hover:border-cyan-500/40",
    glow: "hover:shadow-[0_0_40px_rgba(34,211,238,0.12)]",
    iconBg: "bg-cyan-500/10 border-cyan-500/20",
  },
};

const schemaBlog = {
  "@context": "https://schema.org",
  "@type": "Blog",
  name: "NexTrack Blog",
  url: "https://location-trackers.vercel.app/blog",
  description:
    "Expert articles on GPS tracking technology, privacy best practices, and real-world use cases for live location sharing.",
  publisher: {
    "@type": "Organization",
    name: "NexTrack",
    url: "https://location-trackers.vercel.app",
  },
};

const Blog = () => {
  return (
    <>
      <Helmet>
        <title>Blog | NexTrack — GPS Tracking Guides & Privacy Tips</title>
        <meta
          name="description"
          content="Read expert guides on GPS location tracking technology, privacy best practices, and real-world use cases. Learn how live location sharing works and how to use it safely."
        />
        <link rel="canonical" href="https://location-trackers.vercel.app/blog" />
        <meta property="og:title" content="NexTrack Blog — GPS Tracking Guides & Privacy Tips" />
        <meta
          property="og:description"
          content="Expert articles on GPS technology, consent-based location sharing, and privacy best practices."
        />
        <meta property="og:url" content="https://location-trackers.vercel.app/blog" />
        <meta property="og:type" content="website" />
        <script type="application/ld+json">{JSON.stringify(schemaBlog)}</script>
      </Helmet>

      <div className="min-h-screen py-16 px-4 bg-[#0a0a10] relative overflow-hidden">
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
            background-image: linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px),
                              linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px);
            mask-image: linear-gradient(to bottom, transparent, black 10%, black 90%, transparent);
            -webkit-mask-image: linear-gradient(to bottom, transparent, black 10%, black 90%, transparent);
          }
        `}} />

        {/* Background orbs */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden flex justify-center z-0">
          <div className="absolute inset-0 bg-grid opacity-70" />
          <div className="absolute -top-[10%] -left-[10%] w-[50vw] h-[50vw] max-w-[700px] max-h-[700px] rounded-full bg-indigo-600/20 blur-[100px] mix-blend-screen animate-blob" />
          <div className="absolute top-[20%] -right-[10%] w-[40vw] h-[40vw] max-w-[600px] max-h-[600px] rounded-full bg-purple-600/20 blur-[100px] mix-blend-screen animate-blob animation-delay-2000" />
          <div className="absolute -bottom-[10%] left-[20%] w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] rounded-full bg-cyan-600/15 blur-[120px] mix-blend-screen animate-blob animation-delay-4000" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-10">
            <ol className="flex items-center gap-2 text-xs text-slate-500">
              <li><Link to="/" className="hover:text-indigo-400 transition-colors">Home</Link></li>
              <li className="text-slate-700">/</li>
              <li className="text-slate-400">Blog</li>
            </ol>
          </nav>

          {/* Header */}
          <div className="mb-14 text-center">
            <span className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/30 rounded-full px-4 py-1.5 text-xs text-indigo-400 uppercase tracking-widest mb-5">
              Knowledge Base
            </span>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-5 leading-tight">
              NexTrack Blog —{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400">
                GPS Guides & Privacy Tips
              </span>
            </h1>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed">
              Welcome to the NexTrack knowledge base. Here you will find in-depth, practical articles
              on how GPS and real-time location tracking actually works, the most impactful ways people
              use live location sharing in everyday life, and how to protect your privacy while doing so.
              Whether you are new to location tracking or looking to understand the technology under the
              hood, our guides are written in plain language so anyone can follow along. We cover topics
              from the satellite science behind GPS accuracy to step-by-step privacy checklists for safe
              location sharing. Every article is researched, accurate, and regularly updated.
            </p>
          </div>

          {/* Articles grid */}
          <div className="grid grid-cols-1 gap-7 mb-16">
            {blogArticles.map((article) => {
              const c = colorMap[article.color];
              return (
                <Link
                  key={article.slug}
                  to={`/blog/${article.slug}`}
                  className={`group relative block rounded-3xl border border-white/[0.07] p-7 sm:p-9 transition-all duration-500 hover:-translate-y-1 ${c.hover} ${c.glow}`}
                  style={{ background: "rgba(255,255,255,0.02)" }}
                >
                  <div className="flex flex-col sm:flex-row gap-6 items-start">
                    {/* Icon */}
                    <div className={`w-16 h-16 flex-shrink-0 flex items-center justify-center rounded-2xl border text-3xl ${c.iconBg} transition-transform duration-300 group-hover:scale-110`}>
                      {article.icon}
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Category badge */}
                      <span className={`inline-flex items-center gap-1.5 border rounded-full px-3 py-0.5 text-xs font-semibold uppercase tracking-wider mb-3 ${c.badge}`}>
                        {article.category}
                      </span>

                      <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 leading-snug group-hover:text-indigo-200 transition-colors duration-300">
                        {article.title}
                      </h2>

                      <p className="text-slate-400 text-sm sm:text-base leading-relaxed mb-5">
                        {article.excerpt}
                      </p>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                        <span>✍️ {article.author}</span>
                        <span>📅 {article.date}</span>
                        <span>⏱ {article.readTime}</span>
                        <span className="ml-auto text-indigo-400 font-semibold group-hover:translate-x-1 transition-transform duration-300 inline-flex items-center gap-1">
                          Read article →
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Bottom CTA */}
          <div className="text-center bg-slate-900/60 border border-slate-800 rounded-3xl p-8">
            <h2 className="text-xl font-bold text-white mb-3">Want to try NexTrack?</h2>
            <p className="text-slate-400 text-sm mb-6 max-w-md mx-auto">
              Create a secure, consent-based location tracking link in seconds — no app download required for recipients.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/register" className="nextrack-btn-primary text-sm px-8 py-3">
                Get Started Free
              </Link>
              <Link to="/about" className="nextrack-btn-ghost text-sm px-8 py-3">
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Blog;
