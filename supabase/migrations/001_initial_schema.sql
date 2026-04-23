-- Antigrav Productivity Dashboard — Supabase Schema
-- Run this in Supabase SQL Editor

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- Habits table
create table if not exists habits (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  category text default 'other',
  frequency text default 'daily' check (frequency in ('daily', 'weekly', 'monthly', 'yearly')),
  color text default '#6c63ff',
  icon text,
  streak integer default 0,
  created_at timestamptz default now()
);

-- Habit logs (completion records)
create table if not exists habit_logs (
  id uuid default uuid_generate_v4() primary key,
  habit_id uuid references habits(id) on delete cascade not null,
  completed_at timestamptz default now(),
  note text
);

-- Projects
create table if not exists projects (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  color text default '#6c63ff',
  icon text,
  created_at timestamptz default now()
);

-- Tasks
create table if not exists tasks (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  description text,
  priority text default 'medium' check (priority in ('high', 'medium', 'low')),
  deadline date,
  project_id uuid references projects(id) on delete set null,
  parent_task_id uuid references tasks(id) on delete cascade,
  is_completed boolean default false,
  created_at timestamptz default now()
);

-- Categories
create table if not exists categories (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  type text check (type in ('habit', 'task')),
  color text default '#6c63ff',
  created_at timestamptz default now()
);

-- Row Level Security
alter table habits enable row level security;
alter table habit_logs enable row level security;
alter table projects enable row level security;
alter table tasks enable row level security;
alter table categories enable row level security;

-- Policies: users can only access their own data
create policy "Users can manage own habits" on habits for all using (auth.uid() = user_id);
create policy "Users can manage own habit_logs" on habit_logs for all using (habit_id in (select id from habits where user_id = auth.uid()));
create policy "Users can manage own projects" on projects for all using (auth.uid() = user_id);
create policy "Users can manage own tasks" on tasks for all using (auth.uid() = user_id);
create policy "Users can manage own categories" on categories for all using (auth.uid() = user_id);
