import { Link } from "react-router-dom";

const Footer = () => {
  const year = new Date().getFullYear();

  const footerLinks = {
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

  return (
    <footer
      className="relative z-10 transition-all duration-300 overflow-hidden glassmorphism-footer"
      aria-label="Footer"
    >
      {/* Specular glass reflection accent line on top edge */}
      <div
        className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-400/40 to-transparent pointer-events-none"
        aria-hidden="true"
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-12">
          
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2.5 mb-4 group">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
                <img src="/location.png" alt="NexTrack" className="w-5 h-5 object-contain" />
              </div>
              <span className="font-bold text-lg text-white tracking-tight">
                Nex<span className="text-indigo-400">Track</span>
              </span>
            </Link>
            
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              Real-time, consent-based GPS location sharing for families, friends,
              and teams. Instant activation in any browser with zero app downloads.
            </p>
          </div>

          {/* Navigation Columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4">
                {title}
              </h3>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-sm text-slate-400 hover:text-white transition-colors duration-150 inline-block py-0.5"
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
        <div className="mt-12 pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>
            © {year}{" "}
            <span className="text-slate-400 font-medium">NexTrack</span>. All rights reserved. Built with privacy in mind.
          </p>
          <div className="flex items-center gap-6">
            <Link to="/privacy-policy" className="hover:text-slate-300 transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-slate-300 transition-colors">Terms</Link>
            <Link to="/contact" className="hover:text-slate-300 transition-colors">Support</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
