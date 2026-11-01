import { Flower2, MessageCircle } from "lucide-react";
import { shop, waLink } from "../config";

export default function Navbar() {
  return (
    <header className="nav">
      <a href="#top" className="brand"><Flower2 size={22} /> {shop.name}</a>
      <nav className="nav-links">
        <a href="#shop">Shop</a>
        <a href="#contact">Contact</a>
      </nav>
      <a className="btn primary small" href={waLink("Hi! I want to order flowers.")} target="_blank" rel="noreferrer">
        <MessageCircle size={16} /> Order
      </a>
    </header>
  );
}