import { motion } from "framer-motion";
import { useState } from "react";
import Layout from "@/components/Layout";
import { Phone, Mail, MapPin, Send } from "lucide-react";
import { toast } from "sonner";

function Hero() {
  return (
    <section className="relative pt-40 pb-20 overflow-hidden bg-mist dark:bg-ink">
      <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-primary/10 blur-3xl" />
      <div className="container relative grid lg:grid-cols-12 gap-12 items-end">
        <div className="lg:col-span-7">
          <div className="eyebrow mb-6">Contactez-nous</div>
          <h1 className="display text-[clamp(48px,8vw,120px)]">
            Dites <em className="serif-it font-normal text-primary not-italic">bonjour.</em>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground">
            Nous sommes ravis de vous offrir un accès facile pour répondre à toutes vos questions. Votre bien-être est notre priorité.
          </p>
        </div>
        <div className="lg:col-span-4 lg:col-start-9 grid gap-4">
          {[
            { icon: Phone, label: "Téléphone", value: "+212 668 68 68 00", href: "tel:+212668686800" },
            { icon: Mail, label: "Email", value: "contact@medicalbay.ma", href: "mailto:contact@medicalbay.ma" },
            { icon: MapPin, label: "Adresse", value: "Technopole 1, Bureau A102, Agadir Bay" },
          ].map((c, i) => (
            <motion.a key={c.label} href={c.href} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
              className="group flex items-start gap-4 p-5 border border-border bg-background hover:border-primary transition-colors">
              <c.icon className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <div className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground">{c.label}</div>
                <div className="font-medium mt-1 group-hover:text-primary transition-colors">{c.value}</div>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}

function Form() {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ nom: "", prenom: "", email: "", phone: "", message: "" });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      toast.success("Message envoyé !", { description: "Notre équipe vous répondra sous 24h." });
      setLoading(false);
      setForm({ nom: "", prenom: "", email: "", phone: "", message: "" });
    }, 800);
  };

  const Field = ({ name, label, type = "text" }: { name: keyof typeof form; label: string; type?: string }) => (
    <label className="block group">
      <span className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground">{label}</span>
      <input
        type={type} required value={form[name]}
        onChange={(e) => setForm({ ...form, [name]: e.target.value })}
        className="w-full mt-2 bg-transparent border-b border-border py-3 outline-none text-lg focus:border-primary transition-colors"
      />
    </label>
  );

  return (
    <section className="container py-32 grid lg:grid-cols-12 gap-16">
      <div className="lg:col-span-5">
        <div className="eyebrow mb-4">Formulaire</div>
        <h2 className="display text-4xl md:text-5xl mb-6">Votre chemin vers <em className="serif-it font-normal text-primary not-italic">des soins d'exception.</em></h2>
        <p className="text-muted-foreground leading-relaxed">
          Remplissez ce formulaire et notre équipe vous contactera sous 24h avec un devis personnalisé et confidentiel.
        </p>
        <div className="mt-12 p-6 border-l-2 border-primary bg-mist dark:bg-card">
          <p className="serif-it text-xl text-foreground/80 leading-snug">
            « Chaque message est traité avec confidentialité et bienveillance. »
          </p>
        </div>
      </div>

      <form onSubmit={submit} className="lg:col-span-7 grid gap-8">
        <div className="grid md:grid-cols-2 gap-8">
          <Field name="nom" label="Nom" />
          <Field name="prenom" label="Prénom" />
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          <Field name="email" label="Email" type="email" />
          <Field name="phone" label="Téléphone" type="tel" />
        </div>
        <label className="block">
          <span className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground">Message</span>
          <textarea
            required rows={5}
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            className="w-full mt-2 bg-transparent border-b border-border py-3 outline-none text-lg focus:border-primary transition-colors resize-none"
          />
        </label>
        <button type="submit" disabled={loading} className="btn-primary self-start disabled:opacity-50">
          {loading ? "Envoi…" : "Envoyer mon message"} <Send className="w-4 h-4" />
        </button>
      </form>
    </section>
  );
}

function Map() {
  return (
    <section className="bg-ink text-cream py-20">
      <div className="container grid lg:grid-cols-2 gap-10 items-center">
        <div>
          <div className="eyebrow mb-4 !text-primary">Visitez-nous</div>
          <h2 className="display text-4xl md:text-5xl text-cream mb-6">Agadir Bay, <em className="serif-it font-normal text-primary not-italic">Maroc.</em></h2>
          <p className="text-cream/60 leading-relaxed">Technopole 1, 1er Étage, Bloc A, Bureau A102, Agadir Bay, Agadir 80000, Maroc.</p>
        </div>
        <div className="aspect-video w-full overflow-hidden border border-cream/10">
          <iframe
            title="Medical Bay Agadir"
            src="https://www.openstreetmap.org/export/embed.html?bbox=-9.583%2C30.385%2C-9.493%2C30.435&layer=mapnik&marker=30.41,-9.538"
            className="w-full h-full grayscale contrast-125"
            loading="lazy"
          />
        </div>
      </div>
    </section>
  );
}

export default function Contact() {
  return (
    <Layout>
      <Hero />
      <Form />
      <Map />
    </Layout>
  );
}
