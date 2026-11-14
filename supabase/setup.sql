-- WikiFeed: Datenbank für anonyme Abstimmungen.
-- Einmal im Supabase-Projekt ausführen: Dashboard → SQL Editor → New query → alles einfügen → Run.
-- Gespeichert wird nur: wozu abgestimmt wurde, eine zufällige Geräte-Nummer und die gewählte Antwort.
-- Kein Name, keine E-Mail. Einzelne Stimmen kann niemand auslesen, nur die Summen.

create table if not exists public.votes (
  kind       text     not null check (kind in ('think', 'twist', 'classic', 'stack')),
  item       text     not null check (char_length(item) between 1 and 40),
  device     uuid     not null,
  choice     smallint not null check (choice between 0 and 9),
  updated_at timestamptz not null default now(),
  primary key (kind, item, device)
);

-- Tabelle abschließen: ohne Regeln darf von außen niemand direkt lesen oder schreiben.
alter table public.votes enable row level security;
revoke all on table public.votes from anon, authenticated;

-- Abstimmen (oder die eigene Antwort ändern) geht nur über diese Funktion.
create or replace function public.cast_vote(p_kind text, p_item text, p_device uuid, p_choice int)
returns void
language sql
security definer
set search_path = public
as $$
  insert into public.votes (kind, item, device, choice)
  values (p_kind, p_item, p_device, p_choice)
  on conflict (kind, item, device)
  do update set choice = excluded.choice, updated_at = now();
$$;

-- Summen für eine Frage: wie oft wurde welche Antwort gewählt.
create or replace function public.vote_counts(p_kind text, p_item text)
returns table (choice smallint, n bigint)
language sql
stable
security definer
set search_path = public
as $$
  select v.choice, count(*) from public.votes v
  where v.kind = p_kind and v.item = p_item
  group by v.choice;
$$;

revoke all on function public.cast_vote(text, text, uuid, int) from public;
revoke all on function public.vote_counts(text, text) from public;
grant execute on function public.cast_vote(text, text, uuid, int) to anon;
grant execute on function public.vote_counts(text, text) to anon;
