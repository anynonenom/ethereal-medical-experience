import { motion, useScroll, useTransform, MotionValue } from "framer-motion";

function ProgressDot({ progress, from, to }: { progress: MotionValue<number>; from: number; to: number }) {
  const scaleX = useTransform(progress, [from, to], [0, 1]);
  return (
    <div className="w-12 h-0.5 bg-cream/20 overflow-hidden">
      <motion.div className="h-full bg-primary origin-left" style={{ scaleX }} />
    </div>
  );
}
import { useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Shield, HeartHandshake, Plane, Building2, Stethoscope, Hotel } from "lucide-react";
import Layout from "@/components/Layout";
import heroSmile from "@/assets/hero-smile.jpg";
import agadirCoast from "@/assets/agadir-coast.jpg";
import clinic from "@/assets/clinic-interior.jpg";

const slides = [
  { kicker: "Sourire", title: "Révélez l'éclat", em: "de votre sourire", body: "Smile design, facettes & blanchiment d'excellence." },
  { kicker: "Restauration", title: "Des solutions", em: "durables", body: "Couronnes en porcelaine et zirconium pour restaurer votre sourire." },
  { kicker: "Implants", title: "Confort &", em: "confiance", body: "Retrouvez la liberté grâce aux implants dentaires." },
];

function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0.2]);

  return (
    <section ref={ref} className="relative min-h-screen overflow-hidden grid-lines">
      <motion.div style={{ y, opacity }} className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-mist/40 via-background to-background dark:from-ink dark:via-ink dark:to-ink" />
        <div className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full" style={{ background: "var(--gradient-glow)" }} />
      </motion.div>

      <div className="container pt-40 pb-24 grid lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-7">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="eyebrow mb-6">
            Medical Bay · Agadir, Maroc
          </motion.div>

          <h1 className="display text-[clamp(48px,8vw,120px)]">
            {"Votre santé,".split("").map((c, i) => (
              <motion.span key={i} initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03, duration: 0.6 }} className="inline-block">
                {c === " " ? "\u00A0" : c}
              </motion.span>
            ))}
            <br />
            <span className="serif-it font-normal text-primary not-italic">
              <em className="serif-it">notre obsession.</em>
            </span>
          </h1>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1, duration: 1 }} className="mt-8 max-w-xl text-lg text-muted-foreground leading-relaxed">
            Des soins médicaux d'excellence dans nos cliniques partenaires au Maroc et à l'international. Un parcours personnalisé, serein, parfaitement orchestré.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2 }} className="mt-10 flex flex-wrap gap-4">
            <Link to="/contact" className="btn-primary">Devis gratuit <ArrowRight className="w-4 h-4" /></Link>
            <Link to="/dentisterie-esthetique" className="btn-ghost">Nos spécialités</Link>
          </motion.div>

          <div className="mt-16 grid grid-cols-3 gap-6 max-w-lg">
            {[["10+", "Cliniques"], ["1.5K", "Patients"], ["24/7", "Support"]].map(([n, l]) => (
              <div key={l}>
                <div className="display text-3xl text-primary">{n}</div>
                <div className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground mt-2">{l}</div>
              </div>
            ))}
          </div>
        </div>

        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.6, duration: 1 }} className="lg:col-span-5 relative">
          <div className="relative aspect-[4/5] overflow-hidden">
            <img src={heroSmile} alt="Sourire éclatant" className="w-full h-full object-cover" />
            <div className="absolute inset-0 ring-1 ring-foreground/10" />
          </div>
          <motion.div animate={{ y: [0, -14, 0] }} transition={{ duration: 6, repeat: Infinity }} className="absolute -bottom-6 -left-6 bg-background border border-border p-5 shadow-[var(--shadow-soft)] max-w-[220px]">
            <Sparkles className="w-5 h-5 text-primary mb-2" />
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Hollywood</div>
            <div className="display text-xl">Smile</div>
          </motion.div>
          <motion.div animate={{ y: [0, 12, 0] }} transition={{ duration: 7, repeat: Infinity, delay: 1 }} className="absolute -top-6 -right-6 bg-primary text-primary-foreground p-5 max-w-[200px]">
            <div className="display text-2xl leading-tight">Soins<br/>certifiés</div>
            <div className="text-[10px] tracking-[0.3em] uppercase mt-2 opacity-80">ISO · 2026</div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

function Marquee() {
  return (
    <div className="bg-primary text-primary-foreground py-5 overflow-hidden border-y border-primary-foreground/10">
      <div className="flex gap-10 whitespace-nowrap animate-marquee">
        {Array.from({ length: 10 }).map((_, i) => (
          <span key={i} className="display text-2xl md:text-3xl flex items-center gap-10">
            Devis gratuit <span className="opacity-50">◆</span> Soins d'excellence <span className="opacity-50">◆</span> Agadir <span className="opacity-50">◆</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function StickyCarousel() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, [0, 1], ["0%", `-${(slides.length - 1) * 100}%`]);

  return (
    <section ref={ref} className="relative" style={{ height: `${slides.length * 100}vh` }}>
      <div className="sticky top-0 h-screen overflow-hidden bg-ink text-cream">
        <motion.div style={{ x }} className="flex h-full" >
          {slides.map((s, i) => (
            <div key={i} className="min-w-full h-full grid lg:grid-cols-2 gap-0">
              <div className="flex flex-col justify-center p-12 lg:p-24 relative">
                <div className="absolute top-12 left-12 lg:left-24 eyebrow !text-primary">{`0${i + 1} / 0${slides.length}`}</div>
                <div className="eyebrow mb-6 !text-primary">{s.kicker}</div>
                <h2 className="display text-[clamp(40px,7vw,96px)] text-cream">
                  {s.title} <em className="serif-it font-normal text-primary not-italic">{s.em}</em>
                </h2>
                <p className="mt-8 max-w-md text-cream/60 text-lg">{s.body}</p>
                <Link to="/dentisterie-esthetique" className="mt-10 btn-primary self-start">Découvrir <ArrowRight className="w-4 h-4" /></Link>
              </div>
              <div className="relative overflow-hidden hidden lg:block">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-ink" />
                <img src={[heroSmile, clinic, agadirCoast][i]} alt="" className="w-full h-full object-cover mix-blend-luminosity opacity-80" />
                <div className="absolute bottom-12 right-12 display text-[20vw] leading-none text-cream/5 select-none">{i + 1}</div>
              </div>
            </div>
          ))}
        </motion.div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
          {slides.map((_, i) => (
            <ProgressDot key={i} progress={scrollYProgress} from={i / slides.length} to={(i + 1) / slides.length} />
          ))}
        </div>
      </div>
    </section>
  );
}

function Values() {
  const items = [
    { icon: Shield, title: "Soins Accessibles", body: "Partenariats avec hôpitaux, cliniques et médecins de renom pour des soins de haute qualité." },
    { icon: Stethoscope, title: "Conseil d'Expertise", body: "Notre équipe vous guide vers le professionnel de santé adapté à vos besoins spécifiques." },
    { icon: HeartHandshake, title: "Sans Tracas", body: "Nous simplifions chaque étape pour que votre parcours de soins se déroule sans souci." },
  ];

  return (
    <section className="container py-32">
      <div className="grid lg:grid-cols-12 gap-12 mb-20">
        <div className="lg:col-span-5">
          <div className="eyebrow mb-4">Nos valeurs</div>
          <h2 className="display text-5xl md:text-7xl">Nos engagements <em className="serif-it font-normal text-primary not-italic">envers votre santé.</em></h2>
        </div>
      </div>
      <div className="grid md:grid-cols-3 gap-px bg-border">
        {items.map((it, i) => (
          <motion.div
            key={it.title}
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}
            className="bg-background p-12 group hover:bg-primary hover:text-primary-foreground transition-all duration-500 relative"
          >
            <div className="display text-7xl text-primary/15 group-hover:text-primary-foreground/20 absolute top-6 right-8">0{i + 1}</div>
            <it.icon className="w-10 h-10 text-primary group-hover:text-primary-foreground transition-colors mb-8" />
            <h3 className="display text-2xl mb-4">{it.title}</h3>
            <p className="text-muted-foreground group-hover:text-primary-foreground/80 leading-relaxed">{it.body}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function Expertise() {
  const items = [
    { icon: Plane, title: "Séjour", body: "Nous accompagnons les patients internationaux dans l'organisation de leur séjour au Maroc." },
    { icon: Hotel, title: "Hôtel", body: "Établissements sélectionnés alliant confort, qualité de service et proximité des centres de soins." },
    { icon: Building2, title: "Cliniques", body: "Cliniques partenaires sélectionnées selon des critères stricts de qualité et de performance médicale." },
    { icon: Stethoscope, title: "Spécialistes", body: "Professionnels de santé reconnus pour leur expertise et leur engagement envers l'excellence." },
  ];

  return (
    <section className="bg-ink text-cream py-32 overflow-hidden">
      <div className="container">
        <div className="grid lg:grid-cols-12 gap-12 mb-16">
          <div className="lg:col-span-6">
            <div className="eyebrow mb-4 !text-primary">Notre expertise</div>
            <h2 className="display text-5xl md:text-7xl text-cream">Notre réseau <em className="serif-it font-normal text-primary not-italic">d'expertise médicale.</em></h2>
          </div>
          <div className="lg:col-span-5 lg:col-start-8 self-end">
            <p className="serif-it text-2xl text-cream/60 border-l-2 border-primary pl-6 leading-snug">
              « Nous accordons une importance essentielle à la transparence, à la confidentialité et au respect de vos droits. »
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-px bg-cream/10">
          {items.map((it, i) => (
            <motion.div
              key={it.title}
              initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="bg-ink p-10 hover:bg-primary/10 transition-colors group"
            >
              <it.icon className="w-8 h-8 text-primary mb-6" />
              <div className="text-xs uppercase tracking-[0.3em] text-primary mb-3">0{i + 1}</div>
              <h3 className="display text-xl text-cream mb-4">{it.title}</h3>
              <p className="text-cream/60 text-sm leading-relaxed">{it.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="relative overflow-hidden">
      <img src={agadirCoast} alt="Agadir" className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
      <div className="absolute inset-0 bg-gradient-to-r from-ink/85 via-ink/60 to-ink/30" />
      <div className="container relative py-32 text-cream">
        <div className="max-w-2xl">
          <div className="eyebrow mb-6 !text-primary">Notre équipe est prête</div>
          <h2 className="display text-5xl md:text-7xl text-cream">Une expérience médicale <em className="serif-it font-normal text-primary not-italic">sans pareil.</em></h2>
          <p className="mt-8 text-cream/80 text-lg max-w-xl leading-relaxed">
            Rejoignez-nous pour des soins de qualité et la découverte de la splendeur d'Agadir. Nous vous accompagnons à chaque étape.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link to="/contact" className="btn-primary">Commencer mon parcours <ArrowRight className="w-4 h-4" /></Link>
            <a href="https://api.whatsapp.com/send/?phone=212668686800" target="_blank" rel="noreferrer" className="btn-ghost !text-cream !border-cream/30 hover:!border-primary">WhatsApp</a>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Index() {
  return (
    <Layout>
      <Hero />
      <Marquee />
      <StickyCarousel />
      <Values />
      <Expertise />
      <CTASection />
    </Layout>
  );
}
