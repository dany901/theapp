-- DATABASE V2: THEAPP SOCIAL EXPANSION

-- 1. FOLLOWS SYSTEM
create table if not exists follows (
  id uuid default gen_random_uuid() primary key,
  follower_id uuid references profiles(id) on delete cascade not null,
  following_id uuid references profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(follower_id, following_id)
);

-- 2. ECONOMY SYSTEM (COINS & GIFTS)
alter table profiles add column if not exists coins int default 0;

create table if not exists coin_transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  amount int not null,
  type text check (type in ('purchase', 'gift_sent', 'gift_received', 'reward')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists gifts (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  price int not null,
  icon_url text, -- For specific gift icons
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists sent_gifts (
  id uuid default gen_random_uuid() primary key,
  sender_id uuid references profiles(id) on delete cascade not null,
  receiver_id uuid references profiles(id) on delete cascade not null,
  gift_id uuid references gifts(id) on delete cascade not null,
  post_id uuid references posts(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. REALTIME MESSAGING
create table if not exists messages (
  id uuid default gen_random_uuid() primary key,
  sender_id uuid references profiles(id) on delete cascade not null,
  receiver_id uuid references profiles(id) on delete cascade not null,
  content text,
  media_url text,
  is_temporary boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. MODERATION & SECURITY
create table if not exists blocks (
  id uuid default gen_random_uuid() primary key,
  blocker_id uuid references profiles(id) on delete cascade not null,
  blocked_id uuid references profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(blocker_id, blocked_id)
);

create table if not exists reports (
  id uuid default gen_random_uuid() primary key,
  reporter_id uuid references profiles(id) on delete cascade not null,
  target_id uuid references posts(id) on delete cascade, -- Can report post
  target_user_id uuid references profiles(id) on delete cascade, -- Or user
  reason text not null,
  status text default 'pending' check (status in ('pending', 'reviewed', 'resolved')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. VERIFICATION & ANALYTICS
alter table profiles add column if not exists is_verified boolean default false;
alter table profiles add column if not exists verification_type text default 'none' check (verification_type in ('none', 'gold', 'blue', 'business'));
alter table profiles add column if not exists level int default 1;
alter table profiles add column if not exists xp int default 0;

alter table posts add column if not exists views_count int default 0;
alter table posts add column if not exists shares_count int default 0;
alter table posts add column if not exists latitude double precision;
alter table posts add column if not exists longitude double precision;

-- Triggers for Ranking (Optional but recommended for performance)
-- We can also calculate ranking in JS using views or simple queries.

-- 6. SECURITY POLICIES (RLS)
-- MESSAGES
alter table messages enable row level security;

create policy "Users can insert their own messages" on messages
for insert with check (auth.uid() = sender_id);

create policy "Users can view their own messages" on messages
for select using (auth.uid() = sender_id or auth.uid() = receiver_id);

-- FOLLOWS
alter table follows enable row level security;

create policy "Everyone can view follows" on follows
for select using (true);

create policy "Users can follow/unfollow" on follows
for all using (auth.uid() = follower_id);

-- 7. UTILITY FUNCTIONS
-- Function to safely increment coins
create or replace function increment_coins(user_id uuid, amount int)
returns void as $$
begin
  update profiles
  set coins = coins + amount
  where id = user_id;
end;
$$ language plpgsql security definer;

-- Realtime setup
-- (Note: You must enable Realtime for 'messages' table in the Supabase Dashboard)
-- Go to Database -> Replication -> supabase_realtime -> Edit -> Check 'messages'
