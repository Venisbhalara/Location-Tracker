import { memo } from "react";
import { Link } from "react-router-dom";
import { preloadRoute } from "../../utils/routePrefetch";

const FOOTER_LINKS = {
  Product: [
    { label: "Home", to: "/" },
    { label: "Pricing", to: "/pricing" },
    { label: "New Tracking Link", to: "/tracking/create" },
    { label: "Dashboard", to: "/dashboard" },
  ],
  Company: [
    { label: "About Us", to: "/about" },
    { label: "Blog", to: "/blog" },
    { label: "Contact Us", to: "/contact" },
  ],
  Legal: [
    { label: "Privacy Policy", to: "/privacy-policy" },
    { label: "Terms & Conditions", to: "/terms" },
  ],
};

const Footer = memo(() => {
  const year = new Date().getFullYear();

  return (
    <footer
      className="relative z-10 transition-all duration-200 overflow-hidden glassmorphism-footer"
      aria-label="Footer"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-12">
          
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link
              to="/"
              onMouseEnter={() => preloadRoute("/")}
              onTouchStart={() => preloadRoute("/")}
              onFocus={() => preloadRoute("/")}
              className="flex items-center gap-2.5 mb-4 group"
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200/80 flex items-center justify-center shadow-xs">
                <img
                  src="/location.png"
                  alt="NexTrack"
                  width="20"
                  height="20"
                  loading="lazy"
                  decoding="async"
                  className="w-5 h-5 object-contain"
                />
              </div>
              <span className="font-bold text-lg text-stone-900 tracking-tight">
                Nex<span className="text-indigo-600">Track</span>
              </span>
            </Link>
            
            <p className="text-stone-600 text-sm leading-relaxed max-w-sm">
              Real-time, consent-based GPS location sharing for families, friends,
              and teams. Instant activation in any browser with zero app downloads.
            </p>
          </div>

          {/* Navigation Columns */}
          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-800 mb-4">
                {title}
              </h3>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      onMouseEnter={() => preloadRoute(link.to)}
                      onTouchStart={() => preloadRoute(link.to)}
                      onFocus={() => preloadRoute(link.to)}
                      className="text-sm text-stone-600 hover:text-stone-900 transition-colors duration-150 inline-block py-0.5"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Metadata Bar */}
        <div className="mt-12 pt-8 border-t border-stone-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <p>
            © {year}{" "}
            <span className="text-stone-800 font-semibold">NexTrack</span>. All rights reserved. Built with privacy in mind.
          </p>
          <div className="flex items-center gap-6">
            <Link
              to="/privacy-policy"
              onMouseEnter={() => preloadRoute("/privacy-policy")}
              onTouchStart={() => preloadRoute("/privacy-policy")}
              className="hover:text-stone-800 transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              to="/terms"
              onMouseEnter={() => preloadRoute("/terms")}
              onTouchStart={() => preloadRoute("/terms")}
              className="hover:text-stone-800 transition-colors"
            >
              Terms of Service
            </Link>
            <Link
              to="/contact"
              onMouseEnter={() => preloadRoute("/contact")}
              onTouchStart={() => preloadRoute("/contact")}
              className="hover:text-stone-800 transition-colors"
            >
              Support
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
});

export default Footer;
