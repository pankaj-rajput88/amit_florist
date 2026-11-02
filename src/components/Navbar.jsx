import { useState, useEffect } from "react";
import { Flower2, MessageCircle, Menu, X, User } from "lucide-react";
import { shop, waLink } from "../config";
import { useAuth } from "../AuthContext";

const links = [["Home", "top"], ["Shop", "shop"], ["Contact", "contact"]];

export default function Navbar() {
  const { user, logout, openAuth } = useAuth();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("top");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-45% 0px -50% 0px" }
    );
    links.forEach(([, id]) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const order = waLink("Hi! I want to order flowers.");
  const firstName = user?.name?.split(" ")[0];

  return (
    <header className={`topbar${scrolled ? " scrolled" : ""}`}>
      <div className="topbar-in">
        <a href="#top" className="tb-brand"><Flower2 size={20} /> {shop.name}</a>

        <nav className="tb-links">
          {links.map(([label, id]) => (
            <a key={id} href={`#${id}`} className={active === id ? "on" : ""}>{label}</a>
          ))}
        </nav>

        <div className="tb-right">
          {/* Laptop par login / naam */}
          <div className="tb-auth">
            {user ? (
              <>
                <span className="tb-hi"><User size={15} /> {firstName}</span>
                <button className="tb-link" onClick={logout}>Logout</button>
              </>
            ) : (
              <button className="tb-link" onClick={() => openAuth("login")}>Login</button>
            )}
          </div>
          <a className="btn primary small" href={order} target="_blank" rel="noreferrer">
            <MessageCircle size={16} /> Order
          </a>
          <button className="tb-toggle" aria-label="Menu" onClick={() => setOpen(!open)}>
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="tb-menu">
          {links.map(([label, id]) => (
            <a key={id} href={`#${id}`} onClick={() => setOpen(false)}>{label}</a>
          ))}
          {user ? (
            <a href="#top" onClick={(e) => { e.preventDefault(); logout(); setOpen(false); }}>Logout ({firstName})</a>
          ) : (
            <a href="#top" onClick={(e) => { e.preventDefault(); openAuth("login"); setOpen(false); }}>Login / Sign up</a>
          )}
          <a className="btn primary" href={order} target="_blank" rel="noreferrer">Order on WhatsApp</a>
        </div>
      )}
    </header>
  );
}