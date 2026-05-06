import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import { ArrowRight, Heart, Award, Compass, ShieldCheck, Users2, Sparkles, Globe2, MessageCircle, Check, Plane, Star, Quote } from "lucide-react";
import doctor from "@/assets/doctor-portrait.jpg";
import clinic from "@/assets/clinic-interior.jpg";
import { openBooking } from "@/components/BookingModal";

// ─── HERO ─────────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section className="relative min-h-[90vh] bg-[hsl(var(--off))] flex items-end overflow-hidden border-b border-border">
      <div className="absolute inset-0 grid lg:grid-cols-2">
        <div className="bg-[hsl(var(--off))]" />
        <div className="relative overflow-hidden hidden lg:block border-l border-border">
          <img src={clinic} alt="Clinique" className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to left, transparent 30%, hsl(var(--off)) 100%)" }} />
        </div>
      </div>

      <div className="container relative z-10 pb-24 pt-40">
        <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }}
          className="flex items-center gap-4 mb-12">
          <div className="w-10 h-px bg-primary" />
          <span className="text-[10px] tracking-[0.55em] uppercase font-bold text-primary">Notre Engagement</span>
        </motion.div>

        <div className="max-w-4xl">
          <h1 className="display text-[clamp(52px,9vw,140px)] leading-[0.82] tracking-[-0.03em] text-foreground">
            {["Redéfinir", "le soin"].map((w, i) => (
              <motion.span key={i} initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.15, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                className="block">{w}</motion.span>
            ))}
            <motion.span initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              className="block text-primary serif-it font-normal not-italic">
              par l'excellence.
            </motion.span>
          </h1>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}
            className="mt-10 max-w-2xl text-foreground/45 text-xl font-light leading-relaxed">
            Medical Bay n'est pas un intermédiaire — c'est votre allié dévoué, garant d'un parcours médical sans couture, humain et hautement sécurisé.
          </motion.p>
        </div>
      </div>
    </section>
  );
}

// ─── STATS ────────────────────────────────────────────────────────────────────
function Stats() {
  const stats = [
    { n: "10+",   l: "ANNÉES D'EXPERTISE",  icon: Award },
    { n: "1.5K+", l: "PATIENTS ACCOMPAGNÉS", icon: Users2 },
    { n: "15+",   l: "CLINIQUES PARTENAIRES", icon: ShieldCheck },
    { n: "12",    l: "SPÉCIALITÉS MÉDICALES", icon: Sparkles },
  ];
  return (
    <section className="py-28 border-y border-border bg-[hsl(var(--mist)/0.4)]">
      <div className="container grid grid-cols-2 lg:grid-cols-4 gap-12">
        {stats.map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ delay: i * 0.1 }}
            className="flex flex-col items-center text-center gap-4">
            <s.icon className="w-6 h-6 text-primary opacity-40" />
            <div className="display text-5xl md:text-6xl text-primary tracking-tighter">{s.n}</div>
            <div className="text-[9px] tracking-[0.35em] uppercase text-muted-foreground font-bold">{s.l}</div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// ─── MISSION ─────────────────────────────────────────────────────────────────
function Mission() {
  return (
    <section className="py-40 container grid lg:grid-cols-12 gap-20 items-center">
      <div className="lg:col-span-6 relative">
        <motion.div initial={{ opacity: 0, scale: 0.96 }} whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }} transition={{ duration: 1 }}
          className="aspect-[4/5] overflow-hidden shadow-2xl border border-border">
          <img src={clinic} alt="Environnement" className="w-full h-full object-cover transition-all duration-[3s]" />
        </motion.div>
        <div className="absolute -bottom-10 -right-10 bg-primary text-white p-10 shadow-2xl hidden md:block">
          <div className="display text-5xl text-white mb-2">2026</div>
          <div className="text-[9px] uppercase tracking-[0.4em] text-white/60 font-bold">L'INNOVATION CONTINUE</div>
        </div>
      </div>

      <div className="lg:col-span-5 lg:col-start-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-8 h-px bg-primary" />
          <span className="text-[10px] tracking-[0.55em] uppercase font-bold text-muted-foreground">Notre Vision</span>
        </div>
        <h2 className="display text-[clamp(40px,6vw,88px)] leading-[0.88] tracking-[-0.025em] mb-14">
          Pourquoi<br /><em className="serif-it font-normal not-italic text-primary">Medical Bay ?</em>
        </h2>
        <p className="text-xl text-muted-foreground font-light leading-relaxed mb-14">
          Nous avons fondé Medical Bay sur une conviction simple : personne ne devrait avoir à choisir entre la qualité des soins et la sérénité du séjour.
        </p>
        <div className="space-y-10">
          {[
            { t: "TRANSPARENCE TOTALE",    d: "Pas de frais cachés, pas de surprises. Chaque devis est clair, détaillé et sans ambiguïté." },
            { t: "STANDARD INTERNATIONAL", d: "Nous ne travaillons qu'avec des cliniques répondant aux normes de sécurité les plus strictes." },
            { t: "HÉRITAGE MAROCAIN",      d: "L'accueil et la bienveillance sont au cœur de notre ADN depuis le premier jour." },
          ].map((it, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }} transition={{ delay: 0.3 + i * 0.1 }}
              className="flex gap-6 group">
              <div className="w-2 h-2 bg-primary mt-2.5 shrink-0 group-hover:scale-150 transition-transform" />
              <div>
                <h4 className="display text-base mb-2 tracking-widest">{it.t}</h4>
                <p className="text-muted-foreground text-sm font-light leading-relaxed">{it.d}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── VALUES ───────────────────────────────────────────────────────────────────
function Values() {
  const items = [
    { icon: Heart,   title: "L'HUMAIN D'ABORD", body: "Chaque patient est unique. Nous adaptons chaque détail à votre rythme et vos besoins." },
    { icon: Globe2,  title: "RAYONNEMENT",       body: "Nous connectons les meilleures expertises locales à une patientèle internationale exigeante." },
    { icon: Compass, title: "GUIDANCE EXPERT",   body: "Nous ne sommes pas des intermédiaires — nous sommes vos conseillers dévoués 24/7." },
  ];
  return (
    <section className="bg-[hsl(var(--off))] py-40 border-t border-border">
      <div className="container">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-8 h-px bg-primary" />
          <span className="text-[10px] tracking-[0.55em] uppercase font-bold text-muted-foreground">Nos Valeurs</span>
        </div>
        <h2 className="display text-[clamp(40px,7vw,100px)] leading-[0.85] text-foreground mb-24">
          L'éthique au cœur<br /><em className="serif-it font-normal not-italic text-primary">de chaque geste.</em>
        </h2>
        <div className="grid md:grid-cols-3 gap-px bg-border border border-border">
          {items.map((it, i) => (
            <motion.div key={it.title} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.15 }}
              className="bg-background p-14 group hover:bg-primary transition-all duration-700">
              <div className="w-14 h-14 bg-primary/8 flex items-center justify-center mb-10 group-hover:bg-white/15 transition-all">
                <it.icon className="w-7 h-7 text-primary group-hover:text-white transition-colors" />
              </div>
              <h3 className="display text-2xl text-foreground group-hover:text-white mb-6 tracking-tight transition-colors">{it.title}</h3>
              <p className="text-muted-foreground group-hover:text-white/70 leading-relaxed text-sm font-light transition-colors">{it.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── MÉTHODE ─────────────────────────────────────────────────────────────────
function Methode() {
  const steps = [
    { icon: MessageCircle, title: "Consultation gratuite",    body: "Envoyez vos photos ou votre dossier. Notre coordinateur vous répond sous 24h avec une estimation complète." },
    { icon: Check,         title: "Plan sur-mesure",          body: "Calendrier personnalisé, hôtel sélectionné, tout est coordonné avant votre départ." },
    { icon: Plane,         title: "Voyage VIP tout inclus",   body: "Accueil à l'aéroport, transfert privé, check-in à l'hôtel — vous n'avez rien à gérer." },
    { icon: Sparkles,      title: "Transformation & suivi",   body: "Soins en clinique d'élite. Résultats visibles avant votre retour, suivi post-traitement inclus." },
  ];

  return (
    <section className="bg-background py-28 border-t border-border">
      <div className="container">
        <div className="grid lg:grid-cols-12 gap-10 mb-20">
          <div className="lg:col-span-5">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-8 h-px bg-primary" />
              <span className="text-[10px] tracking-[0.55em] uppercase font-bold text-muted-foreground">Notre Méthode</span>
            </div>
            <h2 className="display text-[clamp(38px,6vw,86px)] leading-[0.9] text-foreground">
              4 étapes,<br /><em className="serif-it font-normal not-italic text-primary">zéro stress.</em>
            </h2>
          </div>
          <div className="lg:col-span-5 lg:col-start-8 flex items-end">
            <p className="text-foreground/45 text-lg font-light leading-relaxed">De votre première demande à votre retour, nous gérons chaque détail pour que vous ne pensiez qu'à votre transformation.</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-6 relative">
          <div className="absolute top-[52px] left-[10%] right-[10%] h-px bg-border hidden lg:block" />
          {steps.map((s, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.6 }}
              className="group">
              <div className="w-[104px] h-[104px] border border-border group-hover:border-primary transition-all duration-500 flex items-center justify-center mb-10 relative z-10 bg-background">
                <span className="display text-3xl text-primary">{i + 1}</span>
              </div>
              <div className="text-[9px] tracking-[0.45em] uppercase text-primary/50 font-bold mb-4">0{i + 1}</div>
              <h3 className="display text-xl text-foreground mb-4 group-hover:text-primary transition-colors duration-300">{s.title}</h3>
              <p className="text-foreground/40 text-sm font-light leading-relaxed group-hover:text-foreground/65 transition-colors">{s.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── MINI TESTIMONIALS ───────────────────────────────────────────────────────
function MiniTestimonials() {
  const quotes = [
    {
      name: "Sophie M.", role: "Paris, France", treatment: "Smile Design", stars: 5,
      quote: "Je n'aurais jamais imaginé vivre une expérience aussi soignée à un tel prix. Mon sourire est enfin ce que j'ai toujours rêvé — naturel, lumineux, parfait.",
      img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150&h=150",
    },
    {
      name: "Thomas B.", role: "Bruxelles, Belgique", treatment: "Implantologie", stars: 5,
      quote: "En Belgique, on m'avait demandé 9 000 €. Ici, tout compris, j'en suis sorti à moins de 3 500 €. Et la qualité est irréprochable.",
      img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150&h=150",
    },
    {
      name: "Amina K.", role: "Montréal, Canada", treatment: "Séjour médical", stars: 5,
      quote: "Medical Bay a effacé toutes mes craintes en 24h. Un séjour 5 étoiles, des soins de classe mondiale, et des économies considérables.",
      img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150&h=150",
    },
  ];

  return (
    <section className="bg-[hsl(var(--off))] py-28 border-t border-border">
      <div className="container">
        <div className="flex items-center gap-4 mb-14">
          <div className="w-8 h-px bg-primary" />
          <span className="text-[10px] tracking-[0.55em] uppercase font-bold text-muted-foreground">Ils nous ont fait confiance</span>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {quotes.map((q, i) => (
            <motion.div key={q.name}
              initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.6 }}
              className="bg-background border border-border p-8 flex flex-col justify-between group hover:border-primary/40 transition-colors duration-500">
              <div>
                <div className="flex gap-0.5 mb-5">
                  {Array.from({ length: q.stars }).map((_, j) => (
                    <Star key={j} className="w-3.5 h-3.5 fill-gold text-gold" />
                  ))}
                </div>
                <Quote className="w-6 h-6 text-primary/15 mb-4" />
                <p className="serif-it text-xl leading-[1.45] text-foreground/75">"{q.quote}"</p>
              </div>
              <div className="flex items-center gap-3 pt-6 mt-6 border-t border-border group-hover:border-primary/20 transition-colors">
                <img src={q.img} alt={q.name} className="w-10 h-10 rounded-full object-cover border-2 border-primary/20" />
                <div>
                  <div className="display text-base text-foreground">{q.name}</div>
                  <div className="text-[8px] tracking-[0.3em] uppercase text-muted-foreground font-bold mt-0.5">{q.role} · {q.treatment}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
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
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden select-none">
        <span className="display text-[18vw] text-white/[0.07] font-black whitespace-nowrap">MEDICAL BAY</span>
      </div>
      <div className="container relative py-40 grid lg:grid-cols-2 gap-20 items-center">
        <div>
          <div className="flex items-center gap-4 mb-8">
            <div className="w-8 h-px bg-white/40" />
            <span className="text-[10px] tracking-[0.55em] uppercase font-bold text-white/60">Nous sommes là</span>
          </div>
          <h2 className="display text-[clamp(40px,6vw,88px)] leading-[0.85] text-white mb-12">
            Écrivons<br />ensemble<br /><em className="serif-it font-normal not-italic text-white/70">votre histoire.</em>
          </h2>
          <button onClick={openBooking}
            className="inline-flex items-center gap-2 px-12 py-6 bg-white text-primary font-bold tracking-[0.2em] text-[10px] uppercase transition-all hover:bg-[hsl(var(--cream))] group">
            PRENDRE RDV <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
        <motion.div initial={{ opacity: 0, scale: 0.96 }} whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="aspect-square overflow-hidden shadow-2xl border border-white/10">
          <img src={doctor} alt="Dr. Medical Bay" className="w-full h-full object-cover scale-105" />
        </motion.div>
      </div>
    </section>
  );
}

export default function APropos() {
  return (
    <Layout>
      <Hero />
      <Stats />
      <Mission />
      <Values />
      <Methode />
      <MiniTestimonials />
      <CTA />
    </Layout>
  );
}
