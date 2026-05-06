import { Link, NavLink, useLocation } from "react-router-dom";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { useState } from "react";
import { Menu, X, Calendar } from "lucide-react";
import logoMark from "@/assets/medicalbay-logo-mark.png";
import { openBooking } from "./BookingModal";
import { useLang, T } from "@/contexts/language";

export default function Navbar() {
  const [open, setOpen]         = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { lang, toggle: toggleLang } = useLang();
  const { scrollY }             = useScroll();
  const { pathname }            = useLocation();
  const n                       = T[lang].nav;

  useMotionValueEvent(scrollY, "change", (v) => setScrolled(v > 40));

  const links = [
    { to: "/",                       label: n.home    },
    { to: "/a-propos",               label: n.about   },
    { to: "/dentisterie-esthetique", label: n.dental  },
    { to: "/tourisme-medical",       label: n.tourism },
    { to: "/contact",                label: n.contact },
  ];

  return (
    <>
      <motion.header
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-background/92 backdrop-blur-xl border-b border-border/50 shadow-sm"
            : "bg-background/70 backdrop-blur-md border-b border-border/20"
        }`}
      >
        <div className="container flex items-center justify-between h-[72px]">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group shrink-0">
            <motion.div whileHover={{ scale: 1.04 }}
              className="w-11 h-11 bg-primary grid place-items-center shrink-0">
              <img src={logoMark} alt="Medical Bay" className="w-7 h-7 brightness-0 invert" />
            </motion.div>
            <div className="leading-none">
              <div className="font-display font-black tracking-[0.18em] text-[12px] uppercase text-foreground">
                MEDICAL BAY
              </div>
              <div className="text-[8px] tracking-[0.4em] uppercase mt-0.5 font-bold text-muted-foreground">
                Agadir · Maroc
              </div>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to}
                className={({ isActive }) =>
                  `relative px-4 py-2.5 text-[10px] uppercase tracking-[0.26em] font-bold transition-colors duration-200 ${
                    isActive ? "text-primary" : "text-foreground/50 hover:text-foreground"
                  }`
                }>
                {({ isActive }) => (
                  <>
                    {l.label}
                    {isActive && (
                      <motion.span layoutId="navline"
                        className="absolute bottom-0 left-4 right-4 h-0.5 bg-primary" />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Right controls */}
          <div className="flex items-center gap-2">
            {/* FR / EN toggle */}
            <button
              onClick={toggleLang}
              className="flex items-center gap-0 border border-border/70 overflow-hidden text-[10px] font-bold tracking-[0.15em] hover:border-primary transition-colors">
              <span className={`px-2.5 py-2 transition-colors ${lang === "fr" ? "bg-primary text-white" : "text-foreground/40 hover:text-foreground"}`}>
                FR
              </span>
              <span className={`px-2.5 py-2 transition-colors ${lang === "en" ? "bg-primary text-white" : "text-foreground/40 hover:text-foreground"}`}>
                EN
              </span>
            </button>

            <button onClick={openBooking}
              className="hidden md:inline-flex btn-primary !py-2.5 !px-5 gap-2">
              <Calendar className="w-3.5 h-3.5" /> {n.cta}
            </button>

            <button onClick={() => setOpen(true)}
              className="lg:hidden w-10 h-10 grid place-items-center border border-border/70 rounded-none transition-colors hover:border-primary"
              aria-label="Menu">
              <Menu className="w-4 h-4 text-foreground" />
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile menu */}
      {open && (
        <motion.div initial={{ opacity: 0, x: "100%" }} animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[60] bg-[hsl(var(--ink))] text-white flex flex-col p-8">

          <div className="flex justify-between items-center mb-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-primary grid place-items-center">
                <img src={logoMark} alt="" className="w-5 h-5 brightness-0 invert" />
              </div>
              <span className="font-display tracking-[0.3em] text-[10px] font-bold text-white/40 uppercase">{n.navLabel}</span>
            </div>
            <div className="flex items-center gap-3">
              {/* Lang toggle mobile */}
              <button onClick={toggleLang}
                className="flex items-center border border-white/20 overflow-hidden text-[10px] font-bold tracking-[0.15em]">
                <span className={`px-2.5 py-2 transition-colors ${lang === "fr" ? "bg-primary text-white" : "text-white/30"}`}>FR</span>
                <span className={`px-2.5 py-2 transition-colors ${lang === "en" ? "bg-primary text-white" : "text-white/30"}`}>EN</span>
              </button>
              <button onClick={() => setOpen(false)} aria-label="Fermer"
                className="w-10 h-10 border border-white/15 flex items-center justify-center hover:border-primary hover:text-primary transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <nav className="flex-1 flex flex-col justify-center gap-6">
            {links.map((l, i) => (
              <motion.div key={l.to} initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}>
                <Link to={l.to} onClick={() => setOpen(false)}
                  className="display text-[11vw] text-white hover:text-primary transition-colors leading-none block">
                  {l.label}
                </Link>
              </motion.div>
            ))}
          </nav>

          <div className="flex items-center justify-between pt-8 border-t border-white/10">
            <span className="text-[9px] tracking-[0.45em] uppercase text-white/20 font-bold">{pathname}</span>
            <button onClick={() => { openBooking(); setOpen(false); }}
              className="btn-primary !py-3 !px-6">
              <Calendar className="w-3.5 h-3.5" /> {n.cta}
            </button>
          </div>
        </motion.div>
      )}
    </>
  );
}
