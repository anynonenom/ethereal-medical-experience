import { useState, useMemo, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Calendar, Users, MessageSquare,
  CheckCircle2, Trash2, Search, X, LogOut,
  Phone, Mail, ArrowUpRight, Check, Eye,
  TrendingUp, AlertCircle, ChevronDown, ExternalLink,
  ChevronLeft, ChevronRight, Edit3, Save, Plus,
  BarChart3, Zap, Download, Tag,
  PhoneCall, MessageCircle, AtSign, StickyNote,
  Bell, BellOff, Kanban,
  Send, Copy, CheckCheck, UserPlus, Activity,
  RefreshCw, Loader2,
} from "lucide-react";
import logoMark from "@/assets/medicalbay-logo-mark.png";
import { supabase } from "@/lib/supabase";
import { sendEmail } from "@/lib/email";
import {
  fetchBookings, fetchMessages,
  createBooking, updateBookingFields, changeBookingStatus,
  deleteBooking as apiDeleteBooking, addContactLog,
  markMessageRead, markAllMessagesRead,
  deleteMessage as apiDeleteMessage,
} from "@/lib/crm-api";
import type {
  Booking, Message, BookingStatus, ContactEntry, HistoryEntry, LogType, LeadSource,
} from "@/lib/crm-api";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
type Tab = "overview" | "pipeline" | "bookings" | "messages" | "patients" | "calendar";

const SERVICE_REVENUE: Record<string, number> = {
  "Smile Design complet": 4500, "Implantologie": 3000,
  "Facettes porcelaine E-max": 2800, "Couronnes Zircone": 1800,
  "Blanchiment laser": 350, "Séjour médical tout inclus": 5200,
  "Consultation générale": 0,
};

const STATUS_CFG: Record<BookingStatus, { bg: string; text: string; dot: string; border: string; col: string }> = {
  "Nouveau":  { bg: "bg-primary/10",   text: "text-primary",       dot: "bg-primary",       border: "border-primary/30",   col: "bg-primary/5 border-t-2 border-t-primary" },
  "Confirmé": { bg: "bg-emerald-50",   text: "text-emerald-700",   dot: "bg-emerald-500",   border: "border-emerald-200",  col: "bg-emerald-50/60 border-t-2 border-t-emerald-500" },
  "En cours": { bg: "bg-amber-50",     text: "text-amber-700",     dot: "bg-amber-500",     border: "border-amber-200",    col: "bg-amber-50/60 border-t-2 border-t-amber-500" },
  "Terminé":  { bg: "bg-foreground/6", text: "text-foreground/50", dot: "bg-foreground/25", border: "border-border",       col: "bg-[hsl(var(--off))] border-t-2 border-t-foreground/20" },
  "Annulé":   { bg: "bg-red-50",       text: "text-red-600",       dot: "bg-red-400",       border: "border-red-200",      col: "bg-red-50/40 border-t-2 border-t-red-400" },
};

const TAG_COLORS: Record<string, string> = {
  "VIP":           "bg-amber-100 text-amber-700 border-amber-300",
  "Prioritaire":   "bg-red-100 text-red-600 border-red-300",
  "Urgent":        "bg-orange-100 text-orange-700 border-orange-300",
  "Budget limité": "bg-blue-100 text-blue-700 border-blue-300",
  "Famille":       "bg-purple-100 text-purple-700 border-purple-300",
  "Suivi requis":  "bg-primary/10 text-primary border-primary/30",
};
const ALL_TAGS = Object.keys(TAG_COLORS);

const LOG_CFG: Record<LogType, { icon: React.ElementType; label: string; color: string }> = {
  call:     { icon: PhoneCall,     label: "Appel",    color: "text-emerald-600 bg-emerald-50" },
  email:    { icon: AtSign,        label: "E-mail",   color: "text-blue-600 bg-blue-50" },
  whatsapp: { icon: MessageCircle, label: "WhatsApp", color: "text-primary bg-primary/8" },
  note:     { icon: StickyNote,    label: "Note",     color: "text-amber-600 bg-amber-50" },
};

const QUICK_TEMPLATES = [
  { label: "Confirmation RDV", body: "Bonjour {prenom}, nous avons bien reçu votre demande et confirmons votre rendez-vous. Notre équipe vous accueillera à Agadir. N'hésitez pas si vous avez des questions." },
  { label: "Devis reçu",       body: "Bonjour {prenom}, suite à votre demande, nous vous faisons parvenir votre devis personnalisé. Ce devis inclut le soin, l'hébergement et le transfert aéroport. Cordialement, l'équipe Medical Bay." },
  { label: "Relance 48h",      body: "Bonjour {prenom}, nous revenons vers vous concernant votre demande de {soin}. Avez-vous des questions ? Nous sommes disponibles par WhatsApp pour répondre rapidement." },
  { label: "Post-séjour",      body: "Bonjour {prenom}, nous espérons que votre séjour s'est parfaitement passé. N'hésitez pas à nous laisser un avis et à recommander Medical Bay à votre entourage. Merci de votre confiance !" },
];

const SERVICES = ["Smile Design complet","Facettes porcelaine E-max","Implantologie","Couronnes Zircone","Blanchiment laser","Séjour médical tout inclus","Consultation générale"];
const SOURCES: LeadSource[] = ["Site web","WhatsApp","Instagram","Référence","Autre"];

const SECTION_OF: Record<Tab, "dashboard" | "crm"> = {
  overview: "dashboard", calendar: "dashboard",
  pipeline: "crm", bookings: "crm", messages: "crm", patients: "crm",
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const newId = () => `MB-${Date.now().toString(36).slice(-4).toUpperCase()}${Math.random().toString(36).slice(2,4).toUpperCase()}`;
const newLogId = () => `log-${Date.now()}-${Math.random().toString(36).slice(2,6)}`;

function fmtTs(ts: string) {
  const d = new Date(ts);
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" }) + " · " +
    d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

function StatusBadge({ status }: { status: BookingStatus }) {
  const c = STATUS_CFG[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[9px] tracking-[0.28em] uppercase font-bold border ${c.bg} ${c.text} ${c.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${c.dot}`} /> {status}
    </span>
  );
}

function TagChip({ tag, onRemove }: { tag: string; onRemove?: () => void }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[8px] tracking-[0.2em] uppercase font-bold border ${TAG_COLORS[tag] ?? "bg-border/30 text-muted-foreground border-border"}`}>
      {tag}
      {onRemove && (
        <button onClick={onRemove} className="hover:opacity-60 transition-opacity ml-0.5">
          <X className="w-2 h-2" />
        </button>
      )}
    </span>
  );
}

// ─── LOGIN GATE ───────────────────────────────────────────────────────────────
function LoginGate({ onLogin }: { onLogin: () => void }) {
  const [pw, setPw] = useState(""); const [error, setError] = useState(false);
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pw === "MB2026") onLogin(); else { setError(true); setPw(""); }
  };
  return (
    <div className="min-h-screen bg-[hsl(var(--ink))] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-sm bg-background border border-border shadow-2xl p-10">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-primary grid place-items-center">
            <img src={logoMark} alt="" className="w-6 h-6 brightness-0 invert" />
          </div>
          <div>
            <div className="display text-sm tracking-widest text-foreground">MEDICAL BAY</div>
            <div className="text-[9px] tracking-[0.4em] uppercase text-muted-foreground font-bold mt-0.5">CRM Administration</div>
          </div>
        </div>
        <h1 className="display text-3xl text-foreground mb-2">Connexion</h1>
        <p className="text-sm text-muted-foreground font-light mb-8">Accès réservé au personnel autorisé.</p>
        <form onSubmit={submit} className="space-y-6">
          <label className="block group">
            <span className="text-[9px] tracking-[0.4em] uppercase font-bold text-muted-foreground group-focus-within:text-primary transition-colors">MOT DE PASSE</span>
            <input type="password" required value={pw} onChange={(e) => { setPw(e.target.value); setError(false); }} placeholder="••••••••"
              className="w-full mt-3 bg-transparent border-b border-border py-3 outline-none focus:border-primary transition-colors text-base font-light rounded-none placeholder:text-foreground/20" />
            {error && <p className="text-red-500 text-[10px] tracking-[0.2em] uppercase font-bold mt-2 flex items-center gap-1.5"><AlertCircle className="w-3 h-3" /> Mot de passe incorrect</p>}
          </label>
          <button type="submit" className="w-full btn-primary !py-4">ACCÉDER AU CRM</button>
        </form>
        <p className="text-[9px] text-muted-foreground/40 text-center mt-8 tracking-widest">Mot de passe : MB2026</p>
      </motion.div>
    </div>
  );
}

// ─── NEW LEAD MODAL ───────────────────────────────────────────────────────────
const BLANK_FORM = { nom: "", prenom: "", email: "", phone: "", service: "Consultation générale", origin: "", date: "", source: "Site web" as LeadSource, value: "", notes: "" };

function NewLeadModal({ onAdd, onClose }: { onAdd: (b: Booking) => void; onClose: () => void }) {
  const [form, setForm] = useState(BLANK_FORM);
  const [saving, setSaving] = useState(false);
  const set = (k: keyof typeof BLANK_FORM, v: string) => setForm(f => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const booking: Booking = {
      id: newId(),
      name: `${form.prenom} ${form.nom}`.trim(),
      email: form.email, phone: form.phone,
      service: form.service, origin: form.origin,
      date: form.date || new Date().toISOString().slice(0, 10),
      status: "Nouveau", notes: form.notes, tags: [],
      source: form.source as LeadSource,
      value: Number(form.value) || SERVICE_REVENUE[form.service] || 0,
      contactLog: [],
      history: [{ ts: new Date().toISOString(), action: "Lead créé manuellement" }],
    };
    onAdd(booking);
    onClose();
  };

  const field = (label: string, key: keyof typeof BLANK_FORM, type = "text", placeholder = "") => (
    <label className="block group" key={key}>
      <span className="text-[9px] tracking-[0.4em] uppercase font-bold text-muted-foreground group-focus-within:text-primary transition-colors">{label}</span>
      <input required={["nom","email","phone"].includes(key)} type={type} placeholder={placeholder}
        value={form[key]} onChange={e => set(key, e.target.value)}
        className="w-full mt-2 bg-transparent border-b border-border py-2.5 outline-none focus:border-primary transition-colors text-sm font-light rounded-none placeholder:text-foreground/25" />
    </label>
  );

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose} className="fixed inset-0 z-[100] backdrop-blur-sm"
        style={{ background: "hsl(var(--ink) / 0.6)" }} />
      <div className="fixed inset-0 z-[101] overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4 py-10">
          <motion.div initial={{ opacity: 0, y: 24, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-xl bg-background border border-border shadow-2xl">
            <div className="flex items-center justify-between px-8 py-6 border-b border-border">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-7 h-7 bg-primary flex items-center justify-center"><UserPlus className="w-3.5 h-3.5 text-white" /></div>
                  <h2 className="display text-xl text-foreground">Nouveau patient / lead</h2>
                </div>
                <p className="text-xs text-muted-foreground font-light ml-10">Ajout manuel · statut initial : Nouveau</p>
              </div>
              <button onClick={onClose} className="w-8 h-8 border border-border flex items-center justify-center hover:border-primary hover:text-primary transition-colors"><X className="w-3.5 h-3.5" /></button>
            </div>
            <form onSubmit={submit} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-5">
                {field("Prénom", "prenom", "text", "Jean")}
                {field("Nom",    "nom",    "text", "Dupont")}
              </div>
              <div className="grid grid-cols-2 gap-5">
                {field("Email",                "email", "email", "jean.dupont@gmail.com")}
                {field("Téléphone / WhatsApp", "phone", "tel",   "+33 6 00 00 00 00")}
              </div>
              <div className="grid grid-cols-2 gap-5">
                <label className="block group">
                  <span className="text-[9px] tracking-[0.4em] uppercase font-bold text-muted-foreground group-focus-within:text-primary transition-colors">Soin souhaité</span>
                  <select value={form.service} onChange={e => set("service", e.target.value)}
                    className="w-full mt-2 bg-transparent border-b border-border py-2.5 outline-none focus:border-primary transition-colors text-sm font-light appearance-none rounded-none cursor-pointer">
                    {SERVICES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </label>
                <label className="block group">
                  <span className="text-[9px] tracking-[0.4em] uppercase font-bold text-muted-foreground group-focus-within:text-primary transition-colors">Source</span>
                  <select value={form.source} onChange={e => set("source", e.target.value as LeadSource)}
                    className="w-full mt-2 bg-transparent border-b border-border py-2.5 outline-none focus:border-primary transition-colors text-sm font-light appearance-none rounded-none cursor-pointer">
                    {SOURCES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </label>
              </div>
              <div className="grid grid-cols-2 gap-5">
                {field("Ville / Pays d'origine", "origin", "text",   "Paris, France")}
                {field("Valeur estimée (€)",      "value",  "number", "0")}
              </div>
              <div className="grid grid-cols-2 gap-5">
                <label className="block group">
                  <span className="text-[9px] tracking-[0.4em] uppercase font-bold text-muted-foreground group-focus-within:text-primary transition-colors">Date de rendez-vous</span>
                  <input type="date" value={form.date} onChange={e => set("date", e.target.value)}
                    className="w-full mt-2 bg-transparent border-b border-border py-2.5 outline-none focus:border-primary transition-colors text-sm font-light rounded-none" />
                </label>
                <div />
              </div>
              <label className="block group">
                <span className="text-[9px] tracking-[0.4em] uppercase font-bold text-muted-foreground group-focus-within:text-primary transition-colors">Notes <span className="opacity-40 normal-case tracking-normal font-normal">(optionnel)</span></span>
                <textarea rows={2} placeholder="Informations utiles…" value={form.notes} onChange={e => set("notes", e.target.value)}
                  className="w-full mt-2 bg-transparent border-b border-border py-2.5 outline-none focus:border-primary transition-colors text-sm font-light resize-none rounded-none placeholder:text-foreground/25" />
              </label>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="flex-1 btn-primary !py-4 gap-2 disabled:opacity-60">
                  {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Enregistrement…</> : <><UserPlus className="w-4 h-4" /> Ajouter au CRM</>}
                </button>
                <button type="button" onClick={onClose} className="px-6 py-4 border border-border text-[10px] tracking-[0.3em] uppercase font-bold text-muted-foreground hover:border-primary hover:text-primary transition-colors">Annuler</button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </>
  );
}

// ─── SIDEBAR ─────────────────────────────────────────────────────────────────
const DASHBOARD_NAV = [
  { id: "overview" as Tab, label: "Vue d'ensemble", icon: LayoutDashboard },
  { id: "calendar" as Tab, label: "Calendrier",     icon: BarChart3 },
];
const CRM_NAV = [
  { id: "pipeline" as Tab, label: "Pipeline",       icon: Kanban },
  { id: "bookings" as Tab, label: "Rendez-vous",    icon: Calendar },
  { id: "messages" as Tab, label: "Messages",       icon: MessageSquare },
  { id: "patients" as Tab, label: "Patients",       icon: Users },
];

function Sidebar({ tab, setTab, unread, onLogout, onNewLead }: {
  tab: Tab; setTab: (t: Tab) => void; unread: number; onLogout: () => void; onNewLead: () => void;
}) {
  const section = SECTION_OF[tab];
  const NavItem = ({ item }: { item: { id: Tab; label: string; icon: React.ElementType } }) => {
    const active = tab === item.id;
    return (
      <button onClick={() => setTab(item.id)}
        className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all duration-200 ${active ? "bg-primary text-white" : "text-white/40 hover:text-white hover:bg-white/5"}`}>
        <item.icon className="w-4 h-4 shrink-0" />
        <span className="text-[11px] tracking-[0.18em] uppercase font-bold">{item.label}</span>
        {item.id === "messages" && unread > 0 && (
          <span className="ml-auto w-5 h-5 bg-white/20 text-white text-[9px] font-black flex items-center justify-center shrink-0">{unread}</span>
        )}
      </button>
    );
  };

  return (
    <aside className="w-[240px] shrink-0 bg-[hsl(var(--ink))] flex flex-col h-screen sticky top-0">
      <div className="flex items-center gap-3 px-6 py-5 border-b border-white/8">
        <div className="w-9 h-9 bg-primary grid place-items-center shrink-0">
          <img src={logoMark} alt="" className="w-5 h-5 brightness-0 invert" />
        </div>
        <div>
          <div className="display text-[11px] tracking-[0.2em] text-white font-black">MEDICAL BAY</div>
          <div className="text-[8px] tracking-[0.35em] uppercase font-bold mt-0.5">
            {section === "dashboard" ? <span className="text-white/50">Tableau de bord</span> : <span className="text-primary/80">CRM</span>}
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-3 overflow-y-auto space-y-4">
        <button onClick={onNewLead}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary/15 border border-primary/30 text-primary hover:bg-primary hover:text-white transition-all duration-200">
          <UserPlus className="w-3.5 h-3.5 shrink-0" />
          <span className="text-[10px] tracking-[0.2em] uppercase font-bold">Nouveau patient</span>
        </button>

        <div>
          <div className="px-4 pt-1 pb-2"><span className={`text-[8px] tracking-[0.45em] uppercase font-black ${section === "dashboard" ? "text-white/60" : "text-white/20"}`}>Tableau de bord</span></div>
          <div className={`border-l-2 ml-4 space-y-0.5 ${section === "dashboard" ? "border-primary/40" : "border-white/8"}`}>
            {DASHBOARD_NAV.map(item => <NavItem key={item.id} item={item} />)}
          </div>
        </div>
        <div className="mx-4 border-t border-white/8" />
        <div>
          <div className="px-4 pt-1 pb-2"><span className={`text-[8px] tracking-[0.45em] uppercase font-black ${section === "crm" ? "text-white/60" : "text-white/20"}`}>CRM</span></div>
          <div className={`border-l-2 ml-4 space-y-0.5 ${section === "crm" ? "border-primary/40" : "border-white/8"}`}>
            {CRM_NAV.map(item => <NavItem key={item.id} item={item} />)}
          </div>
        </div>
      </nav>

      <div className="px-3 py-4 border-t border-white/8 space-y-0.5">
        <Link to="/" target="_blank" className="w-full flex items-center gap-3 px-4 py-2.5 text-white/30 hover:text-white hover:bg-white/5 transition-colors">
          <ExternalLink className="w-4 h-4 shrink-0" />
          <span className="text-[11px] tracking-[0.18em] uppercase font-bold">Voir le site</span>
        </Link>
        <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-white/30 hover:text-red-400 hover:bg-red-500/8 transition-colors">
          <LogOut className="w-4 h-4 shrink-0" />
          <span className="text-[11px] tracking-[0.18em] uppercase font-bold">Déconnexion</span>
        </button>
      </div>
    </aside>
  );
}

// ─── OVERVIEW ─────────────────────────────────────────────────────────────────
function Overview({ bookings, messages, setTab }: { bookings: Booking[]; messages: Message[]; setTab: (t: Tab) => void }) {
  const today = new Date().toISOString().slice(0, 10);
  const weekEnd = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);

  const stats = useMemo(() => {
    const done = bookings.filter(b => b.status === "Terminé");
    const active = bookings.filter(b => !["Terminé","Annulé"].includes(b.status));
    return { total: bookings.length, pipeline: active.reduce((a, b) => a + b.value, 0), done: done.length, revenue: done.reduce((a, b) => a + b.value, 0) };
  }, [bookings]);

  const overdueFollowUps = useMemo(() => bookings.filter(b => b.followUp && b.followUp < today && !["Terminé","Annulé"].includes(b.status)), [bookings, today]);
  const todayFollowUps   = useMemo(() => bookings.filter(b => b.followUp === today && !["Terminé","Annulé"].includes(b.status)), [bookings, today]);
  const upcoming         = useMemo(() => bookings.filter(b => b.date >= today && b.date <= weekEnd && b.status !== "Annulé").sort((a, b) => a.date.localeCompare(b.date)).slice(0, 5), [bookings, today, weekEnd]);

  const recentActivity = useMemo(() => {
    const all: { ts: string; booking: Booking; entry: ContactEntry }[] = [];
    bookings.forEach(b => b.contactLog.forEach(e => all.push({ ts: e.ts, booking: b, entry: e })));
    return all.sort((a, b) => b.ts.localeCompare(a.ts)).slice(0, 6);
  }, [bookings]);

  const serviceBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    bookings.forEach(b => { map[b.service] = (map[b.service] ?? 0) + 1; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [bookings]);
  const maxSvc = Math.max(...serviceBreakdown.map(s => s[1]), 1);

  const pipeline = (["Nouveau","Confirmé","En cours","Terminé"] as BookingStatus[]).map(s => ({
    label: s, count: bookings.filter(b => b.status === s).length, color: STATUS_CFG[s].dot,
  }));

  const sourceBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    bookings.forEach(b => { map[b.source] = (map[b.source] ?? 0) + 1; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [bookings]);

  const unread = messages.filter(m => !m.read).length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="display text-3xl text-foreground mb-1">Vue d'ensemble</h1>
        <p className="text-sm text-muted-foreground font-light">Medical Bay CRM · {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: "Leads totaux",     value: stats.total,                                 sub: "toutes sources",     icon: Zap,          color: "text-primary",     bg: "bg-primary/8" },
          { label: "Pipeline actif",   value: `${stats.pipeline.toLocaleString("fr")} €`,  sub: "revenus potentiels", icon: TrendingUp,   color: "text-amber-600",   bg: "bg-amber-50" },
          { label: "Séjours terminés", value: stats.done,                                  sub: "patients traités",   icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "CA réalisé",       value: `${stats.revenue.toLocaleString("fr")} €`,   sub: "séjours clôturés",   icon: BarChart3,    color: "text-primary",     bg: "bg-primary/8" },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            className="bg-background border border-border p-6">
            <div className={`w-10 h-10 ${s.bg} flex items-center justify-center mb-5`}><s.icon className={`w-5 h-5 ${s.color}`} /></div>
            <div className={`display text-4xl font-black mb-1 ${s.color}`}>{s.value}</div>
            <div className="text-[8px] tracking-[0.35em] uppercase font-bold text-muted-foreground">{s.label}</div>
            <div className="text-[9px] text-muted-foreground/50 mt-0.5">{s.sub}</div>
          </motion.div>
        ))}
      </div>

      <div className="space-y-2">
        {overdueFollowUps.length > 0 && (
          <button onClick={() => setTab("bookings")} className="w-full flex items-center gap-4 bg-red-50 border border-red-200 px-6 py-3 hover:border-red-400 transition-colors group text-left">
            <Bell className="w-4 h-4 text-red-500 shrink-0" />
            <span className="text-sm font-light text-foreground flex-1"><strong className="font-bold text-red-600">{overdueFollowUps.length} suivi{overdueFollowUps.length > 1 ? "s" : ""} en retard</strong> — {overdueFollowUps.map(b => b.name.split(" ")[0]).join(", ")}</span>
            <ArrowUpRight className="w-4 h-4 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        )}
        {todayFollowUps.length > 0 && (
          <button onClick={() => setTab("bookings")} className="w-full flex items-center gap-4 bg-amber-50 border border-amber-200 px-6 py-3 hover:border-amber-400 transition-colors group text-left">
            <Bell className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="text-sm font-light text-foreground flex-1"><strong className="font-bold text-amber-700">{todayFollowUps.length} suivi{todayFollowUps.length > 1 ? "s" : ""} aujourd'hui</strong> — {todayFollowUps.map(b => b.name.split(" ")[0]).join(", ")}</span>
            <ArrowUpRight className="w-4 h-4 text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        )}
        {unread > 0 && (
          <button onClick={() => setTab("messages")} className="w-full flex items-center gap-4 bg-primary/8 border border-primary/25 px-6 py-3 hover:border-primary/50 transition-colors group text-left">
            <AlertCircle className="w-4 h-4 text-primary shrink-0" />
            <span className="text-sm font-light text-foreground flex-1"><strong className="font-bold text-primary">{unread} message{unread > 1 ? "s" : ""} non lu{unread > 1 ? "s" : ""}</strong> en attente</span>
            <ArrowUpRight className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        )}
      </div>

      <div className="grid xl:grid-cols-[1fr_1fr_300px] gap-6">
        <div className="bg-background border border-border">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <div className="display text-base text-foreground">Cette semaine</div>
            <button onClick={() => setTab("calendar")} className="text-[9px] tracking-[0.3em] uppercase font-bold text-primary hover:underline">Calendrier →</button>
          </div>
          {upcoming.length === 0
            ? <div className="px-6 py-8 text-center text-sm text-muted-foreground font-light">Aucun rendez-vous</div>
            : <div className="divide-y divide-border">
              {upcoming.map(b => (
                <div key={b.id} className="flex items-center gap-3 px-5 py-3">
                  <div className="w-9 h-9 bg-[hsl(var(--mist))] flex items-center justify-center shrink-0">
                    <span className="display text-xs text-primary">{new Date(b.date).getDate()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="display text-sm text-foreground truncate">{b.name}</div>
                    <div className="text-[9px] text-muted-foreground truncate">{b.service}</div>
                  </div>
                  <StatusBadge status={b.status} />
                </div>
              ))}
            </div>
          }
        </div>

        <div className="bg-background border border-border">
          <div className="px-6 py-4 border-b border-border"><div className="display text-base text-foreground">Activité récente</div></div>
          {recentActivity.length === 0
            ? <div className="px-6 py-8 text-center text-sm text-muted-foreground font-light">Aucune activité</div>
            : <div className="divide-y divide-border">
              {recentActivity.map(({ entry, booking }) => {
                const cfg = LOG_CFG[entry.type];
                return (
                  <div key={entry.id} className="flex items-start gap-3 px-5 py-3">
                    <div className={`w-7 h-7 flex items-center justify-center shrink-0 mt-0.5 ${cfg.color}`}><cfg.icon className="w-3 h-3" /></div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-foreground/80 font-light leading-snug truncate">{booking.name} — {entry.content}</div>
                      <div className="text-[9px] text-muted-foreground/50 mt-0.5">{fmtTs(entry.ts)}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          }
        </div>

        <div className="space-y-5">
          <div className="bg-background border border-border p-5">
            <div className="text-[9px] tracking-[0.4em] uppercase font-bold text-muted-foreground mb-4">Pipeline</div>
            <div className="space-y-3">
              {pipeline.map(p => (
                <div key={p.label} className="flex items-center gap-3">
                  <div className="text-[9px] tracking-[0.15em] uppercase font-bold text-muted-foreground w-16 shrink-0">{p.label}</div>
                  <div className="flex-1 h-2 bg-border"><div className={`h-full ${p.color} transition-all duration-700`} style={{ width: stats.total ? `${(p.count / stats.total) * 100}%` : "0%" }} /></div>
                  <div className="display text-sm text-foreground w-3 text-right">{p.count}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-background border border-border p-5">
            <div className="text-[9px] tracking-[0.4em] uppercase font-bold text-muted-foreground mb-4">Sources leads</div>
            <div className="space-y-2">
              {sourceBreakdown.map(([src, n]) => (
                <div key={src} className="flex items-center justify-between">
                  <span className="font-light text-foreground/70 text-xs">{src}</span>
                  <span className="display text-sm text-foreground font-black">{n}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-background border border-border p-5">
            <div className="text-[9px] tracking-[0.4em] uppercase font-bold text-muted-foreground mb-4">Top soins</div>
            <div className="space-y-2">
              {serviceBreakdown.map(([svc, n]) => (
                <div key={svc}>
                  <div className="flex justify-between mb-1"><span className="text-[9px] font-light text-foreground/70 truncate max-w-[160px]">{svc}</span><span className="text-[9px] font-bold text-muted-foreground">{n}</span></div>
                  <div className="h-1 bg-border"><div className="h-full bg-primary/50" style={{ width: `${(n / maxSvc) * 100}%` }} /></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── BOOKING DETAIL PANEL ──────────────────────────────────────────────────────
interface BookingDetailProps {
  booking: Booking;
  onClose: () => void;
  onUpdateFields: (b: Booking) => void;
  onUpdateStatus: (id: string, from: BookingStatus, to: BookingStatus) => void;
  onAddLog: (bookingId: string, entry: ContactEntry) => void;
  onDelete: (id: string) => void;
}

function BookingDetail({ booking, onClose, onUpdateFields, onUpdateStatus, onAddLog, onDelete }: BookingDetailProps) {
  const [statusOpen, setStatusOpen]     = useState(false);
  const [editingNotes, setEditingNotes] = useState(false);
  const [noteDraft, setNoteDraft]       = useState(booking.notes);
  const [logType, setLogType]           = useState<LogType>("note");
  const [logContent, setLogContent]     = useState("");
  const [activeSection, setActiveSection] = useState<"info" | "log" | "history">("info");

  const today = new Date().toISOString().slice(0, 10);
  const isOverdue = booking.followUp && booking.followUp < today;

  useEffect(() => { setNoteDraft(booking.notes); }, [booking.notes]);

  const saveNotes    = () => { onUpdateFields({ ...booking, notes: noteDraft }); setEditingNotes(false); };
  const toggleTag    = (tag: string) => onUpdateFields({ ...booking, tags: booking.tags.includes(tag) ? booking.tags.filter(t => t !== tag) : [...booking.tags, tag] });
  const setFollowUp  = (date: string) => onUpdateFields({ ...booking, followUp: date || undefined });
  const setValue     = (v: number) => onUpdateFields({ ...booking, value: v });

  const [emailSending, setEmailSending]   = useState(false);
  const [emailStatus, setEmailStatus]     = useState<"idle" | "ok" | "err">("idle");
  const [emailErr, setEmailErr]           = useState("");

  const addLog = () => {
    if (!logContent.trim()) return;
    const entry: ContactEntry = { id: newLogId(), ts: new Date().toISOString(), type: logType, content: logContent.trim() };
    onAddLog(booking.id, entry);
    setLogContent("");
    setEmailStatus("idle");
  };

  const addLogAndSend = async () => {
    if (!logContent.trim()) return;
    addLog();
    setEmailSending(true); setEmailStatus("idle");
    try {
      await sendEmail({
        to: booking.email,
        subject: `Medical Bay — Message pour ${booking.name.split(" ")[0]}`,
        body: logContent.trim(),
      });
      setEmailStatus("ok");
      setTimeout(() => setEmailStatus("idle"), 4000);
    } catch (err) {
      setEmailErr(err instanceof Error ? err.message : "Erreur inconnue");
      setEmailStatus("err");
    } finally { setEmailSending(false); }
  };

  return (
    <motion.div initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 24 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="w-[340px] shrink-0 bg-background border border-border self-start sticky top-6">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div className="flex gap-1">
          {(["info","log","history"] as const).map(s => (
            <button key={s} onClick={() => setActiveSection(s)}
              className={`px-3 py-1.5 text-[8px] tracking-[0.25em] uppercase font-bold transition-colors ${activeSection === s ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground"}`}>
              {s === "info" ? "Fiche" : s === "log" ? "Journal" : "Historique"}
            </button>
          ))}
        </div>
        <button onClick={onClose} className="w-7 h-7 border border-border flex items-center justify-center hover:border-primary hover:text-primary transition-colors"><X className="w-3 h-3" /></button>
      </div>

      <div className="max-h-[calc(100vh-160px)] overflow-y-auto">
        {activeSection === "info" && (
          <div className="p-5 space-y-5">
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="w-11 h-11 bg-[hsl(var(--mist))] flex items-center justify-center shrink-0">
                  <span className="display text-base text-primary">{booking.name.split(" ").map(n => n[0]).join("").toUpperCase()}</span>
                </div>
                <StatusBadge status={booking.status} />
              </div>
              <div className="display text-xl text-foreground">{booking.name}</div>
              <div className="text-[9px] tracking-[0.3em] uppercase text-muted-foreground font-bold mt-0.5">{booking.id}</div>
            </div>

            <div className="space-y-2">
              {[{ icon: Mail, label: booking.email }, { icon: Phone, label: booking.phone }].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2.5">
                  <Icon className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span className="font-light text-foreground/70 text-xs">{label}</span>
                </div>
              ))}
            </div>

            {/* Tags */}
            <div className="border-t border-border pt-4">
              <div className="text-[8px] tracking-[0.4em] uppercase font-bold text-muted-foreground mb-3 flex items-center gap-1.5"><Tag className="w-2.5 h-2.5" /> Tags</div>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {booking.tags.map(t => <TagChip key={t} tag={t} onRemove={() => toggleTag(t)} />)}
                {booking.tags.length === 0 && <span className="text-xs text-muted-foreground/40 italic">Aucun tag</span>}
              </div>
              <div className="flex flex-wrap gap-1.5 pt-2">
                {ALL_TAGS.filter(t => !booking.tags.includes(t)).map(t => (
                  <button key={t} onClick={() => toggleTag(t)} className="text-[8px] tracking-[0.15em] uppercase font-bold text-muted-foreground hover:text-foreground border border-dashed border-border hover:border-primary/50 px-2 py-0.5 transition-colors flex items-center gap-1">
                    <Plus className="w-2 h-2" /> {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Fields */}
            <div className="border-t border-border pt-4 space-y-3">
              {[["Service", booking.service],["Origine", booking.origin],["Date", booking.date],["Source", booking.source]].map(([k, v]) => (
                <div key={k}>
                  <div className="text-[8px] tracking-[0.4em] uppercase font-bold text-muted-foreground mb-0.5">{k}</div>
                  <div className="text-sm font-light text-foreground">{v}</div>
                </div>
              ))}
            </div>

            {/* Value */}
            <div className="border-t border-border pt-4">
              <div className="text-[8px] tracking-[0.4em] uppercase font-bold text-muted-foreground mb-1.5">Valeur estimée (€)</div>
              <input type="number" value={booking.value} onChange={e => setValue(Number(e.target.value))}
                className="w-full bg-transparent border-b border-border py-2 outline-none focus:border-primary text-sm font-light text-foreground transition-colors rounded-none" />
            </div>

            {/* Follow-up */}
            <div className="border-t border-border pt-4">
              <div className={`text-[8px] tracking-[0.4em] uppercase font-bold mb-1.5 flex items-center gap-1.5 ${isOverdue ? "text-red-500" : "text-muted-foreground"}`}>
                {isOverdue ? <Bell className="w-2.5 h-2.5" /> : <BellOff className="w-2.5 h-2.5" />}
                Suivi prévu {isOverdue && <span className="text-red-500">(en retard)</span>}
              </div>
              <input type="date" value={booking.followUp ?? ""} onChange={e => setFollowUp(e.target.value)}
                className="w-full bg-transparent border-b border-border py-2 outline-none focus:border-primary text-sm font-light text-foreground transition-colors rounded-none" />
            </div>

            {/* Notes */}
            <div className="border-t border-border pt-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-[8px] tracking-[0.4em] uppercase font-bold text-muted-foreground">Notes internes</div>
                {!editingNotes
                  ? <button onClick={() => setEditingNotes(true)} className="text-muted-foreground hover:text-primary transition-colors"><Edit3 className="w-3 h-3" /></button>
                  : <button onClick={saveNotes} className="text-primary hover:text-primary/70 transition-colors"><Save className="w-3 h-3" /></button>
                }
              </div>
              {editingNotes
                ? <textarea value={noteDraft} onChange={e => setNoteDraft(e.target.value)} rows={3} autoFocus
                    className="w-full bg-[hsl(var(--off))] border border-primary/30 p-3 text-sm font-light outline-none resize-none text-foreground/80 rounded-none" />
                : <p className={`text-sm font-light leading-relaxed ${booking.notes ? "text-foreground/70" : "text-muted-foreground/40 italic"}`}>{booking.notes || "Aucune note…"}</p>
              }
            </div>

            {/* Status changer */}
            <div className="border-t border-border pt-4">
              <div className="text-[8px] tracking-[0.4em] uppercase font-bold text-muted-foreground mb-2">Statut</div>
              <div className="relative">
                <button onClick={() => setStatusOpen(!statusOpen)} className="w-full flex items-center justify-between px-4 py-2.5 border border-border hover:border-primary/50 transition-colors">
                  <StatusBadge status={booking.status} />
                  <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${statusOpen ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence>
                  {statusOpen && (
                    <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.15 }}
                      className="absolute top-full left-0 right-0 bg-background border border-border shadow-lg z-20 mt-1">
                      {(["Nouveau","Confirmé","En cours","Terminé","Annulé"] as BookingStatus[]).map(s => (
                        <button key={s} onClick={() => { onUpdateStatus(booking.id, booking.status, s); setStatusOpen(false); }}
                          className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-[hsl(var(--mist)/0.5)] transition-colors ${booking.status === s ? "text-primary font-bold" : "text-foreground/70"}`}>
                          {booking.status === s && <Check className="w-3 h-3 text-primary shrink-0" />}
                          <span className={booking.status === s ? "" : "ml-5"}>{s}</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <button onClick={() => onDelete(booking.id)} className="w-full flex items-center justify-center gap-2 border border-red-200 text-red-500 py-2.5 hover:bg-red-50 transition-colors text-[10px] tracking-[0.3em] uppercase font-bold">
              <Trash2 className="w-3.5 h-3.5" /> Supprimer ce lead
            </button>
          </div>
        )}

        {activeSection === "log" && (
          <div className="p-5 space-y-4">
            <div className="display text-base text-foreground">{booking.name}</div>
            <div className="text-[9px] tracking-[0.3em] uppercase text-muted-foreground font-bold">{booking.id} · Journal de contact</div>
            <div className="bg-[hsl(var(--off))] border border-border p-4 space-y-3">
              <div className="flex gap-1.5 flex-wrap">
                {(Object.keys(LOG_CFG) as LogType[]).map(t => {
                  const cfg = LOG_CFG[t];
                  return (
                    <button key={t} onClick={() => setLogType(t)}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 border text-[8px] tracking-[0.2em] uppercase font-bold transition-colors ${logType === t ? "bg-primary text-white border-primary" : "bg-background border-border text-muted-foreground hover:border-primary/50"}`}>
                      <cfg.icon className="w-2.5 h-2.5" /> {cfg.label}
                    </button>
                  );
                })}
              </div>
              <textarea value={logContent} onChange={e => setLogContent(e.target.value)} placeholder="Résumé du contact…" rows={2}
                className="w-full bg-background border border-border p-3 text-sm font-light outline-none focus:border-primary resize-none text-foreground/80 rounded-none placeholder:text-foreground/25 transition-colors" />
              {emailStatus === "err" && (
                <div className="flex items-center gap-2 text-[10px] text-red-600 bg-red-50 border border-red-200 px-3 py-2">
                  <AlertCircle className="w-3 h-3 shrink-0" /> {emailErr}
                </div>
              )}
              {emailStatus === "ok" && (
                <div className="flex items-center gap-2 text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-2">
                  <CheckCheck className="w-3 h-3 shrink-0" /> E-mail envoyé à {booking.email}
                </div>
              )}
              {logType === "email" ? (
                <div className="flex gap-2">
                  <button onClick={addLogAndSend} disabled={!logContent.trim() || emailSending}
                    className="flex-1 btn-primary !py-2.5 disabled:opacity-40 flex items-center justify-center gap-2">
                    {emailSending ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Envoi…</> : <><Mail className="w-3.5 h-3.5" /> Envoyer + Log</>}
                  </button>
                  <button onClick={addLog} disabled={!logContent.trim()}
                    className="px-4 py-2.5 border border-border text-[9px] tracking-[0.2em] uppercase font-bold text-muted-foreground hover:border-primary hover:text-primary disabled:opacity-40 transition-colors">
                    Log seul
                  </button>
                </div>
              ) : (
                <button onClick={addLog} disabled={!logContent.trim()} className="w-full btn-primary !py-2.5 disabled:opacity-40 flex items-center justify-center gap-2">
                  <Send className="w-3.5 h-3.5" /> Enregistrer
                </button>
              )}
            </div>
            <div className="space-y-2">
              {booking.contactLog.length === 0
                ? <p className="text-sm text-muted-foreground/40 italic text-center py-4">Aucun contact enregistré</p>
                : booking.contactLog.map(entry => {
                  const cfg = LOG_CFG[entry.type];
                  return (
                    <div key={entry.id} className="flex gap-3 border border-border p-3">
                      <div className={`w-7 h-7 flex items-center justify-center shrink-0 mt-0.5 ${cfg.color}`}><cfg.icon className="w-3 h-3" /></div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[8px] tracking-[0.25em] uppercase font-bold text-muted-foreground">{cfg.label}</span>
                          <span className="text-[9px] text-muted-foreground/50">{fmtTs(entry.ts)}</span>
                        </div>
                        <p className="text-sm font-light text-foreground/70 leading-snug">{entry.content}</p>
                      </div>
                    </div>
                  );
                })
              }
            </div>
          </div>
        )}

        {activeSection === "history" && (
          <div className="p-5 space-y-4">
            <div className="display text-base text-foreground">{booking.name}</div>
            <div className="text-[9px] tracking-[0.3em] uppercase text-muted-foreground font-bold">{booking.id} · Historique des statuts</div>
            <div className="space-y-3">
              {[...booking.history].reverse().map((h, i) => (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary/50 mt-1.5 shrink-0" />
                    {i < booking.history.length - 1 && <div className="w-px flex-1 bg-border mt-1" />}
                  </div>
                  <div className="pb-3 flex-1">
                    <div className="text-xs text-foreground/70 font-light">
                      {h.action}
                      {h.from && h.to && <span className="text-muted-foreground"> · {h.from} → <span className="text-primary">{h.to}</span></span>}
                    </div>
                    <div className="text-[9px] text-muted-foreground/50 mt-0.5">{fmtTs(h.ts)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── PIPELINE (KANBAN) ────────────────────────────────────────────────────────
interface CRMCallbacks {
  onUpdateFields: (b: Booking) => void;
  onUpdateStatus: (id: string, from: BookingStatus, to: BookingStatus) => void;
  onAddLog: (bookingId: string, entry: ContactEntry) => void;
  onDelete: (id: string) => void;
}

function Pipeline({ bookings, callbacks }: { bookings: Booking[]; callbacks: CRMCallbacks }) {
  const [selected, setSelected] = useState<Booking | null>(null);
  const { onUpdateFields, onUpdateStatus, onAddLog, onDelete } = callbacks;

  useEffect(() => {
    if (!selected) return;
    const fresh = bookings.find(b => b.id === selected.id);
    if (fresh) setSelected(fresh);
  }, [bookings]); // eslint-disable-line

  const columns: BookingStatus[] = ["Nouveau","Confirmé","En cours","Terminé","Annulé"];
  const totalValue = (col: BookingStatus) => bookings.filter(b => b.status === col).reduce((a, b) => a + b.value, 0);

  return (
    <div className="flex gap-4 h-full">
      <div className="flex-1 min-w-0 overflow-x-auto">
        <div className="mb-5">
          <h1 className="display text-3xl text-foreground mb-1">Pipeline</h1>
          <p className="text-sm text-muted-foreground font-light">Vue kanban du pipeline commercial</p>
        </div>
        <div className="flex gap-3 min-w-max pb-4">
          {columns.map(col => {
            const cards = bookings.filter(b => b.status === col);
            const cfg = STATUS_CFG[col];
            return (
              <div key={col} className={`w-64 shrink-0 ${cfg.col} border border-border`}>
                <div className="px-4 py-3 border-b border-border">
                  <div className="flex items-center justify-between mb-1">
                    <div className={`text-[9px] tracking-[0.3em] uppercase font-bold ${cfg.text}`}>{col}</div>
                    <span className="w-5 h-5 bg-border/50 text-foreground/50 text-[9px] font-black flex items-center justify-center">{cards.length}</span>
                  </div>
                  {totalValue(col) > 0 && <div className="text-[9px] text-muted-foreground font-light">{totalValue(col).toLocaleString("fr")} €</div>}
                </div>
                <div className="p-2 space-y-2 min-h-[120px]">
                  {cards.map(b => (
                    <motion.div key={b.id} layout onClick={() => setSelected(selected?.id === b.id ? null : b)}
                      className={`bg-background border cursor-pointer p-3 hover:shadow-sm transition-all duration-200 ${selected?.id === b.id ? "border-primary shadow-sm" : "border-border"}`}>
                      <div className="flex items-start justify-between gap-1 mb-2">
                        <div className="display text-xs text-foreground leading-tight">{b.name}</div>
                        {b.followUp && b.followUp <= new Date().toISOString().slice(0, 10) && <Bell className="w-2.5 h-2.5 text-red-400 shrink-0 mt-0.5" />}
                      </div>
                      <div className="text-[9px] text-muted-foreground font-light mb-2 truncate">{b.service}</div>
                      {b.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {b.tags.slice(0, 2).map(t => <TagChip key={t} tag={t} />)}
                          {b.tags.length > 2 && <span className="text-[8px] text-muted-foreground">+{b.tags.length - 2}</span>}
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-bold text-muted-foreground">{b.origin.split(",")[0]}</span>
                        {b.value > 0 && <span className="text-[9px] font-bold text-primary">{b.value.toLocaleString("fr")} €</span>}
                      </div>
                      <div className="mt-2 pt-2 border-t border-border flex gap-1">
                        {columns.filter(c => c !== col).slice(0, 3).map(c => (
                          <button key={c} onClick={e => { e.stopPropagation(); onUpdateStatus(b.id, b.status, c); }}
                            className={`flex-1 text-[7px] tracking-[0.1em] uppercase font-bold py-1 border transition-colors ${STATUS_CFG[c].text} ${STATUS_CFG[c].bg} ${STATUS_CFG[c].border} hover:opacity-80`}>
                            {c.slice(0, 4)}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                  {cards.length === 0 && <div className="py-6 text-center text-[9px] text-muted-foreground/40 font-light">Vide</div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {selected && (
          <BookingDetail booking={selected} onClose={() => setSelected(null)}
            onUpdateFields={onUpdateFields} onUpdateStatus={onUpdateStatus}
            onAddLog={onAddLog} onDelete={id => { onDelete(id); setSelected(null); }} />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── BOOKINGS ─────────────────────────────────────────────────────────────────
function Bookings({ bookings, callbacks }: { bookings: Booking[]; callbacks: CRMCallbacks }) {
  const [filter, setFilter]     = useState<BookingStatus | "Tous">("Tous");
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const [search, setSearch]     = useState("");
  const [selected, setSelected] = useState<Booking | null>(null);
  const { onUpdateFields, onUpdateStatus, onAddLog, onDelete } = callbacks;

  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    if (!selected) return;
    const fresh = bookings.find(b => b.id === selected.id);
    if (fresh) setSelected(fresh);
  }, [bookings]); // eslint-disable-line

  const filtered = useMemo(() => bookings.filter(b => {
    const matchStatus = filter === "Tous" || b.status === filter;
    const matchTag    = !tagFilter || b.tags.includes(tagFilter);
    const q           = search.toLowerCase();
    const matchSearch = !q || b.name.toLowerCase().includes(q) || b.email.toLowerCase().includes(q) || b.service.toLowerCase().includes(q) || b.origin.toLowerCase().includes(q);
    return matchStatus && matchTag && matchSearch;
  }), [bookings, filter, tagFilter, search]);

  const counts: Record<string, number> = useMemo(() => ({
    Tous: bookings.length,
    Nouveau:    bookings.filter(b => b.status === "Nouveau").length,
    Confirmé:   bookings.filter(b => b.status === "Confirmé").length,
    "En cours": bookings.filter(b => b.status === "En cours").length,
    Terminé:    bookings.filter(b => b.status === "Terminé").length,
    Annulé:     bookings.filter(b => b.status === "Annulé").length,
  }), [bookings]);

  const exportCSV = () => {
    const headers = ["ID","Nom","Email","Téléphone","Service","Origine","Date","Statut","Valeur","Source","Tags","Notes"];
    const rows = bookings.map(b => [b.id, b.name, b.email, b.phone, b.service, b.origin, b.date, b.status, b.value, b.source, b.tags.join(";"), b.notes]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `medicalbay-leads-${today}.csv`; a.click();
  };

  return (
    <div className="flex gap-6 h-full">
      <div className="flex-1 min-w-0 space-y-5">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="display text-3xl text-foreground mb-1">Rendez-vous</h1>
            <p className="text-sm text-muted-foreground font-light">{bookings.length} leads</p>
          </div>
          <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 border border-border text-[9px] tracking-[0.3em] uppercase font-bold text-muted-foreground hover:border-primary hover:text-primary transition-colors">
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
        </div>

        <div className="space-y-2">
          <div className="flex gap-1 flex-wrap">
            {(["Tous","Nouveau","Confirmé","En cours","Terminé","Annulé"] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1.5 text-[9px] tracking-[0.25em] uppercase font-bold border transition-colors ${filter === f ? "bg-primary text-white border-primary" : "bg-background border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"}`}>
                {f} <span className="opacity-60 ml-0.5">({counts[f]})</span>
              </button>
            ))}
          </div>
          <div className="flex gap-2 flex-wrap items-center">
            <div className="text-[8px] tracking-[0.3em] uppercase font-bold text-muted-foreground">Tags :</div>
            {ALL_TAGS.map(t => (
              <button key={t} onClick={() => setTagFilter(tagFilter === t ? null : t)}
                className={`text-[8px] tracking-[0.2em] uppercase font-bold border px-2 py-1 transition-colors ${tagFilter === t ? TAG_COLORS[t] : "border-border text-muted-foreground hover:border-primary/40"}`}>
                {t}
              </button>
            ))}
            <div className="relative ml-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher…"
                className="pl-9 pr-4 py-2 border border-border bg-background text-sm font-light outline-none focus:border-primary transition-colors w-44 rounded-none" />
            </div>
          </div>
        </div>

        <div className="bg-background border border-border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-[hsl(var(--off))]">
                {["Patient","Service","Date / Suivi","Valeur","Tags","Statut",""].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[8px] tracking-[0.4em] uppercase font-bold text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0
                ? <tr><td colSpan={7} className="px-4 py-10 text-center text-sm text-muted-foreground font-light">Aucun résultat</td></tr>
                : filtered.map(b => {
                  const isOverdue = b.followUp && b.followUp < today;
                  return (
                    <tr key={b.id} onClick={() => setSelected(b === selected ? null : b)}
                      className={`hover:bg-[hsl(var(--mist)/0.3)] cursor-pointer transition-colors ${selected?.id === b.id ? "bg-primary/5" : ""}`}>
                      <td className="px-4 py-3">
                        <div className="display text-sm text-foreground">{b.name}</div>
                        <div className="text-[9px] text-muted-foreground">{b.email}</div>
                      </td>
                      <td className="px-4 py-3 text-sm font-light text-foreground/70 max-w-[130px] truncate">{b.service}</td>
                      <td className="px-4 py-3">
                        <div className="text-[10px] font-bold text-muted-foreground">{b.date}</div>
                        {b.followUp && <div className={`text-[9px] flex items-center gap-1 ${isOverdue ? "text-red-500" : "text-muted-foreground/60"}`}><Bell className="w-2.5 h-2.5" /> {b.followUp}</div>}
                      </td>
                      <td className="px-4 py-3"><span className="display text-sm text-foreground">{b.value > 0 ? `${b.value.toLocaleString("fr")} €` : "—"}</span></td>
                      <td className="px-4 py-3"><div className="flex gap-1 flex-wrap max-w-[100px]">{b.tags.slice(0, 2).map(t => <TagChip key={t} tag={t} />)}</div></td>
                      <td className="px-4 py-3"><StatusBadge status={b.status} /></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                          <button onClick={() => setSelected(b === selected ? null : b)} className="w-8 h-8 border border-border flex items-center justify-center hover:border-primary hover:text-primary transition-colors text-muted-foreground"><Eye className="w-3.5 h-3.5" /></button>
                          <button onClick={() => onDelete(b.id)} className="w-8 h-8 border border-border flex items-center justify-center hover:border-red-400 hover:text-red-500 transition-colors text-muted-foreground"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {selected && (
          <BookingDetail booking={selected} onClose={() => setSelected(null)}
            onUpdateFields={onUpdateFields} onUpdateStatus={onUpdateStatus}
            onAddLog={onAddLog} onDelete={id => { onDelete(id); setSelected(null); }} />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── MESSAGES ─────────────────────────────────────────────────────────────────
function Messages({ messages, bookings, onMarkRead, onMarkAllRead, onDeleteMessage, onAddBooking }: {
  messages: Message[]; bookings: Booking[];
  onMarkRead: (id: string) => void; onMarkAllRead: () => void;
  onDeleteMessage: (id: string) => void; onAddBooking: (b: Booking) => void;
}) {
  const [selected, setSelected]   = useState<Message | null>(null);
  const [converted, setConverted] = useState<Set<string>>(new Set());
  const [reply, setReply]         = useState("");
  const [copied, setCopied]       = useState(false);
  const [sending, setSending]     = useState(false);
  const [sendStatus, setSendStatus] = useState<"idle" | "ok" | "err">("idle");
  const [sendErr, setSendErr]     = useState("");

  const open = (m: Message) => { setSelected(m); setReply(""); setSendStatus("idle"); onMarkRead(m.id); };

  const handleSendEmail = async () => {
    if (!selected || !reply.trim()) return;
    setSending(true); setSendStatus("idle");
    try {
      await sendEmail({
        to: selected.email,
        subject: `Re: ${selected.subject}`,
        body: reply,
      });
      setSendStatus("ok");
      setTimeout(() => setSendStatus("idle"), 4000);
    } catch (err) {
      setSendErr(err instanceof Error ? err.message : "Erreur inconnue");
      setSendStatus("err");
    } finally { setSending(false); }
  };
  const applyTemplate = (body: string) => {
    if (!selected) return;
    setReply(body.replace("{prenom}", selected.name.split(" ")[0]).replace("{soin}", "votre soin"));
  };
  const convertToBooking = (m: Message) => {
    if (converted.has(m.id)) return;
    const nb: Booking = {
      id: newId(), name: m.name, email: m.email, phone: m.phone,
      service: "Consultation générale", origin: "—",
      date: new Date().toISOString().slice(0, 10),
      status: "Nouveau", notes: `Sujet : ${m.subject}`, tags: [],
      source: "Site web", value: 0,
      contactLog: [{ id: newLogId(), ts: new Date().toISOString(), type: "email", content: `Premier contact via formulaire : "${m.subject}"` }],
      history: [{ ts: new Date().toISOString(), action: "Converti depuis message" }],
    };
    onAddBooking(nb);
    setConverted(prev => new Set([...prev, m.id]));
  };

  const unreadCount = messages.filter(m => !m.read).length;

  return (
    <div className="flex gap-6 h-full">
      <div className="w-72 shrink-0 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="display text-3xl text-foreground mb-0.5">Messages</h1>
            {unreadCount > 0 && <span className="text-[9px] tracking-[0.3em] uppercase font-bold text-primary">{unreadCount} non lu{unreadCount > 1 ? "s" : ""}</span>}
          </div>
          {unreadCount > 0 && <button onClick={onMarkAllRead} className="text-[9px] tracking-[0.25em] uppercase font-bold text-muted-foreground hover:text-primary transition-colors">Tout lire</button>}
        </div>
        <div className="space-y-1">
          {messages.length === 0
            ? <div className="bg-background border border-border p-6 text-center text-sm text-muted-foreground font-light">Aucun message</div>
            : messages.map(m => (
              <button key={m.id} onClick={() => open(m)}
                className={`w-full text-left p-4 border transition-all duration-200 ${selected?.id === m.id ? "border-primary bg-primary/5" : "border-border bg-background hover:border-primary/40 hover:bg-[hsl(var(--mist)/0.3)]"}`}>
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    {!m.read && <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-0.5" />}
                    <span className={`display text-sm ${m.read ? "text-foreground/70" : "text-foreground"}`}>{m.name}</span>
                  </div>
                  <span className="text-[9px] text-muted-foreground shrink-0">{m.date.slice(5)}</span>
                </div>
                <div className={`text-[10px] tracking-[0.15em] uppercase font-bold mb-1 truncate ${m.read ? "text-muted-foreground" : "text-primary/80"}`}>{m.subject}</div>
                <div className="text-xs text-muted-foreground font-light truncate">{m.body}</div>
                {converted.has(m.id) && <div className="mt-1.5 flex items-center gap-1 text-[8px] tracking-[0.2em] uppercase text-emerald-600 font-bold"><CheckCheck className="w-2.5 h-2.5" /> Converti en lead</div>}
              </button>
            ))}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        {!selected ? (
          <div className="h-full bg-background border border-border flex items-center justify-center">
            <div className="text-center"><MessageSquare className="w-10 h-10 text-border mx-auto mb-4" /><p className="text-sm text-muted-foreground font-light">Sélectionnez un message</p></div>
          </div>
        ) : (
          <motion.div key={selected.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-background border border-border flex flex-col">
            <div className="px-8 py-5 border-b border-border flex items-start justify-between gap-4">
              <div>
                <div className="display text-xl text-foreground mb-1">{selected.subject}</div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground font-light">
                  <span className="font-bold text-foreground">{selected.name}</span>
                  <span>{selected.date}</span>
                </div>
              </div>
              <button onClick={() => { onDeleteMessage(selected.id); setSelected(null); }} className="w-9 h-9 border border-border flex items-center justify-center text-muted-foreground hover:border-red-300 hover:text-red-500 transition-colors shrink-0"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
            <div className="p-8 flex-1">
              <div className="flex flex-wrap gap-4 mb-6 pb-6 border-b border-border">
                {[{ icon: Mail, label: selected.email, href: `mailto:${selected.email}` }, { icon: Phone, label: selected.phone, href: `tel:${selected.phone}` }].map(({ icon: Icon, label, href }) => (
                  <a key={label} href={href} className="flex items-center gap-2 text-sm font-light text-foreground/70 hover:text-primary transition-colors"><Icon className="w-4 h-4 text-primary" /> {label}</a>
                ))}
              </div>
              <p className="text-base font-light leading-relaxed text-foreground/70 mb-8">{selected.body}</p>
              <div className="border-t border-border pt-6">
                <div className="text-[9px] tracking-[0.4em] uppercase font-bold text-muted-foreground mb-3">Modèles de réponse rapide</div>
                <div className="flex flex-wrap gap-2 mb-5">
                  {QUICK_TEMPLATES.map(t => (
                    <button key={t.label} onClick={() => applyTemplate(t.body)} className="px-3 py-1.5 border border-border text-[9px] tracking-[0.2em] uppercase font-bold text-muted-foreground hover:border-primary hover:text-primary transition-colors">{t.label}</button>
                  ))}
                </div>
                <textarea value={reply} onChange={e => setReply(e.target.value)} placeholder="Rédigez ou sélectionnez un modèle…" rows={4}
                  className="w-full bg-[hsl(var(--off))] border border-border p-4 text-sm font-light outline-none focus:border-primary resize-none text-foreground/80 rounded-none placeholder:text-foreground/25 transition-colors" />
              </div>
            </div>
            <div className="px-8 py-5 border-t border-border space-y-3">
              {sendStatus === "err" && (
                <div className="flex items-center gap-2 text-[10px] text-red-600 bg-red-50 border border-red-200 px-4 py-2.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {sendErr}
                </div>
              )}
              {sendStatus === "ok" && (
                <div className="flex items-center gap-2 text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-4 py-2.5">
                  <CheckCheck className="w-3.5 h-3.5 shrink-0" /> E-mail envoyé à {selected.email}
                </div>
              )}
              <div className="flex flex-wrap gap-3">
                <button onClick={handleSendEmail} disabled={sending || !reply.trim()}
                  className="btn-primary !py-3 !px-6 gap-2 disabled:opacity-50">
                  {sending
                    ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Envoi…</>
                    : sendStatus === "ok"
                      ? <><CheckCheck className="w-3.5 h-3.5" /> Envoyé</>
                      : <><Mail className="w-3.5 h-3.5" /> Envoyer l'e-mail</>}
                </button>
                <a href={`https://api.whatsapp.com/send/?phone=${selected.phone.replace(/\D/g, "")}&text=${encodeURIComponent(reply)}`} target="_blank" rel="noreferrer" className="btn-ghost !py-3 !px-6">WhatsApp</a>
                <button onClick={() => { navigator.clipboard.writeText(reply); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                  className="flex items-center gap-2 px-4 py-3 border border-border text-[10px] tracking-[0.25em] uppercase font-bold text-muted-foreground hover:border-primary hover:text-primary transition-colors">
                  {copied ? <><CheckCheck className="w-3.5 h-3.5 text-emerald-500" /> Copié</> : <><Copy className="w-3.5 h-3.5" /> Copier</>}
                </button>
                <button onClick={() => convertToBooking(selected)} disabled={converted.has(selected.id)}
                  className={`flex items-center gap-2 px-4 py-3 border text-[10px] tracking-[0.25em] uppercase font-bold transition-colors ml-auto ${converted.has(selected.id) ? "border-emerald-200 text-emerald-600 bg-emerald-50 cursor-default" : "border-border text-muted-foreground hover:border-primary hover:text-primary"}`}>
                  {converted.has(selected.id) ? <><CheckCheck className="w-3.5 h-3.5" /> Converti</> : <><Plus className="w-3.5 h-3.5" /> Créer lead</>}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// ─── PATIENTS ─────────────────────────────────────────────────────────────────
function Patients({ bookings }: { bookings: Booking[] }) {
  const [search, setSearch]     = useState("");
  const [selected, setSelected] = useState<string | null>(null);

  const patientMap = useMemo(() => {
    const map = new Map<string, Booking[]>();
    bookings.forEach(b => { if (!map.has(b.email)) map.set(b.email, []); map.get(b.email)!.push(b); });
    return map;
  }, [bookings]);

  const patients = useMemo(() =>
    Array.from(patientMap.entries())
      .map(([email, bks]) => {
        const sorted = [...bks].sort((a, b) => b.date.localeCompare(a.date));
        return { email, name: sorted[0].name, phone: sorted[0].phone, origin: sorted[0].origin, latest: sorted[0], bookings: sorted };
      })
      .filter(p => { const q = search.toLowerCase(); return !q || p.name.toLowerCase().includes(q) || p.email.toLowerCase().includes(q) || p.origin.toLowerCase().includes(q); }),
    [patientMap, search]);

  const selectedPatient = selected ? patients.find(p => p.email === selected) ?? null : null;
  const totalRevenue = (bks: Booking[]) => bks.filter(b => b.status === "Terminé").reduce((a, b) => a + b.value, 0);

  return (
    <div className="flex gap-6">
      <div className="flex-1 min-w-0 space-y-5">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="display text-3xl text-foreground mb-1">Patients</h1>
            <p className="text-sm text-muted-foreground font-light">{patients.length} contact{patients.length > 1 ? "s" : ""}</p>
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
                {["Patient","Contact","Origine","Séjours","CA total","Tags","Statut"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[8px] tracking-[0.4em] uppercase font-bold text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {patients.length === 0
                ? <tr><td colSpan={7} className="px-4 py-10 text-center text-sm text-muted-foreground font-light">Aucun résultat</td></tr>
                : patients.map(p => (
                  <tr key={p.email} onClick={() => setSelected(selected === p.email ? null : p.email)}
                    className={`hover:bg-[hsl(var(--mist)/0.3)] cursor-pointer transition-colors ${selected === p.email ? "bg-primary/5" : ""}`}>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-[hsl(var(--mist))] flex items-center justify-center shrink-0"><span className="display text-xs text-primary">{p.name.split(" ").map(n => n[0]).join("").toUpperCase()}</span></div>
                        <div className="display text-sm text-foreground">{p.name}</div>
                      </div>
                    </td>
                    <td className="px-4 py-4"><div className="text-sm font-light text-foreground/70 text-xs">{p.email}</div><div className="text-[10px] text-muted-foreground">{p.phone}</div></td>
                    <td className="px-4 py-4 text-sm font-light text-muted-foreground text-xs">{p.origin}</td>
                    <td className="px-4 py-4"><span className="display text-sm text-foreground">{p.bookings.length}</span></td>
                    <td className="px-4 py-4"><span className={`display text-sm ${totalRevenue(p.bookings) > 0 ? "text-emerald-600" : "text-muted-foreground/40"}`}>{totalRevenue(p.bookings) > 0 ? `${totalRevenue(p.bookings).toLocaleString("fr")} €` : "—"}</span></td>
                    <td className="px-4 py-4"><div className="flex gap-1 flex-wrap">{p.latest.tags.slice(0, 2).map(t => <TagChip key={t} tag={t} />)}</div></td>
                    <td className="px-4 py-4"><StatusBadge status={p.latest.status} /></td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {selectedPatient && (
          <motion.div initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 24 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="w-80 shrink-0 bg-background border border-border self-start sticky top-6">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <span className="text-[9px] tracking-[0.4em] uppercase font-bold text-muted-foreground">Historique patient</span>
              <button onClick={() => setSelected(null)} className="w-7 h-7 border border-border flex items-center justify-center hover:border-primary hover:text-primary transition-colors"><X className="w-3 h-3" /></button>
            </div>
            <div className="p-6 space-y-6 max-h-[calc(100vh-160px)] overflow-y-auto">
              <div>
                <div className="w-12 h-12 bg-[hsl(var(--mist))] flex items-center justify-center mb-3"><span className="display text-lg text-primary">{selectedPatient.name.split(" ").map(n => n[0]).join("").toUpperCase()}</span></div>
                <div className="display text-xl text-foreground">{selectedPatient.name}</div>
                <div className="text-[9px] text-muted-foreground mt-1">{selectedPatient.origin}</div>
                {totalRevenue(selectedPatient.bookings) > 0 && <div className="text-emerald-600 font-bold text-sm mt-1">{totalRevenue(selectedPatient.bookings).toLocaleString("fr")} € réalisés</div>}
              </div>
              <div className="space-y-2">
                {[{ icon: Mail, label: selectedPatient.email }, { icon: Phone, label: selectedPatient.phone }].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-3"><Icon className="w-3.5 h-3.5 text-primary shrink-0" /><span className="font-light text-foreground/70 text-xs">{label}</span></div>
                ))}
              </div>
              <div className="border-t border-border pt-5">
                <div className="text-[8px] tracking-[0.4em] uppercase font-bold text-muted-foreground mb-4">{selectedPatient.bookings.length} séjour{selectedPatient.bookings.length > 1 ? "s" : ""}</div>
                <div className="space-y-3">
                  {selectedPatient.bookings.map(b => (
                    <div key={b.id} className="border border-border p-4">
                      <div className="flex items-start justify-between gap-2 mb-2"><div className="text-[9px] font-bold text-muted-foreground tracking-widest">{b.id}</div><StatusBadge status={b.status} /></div>
                      <div className="text-sm font-light text-foreground/80 mb-1">{b.service}</div>
                      <div className="flex items-center justify-between"><div className="text-[9px] text-muted-foreground">{b.date}</div>{b.value > 0 && <div className="text-[9px] font-bold text-primary">{b.value.toLocaleString("fr")} €</div>}</div>
                      {b.notes && <div className="mt-2 text-xs text-muted-foreground/70 font-light italic">{b.notes}</div>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── CALENDAR ─────────────────────────────────────────────────────────────────
const MONTHS_FR = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];
const DAYS_FR   = ["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"];

function CalendarTab({ bookings }: { bookings: Booking[] }) {
  const today = new Date();
  const [year, setYear]   = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [daySelected, setDaySelected] = useState<string | null>(null);

  const prev = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const next = () => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); };

  const firstDay    = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDow    = (firstDay.getDay() + 6) % 7;
  const cells: (number | null)[] = [...Array(startDow).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  while (cells.length % 7 !== 0) cells.push(null);

  const byDate = useMemo(() => {
    const map: Record<string, Booking[]> = {};
    bookings.forEach(b => { if (!map[b.date]) map[b.date] = []; map[b.date].push(b); });
    return map;
  }, [bookings]);

  const todayStr = today.toISOString().slice(0, 10);
  const fmt      = (d: number) => `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

  return (
    <div className="flex gap-6">
      <div className="flex-1 min-w-0 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="display text-3xl text-foreground mb-1">Calendrier</h1>
            <p className="text-sm text-muted-foreground font-light">{MONTHS_FR[month]} {year}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={prev} className="w-9 h-9 border border-border flex items-center justify-center hover:border-primary hover:text-primary transition-colors"><ChevronLeft className="w-4 h-4" /></button>
            <button onClick={() => { setYear(today.getFullYear()); setMonth(today.getMonth()); }} className="px-4 py-2 border border-border text-[9px] tracking-[0.3em] uppercase font-bold text-muted-foreground hover:border-primary hover:text-primary transition-colors">Aujourd'hui</button>
            <button onClick={next} className="w-9 h-9 border border-border flex items-center justify-center hover:border-primary hover:text-primary transition-colors"><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>
        <div className="bg-background border border-border overflow-hidden">
          <div className="grid grid-cols-7 border-b border-border">
            {DAYS_FR.map(d => <div key={d} className="py-3 text-center text-[8px] tracking-[0.4em] uppercase font-bold text-muted-foreground">{d}</div>)}
          </div>
          <div className="grid grid-cols-7">
            {cells.map((day, i) => {
              if (!day) return <div key={i} className="h-24 border-b border-r border-border bg-[hsl(var(--off)/0.4)]" />;
              const dateStr  = fmt(day);
              const dayBks   = byDate[dateStr] ?? [];
              const isToday  = dateStr === todayStr;
              const isSel    = dateStr === daySelected;
              return (
                <div key={i} onClick={() => setDaySelected(isSel ? null : dateStr)}
                  className={`h-24 border-b border-r border-border p-2 cursor-pointer transition-colors overflow-hidden ${isSel ? "bg-primary/8" : "hover:bg-[hsl(var(--mist)/0.3)]"}`}>
                  <div className={`w-6 h-6 flex items-center justify-center text-sm mb-1 ${isToday ? "bg-primary text-white display font-black" : "text-foreground/70 font-light"}`}>{day}</div>
                  <div className="space-y-0.5">
                    {dayBks.slice(0, 2).map(b => <div key={b.id} className={`text-[8px] font-bold truncate px-1 py-0.5 ${STATUS_CFG[b.status].bg} ${STATUS_CFG[b.status].text}`}>{b.name.split(" ")[0]}</div>)}
                    {dayBks.length > 2 && <div className="text-[8px] text-muted-foreground font-bold">+{dayBks.length - 2}</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {daySelected && (
          <motion.div initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 24 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="w-72 shrink-0 bg-background border border-border self-start sticky top-6">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <div className="text-[9px] tracking-[0.35em] uppercase font-bold text-muted-foreground">{new Date(daySelected).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}</div>
              <button onClick={() => setDaySelected(null)} className="w-7 h-7 border border-border flex items-center justify-center hover:border-primary hover:text-primary transition-colors"><X className="w-3 h-3" /></button>
            </div>
            <div className="p-4">
              {(byDate[daySelected] ?? []).length === 0
                ? <p className="text-sm text-muted-foreground font-light text-center py-6">Aucun rendez-vous</p>
                : <div className="space-y-3">
                  {(byDate[daySelected] ?? []).map(b => (
                    <div key={b.id} className="border border-border p-4">
                      <div className="flex items-start justify-between gap-2 mb-2"><div className="display text-sm text-foreground">{b.name}</div><StatusBadge status={b.status} /></div>
                      <div className="text-xs font-light text-foreground/60 mb-1">{b.service}</div>
                      <div className="flex items-center justify-between"><div className="text-[9px] text-muted-foreground">{b.origin}</div>{b.value > 0 && <div className="text-[9px] font-bold text-primary">{b.value.toLocaleString("fr")} €</div>}</div>
                      {b.tags.length > 0 && <div className="flex gap-1 flex-wrap mt-2">{b.tags.map(t => <TagChip key={t} tag={t} />)}</div>}
                    </div>
                  ))}
                </div>
              }
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── LOADING SCREEN ───────────────────────────────────────────────────────────
function LoadingScreen() {
  return (
    <div className="flex min-h-screen bg-[hsl(var(--off))] items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 bg-primary mx-auto grid place-items-center">
          <img src={logoMark} alt="" className="w-7 h-7 brightness-0 invert animate-pulse" />
        </div>
        <div className="flex items-center gap-2 text-muted-foreground text-sm font-light">
          <Loader2 className="w-4 h-4 animate-spin" /> Chargement du CRM…
        </div>
      </div>
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [authed, setAuthed]       = useState(false);
  const [tab, setTab]             = useState<Tab>("overview");
  const [bookings, setBookings]   = useState<Booking[]>([]);
  const [messages, setMessages]   = useState<Message[]>([]);
  const [loading, setLoading]     = useState(false);
  const [showNewLead, setShowNewLead] = useState(false);

  // ── Initial fetch ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!authed) return;
    setLoading(true);
    Promise.all([fetchBookings(), fetchMessages()])
      .then(([bks, msgs]) => { setBookings(bks); setMessages(msgs); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [authed]);

  // ── Realtime subscriptions ─────────────────────────────────────────────────
  useEffect(() => {
    if (!authed) return;
    const channel = supabase
      .channel("crm-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "bookings" }, () => {
        fetchBookings().then(setBookings).catch(console.error);
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "messages" }, () => {
        fetchMessages().then(setMessages).catch(console.error);
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "contact_log" }, () => {
        fetchBookings().then(setBookings).catch(console.error);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [authed]);

  // ── CRM mutation callbacks ─────────────────────────────────────────────────
  const handleUpdateFields = useCallback((updated: Booking) => {
    setBookings(prev => prev.map(b => b.id === updated.id ? updated : b));
    updateBookingFields(updated).catch(console.error);
  }, []);

  const handleUpdateStatus = useCallback((id: string, from: BookingStatus, to: BookingStatus) => {
    const ts = new Date().toISOString();
    setBookings(prev => prev.map(b => {
      if (b.id !== id) return b;
      return { ...b, status: to, history: [...b.history, { ts, action: "Statut modifié", from, to }] };
    }));
    changeBookingStatus(id, from, to).catch(console.error);
  }, []);

  const handleAddLog = useCallback((bookingId: string, entry: ContactEntry) => {
    setBookings(prev => prev.map(b =>
      b.id !== bookingId ? b : { ...b, contactLog: [entry, ...b.contactLog] }
    ));
    addContactLog(bookingId, entry).catch(console.error);
  }, []);

  const handleDeleteBooking = useCallback((id: string) => {
    setBookings(prev => prev.filter(b => b.id !== id));
    apiDeleteBooking(id).catch(console.error);
  }, []);

  const handleAddBooking = useCallback((b: Booking) => {
    setBookings(prev => [b, ...prev]);
    createBooking(b).catch(console.error);
    setTab("bookings");
  }, []);

  const handleMarkRead = useCallback((id: string) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, read: true } : m));
    markMessageRead(id).catch(console.error);
  }, []);

  const handleMarkAllRead = useCallback(() => {
    setMessages(prev => prev.map(m => ({ ...m, read: true })));
    markAllMessagesRead().catch(console.error);
  }, []);

  const handleDeleteMessage = useCallback((id: string) => {
    setMessages(prev => prev.filter(m => m.id !== id));
    apiDeleteMessage(id).catch(console.error);
  }, []);

  const crmCallbacks: CRMCallbacks = {
    onUpdateFields: handleUpdateFields,
    onUpdateStatus: handleUpdateStatus,
    onAddLog:       handleAddLog,
    onDelete:       handleDeleteBooking,
  };

  const unread = messages.filter(m => !m.read).length;

  if (!authed) return <LoginGate onLogin={() => setAuthed(true)} />;
  if (loading)  return <LoadingScreen />;

  return (
    <div className="flex min-h-screen bg-[hsl(var(--off))]">
      <Sidebar tab={tab} setTab={setTab} unread={unread} onLogout={() => { setAuthed(false); setBookings([]); setMessages([]); }} onNewLead={() => setShowNewLead(true)} />

      <main className="flex-1 min-w-0 p-8 overflow-auto">
        {/* Section badge + top bar */}
        <div className="mb-6 flex items-center gap-3">
          <span className={`text-[8px] tracking-[0.5em] uppercase font-bold px-3 py-1.5 border ${SECTION_OF[tab] === "dashboard" ? "bg-foreground/5 border-border text-muted-foreground" : "bg-primary/8 border-primary/25 text-primary"}`}>
            {SECTION_OF[tab] === "dashboard" ? "Tableau de bord" : "CRM"}
          </span>
          <div className="flex-1 h-px bg-border" />
          <button onClick={() => { setLoading(true); Promise.all([fetchBookings(), fetchMessages()]).then(([b, m]) => { setBookings(b); setMessages(m); }).catch(console.error).finally(() => setLoading(false)); }}
            className="w-8 h-8 border border-border flex items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors" title="Rafraîchir">
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => setShowNewLead(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-[9px] tracking-[0.3em] uppercase font-bold hover:bg-primary/90 transition-colors">
            <UserPlus className="w-3.5 h-3.5" /> Nouveau patient
          </button>
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
            {tab === "overview"  && <Overview  bookings={bookings} messages={messages} setTab={setTab} />}
            {tab === "pipeline"  && <Pipeline  bookings={bookings} callbacks={crmCallbacks} />}
            {tab === "bookings"  && <Bookings  bookings={bookings} callbacks={crmCallbacks} />}
            {tab === "messages"  && <Messages  messages={messages} bookings={bookings} onMarkRead={handleMarkRead} onMarkAllRead={handleMarkAllRead} onDeleteMessage={handleDeleteMessage} onAddBooking={handleAddBooking} />}
            {tab === "patients"  && <Patients  bookings={bookings} />}
            {tab === "calendar"  && <CalendarTab bookings={bookings} />}
          </motion.div>
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {showNewLead && <NewLeadModal onAdd={handleAddBooking} onClose={() => setShowNewLead(false)} />}
      </AnimatePresence>
    </div>
  );
}
