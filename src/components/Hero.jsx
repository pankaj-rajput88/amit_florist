import { Leaf, Truck, Heart, MessageCircle, ArrowRight } from "lucide-react";
import { shop, waLink } from "../config";

// Hero ki photo. Badalni ho to bas naam badal do (public/products/ ki file)
const photo = "/products/red-roses-golden-wrap.webp";

// Neeche ki 4 features wali strip
const perks = [
  [Leaf, "Fresh Flowers", "Picked and arranged daily"],
  [Truck, "Same Day Delivery", `Across ${shop.city}`],
  [Heart, "For Every Occasion", "Birthdays, love and more"],
  [MessageCircle, "Easy Ordering", "Just message us on WhatsApp"],
];

export default function Hero() {
  return (
    <section className="hb" id="top">
      <div className="hb-card">
        <div className="hb-text">
          <p className="hb-eyebrow">Fresh flowers · Same day delivery</p>
          <h1>
            Beautiful Bouquets
            <span className="hb-script">for Every Occasion</span>
          </h1>
          <p className="hb-lead">
            Whether it's love, friendship or celebration, our fresh flowers speak your heart.
          </p>
          <div className="hb-btns">
            <a className="btn primary" href="#shop">Shop Now <ArrowRight size={18} /></a>
            <a className="btn ghost" href={waLink("Hi! I want to order flowers.")} target="_blank" rel="noreferrer">
              Order on WhatsApp
            </a>
          </div>
        </div>

        <div className="hb-photo">
          <img src={photo} alt="Fresh red rose bouquet" fetchpriority="high" />
          <p className="hb-note">Flowers make everything better</p>
        </div>
      </div>

      <div className="hb-perks">
        {perks.map(([Icon, title, sub]) => (
          <div className="perk" key={title}>
            <span className="perk-ic"><Icon size={20} /></span>
            <div><b>{title}</b><small>{sub}</small></div>
          </div>
        ))}
      </div>
    </section>
  );
}