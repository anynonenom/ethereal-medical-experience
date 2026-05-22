import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Instagram, Facebook, ArrowUpRight } from "lucide-react";
import logoMark from "@/assets/medicalbay-logo-mark.png";

export default function Footer() {
  return (
    <footer className="bg-ink text-cream relative overflow-hidden">
      {/* Marquee */}
      <div className="border-y border-cream/10 overflow-hidden py-6">
        <div className="flex gap-12 whitespace-nowrap animate-marquee">
          {Array.from({ length: 8 }).map((_, i) => (
            <span key={i} className="display text-4xl md:text-6xl text-cream/90 flex items-center gap-12">
              MEDICAL BAY <span className="text-primary">✦</span> AGADIR <span className="text-primary">✦</span> MAROC <span className="text-primary">✦</span>
            </span>
          ))}
        </div>
      </div>

      <div className="container py-20 grid md:grid-cols-12 gap-12">
        <div className="md:col-span-5">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-primary grid place-items-center">
              <img src={logoMark} alt="" className="w-8 h-8 brightness-0 invert" />
            </div>
            <div>
              <div className="display tracking-[0.18em] text-base">MEDICAL BAY</div>
              <div className="text-[9px] tracking-[0.3em] uppercase text-cream/50 mt-1">Votre partenaire de santé</div>
            </div>
          </div>
          <p className="serif-it text-2xl text-cream/70 max-w-md leading-snug">
            « Votre partenaire de confiance pour des soins médicaux d'excellence au Maroc et à l'international. »
          </p>
        </div>

        <div className="md:col-span-3">
          <div className="eyebrow !text-cream/50 mb-6">Liens</div>
          <ul className="space-y-3">
            {[
              ["/", "Accueil"],
              ["/a-propos", "À Propos"],
              ["/dentisterie-esthetique", "Dentisterie"],
              ["/tourisme-medical", "Tourisme Médical"],
              ["/packs", "Packs"],
              ["/contact", "Contact"],
            ].map(([to, l]) => (
              <li key={to}>
                <Link to={to} className="group inline-flex items-center gap-2 text-cream/85 hover:text-primary transition-colors">
                  {l} <ArrowUpRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-4">
          <div className="eyebrow !text-cream/50 mb-6">Contact</div>
          <ul className="space-y-4 text-cream/85">
            <li className="flex items-start gap-3"><Phone className="w-4 h-4 text-primary mt-1" /><span>+212 668 68 68 00<br/>+212 528 234 505</span></li>
            <li className="flex items-start gap-3"><Mail className="w-4 h-4 text-primary mt-1" /><a href="mailto:contact@medicalbay.ma" className="hover:text-primary">contact@medicalbay.ma</a></li>
            <li className="flex items-start gap-3"><MapPin className="w-4 h-4 text-primary mt-1" /><span>Technopole 1, 1er Étage, Bloc A, Bureau A102,<br/>Agadir Bay, Agadir 80000, Maroc</span></li>
          </ul>
          <div className="flex gap-3 mt-6">
            <a className="w-10 h-10 grid place-items-center border border-cream/20 hover:border-primary hover:text-primary transition" href="#"><Instagram className="w-4 h-4" /></a>
            <a className="w-10 h-10 grid place-items-center border border-cream/20 hover:border-primary hover:text-primary transition" href="#"><Facebook className="w-4 h-4" /></a>
          </div>
        </div>
      </div>

      <div className="border-t border-cream/10">
        <div className="container py-6 flex flex-col md:flex-row justify-between items-center gap-3 text-[10px] tracking-[0.3em] uppercase text-cream/40">
          <span>© 2026 Medical Bay — Tous droits réservés</span>
          <span>Crafted with care · Agadir, Morocco</span>
        </div>
      </div>
    </footer>
  );
}
