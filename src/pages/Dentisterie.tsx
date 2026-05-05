import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import Layout from "@/components/Layout";
import { Link } from "react-router-dom";
import { ArrowRight, Plus, Minus } from "lucide-react";
import veneer from "@/assets/veneer-macro.jpg";
import clinic from "@/assets/clinic-interior.jpg";
import smile from "@/assets/hero-smile.jpg";

const services = [
  { id: "smile-design", name: "Smile Design", short: "Conception harmonieuse", body: "Le smile design est un processus de conception et d'amélioration du sourire, souvent réalisé par des professionnels de la dentisterie esthétique. Création d'un sourire harmonieux en prenant en compte la forme, la couleur, l'alignement et la position des dents par rapport aux lèvres et au visage." },
  { id: "facettes", name: "Facettes", short: "Fines pellicules en Emax", body: "Solution pour améliorer l'apparence des dents qui ont perdu leur éclat. Choix de la couleur : du blanc « HOLLYWOOD SMILE » au blanc étincelant, en passant par un blanc naturel. Personnalisation totale de votre sourire." },
  { id: "couronne", name: "Couronne en porcelaine", short: "Prothèse céramique", body: "Conçue pour recouvrir une dent existante, être fixée sur un implant dentaire ou servir de maillon central dans un bridge. Polyvalence d'utilisation dans divers cas de figure." },
  { id: "zirconium", name: "Zirconium", short: "Sans métal", body: "Couronne Zirconium, prothèse céramique sans métal — solution polyvalente adaptée à diverses situations, y compris la création d'un HOLLYWOOD SMILE, même sur dents irrégulières, endommagées ou espacées." },
  { id: "implant", name: "Implant dentaire", short: "Racine en titane", body: "Racine artificielle en titane insérée dans l'os de la mâchoire pour remplacer une dent manquante. Compatible avec le corps humain, durabilité égale à celle des dents naturelles." },
  { id: "blanchiment", name: "Blanchiment", short: "Méthode au laser", body: "Méthode au laser utilisant des agents peroxydés pour restaurer la blancheur naturelle des dents qui ont perdu leur éclat ou présentent des taches." },
  { id: "aligneurs", name: "Aligneurs", short: "Orthodontie invisible", body: "Correction des problèmes d'alignement dentaire grâce aux aligneurs invisibles ou appareils traditionnels." },
];

function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);

  return (
    <section ref={ref} className="relative min-h-screen flex items-center pt-32 overflow-hidden bg-ink text-cream">
      <motion.img src={veneer} alt="" style={{ scale }} className="absolute inset-0 w-full h-full object-cover opacity-60" />
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/70 to-ink/30" />
      <div className="container relative">
        <div className="eyebrow mb-6 !text-primary">Dentisterie esthétique</div>
        <h1 className="display text-[clamp(48px,9vw,140px)] text-cream max-w-5xl">
          Révélez l'éclat <em className="serif-it font-normal text-primary not-italic">de votre sourire.</em>
        </h1>
        <p className="mt-8 max-w-xl text-cream/70 text-lg leading-relaxed">
          Soins dentaires de qualité au sein de Medical Bay, à Agadir. Une équipe de dentistes qualifiés, des traitements adaptés à vos besoins, dans un environnement moderne et rassurant.
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          {services.map((s) => (
            <a key={s.id} href={`#${s.id}`} className="text-xs uppercase tracking-[0.2em] border border-cream/30 px-4 py-2 hover:border-primary hover:text-primary transition-colors">
              {s.name}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function ServiceList() {
  const [open, setOpen] = useState<string>(services[0].id);
  return (
    <section className="container py-32 grid lg:grid-cols-12 gap-12">
      <div className="lg:col-span-5 lg:sticky lg:top-32 self-start">
        <div className="eyebrow mb-4">Nos soins</div>
        <h2 className="display text-4xl md:text-6xl mb-8">Sept soins, <em className="serif-it font-normal text-primary not-italic">une excellence.</em></h2>
        <div className="aspect-[4/5] overflow-hidden bg-mist">
          <img src={smile} alt="" className="w-full h-full object-cover" loading="lazy" />
        </div>
      </div>
      <div className="lg:col-span-7 divide-y divide-border border-y border-border">
        {services.map((s, i) => {
          const isOpen = open === s.id;
          return (
            <div key={s.id} id={s.id}>
              <button onClick={() => setOpen(isOpen ? "" : s.id)} className="w-full text-left py-8 flex items-start justify-between gap-6 group">
                <div className="flex items-baseline gap-6">
                  <span className="text-xs tracking-[0.3em] uppercase text-primary">0{i + 1}</span>
                  <span className="display text-3xl md:text-4xl group-hover:text-primary transition-colors">{s.name}</span>
                </div>
                <div className="w-10 h-10 grid place-items-center border border-border text-primary mt-2 shrink-0">
                  {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </div>
              </button>
              <motion.div initial={false} animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }} className="overflow-hidden">
                <div className="pb-8 pl-12 pr-4">
                  <p className="text-muted-foreground text-lg leading-relaxed">{s.body}</p>
                </div>
              </motion.div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function Process() {
  const steps = [
    { n: "01", t: "Consultation", b: "Échange initial, étude de votre cas, devis transparent." },
    { n: "02", t: "Planification", b: "Smile design numérique, choix des matériaux et couleurs." },
    { n: "03", t: "Soins", b: "Intervention dans nos cliniques partenaires modernes." },
    { n: "04", t: "Suivi", b: "Accompagnement post-opératoire et garanties." },
  ];
  return (
    <section className="bg-mist dark:bg-card py-32">
      <div className="container">
        <div className="eyebrow mb-4">Méthode</div>
        <h2 className="display text-5xl md:text-7xl mb-16">Quatre étapes <em className="serif-it font-normal text-primary not-italic">vers votre sourire.</em></h2>
        <div className="grid md:grid-cols-4 gap-px bg-border">
          {steps.map((s, i) => (
            <motion.div key={s.n} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.12 }} className="bg-background p-10">
              <div className="display text-6xl text-primary/20 mb-4">{s.n}</div>
              <h3 className="display text-xl mb-3">{s.t}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{s.b}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ColorChoice() {
  const swatches = [
    { name: "Hollywood", hex: "#FFFFFF" },
    { name: "Étincelant", hex: "#F8F8F2" },
    { name: "Lumineux", hex: "#F1ECDC" },
    { name: "Naturel", hex: "#E9DEC3" },
    { name: "Chaud", hex: "#DDC9A2" },
  ];
  return (
    <section className="container py-32">
      <div className="grid lg:grid-cols-12 gap-12 mb-12">
        <div className="lg:col-span-6">
          <div className="eyebrow mb-4">Personnalisation</div>
          <h2 className="display text-5xl md:text-7xl">Choisissez la teinte <em className="serif-it font-normal text-primary not-italic">de votre sourire.</em></h2>
        </div>
        <p className="lg:col-span-5 lg:col-start-8 self-end text-muted-foreground text-lg">
          Du blanc HOLLYWOOD SMILE au blanc naturel, des dizaines de nuances pour révéler votre personnalité.
        </p>
      </div>
      <div className="flex h-72 gap-1">
        {swatches.map((sw) => (
          <div key={sw.name} className="flex-1 hover:flex-[2.4] transition-[flex] duration-500 ease-out flex flex-col justify-end p-6 text-ink relative overflow-hidden" style={{ background: sw.hex }}>
            <div className="display text-lg">{sw.name}</div>
            <div className="text-[10px] tracking-[0.3em] uppercase opacity-50">{sw.hex}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="relative overflow-hidden">
      <img src={clinic} alt="" className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
      <div className="absolute inset-0 bg-primary/85" />
      <div className="container relative py-32 text-primary-foreground">
        <h2 className="display text-5xl md:text-7xl max-w-3xl">Prêt à <em className="serif-it font-normal not-italic">transformer</em> votre sourire ?</h2>
        <Link to="/contact" className="mt-10 inline-flex items-center gap-2 px-7 py-4 bg-ink text-cream text-xs uppercase tracking-[0.2em] font-medium hover:bg-cream hover:text-ink transition-colors">
          Demander un devis <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
}

export default function Dentisterie() {
  return (
    <Layout>
      <Hero />
      <ServiceList />
      <Process />
      <ColorChoice />
      <CTA />
    </Layout>
  );
}
