import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../config";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  // Password strength calculation
  const lengthValid = password.length >= 8;
  const symbolValid = /[0-9!@#$%^&*(),.?":{}|<>]/.test(password);
  const score = !password ? 0 : (lengthValid && symbolValid && password.length >= 12 && /[A-Z]/.test(password)) ? 4 : (lengthValid && symbolValid) ? 3 : lengthValid ? 2 : 1;
  const strengthLabels = ["Minimum 8 characters", "Weak", "Fair", "Strong", "Very Strong"];
  const strengthColors = ["", "weak", "fair", "strong", "very-strong"];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!agreed) return;
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await axios.post(`${API_URL}/user/register`, { name, email, password });
      if (res.data.msg?.includes("successfully")) {
        setSuccess("Account created! Redirecting to sign in...");
        setTimeout(() => navigate("/login"), 1200);
      } else {
        setError(res.data.msg || "Registration failed");
      }
    } catch (err) {
      setError(err.response?.data?.msg || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <main className="auth-card">
        <div className="flex-col w-full">
          <div className="flex-col items-center justify-center text-center w-full">
            <div className="sidebar-logo" style={{ width: 48, height: 48, marginBottom: "1rem" }}>
              <span className="material-symbols-outlined" style={{ fontSize: 28, color: "var(--primary)" }}>edit_note</span>
            </div>
            <div style={{ marginBottom: "1.5rem", maxWidth: 380 }}>
              <h1 className="font-headline-md" style={{ color: "var(--on-surface)", marginBottom: 4 }}>
                Create your You Notes account
              </h1>
              <p className="font-body-sm" style={{ color: "var(--secondary)" }}>
                Begin writing, organizing, and capturing your thoughts in quiet clarity
              </p>
            </div>

            {error && <div className="alert-error w-full">{error}</div>}
            {success && <div className="alert-success w-full">{success}</div>}

            <form onSubmit={handleSubmit} className="flex-col gap-4 w-full">
              <div className="form-field">
                <label className="font-label-sm" style={{ color: "var(--on-surface-variant)" }}>Full Name</label>
                <div className="input-wrap">
                  <input
                    className="form-input input-with-right-icon"
                    type="text"
                    placeholder="Eleanor Vance"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                  <span className="material-symbols-outlined input-icon-right" style={{ pointerEvents: "none" }}>person</span>
                </div>
              </div>

              <div className="form-field">
                <label className="font-label-sm" style={{ color: "var(--on-surface-variant)" }}>Email Address</label>
                <div className="input-wrap">
                  <input
                    className="form-input input-with-right-icon"
                    type="email"
                    placeholder="eleanor@younotes.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <span className="material-symbols-outlined input-icon-right" style={{ pointerEvents: "none" }}>mail</span>
                </div>
              </div>

              <div className="form-field">
                <div className="flex justify-between items-center">
                  <label className="font-label-sm" style={{ color: "var(--on-surface-variant)" }}>Password</label>
                  <span className="font-label-sm" style={{ color: "var(--secondary)" }}>{strengthLabels[score]}</span>
                </div>
                <div className="input-wrap">
                  <input
                    className="form-input input-with-right-icon"
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
                    <span className="material-symbols-outlined">{showPassword ? "visibility_off" : "visibility"}</span>
                  </button>
                </div>

                {/* Password strength bars */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6, marginTop: 4 }}>
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className={`strength-bar ${i <= score ? strengthColors[score] : ""}`} />
                  ))}
                </div>

                <div className="flex items-center gap-4" style={{ marginTop: 4 }}>
                  <div className="font-label-sm flex items-center gap-1" style={{ color: lengthValid ? "var(--primary)" : "var(--secondary)" }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 14 }}>check_circle</span>
                    <span>8+ characters</span>
                  </div>
                  <div className="font-label-sm flex items-center gap-1" style={{ color: symbolValid ? "var(--primary)" : "var(--secondary)" }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 14 }}>check_circle</span>
                    <span>Includes symbol or number</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 text-left" style={{ paddingTop: 4 }}>
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  required
                  style={{ marginTop: 4, width: 16, height: 16, accentColor: "var(--primary-container)", cursor: "pointer" }}
                />
                <label className="font-body-sm" style={{ color: "var(--secondary)", cursor: "pointer", lineHeight: 1.4, userSelect: "none" }}>
                  I agree to the <a href="#" style={{ color: "var(--on-surface)", textDecoration: "underline" }}>Terms of Service</a> and acknowledge the <a href="#" style={{ color: "var(--on-surface)", textDecoration: "underline" }}>Privacy Policy</a>.
                </label>
              </div>

              <button className="btn-primary" type="submit" disabled={loading || !agreed} style={{ marginTop: 6 }}>
                {loading ? <div className="spinner" /> : (
                  <>
                    <span>Create Free Workspace</span>
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_forward</span>
                  </>
                )}
              </button>
            </form>

            <div style={{ marginTop: "1.5rem" }}>
              <p className="font-body-sm" style={{ color: "var(--secondary)" }}>
                Already have an account?{" "}
                <Link to="/login" className="font-label-md" style={{ color: "var(--on-surface)", textDecoration: "underline" }}>
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
