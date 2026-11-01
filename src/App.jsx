import { MessageCircle } from "lucide-react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Catalog from "./components/Catalog";
import Footer from "./components/Footer";
import useEffects from "./hooks/useEffects";
import { waLink } from "./config";

export default function App() {
  useEffects(); // saare animations yahin se chalu hote hain

  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Catalog />
      </main>
      <Footer />
      <a className="wa-float" aria-label="Chat on WhatsApp" href={waLink("Hi! I want to order flowers.")} target="_blank" rel="noreferrer">
        <MessageCircle size={26} />
      </a>
    </>
  );
}