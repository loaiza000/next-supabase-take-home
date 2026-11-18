create table public.coffee_health (
  id integer primary key,
  age smallint not null check (age between 0 and 120),
  gender text not null,
  country text not null,
  coffee_intake numeric(4,1) not null check (coffee_intake >= 0),
  caffeine_mg numeric(5,1) not null check (caffeine_mg >= 0),
  sleep_hours numeric(3,1) not null check (sleep_hours between 0 and 24),
  sleep_quality text not null,
  bmi numeric(4,1) not null check (bmi > 0),
  heart_rate smallint not null check (heart_rate > 0),
  stress_level text not null,
  physical_activity_hours numeric(4,1) not null check (physical_activity_hours between 0 and 168),
  health_issues text not null,
  occupation text not null,
  smoking boolean not null,
  alcohol_consumption boolean not null
);

create index coffee_health_country_id_idx on public.coffee_health (country, id);
create index coffee_health_age_id_idx on public.coffee_health (age, id);

alter table public.coffee_health enable row level security;
create policy "Public read access" on public.coffee_health for select to anon, authenticated using (true);
revoke all on public.coffee_health from public, anon, authenticated;
grant select on public.coffee_health to anon, authenticated;
