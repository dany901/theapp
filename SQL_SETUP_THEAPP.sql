-- 1. PROFILES TABLE
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique,
  full_name text,
  avatar_url text,
  theapp_id text unique, -- E.g. 00A1, 00A2
  followers_count int default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. POSTS TABLE
create table posts (
  id uuid default gen_random_uuid() primary key,
  author_id uuid references profiles(id) on delete cascade not null,
  content text,
  media_type text check (media_type in ('portrait', 'landscape', 'video', 'link', 'none')),
  media_url text,
  video_thumb text,
  link_title text,
  link_url text,
  category text default 'All',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. LIKES TABLE (Relational toggle)
create table likes (
  id uuid default gen_random_uuid() primary key,
  post_id uuid references posts(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(post_id, user_id)
);

-- 4. COMMENTS TABLE
create table comments (
  id uuid default gen_random_uuid() primary key,
  post_id uuid references posts(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. TRIGGER FOR NEW PROFILES
-- Generates a profile automatically when a user signs up via Auth
create or replace function public.handle_new_user()
returns trigger as $$
declare
  new_theapp_id text;
  user_count int;
begin
  select count(*) into user_count from public.profiles;
  new_theapp_id := '00A' || (user_count + 1)::text; -- Simple ID generation logic
  
  insert into public.profiles (id, full_name, avatar_url, theapp_id, username)
  values (
    new.id, 
    new.raw_user_meta_data->>'full_name', 
    new.raw_user_meta_data->>'avatar_url',
    new_theapp_id,
    lower(split_part(new.email, '@', 1)) || (user_count + 1)::text
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 6. SEED MOCK DATA (Optional, user can also post manually)
-- Insert a system profile first if testing
