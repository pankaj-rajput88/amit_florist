import { shop } from "../config";

export default function Footer() {
  return (
    <footer className="footer" id="contact">
      <h3>{shop.name}</h3>
      <p>{shop.address}</p>
      <p>{shop.hours}</p>
      <p><a href={`tel:${shop.phone.replace(/\s/g, "")}`}>{shop.phone}</a></p>
      <small>© {new Date().getFullYear()} {shop.name}</small>
    </footer>
  );
}