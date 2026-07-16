-- Run this in your Supabase SQL Editor
-- Creates the event_videos table for the Event Videos section

create table if not exists event_videos (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text,
  youtube_url text not null,
  event_date  date,
  year        integer not null default extract(year from current_date)::integer,
  is_active   boolean not null default true,
  video_order integer not null default 0,
  created_at  timestamptz not null default now()
);

-- Index for fast public queries (only active, newest first)
create index if not exists event_videos_active_year_idx
  on event_videos (is_active, year desc, video_order asc);

-- Allow public read access (the site fetches these without auth)
alter table event_videos enable row level security;

create policy "Public can read active event videos"
  on event_videos for select
  using (is_active = true);

create policy "Service role has full access to event_videos"
  on event_videos for all
  using (true)
  with check (true);
