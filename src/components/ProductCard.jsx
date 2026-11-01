import { Flower2 } from "lucide-react";
import { useState } from "react";
import { waLink } from "../config";

export default function ProductCard({ p }) {
  const [imageState, setImageState] = useState({ src: p.image, loaded: false, failed: false });
  const imageLoaded = imageState.src === p.image && imageState.loaded;
  const imageFailed = imageState.src === p.image && imageState.failed;

  // Order button dabane par ye message WhatsApp me khulega
  const msg = `Hi! I'd like to order: ${p.name} (₹${p.price}). Delivery date and address: `;

  return (
    <article className="card">
      <div className={`card-img${p.image && !imageLoaded && !imageFailed ? " is-loading" : ""}`}>
        {p.image && !imageFailed ? (
          <img
            src={p.image}
            alt={p.name}
            loading="lazy"
            className={imageLoaded ? "is-loaded" : ""}
            onLoad={() => setImageState({ src: p.image, loaded: true, failed: false })}
            onError={() => setImageState({ src: p.image, loaded: false, failed: true })}
          />
        ) : (
          <Flower2 size={48} strokeWidth={1.2} />
        )}
        {p.tag && <span className="tag">{p.tag}</span>}
      </div>
      <div className="card-body">
        <h3>{p.name}</h3>
        <p className="muted">{p.desc}</p>
        <div className="card-foot">
          <b>{p.price === 0 ? "Price on request" : `₹${p.price}`}</b>
          {p.inStock ? (
            <a className="btn primary small" href={waLink(msg)} target="_blank" rel="noreferrer">Order</a>
          ) : (
            <span className="soldout">Sold out</span>
          )}
        </div>
      </div>
    </article>
  );
}