import { useState, useEffect } from "react";
import { X } from "lucide-react";

export default function AuthModal({ mode, setMode, onSubmit, onClose }) {
  const isSignup = mode === "signup";
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  // Esc dabane par band ho, aur peeche ka page scroll na ho
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const go = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await onSubmit(mode, isSignup ? form : { email: form.email, password: form.password });
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <div className="am-back" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <form className="am-box" onSubmit={go}>
        <button type="button" className="am-x" aria-label="Close" onClick={onClose}><X size={18} /></button>
        <h2>{isSignup ? "Create account" : "Welcome back"}</h2>
        <p className="muted">{isSignup ? "Sign up to save your details for faster orders." : "Login to your account."}</p>

        {isSignup && <input placeholder="Full name" value={form.name} onChange={set("name")} required autoComplete="name" />}
        <input type="email" placeholder="Email" value={form.email} onChange={set("email")} required autoComplete="email" />
        {isSignup && <input type="tel" placeholder="Phone (optional)" value={form.phone} onChange={set("phone")} autoComplete="tel" />}
        <input
          type="password"
          placeholder={isSignup ? "Password (min 8 characters)" : "Password"}
          value={form.password}
          onChange={set("password")}
          required
          minLength={isSignup ? 8 : undefined}
          autoComplete={isSignup ? "new-password" : "current-password"}
        />

        <button className="btn primary" type="submit" disabled={busy}>
          {busy ? "Please wait..." : isSignup ? "Sign up" : "Login"}
        </button>
        {busy && <p className="muted">Server jag raha ho to pehli baar 30-50 second lag sakte hain.</p>}
        {error && <p className="am-err">{error}</p>}

        <p className="am-switch">
          {isSignup ? "Already have an account?" : "New here?"}{" "}
          <button type="button" onClick={() => { setMode(isSignup ? "login" : "signup"); setError(""); }}>
            {isSignup ? "Login" : "Create account"}
          </button>
        </p>
      </form>
    </div>
  );
}