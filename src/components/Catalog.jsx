import { useState, useEffect } from "react";
import { categories, products } from "../data/products";
import ProductCard from "./ProductCard";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Catalog() {
  const [active, setActive] = useState("All");
  const [items, setItems] = useState(() => {
    try {
      const cached = localStorage.getItem("florist_products_cache");
      const parsed = cached ? JSON.parse(cached) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.warn("Could not read cached bouquets:", error);
      return [];
    }
  });
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    let activeRequest = true;

    fetch(`${API}/api/products`, { signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw new Error(`Products request failed: ${r.status}`);
        return r.json();
      })
      .then((data) => {
        if (!Array.isArray(data)) throw new Error("Products response must be an array");
        if (!activeRequest) return;

        setItems(data);
        try {
          localStorage.setItem("florist_products_cache", JSON.stringify(data));
        } catch (error) {
          console.warn("Could not cache bouquets:", error);
        }
      })
      .catch((error) => {
        if (error.name !== "AbortError") {
          console.error("Could not load admin bouquets:", error);
        }
      })
      .finally(() => {
        if (activeRequest) setChecking(false);
      });

    return () => {
      activeRequest = false;
      controller.abort();
    };
  }, []);

  const permanentNames = new Set(
    products.map((p) => p.name.trim().toLowerCase())
  );
  const adminProducts = items.filter(
    (p) => !permanentNames.has((p.name || "").trim().toLowerCase())
  );
  const bouquets = [...products, ...adminProducts];
  const shown = active === "All" ? bouquets : bouquets.filter((p) => p.category === active);

  return (
    <section className="section" id="shop">
      <p className="eyebrow">Our bouquets</p>
      <h2>Pick your favourite</h2>

      <div className="chips">
        {categories.map((c) => (
          <button key={c} className={c === active ? "chip on" : "chip"} onClick={() => setActive(c)}>{c}</button>
        ))}
      </div>

      <div className="grid">
        {shown.map((p) => <ProductCard key={p._id || p.id} p={p} />)}
      </div>
      {checking && <p className="catalog-status">Checking for new arrivals...</p>}
    </section>
  );
}