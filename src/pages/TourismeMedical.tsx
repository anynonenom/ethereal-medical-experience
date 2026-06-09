import { motion, useScroll, useTransform, useMotionValueEvent, AnimatePresence } from "framer-motion";
import { useRef, useState } from "react";
import Layout from "@/components/Layout";
import { Plane, Hotel, Building2, Stethoscope, ArrowRight, MapPin, CheckCircle2, Waves } from "lucide-react";
import coast from "@/assets/agadir-coast.png";
import luxury from "@/assets/luxury-stay.jpg";
import clinic from "@/assets/clinic-interior.jpg";
import { openBooking } from "@/components/BookingModal";

// ─── HERO ─────────────────────────────────────────────────────────────────────
function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const fade = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <section ref={ref} className="relative min-h-screen flex items-end overflow-hidden bg-ink text-white">
      <motion.img src={coast} alt="Agadir" style={{ y }}
        className="absolute inset-0 w-full h-[110%] object-cover opacity-35 " />
      <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/80 to-ink/30" />
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-transparent" />

      <motion.div style={{ opacity: fade }} className="container relative z-10 pb-24 pt-40">
        <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }}
          className="flex items-center gap-4 mb-12">
          <div className="w-10 h-px bg-primary" />
          <span className="text-[10px] tracking-[0.55em] uppercase font-black text-primary">Expérience Exclusive</span>
        </motion.div>
        <h1 className="display text-[clamp(52px,10vw,150px)] leading-[0.82] tracking-[-0.03em] text-white">
          <motion.span initial={{ opacity: 0, y: 70 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.9, ease: [0.22, 1, 0.36, 1] }} className="block">Soignez-vous,</motion.span>
          <motion.span initial={{ opacity: 0, y: 70 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.38, duration: 0.9, ease: [0.22, 1, 0.36, 1] }} className="block text-primary serif-it font-normal not-italic">vivez Agadir.</motion.span>
        </h1>
        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
          className="mt-10 max-w-2xl text-white/40 text-xl font-light leading-relaxed">
          Le luxe d'une destination balnéaire mondiale combiné à l'excellence des cliniques marocaines, orchestrés sur-mesure pour votre sérénité absolue.
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.0 }}
          className="mt-14 flex flex-wrap gap-5 items-center">
          <button onClick={openBooking} className="btn-primary group">
            DÉMARRER MON PROJET <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
          <div className="flex items-center gap-3 text-[10px] tracking-[0.4em] uppercase font-black text-white/30">
            <Waves className="w-4 h-4 text-primary" /> 300 JOURS DE SOLEIL
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}

// ─── HOOK ─────────────────────────────────────────────────────────────────────
function Hook() {
  return (
    <section className="bg-background py-24 border-b border-border">
      <div className="container grid lg:grid-cols-4 gap-px bg-border border border-border">
        {[
          { n: "3H",   t: "Depuis l'Europe",          d: "Paris, Lyon, Genève, Bruxelles — vol direct pour Agadir." },
          { n: "3×",   t: "Économies garanties",       d: "Tarifs jusqu'à 3× inférieurs aux prix européens." },
          { n: "5★",   t: "Hôtels sélectionnés",       d: "Riad de luxe ou resort balnéaire inclus dans votre séjour." },
          { n: "24/7", t: "Conciergerie dédiée",        d: "Un interlocuteur unique disponible tout au long de votre séjour." },
        ].map((s) => (
          <div key={s.n} className="bg-background p-12 hover:bg-mist/60 transition-colors group">
            <div className="display text-5xl text-primary mb-3">{s.n}</div>
            <div className="display text-base mb-3 tracking-tight">{s.t}</div>
            <div className="text-muted-foreground text-sm font-light leading-relaxed">{s.d}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── PILLARS ──────────────────────────────────────────────────────────────────
function Pillars() {
  const items = [
    { icon: Plane,       title: "LOGISTIQUE VIP",  body: "Transferts privés, accueil personnalisé à l'aéroport et conciergerie dédiée 24/7." },
    { icon: Hotel,       title: "SÉJOUR PALACE",   body: "Hôtels 5★ et riads de luxe pour une convalescence royale." },
    { icon: Building2,   title: "CLINIQUES ÉLITE", body: "Accès exclusif aux plateaux techniques les plus avancés du royaume." },
    { icon: Stethoscope, title: "CHIRURGIENS",      body: "Experts formés à l'international, reconnus pour leur précision et leur art." },
  ];
  return (
    <section className="py-32 bg-background border-b border-border">
      <div className="container">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-8 h-px bg-primary" />
          <span className="text-[10px] tracking-[0.55em] uppercase font-black text-muted-foreground">Notre Orchestration</span>
        </div>
        <h2 className="display text-[clamp(40px,7vw,96px)] leading-[0.88] tracking-[-0.025em] mb-24">
          Un parcours<br /><em className="serif-it font-normal not-italic text-primary">sans faille.</em>
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-px bg-border border border-border">
          {items.map((it, i) => (
            <motion.div key={it.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="bg-background p-12 group hover:bg-primary transition-all duration-700 relative overflow-hidden">
              <div className="absolute inset-0 opacity-0 group-hover:opacity-5 grid-lines transition-opacity" />
              <it.icon className="w-10 h-10 text-primary group-hover:text-ink mb-10 transition-colors relative z-10" />
              <h3 className="display text-xl mb-5 group-hover:text-ink tracking-tight transition-colors relative z-10">{it.title}</h3>
              <p className="text-muted-foreground group-hover:text-ink/70 text-sm font-light leading-relaxed transition-colors relative z-10">{it.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── JOURNEY — Cinematic scroll sequence ──────────────────────────────────────
const journeyCards = [
  { day: "J − 30", title: "ANALYSE",      body: "Étude confidentielle de votre dossier par nos chirurgiens partenaires. Réponse sous 48h.", img: clinic },
  { day: "J − 7",  title: "CONCIERGERIE", body: "Vols, hôtel, transfers — votre planning complet organisé à la perfection.", img: luxury },
  { day: "J  0",   title: "ARRIVÉE VIP",  body: "Accueil nominatif en zone VIP et transfert en véhicule de prestige jusqu'à l'hôtel.", img: coast },
  { day: "J + 1",  title: "SOINS",        body: "Prise en charge dans une clinique de classe mondiale. Chirurgiens formés à l'international.", img: clinic },
  { day: "J + 5",  title: "DÉPART",       body: "Résultats visibles, suivi post-opératoire assuré à distance. Vous repartez transformé.", img: luxury },
];

function HorizontalJourney() {
  const ref = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0);

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const progressWidth = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const next = Math.min(Math.floor(v * journeyCards.length), journeyCards.length - 1);
    setStep(next);
  });

  const c = journeyCards[step];

  return (
    <section ref={ref} className="bg-ink text-white relative" style={{ height: `${journeyCards.length * 100}vh` }}>
      <div className="sticky top-0 h-screen overflow-hidden">

        {/* ── Top progress bar ───────────────────────────── */}
        <motion.div style={{ width: progressWidth }}
          className="absolute top-0 left-0 h-[3px] bg-primary z-30 origin-left" />

        {/* ── Ghost step number ───────────────────────────── */}
        <div className="absolute inset-0 flex items-center justify-end pr-[5vw] pointer-events-none overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.span key={`ghost-${step}`}
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -60 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="display text-[28vw] text-white/[0.035] font-black leading-none select-none">
              {String(step + 1).padStart(2, "0")}
            </motion.span>
          </AnimatePresence>
        </div>

        {/* ── Main split grid ─────────────────────────────── */}
        <div className="grid lg:grid-cols-2 h-full">

          {/* Left — text panel */}
          <div className="flex flex-col justify-between px-8 py-12 lg:px-20 lg:py-16 relative z-10">

            {/* Header — always visible */}
            <div>
              <div className="flex items-center gap-4 mb-3">
                <div className="w-8 h-px bg-primary" />
                <span className="text-[10px] tracking-[0.55em] uppercase font-black text-primary">Le Parcours Patient</span>
              </div>
              <h2 className="display text-[clamp(28px,4.5vw,64px)] leading-[0.9] tracking-[-0.025em] text-white">
                De la décision<br />
                <em className="serif-it font-normal not-italic text-primary">au nouveau départ.</em>
              </h2>
            </div>

            {/* Animated step content */}
            <div className="flex-1 flex flex-col justify-center py-10">

              {/* Day badge */}
              <AnimatePresence mode="wait">
                <motion.div key={`day-${step}`}
                  initial={{ x: -24, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 24, opacity: 0 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="inline-flex items-center gap-3 mb-8">
                  <span className="w-2 h-2 bg-primary shrink-0" />
                  <span className="text-[11px] tracking-[0.55em] uppercase font-black text-primary/80">{c.day}</span>
                </motion.div>
              </AnimatePresence>

              {/* Title — clip-path reveal */}
              <div className="overflow-hidden mb-8">
                <AnimatePresence mode="wait">
                  <motion.h3 key={`title-${step}`}
                    initial={{ y: "100%" }}
                    animate={{ y: "0%" }}
                    exit={{ y: "-100%" }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="display text-[clamp(36px,7vw,96px)] leading-[0.88] tracking-[-0.025em] text-white">
                    {c.title}
                  </motion.h3>
                </AnimatePresence>
              </div>

              {/* Body */}
              <AnimatePresence mode="wait">
                <motion.p key={`body-${step}`}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
                  className="text-white/45 text-lg font-light leading-relaxed max-w-md">
                  {c.body}
                </motion.p>
              </AnimatePresence>
            </div>

            {/* Bottom — step dots + counter */}
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                {journeyCards.map((_, i) => (
                  <motion.div key={i}
                    animate={{ width: i === step ? 40 : 14, backgroundColor: i === step ? "hsl(var(--primary))" : "rgba(255,255,255,0.15)" }}
                    transition={{ duration: 0.4 }}
                    className="h-1 rounded-full" />
                ))}
              </div>
              <AnimatePresence mode="wait">
                <motion.span key={`counter-${step}`}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                  className="display text-sm text-white/20 tracking-widest">
                  {String(step + 1).padStart(2, "0")} / {String(journeyCards.length).padStart(2, "0")}
                </motion.span>
              </AnimatePresence>
            </div>
          </div>

          {/* Right — image */}
          <div className="hidden lg:block relative overflow-hidden border-l border-white/5">
            <AnimatePresence mode="wait">
              <motion.img key={`img-${step}`}
                src={c.img} alt={c.title}
                initial={{ opacity: 0, scale: 1.08 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.94 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0 w-full h-full object-cover"
              />
            </AnimatePresence>
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-ink/50 via-transparent to-transparent pointer-events-none" />
            {/* Teal bar at bottom */}
            <motion.div
              key={`bar-${step}`}
              initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
              transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="absolute bottom-0 left-0 right-0 h-1 bg-primary origin-left"
            />
          </div>

        </div>
      </div>

    </section>
  );
}

// ─── DESTINATION ─────────────────────────────────────────────────────────────
function Destination() {
  return (
    <section className="py-40 bg-background overflow-hidden border-t border-border">
      <div className="container grid lg:grid-cols-12 gap-20 items-center">
        <div className="lg:col-span-5">
          <div className="flex items-center gap-4 mb-8">
            <MapPin className="w-5 h-5 text-primary" />
            <span className="text-[10px] tracking-[0.55em] uppercase font-black text-muted-foreground">Destination Agadir</span>
          </div>
          <h2 className="display text-[clamp(40px,6vw,90px)] leading-[0.88] tracking-[-0.025em] mb-14">
            La baie<br /><em className="serif-it font-normal not-italic text-primary">qui régénère.</em>
          </h2>
          <p className="text-xl text-muted-foreground font-light leading-relaxed mb-16">
            Plus qu'une ville, un écosystème de guérison. Profitez d'un micro-climat unique au monde pour accélérer votre convalescence.
          </p>
          <div className="space-y-6">
            {["300 JOURS DE SOLEIL PAR AN", "FRONT DE MER DE 10 KM", "INFRASTRUCTURES DE SANTÉ MODERNES", "HÔTELLERIE INTERNATIONALE 5★"].map((text, i) => (
              <div key={i} className="flex items-center gap-5 text-[10px] tracking-[0.35em] uppercase font-black text-foreground/50 group">
                <CheckCircle2 className="w-5 h-5 text-primary group-hover:scale-110 transition-transform shrink-0" /> {text}
              </div>
            ))}
          </div>
        </div>

        <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
          className="lg:col-span-7 relative">
          <div className="aspect-video overflow-hidden shadow-2xl border border-border">
            <img src={coast} alt="Agadir Bay" className="w-full h-full object-cover  hover:-0 transition-all duration-[3s]" />
          </div>
          <div className="absolute -bottom-10 -left-10 bg-ink text-white p-12 shadow-2xl border border-white/5">
            <div className="display text-6xl mb-3 text-primary tracking-tighter">3H</div>
            <div className="text-[9px] tracking-[0.45em] uppercase text-white/30 font-black">DEPUIS L'EUROPE</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── CTA ─────────────────────────────────────────────────────────────────────
function CTA() {
  return (
    <section className="bg-primary relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{ backgroundImage: "repeating-linear-gradient(-50deg, transparent, transparent 60px, rgba(255,255,255,1) 60px, rgba(255,255,255,1) 61px)" }} />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <span className="display text-[18vw] text-white/[0.07] font-black whitespace-nowrap select-none tracking-tighter">AGADIR</span>
      </div>
      <div className="container relative text-center max-w-5xl py-40">
        <div className="flex items-center justify-center gap-4 mb-10">
          <div className="w-8 h-px bg-white/40" />
          <span className="text-[10px] tracking-[0.55em] uppercase font-bold text-white/60">Votre Transformation</span>
          <div className="w-8 h-px bg-white/40" />
        </div>
        <h2 className="display text-[clamp(48px,9vw,130px)] leading-[0.85] text-white mb-16">
          Le futur se dessine<br /><em className="serif-it font-normal not-italic text-white/80">maintenant.</em>
        </h2>
        <button onClick={openBooking}
          className="inline-flex items-center justify-center gap-2 px-16 py-7 bg-white text-primary font-bold tracking-[0.2em] text-[10px] uppercase transition-all hover:bg-[hsl(var(--cream))] group">
          PRENDRE RENDEZ-VOUS <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </section>
  );
}

export default function TourismeMedical() {
  return (
    <Layout>
      <Hero />
      <Hook />
      <Pillars />
      <HorizontalJourney />
      <Destination />
      <CTA />
    </Layout>
  );
}
