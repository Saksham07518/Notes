import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../config";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await axios.post(`${API_URL}/user/login`, { email, password });
      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("userName", res.data.name || "User");
        localStorage.setItem("userEmail", email);
        navigate("/notes");
      } else {
        setError(res.data.msg || "Login failed");
      }
    } catch (err) {
      setError(err.response?.data?.msg || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <main className="auth-card">
        <div className="flex-col w-full">
          {/* Header */}
          <div className="flex-col items-center text-center" style={{ marginBottom: "1.5rem" }}>
            <div className="sidebar-logo" style={{ width: 48, height: 48, marginBottom: "0.5rem" }}>
              <span className="material-symbols-outlined" style={{ fontSize: 28, color: "var(--primary)" }}>edit_note</span>
            </div>
            <div className="flex items-center gap-2" style={{
              padding: "2px 8px", borderRadius: 4,
              backgroundColor: "var(--surface-container)", color: "var(--on-surface-variant)",
              marginBottom: 6
            }}>
              <span className="font-label-sm" style={{ textTransform: "uppercase", letterSpacing: "0.1em" }}>You Notes v2.4</span>
              <span style={{ width: 4, height: 4, borderRadius: "50%", backgroundColor: "var(--secondary)" }}></span>
              <span className="font-label-sm" style={{ textTransform: "uppercase", letterSpacing: "0.1em" }}>Workspace</span>
            </div>
            <h1 className="font-headline-lg" style={{ color: "var(--primary)" }}>Welcome back</h1>
            <p className="font-body-sm" style={{ color: "var(--secondary)", maxWidth: 280, marginTop: 4 }}>
              Continue to your personal workspace and notes
            </p>
          </div>

          {error && <div className="alert-error">{error}</div>}

          <form onSubmit={handleSubmit} className="flex-col gap-4">
            <div className="form-field">
              <label className="font-label-md flex justify-between items-center" style={{ color: "var(--on-surface)" }}>
                <span>Email address</span>
                <span className="font-code-sm" style={{ color: "var(--secondary)", opacity: 0.7 }}>work or personal</span>
              </label>
              <div className="input-wrap">
                <span className="material-symbols-outlined input-icon-left">alternate_email</span>
                <input
                  className="form-input input-with-left-icon"
                  type="email"
                  placeholder="name@younotes.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-field">
              <div className="flex justify-between items-center">
                <label className="font-label-md" style={{ color: "var(--on-surface)" }}>Password</label>
                <a href="#forgot" className="font-label-sm" style={{ color: "var(--secondary)", textDecoration: "underline" }}>
                  Forgot password?
                </a>
              </div>
              <div className="input-wrap">
                <span className="material-symbols-outlined input-icon-left">lock_open</span>
                <input
                  className="form-input input-with-left-icon input-with-right-icon"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="input-icon-right"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <span className="material-symbols-outlined">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center" style={{ paddingTop: 2 }}>
              <label className="flex items-center gap-2" style={{ cursor: "pointer", userSelect: "none" }}>
                <input type="checkbox" style={{ width: 16, height: 16, accentColor: "var(--primary-container)" }} />
                <span className="font-body-sm" style={{ color: "var(--secondary)" }}>Remember this device</span>
              </label>
              <span className="font-code-sm flex items-center gap-1" style={{ color: "var(--secondary)", opacity: 0.6 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "rgba(46, 103, 0, 0.6)" }}></span>
                Encrypted
              </span>
            </div>

            <button className="btn-primary" type="submit" disabled={loading} style={{ marginTop: 4 }}>
              {loading ? <div className="spinner"></div> : (
                <>
                  <span>Sign In to You Notes</span>
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_forward</span>
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="flex-col items-center text-center gap-1" style={{ marginTop: "1.5rem", paddingTop: "1rem" }}>
            <p className="font-body-sm" style={{ color: "var(--secondary)" }}>
              Don't have an account?{" "}
              <Link to="/register" className="font-label-md" style={{ color: "var(--primary)", marginLeft: 4, textDecoration: "underline" }}>
                Create an account
              </Link>
            </p>
            <div className="flex items-center gap-2 font-label-sm" style={{ color: "var(--secondary)", opacity: 0.7, marginTop: 8 }}>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>lock</span>
                End-to-end encrypted
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>cloud_off</span>
                Offline ready
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
