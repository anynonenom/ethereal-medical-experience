import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import Layout from "@/components/Layout";
import { Link } from "react-router-dom";
import { ArrowRight, Heart, Award, Compass } from "lucide-react";
import doctor from "@/assets/doctor-portrait.jpg";
import clinic from "@/assets/clinic-interior.jpg";

function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 150]);

  return (
    <section ref={ref} className="relative min-h-[90vh] flex items-end pt-40 pb-20 bg-mist dark:bg-ink overflow-hidden">
      <motion.div style={{ y }} className="absolute -top-20 -right-20 w-[500px] h-[500px] rounded-full bg-primary/10 blur-3xl" />
      <div className="container relative grid lg:grid-cols-12 gap-12 items-end">
        <div className="lg:col-span-7">
          <div className="eyebrow mb-6">À Propos</div>
          <h1 className="display text-[clamp(48px,8vw,120px)]">
            Votre partenaire <em className="serif-it font-normal text-primary not-italic">de confiance</em><br/>
            en tourisme médical.
          </h1>
        </div>
        <div className="lg:col-span-4 lg:col-start-9">
          <p className="serif-it text-xl text-muted-foreground border-l-2 border-primary pl-6 leading-snug">
            « Bien plus qu'un service médical : une expérience globale alliant santé, confort et accompagnement humain. »
          </p>
        </div>
      </div>
    </section>
  );
}

function Story() {
  return (
    <section className="container py-32 grid lg:grid-cols-12 gap-16 items-center">
      <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="lg:col-span-5 relative">
        <div className="aspect-[4/5] overflow-hidden">
          <img src={clinic} alt="Notre clinique" className="w-full h-full object-cover" loading="lazy" />
        </div>
        <div className="absolute -bottom-6 -right-6 bg-primary text-primary-foreground p-6 max-w-[220px]">
          <div className="display text-4xl">2026</div>
          <div className="text-xs uppercase tracking-[0.3em] mt-2 opacity-80">Excellence depuis</div>
        </div>
      </motion.div>
      <div className="lg:col-span-7">
        <div className="eyebrow mb-4">Qui sommes-nous</div>
        <h2 className="display text-4xl md:text-6xl mb-8">Medical Bay, c'est <em className="serif-it font-normal text-primary not-italic">l'Agadir des soins</em>.</h2>
        <div className="space-y-5 text-lg text-muted-foreground leading-relaxed">
          <p>Medical Bay est votre partenaire de confiance en tourisme médical à Agadir, spécialisé dans l'accompagnement des patients nationaux et internationaux à la recherche de soins médicaux de qualité.</p>
          <p>Nous collaborons avec des cliniques partenaires reconnues et des professionnels de santé qualifiés afin d'offrir une prise en charge complète, personnalisée et sécurisée.</p>
          <p>Notre objectif est de simplifier votre parcours médical en vous proposant une expérience sereine, confortable et parfaitement organisée.</p>
        </div>
      </div>
    </section>
  );
}

function Values() {
  const items = [
    { icon: Heart, title: "Confiance", body: "Nous plaçons la transparence et la relation humaine au cœur de chaque accompagnement." },
    { icon: Award, title: "Excellence", body: "Nous travaillons uniquement avec des professionnels qualifiés et des établissements reconnus." },
    { icon: Compass, title: "Accompagnement", body: "Nous restons présents à chaque étape, de la première prise de contact au suivi final." },
  ];
  return (
    <section className="bg-ink text-cream py-32 overflow-hidden relative">
      <div className="absolute -bottom-20 -right-10 display text-[28vw] text-cream/[0.03] leading-none select-none">VALUES</div>
      <div className="container relative">
        <div className="eyebrow mb-4 !text-primary">Nos valeurs</div>
        <h2 className="display text-5xl md:text-7xl text-cream mb-20 max-w-4xl">Trois piliers, <em className="serif-it font-normal text-primary not-italic">un engagement.</em></h2>
        <div className="grid md:grid-cols-3 gap-px bg-cream/10">
          {items.map((it, i) => (
            <motion.div key={it.title} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }} className="bg-ink p-12">
              <div className="display text-7xl text-primary/20 mb-4">0{i + 1}</div>
              <it.icon className="w-8 h-8 text-primary mb-6" />
              <h3 className="display text-2xl text-cream mb-4">{it.title}</h3>
              <p className="text-cream/60 leading-relaxed">{it.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Specialties() {
  const items = [
    { tag: "01", title: "Dentisterie esthétique", body: "Smile design, facettes, couronnes, implants, blanchiment, aligneurs.", to: "/dentisterie-esthetique" },
    { tag: "02", title: "Tourisme médical", body: "Séjour, hôtel, cliniques et meilleurs spécialistes — orchestrés.", to: "/tourisme-medical" },
  ];
  return (
    <section className="container py-32">
      <div className="eyebrow mb-4">Nos spécialités</div>
      <h2 className="display text-5xl md:text-7xl mb-16">Notre champ <em className="serif-it font-normal text-primary not-italic">d'excellence.</em></h2>
      <div className="grid md:grid-cols-2 gap-6">
        {items.map((it, i) => (
          <motion.div key={it.tag} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}>
            <Link to={it.to} className="group block relative overflow-hidden bg-mist dark:bg-card p-12 min-h-[340px] flex flex-col justify-between transition-all hover:bg-primary hover:text-primary-foreground">
              <div className="flex justify-between items-start">
                <span className="text-xs tracking-[0.3em] uppercase text-primary group-hover:text-primary-foreground">{it.tag}</span>
                <ArrowRight className="w-6 h-6 group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform" />
              </div>
              <div>
                <h3 className="display text-3xl md:text-4xl mb-4">{it.title}</h3>
                <p className="opacity-80">{it.body}</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function Team() {
  return (
    <section className="bg-mist dark:bg-card py-32">
      <div className="container grid lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-6">
          <img src={doctor} alt="Équipe Medical Bay" className="w-full aspect-[4/5] object-cover" loading="lazy" />
        </div>
        <div className="lg:col-span-5 lg:col-start-8">
          <div className="eyebrow mb-4">Notre équipe</div>
          <h2 className="display text-4xl md:text-6xl mb-8">Des humains <em className="serif-it font-normal text-primary not-italic">avant tout.</em></h2>
          <p className="text-lg text-muted-foreground leading-relaxed mb-6">
            Coordinateurs de soins, conseillers patients, médecins partenaires : une équipe rigoureuse et bienveillante, à votre écoute 24/7.
          </p>
          <Link to="/contact" className="btn-primary">Rencontrer l'équipe <ArrowRight className="w-4 h-4" /></Link>
        </div>
      </div>
    </section>
  );
}

export default function APropos() {
  return (
    <Layout>
      <Hero />
      <Story />
      <Values />
      <Specialties />
      <Team />
    </Layout>
  );
}
