import { useState } from "react";

const FONT = "'Inter', sans-serif";

const LIGHT = {
  bg: "#f5f6fa", surface: "#ffffff", border: "#e8eaef",
  text: "#1a1d23", textSub: "#6b7280", textMuted: "#9ca3af",
};
const DARK = {
  bg: "#0f1117", surface: "#1a1d2e", border: "#2a2d3e",
  text: "#f1f3f9", textSub: "#8b93a8", textMuted: "#555e72",
};

async function apiAuth(action, username, pin) {
  const res = await fetch("/api/auth", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, username, pin }),
  });
  return res.json();
}

export default function AuthScreen({ onLogin, dark }) {
  const T = dark ? DARK : LIGHT;
  const [mode, setMode]         = useState("login"); // "login" | "register"
  const [username, setUsername] = useState("");
  const [pin, setPin]           = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async () => {
    if (!username.trim() || !pin.trim()) { setError("Please enter a username and PIN."); return; }
    if (!/^\d{4,8}$/.test(pin)) { setError("PIN must be 4–8 digits."); return; }
    setLoading(true); setError("");
    try {
      const data = await apiAuth(mode, username.trim(), pin.trim());
      if (data.ok) {
        localStorage.setItem("dwt_token",    data.token);
        localStorage.setItem("dwt_username", data.username);
        onLogin(data.token, data.username);
      } else {
        setError(data.error || "Something went wrong.");
      }
    } catch {
      setError("Network error — check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight:"100vh", background:T.bg, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"24px", fontFamily:FONT }}>
      {/* Logo */}
      <div style={{ fontSize:52, marginBottom:8 }}>🏰</div>
      <div style={{ color:T.text, fontWeight:900, fontSize:24, marginBottom:4 }}>Disney Wait Times</div>
      <div style={{ color:T.textMuted, fontSize:13, marginBottom:36 }}>Your personal park companion</div>

      {/* Card */}
      <div style={{ background:T.surface, borderRadius:20, border:`1px solid ${T.border}`, padding:"28px 24px", width:"100%", maxWidth:360, boxShadow:"0 4px 24px rgba(0,0,0,0.08)" }}>
        {/* Mode toggle */}
        <div style={{ display:"flex", gap:4, background:T.bg, borderRadius:10, padding:3, marginBottom:24 }}>
          {[{ id:"login", label:"Sign In" }, { id:"register", label:"Create Account" }].map(m => (
            <button key={m.id} onClick={() => { setMode(m.id); setError(""); }} style={{
              flex:1, padding:"8px 0", borderRadius:8, border:"none",
              background: mode===m.id ? T.surface : "transparent",
              color: mode===m.id ? T.text : T.textMuted,
              fontFamily:FONT, fontWeight: mode===m.id ? 700 : 400,
              fontSize:13, cursor:"pointer",
              boxShadow: mode===m.id ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
              transition:"all 0.15s",
            }}>{m.label}</button>
          ))}
        </div>

        {/* Username */}
        <div style={{ marginBottom:14 }}>
          <label style={{ color:T.textSub, fontSize:11, fontWeight:600, textTransform:"uppercase", letterSpacing:1, fontFamily:FONT, display:"block", marginBottom:6 }}>
            Username
          </label>
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g,""))}
            placeholder="e.g. kristen"
            autoCapitalize="none"
            autoCorrect="off"
            style={{
              width:"100%", padding:"12px 14px", borderRadius:12,
              border:`1.5px solid ${T.border}`, background:T.bg,
              color:T.text, fontFamily:FONT, fontSize:15,
              outline:"none", boxSizing:"border-box",
            }}
          />
        </div>

        {/* PIN */}
        <div style={{ marginBottom:error ? 14 : 24 }}>
          <label style={{ color:T.textSub, fontSize:11, fontWeight:600, textTransform:"uppercase", letterSpacing:1, fontFamily:FONT, display:"block", marginBottom:6 }}>
            PIN (4–8 digits)
          </label>
          <input
            type="password"
            inputMode="numeric"
            pattern="[0-9]*"
            value={pin}
            onChange={e => setPin(e.target.value.replace(/\D/g,"").slice(0,8))}
            placeholder="••••"
            style={{
              width:"100%", padding:"12px 14px", borderRadius:12,
              border:`1.5px solid ${T.border}`, background:T.bg,
              color:T.text, fontFamily:FONT, fontSize:20,
              letterSpacing:6, outline:"none", boxSizing:"border-box",
            }}
          />
        </div>

        {/* Error */}
        {error && (
          <div style={{ background:"#fee2e2", borderRadius:10, padding:"10px 14px", marginBottom:16, color:"#991b1b", fontSize:13, fontFamily:FONT }}>
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            width:"100%", padding:"14px", borderRadius:14, border:"none",
            background: loading ? "#93c5fd" : "#2563eb",
            color:"#fff", fontFamily:FONT, fontWeight:700, fontSize:15,
            cursor: loading ? "default" : "pointer",
            transition:"background 0.2s",
          }}>
          {loading ? "Please wait…" : mode === "login" ? "Sign In" : "Create Account"}
        </button>

        {mode === "register" && (
          <div style={{ color:T.textMuted, fontSize:11, fontFamily:FONT, textAlign:"center", marginTop:14, lineHeight:1.5 }}>
            Your username and PIN are used to sync your favorites and settings across devices.
          </div>
        )}
      </div>

      <div style={{ color:T.textMuted, fontSize:11, fontFamily:FONT, marginTop:20, textAlign:"center" }}>
        Personal use only
      </div>
    </div>
  );
}
