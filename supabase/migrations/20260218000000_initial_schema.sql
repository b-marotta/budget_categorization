-- VaultTrack Initial Schema Migration
-- Creates core tables for banking integration and transaction management

-- Profiles table
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  
  full_name text,
  avatar_url text,
  
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Banks table - stores Enable Banking connections
create table banks (
  id uuid primary key default gen_random_uuid(),

  user_id uuid not null references auth.users(id) on delete cascade,

  institution_name text not null,
  institution_id text not null, -- enable banking institution id

  enable_user_id text not null, -- their user reference
  enable_session_id text,       -- connection/session id

  access_token text,            -- encrypted if possible
  refresh_token text,

  status text default 'active', -- active / revoked / expired

  last_synced_at timestamptz,
  created_at timestamptz default now()
);

-- Accounts table - bank accounts from providers
create table accounts (
  id uuid primary key default gen_random_uuid(),

  bank_id uuid not null references banks(id) on delete cascade,

  external_account_id text not null, -- enable banking id
  name text,
  iban text,
  currency text,
  current_balance numeric(14,2),

  created_at timestamptz default now()
);

create unique index unique_external_account
on accounts(bank_id, external_account_id);

-- System Categories table - global categories shared by all users
create table system_categories (
  id uuid primary key default gen_random_uuid(),

  type text not null,
  name text not null,
  color text,
  icon text,

  created_at timestamptz default now()
);

create unique index unique_system_category_name
on system_categories(type, lower(name));

-- User Categories table - custom user-defined categories
create table user_categories (
  id uuid primary key default gen_random_uuid(),

  user_id uuid not null references auth.users(id) on delete cascade,

  type text not null,
  name text not null,
  color text,
  icon text,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create unique index unique_user_category_name
on user_categories(user_id, lower(name));

-- Transactions table - financial transactions from providers
create table transactions (
  id uuid primary key default gen_random_uuid(),

  user_id uuid not null references auth.users(id) on delete cascade,
  account_id uuid not null references accounts(id) on delete cascade,

  external_id text not null,

  description text not null,
  amount numeric(14,2) not null,
  currency text,

  transaction_date date not null,

  category_id uuid, -- can reference either system or user category
  category_type text check (category_type in ('system', 'user')), -- indicates which table

  raw jsonb, -- full provider payload (important)

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create unique index unique_transaction_per_account
on transactions(account_id, external_id);

-- Enable Row Level Security
alter table profiles enable row level security;
alter table banks enable row level security;
alter table accounts enable row level security;
alter table system_categories enable row level security;
alter table user_categories enable row level security;
alter table transactions enable row level security;

-- RLS Policies for profiles
create policy "Users can view their own profile"
on profiles for all
using (auth.uid() = id)
with check (auth.uid() = id);

-- RLS Policies for banks
create policy "Users manage their own banks"
on banks for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- RLS Policies for accounts
create policy "Users manage their own accounts"
on accounts for all
using (
  exists (
    select 1 from banks
    where banks.id = accounts.bank_id
    and banks.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from banks
    where banks.id = accounts.bank_id
    and banks.user_id = auth.uid()
  )
);

-- RLS Policies for system_categories (read-only for all authenticated users)
create policy "All users can view system categories"
on system_categories for select
using (auth.role() = 'authenticated');

create policy "Only service role can modify system categories"
on system_categories for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

-- RLS Policies for user_categories
create policy "Users manage their own custom categories"
on user_categories for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- RLS Policies for transactions
create policy "Users manage their own transactions"
on transactions for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Indexes for performance
create index idx_banks_user_id on banks(user_id);
create index idx_accounts_bank_id on accounts(bank_id);
create index idx_transactions_user_id on transactions(user_id);
create index idx_transactions_account_id on transactions(account_id);
create index idx_transactions_date on transactions(transaction_date desc);
create index idx_transactions_category_id on transactions(category_id);
create index idx_transactions_category_type on transactions(category_type);
create index idx_user_categories_user_id on user_categories(user_id);

-- Trigger to auto-create profile on user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Trigger to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at
  before update on profiles
  for each row execute procedure public.handle_updated_at();

create trigger set_updated_at
  before update on user_categories
  for each row execute procedure public.handle_updated_at();

create trigger set_updated_at
  before update on transactions
  for each row execute procedure public.handle_updated_at();
