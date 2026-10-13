import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { loginUser, googleLogin } from "../../services/api";
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

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ 
    email: localStorage.getItem("rememberedEmail") || "", 
    password: "" 
  });
  const [rememberMe, setRememberMe] = useState(!!localStorage.getItem("rememberedEmail"));
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await loginUser(form);
      
      if (rememberMe) {
        localStorage.setItem("rememberedEmail", form.email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }

      login(res.data.user, res.data.token);
      toast.success(`Welcome back, ${res.data.user.name}!`);
      navigate("/dashboard");
    } catch (err) {
      console.error("Login error:", err);
      toast.error(err.response?.data?.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  const customGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      try {
        const res = await googleLogin({ access_token: tokenResponse.access_token });
        login(res.data.user, res.data.token);
        toast.success(`Welcome back, ${res.data.user.name}!`);
        navigate("/dashboard");
      } catch (err) {
        console.error("Google login error:", err);
        toast.error(err.response?.data?.message || "Google sign-in failed.");
      } finally {
        setLoading(false);
      }
    },
    onError: () => toast.error("Google sign-in was cancelled or failed."),
  });

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <AmbientBackground />

      <div className="relative z-10 w-full max-w-md">
        
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4 group">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
              <img src="/location.png" alt="NexTrack" className="w-6 h-6 object-contain" />
            </div>
            <span className="font-bold text-xl text-stone-900 tracking-tight">
              Nex<span className="text-indigo-600">Track</span>
            </span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight mb-1.5">
            Welcome Back
          </h1>
          <p className="text-xs sm:text-sm text-stone-600">
            Sign in to access your tracking command center
          </p>
        </div>

        {/* Main Card */}
        <div className="surface-elevated p-8 sm:p-10 rounded-3xl border-stone-200/90 shadow-sm bg-white">
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Email Field */}
            <div>
              <label className="label" htmlFor="login-email">Email Address</label>
              <input
                id="login-email"
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

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="label !mb-0" htmlFor="login-password">Password</label>
                <Link
                  to="/contact"
                  className="text-xs text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                  Need help?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="login-password"
                  name="password"
                  type={showPw ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  className="input pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 transition-colors p-1"
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
            </div>

            {/* Remember Me */}
            <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-stone-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
              <label htmlFor="remember" className="text-xs text-stone-600 select-none cursor-pointer">
                Remember my email on this browser
              </label>
            </div>

            {/* PRIMARY CTA */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="btn-cta-primary w-full py-3.5 text-sm font-semibold shadow-xs"
              >
                {loading ? "Signing in..." : "Sign In to NexTrack →"}
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-stone-200" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
              Or continue with
            </span>
            <div className="flex-1 h-px bg-stone-200" />
          </div>

          {/* Google Sign In */}
          <button
            type="button"
            onClick={() => customGoogleLogin()}
            disabled={loading}
            className="btn-cta-secondary w-full py-2.5 text-sm font-medium flex items-center justify-center gap-3 shadow-xs"
          >
            <GoogleIcon />
            <span>Continue with Google</span>
          </button>

          {/* Bottom Switcher */}
          <div className="mt-8 text-center pt-6 border-t border-stone-100">
            <p className="text-xs text-stone-600">
              Don't have an account yet?{" "}
              <Link to="/register" className="font-semibold text-indigo-600 hover:text-indigo-800 transition-colors">
                Create one free →
              </Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;
