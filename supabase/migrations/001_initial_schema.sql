-- Profiles (extends Supabase auth.users)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  balance numeric(12,2) not null default 10000.00,
  total_trades integer not null default 0,
  winning_trades integer not null default 0,
  total_pnl numeric(12,2) not null default 0.00,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Individual trades
create table public.trades (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  asset text not null,
  asset_type text not null,
  timeframe text not null,
  direction text not null,
  leverage integer not null default 1,
  entry_price numeric(16,8) not null,
  exit_price numeric(16,8) not null,
  bet_amount numeric(12,2) not null,
  pnl numeric(12,2) not null,
  is_daily_challenge boolean not null default false,
  daily_challenge_date date,
  created_at timestamptz not null default now()
);

-- Daily challenges
create table public.daily_challenges (
  id uuid primary key default gen_random_uuid(),
  challenge_date date not null unique,
  charts jsonb not null,
  created_at timestamptz not null default now()
);

-- Daily results
create table public.daily_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  challenge_date date not null,
  total_pnl numeric(12,2) not null,
  trades_won integer not null,
  trades_total integer not null default 10,
  completed_at timestamptz not null default now(),
  unique(user_id, challenge_date)
);

-- Indexes
create index idx_trades_user_id on public.trades(user_id);
create index idx_trades_created_at on public.trades(created_at desc);
create index idx_trades_daily on public.trades(is_daily_challenge, daily_challenge_date);
create index idx_daily_results_date on public.daily_results(challenge_date);
create index idx_daily_results_pnl on public.daily_results(total_pnl desc);

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.trades enable row level security;
alter table public.daily_challenges enable row level security;
alter table public.daily_results enable row level security;

-- Profiles: everyone can read (leaderboard), only owner can update
create policy "Profiles are viewable by everyone"
  on public.profiles for select using (true);
create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

-- Trades: owner can read and insert
create policy "Users can view own trades"
  on public.trades for select using (auth.uid() = user_id);
create policy "Users can insert own trades"
  on public.trades for insert with check (auth.uid() = user_id);

-- Daily challenges: readable by all
create policy "Daily challenges viewable by all"
  on public.daily_challenges for select using (true);

-- Daily results: readable by all (leaderboard), insertable by owner
create policy "Daily results viewable by all"
  on public.daily_results for select using (true);
create policy "Users can insert own daily results"
  on public.daily_results for insert with check (auth.uid() = user_id);

-- Trigger: auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'Trader'),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
