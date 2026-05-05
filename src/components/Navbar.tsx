import { Link, NavLink, useLocation } from "react-router-dom";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { useState } from "react";
import { Menu, X, Sun, Moon, Phone } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import logoMark from "@/assets/medicalbay-logo-mark.png";

const links = [
  { to: "/", label: "Accueil" },
  { to: "/a-propos", label: "À Propos" },
  { to: "/dentisterie-esthetique", label: "Dentisterie" },
  { to: "/tourisme-medical", label: "Tourisme Médical" },
  { to: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { theme, toggle } = useTheme();
  const { scrollY } = useScroll();
  const { pathname } = useLocation();
  useMotionValueEvent(scrollY, "change", (v) => setScrolled(v > 30));

  return (
    <>
      <motion.header
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
          scrolled ? "bg-background/80 backdrop-blur-xl border-b border-border/60" : "bg-transparent"
        }`}
      >
        <div className="container flex items-center justify-between h-20">
          <Link to="/" className="flex items-center gap-3 group">
            <motion.div whileHover={{ rotate: -8, scale: 1.05 }} className="w-10 h-10 rounded-full bg-primary grid place-items-center overflow-hidden">
              <img src={logoMark} alt="Medical Bay" className="w-7 h-7 brightness-0 invert" />
            </motion.div>
            <div className="leading-none">
              <div className="font-display font-extrabold tracking-[0.18em] text-sm">MEDICAL BAY</div>
              <div className="text-[9px] tracking-[0.3em] uppercase text-muted-foreground mt-1">Partenaire de santé</div>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  `relative px-4 py-2 text-xs uppercase tracking-[0.2em] font-medium transition-colors ${
                    isActive ? "text-primary" : "text-foreground/70 hover:text-foreground"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {l.label}
                    {isActive && (
                      <motion.span layoutId="navdot" className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <button onClick={toggle} aria-label="Thème" className="w-10 h-10 grid place-items-center border border-border hover:border-primary transition-colors">
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <a href="tel:+212668686800" className="hidden md:inline-flex btn-primary !py-3 !px-5">
              <Phone className="w-3.5 h-3.5" /> Devis gratuit
            </a>
            <button onClick={() => setOpen(true)} className="lg:hidden w-10 h-10 grid place-items-center border border-border" aria-label="Menu">
              <Menu className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile sheet */}
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-[60] bg-ink text-cream flex flex-col p-8"
        >
          <div className="flex justify-between items-center">
            <span className="font-display tracking-[0.18em] text-sm">MENU</span>
            <button onClick={() => setOpen(false)} aria-label="Fermer"><X /></button>
          </div>
          <nav className="flex-1 flex flex-col justify-center gap-6">
            {links.map((l, i) => (
              <motion.div key={l.to} initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}>
                <Link to={l.to} onClick={() => setOpen(false)} className="display text-5xl text-cream hover:text-primary transition-colors">
                  {l.label}
                </Link>
              </motion.div>
            ))}
          </nav>
          <div className="text-xs tracking-[0.3em] uppercase text-cream/50">{pathname}</div>
        </motion.div>
      )}
    </>
  );
}
