-- ═══════════════════════════════════════════════════════════════════
-- Medical Bay CRM — Supabase schema
-- Run this in: Supabase Dashboard → SQL Editor → New query
-- ═══════════════════════════════════════════════════════════════════

-- ─── TABLES ──────────────────────────────────────────────────────────────────

create table if not exists bookings (
  id          text primary key,
  name        text not null,
  email       text not null,
  phone       text not null default '',
  service     text not null default 'Consultation générale',
  origin      text not null default '',
  date        date not null default current_date,
  dentist     text not null default '',
  status      text not null default 'Nouveau'
                check (status in ('Nouveau','Confirmé','En cours','Terminé','Annulé')),
  notes       text not null default '',
  tags        text[] not null default '{}',
  follow_up   date,
  source      text not null default 'Site web'
                check (source in ('Site web','WhatsApp','Instagram','Google','Facebook','Référence','Autre')),
  value       integer not null default 0,
  created_at  timestamptz not null default now()
);

create table if not exists messages (
  id          text primary key,
  name        text not null,
  email       text not null,
  phone       text not null default '',
  subject     text not null,
  body        text not null,
  date        date not null default current_date,
  read        boolean not null default false,
  created_at  timestamptz not null default now()
);

-- B2B partner companies (conventions). Each booking may be linked to one company
-- via bookings.company_id; the convention discount is applied to that booking's value.
create table if not exists companies (
  id            text primary key,
  name          text not null,
  contact_name  text not null default '',
  email         text not null default '',
  phone         text not null default '',
  sector        text not null default '',
  discount      integer not null default 0,          -- convention discount, in %
  status        text not null default 'Active'
                  check (status in ('Active','Inactive')),
  notes         text not null default '',
  signed_at     date,
  created_at    timestamptz not null default now()
);

-- Practitioners (praticiens). Each booking is assigned to one practitioner by name
-- once it is confirmed. Managed from the CRM ("Nouveau praticien").
create table if not exists practitioners (
  id          text primary key,
  name        text not null,
  short       text not null default '',
  specialty   text not null default '',
  login_code  text not null default '',
  color       text not null default 'primary',
  created_at  timestamptz not null default now()
);

create table if not exists contact_log (
  id          text primary key default gen_random_uuid()::text,
  booking_id  text not null references bookings(id) on delete cascade,
  ts          timestamptz not null default now(),
  type        text not null check (type in ('call','email','whatsapp','note')),
  content     text not null
);

create table if not exists booking_history (
  id          bigserial primary key,
  booking_id  text not null references bookings(id) on delete cascade,
  ts          timestamptz not null default now(),
  action      text not null,
  from_status text,
  to_status   text
);

-- ─── MIGRATION (for databases created before the dentist / new sources update) ──
-- Safe to run repeatedly. Adds the dentist column and widens the source list.
alter table bookings add column if not exists dentist text not null default '';
alter table bookings drop constraint if exists bookings_source_check;
alter table bookings add constraint bookings_source_check
  check (source in ('Site web','WhatsApp','Instagram','Google','Facebook','Référence','Autre'));

-- Links a booking to a B2B partner company (null = direct / no convention).
-- Declared here (not inline above) so the companies table already exists.
alter table bookings add column if not exists company_id text
  references companies(id) on delete set null;

-- ─── INDEXES ─────────────────────────────────────────────────────────────────
create index if not exists idx_bookings_status   on bookings(status);
create index if not exists idx_bookings_email    on bookings(email);
create index if not exists idx_bookings_date     on bookings(date);
create index if not exists idx_contact_log_bid   on contact_log(booking_id);
create index if not exists idx_history_bid       on booking_history(booking_id);
create index if not exists idx_messages_read     on messages(read);
create index if not exists idx_bookings_company  on bookings(company_id);
create index if not exists idx_companies_status  on companies(status);

-- ─── DISABLE RLS (admin-only app) ────────────────────────────────────────────
alter table bookings        disable row level security;
alter table messages        disable row level security;
alter table contact_log     disable row level security;
alter table booking_history disable row level security;
alter table companies       disable row level security;
alter table practitioners   disable row level security;

-- ─── REALTIME ────────────────────────────────────────────────────────────────
-- Required so Supabase broadcasts live changes to the client
alter table bookings        replica identity full;
alter table messages        replica identity full;
alter table contact_log     replica identity full;
alter table booking_history replica identity full;
alter table companies       replica identity full;
alter table practitioners   replica identity full;

-- ─── SEED DATA ───────────────────────────────────────────────────────────────

insert into practitioners (id, name, short, specialty, login_code, color) values
  ('PR-001','Dr. Salma El Fassi','Dr. El Fassi','Dentisterie esthétique',  'salma2026',  'primary'),
  ('PR-002','Dr. Youssef Benali','Dr. Benali',  'Implantologie & chirurgie','youssef2026','blue'),
  ('PR-003','Dr. Leïla Amrani',  'Dr. Amrani',  'Couronnes & prothèses',   'leila2026',  'purple'),
  ('PR-004','Dr. Karim Tahiri',  'Dr. Tahiri',  'Général & blanchiment',   'karim2026',  'amber')
on conflict (id) do nothing;

insert into bookings (id, name, email, phone, service, origin, date, dentist, status, notes, tags, follow_up, source, value) values
  ('MB-001','Sophie Martin',   'sophie.martin@gmail.com', '+33 6 12 34 56 78', 'Smile Design complet',      'Paris, France',       '2026-05-10', 'Dr. Salma El Fassi', 'Nouveau',  'Intéressée par les facettes E-max.',          array['VIP','Prioritaire'], '2026-05-08', 'Instagram', 4500),
  ('MB-002','Thomas Bertrand', 'thomas.b@outlook.com',    '+32 475 12 34 56',  'Implantologie',             'Bruxelles, Belgique', '2026-05-08', 'Dr. Youssef Benali', 'Confirmé', '',                                            array[]::text[],           null,          'Site web',  3000),
  ('MB-003','Maria Costas',    'm.costas@hotmail.com',    '+41 76 234 56 78',  'Facettes porcelaine E-max', 'Genève, Suisse',      '2026-05-15', 'Dr. Salma El Fassi', 'En cours', 'Arrivée le 15 mai. Hôtel Sofia réservé.',   array['VIP'],              '2026-05-16', 'Référence', 2800),
  ('MB-004','Pierre Lambert',  'pierre.lambert@gmail.com','+33 6 87 65 43 21', 'Couronnes Zircone',         'Lyon, France',        '2026-04-28', 'Dr. Leïla Amrani',   'Terminé',  '',                                            array[]::text[],           null,          'Google',    1800),
  ('MB-005','Amina Khalil',    'amina.k@protonmail.com',  '+1 514 234 5678',   'Séjour médical tout inclus','Montréal, Canada',    '2026-05-20', 'Dr. Salma El Fassi', 'Nouveau',  '',                                            array['Budget limité'],    '2026-05-07', 'WhatsApp',  5200),
  ('MB-006','Nadia Fontaine',  'nadia.f@gmail.com',       '+33 7 12 34 56 78', 'Blanchiment laser',         'Nice, France',        '2026-05-18', 'Dr. Karim Tahiri',   'Confirmé', '',                                            array[]::text[],           null,          'Facebook',  350),
  ('MB-007','Marc Dumont',     'marc.d@yahoo.fr',         '+33 6 55 44 33 22', 'Implantologie',             'Toulouse, France',    '2026-05-22', 'Dr. Youssef Benali', 'Nouveau',  '',                                            array['Urgent'],           '2026-05-07', 'Site web',  3000),
  ('MB-008','Isabelle Renard', 'i.renard@gmail.com',      '+32 487 12 34 56',  'Smile Design complet',      'Liège, Belgique',     '2026-04-20', 'Dr. Salma El Fassi', 'Annulé',   'Annulé pour raisons personnelles.',           array[]::text[],           null,          'Référence', 4500)
on conflict (id) do nothing;

insert into booking_history (booking_id, ts, action, from_status, to_status) values
  ('MB-001','2026-05-06T09:12:00Z','Demande reçue',                   null,        null),
  ('MB-002','2026-05-03T14:30:00Z','Demande reçue',                   null,        null),
  ('MB-002','2026-05-04T10:00:00Z','Statut modifié',                  'Nouveau',   'Confirmé'),
  ('MB-003','2026-05-01T08:00:00Z','Demande reçue',                   null,        null),
  ('MB-003','2026-05-02T11:00:00Z','Statut modifié',                  'Nouveau',   'Confirmé'),
  ('MB-003','2026-05-14T16:00:00Z','Statut modifié',                  'Confirmé',  'En cours'),
  ('MB-004','2026-04-10T09:00:00Z','Demande reçue',                   null,        null),
  ('MB-004','2026-04-28T18:00:00Z','Statut modifié',                  'En cours',  'Terminé'),
  ('MB-005','2026-05-05T20:15:00Z','Demande reçue',                   null,        null),
  ('MB-006','2026-05-04T13:00:00Z','Demande reçue',                   null,        null),
  ('MB-006','2026-05-05T09:30:00Z','Statut modifié',                  'Nouveau',   'Confirmé'),
  ('MB-007','2026-05-06T16:45:00Z','Demande reçue',                   null,        null),
  ('MB-008','2026-04-08T10:00:00Z','Demande reçue',                   null,        null),
  ('MB-008','2026-04-15T14:00:00Z','Statut modifié',                  'Confirmé',  'Annulé')
on conflict do nothing;

insert into contact_log (id, booking_id, ts, type, content) values
  ('cl-001','MB-001','2026-05-06T10:00:00Z','whatsapp','Premier contact — envoi du catalogue soins.'),
  ('cl-002','MB-002','2026-05-04T11:00:00Z','call',    'Appel de confirmation — vol le 7 mai.'),
  ('cl-003','MB-003','2026-05-14T16:00:00Z','note',    'Transfer aéroport confirmé 15h00.'),
  ('cl-004','MB-004','2026-04-28T18:00:00Z','email',   'Envoi facture et résumé du séjour.')
on conflict (id) do nothing;

insert into companies (id, name, contact_name, email, phone, sector, discount, status, notes, signed_at) values
  ('CMP-001','Royal Air Maroc',      'Hicham Berrada',  'rh@royalairmaroc.com',  '+212 522 91 20 00','Aérien / Transport',   20,'Active',  'Convention soins dentaires pour le personnel navigant et leurs familles.', '2026-01-15'),
  ('CMP-002','OCP Group',            'Salima Bennani',  'sante@ocpgroup.ma',     '+212 522 23 20 25','Industrie / Mines',    15,'Active',  'Accord cadre — prise en charge partielle des soins esthétiques.',          '2026-02-03'),
  ('CMP-003','Maroc Telecom',        'Younes El Idrissi','conventions@iam.ma',   '+212 537 71 90 00','Télécommunications',   12,'Active',  'Tarifs préférentiels pour les cadres.',                                    '2026-03-10'),
  ('CMP-004','Marsa Maroc',          'Latifa Ouazzani', 'rh@marsamaroc.co.ma',   '+212 522 23 23 24','Portuaire / Logistique',10,'Inactive','Convention en cours de renouvellement.',                                  '2025-11-20')
on conflict (id) do nothing;

-- Link a few existing bookings to partner companies (convention pricing applies).
update bookings set company_id = 'CMP-001' where id = 'MB-002';
update bookings set company_id = 'CMP-002' where id = 'MB-007';

insert into messages (id, name, email, phone, subject, body, date, read) values
  ('MSG-001','Julien Marchand','julien.m@gmail.com',    '+33 6 11 22 33 44','Devis Smile Design','Bonjour, je souhaiterais un devis pour un Smile Design complet avec facettes et blanchiment. Mon budget est environ 4 000 €. Pouvez-vous me recontacter ?','2026-05-06',false),
  ('MSG-002','Laure Petit',    'laure.petit@yahoo.fr',  '+33 6 98 76 54 32','Question implants',  'Mon dentiste en France m''a proposé des implants à 6 000 €. Quels sont vos tarifs pour la même procédure incluant le séjour ?',                    '2026-05-05',false),
  ('MSG-003','Karim Benali',   'k.benali@gmail.com',    '+33 7 45 67 89 01','Séjour tout inclus', 'Je suis intéressé par votre offre tout inclus. Pourriez-vous m''envoyer le programme et les dates disponibles pour juin ?',                        '2026-05-04',true),
  ('MSG-004','Sandrine Leroux','sandrine.l@outlook.com','+32 471 23 45 67', 'Soins urgents',      'Bonjour, j''ai une dent cassée et j''ai besoin de soins urgents. Je peux me déplacer dès la semaine prochaine.',                                   '2026-05-03',true),
  ('MSG-005','Antoine Blanc',  'a.blanc@hotmail.com',   '+41 78 234 56 78', 'Couronnes zircone',  'Je cherche à remplacer 4 couronnes métalliques par des couronnes zircone. Quel serait le coût total incluant le séjour à Agadir ?',                '2026-05-02',true)
on conflict (id) do nothing;
