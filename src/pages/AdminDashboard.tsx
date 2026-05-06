import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Calendar, Users, MessageSquare,
  Clock, CheckCircle2, Trash2, Search, X, LogOut,
  Phone, Mail, ArrowUpRight, Check, Eye,
  TrendingUp, AlertCircle, ChevronDown, ExternalLink,
} from "lucide-react";
import logoMark from "@/assets/medicalbay-logo-mark.png";

// ─── TYPES & MOCK DATA ────────────────────────────────────────────────────────
type BookingStatus = "Nouveau" | "Confirmé" | "En cours" | "Terminé" | "Annulé";
type Tab = "overview" | "bookings" | "messages" | "patients";

interface Booking {
  id: string; name: string; email: string; phone: string;
  service: string; origin: string; date: string;
  status: BookingStatus; notes?: string;
}

interface Message {
  id: string; name: string; email: string; phone: string;
  subject: string; body: string; date: string; read: boolean;
}

const SEED_BOOKINGS: Booking[] = [
  { id: "MB-001", name: "Sophie Martin",   email: "sophie.martin@gmail.com",  phone: "+33 6 12 34 56 78", service: "Smile Design complet",       origin: "Paris, France",       date: "2026-05-10", status: "Nouveau",  notes: "Intéressée par les facettes E-max." },
  { id: "MB-002", name: "Thomas Bertrand", email: "thomas.b@outlook.com",      phone: "+32 475 12 34 56",  service: "Implantologie",              origin: "Bruxelles, Belgique", date: "2026-05-08", status: "Confirmé" },
  { id: "MB-003", name: "Maria Costas",    email: "m.costas@hotmail.com",      phone: "+41 76 234 56 78",  service: "Facettes porcelaine E-max",  origin: "Genève, Suisse",      date: "2026-05-15", status: "En cours",  notes: "Arrivée le 15 mai. Hôtel Sofia réservé." },
  { id: "MB-004", name: "Pierre Lambert",  email: "pierre.lambert@gmail.com",  phone: "+33 6 87 65 43 21", service: "Couronnes Zircone",           origin: "Lyon, France",        date: "2026-04-28", status: "Terminé" },
  { id: "MB-005", name: "Amina Khalil",    email: "amina.k@protonmail.com",    phone: "+1 514 234 5678",   service: "Séjour médical tout inclus",  origin: "Montréal, Canada",    date: "2026-05-20", status: "Nouveau" },
  { id: "MB-006", name: "Nadia Fontaine",  email: "nadia.f@gmail.com",         phone: "+33 7 12 34 56 78", service: "Blanchiment laser",          origin: "Nice, France",        date: "2026-05-18", status: "Confirmé" },
  { id: "MB-007", name: "Marc Dumont",     email: "marc.d@yahoo.fr",           phone: "+33 6 55 44 33 22", service: "Implantologie",              origin: "Toulouse, France",    date: "2026-05-22", status: "Nouveau" },
  { id: "MB-008", name: "Isabelle Renard", email: "i.renard@gmail.com",        phone: "+32 487 12 34 56",  service: "Smile Design complet",       origin: "Liège, Belgique",     date: "2026-04-20", status: "Annulé",   notes: "Annulé pour raisons personnelles." },
];

const SEED_MESSAGES: Message[] = [
  { id: "MSG-001", name: "Julien Marchand", email: "julien.m@gmail.com",    phone: "+33 6 11 22 33 44", subject: "Devis Smile Design", body: "Bonjour, je souhaiterais un devis pour un Smile Design complet avec facettes et blanchiment. Mon budget est environ 4 000 €. Pouvez-vous me recontacter ?", date: "2026-05-06", read: false },
  { id: "MSG-002", name: "Laure Petit",     email: "laure.petit@yahoo.fr",  phone: "+33 6 98 76 54 32", subject: "Question implants",  body: "Mon dentiste en France m'a proposé des implants à 6 000 €. Quels sont vos tarifs pour la même procédure incluant le séjour ?", date: "2026-05-05", read: false },
  { id: "MSG-003", name: "Karim Benali",    email: "k.benali@gmail.com",    phone: "+33 7 45 67 89 01", subject: "Séjour tout inclus", body: "Je suis intéressé par votre offre tout inclus. Pourriez-vous m'envoyer le programme et les dates disponibles pour juin ?", date: "2026-05-04", read: true  },
  { id: "MSG-004", name: "Sandrine Leroux", email: "sandrine.l@outlook.com",phone: "+32 471 23 45 67",  subject: "Soins urgents",      body: "Bonjour, j'ai une dent cassée et j'ai besoin de soins urgents. Je peux me déplacer dès la semaine prochaine.", date: "2026-05-03", read: true  },
  { id: "MSG-005", name: "Antoine Blanc",   email: "a.blanc@hotmail.com",   phone: "+41 78 234 56 78",  subject: "Couronnes zircone",  body: "Je cherche à remplacer 4 couronnes métalliques par des couronnes zircone. Quel serait le coût total incluant le séjour à Agadir ?", date: "2026-05-02", read: true  },
];

const SERVICE_REVENUE: Record<string, number> = {
  "Smile Design complet": 4500, "Implantologie": 3000,
  "Facettes porcelaine E-max": 2800, "Couronnes Zircone": 1800,
  "Blanchiment laser": 350, "Séjour médical tout inclus": 5200,
  "Consultation générale": 0,
};

const STATUS_CFG: Record<BookingStatus, { bg: string; text: string; dot: string; border: string }> = {
  "Nouveau":  { bg: "bg-primary/10",   text: "text-primary",       dot: "bg-primary",       border: "border-primary/30" },
  "Confirmé": { bg: "bg-emerald-50",   text: "text-emerald-700",   dot: "bg-emerald-500",   border: "border-emerald-200" },
  "En cours": { bg: "bg-amber-50",     text: "text-amber-700",     dot: "bg-amber-500",     border: "border-amber-200" },
  "Terminé":  { bg: "bg-foreground/6", text: "text-foreground/50", dot: "bg-foreground/25", border: "border-border" },
  "Annulé":   { bg: "bg-red-50",       text: "text-red-600",       dot: "bg-red-400",       border: "border-red-200" },
};

function StatusBadge({ status }: { status: BookingStatus }) {
  const c = STATUS_CFG[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[9px] tracking-[0.28em] uppercase font-bold border ${c.bg} ${c.text} ${c.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${c.dot}`} />
      {status}
    </span>
  );
}

// ─── LOGIN GATE ───────────────────────────────────────────────────────────────
function LoginGate({ onLogin }: { onLogin: () => void }) {
  const [pw, setPw] = useState("");
  const [error, setError] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pw === "MB2026") { onLogin(); }
    else { setError(true); setPw(""); }
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--ink))] flex items-center justify-center p-4">
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none grid-lines" />
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-sm bg-background border border-border shadow-2xl p-10">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-primary grid place-items-center">
            <img src={logoMark} alt="" className="w-6 h-6 brightness-0 invert" />
          </div>
          <div>
            <div className="display text-sm tracking-widest text-foreground">MEDICAL BAY</div>
            <div className="text-[9px] tracking-[0.4em] uppercase text-muted-foreground font-bold mt-0.5">Administration</div>
          </div>
        </div>
        <h1 className="display text-3xl text-foreground mb-2">Connexion</h1>
        <p className="text-sm text-muted-foreground font-light mb-8">Accès réservé au personnel autorisé.</p>
        <form onSubmit={submit} className="space-y-6">
          <label className="block group">
            <span className="text-[9px] tracking-[0.4em] uppercase font-bold text-muted-foreground group-focus-within:text-primary transition-colors">MOT DE PASSE</span>
            <input type="password" required value={pw} onChange={(e) => { setPw(e.target.value); setError(false); }}
              placeholder="••••••••"
              className="w-full mt-3 bg-transparent border-b border-border py-3 outline-none focus:border-primary transition-colors text-base font-light rounded-none placeholder:text-foreground/20" />
            {error && (
              <p className="text-red-500 text-[10px] tracking-[0.2em] uppercase font-bold mt-2 flex items-center gap-1.5">
                <AlertCircle className="w-3 h-3" /> Mot de passe incorrect
              </p>
            )}
          </label>
          <button type="submit" className="w-full btn-primary !py-4">
            ACCÉDER AU TABLEAU DE BORD
          </button>
        </form>
        <p className="text-[9px] text-muted-foreground/40 text-center mt-8 tracking-widest">
          Mot de passe : MB2026
        </p>
      </motion.div>
    </div>
  );
}

// ─── SIDEBAR ─────────────────────────────────────────────────────────────────
const NAV = [
  { id: "overview" as Tab,  label: "Vue d'ensemble", icon: LayoutDashboard },
  { id: "bookings" as Tab,  label: "Rendez-vous",    icon: Calendar },
  { id: "messages" as Tab,  label: "Messages",       icon: MessageSquare },
  { id: "patients" as Tab,  label: "Patients",       icon: Users },
];

function Sidebar({ tab, setTab, unread, onLogout }: {
  tab: Tab; setTab: (t: Tab) => void; unread: number; onLogout: () => void;
}) {
  return (
    <aside className="w-[240px] shrink-0 bg-[hsl(var(--ink))] flex flex-col h-screen sticky top-0">
      {/* Brand */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-white/8">
        <div className="w-9 h-9 bg-primary grid place-items-center shrink-0">
          <img src={logoMark} alt="" className="w-5 h-5 brightness-0 invert" />
        </div>
        <div>
          <div className="display text-[11px] tracking-[0.2em] text-white font-black">MEDICAL BAY</div>
          <div className="text-[8px] tracking-[0.35em] uppercase text-white/30 font-bold mt-0.5">Admin</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV.map((item) => {
          const active = tab === item.id;
          return (
            <button key={item.id} onClick={() => setTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-200 group ${active ? "bg-primary text-white" : "text-white/40 hover:text-white hover:bg-white/5"}`}>
              <item.icon className="w-4 h-4 shrink-0" />
              <span className="text-[11px] tracking-[0.18em] uppercase font-bold">{item.label}</span>
              {item.id === "messages" && unread > 0 && (
                <span className="ml-auto w-5 h-5 bg-white/20 text-white text-[9px] font-black flex items-center justify-center shrink-0">
                  {unread}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-white/8 space-y-0.5">
        <Link to="/" target="_blank"
          className="w-full flex items-center gap-3 px-4 py-3 text-white/30 hover:text-white hover:bg-white/5 transition-colors">
          <ExternalLink className="w-4 h-4 shrink-0" />
          <span className="text-[11px] tracking-[0.18em] uppercase font-bold">Voir le site</span>
        </Link>
        <button onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-white/30 hover:text-red-400 hover:bg-red-500/8 transition-colors">
          <LogOut className="w-4 h-4 shrink-0" />
          <span className="text-[11px] tracking-[0.18em] uppercase font-bold">Déconnexion</span>
        </button>
      </div>
    </aside>
  );
}

// ─── OVERVIEW ─────────────────────────────────────────────────────────────────
function Overview({ bookings, messages, setTab }: {
  bookings: Booking[]; messages: Message[]; setTab: (t: Tab) => void;
}) {
  const stats = useMemo(() => {
    const total = bookings.length;
    const confirmed = bookings.filter(b => b.status === "Confirmé" || b.status === "En cours").length;
    const done = bookings.filter(b => b.status === "Terminé").length;
    const revenue = bookings
      .filter(b => b.status === "Terminé")
      .reduce((acc, b) => acc + (SERVICE_REVENUE[b.service] ?? 0), 0);
    return { total, confirmed, done, revenue };
  }, [bookings]);

  const recent = bookings.slice(0, 5);
  const unread = messages.filter(m => !m.read).length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="display text-3xl text-foreground mb-1">Vue d'ensemble</h1>
        <p className="text-sm text-muted-foreground font-light">Tableau de bord · Medical Bay Agadir</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: "Leads totaux",    value: stats.total,      sub: "demandes reçues",   icon: TrendingUp,    color: "text-primary", bg: "bg-primary/8" },
          { label: "En attente",      value: stats.confirmed,  sub: "confirmés & en cours", icon: Clock,      color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Séjours terminés",value: stats.done,       sub: "patients traités",  icon: CheckCircle2,  color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Revenus estimés", value: `${stats.revenue.toLocaleString("fr")} €`, sub: "séjours terminés", icon: TrendingUp, color: "text-primary", bg: "bg-primary/8" },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="bg-background border border-border p-6">
            <div className={`w-10 h-10 ${s.bg} flex items-center justify-center mb-5`}>
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <div className={`display text-4xl font-black mb-1 ${s.color}`}>{s.value}</div>
            <div className="text-[8px] tracking-[0.35em] uppercase font-bold text-muted-foreground">{s.label}</div>
            <div className="text-[9px] text-muted-foreground/50 mt-0.5">{s.sub}</div>
          </motion.div>
        ))}
      </div>

      {/* Quick alerts */}
      {unread > 0 && (
        <button onClick={() => setTab("messages")}
          className="w-full flex items-center gap-4 bg-primary/8 border border-primary/25 px-6 py-4 hover:border-primary/50 transition-colors group text-left">
          <AlertCircle className="w-5 h-5 text-primary shrink-0" />
          <span className="text-sm font-light text-foreground flex-1">
            Vous avez <strong className="font-bold text-primary">{unread} message{unread > 1 ? "s" : ""} non lu{unread > 1 ? "s" : ""}</strong> en attente de réponse.
          </span>
          <ArrowUpRight className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
      )}

      {/* Recent bookings */}
      <div className="bg-background border border-border">
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <div>
            <div className="display text-lg text-foreground">Derniers rendez-vous</div>
            <div className="text-[9px] tracking-[0.3em] uppercase text-muted-foreground font-bold mt-0.5">5 récents</div>
          </div>
          <button onClick={() => setTab("bookings")}
            className="text-[9px] tracking-[0.3em] uppercase font-bold text-primary hover:underline">
            Voir tout →
          </button>
        </div>
        <div className="divide-y divide-border">
          {recent.map((b) => (
            <div key={b.id} className="flex items-center gap-4 px-6 py-4 hover:bg-[hsl(var(--mist)/0.3)] transition-colors">
              <div className="w-9 h-9 bg-[hsl(var(--mist))] flex items-center justify-center shrink-0">
                <span className="display text-xs text-primary">{b.name.split(" ").map(n => n[0]).join("").toUpperCase()}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="display text-sm text-foreground truncate">{b.name}</div>
                <div className="text-[9px] text-muted-foreground truncate">{b.service} · {b.origin}</div>
              </div>
              <StatusBadge status={b.status} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── BOOKINGS ─────────────────────────────────────────────────────────────────
function Bookings({ bookings, setBookings }: {
  bookings: Booking[]; setBookings: (b: Booking[]) => void;
}) {
  const [filter, setFilter] = useState<BookingStatus | "Tous">("Tous");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Booking | null>(null);
  const [statusOpen, setStatusOpen] = useState<string | null>(null);

  const filtered = useMemo(() => bookings.filter(b => {
    const matchFilter = filter === "Tous" || b.status === filter;
    const q = search.toLowerCase();
    const matchSearch = !q || b.name.toLowerCase().includes(q) || b.email.toLowerCase().includes(q) || b.service.toLowerCase().includes(q) || b.origin.toLowerCase().includes(q);
    return matchFilter && matchSearch;
  }), [bookings, filter, search]);

  const updateStatus = (id: string, status: BookingStatus) => {
    setBookings(bookings.map(b => b.id === id ? { ...b, status } : b));
    if (selected?.id === id) setSelected(prev => prev ? { ...prev, status } : null);
    setStatusOpen(null);
  };

  const deleteBooking = (id: string) => {
    setBookings(bookings.filter(b => b.id !== id));
    if (selected?.id === id) setSelected(null);
  };

  const counts = useMemo(() => ({
    Tous: bookings.length,
    Nouveau: bookings.filter(b => b.status === "Nouveau").length,
    Confirmé: bookings.filter(b => b.status === "Confirmé").length,
    "En cours": bookings.filter(b => b.status === "En cours").length,
    Terminé: bookings.filter(b => b.status === "Terminé").length,
    Annulé: bookings.filter(b => b.status === "Annulé").length,
  }), [bookings]);

  const FILTERS: (BookingStatus | "Tous")[] = ["Tous", "Nouveau", "Confirmé", "En cours", "Terminé", "Annulé"];

  return (
    <div className="flex gap-6 h-full">
      {/* Main table */}
      <div className="flex-1 min-w-0 space-y-5">
        <div>
          <h1 className="display text-3xl text-foreground mb-1">Rendez-vous</h1>
          <p className="text-sm text-muted-foreground font-light">{bookings.length} demande{bookings.length > 1 ? "s" : ""} au total</p>
        </div>

        {/* Filters + Search */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex gap-1 flex-wrap">
            {FILTERS.map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1.5 text-[9px] tracking-[0.25em] uppercase font-bold border transition-colors ${filter === f ? "bg-primary text-white border-primary" : "bg-background border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"}`}>
                {f} <span className="opacity-60 ml-0.5">({counts[f]})</span>
              </button>
            ))}
          </div>
          <div className="relative ml-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher…"
              className="pl-9 pr-4 py-2 border border-border bg-background text-sm font-light outline-none focus:border-primary transition-colors w-52 rounded-none" />
          </div>
        </div>

        {/* Table */}
        <div className="bg-background border border-border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-[hsl(var(--off))]">
                {["ID", "Patient", "Service", "Origine", "Date", "Statut", "Actions"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[8px] tracking-[0.4em] uppercase font-bold text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-sm text-muted-foreground font-light">Aucun résultat</td></tr>
              ) : filtered.map(b => (
                <tr key={b.id} onClick={() => setSelected(b)}
                  className={`hover:bg-[hsl(var(--mist)/0.3)] cursor-pointer transition-colors ${selected?.id === b.id ? "bg-primary/5" : ""}`}>
                  <td className="px-4 py-3 text-[9px] font-bold text-muted-foreground tracking-widest">{b.id}</td>
                  <td className="px-4 py-3">
                    <div className="display text-sm text-foreground">{b.name}</div>
                    <div className="text-[9px] text-muted-foreground">{b.email}</div>
                  </td>
                  <td className="px-4 py-3 text-sm font-light text-foreground/70 max-w-[140px] truncate">{b.service}</td>
                  <td className="px-4 py-3 text-sm font-light text-muted-foreground">{b.origin}</td>
                  <td className="px-4 py-3 text-[10px] font-bold text-muted-foreground">{b.date}</td>
                  <td className="px-4 py-3"><StatusBadge status={b.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                      <button onClick={() => setSelected(b)}
                        className="w-8 h-8 border border-border flex items-center justify-center hover:border-primary hover:text-primary transition-colors text-muted-foreground">
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => deleteBooking(b.id)}
                        className="w-8 h-8 border border-border flex items-center justify-center hover:border-red-400 hover:text-red-500 transition-colors text-muted-foreground">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail panel */}
      <AnimatePresence>
        {selected && (
          <motion.div initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 24 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="w-80 shrink-0 bg-background border border-border self-start sticky top-6">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <span className="text-[9px] tracking-[0.4em] uppercase font-bold text-muted-foreground">Détail</span>
              <button onClick={() => setSelected(null)} className="w-7 h-7 border border-border flex items-center justify-center hover:border-primary hover:text-primary transition-colors">
                <X className="w-3 h-3" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Header */}
              <div>
                <div className="w-12 h-12 bg-[hsl(var(--mist))] flex items-center justify-center mb-3">
                  <span className="display text-lg text-primary">{selected.name.split(" ").map(n => n[0]).join("").toUpperCase()}</span>
                </div>
                <div className="display text-xl text-foreground">{selected.name}</div>
                <div className="text-[9px] tracking-[0.3em] uppercase text-muted-foreground font-bold mt-1">{selected.id}</div>
              </div>

              <div className="space-y-3">
                {[
                  { icon: Mail,  label: selected.email },
                  { icon: Phone, label: selected.phone },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-3 text-sm">
                    <Icon className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span className="font-light text-foreground/70">{label}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-border pt-5 space-y-3">
                {[
                  ["Service",  selected.service],
                  ["Origine",  selected.origin],
                  ["Date",     selected.date],
                ].map(([k, v]) => (
                  <div key={k}>
                    <div className="text-[8px] tracking-[0.4em] uppercase font-bold text-muted-foreground mb-0.5">{k}</div>
                    <div className="text-sm font-light text-foreground">{v}</div>
                  </div>
                ))}
                {selected.notes && (
                  <div>
                    <div className="text-[8px] tracking-[0.4em] uppercase font-bold text-muted-foreground mb-0.5">Notes</div>
                    <div className="text-sm font-light text-foreground/70 leading-relaxed">{selected.notes}</div>
                  </div>
                )}
              </div>

              {/* Status changer */}
              <div className="border-t border-border pt-5">
                <div className="text-[8px] tracking-[0.4em] uppercase font-bold text-muted-foreground mb-3">Changer le statut</div>
                <div className="relative">
                  <button onClick={() => setStatusOpen(statusOpen ? null : selected.id)}
                    className="w-full flex items-center justify-between px-4 py-3 border border-border hover:border-primary/50 transition-colors">
                    <StatusBadge status={selected.status} />
                    <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                  <AnimatePresence>
                    {statusOpen === selected.id && (
                      <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.15 }}
                        className="absolute top-full left-0 right-0 bg-background border border-border shadow-lg z-20 mt-1">
                        {(["Nouveau", "Confirmé", "En cours", "Terminé", "Annulé"] as BookingStatus[]).map(s => (
                          <button key={s} onClick={() => updateStatus(selected.id, s)}
                            className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-[hsl(var(--mist)/0.5)] transition-colors ${selected.status === s ? "text-primary font-bold" : "text-foreground/70"}`}>
                            {selected.status === s && <Check className="w-3 h-3 text-primary shrink-0" />}
                            <span className={selected.status === s ? "" : "ml-5"}>{s}</span>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <button onClick={() => deleteBooking(selected.id)}
                className="w-full flex items-center justify-center gap-2 border border-red-200 text-red-500 py-3 hover:bg-red-50 transition-colors text-[10px] tracking-[0.3em] uppercase font-bold">
                <Trash2 className="w-3.5 h-3.5" /> Supprimer
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── MESSAGES ─────────────────────────────────────────────────────────────────
function Messages({ messages, setMessages }: {
  messages: Message[]; setMessages: (m: Message[]) => void;
}) {
  const [selected, setSelected] = useState<Message | null>(null);

  const open = (m: Message) => {
    setSelected(m);
    if (!m.read) setMessages(messages.map(x => x.id === m.id ? { ...x, read: true } : x));
  };

  const deleteMsg = (id: string) => {
    setMessages(messages.filter(m => m.id !== id));
    if (selected?.id === id) setSelected(null);
  };

  const markAllRead = () => setMessages(messages.map(m => ({ ...m, read: true })));

  const unreadCount = messages.filter(m => !m.read).length;

  return (
    <div className="flex gap-6 h-full">
      {/* List */}
      <div className="w-80 shrink-0 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="display text-3xl text-foreground mb-0.5">Messages</h1>
            {unreadCount > 0 && (
              <span className="text-[9px] tracking-[0.3em] uppercase font-bold text-primary">{unreadCount} non lu{unreadCount > 1 ? "s" : ""}</span>
            )}
          </div>
          {unreadCount > 0 && (
            <button onClick={markAllRead}
              className="text-[9px] tracking-[0.25em] uppercase font-bold text-muted-foreground hover:text-primary transition-colors">
              Tout lire
            </button>
          )}
        </div>

        <div className="space-y-1">
          {messages.length === 0 ? (
            <div className="bg-background border border-border p-6 text-center text-sm text-muted-foreground font-light">Aucun message</div>
          ) : messages.map(m => (
            <button key={m.id} onClick={() => open(m)}
              className={`w-full text-left p-4 border transition-all duration-200 ${selected?.id === m.id ? "border-primary bg-primary/5" : "border-border bg-background hover:border-primary/40 hover:bg-[hsl(var(--mist)/0.3)]"}`}>
              <div className="flex items-start justify-between gap-2 mb-1">
                <div className="flex items-center gap-2">
                  {!m.read && <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-0.5" />}
                  <span className={`display text-sm ${m.read ? "text-foreground/70" : "text-foreground"}`}>{m.name}</span>
                </div>
                <span className="text-[9px] text-muted-foreground shrink-0">{m.date.slice(5)}</span>
              </div>
              <div className={`text-[10px] tracking-[0.15em] uppercase font-bold mb-1 truncate ${m.read ? "text-muted-foreground" : "text-primary/80"}`}>
                {m.subject}
              </div>
              <div className="text-xs text-muted-foreground font-light truncate leading-relaxed">{m.body}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Detail */}
      <div className="flex-1 min-w-0">
        {!selected ? (
          <div className="h-full bg-background border border-border flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="w-10 h-10 text-border mx-auto mb-4" />
              <p className="text-sm text-muted-foreground font-light">Sélectionnez un message</p>
            </div>
          </div>
        ) : (
          <motion.div key={selected.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="bg-background border border-border h-full flex flex-col">
            <div className="px-8 py-6 border-b border-border flex items-start justify-between gap-4">
              <div>
                <div className="display text-xl text-foreground mb-1">{selected.subject}</div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground font-light">
                  <span className="font-bold text-foreground">{selected.name}</span>
                  <span>{selected.date}</span>
                </div>
              </div>
              <button onClick={() => deleteMsg(selected.id)}
                className="w-9 h-9 border border-border flex items-center justify-center text-muted-foreground hover:border-red-300 hover:text-red-500 transition-colors shrink-0">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="p-8 flex-1 overflow-y-auto">
              <div className="flex flex-wrap gap-4 mb-8 pb-8 border-b border-border">
                {[
                  { icon: Mail,  label: selected.email, href: `mailto:${selected.email}` },
                  { icon: Phone, label: selected.phone,  href: `tel:${selected.phone}` },
                ].map(({ icon: Icon, label, href }) => (
                  <a key={label} href={href}
                    className="flex items-center gap-2 text-sm font-light text-foreground/70 hover:text-primary transition-colors">
                    <Icon className="w-4 h-4 text-primary" /> {label}
                  </a>
                ))}
              </div>

              <p className="text-base font-light leading-relaxed text-foreground/70">{selected.body}</p>
            </div>

            <div className="px-8 py-5 border-t border-border flex gap-3">
              <a href={`mailto:${selected.email}`}
                className="btn-primary !py-3 !px-6 gap-2">
                <Mail className="w-3.5 h-3.5" /> Répondre par e-mail
              </a>
              <a href={`https://api.whatsapp.com/send/?phone=${selected.phone.replace(/\D/g, "")}`}
                target="_blank" rel="noreferrer"
                className="btn-ghost !py-3 !px-6">
                WhatsApp
              </a>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// ─── PATIENTS ─────────────────────────────────────────────────────────────────
function Patients({ bookings }: { bookings: Booking[] }) {
  const [search, setSearch] = useState("");

  const patients = useMemo(() => {
    const map = new Map<string, Booking>();
    bookings.forEach(b => {
      if (!map.has(b.email) || b.date > (map.get(b.email)?.date ?? "")) map.set(b.email, b);
    });
    return Array.from(map.values()).filter(p => {
      const q = search.toLowerCase();
      return !q || p.name.toLowerCase().includes(q) || p.email.toLowerCase().includes(q) || p.origin.toLowerCase().includes(q);
    });
  }, [bookings, search]);

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="display text-3xl text-foreground mb-1">Patients</h1>
          <p className="text-sm text-muted-foreground font-light">{patients.length} patient{patients.length > 1 ? "s" : ""} enregistré{patients.length > 1 ? "s" : ""}</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher…"
            className="pl-9 pr-4 py-2 border border-border bg-background text-sm font-light outline-none focus:border-primary transition-colors w-52 rounded-none" />
        </div>
      </div>

      <div className="bg-background border border-border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-[hsl(var(--off))]">
              {["Patient", "Contact", "Origine", "Dernier soin", "Statut"].map(h => (
                <th key={h} className="px-4 py-3 text-left text-[8px] tracking-[0.4em] uppercase font-bold text-muted-foreground">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {patients.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-10 text-center text-sm text-muted-foreground font-light">Aucun résultat</td></tr>
            ) : patients.map(p => (
              <tr key={p.id} className="hover:bg-[hsl(var(--mist)/0.3)] transition-colors">
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-[hsl(var(--mist))] flex items-center justify-center shrink-0">
                      <span className="display text-xs text-primary">{p.name.split(" ").map(n => n[0]).join("").toUpperCase()}</span>
                    </div>
                    <div className="display text-sm text-foreground">{p.name}</div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="text-sm font-light text-foreground/70">{p.email}</div>
                  <div className="text-[10px] text-muted-foreground">{p.phone}</div>
                </td>
                <td className="px-4 py-4 text-sm font-light text-muted-foreground">{p.origin}</td>
                <td className="px-4 py-4 text-sm font-light text-foreground/70 max-w-[160px] truncate">{p.service}</td>
                <td className="px-4 py-4"><StatusBadge status={p.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [authed, setAuthed] = useState(false);
  const [tab, setTab] = useState<Tab>("overview");
  const [bookings, setBookings] = useState<Booking[]>(SEED_BOOKINGS);
  const [messages, setMessages] = useState<Message[]>(SEED_MESSAGES);

  const unread = messages.filter(m => !m.read).length;

  if (!authed) return <LoginGate onLogin={() => setAuthed(true)} />;

  return (
    <div className="flex min-h-screen bg-[hsl(var(--off))]">
      <Sidebar tab={tab} setTab={setTab} unread={unread} onLogout={() => setAuthed(false)} />

      <main className="flex-1 min-w-0 p-8 overflow-auto">
        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
            {tab === "overview"  && <Overview  bookings={bookings} messages={messages} setTab={setTab} />}
            {tab === "bookings"  && <Bookings  bookings={bookings} setBookings={setBookings} />}
            {tab === "messages"  && <Messages  messages={messages} setMessages={setMessages} />}
            {tab === "patients"  && <Patients  bookings={bookings} />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
