import { ReactNode, useEffect } from "react";
import Lenis from "lenis";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Phone } from "lucide-react";

export default function Layout({ children }: { children: ReactNode }) {
  useEffect(() => {
    const lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    let raf = 0;
    const loop = (t: number) => { lenis.raf(t); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); lenis.destroy(); };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      <main className="flex-1">{children}</main>
      {/* Floating WhatsApp */}
      <motion.a
        href="https://api.whatsapp.com/send/?phone=212668686800"
        target="_blank" rel="noreferrer"
        initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.2, type: "spring" }}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-primary text-primary-foreground grid place-items-center shadow-[var(--shadow-glow)]"
        aria-label="WhatsApp"
      >
        <span className="absolute inset-0 rounded-full bg-primary/40 animate-pulse-ring" />
        <Phone className="w-5 h-5 relative" />
      </motion.a>
      <Footer />
    </div>
  );
}
