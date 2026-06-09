import { motion, AnimatePresence } from "framer-motion";
import { useRef, useState } from "react";
import Layout from "@/components/Layout";
import { ArrowRight, Plus } from "lucide-react";
import veneer from "@/assets/veneer-macro.jpg";
import clinic from "@/assets/clinic-interior.jpg";
import { openBooking } from "@/components/BookingModal";
import smileMacro from "@/assets/smile-macro.jpg";
import blanchimentLaser from "@/assets/blanchiment-dentaire-laser-Belgique.jpg";

const treatments = [
  { id: "design",     label: "01 · DESIGN",     title: "DIGITAL SMILE DESIGN",      desc: "Le smile design est une technique qui permet d'améliorer le sourire. Le dentiste travaille sur la forme, la couleur et la position des dents pour obtenir un sourire plus harmonieux et esthétique.",                                                                                                                                                                    features: ["SIMULATION 3D", "ANALYSE FACIALE", "PERSONNALISATION TOTALE"], img: smileMacro },
  { id: "facettes",   label: "02 · FACETTES",   title: "FACETTES ZIRCON & E-MAX",   desc: "Les facettes dentaires sont de fines coques esthétiques en E-max ou Zircon posées sur la surface des dents pour corriger les imperfections, les espaces, les fractures ou la couleur. Elles offrent un sourire harmonieux, naturel et lumineux, avec une teinte personnalisée selon le résultat souhaité par le patient.",                                             features: ["ULTRA-FINES", "RENDU NATUREL", "DURABILITÉ EXTRÊME"],          img: veneer },
  { id: "couronne",   label: "03 · COURONNES",  title: "COURONNES ZIRCONIUM",        desc: "Les couronnes en zirconium offrent une restauration esthétique et durable, idéale pour retrouver un sourire élégant et naturel. Conçues sans métal, elles reproduisent parfaitement l'apparence de l'émail naturel tout en garantissant confort, solidité et finition haut de gamme.",                                                                                  features: ["SANS MÉTAL", "BIOCOMPATIBLE", "ESTHÉTIQUE PREMIUM"],           img: clinic },
  { id: "implant",    label: "04 · IMPLANTS",   title: "IMPLANTOLOGIE DENTAIRE",     desc: "Solution moderne et durable, l'implant dentaire remplace une dent manquante avec un rendu parfaitement naturel. Intégré avec précision dans l'os grâce à une racine en titane biocompatible, il offre confort, stabilité et élégance pour retrouver un sourire harmonieux en toute confiance.",                                                                         features: ["SOLUTION FIXE", "OS PRÉSERVÉ", "GARANTIE LONGUE DURÉE"],       img: "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&q=80&w=900" },
  { id: "protheses",  label: "05 · PROTHÈSES",  title: "PROTHÈSES CÉRAMIQUES",       desc: "La couronne en porcelaine, qu'elle soit céramo-métallique ou céramo-céramique, est une solution prothétique fixe hautement esthétique et durable. Elle permet de restaurer une dent endommagée, usée ou dévitalisée en lui redonnant sa forme, sa solidité et son apparence naturelle.",                                                                               features: ["HAUTE RÉSISTANCE", "TRANSLUCIDITÉ", "SOLIDITÉ PROUVÉE"],       img: "https://images.unsplash.com/photo-1598256989800-fe5f95da9787?auto=format&fit=crop&q=80&w=900" },
  { id: "aligneurs",  label: "06 · ALIGNEURS",  title: "ALIGNEURS",                  desc: "Les aligneurs sont des gouttières orthodontiques transparentes, conçues pour déplacer progressivement les dents et corriger leur alignement. Discrets, amovibles et confortables, ils constituent une alternative moderne aux appareils orthodontiques classiques.",                                                                                                      features: ["DISCRETS", "AMOVIBLES", "CONFORTABLES"],                       img: "https://images.unsplash.com/photo-1629909615184-74f495363b67?auto=format&fit=crop&q=80&w=900" },
  { id: "blanchiment",label: "07 · BLANCHIMENT",title: "BLANCHIMENT LASER",          desc: "Le blanchiment dentaire est un traitement esthétique qui vise à éclaircir la teinte des dents. Il permet de réduire les taches et de raviver l'éclat du sourire, avec un résultat variable selon chaque patient.",                                                                                                                                                     features: ["RÉSULTAT IMMÉDIAT", "SÉCURISÉ", "ÉCLAT DURABLE"],              img: blanchimentLaser },
];

// ─── HERO ─────────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section className="relative min-h-[85vh] flex items-end overflow-hidden bg-ink text-white">
      <motion.img src={veneer} alt="" initial={{ scale: 1.08 }} animate={{ scale: 1 }}
        transition={{ duration: 2, ease: "easeOut" }}
        className="absolute inset-0 w-full h-full object-cover opacity-35" />
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/70 to-ink/20" />

      <div className="container relative z-10 pb-24 pt-40">
        <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }}
          className="flex items-center gap-4 mb-12">
          <div className="w-10 h-px bg-primary" />
          <span className="text-[10px] tracking-[0.55em] uppercase font-black text-primary">Dentisterie Esthétique</span>
        </motion.div>
        <h1 className="display text-[clamp(52px,9vw,140px)] leading-[0.82] tracking-[-0.03em] text-white max-w-5xl">
          <motion.span initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.9, ease: [0.22, 1, 0.36, 1] }} className="block">L'excellence</motion.span>
          <motion.span initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.9, ease: [0.22, 1, 0.36, 1] }} className="block text-primary serif-it font-normal not-italic">sur-mesure.</motion.span>
        </h1>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="mt-12">
          <button onClick={openBooking} className="btn-primary group">
            PRENDRE RENDEZ-VOUS <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </motion.div>
      </div>
    </section>
  );
}

// ─── HOOK ─────────────────────────────────────────────────────────────────────
function Hook() {
  return (
    <section className="bg-background py-24 border-b border-border">
      <div className="container grid lg:grid-cols-3 gap-px bg-border border border-border">
        {[
          { n: "6", t: "Spécialités", d: "Du smile design à l'implantologie, tous vos besoins couverts." },
          { n: "3×", t: "Moins cher", d: "Tarifs jusqu'à 3 fois inférieurs à ceux pratiqués en Europe." },
          { n: "5j", t: "Résultats", d: "Des transformations complètes avant votre retour au pays." },
        ].map((s) => (
          <div key={s.n} className="bg-background p-12 group hover:bg-mist/60 transition-colors">
            <div className="display text-6xl text-primary mb-3">{s.n}</div>
            <div className="display text-lg mb-3 tracking-tight">{s.t}</div>
            <div className="text-muted-foreground text-sm font-light leading-relaxed">{s.d}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── TREATMENTS — Accordion ───────────────────────────────────────────────────
function TreatmentAccordion() {
  const [active, setActive] = useState<string>(treatments[0].id);

  return (
    <section className="bg-background border-b border-border">

      {/* ── Section header ─────────────────────────────────────── */}
      <div className="container py-24 border-b border-border">
        <div className="grid lg:grid-cols-12 gap-10 items-end">
          <div className="lg:col-span-7">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-8 h-px bg-primary" />
              <span className="text-[10px] tracking-[0.55em] uppercase font-black text-muted-foreground">Nos Spécialités</span>
            </div>
            <h2 className="display text-[clamp(40px,7vw,96px)] leading-[0.88] tracking-[-0.025em]">
              Précision<br /><em className="serif-it font-normal not-italic text-primary">absolue.</em>
            </h2>
          </div>
          <p className="lg:col-span-5 text-muted-foreground text-lg font-light leading-relaxed border-l-2 border-border pl-6">
            Chaque soin est calibré selon votre anatomie, votre teinte naturelle et vos objectifs esthétiques personnels.
          </p>
        </div>
      </div>

      {/* ── Accordion rows ─────────────────────────────────────── */}
      <div className="divide-y divide-border">
        {treatments.map((tr, i) => {
          const isOpen = active === tr.id;
          return (
            <div key={tr.id}>

              {/* Row trigger */}
              <button
                onClick={() => setActive(tr.id)}
                className="w-full flex items-center gap-6 md:gap-14 px-6 md:px-16 py-7 md:py-9 text-left group transition-colors hover:bg-mist/50"
              >
                {/* Ghost number */}
                <span className={`display text-5xl md:text-7xl font-black shrink-0 w-14 md:w-20 text-right transition-colors duration-300 ${isOpen ? "text-primary" : "text-foreground/8 group-hover:text-foreground/15"}`}>
                  {String(i + 1).padStart(2, "0")}
                </span>

                {/* Title */}
                <span className={`display text-xl sm:text-2xl md:text-4xl tracking-tight flex-1 transition-colors duration-300 ${isOpen ? "text-primary" : "group-hover:text-foreground"}`}>
                  {tr.title}
                </span>

                {/* Tag (hidden on xs) + toggle icon */}
                <div className="flex items-center gap-6 shrink-0">
                  <span className="hidden lg:block text-[9px] tracking-[0.4em] uppercase font-black text-muted-foreground/40">
                    {tr.label.replace(/^\d+\s·\s/, "")}
                  </span>
                  <motion.div
                    animate={{ rotate: isOpen ? 45 : 0 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className={`w-10 h-10 border flex items-center justify-center shrink-0 transition-colors duration-300 ${isOpen ? "border-primary text-primary bg-primary/8" : "border-border group-hover:border-primary group-hover:text-primary"}`}
                  >
                    <Plus className="w-4 h-4" />
                  </motion.div>
                </div>
              </button>

              {/* Expanded panel */}
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden border-t border-border"
                  >
                    <div className="grid lg:grid-cols-2 min-h-[400px]">

                      {/* Text side */}
                      <div className="flex flex-col justify-center p-8 md:p-14 lg:p-20 border-b lg:border-b-0 lg:border-r border-border">
                        <motion.div
                          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.15, duration: 0.5 }}>
                          <p className="text-lg text-muted-foreground font-light leading-relaxed mb-12">
                            {tr.desc}
                          </p>
                          <div className="flex flex-wrap gap-x-10 gap-y-6 mb-14">
                            {tr.features.map((f) => (
                              <div key={f} className="flex flex-col gap-2">
                                <div className="w-6 h-px bg-primary" />
                                <span className="text-[9px] font-black tracking-[0.35em] uppercase">{f}</span>
                              </div>
                            ))}
                          </div>
                          <button onClick={openBooking} className="btn-primary group self-start">
                            CONFIGURER CE SOIN
                            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                          </button>
                        </motion.div>
                      </div>

                      {/* Image side */}
                      <div className="relative overflow-hidden min-h-[280px] lg:min-h-0">
                        <motion.img
                          key={tr.id}
                          src={tr.img}
                          alt={tr.title}
                          initial={{ scale: 1.1, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                        {/* Teal corner accent */}
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary" />
                      </div>

                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          );
        })}
      </div>
    </section>
  );
}

// ─── PROCESS ─────────────────────────────────────────────────────────────────
function Process() {
  const steps = [
    { n: "01", t: "CONSULTATION", b: "Échange initial, étude de votre cas, devis transparent et sans engagement." },
    { n: "02", t: "PLANIFICATION", b: "Smile design numérique, choix des matériaux et validation des teintes." },
    { n: "03", t: "SOINS",         b: "Intervention dans nos cliniques partenaires avec protocole international." },
    { n: "04", t: "SUIVI",         b: "Accompagnement post-opératoire complet et garanties étendues." },
  ];
  return (
    <section className="bg-[hsl(var(--off))] py-32 border-y border-border">
      <div className="container">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-8 h-px bg-primary" />
          <span className="text-[10px] tracking-[0.55em] uppercase font-bold text-muted-foreground">Méthode</span>
        </div>
        <h2 className="display text-[clamp(40px,7vw,96px)] leading-[0.88] text-foreground mb-24">
          Un protocole<br /><em className="serif-it font-normal not-italic text-primary">millimétré.</em>
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-px bg-border border border-border">
          {steps.map((s, i) => (
            <motion.div key={s.n} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="bg-background p-12 hover:bg-primary transition-all duration-500 group">
              <div className="display text-6xl text-foreground/8 mb-8 group-hover:text-white/20 transition-colors">{s.n}</div>
              <h3 className="display text-xl mb-4 text-foreground group-hover:text-white tracking-tight transition-colors">{s.t}</h3>
              <p className="text-muted-foreground text-sm font-light leading-relaxed group-hover:text-white/70 transition-colors">{s.b}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── PRICE COMPARISON — Visual bars ──────────────────────────────────────────
const prices = [
  { soin: "Facettes porcelaine",   europe: "800 – 1 200 €",     maroc: "200 – 350 €",     pct: 25 },
  { soin: "Implant dentaire",      europe: "1 500 – 3 000 €",   maroc: "500 – 800 €",     pct: 30 },
  { soin: "Couronne zircone",      europe: "900 – 1 400 €",     maroc: "220 – 380 €",     pct: 28 },
  { soin: "Smile Design complet",  europe: "8 000 – 20 000 €",  maroc: "2 500 – 6 000 €", pct: 32 },
  { soin: "Blanchiment laser",     europe: "400 – 800 €",       maroc: "100 – 200 €",     pct: 25 },
  { soin: "Prothèse en zircone",   europe: "1 200 – 2 000 €",   maroc: "350 – 600 €",     pct: 30 },
];

function PriceComparison() {
  return (
    <section className="py-32 bg-background border-y border-border relative overflow-hidden">
      {/* Ghost watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden select-none">
        <span className="display text-[20vw] text-foreground/[0.025] font-black whitespace-nowrap tracking-tighter">
          −70%
        </span>
      </div>

      <div className="container relative">

        {/* ── Header ──────────────────────────────────────── */}
        <div className="grid lg:grid-cols-12 gap-12 items-end mb-20">
          <div className="lg:col-span-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-8 h-px bg-primary" />
              <span className="text-[10px] tracking-[0.55em] uppercase font-black text-muted-foreground">Transparence tarifaire</span>
            </div>
            <h2 className="display text-[clamp(36px,6vw,88px)] leading-[0.88] tracking-[-0.025em]">
              Jusqu'à 70%<br />moins cher<br />
              <em className="serif-it font-normal not-italic text-primary">qu'en Europe.</em>
            </h2>
          </div>
          <div className="lg:col-span-5 lg:col-start-8 flex flex-col gap-8">
            <p className="text-muted-foreground text-lg font-light leading-relaxed">
              Qualité internationale, cliniques certifiées, chirurgiens formés à l'étranger — sans le prix européen.
            </p>
            {/* Legend */}
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-3">
                <div className="w-6 h-2 bg-foreground/15 rounded-full" />
                <span className="text-[9px] tracking-[0.4em] uppercase font-black text-muted-foreground">En Europe</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-2 bg-primary rounded-full" />
                <span className="text-[9px] tracking-[0.4em] uppercase font-black text-primary">Medical Bay</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Bar rows ────────────────────────────────────── */}
        <div className="divide-y divide-border border-y border-border">
          {prices.map((row, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className="group grid lg:grid-cols-12 gap-x-10 gap-y-4 py-8 px-2 hover:bg-mist/50 transition-colors items-center"
            >
              {/* Treatment name */}
              <div className="lg:col-span-4 flex items-center gap-4">
                <span className="display text-2xl md:text-3xl tracking-tight group-hover:text-primary transition-colors">
                  {row.soin}
                </span>
              </div>

              {/* Bars */}
              <div className="lg:col-span-6 flex flex-col gap-3">
                {/* Europe bar */}
                <div className="flex items-center gap-4">
                  <span className="text-[8px] tracking-[0.4em] uppercase font-black text-foreground/30 w-20 shrink-0">EUROPE</span>
                  <div className="flex-1 h-7 bg-foreground/6 relative overflow-hidden">
                    <motion.div
                      className="h-full bg-foreground/12"
                      initial={{ width: 0 }}
                      whileInView={{ width: "100%" }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.08 + 0.2, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-foreground/35 line-through">
                      {row.europe}
                    </span>
                  </div>
                </div>

                {/* Medical Bay bar */}
                <div className="flex items-center gap-4">
                  <span className="text-[8px] tracking-[0.4em] uppercase font-black text-primary w-20 shrink-0">MEDICAL BAY</span>
                  <div className="flex-1 h-7 bg-primary/8 relative overflow-hidden">
                    <motion.div
                      className="h-full bg-primary"
                      initial={{ width: 0 }}
                      whileInView={{ width: `${row.pct}%` }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.08 + 0.4, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-ink z-10 mix-blend-multiply">
                      {row.maroc}
                    </span>
                  </div>
                </div>
              </div>

              {/* Saving badge */}
              <div className="lg:col-span-2 flex lg:justify-end">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 + 0.5, duration: 0.4 }}
                  className="flex flex-col items-center justify-center w-20 h-20 border-2 border-primary/30 group-hover:border-primary group-hover:bg-primary transition-all duration-300"
                >
                  <span className="display text-2xl text-primary group-hover:text-ink transition-colors leading-none">
                    -{100 - row.pct}%
                  </span>
                  <span className="text-[7px] tracking-[0.3em] uppercase font-black text-muted-foreground group-hover:text-ink/60 transition-colors mt-1">
                    économie
                  </span>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── Footer ──────────────────────────────────────── */}
        <div className="mt-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <p className="text-[10px] tracking-[0.3em] uppercase font-black text-muted-foreground/50">
            * Tarifs indicatifs · Devis personnalisé gratuit sous 24h
          </p>
          <button
            onClick={openBooking}
            className="btn-primary group shrink-0"
          >
            OBTENIR MON DEVIS EXACT
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

      </div>
    </section>
  );
}

// ─── CTA ─────────────────────────────────────────────────────────────────────
function CTA() {
  return (
    <section className="relative bg-background overflow-hidden border-t border-border">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <span className="display text-[18vw] text-foreground/[0.03] font-black whitespace-nowrap select-none tracking-tighter">SOURIRE</span>
      </div>
      <div className="container py-40 text-center relative">
        <div className="flex items-center justify-center gap-4 mb-10">
          <div className="w-8 h-px bg-primary" />
          <span className="text-[10px] tracking-[0.55em] uppercase font-black text-muted-foreground">Votre nouveau sourire</span>
          <div className="w-8 h-px bg-primary" />
        </div>
        <h2 className="display text-[clamp(48px,8vw,120px)] leading-[0.85] tracking-[-0.03em] mb-16 max-w-5xl mx-auto">
          Le futur se dessine<br /><em className="serif-it font-normal not-italic text-primary">aujourd'hui.</em>
        </h2>
        <button onClick={openBooking} className="btn-primary group !px-14 !py-6">
          COMMENCER MON ANALYSE <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </section>
  );
}

export default function Dentisterie() {
  return (
    <Layout>
      <Hero />
      <Hook />
      <TreatmentAccordion />
      <Process />
      <PriceComparison />
      <CTA />
    </Layout>
  );
}
