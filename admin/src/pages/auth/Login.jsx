import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { loginUser } from "../../services/api";
import toast from "react-hot-toast";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await loginUser(form);
      login(res.data.user, res.data.token);
      toast.success(`Welcome back, ${res.data.user.name}!`);
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.wrapper}>
      {/* Ambient background blobs */}
      <div style={styles.blobPurple} />
      <div style={styles.blobBlue} />

      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.iconWrap}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.35C16.5 22.15 20 17.25 20 12V6l-8-4z"
                fill="url(#shieldGrad)"
              />
              <path
                d="M9 12l2 2 4-4"
                stroke="#fff"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <defs>
                <linearGradient id="shieldGrad" x1="4" y1="2" x2="20" y2="23" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#818cf8" />
                  <stop offset="1" stopColor="#6366f1" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <h1 style={styles.title}>Admin Access</h1>
          <p style={styles.subtitle}>Control Panel Authentication</p>
        </div>

        {/* Card */}
        <div style={styles.card}>
          {/* Top glow line */}
          <div style={styles.cardTopLine} />

          <form onSubmit={handleSubmit} style={styles.form}>
            {/* Email */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Email address</label>
              <div style={styles.inputWrap}>
                <span style={styles.inputIcon}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="4" width="20" height="16" rx="3" />
                    <path d="M2 7l10 7 10-7" />
                  </svg>
                </span>
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="your@gmail.com"
                  style={styles.input}
                  value={form.email}
                  onChange={handleChange}
                  onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
                  onBlur={(e) => Object.assign(e.target.style, styles.input)}
                />
              </div>
            </div>

            {/* Password */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Password</label>
              <div style={styles.inputWrap}>
                <span style={styles.inputIcon}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </span>
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  style={styles.input}
                  value={form.password}
                  onChange={handleChange}
                  onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
                  onBlur={(e) => Object.assign(e.target.style, styles.input)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={styles.eyeBtn}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={loading ? { ...styles.btn, opacity: 0.65, cursor: "not-allowed" } : styles.btn}
              onMouseEnter={(e) => !loading && Object.assign(e.target.style, styles.btnHover)}
              onMouseLeave={(e) => !loading && Object.assign(e.target.style, styles.btn)}
            >
              {loading ? (
                <span style={styles.btnContent}>
                  <svg style={styles.spinner} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                  </svg>
                  Signing in...
                </span>
              ) : (
                <span style={styles.btnContent}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                    <polyline points="10 17 15 12 10 7" />
                    <line x1="15" y1="12" x2="3" y2="12" />
                  </svg>
                  Sign In
                </span>
              )}
            </button>
          </form>

          <p style={styles.footNote}>
            Secure access · Admin only
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes blobPulse {
          0%, 100% { transform: scale(1) translate(0, 0); }
          50% { transform: scale(1.08) translate(20px, -15px); }
        }
      `}</style>
    </div>
  );
};

const styles = {
  wrapper: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#0d0d17",
    padding: "24px 16px",
    position: "relative",
    overflow: "hidden",
    fontFamily: "'Inter', system-ui, sans-serif",
  },
  blobPurple: {
    position: "absolute",
    width: "480px",
    height: "480px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)",
    top: "-80px",
    left: "-120px",
    animation: "blobPulse 8s ease-in-out infinite",
    pointerEvents: "none",
  },
  blobBlue: {
    position: "absolute",
    width: "400px",
    height: "400px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(59,130,246,0.14) 0%, transparent 70%)",
    bottom: "-60px",
    right: "-80px",
    animation: "blobPulse 10s ease-in-out infinite reverse",
    pointerEvents: "none",
  },
  container: {
    width: "100%",
    maxWidth: "440px",
    position: "relative",
    zIndex: 1,
  },
  header: {
    textAlign: "center",
    marginBottom: "28px",
  },
  iconWrap: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "64px",
    height: "64px",
    borderRadius: "20px",
    background: "linear-gradient(135deg, rgba(99,102,241,0.25), rgba(168,85,247,0.15))",
    border: "1px solid rgba(99,102,241,0.35)",
    marginBottom: "16px",
    boxShadow: "0 0 30px rgba(99,102,241,0.25)",
  },
  title: {
    fontSize: "28px",
    fontWeight: "800",
    color: "#f1f5f9",
    margin: "0 0 6px 0",
    letterSpacing: "-0.5px",
  },
  subtitle: {
    fontSize: "14px",
    color: "#64748b",
    margin: 0,
    fontWeight: "500",
  },
  card: {
    background: "linear-gradient(135deg, rgba(255,255,255,0.055) 0%, rgba(255,255,255,0.02) 100%)",
    border: "1px solid rgba(255,255,255,0.09)",
    borderRadius: "24px",
    padding: "36px 32px 28px",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    boxShadow: "0 25px 60px rgba(0,0,0,0.45), 0 0 0 1px rgba(99,102,241,0.08) inset",
    position: "relative",
    overflow: "hidden",
  },
  cardTopLine: {
    position: "absolute",
    top: 0,
    left: "15%",
    right: "15%",
    height: "1px",
    background: "linear-gradient(90deg, transparent, rgba(99,102,241,0.7), transparent)",
    borderRadius: "1px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  label: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#94a3b8",
    letterSpacing: "0.01em",
  },
  inputWrap: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  inputIcon: {
    position: "absolute",
    left: "14px",
    color: "#475569",
    display: "flex",
    alignItems: "center",
    pointerEvents: "none",
    zIndex: 1,
  },
  input: {
    width: "100%",
    background: "rgba(15,20,40,0.6)",
    border: "1px solid rgba(255,255,255,0.09)",
    borderRadius: "12px",
    padding: "12px 44px 12px 42px",
    fontSize: "14px",
    color: "#e2e8f0",
    outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s",
    fontFamily: "inherit",
  },
  inputFocus: {
    width: "100%",
    background: "rgba(15,20,40,0.6)",
    border: "1px solid rgba(99,102,241,0.55)",
    borderRadius: "12px",
    padding: "12px 44px 12px 42px",
    fontSize: "14px",
    color: "#e2e8f0",
    outline: "none",
    boxShadow: "0 0 0 3px rgba(99,102,241,0.15)",
    transition: "border-color 0.2s, box-shadow 0.2s",
    fontFamily: "inherit",
  },
  eyeBtn: {
    position: "absolute",
    right: "14px",
    background: "none",
    border: "none",
    color: "#475569",
    cursor: "pointer",
    padding: "0",
    display: "flex",
    alignItems: "center",
    transition: "color 0.2s",
  },
  btn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    padding: "13px 24px",
    marginTop: "6px",
    background: "linear-gradient(135deg, #6366f1 0%, #818cf8 100%)",
    border: "none",
    borderRadius: "12px",
    color: "#fff",
    fontSize: "15px",
    fontWeight: "700",
    cursor: "pointer",
    boxShadow: "0 4px 20px rgba(99,102,241,0.45)",
    transition: "all 0.25s ease",
    fontFamily: "inherit",
    letterSpacing: "0.01em",
  },
  btnHover: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    padding: "13px 24px",
    marginTop: "6px",
    background: "linear-gradient(135deg, #4f52e0 0%, #6366f1 100%)",
    border: "none",
    borderRadius: "12px",
    color: "#fff",
    fontSize: "15px",
    fontWeight: "700",
    cursor: "pointer",
    boxShadow: "0 6px 30px rgba(99,102,241,0.65)",
    transform: "translateY(-1px)",
    transition: "all 0.25s ease",
    fontFamily: "inherit",
    letterSpacing: "0.01em",
  },
  btnContent: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  spinner: {
    animation: "spin 0.8s linear infinite",
  },
  footNote: {
    textAlign: "center",
    fontSize: "12px",
    color: "#334155",
    marginTop: "20px",
    marginBottom: "0",
    letterSpacing: "0.04em",
    fontWeight: "500",
  },
};

export default Login;
