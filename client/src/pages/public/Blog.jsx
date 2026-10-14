import { memo } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { blogArticles } from "../../data/blogArticles";
import { preloadRoute } from "../../utils/routePrefetch";

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

const [featured, ...otherArticles] = blogArticles;

const Blog = memo(() => {

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

        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex items-center gap-2 text-xs text-stone-500">
            <li><Link to="/" className="hover:text-stone-900 transition-colors">Home</Link></li>
            <li className="text-stone-300">/</li>
            <li className="text-stone-900 font-medium">Journal</li>
          </ol>
        </nav>

        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="eyebrow-pill mb-4">Engineering Notes &amp; Architectural Insights</span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-stone-900 mb-4 font-serif">
            The NexTrack{" "}
            <span className="italic font-normal text-stone-600">
              Journal
            </span>
          </h1>
          <p className="text-base sm:text-lg text-stone-600 max-w-xl mx-auto leading-relaxed">
            In-depth guides on geolocation telemetry, privacy architecture, and practical real-time tracking techniques.
          </p>
        </div>

        {/* ── FEATURED ARTICLE ── */}
        {featured && (
          <div className="mb-12">
            <Link
              to={`/blog/${featured.slug}`}
              onMouseEnter={() => preloadRoute(`/blog/${featured.slug}`)}
              onTouchStart={() => preloadRoute(`/blog/${featured.slug}`)}
              onFocus={() => preloadRoute(`/blog/${featured.slug}`)}
              className="group block surface-card p-8 sm:p-10 rounded-3xl border border-[#ded7ca] hover:border-stone-400 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex flex-col md:flex-row gap-6 items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#ece6da] text-stone-800 border border-[#ded7ca]">
                      Featured Guide
                    </span>
                    <span className="text-xs text-stone-500 font-medium">
                      {featured.readTime}
                    </span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 mb-3 group-hover:text-stone-700 transition-colors leading-tight font-serif">
                    {featured.title}
                  </h2>

                  <p className="text-sm sm:text-base text-stone-600 leading-relaxed mb-6">
                    {featured.excerpt}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-stone-500 pt-4 border-t border-[#e7e0d3]">
                    <span className="font-semibold text-stone-800">By {featured.author}</span>
                    <span>•</span>
                    <span>{featured.date}</span>
                    <span className="ml-auto font-semibold text-stone-900 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                      Read Complete Article →
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
              onMouseEnter={() => preloadRoute(`/blog/${article.slug}`)}
              onTouchStart={() => preloadRoute(`/blog/${article.slug}`)}
              onFocus={() => preloadRoute(`/blog/${article.slug}`)}
              className="group surface-card p-7 rounded-2xl border border-[#e7e0d3] hover:border-stone-400 hover:shadow-md transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#f7f4ed] border border-[#e7e0d3] text-stone-700">
                    {article.category}
                  </span>
                  <span className="text-xs text-stone-500">
                    {article.readTime}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-stone-900 mb-3 group-hover:text-stone-700 transition-colors font-serif leading-snug">
                  {article.title}
                </h3>

                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed mb-6">
                  {article.excerpt}
                </p>
              </div>

              <div className="pt-4 border-t border-[#e7e0d3] flex items-center justify-between text-xs text-stone-500">
                <span>{article.date}</span>
                <span className="font-semibold text-stone-900 group-hover:translate-x-1 transition-transform">
                  Read Article →
                </span>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </>
  );
});

export default Blog;
