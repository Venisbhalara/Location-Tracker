import { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getAdminAccessRequests } from "../../services/api";

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    if (user?.email === "vasu@gmail.com") {
      getAdminAccessRequests()
        .then((res) => {
          const count = res.data.filter((r) => r.status === "pending").length;
          setPendingCount(count);
        })
        .catch((err) => console.error("Could not fetch badge count", err));
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate("/");
    setMenuOpen(false);
  };

  const navClass = ({ isActive }) =>
    isActive
      ? "text-stone-900 font-bold border-b-2 border-stone-800 pb-0.5"
      : "text-stone-600 hover:text-stone-900 font-medium transition-colors";

  return (
    <nav className="bg-white/95 backdrop-blur-md border-b border-[#e7e0d3] sticky top-0 z-50 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2.5 font-bold text-base text-stone-900"
          >
            <img src="/location.png" alt="Logo" className="w-6 h-6 object-contain" />
            <span className="hidden sm:block font-bold text-base text-stone-900 tracking-tight font-serif">
              Nex<span className="text-stone-600 font-normal">Track</span>
              <span className="text-[10px] text-stone-800 font-bold uppercase tracking-widest ml-2 bg-[#ece6da] px-2 py-0.5 rounded-full border border-[#ded7ca]">
                Control Center
              </span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {isAuthenticated ? (
              <>
                <NavLink to="/admin" className={navClass}>
                  <span className="flex items-center gap-1.5 text-xs sm:text-sm">
                    Dashboard
                    {pendingCount > 0 && (
                      <span className="bg-rose-600 text-white min-w-[18px] text-center text-[10px] px-1 py-0.2 rounded-full font-bold shadow-xs">
                        {pendingCount}
                      </span>
                    )}
                  </span>
                </NavLink>
                <div className="flex items-center gap-3.5 ml-3 pl-4 border-l border-[#e7e0d3]">
                  <div
                    className="flex items-center justify-center w-7 h-7 rounded-full font-bold text-xs bg-[#ece6da] border border-[#ded7ca] text-stone-800 shadow-xs"
                    title="View Profile"
                  >
                    {user?.name
                      ? user.name.charAt(0).toUpperCase()
                      : user?.email === "vasu@gmail.com"
                        ? "V"
                        : user?.email?.charAt(0).toUpperCase() || "A"}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="btn-danger text-xs px-3 py-1.5"
                  >
                    Sign Out
                  </button>
                </div>
              </>
            ) : (
              <NavLink to="/login" className={navClass}>
                Admin Login
              </NavLink>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden p-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-[#f7f4ed] transition-colors border border-[#ded7ca]"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-[#fcfaf6] border-t border-[#e7e0d3] px-4 py-4 flex flex-col gap-4 shadow-sm">
          {isAuthenticated ? (
            <>
              <NavLink
                to="/admin"
                className={navClass}
                onClick={() => setMenuOpen(false)}
              >
                <span className="flex items-center gap-1.5">
                  Dashboard
                  {pendingCount > 0 && (
                    <span className="bg-rose-600 text-white min-w-[20px] text-center text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                      {pendingCount}
                    </span>
                  )}
                </span>
              </NavLink>
              <div className="pt-3 border-t border-[#e7e0d3] flex flex-col gap-3">
                <button
                  onClick={handleLogout}
                  className="btn-danger w-full text-xs py-2 justify-center"
                >
                  Sign Out
                </button>
              </div>
            </>
          ) : (
            <NavLink
              to="/login"
              className={navClass}
              onClick={() => setMenuOpen(false)}
            >
              Admin Login
            </NavLink>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
