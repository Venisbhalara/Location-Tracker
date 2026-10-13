import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
    setMenuOpen(false);
  };

  const navLinkClass = ({ isActive }) =>
    `text-sm font-medium px-3.5 py-1.5 rounded-lg transition-all duration-150 ${
      isActive
        ? "text-stone-900 bg-stone-200/60 font-semibold shadow-xs"
        : "text-stone-600 hover:text-stone-900 hover:bg-stone-100/70"
    }`;

  const mobileNavLinkClass = ({ isActive }) =>
    `text-base font-medium px-4 py-3 rounded-xl transition-all duration-150 flex items-center justify-between ${
      isActive
        ? "text-stone-900 bg-stone-100 font-semibold border-l-3 border-indigo-600"
        : "text-stone-600 hover:text-stone-900 hover:bg-stone-50"
    }`;

  return (
    <header className="sticky top-0 z-50 transition-all duration-200 relative glassmorphism-navbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Brand Identity */}
          <Link
            to="/"
            className="flex items-center gap-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 rounded-lg p-1 -m-1"
            aria-label="NexTrack Home"
          >
            <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200/80 shadow-xs">
              <img
                src="/location.png"
                alt="NexTrack"
                className="w-5 h-5 object-contain"
              />
            </div>
            <span className="font-bold text-lg text-stone-900 tracking-tight">
              Nex<span className="text-indigo-600">Track</span>
            </span>
          </Link>

          {/* Desktop Navigation Hierarchy */}
          <nav
            className="hidden md:flex items-center gap-1.5"
            aria-label="Main Navigation"
          >
            {isAuthenticated ? (
              <>
                <NavLink to="/dashboard" className={navLinkClass}>
                  Dashboard
                </NavLink>
                <NavLink to="/tracking/create" className={navLinkClass}>
                  New Tracking
                </NavLink>
                <NavLink to="/groups" className={navLinkClass}>
                  Groups
                </NavLink>
                <NavLink to="/pricing" className={navLinkClass}>
                  Pricing
                </NavLink>
              </>
            ) : (
              <>
                <NavLink to="/" className={navLinkClass} end>
                  Home
                </NavLink>
                <NavLink to="/about" className={navLinkClass}>
                  About
                </NavLink>
                <NavLink to="/pricing" className={navLinkClass}>
                  Pricing
                </NavLink>
                <NavLink to="/blog" className={navLinkClass}>
                  Blog
                </NavLink>
                <NavLink to="/contact" className={navLinkClass}>
                  Contact
                </NavLink>
              </>
            )}
          </nav>

          {/* Header Action Hierarchy */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3 pl-2 border-l border-stone-200">
                {/* User Avatar */}
                <NavLink
                  to="/profile"
                  title="Your Profile"
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3 py-1.5 rounded-xl border text-sm font-medium transition-all ${
                      isActive
                        ? "border-indigo-300 bg-indigo-50 text-indigo-900"
                        : "border-stone-200 bg-white text-stone-700 hover:text-stone-900 hover:border-stone-300 shadow-xs"
                    }`
                  }
                >
                  <span className="w-6 h-6 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center text-xs font-bold text-indigo-700">
                    {user?.name?.charAt(0).toUpperCase() || "U"}
                  </span>
                  <span className="max-w-[120px] truncate text-stone-800 font-semibold">
                    {user?.name?.split(" ")[0] || "Account"}
                  </span>
                </NavLink>

                {/* Quiet Logout Button */}
                <button
                  onClick={handleLogout}
                  className="text-xs font-medium px-3 py-2 rounded-xl text-stone-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="text-sm font-medium text-stone-600 hover:text-stone-900 px-3 py-2 transition-colors rounded-lg"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="btn-cta-primary text-xs sm:text-sm px-4 py-2 font-semibold shadow-xs"
                >
                  Get Started Free
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger button */}
          <button
            className="md:hidden p-2 rounded-xl text-stone-700 hover:text-stone-900 bg-white border border-stone-200 shadow-xs transition-all focus:outline-none focus:ring-2 focus:ring-indigo-400"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? (
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Sheet */}
      {menuOpen && (
        <div className="md:hidden px-4 pt-3 pb-6 flex flex-col gap-1.5 relative glassmorphism-mobile-menu">
          {isAuthenticated ? (
            <>
              <div className="py-2 px-1">
                <span className="text-[11px] font-bold text-stone-400 uppercase tracking-widest px-3">
                  Account Menu
                </span>
              </div>
              <NavLink
                to="/dashboard"
                className={mobileNavLinkClass}
                onClick={() => setMenuOpen(false)}
              >
                <span>Dashboard</span>
                <span className="text-stone-400">→</span>
              </NavLink>
              <NavLink
                to="/tracking/create"
                className={mobileNavLinkClass}
                onClick={() => setMenuOpen(false)}
              >
                <span>New Tracking</span>
                <span className="text-stone-400">→</span>
              </NavLink>
              <NavLink
                to="/groups"
                className={mobileNavLinkClass}
                onClick={() => setMenuOpen(false)}
              >
                <span>Group Tracking</span>
                <span className="text-stone-400">→</span>
              </NavLink>
              <NavLink
                to="/pricing"
                className={mobileNavLinkClass}
                onClick={() => setMenuOpen(false)}
              >
                <span>Pricing Plans</span>
                <span className="text-stone-400">→</span>
              </NavLink>
              <NavLink
                to="/profile"
                className={mobileNavLinkClass}
                onClick={() => setMenuOpen(false)}
              >
                <span>My Profile</span>
                <span className="text-stone-400">→</span>
              </NavLink>

              <div className="pt-4 mt-2 border-t border-stone-200 flex flex-col gap-3">
                <button
                  onClick={handleLogout}
                  className="w-full py-2.5 px-4 rounded-xl text-center text-sm font-semibold text-rose-700 bg-rose-50 border border-rose-200"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="py-2 px-1">
                <span className="text-[11px] font-bold text-stone-400 uppercase tracking-widest px-3">
                  Navigation
                </span>
              </div>
              <NavLink
                to="/"
                className={mobileNavLinkClass}
                end
                onClick={() => setMenuOpen(false)}
              >
                <span>Home</span>
                <span className="text-stone-400">→</span>
              </NavLink>
              <NavLink
                to="/about"
                className={mobileNavLinkClass}
                onClick={() => setMenuOpen(false)}
              >
                <span>About</span>
                <span className="text-stone-400">→</span>
              </NavLink>
              <NavLink
                to="/pricing"
                className={mobileNavLinkClass}
                onClick={() => setMenuOpen(false)}
              >
                <span>Pricing</span>
                <span className="text-stone-400">→</span>
              </NavLink>
              <NavLink
                to="/blog"
                className={mobileNavLinkClass}
                onClick={() => setMenuOpen(false)}
              >
                <span>Blog</span>
                <span className="text-stone-400">→</span>
              </NavLink>
              <NavLink
                to="/contact"
                className={mobileNavLinkClass}
                onClick={() => setMenuOpen(false)}
              >
                <span>Contact</span>
                <span className="text-stone-400">→</span>
              </NavLink>

              <div className="pt-4 mt-2 border-t border-stone-200 flex flex-col gap-3">
                <Link
                  to="/register"
                  onClick={() => setMenuOpen(false)}
                  className="btn-cta-primary w-full py-3 text-center text-sm font-semibold"
                >
                  Get Started Free
                </Link>
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="btn-cta-secondary w-full py-2.5 text-center text-sm font-medium"
                >
                  Sign In
                </Link>
              </div>
            </>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
