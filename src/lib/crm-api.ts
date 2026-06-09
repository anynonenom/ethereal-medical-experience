import { supabase } from "./supabase";

// ─── TYPES (mirrored from AdminDashboard) ─────────────────────────────────────
export type BookingStatus = "Nouveau" | "Confirmé" | "En cours" | "Terminé" | "Annulé";
export type LogType = "call" | "email" | "whatsapp" | "note";
export type LeadSource = "Site web" | "WhatsApp" | "Instagram" | "Google" | "Facebook" | "Référence" | "Autre";

export interface ContactEntry {
  id: string; ts: string; type: LogType; content: string;
}
export interface HistoryEntry {
  ts: string; action: string; from?: BookingStatus; to?: BookingStatus;
}
export interface Booking {
  id: string; name: string; email: string; phone: string;
  service: string; origin: string; date: string;
  dentist: string;
  status: BookingStatus; notes: string;
  tags: string[];
  followUp?: string;
  source: LeadSource;
  value: number;
  companyId?: string;          // linked B2B partner company (convention pricing)
  contactLog: ContactEntry[];
  history: HistoryEntry[];
}
export interface Message {
  id: string; name: string; email: string; phone: string;
  subject: string; body: string; date: string; read: boolean;
}

export type CompanyStatus = "Active" | "Inactive";
export interface Company {
  id: string; name: string; contactName: string;
  email: string; phone: string; sector: string;
  discount: number;            // convention discount, in %
  status: CompanyStatus;
  notes: string;
  signedAt?: string;
}

// ─── TRANSFORMS ───────────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToBooking(row: any): Booking {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    service: row.service,
    origin: row.origin ?? "",
    date: row.date,
    dentist: row.dentist ?? "",
    status: row.status as BookingStatus,
    notes: row.notes ?? "",
    tags: row.tags ?? [],
    followUp: row.follow_up ?? undefined,
    source: (row.source ?? "Site web") as LeadSource,
    value: row.value ?? 0,
    companyId: row.company_id ?? undefined,
    contactLog: ((row.contact_log ?? []) as any[])
      .map((e) => ({ id: e.id, ts: e.ts, type: e.type as LogType, content: e.content }))
      .sort((a, b) => b.ts.localeCompare(a.ts)),
    history: ((row.booking_history ?? []) as any[])
      .map((h) => ({
        ts: h.ts,
        action: h.action,
        from: h.from_status ?? undefined,
        to: h.to_status ?? undefined,
      }))
      .sort((a, b) => a.ts.localeCompare(b.ts)),
  };
}

// ─── BOOKINGS ─────────────────────────────────────────────────────────────────
export async function fetchBookings(): Promise<Booking[]> {
  const { data, error } = await supabase
    .from("bookings")
    .select("*, contact_log(*), booking_history(*)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(rowToBooking);
}

export async function createBooking(b: Booking): Promise<void> {
  const { error } = await supabase.from("bookings").insert({
    id: b.id,
    name: b.name,
    email: b.email,
    phone: b.phone,
    service: b.service,
    origin: b.origin,
    date: b.date,
    dentist: b.dentist,
    status: b.status,
    notes: b.notes,
    tags: b.tags,
    follow_up: b.followUp ?? null,
    source: b.source,
    value: b.value,
    company_id: b.companyId ?? null,
  });
  if (error) throw error;

  if (b.history.length > 0) {
    await supabase.from("booking_history").insert(
      b.history.map((h) => ({
        booking_id: b.id,
        ts: h.ts,
        action: h.action,
        from_status: h.from ?? null,
        to_status: h.to ?? null,
      }))
    );
  }
}

export async function updateBookingFields(b: Booking): Promise<void> {
  const { error } = await supabase
    .from("bookings")
    .update({
      notes: b.notes,
      tags: b.tags,
      follow_up: b.followUp ?? null,
      source: b.source,
      value: b.value,
      dentist: b.dentist,
      company_id: b.companyId ?? null,
    })
    .eq("id", b.id);
  if (error) throw error;
}

export async function changeBookingStatus(
  id: string,
  from: BookingStatus,
  to: BookingStatus
): Promise<void> {
  const ts = new Date().toISOString();
  const { error: uErr } = await supabase
    .from("bookings")
    .update({ status: to })
    .eq("id", id);
  if (uErr) throw uErr;

  const { error: hErr } = await supabase.from("booking_history").insert({
    booking_id: id,
    ts,
    action: "Statut modifié",
    from_status: from,
    to_status: to,
  });
  if (hErr) throw hErr;
}

export async function deleteBooking(id: string): Promise<void> {
  const { error } = await supabase.from("bookings").delete().eq("id", id);
  if (error) throw error;
}

export async function addContactLog(
  bookingId: string,
  entry: ContactEntry
): Promise<void> {
  const { error } = await supabase.from("contact_log").insert({
    id: entry.id,
    booking_id: bookingId,
    ts: entry.ts,
    type: entry.type,
    content: entry.content,
  });
  if (error) throw error;
}

// ─── MESSAGES ─────────────────────────────────────────────────────────────────
export async function fetchMessages(): Promise<Message[]> {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    subject: row.subject,
    body: row.body,
    date: row.date,
    read: row.read,
  }));
}

export async function markMessageRead(id: string): Promise<void> {
  const { error } = await supabase
    .from("messages")
    .update({ read: true })
    .eq("id", id);
  if (error) throw error;
}

export async function markAllMessagesRead(): Promise<void> {
  const { error } = await supabase
    .from("messages")
    .update({ read: true })
    .eq("read", false);
  if (error) throw error;
}

export async function deleteMessage(id: string): Promise<void> {
  const { error } = await supabase.from("messages").delete().eq("id", id);
  if (error) throw error;
}

// ─── COMPANIES (B2B / conventions) ────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToCompany(row: any): Company {
  return {
    id: row.id,
    name: row.name,
    contactName: row.contact_name ?? "",
    email: row.email ?? "",
    phone: row.phone ?? "",
    sector: row.sector ?? "",
    discount: row.discount ?? 0,
    status: (row.status ?? "Active") as CompanyStatus,
    notes: row.notes ?? "",
    signedAt: row.signed_at ?? undefined,
  };
}

export async function fetchCompanies(): Promise<Company[]> {
  const { data, error } = await supabase
    .from("companies")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(rowToCompany);
}

function companyToRow(c: Company) {
  return {
    id: c.id,
    name: c.name,
    contact_name: c.contactName,
    email: c.email,
    phone: c.phone,
    sector: c.sector,
    discount: c.discount,
    status: c.status,
    notes: c.notes,
    signed_at: c.signedAt ?? null,
  };
}

export async function createCompany(c: Company): Promise<void> {
  const { error } = await supabase.from("companies").insert(companyToRow(c));
  if (error) throw error;
}

export async function updateCompany(c: Company): Promise<void> {
  const { id, ...rest } = companyToRow(c);
  const { error } = await supabase.from("companies").update(rest).eq("id", id);
  if (error) throw error;
}

export async function deleteCompany(id: string): Promise<void> {
  const { error } = await supabase.from("companies").delete().eq("id", id);
  if (error) throw error;
}
