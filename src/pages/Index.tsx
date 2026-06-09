import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Star, Quote, Plus, Instagram, Heart, MessageCircle, Plane, Stethoscope, Check, ChevronLeft, ChevronRight } from "lucide-react";
import Layout from "@/components/Layout";
import agadirCoast from "@/assets/agadir-coast.jpg";
import clinic from "@/assets/clinic-interior.jpg";
import heroSmile from "@/assets/hero-smile.jpg";
import rect3 from "@/assets/rectangle-3.webp";
import rect4 from "@/assets/rectangle-4-2.webp";
import transitionBg from "@/assets/transition-bg.jpg";
import homepageImage from "@/assets/homepage-image.jpeg";
import agadirMarina from "@/assets/image2.jpeg";
import { openBooking } from "@/components/BookingModal";
import { useLang, T } from "@/contexts/language";

const serviceImgs = [heroSmile, clinic,
  "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&q=80&w=800",
  agadirCoast,
];
const serviceHrefs = ["/dentisterie-esthetique", "/dentisterie-esthetique", "/dentisterie-esthetique", "/tourisme-medical"];

// ─── HERO SLIDES ──────────────────────────────────────────────────────────────
const HERO_SLIDES = {
  fr: [
    /*{
      img: transitionBg,
      badge: "Medical Bay · Agadir, Maroc",
      line1: "Votre sourire",
      lineEm: "mérite mieux.",
      sub: "Dentisterie d'élite à Agadir — jusqu'à 70% moins cher qu'en Europe, avec séjour palace inclus.",
      cta1: "DEVIS GRATUIT · 24H",
      cta2: "Découvrir le séjour",
      ctaLink: "/tourisme-medical",
    },
    {
      img: clinic,
      badge: "Implantologie & Couronnes",
      line1: "Des résultats",
      lineEm: "à vie.",
      sub: "Implants Nobel Biocare posés par des chirurgiens formés en Europe. Résultats permanents, prix imbattables.",
      cta1: "DEVIS GRATUIT · 24H",
      cta2: "Voir les soins",
      ctaLink: "/dentisterie-esthetique",
    },*/
    {
      img: agadirMarina,
      badge: "Tourisme Médical · Agadir",
      line1: "Guérissez en",
      lineEm: "beauté.",
      sub: "300 jours de soleil, hôtels 5★ et conciergerie médicale. La convalescence réinventée.",
      cta1: "PLANIFIER MON SÉJOUR",
      cta2: "En savoir plus",
      ctaLink: "/tourisme-medical",
    },
    {
      img: rect4,
      badge: "Medical Bay · Accueil & Confort",
      line1: "Un cadre",
      lineEm: "d'exception.",
      sub: "Une clinique moderne au cœur d'Agadir, conçue pour votre confort et votre sérénité.",
      cta1: "DEVIS GRATUIT · 24H",
      cta2: "Découvrir la clinique",
      ctaLink: "/dentisterie-esthetique",
    },
    {
      img: rect3,
      badge: "Medical Bay · Consultation",
      line1: "Votre santé,",
      lineEm: "notre priorité.",
      sub: "Des consultations personnalisées avec des experts dédiés à votre bien-être.",
      cta1: "PRENDRE RENDEZ-VOUS",
      cta2: "En savoir plus",
      ctaLink: "/contact",
    },
  ],
  en: [
    /*{
      img: transitionBg,
      badge: "Medical Bay · Agadir, Morocco",
      line1: "Your smile",
      lineEm: "deserves better.",
      sub: "World-class dentistry in Agadir — up to 70% cheaper than in Europe, with a palace stay included.",
      cta1: "FREE QUOTE · 24H",
      cta2: "Discover the stay",
      ctaLink: "/tourisme-medical",
    },
    {
      img: clinic,
      badge: "Implantology & Crowns",
      line1: "Results that",
      lineEm: "last a lifetime.",
      sub: "Nobel Biocare implants placed by Europe-trained surgeons. Permanent results, unbeatable prices.",
      cta1: "FREE QUOTE · 24H",
      cta2: "View treatments",
      ctaLink: "/dentisterie-esthetique",
    },*/
    {
      img: agadirMarina,
      badge: "Medical Tourism · Agadir",
      line1: "Heal in",
      lineEm: "paradise.",
      sub: "300 days of sunshine, 5★ hotels, medical concierge. Convalescence, reinvented.",
      cta1: "PLAN MY STAY",
      cta2: "Learn more",
      ctaLink: "/tourisme-medical",
    },
    {
      img: rect4,
      badge: "Medical Bay · Reception",
      line1: "A world-class",
      lineEm: "environment.",
      sub: "A modern clinic in the heart of Agadir, designed for your comfort and peace of mind.",
      cta1: "FREE QUOTE · 24H",
      cta2: "Discover the clinic",
      ctaLink: "/dentisterie-esthetique",
    },
    {
      img: rect3,
      badge: "Medical Bay · Consultation",
      line1: "Your health,",
      lineEm: "our priority.",
      sub: "Personalised consultations with experts fully dedicated to your well-being.",
      cta1: "BOOK AN APPOINTMENT",
      cta2: "Learn more",
      ctaLink: "/contact",
    },
  ],
};

// ─── HERO ────────────────────────────────────────────────────────────────────
function Hero() {
  const { lang } = useLang();
  const h = T[lang].hero;
  const slides = HERO_SLIDES[lang];
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    const timer = setInterval(() => {
      setDirection(1);
      setCurrent((c) => (c + 1) % slides.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [slides.length]);

  const go = (dir: number) => {
    setDirection(dir);
    setCurrent((c) => (c + dir + slides.length) % slides.length);
  };

  const goTo = (i: number) => {
    setDirection(i > current ? 1 : -1);
    setCurrent(i);
  };

  const textVariants = {
    enter: (dir: number) => ({ opacity: 0, y: dir > 0 ? 40 : -40 }),
    center: { opacity: 1, y: 0 },
    exit: (dir: number) => ({ opacity: 0, y: dir > 0 ? -30 : 30 }),
  };

  const slide = slides[current];

  return (
    <section className="relative h-screen min-h-[640px] overflow-hidden bg-[hsl(var(--ink))]">

      {/* Background image crossfade */}
      <AnimatePresence initial={false}>
        <motion.img
          key={`img-${current}`}
          src={slide.img}
          initial={{ opacity: 0, scale: 1.06 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
      </AnimatePresence>

      {/* Gradient overlays */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "linear-gradient(to right, hsl(var(--ink) / 0.88) 0%, hsl(var(--ink) / 0.55) 55%, hsl(var(--ink) / 0.15) 100%)" }} />
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "linear-gradient(to top, hsl(var(--ink) / 0.65) 0%, transparent 50%)" }} />

      {/* Badge — pinned to top, always below navbar */}
      <div className="absolute top-[80px] sm:top-[88px] md:top-[96px] left-0 right-0 container z-10">
        <AnimatePresence mode="wait">
          <motion.div key={`badge-${current}`}
            initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.4 }}
            className="flex items-center gap-3">
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse shrink-0" />
            <span className="text-[10px] tracking-[0.55em] uppercase font-bold text-primary">{slide.badge}</span>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Main text — vertically centered in available space */}
      <div className="absolute inset-0 container flex items-center z-10">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={`text-${current}`}
            custom={direction}
            variants={textVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-3xl w-full mt-8 md:mt-4"
          >
            <h1 className="mb-4 sm:mb-6 md:mb-8">
              <span className="display block text-[clamp(36px,6vw,118px)] leading-[0.88] text-white">
                {slide.line1}
              </span>
              <span className="serif-it block text-[clamp(38px,6.5vw,122px)] leading-[1] text-primary">
                {slide.lineEm}
              </span>
            </h1>

            <p className="text-white/55 text-sm sm:text-base lg:text-xl font-light leading-relaxed max-w-sm mb-6 sm:mb-8 md:mb-12">
              {slide.sub}
            </p>

            <div className="flex flex-wrap gap-3 sm:gap-4">
              <button onClick={openBooking}
                className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-primary text-white font-bold tracking-[0.2em] text-[10px] uppercase transition-all hover:bg-[hsl(var(--teal-deep))] group">
                {slide.cta1} <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
              <Link to={slide.ctaLink}
                className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 border border-white/30 text-white text-[10px] uppercase tracking-[0.2em] font-bold transition-all hover:border-white hover:bg-white/10">
                {slide.cta2} <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom bar — pinned to bottom */}
      <div className="absolute bottom-0 left-0 right-0 container pb-6 sm:pb-8 md:pb-10 z-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">

          {/* Stats */}
          <div className="flex items-center gap-6 md:gap-12 pt-5 border-t border-white/15">
            {h.stats.map(([n, l]) => (
              <div key={l}>
                <div className="display text-xl md:text-2xl text-primary">{n}</div>
                <div className="text-[8px] tracking-[0.4em] uppercase text-white/40 font-bold mt-0.5">{l}</div>
              </div>
            ))}
          </div>

          {/* Slide controls */}
          <div className="flex items-center gap-4">
            <button onClick={() => go(-1)}
              className="w-10 h-10 border border-white/20 flex items-center justify-center text-white/50 hover:border-primary hover:text-primary transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2">
              {slides.map((_, i) => (
                <button key={i} onClick={() => goTo(i)}
                  className={`h-[3px] transition-all duration-400 ${i === current ? "w-8 bg-primary" : "w-3 bg-white/30 hover:bg-white/55"}`} />
              ))}
            </div>
            <button onClick={() => go(1)}
              className="w-10 h-10 border border-white/20 flex items-center justify-center text-white/50 hover:border-primary hover:text-primary transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── MARQUEE ─────────────────────────────────────────────────────────────────
function Marquee() {
  const { lang } = useLang();
  const items = T[lang].marquee;
  return (
    <div className="bg-primary py-4 overflow-hidden">
      <div className="flex animate-marquee whitespace-nowrap">
        {[...items, ...items].map((item, i) => (
          <span key={i} className="inline-flex items-center gap-6 mx-6 text-white text-[10px] tracking-[0.45em] uppercase font-bold shrink-0">
            {item}<span className="w-1.5 h-1.5 rounded-full bg-white/30 shrink-0" />
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── MANIFESTO ───────────────────────────────────────────────────────────────
function Manifesto() {
  const { lang } = useLang();
  const m = T[lang].manifesto;
  return (
    <section className="bg-background py-16 md:py-24 border-b border-border">
      <div className="container">
        <div className="grid lg:grid-cols-12 gap-16 items-center">
          <div className="lg:col-span-7">
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
              viewport={{ once: true }} className="flex items-center gap-4 mb-12">
              <div className="w-10 h-px bg-primary" />
              <span className="label">{m.label}</span>
            </motion.div>
            <motion.blockquote
              initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              className="serif-it text-[clamp(28px,4vw,60px)] leading-[1.15] text-foreground mb-10">
              "{m.quote}"
            </motion.blockquote>
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
              viewport={{ once: true }} transition={{ delay: 0.4 }}
              className="flex items-center gap-4">
              <div className="w-6 h-px bg-border" />
              <span className="text-[10px] tracking-[0.45em] uppercase font-bold text-muted-foreground">{m.attribution}</span>
            </motion.div>
          </div>
          <div className="lg:col-span-4 lg:col-start-9 space-y-8">
            {m.stats.map((s, i) => (
              <motion.div key={s.n}
                initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="stat-card">
                <div className="display text-4xl text-primary mb-2">{s.n}</div>
                <div className="text-muted-foreground text-sm font-light leading-snug">{s.t}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── SERVICES ─────────────────────────────────────────────────────────────────
function Services() {
  const { lang } = useLang();
  const sv = T[lang].services;
  const [hovered, setHovered] = useState(0);

  return (
    <section className="bg-[hsl(var(--off))] py-16 md:py-24 border-b border-border">
      <div className="container">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
          <div>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-8 h-px bg-primary" />
              <span className="label">{sv.label}</span>
            </div>
            <h2 className="display text-[clamp(38px,6vw,88px)] leading-[0.9] text-foreground">
              {sv.title} <span className="serif-it text-primary">{sv.titleEm}</span>
            </h2>
          </div>
          <Link to="/dentisterie-esthetique" className="btn-ghost-teal shrink-0 self-start md:self-auto">
            {sv.cta} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-start">
          <div className="divide-y divide-border">
            {sv.items.map((s, i) => (
              <Link key={s.n} to={serviceHrefs[i]}
                onMouseEnter={() => setHovered(i)}
                className="group flex items-start gap-6 py-9">
                <span className={`display leading-none font-bold shrink-0 transition-all duration-300 ${hovered === i ? "text-primary text-5xl" : "text-foreground/10 text-4xl"}`}>
                  {s.n}
                </span>
                <div className="flex-1 min-w-0 pt-1">
                  <div className="text-[9px] tracking-[0.4em] uppercase font-bold text-muted-foreground mb-2 group-hover:text-primary/70 transition-colors">{s.sub}</div>
                  <h3 className={`display text-[clamp(20px,2.8vw,38px)] leading-tight mb-3 transition-colors duration-300 ${hovered === i ? "text-primary" : "text-foreground"}`}>{s.title}</h3>
                  <p className="text-foreground/45 text-sm font-light leading-relaxed group-hover:text-foreground/65 transition-colors">{s.body}</p>
                </div>
                <motion.div animate={{ opacity: hovered === i ? 1 : 0, x: hovered === i ? 0 : -10 }}
                  transition={{ duration: 0.2 }} className="mt-3 shrink-0">
                  <ArrowRight className="w-5 h-5 text-primary" />
                </motion.div>
              </Link>
            ))}
          </div>

          <div className="hidden lg:block sticky top-24">
            <div className="relative overflow-hidden shadow-xl" style={{ aspectRatio: "3/4" }}>
              <AnimatePresence mode="wait">
                <motion.img key={hovered} src={serviceImgs[hovered]} alt={sv.items[hovered].title}
                  initial={{ opacity: 0, scale: 1.06 }} animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute inset-0 w-full h-full object-cover" />
              </AnimatePresence>
              <div className="absolute inset-0 bg-gradient-to-t from-[hsl(var(--ink))/60] to-transparent" />
              <div className="absolute top-0 left-0 right-0 h-1 bg-primary" />
              <div className="absolute bottom-8 left-8 right-8">
                <AnimatePresence mode="wait">
                  <motion.div key={`lbl-${hovered}`}
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }}>
                    <div className="text-[9px] tracking-[0.4em] uppercase font-bold text-white/50 mb-2">{sv.items[hovered].sub}</div>
                    <div className="display text-2xl text-white">{sv.items[hovered].title}</div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── TESTIMONIALS — carousel ──────────────────────────────────────────────────
function Testimonials() {
  const { lang } = useLang();
  const tm = T[lang].testimonials;
  const items = tm.items;
  const [[current, direction], setSlide] = useState<[number, number]>([0, 0]);

  const go = (dir: number) => {
    setSlide(([c]) => [(c + dir + items.length) % items.length, dir]);
  };

  const goTo = (i: number) => {
    setSlide(([c]) => [i, i >= c ? 1 : -1]);
  };

  const textVariants = {
    enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 60 : -60 }),
    center: { opacity: 1, x: 0 },
    exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -60 : 60 }),
  };

  const item = items[current];

  return (
    <section className="bg-background py-16 md:py-24 border-b border-border overflow-hidden">
      <div className="container">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-8 h-px bg-primary" />
              <span className="label">{tm.label}</span>
            </div>
            <h2 className="display text-[clamp(38px,6vw,88px)] leading-[0.9] text-foreground">
              {tm.title} <span className="serif-it text-primary">{tm.titleEm}</span>
            </h2>
          </div>
          <div className="flex items-center gap-3 self-start md:self-auto">
            <div className="flex -space-x-3">
              {items.slice(0, 4).map((t) => (
                <img key={t.name} src={t.img} alt={t.name}
                  className="w-10 h-10 rounded-full border-2 border-background object-cover" />
              ))}
            </div>
            <span className="text-[9px] tracking-[0.3em] uppercase font-bold text-muted-foreground ml-1">
              {lang === "fr" ? "1 500+ patients" : "1,500+ patients"}
            </span>
          </div>
        </div>

        {/* Carousel card */}
        <div className="relative overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={current}
              custom={direction}
              variants={textVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="grid md:grid-cols-[300px_1fr] border border-border bg-white"
            >
              {/* Left panel */}
              <div className="bg-[hsl(var(--mist))] p-10 md:p-12 flex flex-col justify-between border-b md:border-b-0 md:border-r border-border">
                <div>
                  <div className="display text-[80px] leading-none text-primary/10 font-black select-none">
                    0{current + 1}
                  </div>
                  <div className="flex gap-1 mt-4">
                    {Array.from({ length: item.stars }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-gold text-gold" />
                    ))}
                  </div>
                </div>
                <div>
                  <img src={item.img} alt={item.name}
                    className="w-14 h-14 rounded-full object-cover border-2 border-primary/25 mb-5" />
                  <div className="display text-xl text-foreground">{item.name}</div>
                  <div className="text-[9px] tracking-[0.35em] uppercase text-muted-foreground font-bold mt-1">{item.role}</div>
                  <div className="w-8 h-px bg-primary/40 my-3" />
                  <div className="text-[9px] tracking-[0.25em] uppercase text-primary font-bold">{item.treatment}</div>
                </div>
              </div>

              {/* Right panel — quote */}
              <div className="p-10 md:p-14 lg:p-16 flex flex-col justify-center min-h-[320px]">
                <Quote className="w-10 h-10 text-primary/15 mb-8" />
                <blockquote className="serif-it text-[clamp(20px,2.4vw,30px)] leading-[1.5] text-foreground/80">
                  "{item.quote}"
                </blockquote>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Controls row */}
        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {items.map((_, i) => (
              <button key={i} onClick={() => goTo(i)}
                className={`h-[3px] transition-all duration-300 ${i === current ? "w-10 bg-primary" : "w-4 bg-border hover:bg-foreground/25"}`}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={() => go(-1)}
              className="w-11 h-11 border border-border flex items-center justify-center text-foreground/40 hover:border-primary hover:text-primary transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={() => go(1)}
              className="w-11 h-11 border border-border flex items-center justify-center text-foreground/40 hover:border-primary hover:text-primary transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Bottom CTA */}
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
          viewport={{ once: true }} transition={{ delay: 0.3 }}
          className="mt-14 flex justify-center">
          <Link to="/contact" className="btn-primary group">
            {lang === "fr" ? "REJOINDRE NOS PATIENTS" : "JOIN OUR PATIENTS"} <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

// ─── PROCESS ─────────────────────────────────────────────────────────────────
function Process() {
  const { lang } = useLang();
  const p = T[lang].process;
  const icons = [MessageCircle, Check, Plane, Stethoscope];

  return (
    <section className="bg-[hsl(var(--off))] py-16 md:py-24 border-b border-border relative overflow-hidden">
      <div className="container relative">
        <div className="grid lg:grid-cols-12 gap-10 mb-14">
          <div className="lg:col-span-5">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-8 h-px bg-primary" />
              <span className="label">{p.label}</span>
            </div>
            <h2 className="display text-[clamp(38px,6vw,86px)] leading-[0.9] text-foreground">
              {p.title}<br /><span className="serif-it text-primary">{p.titleEm}</span>
            </h2>
          </div>
          <div className="lg:col-span-5 lg:col-start-8 flex items-end">
            <p className="text-foreground/45 text-lg font-light leading-relaxed">{p.sub}</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-6 relative">
          <div className="absolute top-[52px] left-[10%] right-[10%] h-px bg-border hidden lg:block" />
          {p.steps.map((s, i) => {
            const Icon = icons[i];
            return (
              <motion.div key={i}
                initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.6 }}
                className="group">
                <div className="w-[104px] h-[104px] border border-border group-hover:border-primary transition-all duration-500 flex items-center justify-center mb-10 relative z-10 bg-background">
                  <span className="display text-3xl text-primary">{i + 1}</span>
                </div>
                <div className="text-[9px] tracking-[0.45em] uppercase text-primary/50 font-bold mb-4">{s.n}</div>
                <h3 className="display text-xl text-foreground mb-4 group-hover:text-primary transition-colors duration-300">{s.title}</h3>
                <p className="text-foreground/40 text-sm font-light leading-relaxed group-hover:text-foreground/65 transition-colors">{s.body}</p>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-14 pt-10 border-t border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <p className="display text-2xl text-foreground/35">
            {p.nudge} <span className="serif-it text-primary">{p.nudgeEm}</span>
          </p>
          <button onClick={openBooking} className="btn-primary group shrink-0">
            {p.cta} <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </section>
  );
}

// ─── DESTINATION ─────────────────────────────────────────────────────────────
function Destination() {
  const { lang } = useLang();
  const d = T[lang].destination;
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);

  return (
    <section ref={ref} className="relative h-[85vh] min-h-[560px] overflow-hidden border-b border-border">
      <motion.div style={{ y: imgY }} className="absolute inset-0 z-0">
        <img src={agadirCoast} alt="Agadir" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[hsl(var(--ink))/75] via-[hsl(var(--ink))/30] to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[hsl(var(--ink))/65] to-transparent" />
      </motion.div>
      <div className="absolute inset-0 z-10 container flex flex-col justify-end pb-20 md:pb-28">
        <motion.div initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.85 }} className="max-w-2xl">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-8 h-px bg-primary" />
            <span className="text-[10px] tracking-[0.55em] uppercase font-bold text-primary">{d.label}</span>
          </div>
          <h2 className="display text-[clamp(40px,6.5vw,96px)] leading-[0.9] text-white mb-10">
            {d.title}<br /><span className="serif-it text-primary">{d.titleEm}</span>
          </h2>
          <p className="text-white/55 text-lg font-light leading-relaxed max-w-md mb-12">{d.body}</p>
          <div className="flex items-center gap-10">
            {d.stats.map(([n, l]) => (
              <div key={l}>
                <div className="display text-2xl text-primary">{n}</div>
                <div className="text-[9px] tracking-[0.3em] uppercase text-white/35 font-bold mt-1">{l}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── INSTAGRAM ────────────────────────────────────────────────────────────────
const igPosts = [
  { img: "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&q=80&w=700&h=700", likes: 312, comments: 18, featured: true },
  { img: "https://cdn.cosmos.so/f3d6c2fc-fb71-4e82-8fc0-308948ab02a5?format=jpeg", likes: 198, comments: 11, featured: false },
  { img: "https://images.unsplash.com/photo-1629909615184-74f495363b67?auto=format&fit=crop&q=80&w=700&h=700", likes: 245, comments: 22, featured: false },
  { img: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?auto=format&fit=crop&q=80&w=700&h=700", likes: 187, comments:  9, featured: false },
  { img: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?auto=format&fit=crop&q=80&w=700&h=700", likes: 421, comments: 34, featured: false },
  { img: "https://cdn.cosmos.so/ec40ae98-da16-401e-a462-3049783b84d7?format=jpeg", likes: 276, comments: 15, featured: false },
];

function InstagramSection() {
  const { lang } = useLang();
  const ig = T[lang].instagram;
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const gridY = useTransform(scrollYProgress, [0, 1], ["0%", "-8%"]);

  return (
    <div ref={ref} className="relative bg-[hsl(var(--off))]" style={{ minHeight: "120vh" }}>
      <div className="sticky top-0 h-screen overflow-hidden flex flex-col border-b border-border">
        <div className="container pt-14 pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-6 shrink-0">
          <div>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-8 h-px bg-primary" />
              <span className="label">{ig.label}</span>
            </div>
            <h2 className="display text-4xl sm:text-6xl md:text-7xl leading-[0.9] text-foreground">
              {ig.title} <span className="serif-it text-primary">{ig.titleEm}</span>
            </h2>
          </div>
          <a href="https://www.instagram.com/medicalbay.maroc/" target="_blank" rel="noreferrer"
            className="group inline-flex items-center gap-4 self-start sm:self-auto shrink-0">
            <div className="relative w-14 h-14 shrink-0">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-2xl"
                style={{ background: "conic-gradient(from 0deg, #f9ce34, #ee2a7b, #6228d7, #f9ce34)" }} />
              <div className="absolute inset-[3px] rounded-[10px] bg-white flex items-center justify-center">
                <motion.div animate={{ scale: [1, 1.12, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                  <Instagram className="w-6 h-6 text-foreground" />
                </motion.div>
              </div>
            </div>
            <div>
              <div className="display text-lg text-foreground">{ig.handle}</div>
              <div className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground font-bold mt-1 group-hover:text-primary transition-colors">{ig.follow}</div>
            </div>
          </a>
        </div>
        <motion.div style={{ y: gridY }}
          className="flex-1 container pb-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2 auto-rows-fr overflow-hidden">
          {igPosts.map((post, i) => (
            <motion.a key={i} href="https://www.instagram.com/medicalbay.maroc/" target="_blank" rel="noreferrer"
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: i * 0.07, duration: 0.6 }}
              whileHover={{ scale: 1.03, zIndex: 10 }}
              className={`group relative overflow-hidden bg-border/30 ${post.featured ? "col-span-2 row-span-2" : ""}`}>
              <img src={post.img} alt=""
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-[hsl(var(--ink))/55] via-transparent to-transparent" />
              <div className="absolute inset-0 bg-primary/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4">
                <span className="flex items-center gap-1.5 text-white font-bold text-sm"><Heart className="w-4 h-4 fill-white" />{post.likes}</span>
                <span className="flex items-center gap-1.5 text-white font-bold text-sm"><MessageCircle className="w-4 h-4 fill-white" />{post.comments}</span>
              </div>
            </motion.a>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

// ─── FAQ ─────────────────────────────────────────────────────────────────────
function FAQItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border last:border-0">
      <button onClick={() => setOpen(!open)}
        className="w-full py-7 flex items-center justify-between gap-8 text-left group">
        <div className="flex items-center gap-6">
          <span className="display text-sm text-primary/50 shrink-0 w-7">0{index + 1}</span>
          <span className="display text-lg md:text-xl text-foreground group-hover:text-primary transition-colors">{q}</span>
        </div>
        <motion.div animate={{ rotate: open ? 45 : 0 }}
          className="w-8 h-8 border border-border flex items-center justify-center shrink-0 group-hover:border-primary group-hover:text-primary transition-colors">
          <Plus className="w-4 h-4" />
        </motion.div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <p className="pb-8 pl-14 text-foreground/50 font-light leading-relaxed text-base">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FAQ() {
  const { lang } = useLang();
  const f = T[lang].faq;
  return (
    <section className="bg-background py-16 md:py-24 border-b border-border">
      <div className="container grid lg:grid-cols-12 gap-16 lg:gap-20">
        <div className="lg:col-span-4">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-8 h-px bg-primary" />
            <span className="label-primary">{f.label}</span>
          </div>
          <h2 className="display text-5xl md:text-6xl leading-[0.9] text-foreground mb-12">
            {f.title}<br /><span className="serif-it text-primary">{f.titleEm}</span>
          </h2>
          <Link to="/contact" className="btn-primary group">
            {f.cta} <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
        <div className="lg:col-span-8 border-t border-border pt-2">
          {f.items.map((item, i) => <FAQItem key={i} q={item.q} a={item.a} index={i} />)}
        </div>
      </div>
    </section>
  );
}

// ─── CTA ─────────────────────────────────────────────────────────────────────
function CTASection() {
  const { lang } = useLang();
  const c = T[lang].cta;
  return (
    <section className="bg-primary relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{ backgroundImage: "repeating-linear-gradient(-50deg, transparent, transparent 60px, rgba(255,255,255,1) 60px, rgba(255,255,255,1) 61px)" }} />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden select-none">
        <span className="display text-[18vw] text-white/[0.07] font-black whitespace-nowrap">MEDICAL BAY</span>
      </div>
      <div className="container relative py-20 md:py-32 text-center">
        <motion.div initial={{ opacity: 0, y: 36 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}>
          <div className="flex items-center justify-center gap-4 mb-12">
            <div className="w-8 h-px bg-white/40" />
            <span className="text-[10px] tracking-[0.55em] uppercase font-bold text-white/60">{c.label}</span>
            <div className="w-8 h-px bg-white/40" />
          </div>
          <h2 className="display text-[clamp(56px,11vw,160px)] leading-[0.85] text-white mb-6">{c.title}</h2>
          <p className="serif-it text-[clamp(18px,2.2vw,30px)] text-white/60 max-w-xl mx-auto mb-16 leading-relaxed">
            "{c.sub}"
          </p>
          <div className="flex flex-wrap justify-center gap-5">
            <button onClick={openBooking}
              className="inline-flex items-center justify-center gap-2 px-12 py-5 bg-white text-primary font-bold tracking-[0.2em] text-[10px] uppercase transition-all hover:bg-[hsl(var(--cream))] group">
              {c.cta1} <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </button>
            <a href="https://api.whatsapp.com/send/?phone=212668686800" target="_blank" rel="noreferrer"
              className="btn-ghost-white !px-12 !py-5">{c.cta2}</a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export default function Index() {
  return (
    <Layout>
      <Hero />
      <Marquee />
      <Manifesto />
      <Services />
      <Testimonials />
      <Process />
      <Destination />
      <FAQ />
      <CTASection />
    </Layout>
  );
}
