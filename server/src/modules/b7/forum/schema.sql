-- OBSOLETE / NOT USED by the main LMS integration.
-- Do not execute this file: B7 Forum now uses the existing forums and
-- forum_posts tables. Kept only as historical reference; no B7 schema
-- or Forum tables should be created from this file.

create schema if not exists b7;

create table if not exists b7.forum_topics (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references master.courses(id) on delete cascade,
  created_by uuid not null references master.users(id) on delete restrict,
  title text not null check (char_length(btrim(title)) between 1 and 180),
  description text not null default '' check (char_length(description) <= 5000),
  status text not null default 'open' check (status in ('open', 'closed')),
  replies_count integer not null default 0 check (replies_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists b7.forum_messages (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references b7.forum_topics(id) on delete cascade,
  sender_id uuid not null references master.users(id) on delete restrict,
  parent_message_id uuid null references b7.forum_messages(id) on delete set null,
  content text not null check (char_length(btrim(content)) between 1 and 2000),
  status text not null default 'visible' check (status in ('visible', 'flagged', 'deleted')),
  created_at timestamptz not null default now()
);

create index if not exists forum_topics_course_created_idx
  on b7.forum_topics (course_id, created_at desc);
create index if not exists forum_messages_topic_created_idx
  on b7.forum_messages (topic_id, created_at asc);
create index if not exists forum_messages_parent_idx
  on b7.forum_messages (parent_message_id);

create or replace function b7.increment_forum_reply_count()
returns trigger language plpgsql as $$
begin
  if tg_op = 'INSERT' then
    update b7.forum_topics set replies_count = replies_count + 1 where id = new.topic_id;
  elsif tg_op = 'UPDATE' and old.status <> 'deleted' and new.status = 'deleted' then
    update b7.forum_topics set replies_count = greatest(replies_count - 1, 0) where id = new.topic_id;
  end if;
  return new;
end;
$$;

do $$
begin
  if not exists (
    select 1
    from pg_trigger
    where tgname = 'forum_message_reply_count'
      and tgrelid = 'b7.forum_messages'::regclass
      and not tgisinternal
  ) then
    create trigger forum_message_reply_count
    after insert or update of status on b7.forum_messages
    for each row execute function b7.increment_forum_reply_count();
  end if;
end;
$$;

alter table b7.forum_topics enable row level security;
alter table b7.forum_messages enable row level security;

grant usage on schema b7 to service_role;
grant select, insert, update, delete on all tables in schema b7 to service_role;
grant usage, select on all sequences in schema b7 to service_role;
