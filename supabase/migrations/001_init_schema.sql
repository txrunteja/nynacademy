create extension if not exists "pgcrypto";

create type class_mode as enum ('online', 'offline');
create type schedule_type as enum ('individual', 'batch');
create type schedule_recurrence as enum ('once', 'daily', 'weekly');
create type schedule_status as enum ('scheduled', 'completed', 'missed', 'cancelled', 'rescheduled');
create type lead_source as enum ('justdial', 'sulekha', 'other');
create type lead_status as enum ('new', 'contacted', 'converted', 'dropped');
create type social_status as enum ('draft', 'scheduled', 'posted');

create table if not exists faculty (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  subjects text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists students (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  mode class_mode not null,
  assigned_faculty_id uuid references faculty(id) on delete set null,
  subjects text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists batches (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  faculty_id uuid references faculty(id) on delete set null,
  student_ids uuid[] not null default '{}',
  subject text not null,
  created_at timestamptz not null default now()
);

create table if not exists schedules (
  id uuid primary key default gen_random_uuid(),
  type schedule_type not null,
  student_id uuid references students(id) on delete cascade,
  batch_id uuid references batches(id) on delete cascade,
  faculty_id uuid not null references faculty(id) on delete cascade,
  subject text not null,
  start_time timestamptz not null,
  end_time timestamptz not null,
  mode class_mode not null,
  recurrence schedule_recurrence not null default 'once',
  status schedule_status not null default 'scheduled',
  notes text,
  marked_by text,
  marked_at timestamptz,
  check (
    (type = 'individual' and student_id is not null and batch_id is null)
    or (type = 'batch' and batch_id is not null and student_id is null)
  )
);

create table if not exists attendance_logs (
  id uuid primary key default gen_random_uuid(),
  schedule_id uuid not null references schedules(id) on delete cascade,
  date date not null,
  status schedule_status not null,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  source lead_source not null default 'other',
  status lead_status not null default 'new',
  notes text,
  follow_up_date date,
  created_at timestamptz not null default now()
);

create table if not exists social_posts (
  id uuid primary key default gen_random_uuid(),
  platform text not null,
  content text not null,
  scheduled_date date,
  status social_status not null default 'draft',
  created_at timestamptz not null default now()
);

create index if not exists idx_students_mode on students(mode);
create index if not exists idx_students_faculty on students(assigned_faculty_id);
create index if not exists idx_schedules_faculty on schedules(faculty_id);
create index if not exists idx_schedules_start_time on schedules(start_time);
create index if not exists idx_schedules_status on schedules(status);
create index if not exists idx_attendance_date on attendance_logs(date);
create index if not exists idx_leads_source on leads(source);
create index if not exists idx_leads_status on leads(status);
create index if not exists idx_social_status on social_posts(status);

create or replace function faculty_stats()
returns table (
  faculty_id uuid,
  classes_today bigint,
  total_taken bigint,
  total_missed bigint
)
language sql
as $$
  select
    f.id as faculty_id,
    count(s.id) filter (
      where date(s.start_time at time zone 'utc') = current_date
    ) as classes_today,
    count(al.id) filter (where al.status = 'completed') as total_taken,
    count(al.id) filter (where al.status = 'missed') as total_missed
  from faculty f
  left join schedules s on s.faculty_id = f.id
  left join attendance_logs al on al.schedule_id = s.id
  group by f.id
$$;
