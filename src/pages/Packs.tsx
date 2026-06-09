import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import { ArrowRight, Check, ChevronDown, ArrowDown } from "lucide-react";
import Layout from "@/components/Layout";
import { createBooking } from "@/lib/crm-api";
import type { Booking } from "@/lib/crm-api";
import { toast } from "sonner";

// ─── DATA ─────────────────────────────────────────────────────────────────────
const packs = [
  {
    id: "implant",
    num: "01",
    name: "Implant",
    tagline: "Une solution fixe, naturelle et définitive.",
    desc: "Solution complète destinée aux patients souhaitant remplacer une ou plusieurs dents manquantes.",
    services: [
      "Consultation spécialisée",
      "Radiographie panoramique ou scanner",
      "Implant dentaire premium",
      "Pilier implantaire",
      "Couronne définitive",
      "Suivi post-opératoire",
      "Assistance Medical Bay",
    ],
    badge: null,
    highlight: false,
  },
  {
    id: "facettes",
    num: "02",
    name: "Facettes",
    tagline: "Transformez votre sourire sur mesure.",
    desc: "Traitement esthétique visant à transformer le sourire grâce à des facettes haut de gamme.",
    services: [
      "Étude esthétique du sourire",
      "Simulation du résultat",
      "Facettes E-Max ou Zircone",
      "Essayage et ajustements",
      "Suivi esthétique personnalisé",
    ],
    badge: "Le plus demandé",
    highlight: true,
  },
  {
    id: "dsd",
    num: "03",
    name: "Digital Smile Design",
    tagline: "Visualisez votre sourire avant de commencer.",
    desc: "Conception numérique du sourire avant traitement.",
    services: [
      "Analyse photographique et vidéo",
      "Scan intra-oral numérique",
      "Modélisation 3D du futur sourire",
      "Présentation du résultat avant intervention",
      "Plan de traitement personnalisé",
    ],
    badge: null,
    highlight: false,
  },
  {
    id: "zirconium",
    num: "04",
    name: "Couronnes Zirconium",
    tagline: "Esthétique et résistance durable.",
    desc: "Restauration esthétique et résistante pour les dents endommagées.",
    services: [
      "Diagnostic complet",
      "Préparation de la dent",
      "Couronne Zirconium haute esthétique",
      "Contrôle et ajustements",
      "Garantie qualité partenaire",
    ],
    badge: null,
    highlight: false,
  },
  {
    id: "ceramique",
    num: "05",
    name: "Couronnes Céramique",
    tagline: "Le naturel dans les moindres détails.",
    desc: "Solution esthétique reproduisant parfaitement l'apparence naturelle des dents.",
    services: [
      "Consultation spécialisée",
      "Empreinte numérique",
      "Fabrication sur mesure",
      "Pose et contrôle final",
      "Suivi clinique",
    ],
    badge: null,
    highlight: false,
  },
  {
    id: "aligneurs",
    num: "06",
    name: "Aligneurs Invisible Smile",
    tagline: "Alignez vos dents en toute discrétion.",
    desc: "Correction orthodontique discrète grâce à des gouttières transparentes.",
    services: [
      "Consultation orthodontique",
      "Scan numérique 3D",
      "Simulation du résultat final",
      "Série complète d'aligneurs",
      "Contrôles périodiques",
      "Suivi personnalisé",
    ],
    badge: null,
    highlight: false,
  },
];

// i = implant · f = facettes · d = digital smile design · z = zirconium · c = céramique · a = aligneurs
const comparisonRows = [
  { feature: "Consultation & diagnostic",       i: true,  f: true,  d: true,  z: true,  c: true,  a: true  },
  { feature: "Imagerie / scan numérique",       i: true,  f: false, d: true,  z: false, c: true,  a: true  },
  { feature: "Simulation du résultat",          i: false, f: true,  d: true,  z: false, c: false, a: true  },
  { feature: "Implant dentaire premium",        i: true,  f: false, d: false, z: false, c: false, a: false },
  { feature: "Facettes E-Max / Zircone",        i: false, f: true,  d: false, z: false, c: false, a: false },
  { feature: "Couronne sur mesure",             i: true,  f: false, d: false, z: true,  c: true,  a: false },
  { feature: "Aligneurs transparents",          i: false, f: false, d: false, z: false, c: false, a: true  },
  { feature: "Suivi personnalisé",              i: true,  f: true,  d: false, z: true,  c: true,  a: true  },
  { feature: "Garantie qualité partenaire",     i: false, f: false, d: false, z: true,  c: false, a: false },
];

// ─── STEP 1 · HERO ────────────────────────────────────────────────────────────
function Hero({ onStart }: { onStart: () => void }) {
  return (
    <section className="bg-white border-b border-border pt-36 pb-20 overflow-hidden relative">
      <div className="absolute -top-40 -right-40 w-[560px] h-[560px] rounded-full bg-primary/5 pointer-events-none" />

      <div className="container relative">
        {/* Step indicator */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-10">
          <div className="w-8 h-px bg-primary" />
          <span className="text-[10px] tracking-[0.55em] uppercase font-black text-primary">Formules tout inclus</span>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-16 items-end">
          <div>
            <h1 className="display leading-[0.88] tracking-[-0.03em]">
              <motion.span
                initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="block text-[clamp(44px,7.5vw,112px)] text-foreground">
                Choisissez
              </motion.span>
              <motion.span
                initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="block text-[clamp(46px,8vw,120px)] text-primary serif-it font-normal not-italic">
                votre pack.
              </motion.span>
            </h1>
            <motion.p
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-6 text-muted-foreground text-lg font-light leading-relaxed max-w-md">
              Soin, hôtel, transferts, coordinateur dédié, tout est inclus. Réservez en 2 minutes.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
              className="mt-10 flex items-center gap-4">
              <button onClick={onStart}
                className="inline-flex items-center gap-3 bg-primary text-white px-8 py-4 text-[10px] tracking-[0.25em] uppercase font-black hover:bg-[hsl(var(--teal-deep))] transition-colors group">
                VOIR LES FORMULES
                <ArrowDown className="w-4 h-4 transition-transform group-hover:translate-y-0.5" />
              </button>
              <span className="text-[9px] tracking-[0.3em] uppercase text-muted-foreground font-bold">Devis gratuit · 24h</span>
            </motion.div>
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-border border border-border">
            {[
              ["6",    "formules disponibles"],
              ["−70%", "vs tarifs européens"],
              ["5j",   "résultats visibles"],
              ["24h",  "devis garanti"],
            ].map(([n, l]) => (
              <div key={l} className="bg-white px-8 py-7">
                <div className="display text-[clamp(28px,4vw,48px)] text-primary font-black leading-none mb-1">{n}</div>
                <div className="text-[9px] tracking-[0.35em] uppercase text-muted-foreground font-bold">{l}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Funnel steps */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-16 pt-10 border-t border-border flex flex-wrap gap-6 md:gap-12">
          {[
            ["1", "Choisissez votre formule"],
            ["2", "Remplissez le formulaire"],
            ["3", "Reçu sous 24h par votre coordinateur"],
          ].map(([n, l]) => (
            <div key={n} className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <span className="text-[10px] font-black text-primary">{n}</span>
              </div>
              <span className="text-sm text-muted-foreground font-light">{l}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ─── STEP 2 · PACK SELECTOR ───────────────────────────────────────────────────
function PackSelector({
  selected, onSelect, formRef,
}: {
  selected: string;
  onSelect: (id: string) => void;
  formRef: React.RefObject<HTMLDivElement>;
}) {
  const pack = packs.find(p => p.id === selected)!;

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section className="bg-[hsl(var(--off,220_14%_97%))] py-20 md:py-28">
      <div className="container">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <span className="text-[10px] font-black text-primary">1</span>
          </div>
          <span className="text-[10px] tracking-[0.55em] uppercase font-black text-muted-foreground">Étape 1, Choisissez votre formule</span>
        </div>
        <h2 className="display text-[clamp(28px,4.5vw,64px)] leading-[0.9] tracking-[-0.025em] mb-10">
          Quelle formule<br />
          <em className="serif-it font-normal not-italic text-primary">vous correspond ?</em>
        </h2>

        {/* Pack tabs */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-8">
          {packs.map((p) => (
            <button
              key={p.id}
              onClick={() => onSelect(p.id)}
              className={`relative py-4 px-5 text-left border transition-all duration-300 ${
                selected === p.id
                  ? "bg-ink text-white border-ink"
                  : "bg-white text-foreground/50 border-border hover:border-foreground/20 hover:text-foreground"
              }`}>
              <div className={`display text-[11px] tracking-[0.3em] uppercase font-black mb-1 ${selected === p.id ? "text-primary" : "text-foreground/25"}`}>
                {p.num}
              </div>
              <div className={`display text-lg tracking-tight ${selected === p.id ? "text-white" : ""}`}>{p.name}</div>
              {p.badge && (
                <span className="absolute -top-2.5 right-3 text-[7px] tracking-[0.3em] uppercase bg-primary text-white px-2 py-0.5 font-black">
                  ★
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Active pack detail */}
        <AnimatePresence mode="wait">
          <motion.div
            key={pack.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="bg-white border border-border">

            {/* Header */}
            <div className="grid md:grid-cols-12 border-b border-border">
              <div className="md:col-span-7 p-8 md:p-12 border-b md:border-b-0 md:border-r border-border">
                <div className="flex items-baseline gap-4 mb-4">
                  <span className="display text-[64px] font-black text-foreground/5 leading-none">{pack.num}</span>
                  <div>
                    <h3 className="display text-[clamp(28px,4vw,56px)] tracking-tight leading-none">{pack.name}</h3>
                    {pack.badge && (
                      <span className="inline-block mt-2 text-[8px] tracking-[0.4em] uppercase font-black text-primary border border-primary/25 px-3 py-1">
                        ★ {pack.badge}
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-muted-foreground text-base font-light leading-relaxed">{pack.desc}</p>
              </div>
              <div className="md:col-span-5 p-8 md:p-12 flex flex-col justify-between gap-6">
                <div>
                  <div className="text-[9px] tracking-[0.4em] uppercase font-black text-muted-foreground/50 mb-3">
                    {pack.services.length} prestations incluses
                  </div>
                  <div className="w-10 h-[3px] bg-primary" />
                </div>
                <button
                  onClick={scrollToForm}
                  className="flex items-center justify-center gap-3 bg-primary text-white py-4 px-6 text-[10px] tracking-[0.25em] uppercase font-black hover:bg-[hsl(var(--teal-deep))] transition-colors group w-full">
                  RÉSERVER CE PACK
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </div>

            {/* Services */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 md:divide-x divide-border border-t border-border">
              {pack.services.map((s, si) => (
                <motion.div
                  key={s}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: si * 0.05, duration: 0.3 }}
                  className="flex items-center gap-4 px-8 py-5 border-b border-border last:border-b-0 sm:[&:nth-last-child(-n+2)]:border-b-0 lg:[&:nth-last-child(-n+3)]:border-b-0">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-primary" />
                  </div>
                  <span className="text-sm text-foreground/70 font-light">{s}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

// ─── STEP 3 · BOOKING FORM ────────────────────────────────────────────────────
function BookingForm({
  selectedPackId, formRef,
}: {
  selectedPackId: string;
  formRef: React.RefObject<HTMLDivElement>;
}) {
  const [packId, setPackId] = useState(selectedPackId);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({
    nom: "", prenom: "", email: "", phone: "", message: "",
  });

  // Sync when parent changes selection
  const packName = packs.find(p => p.id === packId)?.name ?? packId;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const now = new Date();
      const id = `BK-${Date.now()}`;
      const booking: Booking = {
        id,
        name: `${form.prenom} ${form.nom}`.trim(),
        email: form.email,
        phone: form.phone,
        service: `Pack ${packName}`,
        origin: "Packs page",
        dentist: "",
        date: now.toISOString().slice(0, 10),
        status: "Nouveau",
        notes: form.message || "",
        tags: [],
        source: "Site web",
        value: 0,
        contactLog: [],
        history: [{
          ts: now.toISOString(),
          action: `Réservation Pack ${packName}, via site web`,
        }],
      };
      await createBooking(booking);
      setDone(true);
      toast.success("Demande envoyée !", {
        description: "Votre coordinateur vous contacte sous 24h.",
      });
    } catch {
      toast.error("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section ref={formRef} className="bg-white border-y border-border py-20 md:py-28 scroll-mt-20">
      <div className="container">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <span className="text-[10px] font-black text-primary">2</span>
          </div>
          <span className="text-[10px] tracking-[0.55em] uppercase font-black text-muted-foreground">Étape 2, Votre demande</span>
        </div>
        <h2 className="display text-[clamp(28px,4.5vw,64px)] leading-[0.9] tracking-[-0.025em] mb-12">
          Réservez votre<br />
          <em className="serif-it font-normal not-italic text-primary">formule en 2 min.</em>
        </h2>

        <div className="grid lg:grid-cols-12 gap-12">
          {/* Form */}
          <div className="lg:col-span-7">
            {done ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                className="border border-primary/25 bg-primary/5 p-12 text-center">
                <div className="w-14 h-14 rounded-full bg-primary/15 flex items-center justify-center mx-auto mb-6">
                  <Check className="w-7 h-7 text-primary" />
                </div>
                <h3 className="display text-2xl mb-3">Demande envoyée !</h3>
                <p className="text-muted-foreground font-light">
                  Votre coordinateur Medical Bay vous contacte sous 24h pour confirmer votre <strong className="font-medium text-foreground">Pack {packName}</strong> et organiser votre séjour.
                </p>
                <button
                  onClick={() => { setDone(false); setForm({ nom: "", prenom: "", email: "", phone: "", message: "" }); }}
                  className="mt-8 text-[9px] tracking-[0.4em] uppercase font-bold text-primary underline underline-offset-4">
                  Nouvelle demande
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-7">
                {/* Pack selector inline */}
                <div>
                  <span className="text-[9px] tracking-[0.4em] uppercase text-muted-foreground font-bold block mb-3">FORMULE CHOISIE</span>
                  <div className="flex flex-wrap gap-2">
                    {packs.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setPackId(p.id)}
                        className={`px-5 py-2.5 text-[10px] tracking-[0.25em] uppercase font-black border transition-all ${
                          packId === p.id
                            ? "bg-ink text-white border-ink"
                            : "bg-transparent text-foreground/40 border-border hover:text-foreground hover:border-foreground/25"
                        }`}>
                        {p.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="h-px bg-border" />

                {/* Name row */}
                <div className="grid sm:grid-cols-2 gap-6">
                  {([
                    ["nom" as const,    "NOM",    "Dupont"],
                    ["prenom" as const, "PRÉNOM", "Jean"],
                  ] as const).map(([key, label, ph]) => (
                    <label key={key} className="block group">
                      <span className="text-[9px] tracking-[0.4em] uppercase text-muted-foreground group-focus-within:text-primary transition-colors font-bold">{label}</span>
                      <input required type="text" placeholder={ph} value={form[key]}
                        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                        className="w-full mt-2 bg-transparent border-b border-border py-3 outline-none focus:border-primary transition-colors text-sm font-light rounded-none placeholder:text-foreground/25" />
                    </label>
                  ))}
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <label className="block group">
                    <span className="text-[9px] tracking-[0.4em] uppercase text-muted-foreground group-focus-within:text-primary transition-colors font-bold">WHATSAPP / TÉL.</span>
                    <input required type="tel" placeholder="+33 6 00 00 00 00" value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="w-full mt-2 bg-transparent border-b border-border py-3 outline-none focus:border-primary transition-colors text-sm font-light rounded-none placeholder:text-foreground/25" />
                  </label>
                  <label className="block group">
                    <span className="text-[9px] tracking-[0.4em] uppercase text-muted-foreground group-focus-within:text-primary transition-colors font-bold">E-MAIL</span>
                    <input required type="email" placeholder="jean@gmail.com" value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full mt-2 bg-transparent border-b border-border py-3 outline-none focus:border-primary transition-colors text-sm font-light rounded-none placeholder:text-foreground/25" />
                  </label>
                </div>

                <label className="block group">
                  <span className="text-[9px] tracking-[0.4em] uppercase text-muted-foreground group-focus-within:text-primary transition-colors font-bold">
                    VOTRE PROJET <span className="opacity-40 normal-case tracking-normal font-normal">(optionnel)</span>
                  </span>
                  <textarea rows={3} placeholder="Dates souhaitées, questions, précisions…" value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full mt-2 bg-transparent border-b border-border py-3 outline-none focus:border-primary transition-colors text-sm font-light resize-none rounded-none placeholder:text-foreground/25" />
                </label>

                <button type="submit" disabled={loading}
                  className="w-full flex items-center justify-center gap-3 bg-primary text-white py-5 text-[10px] tracking-[0.25em] uppercase font-black hover:bg-[hsl(var(--teal-deep))] transition-colors group disabled:opacity-60">
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ENVOI EN COURS…
                    </>
                  ) : (
                    <>
                      <span className="hidden sm:inline">ENVOYER MA DEMANDE, </span>PACK {packName.toUpperCase()}
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </button>
                <p className="text-[9px] tracking-[0.25em] uppercase text-muted-foreground/50 font-bold text-center">
                  Gratuit · Sans engagement · Réponse sous 24h
                </p>
              </form>
            )}
          </div>

          {/* Right, reassurance */}
          <div className="lg:col-span-4 lg:col-start-9 space-y-8">
            {/* Selected pack summary */}
            <div className="border border-border p-6">
              <div className="text-[9px] tracking-[0.4em] uppercase font-black text-muted-foreground/50 mb-4">Votre sélection</div>
              <div className="flex items-baseline gap-3 mb-3">
                <span className="display text-2xl">{packs.find(p => p.id === packId)?.name}</span>
                {packs.find(p => p.id === packId)?.badge && (
                  <span className="text-[8px] tracking-[0.3em] uppercase font-black text-primary">★ Populaire</span>
                )}
              </div>
              <div className="w-6 h-px bg-primary mb-4" />
              <ul className="space-y-2">
                {packs.find(p => p.id === packId)?.services.slice(0, 4).map(s => (
                  <li key={s} className="flex items-center gap-2 text-sm text-muted-foreground font-light">
                    <Check className="w-3 h-3 text-primary shrink-0" />
                    {s}
                  </li>
                ))}
                {(packs.find(p => p.id === packId)?.services.length ?? 0) > 4 && (
                  <li className="text-[9px] tracking-[0.3em] uppercase font-bold text-primary">
                    +{(packs.find(p => p.id === packId)?.services.length ?? 0) - 4} autres prestations
                  </li>
                )}
              </ul>
            </div>

            {/* Trust points */}
            <div className="space-y-4">
              {[
                ["Réponse garantie sous 24h", "Un coordinateur dédié vous contacte."],
                ["Devis détaillé et transparent", "Aucun frais caché, tout est inclus."],
                ["Cliniques certifiées", "Partenaires médicaux sélectionnés."],
              ].map(([t, d]) => (
                <div key={t} className="flex items-start gap-3">
                  <div className="w-5 h-5 border border-primary/30 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-2.5 h-2.5 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-foreground">{t}</div>
                    <div className="text-xs text-muted-foreground font-light">{d}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* WhatsApp */}
            <a href="https://api.whatsapp.com/send/?phone=212668686800" target="_blank" rel="noreferrer"
              className="flex items-center justify-center gap-2 border border-border py-4 px-6 text-[9px] tracking-[0.3em] uppercase font-black text-muted-foreground hover:border-primary hover:text-primary transition-all w-full">
              PRÉFÉREZ WHATSAPP ?
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── COMPARISON ───────────────────────────────────────────────────────────────
function Comparison({ onSelect }: { onSelect: (id: string) => void }) {
  const cols = [
    { label: "Implant",      id: "implant"   },
    { label: "Facettes",     id: "facettes"  },
    { label: "Smile Design", id: "dsd"       },
    { label: "Zirconium",    id: "zirconium" },
    { label: "Céramique",    id: "ceramique" },
    { label: "Aligneurs",    id: "aligneurs" },
  ];

  const scrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <section className="bg-[hsl(var(--off,220_14%_97%))] border-b border-border py-24 md:py-32">
      <div className="container">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-8 h-px bg-primary" />
          <span className="text-[10px] tracking-[0.55em] uppercase font-black text-muted-foreground">Comparatif détaillé</span>
        </div>
        <h2 className="display text-[clamp(28px,4.5vw,64px)] leading-[0.9] tracking-[-0.025em] mb-4">
          Toujours indécis ?<br />
          <em className="serif-it font-normal not-italic text-primary">Comparez.</em>
        </h2>
        <p className="text-muted-foreground font-light mb-12">Cliquez sur une formule pour la sélectionner directement.</p>

        <div className="overflow-x-auto -mx-4 px-4">
          <table className="w-full min-w-[820px] border-collapse bg-white border border-border">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-5 px-6 w-[28%] bg-white">
                  <span className="text-[9px] tracking-[0.4em] uppercase font-black text-muted-foreground/40">Prestations</span>
                </th>
                {cols.map((c, ci) => (
                  <th key={c.id} className={`py-5 px-4 text-center ${ci === 1 ? "bg-primary/5" : "bg-white"}`}>
                    <button
                      onClick={() => { onSelect(c.id); scrollTop(); }}
                      className={`display text-sm tracking-tight block w-full hover:text-primary transition-colors ${ci === 1 ? "text-primary" : "text-foreground/50"}`}>
                      {c.label}
                    </button>
                    {ci === 1 && <span className="block w-1.5 h-1.5 rounded-full bg-primary mx-auto mt-1.5" />}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {comparisonRows.map((row, i) => (
                <motion.tr key={row.feature}
                  initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.03 }}
                  className="group hover:bg-muted/30 transition-colors">
                  <td className="py-4 px-6 text-sm font-light text-foreground/60 group-hover:text-foreground transition-colors">{row.feature}</td>
                  {[row.i, row.f, row.d, row.z, row.c, row.a].map((has, ci) => (
                    <td key={ci} className={`text-center py-4 px-4 ${ci === 1 ? "bg-primary/5" : ""}`}>
                      {has
                        ? <Check className={`w-4 h-4 mx-auto ${ci === 1 ? "text-primary" : "text-foreground/25"}`} />
                        : <span className="block w-3 h-px bg-border mx-auto" />
                      }
                    </td>
                  ))}
                </motion.tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-border">
                <td className="py-5 px-6 text-[9px] tracking-[0.3em] uppercase font-black text-muted-foreground/40">Choisir</td>
                {cols.map((c, ci) => (
                  <td key={c.id} className={`text-center py-5 px-4 ${ci === 1 ? "bg-primary/5" : ""}`}>
                    <button
                      onClick={() => { onSelect(c.id); scrollTop(); }}
                      className={`text-[8px] tracking-[0.3em] uppercase font-black px-4 py-2 border transition-all ${
                        ci === 1
                          ? "bg-primary text-white border-primary hover:bg-[hsl(var(--teal-deep))]"
                          : "border-border text-foreground/40 hover:border-primary hover:text-primary"
                      }`}>
                      Choisir
                    </button>
                  </td>
                ))}
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </section>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export default function Packs() {
  const [selected, setSelected] = useState("facettes");
  const packSectionRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  const scrollToPacks = () => {
    packSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const selectAndScroll = (id: string) => {
    setSelected(id);
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  return (
    <Layout>
      <Hero onStart={scrollToPacks} />
      <div ref={packSectionRef} className="scroll-mt-20">
        <PackSelector selected={selected} onSelect={setSelected} formRef={formRef} />
      </div>
      <BookingForm selectedPackId={selected} formRef={formRef} />
      <Comparison onSelect={selectAndScroll} />
    </Layout>
  );
}
