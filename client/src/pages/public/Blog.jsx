import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import AmbientBackground from "../../components/common/AmbientBackground";

export const blogArticles = [
  {
    slug: "how-gps-location-tracking-works",
    title: "How GPS Location Tracking Works: A Complete Technical Guide",
    excerpt:
      "Ever wondered how your smartphone calculates its exact coordinates within metres? This comprehensive guide breaks down satellite trilateration, cell-tower triangulation, Wi-Fi positioning, and how NexTrack's WebSocket stream delivers updates in real time.",
    category: "Technology",
    author: "NexTrack Engineering",
    date: "June 10, 2026",
    readTime: "7 min read",
    icon: "📡",
  },
  {
    slug: "top-5-use-cases-for-location-trackers",
    title: "Top 5 Real-World Use Cases for Live Location Trackers",
    excerpt:
      "From keeping children safe during the school commute to lightweight field fleet management without bulky software — discover how real-time location sharing solves daily coordination challenges.",
    category: "Guides",
    author: "Product Team",
    date: "June 5, 2026",
    readTime: "6 min read",
    icon: "🗺️",
  },
  {
    slug: "how-to-share-your-location-safely",
    title: "How to Share Your Real-Time Location Safely: Privacy Best Practices",
    excerpt:
      "Sharing your live coordinates is invaluable, but only on your own terms. Learn about hardware browser permissions, how to revoke access instantly, and why consent-based design is critical.",
    category: "Privacy & Security",
    author: "Security Team",
    date: "May 28, 2026",
    readTime: "8 min read",
    icon: "🔒",
  },
];

const schemaBlog = {
  "@context": "https://schema.org",
  "@type": "Blog",
  name: "NexTrack Blog",
  url: "https://locationtracker.app/blog",
  description:
    "Expert articles on GPS tracking technology, privacy best practices, and real-world use cases for live location sharing.",
  publisher: {
    "@type": "Organization",
    name: "NexTrack",
    url: "https://locationtracker.app",
  },
};

const Blog = () => {
  const [featured, ...otherArticles] = blogArticles;

  return (
    <>
      <Helmet>
        <title>Blog | NexTrack — GPS Tracking Guides &amp; Privacy Telemetry</title>
        <meta
          name="description"
          content="Read expert guides on GPS location tracking technology, privacy best practices, and real-world use cases. Learn how live location sharing works and how to use it safely."
        />
        <link rel="canonical" href="https://locationtracker.app/blog" />
        <meta property="og:title" content="NexTrack Blog — GPS Tracking Guides &amp; Privacy Telemetry" />
        <meta
          property="og:description"
          content="Expert articles on GPS technology, consent-based location sharing, and privacy best practices."
        />
        <meta property="og:url" content="https://locationtracker.app/blog" />
        <meta property="og:type" content="website" />
        <script type="application/ld+json">{JSON.stringify(schemaBlog)}</script>
      </Helmet>

      <div className="relative min-h-screen pt-10 pb-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <AmbientBackground />

        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex items-center gap-2 text-xs text-slate-400">
            <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
            <li className="text-slate-600">/</li>
            <li className="text-indigo-300 font-medium">Blog</li>
          </ol>
        </nav>

        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="eyebrow-pill mb-4">Engineering &amp; Insights</span>
          <h1 className="display-title mb-4">
            The NexTrack{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-purple-300 to-indigo-300">
              Journal
            </span>
          </h1>
          <p className="subheading-lead text-slate-300">
            In-depth guides on geolocation telemetry, privacy architecture, and practical real-time tracking techniques.
          </p>
        </div>

        {/* ── FEATURED ARTICLE (DOMINANT VISUAL HIERARCHY) ── */}
        {featured && (
          <div className="mb-14">
            <Link
              to={`/blog/${featured.slug}`}
              className="group block surface-elevated p-8 sm:p-10 rounded-3xl border-indigo-500/40 hover:border-indigo-400/60 transition-all duration-300"
            >
              <div className="flex flex-col md:flex-row gap-6 items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                      Featured Guide
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      {featured.readTime}
                    </span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 group-hover:text-indigo-300 transition-colors leading-tight">
                    {featured.title}
                  </h2>

                  <p className="text-sm sm:text-base text-slate-300 leading-relaxed mb-6">
                    {featured.excerpt}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <span className="font-medium text-slate-300">By {featured.author}</span>
                    <span>•</span>
                    <span>{featured.date}</span>
                    <span className="ml-auto font-semibold text-indigo-400 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                      Read Article →
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* ── SECONDARY ARTICLES GRID ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {otherArticles.map((article) => (
            <Link
              key={article.slug}
              to={`/blog/${article.slug}`}
              className="group surface-card p-7 rounded-2xl hover:border-indigo-500/30 transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-white/[0.05] border border-white/10 text-slate-300">
                    {article.category}
                  </span>
                  <span className="text-xs text-slate-400">
                    {article.readTime}
                  </span>
                </div>

                <h3 className="card-title font-bold text-white mb-3 group-hover:text-indigo-300 transition-colors">
                  {article.title}
                </h3>

                <p className="body-secondary text-slate-400 leading-relaxed mb-6">
                  {article.excerpt}
                </p>
              </div>

              <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs text-slate-400">
                <span>{article.date}</span>
                <span className="font-semibold text-indigo-400 group-hover:translate-x-1 transition-transform">
                  Read →
                </span>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </>
  );
};

export default Blog;
