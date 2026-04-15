import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { registerUser, googleLogin } from "../services/api";
import { GoogleLogin } from '@react-oauth/google';
import toast from "react-hot-toast";

const Register = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
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
      toast.error(err.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    try {
      const res = await googleLogin({ credential: credentialResponse.credential });
      login(res.data.user, res.data.token);
      toast.success("Signed in with Google successfully!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Google registration failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    toast.error("Google Sign-In failed.");
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">📍</div>
          <h1 className="text-2xl font-bold text-white">Create an account</h1>
          <p className="text-slate-400 mt-1 text-sm">
            Start tracking in seconds
          </p>
        </div>
        <div className="card">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="label">Full name</label>
              <input
                name="name"
                type="text"
                required
                placeholder="vasu"
                className="input"
                value={form.name}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="label">Email address</label>
              <input
                name="email"
                type="email"
                required
                placeholder="vasu@gmail.com"
                className="input"
                value={form.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="label">
                Password{" "}
                <span className="text-slate-500 font-normal">
                  (min. 6 chars)
                </span>
              </label>
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
              {loading ? "Creating account..." : "Create Account"}
            </button>
            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-slate-700"></div>
              <span className="flex-shrink-0 mx-4 text-slate-500 text-sm">or</span>
              <div className="flex-grow border-t border-slate-700"></div>
            </div>
            <div className="flex justify-center w-full">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                useOneTap
                theme="filled_black"
                shape="rectangular"
                width="384"
                text="continue_with"
              />
            </div>
          </form>
          <p className="text-center text-sm text-slate-400 mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-indigo-400 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
