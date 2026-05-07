import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, MessageCircle, Check, Star } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import logoMark from "@/assets/medicalbay-logo-mark.png";
import { supabase } from "@/lib/supabase";

export default function BookingModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ nom: "", prenom: "", email: "", phone: "", soin: "", message: "" });

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener("open-booking", handleOpen);
    return () => window.removeEventListener("open-booking", handleOpen);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const close = () => setIsOpen(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.from("messages").insert({
        id: `MSG-${Date.now()}`,
        name: `${form.prenom} ${form.nom}`.trim(),
        email: form.email,
        phone: form.phone,
        subject: form.soin ? `Demande RDV — ${form.soin}` : "Demande de rendez-vous",
        body: form.message || `Demande de rendez-vous pour : ${form.soin || "soin non précisé"}.`,
        date: new Date().toISOString().slice(0, 10),
        read: false,
      });
      if (error) throw error;
      toast.success("Demande envoyée !", {
        description: "Notre coordinateur vous contacte sous 2h.",
      });
      setForm({ nom: "", prenom: "", email: "", phone: "", soin: "", message: "" });
      close();
    } catch {
      toast.error("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            className="fixed inset-0 z-[100] backdrop-blur-sm"
            style={{ background: "hsl(var(--ink) / 0.6)" }}
          />

          {/* Scroll container */}
          <div className="fixed inset-0 z-[101] overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 py-10">

              <motion.div
                initial={{ opacity: 0, y: 32, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 32, scale: 0.96 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="relative w-full max-w-3xl shadow-2xl overflow-hidden"
              >
                {/* Close */}
                <button onClick={close}
                  className="absolute top-5 right-5 z-30 w-10 h-10 border border-border bg-background flex items-center justify-center text-foreground hover:border-primary hover:text-primary transition-colors">
                  <X className="w-4 h-4" />
                </button>

                <div className="grid md:grid-cols-[1fr_1.55fr]">

                  {/* ── Left panel — teal ───────────────────────── */}
                  <div className="bg-primary p-10 md:p-12 flex flex-col justify-between relative overflow-hidden min-h-[420px]">
                    {/* Stripe texture */}
                    <div className="absolute inset-0 opacity-[0.07] pointer-events-none"
                      style={{ backgroundImage: "repeating-linear-gradient(-55deg, transparent, transparent 36px, rgba(255,255,255,1) 36px, rgba(255,255,255,1) 37px)" }} />
                    {/* Glow */}
                    <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-[80px] pointer-events-none" />

                    <div className="relative z-10">
                      {/* Brand */}
                      <div className="flex items-center gap-3 mb-10">
                        <div className="w-9 h-9 bg-white/15 flex items-center justify-center shrink-0">
                          <img src={logoMark} alt="Medical Bay" className="w-5 h-5 brightness-0 invert" />
                        </div>
                        <span className="text-[9px] tracking-[0.5em] uppercase font-bold text-white/65">Medical Bay</span>
                      </div>

                      {/* Headline */}
                      <h3 className="display text-[clamp(26px,3.5vw,40px)] leading-[0.95] text-white mb-5">
                        Votre devis<br />gratuit en<br />
                        <span className="serif-it text-white/70">2 minutes.</span>
                      </h3>
                      <p className="text-white/50 text-sm font-light leading-relaxed mb-10 max-w-[220px]">
                        Un coordinateur dédié vous rappelle pour construire votre parcours sur-mesure.
                      </p>

                      {/* Trust list */}
                      <div className="space-y-3.5">
                        {[
                          "Réponse garantie sous 2h",
                          "Devis détaillé sans engagement",
                          "Hôtel & dates inclus dans le plan",
                        ].map((t) => (
                          <div key={t} className="flex items-center gap-3">
                            <div className="w-5 h-5 border border-white/30 flex items-center justify-center shrink-0">
                              <Check className="w-3 h-3 text-white" />
                            </div>
                            <span className="text-[9px] tracking-[0.18em] uppercase font-bold text-white/65">{t}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Mini testimonial */}
                    <div className="relative z-10 mt-12 pt-8 border-t border-white/15">
                      <div className="flex gap-0.5 mb-3">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-white text-white" />
                        ))}
                      </div>
                      <p className="serif-it text-white/80 text-base leading-snug mb-4">
                        "Mon sourire est enfin ma plus belle transformation."
                      </p>
                      <div className="flex items-center gap-3">
                        <img
                          src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=60&h=60"
                          alt="Sophie M."
                          className="w-8 h-8 rounded-full object-cover border border-white/30"
                        />
                        <div className="text-[9px] tracking-[0.3em] uppercase text-white/45 font-bold">Sophie M. · Paris</div>
                      </div>
                    </div>
                  </div>

                  {/* ── Right panel — form ──────────────────────── */}
                  <div className="bg-background p-8 md:p-12">
                    <div className="flex items-center gap-4 mb-10">
                      <div className="w-8 h-px bg-primary" />
                      <span className="text-[9px] tracking-[0.5em] uppercase font-bold text-muted-foreground">Formulaire de contact</span>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-7">
                      {/* Name row */}
                      <div className="grid grid-cols-2 gap-5">
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

                      <div className="grid grid-cols-2 gap-5">
                        <label className="block group">
                          <span className="text-[9px] tracking-[0.4em] uppercase text-muted-foreground group-focus-within:text-primary transition-colors font-bold">WHATSAPP / TÉLÉPHONE</span>
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
                        <span className="text-[9px] tracking-[0.4em] uppercase text-muted-foreground group-focus-within:text-primary transition-colors font-bold">SOIN SOUHAITÉ</span>
                        <select value={form.soin}
                          onChange={(e) => setForm({ ...form, soin: e.target.value })}
                          className="w-full mt-2 bg-transparent border-b border-border py-3 outline-none focus:border-primary transition-colors text-sm font-light appearance-none cursor-pointer rounded-none">
                          <option value="">Sélectionnez un soin…</option>
                          <option>Smile Design complet</option>
                          <option>Facettes porcelaine E-max</option>
                          <option>Implantologie</option>
                          <option>Couronnes Zircone</option>
                          <option>Blanchiment laser</option>
                          <option>Séjour médical tout inclus</option>
                          <option>Consultation générale</option>
                        </select>
                      </label>

                      <label className="block group">
                        <span className="text-[9px] tracking-[0.4em] uppercase text-muted-foreground group-focus-within:text-primary transition-colors font-bold">
                          VOTRE PROJET <span className="opacity-40 normal-case tracking-normal font-normal">(optionnel)</span>
                        </span>
                        <textarea rows={2} placeholder="Décrivez brièvement vos attentes…" value={form.message}
                          onChange={(e) => setForm({ ...form, message: e.target.value })}
                          className="w-full mt-2 bg-transparent border-b border-border py-3 outline-none focus:border-primary transition-colors text-sm font-light resize-none rounded-none placeholder:text-foreground/25" />
                      </label>

                      <div className="pt-2 space-y-4">
                        <button type="submit" disabled={loading}
                          className="w-full btn-primary !py-5 group disabled:opacity-60 transition-opacity">
                          {loading
                            ? (
                              <span className="flex items-center gap-2 justify-center">
                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                TRAITEMENT…
                              </span>
                            ) : (
                              <>
                                <span>PRENDRE RENDEZ-VOUS</span>
                                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                              </>
                            )
                          }
                        </button>

                        <a href="https://api.whatsapp.com/send/?phone=212668686800"
                          target="_blank" rel="noreferrer"
                          className="flex items-center justify-center gap-2 text-[9px] tracking-[0.35em] uppercase font-bold text-muted-foreground hover:text-primary transition-colors py-1">
                          <MessageCircle className="w-3.5 h-3.5" /> WhatsApp direct
                        </a>
                      </div>
                    </form>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

export const openBooking = () => {
  window.dispatchEvent(new CustomEvent("open-booking"));
};
