import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { registerUser, googleLogin } from "../../services/api";
import { useGoogleLogin } from "@react-oauth/google";
import toast from "react-hot-toast";
import AmbientBackground from "../../components/common/AmbientBackground";

/* ── Google Icon ── */
const GoogleIcon = () => (
  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

const Register = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleRegister = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) {
      return toast.error("Password must be at least 6 characters.");
    }
    setLoading(true);
    try {
      const res = await registerUser(form);
      login(res.data.user, res.data.token);
      toast.success("Account created successfully!");
      navigate("/dashboard");
    } catch (err) {
      console.error("Register error:", err);
      toast.error(err.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  const customGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      try {
        const res = await googleLogin({
          access_token: tokenResponse.access_token,
        });
        login(res.data.user, res.data.token);
        toast.success("Account verified with Google!");
        navigate("/dashboard");
      } catch (err) {
        console.error("Google Auth error:", err);
        toast.error(
          err.response?.data?.message || "Google registration failed.",
        );
      } finally {
        setLoading(false);
      }
    },
    onError: () => toast.error("Google registration was cancelled."),
  });

  /* Visual Password Strength Gauge */
  const pwStrength = (() => {
    const p = form.password;
    if (!p) return null;
    if (p.length < 6)
      return { label: "Too short (min 6 chars)", color: "bg-rose-500", width: "25%" };
    if (p.length < 8) return { label: "Fair", color: "bg-amber-500", width: "50%" };
    if (p.length < 10 || !/[A-Z]/.test(p) || !/[0-9]/.test(p))
      return { label: "Good", color: "bg-indigo-400", width: "75%" };
    return { label: "Strong", color: "bg-emerald-400", width: "100%" };
  })();

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <AmbientBackground />

      <div className="relative z-10 w-full max-w-md">
        
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4 group">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
              <img src="/location.png" alt="NexTrack" className="w-6 h-6 object-contain" />
            </div>
            <span className="font-bold text-xl text-white tracking-tight">
              Nex<span className="text-indigo-400">Track</span>
            </span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-2">
            Create Your Account
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Start generating consent-based tracking links in seconds
          </p>
        </div>

        {/* Form Card */}
        <div className="surface-elevated p-8 sm:p-10 rounded-3xl border-white/10 shadow-2xl">
          <form onSubmit={handleRegister} className="space-y-4">
            
            {/* Name */}
            <div>
              <label className="label" htmlFor="reg-name">Full Name</label>
              <input
                id="reg-name"
                name="name"
                type="text"
                required
                autoComplete="name"
                placeholder="Jane Doe"
                value={form.name}
                onChange={handleChange}
                className="input"
              />
            </div>

            {/* Email */}
            <div>
              <label className="label" htmlFor="reg-email">Email Address</label>
              <input
                id="reg-email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="name@example.com"
                value={form.email}
                onChange={handleChange}
                className="input"
              />
            </div>

            {/* Password */}
            <div>
              <label className="label" htmlFor="reg-password">Password</label>
              <div className="relative">
                <input
                  id="reg-password"
                  name="password"
                  type={showPw ? "text" : "password"}
                  required
                  autoComplete="new-password"
                  placeholder="At least 6 characters"
                  value={form.password}
                  onChange={handleChange}
                  className="input pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors p-1"
                  aria-label={showPw ? "Hide password" : "Show password"}
                >
                  {showPw ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7 1.274-4.057 5.064-7 9.542-7 1.254 0 2.415.283 3.456.784m1.56 1.56a9.456 9.456 0 013.458 4.656C20.268 15.057 16.477 18 12 18c-.453 0-.895-.034-1.328-.101M3 3l18 18" />
                    </svg>
                  )}
                </button>
              </div>

              {/* Password strength indicator */}
              {pwStrength && (
                <div className="mt-2 space-y-1">
                  <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${pwStrength.color} transition-all duration-300 rounded-full`}
                      style={{ width: pwStrength.width }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 flex justify-between">
                    <span>Password Strength:</span>
                    <span className="font-semibold text-slate-300">{pwStrength.label}</span>
                  </p>
                </div>
              )}
            </div>

            {/* Terms Notice */}
            <p className="text-[11px] text-slate-400 leading-normal pt-1">
              By creating an account, you agree to our{" "}
              <Link to="/terms" className="text-indigo-400 hover:underline">Terms</Link>{" "}
              and{" "}
              <Link to="/privacy-policy" className="text-indigo-400 hover:underline">Privacy Policy</Link>.
            </p>

            {/* PRIMARY CTA */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="btn-cta-primary w-full py-3.5 text-sm font-semibold"
              >
                {loading ? "Creating Account..." : "Create Free Account →"}
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-white/[0.08]" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Or sign up with
            </span>
            <div className="flex-1 h-px bg-white/[0.08]" />
          </div>

          {/* SECONDARY ACTION: Google Sign Up */}
          <button
            type="button"
            onClick={() => customGoogleLogin()}
            disabled={loading}
            className="btn-cta-secondary w-full py-3 text-sm font-medium flex items-center justify-center gap-3"
          >
            <GoogleIcon />
            <span>Continue with Google</span>
          </button>

          {/* Bottom Switcher */}
          <div className="mt-8 text-center pt-6 border-t border-white/[0.08]">
            <p className="text-xs text-slate-400">
              Already have an account?{" "}
              <Link to="/login" className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
                Sign In →
              </Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Register;
