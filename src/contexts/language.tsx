import { createContext, useContext, useState, ReactNode } from "react";

export type Lang = "fr" | "en";

interface LangCtx { lang: Lang; toggle: () => void; }
const Ctx = createContext<LangCtx>({ lang: "fr", toggle: () => {} });

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("fr");
  return (
    <Ctx.Provider value={{ lang, toggle: () => setLang(l => l === "fr" ? "en" : "fr") }}>
      {children}
    </Ctx.Provider>
  );
}

export const useLang = () => useContext(Ctx);

// ─── ALL SITE TRANSLATIONS ────────────────────────────────────────────────────
export const T = {
  fr: {
    // Navbar
    nav: {
      home: "Accueil",
      about: "À Propos",
      dental: "Dentisterie",
      tourism: "Tourisme Médical",
      contact: "Contact",
      cta: "PRENDRE RDV",
      navLabel: "Navigation",
    },

    // Hero
    hero: {
      badge: "Medical Bay · Agadir, Maroc",
      line1: "Votre sourire",
      line2: "mérite",
      lineEm: "mieux.",
      sub: "Dentisterie d'élite à Agadir — jusqu'à 70% moins cher qu'en Europe, avec séjour palace inclus.",
      cta1: "DEVIS GRATUIT · 24H",
      cta2: "Découvrir le séjour",
      stats: [["1 500+", "patients"], ["70%", "économies"], ["5 j", "résultats"]],
    },

    // Marquee
    marquee: ["DENTISTERIE ESTHÉTIQUE", "IMPLANTOLOGIE", "TOURISME MÉDICAL", "BLANCHIMENT LASER", "SMILE DESIGN", "COURONNE ZIRCONE", "FACETTES E-MAX", "AGADIR"],

    // Manifesto
    manifesto: {
      label: "Notre promesse",
      quote: "L'excellence médicale n'est plus un privilège réservé aux capitales européennes.",
      attribution: "Medical Bay, Agadir — fondé 2018",
      stats: [
        { n: "70%", t: "moins cher qu'en France, Belgique ou Suisse" },
        { n: "5 j",  t: "pour un Smile Design complet et définitif" },
        { n: "24h",  t: "délai de réponse garanti à toute demande" },
      ],
    },

    // Services
    services: {
      label: "Nos Prestations",
      title: "Ce que nous",
      titleEm: "créons.",
      cta: "TOUS LES SOINS",
      items: [
        { n: "01", title: "SMILE DESIGN",          sub: "Redesign complet du sourire",         body: "Facettes ultra-fines, composites et couronnes zircone pour un résultat naturellement parfait." },
        { n: "02", title: "IMPLANTOLOGIE",          sub: "Solutions permanentes",               body: "Implants Nobel Biocare posés par des praticiens formés en Europe. Résultats à vie." },
        { n: "03", title: "BLANCHIMENT LASER",      sub: "Éclat immédiat en séance unique",     body: "Protocole Zoom Whitening. Jusqu'à 8 teintes de blanc en 45 minutes." },
        { n: "04", title: "SÉJOUR VIP TOUT INCLUS", sub: "Tourisme médical premium",            body: "Vol, hôtel 5★, transferts privés, conciergerie médicale — nous gérons tout." },
      ],
    },

    // Testimonials
    testimonials: {
      label: "Ils ont transformé leur sourire",
      title: "Ce qu'ils",
      titleEm: "disent.",
      items: [
        {
          name: "Sophie M.",
          role: "Paris, France",
          treatment: "Smile Design complet",
          stars: 5,
          quote: "Je n'aurais jamais imaginé vivre une expérience aussi soignée à un tel prix. Mon sourire est enfin ce que j'ai toujours rêvé — naturel, lumineux, parfait. L'équipe de Medical Bay est d'un professionnalisme sans faille.",
          img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150&h=150",
        },
        {
          name: "Thomas B.",
          role: "Bruxelles, Belgique",
          treatment: "Implantologie",
          stars: 5,
          quote: "Trois implants posés en deux séances. En Belgique, on m'avait demandé 9 000 €. Ici, tout compris — hôtel, transferts, soins — j'en suis sorti à moins de 3 500 €. Et la qualité est irréprochable.",
          img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150&h=150",
        },
        {
          name: "Maria C.",
          role: "Genève, Suisse",
          treatment: "Facettes E-max",
          stars: 5,
          quote: "Agadir est une ville magnifique pour récupérer. Le fait que Medical Bay gère tout — de l'aéroport à l'hôtel — m'a permis de me concentrer uniquement sur ma transformation.",
          img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150&h=150",
        },
        {
          name: "Pierre L.",
          role: "Lyon, France",
          treatment: "Couronnes Zircone",
          stars: 5,
          quote: "Sceptique au départ, je suis rentré à Lyon avec un sourire que mes proches n'arrivent pas à distinguer du naturel. Le Dr. m'a expliqué chaque étape avec une patience exemplaire.",
          img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150&h=150",
        },
        {
          name: "Amina K.",
          role: "Montréal, Canada",
          treatment: "Séjour médical complet",
          stars: 5,
          quote: "Venue depuis Montréal, j'avais des doutes sur la logistique. Medical Bay a effacé toutes mes craintes en 24h. Un séjour 5 étoiles, des soins de classe mondiale, et des économies considérables.",
          img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150&h=150",
        },
      ],
    },

    // Process
    process: {
      label: "Comment ça marche",
      title: "4 étapes,",
      titleEm: "zéro stress.",
      sub: "De votre première demande à votre retour — nous gérons chaque détail pour que vous ne pensiez qu'à votre transformation.",
      steps: [
        { n: "01", title: "Consultation gratuite",      body: "Envoyez vos photos ou radios. Notre coordinateur vous répond sous 24h avec une estimation complète." },
        { n: "02", title: "Plan & devis sur-mesure",    body: "Calendrier personnalisé, hôtel sélectionné, tout est coordonné avant votre départ." },
        { n: "03", title: "Voyage VIP pris en charge",  body: "Accueil à l'aéroport, transfert privé, check-in à l'hôtel — vous n'avez rien à gérer." },
        { n: "04", title: "Transformation & suivi",     body: "Soins en clinique d'élite. Résultats visibles avant votre retour, suivi post-traitement inclus." },
      ],
      nudge: "Commencer ne prend que",
      nudgeEm: "2 minutes.",
      cta: "DÉMARRER MAINTENANT",
    },

    // Destination
    destination: {
      label: "Destination",
      title: "La guérison comme",
      titleEm: "art de vivre.",
      body: "300 jours de soleil, 10 km de plage, et des infrastructures médicales de classe mondiale. La convalescence devient un véritable luxe.",
      stats: [["3H", "depuis Paris"], ["300j", "de soleil"], ["5★", "hôtels"]],
    },

    // Instagram
    instagram: {
      label: "Instagram",
      title: "Notre",
      titleEm: "quotidien.",
      handle: "@medicalbay.maroc",
      follow: "Suivre sur Instagram →",
    },

    // FAQ
    faq: {
      label: "FAQ",
      title: "Vos questions,",
      titleEm: "nos réponses.",
      cta: "POSER MA QUESTION",
      items: [
        { q: "Quels sont les délais pour obtenir un devis ?",  a: "Nous traitons vos demandes sous 24 à 48 heures ouvrées après réception de votre dossier médical complet via formulaire ou WhatsApp." },
        { q: "Comment se passe l'accueil à l'aéroport ?",     a: "Un membre de notre équipe vous attend personnellement à Agadir Al Massira avec une pancarte nominative pour votre transfert privé vers l'hôtel ou la clinique." },
        { q: "Les cliniques partenaires sont-elles certifiées ?", a: "Oui, toutes nos cliniques partenaires respectent les normes internationales de sécurité et d'hygiène, avec un équipement à la pointe de la technologie médicale." },
        { q: "Dois-je parler français ou arabe ?",             a: "Non, tout notre personnel et nos médecins parlent couramment français. Nous garantissons une communication fluide et transparente à chaque étape de votre séjour." },
      ],
    },

    // Final CTA
    cta: {
      label: "Devis gratuit · Réponse sous 24h",
      title: "Commençons.",
      sub: "Rejoignez 1 500+ patients européens qui ont choisi Medical Bay pour transformer leur sourire.",
      cta1: "DÉMARRER MON PROJET GRATUIT",
      cta2: "WHATSAPP DIRECT",
    },
  },

  // ══════════════════════════════════════════════════════════════════════════
  en: {
    nav: {
      home: "Home",
      about: "About",
      dental: "Dentistry",
      tourism: "Medical Tourism",
      contact: "Contact",
      cta: "BOOK NOW",
      navLabel: "Navigation",
    },

    hero: {
      badge: "Medical Bay · Agadir, Morocco",
      line1: "Your smile",
      line2: "deserves",
      lineEm: "better.",
      sub: "World-class dentistry in Agadir — up to 70% cheaper than in Europe, with a palace stay included.",
      cta1: "FREE QUOTE · 24H",
      cta2: "Discover the stay",
      stats: [["1,500+", "patients"], ["70%", "savings"], ["5 days", "results"]],
    },

    marquee: ["AESTHETIC DENTISTRY", "IMPLANTOLOGY", "MEDICAL TOURISM", "LASER WHITENING", "SMILE DESIGN", "ZIRCONIA CROWNS", "E-MAX VENEERS", "AGADIR"],

    manifesto: {
      label: "Our promise",
      quote: "Outstanding medical care is no longer a privilege reserved for European capitals.",
      attribution: "Medical Bay, Agadir — established 2018",
      stats: [
        { n: "70%",    t: "cheaper than France, Belgium or Switzerland" },
        { n: "5 days", t: "for a complete, lasting Smile Design" },
        { n: "24h",    t: "guaranteed response time on every request" },
      ],
    },

    services: {
      label: "Our Services",
      title: "What we",
      titleEm: "create.",
      cta: "ALL TREATMENTS",
      items: [
        { n: "01", title: "SMILE DESIGN",          sub: "Full smile redesign",              body: "Ultra-thin veneers, composites and zirconia crowns for a naturally flawless result." },
        { n: "02", title: "IMPLANTOLOGY",           sub: "Permanent solutions",              body: "Nobel Biocare implants placed by Europe-trained specialists. Lifetime results." },
        { n: "03", title: "LASER WHITENING",        sub: "Instant radiance, one session",   body: "Zoom Whitening protocol. Up to 8 shades whiter in just 45 minutes." },
        { n: "04", title: "ALL-INCLUSIVE VIP STAY", sub: "Premium medical tourism",         body: "Flights, 5★ hotel, private transfers, medical concierge — we handle everything." },
      ],
    },

    testimonials: {
      label: "Real results, real people",
      title: "What they",
      titleEm: "say.",
      items: [
        {
          name: "Sophie M.",
          role: "Paris, France",
          treatment: "Full Smile Design",
          stars: 5,
          quote: "I never imagined experiencing such meticulous care at this price point. My smile is finally everything I'd always dreamed of — natural, radiant, perfect. The Medical Bay team's professionalism is truly unmatched.",
          img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150&h=150",
        },
        {
          name: "Thomas B.",
          role: "Brussels, Belgium",
          treatment: "Implantology",
          stars: 5,
          quote: "Three implants, two sessions. In Belgium I was quoted €9,000. Here, everything included — hotel, transfers, full treatment — came to under €3,500. The quality is absolutely impeccable.",
          img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150&h=150",
        },
        {
          name: "Maria C.",
          role: "Geneva, Switzerland",
          treatment: "E-max Veneers",
          stars: 5,
          quote: "Agadir is a stunning city to recover in. The fact that Medical Bay handles everything — from the airport to the hotel — let me focus entirely on my transformation.",
          img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150&h=150",
        },
        {
          name: "Pierre L.",
          role: "Lyon, France",
          treatment: "Zirconia Crowns",
          stars: 5,
          quote: "I was skeptical at first. I came back to Lyon with a smile that no one — not even my dentist — can tell isn't natural. Every step was explained with patience and total transparency.",
          img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150&h=150",
        },
        {
          name: "Amina K.",
          role: "Montreal, Canada",
          treatment: "Full Medical Stay",
          stars: 5,
          quote: "Flying in from Montreal, I had concerns about logistics. Medical Bay erased every doubt within 24 hours. A five-star experience, world-class care, and savings I still can't quite believe.",
          img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150&h=150",
        },
      ],
    },

    process: {
      label: "How it works",
      title: "4 steps,",
      titleEm: "zero stress.",
      sub: "From your first message to your flight home — we manage every detail so you can focus on one thing: your transformation.",
      steps: [
        { n: "01", title: "Free consultation",       body: "Send us your photos or X-rays. Your coordinator replies within 24h with a full cost estimate." },
        { n: "02", title: "Personalised care plan",  body: "Tailored schedule, curated hotel, everything arranged before you even pack your bag." },
        { n: "03", title: "VIP travel, handled",     body: "Airport pick-up, private transfer, hotel check-in — nothing for you to worry about." },
        { n: "04", title: "Transform & follow up",   body: "Treatment at an elite clinic. Visible results before departure, aftercare included." },
      ],
      nudge: "Getting started takes just",
      nudgeEm: "2 minutes.",
      cta: "START NOW",
    },

    destination: {
      label: "Destination",
      title: "Recovery as a",
      titleEm: "way of living.",
      body: "300 days of sunshine, 10 km of beach, and world-class medical infrastructure. Convalescence becomes a genuine luxury.",
      stats: [["3H", "from Europe"], ["300d", "of sunshine"], ["5★", "hotels"]],
    },

    instagram: {
      label: "Instagram",
      title: "Our",
      titleEm: "everyday.",
      handle: "@medicalbay.maroc",
      follow: "Follow on Instagram →",
    },

    faq: {
      label: "FAQ",
      title: "Your questions,",
      titleEm: "our answers.",
      cta: "ASK A QUESTION",
      items: [
        { q: "How quickly will I receive a quote?",           a: "We process all requests within 24 to 48 business hours of receiving your complete medical file via our form or WhatsApp." },
        { q: "How does airport pick-up work?",                a: "A dedicated team member meets you personally at Agadir Al Massira Airport with a name sign and takes you directly to your hotel or clinic." },
        { q: "Are your partner clinics certified?",           a: "Yes. Every partner clinic meets international safety and hygiene standards and is equipped with the latest medical technology." },
        { q: "Do I need to speak French or Arabic?",          a: "Not at all. Our entire team, including all physicians, is fully fluent in English. Clear, transparent communication is guaranteed throughout your stay." },
      ],
    },

    cta: {
      label: "Free quote · Reply within 24h",
      title: "Let's begin.",
      sub: "Join 1,500+ European patients who chose Medical Bay to transform their smile.",
      cta1: "START MY PROJECT FREE",
      cta2: "WHATSAPP US NOW",
    },
  },
} as const;

export type TKeys = typeof T;
