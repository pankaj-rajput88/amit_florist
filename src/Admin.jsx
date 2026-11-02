import { useState, useEffect, useRef } from "react";
import { categories } from "./data/products";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const cats = categories.filter((c) => c !== "All");
const empty = { name: "", price: "", category: cats[0], desc: "", tag: "", inStock: true };

export default function Admin() {
  const [token, setToken] = useState(localStorage.getItem("floristToken") || "");
  const [password, setPassword] = useState("");
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(empty);
  const [file, setFile] = useState(null);
  const fileInput = useRef(null);
  const [editId, setEditId] = useState(null); // None = naya bouquet, id = edit
  const [msg, setMsg] = useState("");

  const logout = () => { localStorage.removeItem("floristToken"); setToken(""); };

  // Token ke saath server ko request bhejne ka helper
  const api = async (path, opts = {}) => {
    const res = await fetch(`${API_URL}${path}`, {
      ...opts,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    });
    if (res.status === 401) { logout(); throw new Error("Session expired. Login again."); }
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Something went wrong");
    return data;
  };

  const load = () =>
    fetch(`${API_URL}/api/products`).then((r) => r.json()).then(setItems).catch(() => setMsg("Could not load"));

  useEffect(() => { if (token) load(); }, [token]);

  const login = async (e) => {
    e.preventDefault();
    setMsg("");
    try {
      const res = await fetch(`${API_URL}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      localStorage.setItem("floristToken", data.token);
      setToken(data.token);
      setPassword("");
    } catch (err) { setMsg(err.message || "Login failed"); }
  };

  const set = (k) => (e) =>
    setForm({ ...form, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value });

  // Add ya Update (editId hai to update, nahi to naya)
  const save = async (e) => {
    e.preventDefault();
    setMsg("");
    try {
      const data = new FormData();
      data.append("name", form.name);
      data.append("price", form.price);
      data.append("category", form.category);
      data.append("desc", form.desc);
      data.append("tag", form.tag);
      data.append("inStock", form.inStock);
      if (file) data.append("image", file);

      const res = await fetch(`${API_URL}${editId ? `/api/admin/products/${editId}` : "/api/admin/products"}`, {
        method: editId ? "PUT" : "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: data,
      });
      if (res.status === 401) { logout(); throw new Error("Session expired. Login again."); }
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Something went wrong");

      setMsg(editId ? "Updated ✓" : "Added ✓");
      setForm(empty);
      setFile(null);
      if (fileInput.current) fileInput.current.value = "";
      setEditId(null);
      load();
    } catch (err) { setMsg(err.message); }
  };

  const edit = (p) => {
    setForm({ name: p.name, price: p.price, category: p.category, desc: p.desc || "", tag: p.tag || "", inStock: p.inStock });
    setFile(null);
    if (fileInput.current) fileInput.current.value = "";
    setEditId(p._id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setForm(empty);
    setFile(null);
    if (fileInput.current) fileInput.current.value = "";
    setEditId(null);
  };

  const toggleStock = async (p) => {
    try { await api(`/api/admin/products/${p._id}`, { method: "PUT", body: JSON.stringify({ ...p, inStock: !p.inStock }) }); load(); }
    catch (err) { setMsg(err.message); }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this bouquet?")) return;
    try { await api(`/api/admin/products/${id}`, { method: "DELETE" }); load(); }
    catch (err) { setMsg(err.message); }
  };

  if (!token) {
    return (
      <div className="admin-wrap">
        <form className="admin-box" onSubmit={login}>
          <h1>Admin login</h1>
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <button className="btn primary" type="submit">Login</button>
          {msg && <p className="admin-msg">{msg}</p>}
        </form>
      </div>
    );
  }

  return (
    <div className="admin-wrap">
      <div className="admin-head">
        <h1>Bouquets ({items.length})</h1>
        <button className="btn ghost small" onClick={logout}>Logout</button>
      </div>

      <form className="admin-box" onSubmit={save}>
        <h2>{editId ? "Edit bouquet" : "Add new bouquet"}</h2>
        <input placeholder="Name" value={form.name} onChange={set("name")} required />
        <input type="number" min="0" placeholder="Price (₹)" value={form.price} onChange={set("price")} required />
        <select value={form.category} onChange={set("category")}>
          {cats.map((c) => <option key={c}>{c}</option>)}
        </select>
        <textarea rows="3" placeholder="Description" value={form.desc} onChange={set("desc")} />
        <input
          ref={fileInput}
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
        <select value={form.tag} onChange={set("tag")}>
          <option value="">No tag</option>
          <option>Latest</option>
          <option>Best seller</option>
        </select>
        <label className="check"><input type="checkbox" checked={form.inStock} onChange={set("inStock")} /> In stock</label>
        <div className="btn-row">
          <button className="btn primary" type="submit">{editId ? "Save changes" : "Add bouquet"}</button>
          {editId && <button type="button" className="btn ghost" onClick={cancelEdit}>Cancel</button>}
        </div>
        {msg && <p className="admin-msg">{msg}</p>}
      </form>

      <div className="admin-list">
        {items.map((p) => (
          <div className="admin-row" key={p._id}>
            <div>
              <b>{p.name}</b> <span className="muted">₹{p.price} · {p.category}{p.tag ? ` · ${p.tag}` : ""}</span>
              <div className={p.inStock ? "stock in" : "stock out"}>{p.inStock ? "In stock" : "Sold out"}</div>
            </div>
            <div className="row-actions">
              <button onClick={() => toggleStock(p)}>{p.inStock ? "Mark sold out" : "Mark in stock"}</button>
              <button onClick={() => edit(p)}>Edit</button>
              <button className="danger" onClick={() => remove(p._id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}