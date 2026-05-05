import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import Layout from "@/components/Layout";
import { Link } from "react-router-dom";
import { Plane, Hotel, Building2, Stethoscope, ArrowRight, MapPin } from "lucide-react";
import coast from "@/assets/agadir-coast.jpg";
import luxury from "@/assets/luxury-stay.jpg";
import clinic from "@/assets/clinic-interior.jpg";

function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  return (
    <section ref={ref} className="relative min-h-screen flex items-end pt-40 pb-20 overflow-hidden bg-ink text-cream">
      <motion.img src={coast} alt="Agadir" style={{ y }} className="absolute inset-0 w-full h-[120%] object-cover opacity-70" />
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />
      <div className="container relative">
        <div className="eyebrow mb-6 !text-primary">Tourisme Médical</div>
        <h1 className="display text-[clamp(48px,9vw,140px)] text-cream max-w-5xl">
          Soignez-vous, <em className="serif-it font-normal text-primary not-italic">vivez Agadir.</em>
        </h1>
        <p className="mt-6 max-w-2xl text-cream/70 text-lg leading-relaxed">
          Le confort d'une destination balnéaire, l'excellence des cliniques marocaines, l'orchestration sur-mesure d'un partenaire dédié.
        </p>
      </div>
    </section>
  );
}

function Pillars() {
  const items = [
    { icon: Plane, title: "Séjour", body: "Nous accompagnons les patients internationaux dans l'organisation de leur séjour au Maroc, en veillant à chaque détail pour garantir confort et tranquillité d'esprit." },
    { icon: Hotel, title: "Hôtel", body: "Établissements soigneusement sélectionnés, alliant confort, qualité de service et proximité avec les centres de soins." },
    { icon: Building2, title: "Cliniques", body: "Cliniques partenaires sélectionnées selon des critères stricts de qualité, de sécurité et de performance médicale." },
    { icon: Stethoscope, title: "Spécialistes", body: "Professionnels de santé expérimentés, reconnus pour leur expertise et leur engagement envers l'excellence médicale." },
  ];
  return (
    <section className="container py-32">
      <div className="grid lg:grid-cols-12 gap-12 mb-16">
        <div className="lg:col-span-6">
          <div className="eyebrow mb-4">Notre orchestration</div>
          <h2 className="display text-5xl md:text-7xl">Quatre piliers, <em className="serif-it font-normal text-primary not-italic">un parcours fluide.</em></h2>
        </div>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-px bg-border">
        {items.map((it, i) => (
          <motion.div key={it.title} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.12 }}
            className="bg-background p-10 group hover:bg-ink hover:text-cream transition-colors duration-500">
            <div className="display text-6xl text-primary/20 group-hover:text-primary/40 mb-6">0{i + 1}</div>
            <it.icon className="w-8 h-8 text-primary mb-6" />
            <h3 className="display text-2xl mb-4">{it.title}</h3>
            <p className="text-muted-foreground group-hover:text-cream/70 text-sm leading-relaxed">{it.body}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function HorizontalJourney() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const cards = [
    { day: "J-30", title: "Premier contact", body: "Nous étudions votre dossier, répondons à toutes vos questions, devis transparent.", img: clinic },
    { day: "J-7", title: "Préparation", body: "Vol, hôtel, transferts : nous coordonnons chaque détail logistique.", img: luxury },
    { day: "J0", title: "Arrivée à Agadir", body: "Accueil personnalisé à l'aéroport, installation et briefing médical.", img: coast },
    { day: "J+1", title: "Soins", body: "Intervention dans nos cliniques partenaires modernes.", img: clinic },
    { day: "J+5", title: "Détente", body: "Récupération entre océan, médina et hôtels d'exception.", img: luxury },
  ];
  const x = useTransform(scrollYProgress, [0, 1], ["10%", `-${(cards.length) * 18}%`]);

  return (
    <section ref={ref} className="bg-ink text-cream relative" style={{ height: `${cards.length * 80}vh` }}>
      <div className="sticky top-0 h-screen overflow-hidden flex flex-col justify-center">
        <div className="container mb-12">
          <div className="eyebrow mb-4 !text-primary">Votre parcours</div>
          <h2 className="display text-4xl md:text-6xl text-cream">Du premier contact <em className="serif-it font-normal text-primary not-italic">au retour à la maison.</em></h2>
        </div>
        <motion.div style={{ x }} className="flex gap-6 pl-[10vw]">
          {cards.map((c, i) => (
            <div key={i} className="min-w-[480px] max-w-[480px] aspect-[3/4] relative overflow-hidden group">
              <img src={c.img} alt="" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />
              <div className="absolute inset-0 p-10 flex flex-col justify-between text-cream">
                <div className="text-xs tracking-[0.3em] uppercase text-primary">{c.day}</div>
                <div>
                  <h3 className="display text-3xl mb-3">{c.title}</h3>
                  <p className="text-cream/70 text-sm leading-relaxed">{c.body}</p>
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function Destination() {
  return (
    <section className="container py-32 grid lg:grid-cols-12 gap-12 items-center">
      <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="lg:col-span-7">
        <img src={coast} alt="Agadir" className="w-full aspect-video object-cover" loading="lazy" />
      </motion.div>
      <div className="lg:col-span-5">
        <div className="eyebrow mb-4 inline-flex items-center"><MapPin className="w-3 h-3 ml-3" /> Destination</div>
        <h2 className="display text-4xl md:text-6xl mb-6">Agadir, <em className="serif-it font-normal text-primary not-italic">la baie qui soigne.</em></h2>
        <p className="text-muted-foreground text-lg leading-relaxed mb-4">
          300 jours de soleil, 10 km de plage dorée, des hôtels de standing international, et un écosystème médical moderne au cœur du Maroc.
        </p>
        <div className="grid grid-cols-3 gap-6 mt-8">
          {[["300", "Jours de soleil"], ["10km", "De plage"], ["3h", "Depuis l'Europe"]].map(([n, l]) => (
            <div key={l}>
              <div className="display text-3xl text-primary">{n}</div>
              <div className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground mt-2">{l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="bg-primary text-primary-foreground py-32">
      <div className="container grid lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-8">
          <h2 className="display text-5xl md:text-7xl">Votre dossier <em className="serif-it font-normal not-italic">commence aujourd'hui.</em></h2>
        </div>
        <div className="lg:col-span-4 flex flex-col gap-3">
          <Link to="/contact" className="inline-flex items-center justify-between gap-2 px-7 py-5 bg-ink text-cream text-xs uppercase tracking-[0.2em] hover:bg-cream hover:text-ink transition">
            Demander un devis <ArrowRight className="w-4 h-4" />
          </Link>
          <a href="https://api.whatsapp.com/send/?phone=212668686800" target="_blank" rel="noreferrer" className="inline-flex items-center justify-between gap-2 px-7 py-5 border border-primary-foreground/30 text-xs uppercase tracking-[0.2em] hover:bg-primary-foreground/10 transition">
            WhatsApp direct <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
}

export default function TourismeMedical() {
  return (
    <Layout>
      <Hero />
      <Pillars />
      <HorizontalJourney />
      <Destination />
      <CTA />
    </Layout>
  );
}
