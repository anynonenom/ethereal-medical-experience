import { motion } from "framer-motion";
import { useState } from "react";
import Layout from "@/components/Layout";
import { Phone, Mail, MapPin, Send, ArrowRight, MessageCircle, Clock, Star, Quote, ShieldCheck, Users2 } from "lucide-react";
import { toast } from "sonner";
import { openBooking } from "@/components/BookingModal";
import { supabase } from "@/lib/supabase";

// ─── HERO ─────────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section className="relative bg-[hsl(var(--off))] overflow-hidden min-h-[58vh] flex items-end border-b border-border">
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none grid-lines" />
      <div className="absolute inset-0 flex items-center justify-end pointer-events-none overflow-hidden pr-8">
        <span className="display text-[22vw] text-primary/[0.07] font-black whitespace-nowrap select-none tracking-tighter">CONTACT</span>
      </div>

      <div className="container relative z-10 pb-24 pt-40">
        <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }}
          className="flex items-center gap-4 mb-12">
          <div className="w-10 h-px bg-primary" />
          <span className="text-[10px] tracking-[0.55em] uppercase font-bold text-primary">Parlons de votre projet</span>
        </motion.div>

        <div className="grid lg:grid-cols-12 gap-10 items-end">
          <div className="lg:col-span-8">
            <h1 className="display text-[clamp(52px,9vw,140px)] leading-[0.82] tracking-[-0.03em] text-foreground">
              <motion.span initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.9, ease: [0.22, 1, 0.36, 1] }} className="block">
                Votre voyage
              </motion.span>
              <motion.span initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.38, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                className="block text-primary serif-it font-normal not-italic">
                commence ici.
              </motion.span>
            </h1>
          </div>
          <div className="lg:col-span-4">
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
              className="text-foreground/45 text-lg font-light leading-relaxed">
              Chaque transformation commence par un simple échange. Notre équipe vous répond sous 24h.
            </motion.p>
          </div>
        </div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.0 }}
          className="mt-16 flex flex-wrap gap-8">
          {[
            { icon: Clock,         t: "Réponse sous 24h" },
            { icon: MessageCircle, t: "WhatsApp disponible" },
            { icon: Send,          t: "Devis gratuit & sans engagement" },
          ].map(({ icon: Icon, t }) => (
            <div key={t} className="flex items-center gap-3 text-[10px] tracking-[0.35em] uppercase font-bold text-foreground/40">
              <Icon className="w-4 h-4 text-primary" /> {t}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ─── TRUST STRIP ──────────────────────────────────────────────────────────────
function TrustStrip() {
  const items = [
    { n: "24h",   t: "Réponse garantie",      sub: "à toute demande",         icon: Clock },
    { n: "1500+", t: "Patients accompagnés",  sub: "depuis 2018",             icon: Users2 },
    { n: "100%",  t: "Sans engagement",       sub: "devis & consultation",    icon: Send },
    { n: "15+",   t: "Cliniques certifiées",  sub: "normes internationales",  icon: ShieldCheck },
  ];
  return (
    <section className="bg-background border-b border-border">
      <div className="container">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border border-x border-border">
          {items.map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.08 }}
              className="bg-background px-8 py-14 group hover:bg-[hsl(var(--mist))] transition-colors">
              <s.icon className="w-5 h-5 text-primary/40 mb-5" />
              <div className="display text-4xl text-primary mb-2">{s.n}</div>
              <div className="display text-sm text-foreground mb-1">{s.t}</div>
              <div className="text-[9px] tracking-[0.3em] uppercase text-muted-foreground font-bold">{s.sub}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── FORM + INFO ──────────────────────────────────────────────────────────────
function ContactFunnel() {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ nom: "", prenom: "", email: "", phone: "", message: "" });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.from("messages").insert({
        id: `MSG-${Date.now()}`,
        name: `${form.prenom} ${form.nom}`.trim(),
        email: form.email,
        phone: form.phone,
        subject: "Message via page Contact",
        body: form.message,
        date: new Date().toISOString().slice(0, 10),
        read: false,
      });
      if (error) throw error;
      toast.success("MESSAGE ENVOYÉ", { description: "Notre équipe vous répondra sous 24h." });
      setForm({ nom: "", prenom: "", email: "", phone: "", message: "" });
    } catch {
      toast.error("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  const field = (name: keyof typeof form, label: string, type = "text") => (
    <label key={name} className="block group">
      <span className="text-[9px] tracking-[0.45em] uppercase text-muted-foreground group-focus-within:text-primary transition-colors font-bold">{label}</span>
      <input type={type} required value={form[name]}
        onChange={(e) => setForm({ ...form, [name]: e.target.value })}
        className="w-full mt-3 bg-transparent border-b border-border py-4 outline-none text-xl focus:border-primary transition-colors font-light rounded-none placeholder:text-foreground/20" />
    </label>
  );

  return (
    <section className="container py-40 grid lg:grid-cols-12 gap-24 items-start border-y border-border">
      {/* Sticky info */}
      <div className="lg:col-span-4 lg:sticky lg:top-28">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-8 h-px bg-primary" />
          <span className="text-[10px] tracking-[0.55em] uppercase font-bold text-muted-foreground">Coordonnées</span>
        </div>
        <h2 className="display text-[clamp(36px,5vw,72px)] leading-[0.88] mb-16">
          Nous sommes<br /><em className="serif-it font-normal not-italic text-primary">votre écoute.</em>
        </h2>

        <div className="space-y-12 mb-16">
          {[
            { icon: Phone,  label: "TÉLÉPHONE",   value: "+212 668 68 68 00",     href: "tel:+212668686800" },
            { icon: Mail,   label: "E-MAIL",       value: "contact@medicalbay.ma", href: "mailto:contact@medicalbay.ma" },
            { icon: MapPin, label: "ADRESSE",      value: "Agadir Bay, Maroc",     href: undefined },
          ].map((c, i) => (
            <div key={i} className="flex items-start gap-6 group">
              <div className="w-12 h-12 border border-border flex items-center justify-center shrink-0 group-hover:border-primary group-hover:text-primary transition-colors">
                <c.icon className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[9px] tracking-[0.4em] uppercase text-muted-foreground mb-2 font-bold">{c.label}</div>
                {c.href ? (
                  <a href={c.href} className="display text-xl hover:text-primary transition-colors tracking-tight">{c.value}</a>
                ) : (
                  <div className="display text-xl tracking-tight">{c.value}</div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* WhatsApp CTA */}
        <div className="bg-[hsl(var(--mist))] border border-primary/20 p-12 relative overflow-hidden group">
          <div className="absolute inset-0 opacity-[0.04] grid-lines" />
          <h4 className="display text-2xl mb-5 relative z-10">
            Besoin d'une réponse<br /><em className="serif-it font-normal not-italic text-primary">directe ?</em>
          </h4>
          <a href="https://api.whatsapp.com/send/?phone=212668686800" target="_blank" rel="noreferrer"
            className="inline-flex items-center gap-3 text-primary font-bold tracking-[0.4em] uppercase text-[10px] relative z-10 hover:translate-x-2 transition-transform">
            CHAT WHATSAPP <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Form */}
      <div className="lg:col-span-8 bg-[hsl(var(--mist)/0.6)] p-10 md:p-16 border border-border shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04] grid-lines pointer-events-none" />
        <div className="flex items-center gap-4 mb-12 relative z-10">
          <div className="w-8 h-px bg-primary" />
          <span className="text-[10px] tracking-[0.55em] uppercase font-bold text-muted-foreground">Formulaire de contact</span>
        </div>
        <form onSubmit={submit} className="grid gap-12 relative z-10">
          <div className="grid md:grid-cols-2 gap-12">
            {field("nom",    "NOM")}
            {field("prenom", "PRÉNOM")}
          </div>
          <div className="grid md:grid-cols-2 gap-12">
            {field("email", "E-MAIL", "email")}
            {field("phone", "TÉLÉPHONE / WHATSAPP", "tel")}
          </div>
          <label className="block group">
            <span className="text-[9px] tracking-[0.45em] uppercase text-muted-foreground group-focus-within:text-primary transition-colors font-bold">VOTRE PROJET</span>
            <textarea required rows={4} value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="w-full mt-3 bg-transparent border-b border-border py-4 outline-none text-xl focus:border-primary transition-colors resize-none font-light rounded-none placeholder:text-foreground/20"
              placeholder="Décrivez brièvement vos attentes…" />
          </label>
          <button type="submit" disabled={loading} className="btn-primary w-full !py-7 disabled:opacity-50 group">
            {loading ? "ENVOI EN COURS…" : "DEMANDER MON DEVIS GRATUIT"}
            {!loading && <Send className="w-4 h-4" />}
          </button>
          <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground font-bold text-center">
            Réponse garantie sous 24h · Devis sans engagement
          </p>
        </form>
      </div>
    </section>
  );
}

// ─── MINI TESTIMONIALS ────────────────────────────────────────────────────────
function SocialProof() {
  const quotes = [
    { name: "Sophie M.", role: "Paris · Smile Design", stars: 5, quote: "Une expérience bluffante du début à la fin. Medical Bay gère tout avec une précision et une bienveillance rares.", img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150&h=150" },
    { name: "Pierre L.", role: "Lyon · Couronnes Zircone", stars: 5, quote: "Sceptique au départ, je suis rentré avec un sourire que mes proches n'arrivent pas à distinguer du naturel.", img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150&h=150" },
  ];
  return (
    <section className="bg-[hsl(var(--off))] py-28 border-t border-border">
      <div className="container">
        <div className="flex items-center gap-4 mb-14">
          <div className="w-8 h-px bg-primary" />
          <span className="text-[10px] tracking-[0.55em] uppercase font-bold text-muted-foreground">Ce qu'ils en disent</span>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {quotes.map((q, i) => (
            <motion.div key={q.name}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.1 }}
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
                  <div className="text-[8px] tracking-[0.3em] uppercase text-muted-foreground font-bold mt-0.5">{q.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          className="mt-10 flex justify-center">
          <a href="https://api.whatsapp.com/send/?phone=212668686800" target="_blank" rel="noreferrer"
            className="btn-primary group">
            WHATSAPP DIRECT <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}

// ─── MAP ─────────────────────────────────────────────────────────────────────
function MapSection() {
  return (
    <section className="bg-background py-40 border-t border-border">
      <div className="container">
        <div className="grid lg:grid-cols-12 gap-20 items-center">
          <div className="lg:col-span-4">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-8 h-px bg-primary" />
              <span className="text-[10px] tracking-[0.55em] uppercase font-bold text-muted-foreground">Localisation</span>
            </div>
            <h2 className="display text-[clamp(40px,5vw,80px)] leading-[0.88] text-foreground mb-10">
              Au cœur<br /><em className="serif-it font-normal not-italic text-primary">d'Agadir.</em>
            </h2>
            <p className="text-foreground/45 text-sm font-light leading-relaxed mb-10">
              Technopole 1, Bureau A102, Agadir Bay. À quelques minutes des cliniques partenaires et du front de mer.
            </p>
            <a href="https://api.whatsapp.com/send/?phone=212668686800" target="_blank" rel="noreferrer"
              className="btn-primary group">
              NOUS CONTACTER <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </a>
          </div>
          <div className="lg:col-span-8 h-[500px] overflow-hidden border border-border shadow-xl hover:shadow-2xl transition-shadow">
            <iframe title="Medical Bay Agadir"
              src="https://www.openstreetmap.org/export/embed.html?bbox=-9.583%2C30.385%2C-9.493%2C30.435&layer=mapnik&marker=30.41,-9.538"
              className="w-full h-full" loading="lazy" />
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Contact() {
  return (
    <Layout>
      <Hero />
      <TrustStrip />
      <ContactFunnel />
      <SocialProof />
      <MapSection />
    </Layout>
  );
}
