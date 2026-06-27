-- Local-first sync blob: вся MiraLocalData одним JSONB на пользователя.
-- Источник истины — клиент (localStorage); эта таблица зеркало для бэкапа
-- и синхронизации между устройствами. Last-write-wins по updated_at.

create table public.user_data (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null,
  data_version integer not null default 2,
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.user_data enable row level security;

-- Только владелец видит и меняет свой блоб.
create policy "Users manage own data blob"
  on public.user_data
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create trigger user_data_set_updated_at
  before update on public.user_data
  for each row execute function public.set_updated_at();
