import { Link, NavLink, useLocation } from "react-router-dom";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { useState } from "react";
import { Menu, X, Calendar, Mail, Phone, Facebook, Instagram, Linkedin, MapPin } from "lucide-react";
import logoMark from "@/assets/medicalbay-logo-mark.png";
import { openBooking } from "./BookingModal";
import { useLang, T } from "@/contexts/language";

const SOCIALS = [
  { Icon: Facebook,  href: "https://www.facebook.com/profile.php?id=100085861093531", label: "Facebook" },
  { Icon: Instagram, href: "https://www.instagram.com/medicalbay.maroc?igsh=eXQ2c2h6N2Q1eDI2", label: "Instagram" },
  { Icon: Linkedin,  href: "https://www.linkedin.com/company/medical-bay-agadir/about/?viewAsMember=true", label: "LinkedIn" },
  { Icon: MapPin,    href: "https://maps.app.goo.gl/zk7qt9Unm6VVznQY9", label: "Localisation" },
];

export default function Navbar() {
  const [open, setOpen]         = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { lang } = useLang();
  const { scrollY }             = useScroll();
  const { pathname }            = useLocation();
  const n                       = T[lang].nav;

  useMotionValueEvent(scrollY, "change", (v) => setScrolled(v > 40));

  // Transparent white header over the homepage hero (only at top, not scrolled).
  const transparent = pathname === "/" && !scrolled;

  const links = [
    { to: "/",                       label: n.home    },
    { to: "/a-propos",               label: n.about   },
    { to: "/dentisterie-esthetique", label: n.dental  },
    { to: "/tourisme-medical",       label: n.tourism },
    { to: "/packs",                  label: n.packs   },
    { to: "/contact",                label: n.contact },
  ];

  return (
    <>
      <motion.header
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-0 inset-x-0 z-50"
      >
        {/* ── Top utility bar (collapses on scroll) ─────────────────────── */}
        <motion.div
          animate={{ height: scrolled ? 0 : 64, opacity: scrolled ? 0 : 1 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="overflow-hidden bg-primary text-white hidden md:block"
        >
          <div className="container flex items-center justify-between h-[64px]">
            <div className="flex items-center gap-6 text-[15px] font-bold tracking-wide">
              <a href="mailto:contact@medicalbay.ma" className="flex items-center gap-2 text-white/95 hover:text-white transition-colors">
                <Mail className="w-4 h-4" /> contact@medicalbay.ma
              </a>
              <span className="w-px h-4 bg-white/30" />
              <a href="https://api.whatsapp.com/send/?phone=212668686800" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-white/95 hover:text-white transition-colors">
                <Phone className="w-4 h-4" /> +212 668 68 68 00
              </a>
            </div>
            <div className="flex items-center gap-1">
              {SOCIALS.map(({ Icon, href, label }) => (
                <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label}
                  className="w-7 h-7 grid place-items-center rounded-full text-white/85 hover:bg-white/20 hover:text-white transition-colors">
                  <Icon className="w-3.5 h-3.5" />
                </a>
              ))}
              <span className="w-px h-4 bg-white/25 mx-2.5" />
              <button onClick={openBooking}
                className="bg-white text-primary text-[10px] tracking-[0.22em] uppercase font-bold px-4 py-1.5 hover:bg-white/85 transition-colors">
                {n.cta}
              </button>
            </div>
          </div>
        </motion.div>

        {/* ── Main nav row ──────────────────────────────────────────────── */}
        <div className={`transition-all duration-500 ${
          transparent
            ? "bg-transparent border-b border-transparent"
            : scrolled
              ? "bg-white/95 backdrop-blur-xl border-b border-border/60 shadow-sm"
              : "bg-background/80 backdrop-blur-md border-b border-border/20"
        }`}>
          <div className="container flex items-center justify-between h-[68px]">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group shrink-0">
              <motion.div whileHover={{ scale: 1.04 }}
                className="w-11 h-11 bg-primary grid place-items-center shrink-0">
                <img src={logoMark} alt="Medical Bay" className="w-7 h-7 brightness-0 invert" />
              </motion.div>
              <div className="leading-none">
                <div className={`font-display font-black tracking-[0.18em] text-[12px] uppercase transition-colors ${transparent ? "text-white" : "text-foreground"}`}>
                  MEDICAL BAY
                </div>
                <div className={`text-[8px] tracking-[0.4em] uppercase mt-0.5 font-bold transition-colors ${transparent ? "text-white/60" : "text-muted-foreground"}`}>
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
                      transparent
                        ? (isActive ? "text-white" : "text-white/70 hover:text-white")
                        : (isActive ? "text-primary" : "text-foreground/55 hover:text-foreground")
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

            {/* Right controls — CTA lives in the top bar to avoid duplication */}
            <div className="flex items-center gap-2">
              <button onClick={() => setOpen(true)}
                className={`lg:hidden w-10 h-10 grid place-items-center border rounded-none transition-colors hover:border-primary ${transparent ? "border-white/40" : "border-border/70"}`}
                aria-label="Menu">
                <Menu className={`w-4 h-4 transition-colors ${transparent ? "text-white" : "text-foreground"}`} />
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile menu */}
      {open && (
        <motion.div initial={{ opacity: 0, x: "100%" }} animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[60] bg-[hsl(var(--ink))] text-white flex flex-col p-8">

          <div className="flex justify-between items-center mb-12">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-primary grid place-items-center">
                <img src={logoMark} alt="" className="w-5 h-5 brightness-0 invert" />
              </div>
              <span className="font-display tracking-[0.3em] text-[10px] font-bold text-white/40 uppercase">{n.navLabel}</span>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Fermer"
              className="w-10 h-10 border border-white/15 flex items-center justify-center hover:border-primary hover:text-primary transition-colors">
              <X className="w-4 h-4" />
            </button>
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

          {/* Contact + socials in the mobile drawer */}
          <div className="pt-6 border-t border-white/10 space-y-4">
            <div className="flex flex-col gap-2 text-[11px] text-white/60">
              <a href="mailto:contact@medicalbay.ma" className="flex items-center gap-2.5 hover:text-primary transition-colors"><Mail className="w-3.5 h-3.5" /> contact@medicalbay.ma</a>
              <a href="https://api.whatsapp.com/send/?phone=212668686800" target="_blank" rel="noreferrer" className="flex items-center gap-2.5 hover:text-primary transition-colors"><Phone className="w-3.5 h-3.5" /> +212 668 68 68 00</a>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {SOCIALS.map(({ Icon, href, label }) => (
                  <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label}
                    className="w-9 h-9 border border-white/15 grid place-items-center text-white/70 hover:border-primary hover:text-primary transition-colors">
                    <Icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
              <button onClick={() => { openBooking(); setOpen(false); }}
                className="btn-primary !py-3 !px-6">
                <Calendar className="w-3.5 h-3.5" /> {n.cta}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </>
  );
}
