import { useNavigate } from "react-router-dom";

export default function LoggedOut() {
  const navigate = useNavigate();

  return (
    <div className="auth-container">
      <main className="auth-card text-center">
        <div className="flex-col items-center w-full">
          {/* Status Badge */}
          <div className="relative flex items-center justify-center" style={{ marginBottom: "1.5rem" }}>
            <div style={{
              width: 64, height: 64, borderRadius: "50%",
              backgroundColor: "var(--surface-container)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 1px 3px rgba(46, 56, 77, 0.08)"
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: 28, color: "var(--primary)", fontVariationSettings: "'FILL' 1" }}>
                lock
              </span>
            </div>
            <div style={{
              position: "absolute", bottom: -4, right: -4,
              width: 24, height: 24, borderRadius: "50%",
              backgroundColor: "var(--secondary-container)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "var(--primary)"
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>check</span>
            </div>
          </div>

          <span className="font-label-sm" style={{ color: "var(--secondary)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>
            Session Concluded
          </span>
          <h1 className="font-headline-md" style={{ color: "var(--primary)", marginBottom: 8 }}>
            You’ve been securely signed out
          </h1>
          <p className="font-body-sm" style={{ color: "var(--on-surface-variant)", maxWidth: 360, margin: "0 auto 1.5rem", lineHeight: 1.6 }}>
            Your notes, reflections, and revisions have been encrypted and synchronized with your personal workspace.
          </p>

          {/* Audit Panel */}
          <div className="w-full text-left" style={{
            backgroundColor: "var(--surface-container-low)",
            borderRadius: 8, padding: "1rem", marginBottom: "1.5rem"
          }}>
            <div className="flex justify-between items-center" style={{ marginBottom: 8, paddingBottom: 6, borderBottom: "1px solid var(--surface-container-highest)" }}>
              <span className="font-label-sm" style={{ color: "var(--secondary)", textTransform: "uppercase" }}>Session Audit</span>
              <span className="font-code-sm flex items-center gap-1" style={{ color: "var(--primary)" }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "var(--secondary)" }} />
                Zero pending diffs
              </span>
            </div>
            <div className="flex-col gap-2">
              <div className="flex justify-between items-center font-body-sm">
                <span className="flex items-center gap-1" style={{ color: "var(--on-surface-variant)" }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 16, color: "var(--secondary)" }}>sync</span>
                  Status
                </span>
                <span style={{ fontWeight: 500, color: "var(--primary)" }}>Synchronized</span>
              </div>
              <div className="flex justify-between items-center font-body-sm">
                <span className="flex items-center gap-1" style={{ color: "var(--on-surface-variant)" }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 16, color: "var(--secondary)" }}>security</span>
                  Encryption
                </span>
                <span className="font-code-sm" style={{ color: "var(--primary)" }}>AES-256</span>
              </div>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex-col gap-2 w-full" style={{ marginBottom: "1.5rem" }}>
            <button className="btn-primary" style={{ padding: "0.75rem 1rem" }} onClick={() => navigate("/login")}>
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>login</span>
              <span>Sign Back In</span>
            </button>
            <button className="btn-secondary" style={{ padding: "0.75rem 1rem" }} onClick={() => navigate("/register")}>
              <span>Create Another Account</span>
            </button>
          </div>

          <div className="flex items-center gap-2 font-label-sm" style={{ marginTop: "1.5rem", color: "var(--secondary)", opacity: 0.7 }}>
            <span className="font-headline-sm" style={{ fontStyle: "italic", color: "var(--primary)" }}>You Notes</span>
            <span>—</span>
            <span style={{ textTransform: "uppercase" }}>Quiet Workspace</span>
          </div>
        </div>
      </main>
    </div>
  );
}
