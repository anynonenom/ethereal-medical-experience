import { useState, useMemo, useEffect, useCallback, useRef } from "react";
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
  Bell, BellOff, Kanban, Menu,
  Send, Copy, CheckCheck, UserPlus, Activity,
  RefreshCw, Loader2, Stethoscope,
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
type Tab = "overview" | "pipeline" | "bookings" | "messages" | "patients" | "calendar" | "dentists";

// ─── DENTISTS ─────────────────────────────────────────────────────────────────
// Each booking is assigned to one practitioner. Colours are reused across the
// calendar, the practitioner workspace and the booking tables.
interface Dentist {
  name: string;
  short: string;
  specialty: string;
  dot: string;     // bg colour for the dentist marker dot / accent
  bg: string;      // soft background for chips
  text: string;    // text colour for chips
  border: string;  // border colour for chips
  bar: string;     // bg colour for calendar event chips
}
const DENTISTS: Dentist[] = [
  { name: "Dr. Salma El Fassi", short: "Dr. El Fassi", specialty: "Dentisterie esthétique",  dot: "bg-primary",     bg: "bg-primary/10",  text: "text-primary",     border: "border-primary/30",  bar: "bg-primary/15" },
  { name: "Dr. Youssef Benali", short: "Dr. Benali",   specialty: "Implantologie & chirurgie", dot: "bg-blue-500",   bg: "bg-blue-50",     text: "text-blue-700",     border: "border-blue-200",    bar: "bg-blue-50" },
  { name: "Dr. Leïla Amrani",   short: "Dr. Amrani",   specialty: "Couronnes & prothèses",   dot: "bg-purple-500",  bg: "bg-purple-50",   text: "text-purple-700",   border: "border-purple-200",  bar: "bg-purple-50" },
  { name: "Dr. Karim Tahiri",   short: "Dr. Tahiri",   specialty: "Général & blanchiment",   dot: "bg-amber-500",   bg: "bg-amber-50",    text: "text-amber-700",    border: "border-amber-200",   bar: "bg-amber-50" },
];
const DENTIST_NAMES = DENTISTS.map(d => d.name);
const dentistMeta = (name: string): Dentist | undefined => DENTISTS.find(d => d.name === name);

// Auto-assignment: each service maps to the specialist who handles it.
const SERVICE_DENTIST: Record<string, string> = {
  "Smile Design complet":        "Dr. Salma El Fassi",
  "Facettes porcelaine E-max":   "Dr. Salma El Fassi",
  "Séjour médical tout inclus":  "Dr. Salma El Fassi",
  "Implantologie":               "Dr. Youssef Benali",
  "Couronnes Zircone":           "Dr. Leïla Amrani",
  "Blanchiment laser":           "Dr. Karim Tahiri",
  "Consultation générale":       "Dr. Karim Tahiri",
};
const dentistForService = (service: string) => SERVICE_DENTIST[service] ?? DENTISTS[0].name;

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
const SOURCES: LeadSource[] = ["Site web","WhatsApp","Instagram","Google","Facebook","Référence","Autre"];

const SECTION_OF: Record<Tab, "dashboard" | "crm"> = {
  overview: "dashboard", calendar: "dashboard",
  pipeline: "crm", bookings: "crm", messages: "crm", patients: "crm", dentists: "crm",
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

function DentistChip({ name, className = "" }: { name: string; className?: string }) {
  const d = dentistMeta(name);
  if (!name) return <span className="inline-flex items-center gap-1 text-[9px] text-muted-foreground/40 italic">Non assigné</span>;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[9px] font-bold border ${d ? `${d.bg} ${d.text} ${d.border}` : "bg-border/30 text-muted-foreground border-border"} ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${d?.dot ?? "bg-muted-foreground"}`} />
      {d?.short ?? name}
    </span>
  );
}

// ─── LOGIN GATE ───────────────────────────────────────────────────────────────
// Admin logs in and sees everything. Each practitioner has their own password
// and only sees their own workspace (their bookings, scoped).
type Session = { role: "admin" } | { role: "dentist"; dentist: string };
const ADMIN_PASSWORD = "MB2026";
const DENTIST_LOGINS: Record<string, string> = {
  "salma2026":   "Dr. Salma El Fassi",
  "youssef2026": "Dr. Youssef Benali",
  "leila2026":   "Dr. Leïla Amrani",
  "karim2026":   "Dr. Karim Tahiri",
};

function LoginGate({ onLogin }: { onLogin: (s: Session) => void }) {
  const [pw, setPw] = useState(""); const [error, setError] = useState(false);
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pw === ADMIN_PASSWORD) { onLogin({ role: "admin" }); return; }
    const dentist = DENTIST_LOGINS[pw.trim().toLowerCase()];
    if (dentist) { onLogin({ role: "dentist", dentist }); return; }
    setError(true); setPw("");
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
        <div className="mt-8 text-[9px] text-muted-foreground/40 text-center tracking-widest space-y-1 leading-relaxed">
          <p><span className="text-muted-foreground/60">Admin</span> : MB2026</p>
          <p><span className="text-muted-foreground/60">Praticien</span> : salma2026 · youssef2026 · leila2026 · karim2026</p>
        </div>
      </motion.div>
    </div>
  );
}

// ─── NEW LEAD MODAL ───────────────────────────────────────────────────────────
const BLANK_FORM = { nom: "", prenom: "", email: "", phone: "", service: "Consultation générale", dentist: "", origin: "", date: "", source: "Site web" as LeadSource, value: "", notes: "" };

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
      dentist: form.dentist || dentistForService(form.service),
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
                {field("Valeur estimée (MAD)",      "value",  "number", "0")}
              </div>
              <div className="grid grid-cols-2 gap-5">
                <label className="block group">
                  <span className="text-[9px] tracking-[0.4em] uppercase font-bold text-muted-foreground group-focus-within:text-primary transition-colors">Date de rendez-vous</span>
                  <input type="date" value={form.date} onChange={e => set("date", e.target.value)}
                    className="w-full mt-2 bg-transparent border-b border-border py-2.5 outline-none focus:border-primary transition-colors text-sm font-light rounded-none" />
                </label>
                <label className="block group">
                  <span className="text-[9px] tracking-[0.4em] uppercase font-bold text-muted-foreground group-focus-within:text-primary transition-colors">Praticien assigné</span>
                  <select value={form.dentist || dentistForService(form.service)} onChange={e => set("dentist", e.target.value)}
                    className="w-full mt-2 bg-transparent border-b border-border py-2.5 outline-none focus:border-primary transition-colors text-sm font-light appearance-none rounded-none cursor-pointer">
                    {DENTISTS.map(d => <option key={d.name} value={d.name}>{d.name} — {d.specialty}</option>)}
                  </select>
                </label>
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
  { id: "dentists" as Tab, label: "Praticiens",     icon: Stethoscope },
];
// Practitioner-scoped navigation — what a dentist sees once logged in.
const DENTIST_NAV = [
  { id: "dentists" as Tab, label: "Mon espace",    icon: Stethoscope },
  { id: "bookings" as Tab, label: "Rendez-vous",   icon: Calendar },
  { id: "calendar" as Tab, label: "Calendrier",    icon: BarChart3 },
  { id: "patients" as Tab, label: "Patients",      icon: Users },
];

function Sidebar({ tab, setTab, unread, onLogout, onNewLead, onClose, session }: {
  tab: Tab; setTab: (t: Tab) => void; unread: number; onLogout: () => void; onNewLead: () => void; onClose?: () => void; session: Session;
}) {
  const section = SECTION_OF[tab];
  const isDentist = session.role === "dentist";
  const NavItem = ({ item }: { item: { id: Tab; label: string; icon: React.ElementType } }) => {
    const active = tab === item.id;
    return (
      <button onClick={() => { setTab(item.id); onClose?.(); }}
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
    <aside className="w-[240px] shrink-0 bg-[hsl(var(--ink))] flex flex-col h-full">
      <div className="flex items-center gap-3 px-6 py-5 border-b border-white/8">
        <div className="w-9 h-9 bg-primary grid place-items-center shrink-0">
          <img src={logoMark} alt="" className="w-5 h-5 brightness-0 invert" />
        </div>
        <div className="flex-1">
          <div className="display text-[11px] tracking-[0.2em] text-white font-black">MEDICAL BAY</div>
          <div className="text-[8px] tracking-[0.35em] uppercase font-bold mt-0.5">
            {isDentist
              ? <span className="text-primary/80">Espace praticien</span>
              : section === "dashboard" ? <span className="text-white/50">Tableau de bord</span> : <span className="text-primary/80">CRM</span>}
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="w-7 h-7 border border-white/15 flex items-center justify-center hover:border-primary hover:text-primary transition-colors lg:hidden">
            <X className="w-3.5 h-3.5 text-white/50" />
          </button>
        )}
      </div>

      <nav className="flex-1 px-3 py-3 overflow-y-auto space-y-4">
        {!isDentist && (
          <button onClick={onNewLead}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary/15 border border-primary/30 text-primary hover:bg-primary hover:text-white transition-all duration-200">
            <UserPlus className="w-3.5 h-3.5 shrink-0" />
            <span className="text-[10px] tracking-[0.2em] uppercase font-bold">Nouveau patient</span>
          </button>
        )}

        {isDentist ? (
          <div>
            <div className="flex items-center gap-2.5 px-3 py-2 mb-1 border-l-2 border-primary">
              <div className="w-5 h-5 flex items-center justify-center shrink-0 bg-primary">
                <Stethoscope className="w-2.5 h-2.5 text-white" />
              </div>
              <span className="text-[8px] tracking-[0.45em] uppercase font-black text-white/70">Mon espace</span>
            </div>
            <div className="space-y-0.5">
              {DENTIST_NAV.map(item => <NavItem key={item.id} item={item} />)}
            </div>
          </div>
        ) : (
          <>
            <div>
              <div className={`flex items-center gap-2.5 px-3 py-2 mb-1 border-l-2 transition-colors ${section === "dashboard" ? "border-primary" : "border-transparent"}`}>
                <div className={`w-5 h-5 flex items-center justify-center shrink-0 transition-colors ${section === "dashboard" ? "bg-primary" : "bg-white/8"}`}>
                  <LayoutDashboard className="w-2.5 h-2.5 text-white" />
                </div>
                <span className={`text-[8px] tracking-[0.45em] uppercase font-black transition-colors ${section === "dashboard" ? "text-white/70" : "text-white/20"}`}>Tableau de bord</span>
              </div>
              <div className="space-y-0.5">
                {DASHBOARD_NAV.map(item => <NavItem key={item.id} item={item} />)}
              </div>
            </div>
            <div className="mx-4 border-t border-white/8" />
            <div>
              <div className={`flex items-center gap-2.5 px-3 py-2 mb-1 border-l-2 transition-colors ${section === "crm" ? "border-primary" : "border-transparent"}`}>
                <div className={`w-5 h-5 flex items-center justify-center shrink-0 transition-colors ${section === "crm" ? "bg-primary" : "bg-white/8"}`}>
                  <Users className="w-2.5 h-2.5 text-white" />
                </div>
                <span className={`text-[8px] tracking-[0.45em] uppercase font-black transition-colors ${section === "crm" ? "text-white/70" : "text-white/20"}`}>CRM</span>
              </div>
              <div className="space-y-0.5">
                {CRM_NAV.map(item => <NavItem key={item.id} item={item} />)}
              </div>
            </div>
          </>
        )}
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
    const map: Record<string, { count: number; revenue: number }> = {};
    bookings.forEach(b => {
      if (!map[b.source]) map[b.source] = { count: 0, revenue: 0 };
      map[b.source].count += 1;
      if (b.status !== "Annulé") map[b.source].revenue += b.value;
    });
    return Object.entries(map).sort((a, b) => b[1].revenue - a[1].revenue);
  }, [bookings]);
  const maxSrcRev = Math.max(...sourceBreakdown.map(([, s]) => s.revenue), 1);

  const unread = messages.filter(m => !m.read).length;

  return (
    <div className="space-y-6">

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: "Leads totaux",     value: stats.total,                                sub: "toutes sources",     icon: Zap,          color: "text-primary",     accent: "border-l-primary",    iconBg: "bg-primary/10" },
          { label: "Pipeline actif",   value: `${stats.pipeline.toLocaleString("fr")} MAD`, sub: "revenus potentiels", icon: TrendingUp,   color: "text-amber-600",   accent: "border-l-amber-400",  iconBg: "bg-amber-50" },
          { label: "Séjours terminés", value: stats.done,                                 sub: "patients traités",   icon: CheckCircle2, color: "text-emerald-600", accent: "border-l-emerald-500",iconBg: "bg-emerald-50" },
          { label: "CA réalisé",       value: `${stats.revenue.toLocaleString("fr")} MAD`,  sub: "séjours clôturés",   icon: BarChart3,    color: "text-primary",     accent: "border-l-primary",    iconBg: "bg-primary/10" },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            className={`bg-white border border-border border-l-4 ${s.accent} p-5 md:p-6 shadow-sm`}>
            <div className="flex items-start justify-between mb-4">
              <div className={`w-9 h-9 ${s.iconBg} flex items-center justify-center`}><s.icon className={`w-4 h-4 ${s.color}`} /></div>
              <span className="text-[8px] tracking-[0.3em] uppercase font-bold text-muted-foreground/40">{s.sub}</span>
            </div>
            <div className={`display text-3xl md:text-4xl font-black mb-1 ${s.color}`}>{s.value}</div>
            <div className="text-[9px] tracking-[0.3em] uppercase font-bold text-muted-foreground">{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Alert banners */}
      {(overdueFollowUps.length > 0 || todayFollowUps.length > 0 || unread > 0) && (
        <div className="flex flex-col gap-2">
          {overdueFollowUps.length > 0 && (
            <button onClick={() => setTab("bookings")} className="w-full flex items-center gap-4 bg-red-50 border-l-4 border-l-red-500 border border-red-200 px-5 py-3 hover:bg-red-100 transition-colors group text-left shadow-sm">
              <Bell className="w-4 h-4 text-red-500 shrink-0" />
              <span className="text-sm font-light text-foreground flex-1"><strong className="font-semibold text-red-600">{overdueFollowUps.length} suivi{overdueFollowUps.length > 1 ? "s" : ""} en retard</strong> — {overdueFollowUps.map(b => b.name.split(" ")[0]).join(", ")}</span>
              <ArrowUpRight className="w-4 h-4 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          )}
          {todayFollowUps.length > 0 && (
            <button onClick={() => setTab("bookings")} className="w-full flex items-center gap-4 bg-amber-50 border-l-4 border-l-amber-500 border border-amber-200 px-5 py-3 hover:bg-amber-100 transition-colors group text-left shadow-sm">
              <Bell className="w-4 h-4 text-amber-600 shrink-0" />
              <span className="text-sm font-light text-foreground flex-1"><strong className="font-semibold text-amber-700">{todayFollowUps.length} suivi{todayFollowUps.length > 1 ? "s" : ""} aujourd'hui</strong> — {todayFollowUps.map(b => b.name.split(" ")[0]).join(", ")}</span>
              <ArrowUpRight className="w-4 h-4 text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          )}
          {unread > 0 && (
            <button onClick={() => setTab("messages")} className="w-full flex items-center gap-4 bg-primary/5 border-l-4 border-l-primary border border-primary/20 px-5 py-3 hover:bg-primary/8 transition-colors group text-left shadow-sm">
              <AlertCircle className="w-4 h-4 text-primary shrink-0" />
              <span className="text-sm font-light text-foreground flex-1"><strong className="font-semibold text-primary">{unread} message{unread > 1 ? "s" : ""} non lu{unread > 1 ? "s" : ""}</strong> en attente</span>
              <ArrowUpRight className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          )}
        </div>
      )}

      {/* Main widgets */}
      <div className="grid xl:grid-cols-[1fr_1fr_280px] gap-5">
        {/* Cette semaine */}
        <div className="bg-white border border-border shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-[#fafafa]">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              <span className="display text-sm text-foreground">Cette semaine</span>
            </div>
            <button onClick={() => setTab("calendar")} className="text-[9px] tracking-[0.3em] uppercase font-bold text-primary hover:underline">Voir tout →</button>
          </div>
          {upcoming.length === 0
            ? <div className="px-6 py-10 text-center text-sm text-muted-foreground font-light">Aucun rendez-vous</div>
            : <div className="divide-y divide-border">
              {upcoming.map(b => (
                <div key={b.id} className="flex items-center gap-3 px-5 py-3 hover:bg-[#fafafa] transition-colors">
                  <div className="w-9 h-9 bg-primary/8 flex flex-col items-center justify-center shrink-0">
                    <span className="display text-xs text-primary font-black leading-none">{new Date(b.date).getDate()}</span>
                    <span className="text-[7px] uppercase text-primary/60 font-bold">{new Date(b.date).toLocaleDateString("fr-FR",{month:"short"})}</span>
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

        {/* Activité récente */}
        <div className="bg-white border border-border shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-border bg-[#fafafa]">
            <Activity className="w-4 h-4 text-primary" />
            <span className="display text-sm text-foreground">Activité récente</span>
          </div>
          {recentActivity.length === 0
            ? <div className="px-6 py-10 text-center text-sm text-muted-foreground font-light">Aucune activité</div>
            : <div className="divide-y divide-border">
              {recentActivity.map(({ entry, booking }) => {
                const cfg = LOG_CFG[entry.type];
                return (
                  <div key={entry.id} className="flex items-start gap-3 px-5 py-3 hover:bg-[#fafafa] transition-colors">
                    <div className={`w-7 h-7 flex items-center justify-center shrink-0 mt-0.5 rounded-sm ${cfg.color}`}><cfg.icon className="w-3 h-3" /></div>
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

        {/* Right column: Pipeline + Sources + Top soins */}
        <div className="space-y-4">
          <div className="bg-white border border-border shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <Kanban className="w-3.5 h-3.5 text-primary" />
              <span className="text-[9px] tracking-[0.4em] uppercase font-bold text-muted-foreground">Pipeline</span>
            </div>
            <div className="space-y-3">
              {pipeline.map(p => (
                <div key={p.label} className="flex items-center gap-3">
                  <div className="text-[9px] tracking-[0.1em] uppercase font-bold text-muted-foreground w-16 shrink-0">{p.label}</div>
                  <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: stats.total ? `${(p.count / stats.total) * 100}%` : "0%" }}
                      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                      className={`h-full ${p.color}`} />
                  </div>
                  <div className="display text-sm text-foreground w-4 text-right shrink-0">{p.count}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-border shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-3.5 h-3.5 text-primary" />
              <span className="text-[9px] tracking-[0.4em] uppercase font-bold text-muted-foreground">Revenus par source</span>
            </div>
            <div className="space-y-3">
              {sourceBreakdown.map(([src, s]) => (
                <div key={src}>
                  <div className="flex items-center justify-between mb-1 gap-2">
                    <span className="font-light text-foreground/70 text-xs truncate">{src} <span className="text-muted-foreground/45">· {s.count} lead{s.count > 1 ? "s" : ""}</span></span>
                    <span className="display text-xs text-primary font-black shrink-0">{s.revenue.toLocaleString("fr")} MAD</span>
                  </div>
                  <div className="h-1 bg-border rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(s.revenue / maxSrcRev) * 100}%` }}
                      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                      className="h-full bg-primary/50" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-border shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-3.5 h-3.5 text-primary" />
              <span className="text-[9px] tracking-[0.4em] uppercase font-bold text-muted-foreground">Top soins</span>
            </div>
            <div className="space-y-2.5">
              {serviceBreakdown.map(([svc, n]) => (
                <div key={svc}>
                  <div className="flex justify-between mb-1">
                    <span className="text-[9px] font-light text-foreground/70 truncate max-w-[160px]">{svc}</span>
                    <span className="text-[9px] font-bold text-muted-foreground shrink-0 ml-2">{n}</span>
                  </div>
                  <div className="h-1 bg-border rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(n / maxSvc) * 100}%` }}
                      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                      className="h-full bg-primary/50" />
                  </div>
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
  const setDentist   = (name: string) => onUpdateFields({ ...booking, dentist: name });

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
    <motion.div
      initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 24 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="w-full md:w-[340px] shrink-0 bg-background border border-border self-start md:sticky md:top-6">
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

            {/* Praticien assigné */}
            <div className="border-t border-border pt-4">
              <div className="text-[8px] tracking-[0.4em] uppercase font-bold text-muted-foreground mb-2 flex items-center gap-1.5"><Stethoscope className="w-2.5 h-2.5" /> Praticien assigné</div>
              <div className="mb-2"><DentistChip name={booking.dentist} /></div>
              <select value={booking.dentist} onChange={e => setDentist(e.target.value)}
                className="w-full bg-transparent border-b border-border py-2 outline-none focus:border-primary text-sm font-light text-foreground transition-colors rounded-none cursor-pointer appearance-none">
                <option value="">Non assigné</option>
                {DENTISTS.map(d => <option key={d.name} value={d.name}>{d.name} — {d.specialty}</option>)}
              </select>
            </div>

            {/* Value */}
            <div className="border-t border-border pt-4">
              <div className="text-[8px] tracking-[0.4em] uppercase font-bold text-muted-foreground mb-1.5">Valeur estimée (MAD)</div>
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
          <p className="text-sm text-muted-foreground font-light">Vue kanban · {bookings.filter(b => !["Terminé","Annulé"].includes(b.status)).length} leads actifs</p>
        </div>
        <div className="flex gap-3 min-w-max pb-4">
          {columns.map(col => {
            const cards = bookings.filter(b => b.status === col);
            const cfg = STATUS_CFG[col];
            return (
              <div key={col} className="w-64 shrink-0 flex flex-col">
                {/* Column header */}
                <div className={`${cfg.col} border border-b-0 border-border px-4 py-3`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                      <span className={`text-[9px] tracking-[0.3em] uppercase font-black ${cfg.text}`}>{col}</span>
                    </div>
                    <span className={`w-5 h-5 text-[9px] font-black flex items-center justify-center ${cfg.bg} ${cfg.text} border ${cfg.border}`}>{cards.length}</span>
                  </div>
                  {totalValue(col) > 0 && <div className="text-[9px] text-muted-foreground font-light mt-1">{totalValue(col).toLocaleString("fr")} MAD</div>}
                </div>
                {/* Cards */}
                <div className="bg-[#f4f5f7] border border-border p-2 space-y-2 min-h-[140px] flex-1">
                  {cards.map(b => (
                    <motion.div key={b.id} layout onClick={() => setSelected(selected?.id === b.id ? null : b)}
                      className={`bg-white border cursor-pointer p-3 shadow-sm hover:shadow-md transition-all duration-200 ${selected?.id === b.id ? "border-primary ring-1 ring-primary/20" : "border-border hover:border-primary/30"}`}>
                      <div className="flex items-start justify-between gap-1 mb-2">
                        <div className="display text-xs text-foreground leading-tight">{b.name}</div>
                        {b.followUp && b.followUp <= new Date().toISOString().slice(0, 10) && <Bell className="w-2.5 h-2.5 text-red-400 shrink-0 mt-0.5" />}
                      </div>
                      <div className="text-[9px] text-muted-foreground font-light mb-2 truncate">{b.service}</div>
                      {b.dentist && <div className="mb-2"><DentistChip name={b.dentist} /></div>}
                      {b.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {b.tags.slice(0, 2).map(t => <TagChip key={t} tag={t} />)}
                          {b.tags.length > 2 && <span className="text-[8px] text-muted-foreground">+{b.tags.length - 2}</span>}
                        </div>
                      )}
                      <div className="flex items-center justify-between mb-2.5">
                        <span className="text-[9px] font-bold text-muted-foreground">{b.origin.split(",")[0]}</span>
                        {b.value > 0 && <span className="text-[9px] font-black text-primary">{b.value.toLocaleString("fr")} MAD</span>}
                      </div>
                      <div className="pt-2 border-t border-border flex gap-1">
                        {columns.filter(c => c !== col).slice(0, 3).map(c => (
                          <button key={c} onClick={e => { e.stopPropagation(); onUpdateStatus(b.id, b.status, c); }}
                            className={`flex-1 text-[7px] tracking-[0.1em] uppercase font-bold py-1 border transition-colors ${STATUS_CFG[c].text} ${STATUS_CFG[c].bg} ${STATUS_CFG[c].border} hover:opacity-80`}>
                            {c.slice(0, 4)}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                  {cards.length === 0 && <div className="py-8 text-center text-[9px] text-muted-foreground/30 font-light">Aucun lead</div>}
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
    const headers = ["ID","Nom","Email","Téléphone","Service","Praticien","Origine","Date","Statut","Valeur","Source","Tags","Notes"];
    const rows = bookings.map(b => [b.id, b.name, b.email, b.phone, b.service, b.dentist, b.origin, b.date, b.status, b.value, b.source, b.tags.join(";"), b.notes]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `medicalbay-leads-${today}.csv`; a.click();
  };

  return (
    <div className="flex gap-6 h-full">
      <div className="flex-1 min-w-0 space-y-5">
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground font-light">{bookings.length} lead{bookings.length !== 1 ? "s" : ""} au total</p>
          <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 bg-white border border-border shadow-sm text-[9px] tracking-[0.3em] uppercase font-bold text-muted-foreground hover:border-primary hover:text-primary transition-colors">
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
        </div>

        <div className="space-y-2">
          <div className="flex gap-1 flex-wrap">
            {(["Tous","Nouveau","Confirmé","En cours","Terminé","Annulé"] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1.5 text-[9px] tracking-[0.25em] uppercase font-bold border transition-colors shadow-sm ${filter === f ? "bg-primary text-white border-primary" : "bg-white border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"}`}>
                {f} <span className="opacity-50 ml-0.5">({counts[f]})</span>
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

        <div className="bg-white border border-border shadow-sm overflow-hidden overflow-x-auto">
          <table className="w-full min-w-[780px]">
            <thead>
              <tr className="border-b-2 border-border bg-[#fafafa]">
                {["Patient","Service","Praticien","Date / Suivi","Valeur","Tags","Statut",""].map(h => (
                  <th key={h} className="px-4 py-3.5 text-left text-[8px] tracking-[0.4em] uppercase font-black text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0
                ? <tr><td colSpan={8} className="px-4 py-12 text-center text-sm text-muted-foreground font-light">Aucun résultat</td></tr>
                : filtered.map((b, idx) => {
                  const isOverdue = b.followUp && b.followUp < today;
                  return (
                    <tr key={b.id} onClick={() => setSelected(b === selected ? null : b)}
                      className={`cursor-pointer transition-colors ${selected?.id === b.id ? "bg-primary/5 border-l-2 border-l-primary" : idx % 2 === 0 ? "bg-white hover:bg-[#fafafa]" : "bg-[#fafafa]/50 hover:bg-[#f0f0f0]"}`}>
                      <td className="px-4 py-3.5">
                        <div className="display text-sm text-foreground">{b.name}</div>
                        <div className="text-[9px] text-muted-foreground">{b.email}</div>
                      </td>
                      <td className="px-4 py-3.5 text-sm font-light text-foreground/70 max-w-[130px] truncate">{b.service}</td>
                      <td className="px-4 py-3.5"><DentistChip name={b.dentist} /></td>
                      <td className="px-4 py-3.5">
                        <div className="text-[10px] font-bold text-muted-foreground">{b.date}</div>
                        {b.followUp && <div className={`text-[9px] flex items-center gap-1 mt-0.5 ${isOverdue ? "text-red-500 font-semibold" : "text-muted-foreground/60"}`}><Bell className="w-2.5 h-2.5" /> {b.followUp}</div>}
                      </td>
                      <td className="px-4 py-3.5"><span className="display text-sm text-foreground font-black">{b.value > 0 ? `${b.value.toLocaleString("fr")} MAD` : <span className="text-muted-foreground/30 font-light">—</span>}</span></td>
                      <td className="px-4 py-3.5"><div className="flex gap-1 flex-wrap max-w-[100px]">{b.tags.slice(0, 2).map(t => <TagChip key={t} tag={t} />)}</div></td>
                      <td className="px-4 py-3.5"><StatusBadge status={b.status} /></td>
                      <td className="px-4 py-3.5">
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
      dentist: dentistForService("Consultation générale"),
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
    <div className="flex flex-col md:flex-row gap-6 h-full">
      <div className="w-full md:w-72 shrink-0 space-y-4">
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
        <div className="bg-background border border-border overflow-hidden overflow-x-auto">
          <table className="w-full min-w-[680px]">
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
                    <td className="px-4 py-4"><span className={`display text-sm ${totalRevenue(p.bookings) > 0 ? "text-emerald-600" : "text-muted-foreground/40"}`}>{totalRevenue(p.bookings) > 0 ? `${totalRevenue(p.bookings).toLocaleString("fr")} MAD` : "—"}</span></td>
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
                {totalRevenue(selectedPatient.bookings) > 0 && <div className="text-emerald-600 font-bold text-sm mt-1">{totalRevenue(selectedPatient.bookings).toLocaleString("fr")} MAD réalisés</div>}
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
                      {b.dentist && <div className="mb-1.5"><DentistChip name={b.dentist} /></div>}
                      <div className="flex items-center justify-between"><div className="text-[9px] text-muted-foreground">{b.date}</div>{b.value > 0 && <div className="text-[9px] font-bold text-primary">{b.value.toLocaleString("fr")} MAD</div>}</div>
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
    <div className="flex flex-col lg:flex-row gap-6">
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
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 bg-white border border-border px-4 py-3 shadow-sm">
          <span className="text-[8px] tracking-[0.4em] uppercase font-bold text-muted-foreground">Praticiens</span>
          {DENTISTS.map(d => (
            <div key={d.name} className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${d.dot}`} />
              <span className="text-[10px] font-light text-foreground/70">{d.short}</span>
            </div>
          ))}
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
                    {dayBks.slice(0, 2).map(b => {
                      const dm = dentistMeta(b.dentist);
                      return (
                        <div key={b.id} className={`flex items-center gap-1 text-[8px] font-bold px-1 py-0.5 ${STATUS_CFG[b.status].bg} ${STATUS_CFG[b.status].text}`}>
                          <span className={`w-1 h-1 rounded-full shrink-0 ${dm?.dot ?? "bg-foreground/30"}`} title={b.dentist || "Non assigné"} />
                          <span className="truncate">{b.name.split(" ")[0]}</span>
                        </div>
                      );
                    })}
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
            className="w-full lg:w-72 shrink-0 bg-background border border-border self-start lg:sticky lg:top-6">
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
                      <div className="text-xs font-light text-foreground/60 mb-2">{b.service}</div>
                      <div className="mb-2"><DentistChip name={b.dentist} /></div>
                      <div className="space-y-1 mb-2">
                        <a href={`mailto:${b.email}`} className="flex items-center gap-2 text-[10px] text-muted-foreground hover:text-primary transition-colors"><Mail className="w-2.5 h-2.5 text-primary shrink-0" /><span className="truncate">{b.email}</span></a>
                        <a href={`tel:${b.phone}`} className="flex items-center gap-2 text-[10px] text-muted-foreground hover:text-primary transition-colors"><Phone className="w-2.5 h-2.5 text-primary shrink-0" />{b.phone}</a>
                      </div>
                      <div className="flex items-center justify-between"><div className="text-[9px] text-muted-foreground">{b.origin}</div>{b.value > 0 && <div className="text-[9px] font-bold text-primary">{b.value.toLocaleString("fr")} MAD</div>}</div>
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

// ─── DENTISTS WORKSPACE ───────────────────────────────────────────────────────
function DentistsTab({ bookings, lockedDentist }: { bookings: Booking[]; lockedDentist?: string }) {
  const [selected, setSelected] = useState<string>(lockedDentist ?? DENTISTS[0].name);
  const today = new Date().toISOString().slice(0, 10);

  // Aggregated stats per practitioner.
  const stats = useMemo(() => DENTISTS.map(d => {
    const mine     = bookings.filter(b => b.dentist === d.name);
    const active   = mine.filter(b => !["Terminé","Annulé"].includes(b.status));
    const done     = mine.filter(b => b.status === "Terminé");
    const upcoming = mine.filter(b => b.date >= today && b.status !== "Annulé");
    return {
      dentist:  d,
      total:    mine.length,
      active:   active.length,
      pipeline: active.reduce((a, b) => a + b.value, 0),
      revenue:  done.reduce((a, b) => a + b.value, 0),
      upcoming: upcoming.length,
      patients: new Set(mine.map(b => b.email)).size,
    };
  }), [bookings, today]);

  const sel = stats.find(s => s.dentist.name === (lockedDentist ?? selected)) ?? stats[0];
  const d = sel.dentist;
  const initials = d.name.replace("Dr. ", "").split(" ").map(n => n[0]).join("").toUpperCase();

  const selBookings = useMemo(() => bookings.filter(b => b.dentist === d.name), [bookings, d.name]);
  const selUpcoming = useMemo(
    () => selBookings.filter(b => b.date >= today && b.status !== "Annulé").sort((a, b) => a.date.localeCompare(b.date)),
    [selBookings, today]
  );
  const unassigned = bookings.filter(b => !dentistMeta(b.dentist)).length;
  const pipelineCols = (["Nouveau","Confirmé","En cours","Terminé"] as BookingStatus[])
    .map(s => ({ label: s, count: selBookings.filter(b => b.status === s).length }));
  const maxCol = Math.max(...pipelineCols.map(p => p.count), 1);

  const kpis = [
    { label: "Leads actifs", value: String(sel.active),                          icon: Zap,          color: "text-primary",     accent: "border-l-primary",     iconBg: "bg-primary/10" },
    { label: "Pipeline",     value: `${sel.pipeline.toLocaleString("fr")} MAD`,  icon: TrendingUp,   color: "text-amber-600",   accent: "border-l-amber-400",   iconBg: "bg-amber-50" },
    { label: "CA réalisé",   value: `${sel.revenue.toLocaleString("fr")} MAD`,   icon: CheckCircle2, color: "text-emerald-600", accent: "border-l-emerald-500", iconBg: "bg-emerald-50" },
    { label: "RDV à venir",  value: String(sel.upcoming),                         icon: Calendar,     color: "text-primary",     accent: "border-l-primary",     iconBg: "bg-primary/10" },
  ];

  return (
    <div className="flex flex-col xl:flex-row gap-6">
      {/* Left rail — practitioner cards (hidden when a dentist is locked to their own workspace) */}
      {!lockedDentist && (
      <div className="w-full xl:w-72 shrink-0 space-y-3">
        <p className="text-sm text-muted-foreground font-light">
          {DENTISTS.length} praticiens{unassigned > 0 ? ` · ${unassigned} non assigné${unassigned > 1 ? "s" : ""}` : ""}
        </p>
        {stats.map(s => {
          const dd = s.dentist;
          const active = selected === dd.name;
          return (
            <button key={dd.name} onClick={() => setSelected(dd.name)}
              className={`w-full text-left bg-white border p-4 shadow-sm transition-all duration-200 ${active ? "border-primary ring-1 ring-primary/20" : "border-border hover:border-primary/40"}`}>
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 ${dd.bg} ${dd.text} flex items-center justify-center shrink-0`}>
                  <span className="display text-sm font-black">{dd.name.replace("Dr. ", "").split(" ").map(n => n[0]).join("").toUpperCase()}</span>
                </div>
                <div className="min-w-0">
                  <div className="display text-sm text-foreground truncate">{dd.name}</div>
                  <div className="text-[9px] text-muted-foreground font-light truncate">{dd.specialty}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="bg-[hsl(var(--off))] py-1.5">
                  <div className="display text-sm text-foreground font-black">{s.active}</div>
                  <div className="text-[7px] tracking-[0.2em] uppercase font-bold text-muted-foreground">Actifs</div>
                </div>
                <div className="bg-[hsl(var(--off))] py-1.5">
                  <div className="display text-sm text-primary font-black">{s.upcoming}</div>
                  <div className="text-[7px] tracking-[0.2em] uppercase font-bold text-muted-foreground">À venir</div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
      )}

      {/* Right — selected practitioner workspace */}
      <div className="flex-1 min-w-0 space-y-5">
        {/* Header */}
        <div className={`bg-white border border-border border-l-4 ${kpis[0].accent} shadow-sm p-6 flex items-center gap-4`}>
          <div className={`w-14 h-14 ${d.bg} ${d.text} flex items-center justify-center shrink-0`}>
            <span className="display text-lg font-black">{initials}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="display text-2xl text-foreground">{d.name}</div>
            <div className="flex items-center gap-2 mt-1">
              <span className={`w-2 h-2 rounded-full ${d.dot}`} />
              <span className="text-[10px] tracking-[0.25em] uppercase font-bold text-muted-foreground">{d.specialty}</span>
            </div>
          </div>
          <div className="hidden sm:block text-right shrink-0">
            <div className="display text-2xl text-foreground font-black">{sel.patients}</div>
            <div className="text-[8px] tracking-[0.3em] uppercase font-bold text-muted-foreground">patient{sel.patients > 1 ? "s" : ""}</div>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((k, i) => (
            <div key={i} className={`bg-white border border-border border-l-4 ${k.accent} p-4 shadow-sm`}>
              <div className={`w-8 h-8 ${k.iconBg} flex items-center justify-center mb-3`}><k.icon className={`w-4 h-4 ${k.color}`} /></div>
              <div className={`display text-2xl font-black mb-0.5 ${k.color}`}>{k.value}</div>
              <div className="text-[8px] tracking-[0.3em] uppercase font-bold text-muted-foreground">{k.label}</div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-[1fr_260px] gap-5">
          {/* Upcoming appointments */}
          <div className="bg-white border border-border shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-border bg-[#fafafa]">
              <Calendar className="w-4 h-4 text-primary" />
              <span className="display text-sm text-foreground">Prochains rendez-vous</span>
            </div>
            {selUpcoming.length === 0
              ? <div className="px-6 py-10 text-center text-sm text-muted-foreground font-light">Aucun rendez-vous à venir</div>
              : <div className="divide-y divide-border">
                {selUpcoming.map(b => (
                  <div key={b.id} className="flex items-center gap-3 px-5 py-3 hover:bg-[#fafafa] transition-colors">
                    <div className="w-9 h-9 bg-primary/8 flex flex-col items-center justify-center shrink-0">
                      <span className="display text-xs text-primary font-black leading-none">{new Date(b.date).getDate()}</span>
                      <span className="text-[7px] uppercase text-primary/60 font-bold">{new Date(b.date).toLocaleDateString("fr-FR", { month: "short" })}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="display text-sm text-foreground truncate">{b.name}</div>
                      <div className="text-[9px] text-muted-foreground truncate">{b.service}{b.value > 0 ? ` · ${b.value.toLocaleString("fr")} MAD` : ""}</div>
                    </div>
                    <StatusBadge status={b.status} />
                  </div>
                ))}
              </div>
            }
          </div>

          {/* Pipeline breakdown */}
          <div className="bg-white border border-border shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <Kanban className="w-3.5 h-3.5 text-primary" />
              <span className="text-[9px] tracking-[0.4em] uppercase font-bold text-muted-foreground">Pipeline</span>
            </div>
            <div className="space-y-3">
              {pipelineCols.map(p => (
                <div key={p.label} className="flex items-center gap-3">
                  <div className="text-[9px] tracking-[0.1em] uppercase font-bold text-muted-foreground w-16 shrink-0">{p.label}</div>
                  <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${(p.count / maxCol) * 100}%` }}
                      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }} className={`h-full ${STATUS_CFG[p.label].dot}`} />
                  </div>
                  <div className="display text-sm text-foreground w-4 text-right shrink-0">{p.count}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Full patient/lead list */}
        <div className="bg-white border border-border shadow-sm overflow-hidden overflow-x-auto">
          <div className="px-5 py-4 border-b border-border bg-[#fafafa] flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            <span className="display text-sm text-foreground">Tous les dossiers · {selBookings.length}</span>
          </div>
          <table className="w-full min-w-[560px]">
            <thead>
              <tr className="border-b border-border bg-white">
                {["Patient","Service","Date","Valeur","Statut"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[8px] tracking-[0.4em] uppercase font-bold text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {selBookings.length === 0
                ? <tr><td colSpan={5} className="px-4 py-10 text-center text-sm text-muted-foreground font-light">Aucun dossier assigné</td></tr>
                : selBookings.map(b => (
                  <tr key={b.id} className="hover:bg-[#fafafa] transition-colors">
                    <td className="px-4 py-3"><div className="display text-sm text-foreground">{b.name}</div><div className="text-[9px] text-muted-foreground">{b.email}</div></td>
                    <td className="px-4 py-3 text-sm font-light text-foreground/70 max-w-[150px] truncate">{b.service}</td>
                    <td className="px-4 py-3 text-[10px] font-bold text-muted-foreground">{b.date}</td>
                    <td className="px-4 py-3"><span className="display text-sm text-foreground font-black">{b.value > 0 ? `${b.value.toLocaleString("fr")} MAD` : <span className="text-muted-foreground/30 font-light">—</span>}</span></td>
                    <td className="px-4 py-3"><StatusBadge status={b.status} /></td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
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
  const [session, setSession]     = useState<Session | null>(null);
  const [tab, setTab]             = useState<Tab>("overview");
  const [bookings, setBookings]   = useState<Booking[]>([]);
  const [messages, setMessages]   = useState<Message[]>([]);
  const [loading, setLoading]     = useState(false);
  const [showNewLead, setShowNewLead] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ── Initial fetch ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!session) return;
    setLoading(true);
    Promise.all([fetchBookings(), fetchMessages()])
      .then(([bks, msgs]) => { setBookings(bks); setMessages(msgs); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [session]);

  // ── Realtime subscriptions ─────────────────────────────────────────────────
  useEffect(() => {
    if (!session) return;
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
  }, [session]);

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

  if (!session) return <LoginGate onLogin={(s) => { setSession(s); setTab(s.role === "dentist" ? "dentists" : "overview"); }} />;
  if (loading)  return <LoadingScreen />;

  // Role scoping: a dentist only ever sees their own bookings; admin sees all.
  const isDentist       = session.role === "dentist";
  const visibleBookings = isDentist ? bookings.filter(b => b.dentist === session.dentist) : bookings;
  const visibleMessages = isDentist ? [] : messages;
  const unread          = isDentist ? 0 : messages.filter(m => !m.read).length;

  const TAB_LABELS: Record<Tab, string> = {
    overview: "Vue d'ensemble", calendar: "Calendrier",
    pipeline: "Pipeline", bookings: "Rendez-vous", messages: "Messages", patients: "Patients", dentists: "Praticiens",
  };

  return (
    <div className="flex min-h-screen bg-[#f4f5f7]">

      {/* Desktop sidebar */}
      <div className="hidden lg:flex w-[240px] shrink-0 h-screen sticky top-0">
        <Sidebar tab={tab} setTab={setTab} unread={unread} session={session}
          onLogout={() => { setSession(null); setBookings([]); setMessages([]); }}
          onNewLead={() => setShowNewLead(true)} />
      </div>

      {/* Mobile sidebar drawer */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 z-40 bg-ink/70 backdrop-blur-sm lg:hidden" />
            <motion.div initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-y-0 left-0 z-50 w-[240px] lg:hidden">
              <Sidebar tab={tab} setTab={setTab} unread={unread} session={session}
                onLogout={() => { setSession(null); setBookings([]); setMessages([]); setSidebarOpen(false); }}
                onNewLead={() => { setShowNewLead(true); setSidebarOpen(false); }}
                onClose={() => setSidebarOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 min-w-0 flex flex-col">
        {/* ── Top header bar ───────────────────────────────────────── */}
        <header className="sticky top-0 z-30 bg-white border-b border-border flex items-center gap-4 px-4 md:px-8 h-16 shrink-0 shadow-sm">
          <button onClick={() => setSidebarOpen(true)}
            className="lg:hidden w-9 h-9 border border-border flex items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors shrink-0">
            <Menu className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 text-[8px] tracking-[0.4em] uppercase font-bold border ${SECTION_OF[tab] === "dashboard" ? "bg-foreground/5 border-border text-muted-foreground" : "bg-primary/8 border-primary/25 text-primary"}`}>
              {SECTION_OF[tab] === "dashboard" ? "Dashboard" : "CRM"}
            </div>
            <h1 className="display text-lg text-foreground font-black truncate">{isDentist && tab === "dentists" ? "Mon espace" : TAB_LABELS[tab]}</h1>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="hidden md:block text-[9px] tracking-[0.3em] uppercase font-bold text-muted-foreground/50">
              {new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
            </span>
            <div className="w-px h-5 bg-border hidden md:block" />
            <button
              onClick={() => { setLoading(true); Promise.all([fetchBookings(), fetchMessages()]).then(([b, m]) => { setBookings(b); setMessages(m); }).catch(console.error).finally(() => setLoading(false)); }}
              className="w-9 h-9 border border-border flex items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors" title="Rafraîchir">
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
            {unread > 0 && (
              <button onClick={() => setTab("messages")}
                className="relative w-9 h-9 border border-border flex items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors">
                <Bell className="w-3.5 h-3.5" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-white text-[8px] font-black flex items-center justify-center rounded-full">{unread}</span>
              </button>
            )}
            {!isDentist && (
              <button onClick={() => setShowNewLead(true)}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-[9px] tracking-[0.3em] uppercase font-bold hover:bg-[hsl(var(--teal-deep))] transition-colors">
                <UserPlus className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Nouveau patient</span>
              </button>
            )}
          </div>
        </header>

        {/* ── Page content ─────────────────────────────────────────── */}
        <main className="flex-1 p-4 md:p-8 overflow-auto">
          <AnimatePresence mode="wait">
            <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.22 }}>
              {tab === "overview"  && <Overview  bookings={visibleBookings} messages={visibleMessages} setTab={setTab} />}
              {tab === "pipeline"  && <Pipeline  bookings={visibleBookings} callbacks={crmCallbacks} />}
              {tab === "bookings"  && <Bookings  bookings={visibleBookings} callbacks={crmCallbacks} />}
              {tab === "messages"  && <Messages  messages={visibleMessages} bookings={visibleBookings} onMarkRead={handleMarkRead} onMarkAllRead={handleMarkAllRead} onDeleteMessage={handleDeleteMessage} onAddBooking={handleAddBooking} />}
              {tab === "patients"  && <Patients  bookings={visibleBookings} />}
              {tab === "calendar"  && <CalendarTab bookings={visibleBookings} />}
              {tab === "dentists"  && <DentistsTab bookings={visibleBookings} lockedDentist={isDentist ? session.dentist : undefined} />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <AnimatePresence>
        {showNewLead && <NewLeadModal onAdd={handleAddBooking} onClose={() => setShowNewLead(false)} />}
      </AnimatePresence>
    </div>
  );
}
