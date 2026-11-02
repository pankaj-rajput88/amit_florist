import { createContext, useContext, useState, useEffect, useCallback } from "react";
import AuthModal from "./components/AuthModal";

const API = import.meta.env.VITE_API_URL;
const KEY = "florist_user_token";
const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    try { return localStorage.getItem(KEY) || ""; } catch { return ""; }
  });
  const [user, setUser] = useState(null);
  const [modal, setModal] = useState(null); // null, "login" ya "signup"

  const save = (t) => {
    setToken(t);
    try { t ? localStorage.setItem(KEY, t) : localStorage.removeItem(KEY); } catch {}
  };

  const logout = useCallback(() => { save(""); setUser(null); }, []);
  const close = useCallback(() => setModal(null), []);

  // Page khulte hi check karo ki saved token abhi bhi sahi hai ya nahi
  useEffect(() => {
    if (!token) return;
    fetch(`${API}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(async (r) => {
        if (r.status === 401) return logout(); // token purana ya galat
        const d = await r.json();
        setUser(d.user);
      })
      .catch(() => {}); // server so raha ho to chup raho, token rehne do
  }, [token, logout]);

  // Login ya signup, dono yahi se
  const submit = async (mode, body) => {
    const res = await fetch(`${API}/api/auth/${mode}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Something went wrong");
    save(data.token);
    setUser(data.user);
    setModal(null);
  };

  return (
    <Ctx.Provider value={{ user, token, logout, openAuth: setModal }}>
      {children}
      {modal && <AuthModal mode={modal} setMode={setModal} onSubmit={submit} onClose={close} />}
    </Ctx.Provider>
  );
}