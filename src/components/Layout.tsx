import { ReactNode, useEffect, useState } from "react";
import Lenis from "lenis";
import { useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, ArrowUp } from "lucide-react";
import BookingModal from "./BookingModal";

export default function Layout({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const [showTop, setShowTop] = useState(false);

  // Scroll to top on every route change
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);

  // Smooth scroll with Lenis
  useEffect(() => {
    const lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    let raf = 0;
    const loop = (t: number) => { lenis.raf(t); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); lenis.destroy(); };
  }, []);

  // Show back-to-top after scrolling 400px
  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      <main className="flex-1">{children}</main>
      <BookingModal />

      {/* Floating buttons — stacked right */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-center gap-3">

        {/* Back to top — appears after scroll */}
        <AnimatePresence>
          {showTop && (
            <motion.button
              initial={{ opacity: 0, y: 12, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.8 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              onClick={scrollTop}
              aria-label="Retour en haut"
              className="w-11 h-11 bg-background border border-border text-foreground grid place-items-center shadow-lg hover:border-primary hover:text-primary transition-colors">
              <ArrowUp className="w-4 h-4" />
            </motion.button>
          )}
        </AnimatePresence>

        {/* WhatsApp */}
        <motion.a
          href="https://api.whatsapp.com/send/?phone=212668686800"
          target="_blank" rel="noreferrer"
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ delay: 1.2, type: "spring" }}
          className="w-14 h-14 bg-primary text-white grid place-items-center shadow-2xl rounded-none"
          aria-label="WhatsApp">
          <Phone className="w-5 h-5" />
        </motion.a>
      </div>

      <Footer />
    </div>
  );
}
