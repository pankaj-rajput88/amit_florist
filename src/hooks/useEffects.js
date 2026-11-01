import { useEffect } from "react";

// Ye sab cheezein scroll karne par ek-ek karke aayengi
const SELECTOR =
  ".hero > div:first-child > *, .hero-visual, .section .eyebrow, .section h2, .chips, .card, .footer > *";

export default function useEffects() {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const touch = window.matchMedia("(hover: none)").matches;
    const root = document.getElementById("root");
    let revealIO, focusIO, mo;

    // 1. Scroll reveal: screen par aate hi element dheere se upar aata hai
    if (!reduce) {
      revealIO = new IntersectionObserver(
        (entries) =>
          entries.forEach((e) => {
            if (e.isIntersecting) {
              e.target.classList.add("in");
              revealIO.unobserve(e.target);
            }
          }),
        { threshold: 0.12 }
      );

      // 2. Phone par: jo card screen ke beech me ho, wo halka chamakta hai
      if (touch) {
        focusIO = new IntersectionObserver(
          (entries) => entries.forEach((e) => e.target.classList.toggle("focus", e.isIntersecting)),
          { rootMargin: "-42% 0px -42% 0px" }
        );
      }

      // Naye elements (jaise server se aaye cards) ko bhi pakadta hai
      const tag = () => {
        document.querySelectorAll(SELECTOR).forEach((el) => {
          if (el.dataset.fx) return;
          el.dataset.fx = "1";
          const siblings = [...(el.parentElement?.children || [])].filter((c) => c.matches(SELECTOR));
          // Ek ke baad ek aaye, isliye thoda delay badhta jata hai
          el.style.setProperty("--d", Math.min(siblings.indexOf(el), 6) * 80 + "ms");
          el.classList.add("reveal");
          revealIO.observe(el);
          if (focusIO && el.matches(".card")) focusIO.observe(el);
        });
      };
      tag();
      mo = new MutationObserver(tag);
      mo.observe(root, { childList: true, subtree: true });
    }

    // 3. Card ke andar mouse ke peeche glow (sirf laptop par)
    const onMove = (e) => {
      if (e.pointerType !== "mouse") return;
      const card = e.target.closest?.(".card");
      if (!card) return;
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", e.clientX - r.left + "px");
      card.style.setProperty("--my", e.clientY - r.top + "px");
    };

    // 4. Button par jahan touch ho, wahin se circle phailta hai
    const onDown = (e) => {
      if (reduce) return;
      const btn = e.target.closest?.(".btn");
      if (!btn) return;
      const r = btn.getBoundingClientRect();
      const size = Math.max(r.width, r.height) * 2;
      const dot = document.createElement("span");
      dot.className = "ripple";
      dot.style.width = dot.style.height = size + "px";
      dot.style.left = e.clientX - r.left - size / 2 + "px";
      dot.style.top = e.clientY - r.top - size / 2 + "px";
      btn.appendChild(dot);
      dot.addEventListener("animationend", () => dot.remove());
    };

    // 5. Upar patli gradient line, jo scroll ke saath bharti hai
    const onScroll = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      h.style.setProperty("--p", max > 0 ? h.scrollTop / max : 0);
    };
    onScroll();

    document.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerdown", onDown);
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      revealIO?.disconnect();
      focusIO?.disconnect();
      mo?.disconnect();
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerdown", onDown);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);
}