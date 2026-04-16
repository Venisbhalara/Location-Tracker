import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { loginUser } from "../../services/api";
import toast from "react-hot-toast";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [lockTimeLeft, setLockTimeLeft] = useState(0);

  useEffect(() => {
    // Check if we are currently locked out from previous sessions/refreshes
    const checkLockStatus = () => {
      const lockUntil = localStorage.getItem("adminLockUntil");
      if (lockUntil) {
        const timeRemaining = parseInt(lockUntil) - Date.now();
        if (timeRemaining > 0) {
          setLockTimeLeft(Math.ceil(timeRemaining / 1000));
        } else {
          localStorage.removeItem("adminLockUntil");
          localStorage.removeItem("adminFailedAttempts");
        }
      }
    };
    
    checkLockStatus();
    
    const interval = setInterval(() => {
      const lockUntil = localStorage.getItem("adminLockUntil");
      if (lockUntil) {
        const timeRemaining = parseInt(lockUntil) - Date.now();
        if (timeRemaining > 0) {
          setLockTimeLeft(Math.ceil(timeRemaining / 1000));
        } else {
          setLockTimeLeft(0);
          localStorage.removeItem("adminLockUntil");
          localStorage.removeItem("adminFailedAttempts");
        }
      } else {
        setLockTimeLeft(0);
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await loginUser(form);
      
      // Reset attempts on successful login
      localStorage.removeItem("adminFailedAttempts");
      localStorage.removeItem("adminLockUntil");
      
      login(res.data.user, res.data.token);
      toast.success(`Welcome back, ${res.data.user.name}!`);
      navigate("/dashboard");
    } catch (err) {
      if (err.response?.status === 429) {
        // Backend blocked us
        const lockUntilTime = Date.now() + 15 * 60 * 1000;
        localStorage.setItem("adminLockUntil", lockUntilTime.toString());
        setLockTimeLeft(15 * 60);
        toast.error(err.response?.data?.message || "Too many attempts. Section locked.");
      } else {
        // Normal failure
        const currentAttempts = parseInt(localStorage.getItem("adminFailedAttempts") || "0") + 1;
        
        if (currentAttempts >= 5) {
          // Lock for 15 minutes locally as well
          const lockUntilTime = Date.now() + 15 * 60 * 1000;
          localStorage.setItem("adminLockUntil", lockUntilTime.toString());
          setLockTimeLeft(15 * 60);
          toast.error("You have entered wrong credentials 5 times. Section locked for 15 minutes.");
        } else {
          localStorage.setItem("adminFailedAttempts", currentAttempts.toString());
          const remaining = 5 - currentAttempts;
          toast.error(`${err.response?.data?.message || "Login failed."} You have ${remaining} attempts remaining.`);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // Only traditional email/password for Admin

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">🛡️</div>
          <h1 className="text-2xl font-bold text-white">Admin Access</h1>
          <p className="text-slate-400 mt-1 text-sm">Control Panel Authentication</p>
        </div>
        <div className="card">
          {lockTimeLeft > 0 ? (
            <div className="flex flex-col items-center justify-center p-6 text-center">
              <div className="text-red-500 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-red-500 mb-2">Access Locked</h2>
              <p className="text-slate-300 mb-6">
                Too many incorrect attempts. This section has been locked for your security.
              </p>
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl px-6 py-4 w-full">
                <p className="text-sm text-slate-400 mb-1">Try again in</p>
                <div className="text-3xl font-mono font-bold text-white tracking-wider">
                  {Math.floor(lockTimeLeft / 60).toString().padStart(2, '0')}:
                  {(lockTimeLeft % 60).toString().padStart(2, '0')}
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="label">Email address</label>
              <input
                name="email"
                type="email"
                required
                placeholder="your@gmail.com"
                className="input"
                value={form.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="label">Password</label>
              <input
                name="password"
                type="password"
                required
                placeholder="••••••••"
                className="input"
                value={form.password}
                onChange={handleChange}
              />
            </div>
            <button
              type="submit"
              className="btn-primary w-full mt-2"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
