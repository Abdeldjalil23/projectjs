-- MedSuite: medicine stock of the centre.
--
-- * medicines lists the products with their stock on hand, alert threshold and nearest expiry.
-- * medicine_movements records every receipt, dispensing, inventory adjustment and disposal.
--   The stock on hand is kept by the server from these movements only, and can never go below
--   zero. Movements are never changed or deleted: a mistake is corrected by an adjustment.
-- * Movements name no patient (a prescription number can be written as reference), so the stock
--   can be managed without access to medical records.
-- Reading needs medicines.read and writing medicines.write. Every change is audited.

create table public.medicines (
  id                     uuid primary key default gen_random_uuid(),
  name                   text not null check (length(trim(name)) between 1 and 200),
  generic_name           text check (length(generic_name) <= 200),
  form                   text check (form in ('tablet', 'capsule', 'syrup', 'injection', 'infusion', 'cream', 'drops',
                                              'inhaler', 'suppository', 'sachet', 'dressing', 'other')),
  strength               text check (length(strength) <= 50),
  category               text check (length(category) <= 100),
  unit                   text not null default 'box' check (unit in ('box', 'tablet', 'vial', 'ampoule', 'bottle',
                                                                    'tube', 'sachet', 'unit')),
  quantity               integer not null default 0 check (quantity >= 0),
  threshold              integer not null default 0 check (threshold between 0 and 1000000),
  expiry_date            date,
  location               text check (length(location) <= 100),
  prescription_required  boolean not null default false,
  active                 boolean not null default true,
  notes                  text check (length(notes) <= 1000),
  created_at             timestamptz not null default now(),
  created_by             uuid default auth.uid(),
  updated_at             timestamptz not null default now(),
  updated_by             uuid default auth.uid()
);

-- The same product (name, strength and form) is listed once.
create unique index medicines_product_key
  on public.medicines (lower(trim(name)), lower(coalesce(trim(strength), '')), coalesce(form, ''));
create index medicines_expiry_idx on public.medicines (expiry_date) where active;

create table public.medicine_movements (
  id             uuid primary key default gen_random_uuid(),
  medicine_id    uuid not null references public.medicines(id) on delete restrict,
  kind           text not null check (kind in ('in', 'out', 'adjust', 'discard')),
  -- Positive for a receipt, a dispensing or a disposal; an adjustment can be negative.
  quantity       integer not null check (quantity <> 0 and quantity between -1000000 and 1000000),
  movement_date  date not null default current_date check (movement_date <= current_date + 1),
  lot_number     text check (length(lot_number) <= 60),
  expiry_date    date,
  -- Supplier, delivery note, prescription number…
  reference      text check (length(reference) <= 120),
  notes          text check (length(notes) <= 500),
  balance_after  integer,
  author_name    text default public.current_staff_name() check (length(author_name) <= 200),
  created_at     timestamptz not null default now(),
  created_by     uuid default auth.uid(),
  check (kind = 'adjust' or quantity > 0)
);

create index medicine_movements_medicine_idx on public.medicine_movements (medicine_id, created_at desc);

-- Applies a movement to the stock on hand, refusing to go below zero, and keeps the nearest
-- expiry date of the stock when a receipt brings one.
create function public.apply_medicine_movement()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_delta   integer := case new.kind when 'in' then new.quantity
                                     when 'adjust' then new.quantity
                                     else -new.quantity end;
  v_stock   integer;
  v_balance integer;
begin
  select quantity into v_stock from public.medicines where id = new.medicine_id for update;
  if not found then
    raise exception 'Medicine not found' using errcode = 'P0002';
  end if;
  if v_stock + v_delta < 0 then
    raise exception 'Not enough stock: % available', v_stock using errcode = '23514';
  end if;

  update public.medicines m
     set quantity = m.quantity + v_delta,
         expiry_date = case
           when new.kind <> 'in' or new.expiry_date is null then m.expiry_date
           when m.expiry_date is null or m.expiry_date < current_date or m.quantity = 0 then new.expiry_date
           else least(m.expiry_date, new.expiry_date)
         end
   where m.id = new.medicine_id
  returning m.quantity into v_balance;

  new.balance_after := v_balance;
  return new;
end;
$$;

create trigger medicine_movements_apply before insert on public.medicine_movements
  for each row execute function public.apply_medicine_movement();

create trigger medicines_touch before update on public.medicines
  for each row execute function public.touch_row();

create trigger audit_medicines after insert or update or delete on public.medicines
  for each row execute function public.audit_row_change();
create trigger audit_medicine_movements after insert or update or delete on public.medicine_movements
  for each row execute function public.audit_row_change();

-- Row Level Security.
alter table public.medicines enable row level security;
alter table public.medicine_movements enable row level security;

create policy medicines_read on public.medicines
  for select to authenticated using (public.has_permission('medicines.read'));
create policy medicines_insert on public.medicines
  for insert to authenticated with check (public.has_permission('medicines.write'));
create policy medicines_update on public.medicines
  for update to authenticated
  using (public.has_permission('medicines.write'))
  with check (public.has_permission('medicines.write'));

create policy medicine_movements_read on public.medicine_movements
  for select to authenticated using (public.has_permission('medicines.read'));
create policy medicine_movements_insert on public.medicine_movements
  for insert to authenticated with check (public.has_permission('medicines.write'));

-- API privileges: the stock on hand is written only by the movements; medicines are deactivated,
-- not deleted; movements are only added.
revoke all on public.medicines, public.medicine_movements from anon, authenticated;
grant select on public.medicines to authenticated;
grant insert (name, generic_name, form, strength, category, unit, threshold, expiry_date, location,
              prescription_required, active, notes)
  on public.medicines to authenticated;
grant update (name, generic_name, form, strength, category, unit, threshold, expiry_date, location,
              prescription_required, active, notes)
  on public.medicines to authenticated;
grant select on public.medicine_movements to authenticated;
grant insert (medicine_id, kind, quantity, movement_date, lot_number, expiry_date, reference, notes)
  on public.medicine_movements to authenticated;
revoke execute on function public.apply_medicine_movement() from public, anon, authenticated;
