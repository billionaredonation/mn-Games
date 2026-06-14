-- WorkRush / Telegram Tap Game Starter Kit
-- Paste this whole file into Supabase SQL Editor and run once.
-- Static GitHub Pages MVP: frontend calls SECURITY DEFINER RPC functions.
-- Production note: validate Telegram initData server-side before trusting Telegram user IDs.

create extension if not exists pgcrypto;

create table if not exists public.players (
  id uuid primary key default gen_random_uuid(),
  telegram_id bigint not null unique,
  username text,
  first_name text,
  coins numeric(18, 2) not null default 0,
  energy integer not null default 100,
  max_energy integer not null default 100,
  level integer not null default 1,
  xp integer not null default 0,
  tap_power integer not null default 1,
  stamina_level integer not null default 1,
  focus_level integer not null default 1,
  luck_level integer not null default 1,
  passive_income_level integer not null default 1,
  last_energy_at timestamptz not null default now(),
  last_daily_bonus_on date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.game_actions (
  id uuid primary key default gen_random_uuid(),
  telegram_id bigint not null,
  action_type text not null,
  amount numeric(18, 2) not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.admin_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

insert into public.admin_settings (key, value)
values
  ('admin_pin', '"1234"'::jsonb),
  ('daily_bonus_base', '250'::jsonb)
on conflict (key) do nothing;

alter table public.players enable row level security;
alter table public.game_actions enable row level security;
alter table public.admin_settings enable row level security;

revoke all on table public.players from anon, authenticated;
revoke all on table public.game_actions from anon, authenticated;
revoke all on table public.admin_settings from anon, authenticated;

grant usage on schema public to anon, authenticated;

create or replace function public.next_level_xp(p_level integer)
returns integer
language sql
stable
as $$
  select 100 + greatest(1, p_level) * 50;
$$;

create or replace function public.upgrade_cost(p_upgrade_key text, p_current_level integer)
returns integer
language plpgsql
stable
as $$
declare
  v_base numeric;
  v_multiplier numeric;
begin
  case p_upgrade_key
    when 'tap_power' then
      v_base := 40;
      v_multiplier := 1.55;
    when 'stamina_level' then
      v_base := 60;
      v_multiplier := 1.50;
    when 'focus_level' then
      v_base := 90;
      v_multiplier := 1.58;
    when 'luck_level' then
      v_base := 120;
      v_multiplier := 1.65;
    when 'passive_income_level' then
      v_base := 180;
      v_multiplier := 1.72;
    else
      raise exception 'Unknown upgrade key: %', p_upgrade_key;
  end case;

  return ceil(v_base * power(v_multiplier, greatest(1, p_current_level) - 1))::integer;
end;
$$;

create or replace function public.player_payload(
  p_player public.players,
  p_ok boolean default true,
  p_message text default 'ok',
  p_earned numeric default 0,
  p_critical boolean default false
)
returns jsonb
language sql
stable
as $$
  select jsonb_build_object(
    'ok', p_ok,
    'message', p_message,
    'earned', p_earned,
    'critical', p_critical,
    'nextLevelXp', public.next_level_xp(p_player.level),
    'upgradeCosts', jsonb_build_object(
      'tap_power', public.upgrade_cost('tap_power', p_player.tap_power),
      'stamina_level', public.upgrade_cost('stamina_level', p_player.stamina_level),
      'focus_level', public.upgrade_cost('focus_level', p_player.focus_level),
      'luck_level', public.upgrade_cost('luck_level', p_player.luck_level),
      'passive_income_level', public.upgrade_cost('passive_income_level', p_player.passive_income_level)
    ),
    'player', to_jsonb(p_player)
  );
$$;

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists players_touch_updated_at on public.players;
create trigger players_touch_updated_at
before update on public.players
for each row
execute function public.touch_updated_at();

create or replace function public.apply_player_timers(p_player_id uuid)
returns public.players
language plpgsql
security definer
set search_path = public
as $$
declare
  v_player public.players;
  v_minutes integer;
  v_max_energy integer;
  v_energy_gain integer;
  v_passive_gain numeric(18, 2);
begin
  select * into v_player
  from public.players
  where id = p_player_id
  for update;

  if not found then
    raise exception 'Player not found';
  end if;

  v_minutes := greatest(0, floor(extract(epoch from (now() - v_player.last_energy_at)) / 60)::integer);
  v_max_energy := 100 + greatest(0, v_player.stamina_level - 1) * 10;

  if v_minutes > 0 then
    v_energy_gain := greatest(1, floor(v_minutes * (1 + greatest(0, v_player.stamina_level - 1) * 0.15))::integer);
    v_passive_gain := floor(v_minutes * greatest(0, v_player.passive_income_level - 1) * 0.25);

    update public.players
    set
      energy = least(v_max_energy, energy + v_energy_gain),
      max_energy = v_max_energy,
      coins = coins + v_passive_gain,
      last_energy_at = now()
    where id = p_player_id
    returning * into v_player;
  else
    update public.players
    set max_energy = v_max_energy
    where id = p_player_id
    returning * into v_player;
  end if;

  return v_player;
end;
$$;

create or replace function public.get_or_create_player(
  p_telegram_id bigint,
  p_username text default null,
  p_first_name text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_player public.players;
begin
  if p_telegram_id is null or p_telegram_id <= 0 then
    raise exception 'telegram_id is required';
  end if;

  insert into public.players (telegram_id, username, first_name)
  values (p_telegram_id, nullif(p_username, ''), nullif(p_first_name, ''))
  on conflict (telegram_id) do update
  set
    username = coalesce(nullif(excluded.username, ''), public.players.username),
    first_name = coalesce(nullif(excluded.first_name, ''), public.players.first_name)
  returning * into v_player;

  v_player := public.apply_player_timers(v_player.id);

  return public.player_payload(v_player, true, 'Player loaded', 0, false);
end;
$$;

create or replace function public.tap_work(
  p_telegram_id bigint,
  p_username text default null,
  p_first_name text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_player public.players;
  v_base_income numeric(18, 2);
  v_earned numeric(18, 2);
  v_critical boolean;
  v_crit_chance numeric;
  v_xp integer;
  v_level integer;
  v_level_bonus numeric(18, 2) := 0;
begin
  perform public.get_or_create_player(p_telegram_id, p_username, p_first_name);

  select * into v_player
  from public.players
  where telegram_id = p_telegram_id
  for update;

  v_player := public.apply_player_timers(v_player.id);

  if v_player.energy <= 0 then
    return public.player_payload(v_player, false, 'No energy. Wait for regeneration.', 0, false);
  end if;

  v_base_income := v_player.tap_power + floor(greatest(0, v_player.focus_level - 1) * 0.65);
  v_crit_chance := least(0.30, greatest(0, v_player.luck_level - 1) * 0.025);
  v_critical := random() < v_crit_chance;

  if v_critical then
    v_earned := floor(v_base_income * 2.5);
  else
    v_earned := floor(v_base_income);
  end if;

  v_xp := v_player.xp + 5;
  v_level := v_player.level;

  while v_xp >= public.next_level_xp(v_level) loop
    v_xp := v_xp - public.next_level_xp(v_level);
    v_level := v_level + 1;
    v_level_bonus := v_level_bonus + (25 * v_level);
  end loop;

  update public.players
  set
    coins = coins + v_earned + v_level_bonus,
    energy = greatest(0, energy - 1),
    xp = v_xp,
    level = v_level
  where id = v_player.id
  returning * into v_player;

  insert into public.game_actions (telegram_id, action_type, amount)
  values (p_telegram_id, 'tap_work', v_earned + v_level_bonus);

  if v_level_bonus > 0 then
    return public.player_payload(v_player, true, 'Level up bonus included', v_earned + v_level_bonus, v_critical);
  end if;

  return public.player_payload(v_player, true, 'Work completed', v_earned, v_critical);
end;
$$;

create or replace function public.buy_upgrade(
  p_telegram_id bigint,
  p_upgrade_key text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_player public.players;
  v_current_level integer;
  v_cost integer;
begin
  select * into v_player
  from public.players
  where telegram_id = p_telegram_id
  for update;

  if not found then
    return jsonb_build_object('ok', false, 'message', 'Player not found');
  end if;

  v_player := public.apply_player_timers(v_player.id);

  case p_upgrade_key
    when 'tap_power' then v_current_level := v_player.tap_power;
    when 'stamina_level' then v_current_level := v_player.stamina_level;
    when 'focus_level' then v_current_level := v_player.focus_level;
    when 'luck_level' then v_current_level := v_player.luck_level;
    when 'passive_income_level' then v_current_level := v_player.passive_income_level;
    else return public.player_payload(v_player, false, 'Unknown upgrade', 0, false);
  end case;

  if v_current_level >= 20 then
    return public.player_payload(v_player, false, 'Upgrade is already maxed', 0, false);
  end if;

  v_cost := public.upgrade_cost(p_upgrade_key, v_current_level);

  if v_player.coins < v_cost then
    return public.player_payload(v_player, false, 'Not enough coins', 0, false);
  end if;

  if p_upgrade_key = 'tap_power' then
    update public.players set coins = coins - v_cost, tap_power = tap_power + 1 where id = v_player.id returning * into v_player;
  elsif p_upgrade_key = 'stamina_level' then
    update public.players set coins = coins - v_cost, stamina_level = stamina_level + 1, max_energy = max_energy + 10 where id = v_player.id returning * into v_player;
  elsif p_upgrade_key = 'focus_level' then
    update public.players set coins = coins - v_cost, focus_level = focus_level + 1 where id = v_player.id returning * into v_player;
  elsif p_upgrade_key = 'luck_level' then
    update public.players set coins = coins - v_cost, luck_level = luck_level + 1 where id = v_player.id returning * into v_player;
  elsif p_upgrade_key = 'passive_income_level' then
    update public.players set coins = coins - v_cost, passive_income_level = passive_income_level + 1 where id = v_player.id returning * into v_player;
  end if;

  insert into public.game_actions (telegram_id, action_type, amount)
  values (p_telegram_id, 'buy_' || p_upgrade_key, -v_cost);

  return public.player_payload(v_player, true, 'Upgrade purchased', 0, false);
end;
$$;

create or replace function public.claim_daily_bonus(p_telegram_id bigint)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_player public.players;
  v_bonus_base integer;
  v_bonus numeric(18, 2);
begin
  select * into v_player
  from public.players
  where telegram_id = p_telegram_id
  for update;

  if not found then
    return jsonb_build_object('ok', false, 'message', 'Player not found');
  end if;

  v_player := public.apply_player_timers(v_player.id);

  if v_player.last_daily_bonus_on = current_date then
    return public.player_payload(v_player, false, 'Daily bonus already claimed', 0, false);
  end if;

  select coalesce((value #>> '{}')::integer, 250)
  into v_bonus_base
  from public.admin_settings
  where key = 'daily_bonus_base';

  v_bonus := v_bonus_base + v_player.level * 10;

  update public.players
  set
    coins = coins + v_bonus,
    last_daily_bonus_on = current_date
  where id = v_player.id
  returning * into v_player;

  insert into public.game_actions (telegram_id, action_type, amount)
  values (p_telegram_id, 'daily_bonus', v_bonus);

  return public.player_payload(v_player, true, 'Daily bonus claimed', v_bonus, false);
end;
$$;

create or replace function public.get_leaderboard(p_limit integer default 25)
returns jsonb
language sql
security definer
set search_path = public
as $$
  select coalesce(jsonb_agg(item), '[]'::jsonb)
  from (
    select jsonb_build_object(
      'rank', row_number() over (order by coins desc, level desc, created_at asc),
      'telegram_id', telegram_id,
      'name', coalesce(nullif(first_name, ''), nullif(username, ''), 'Player'),
      'username', username,
      'coins', coins,
      'level', level,
      'tap_power', tap_power
    ) as item
    from public.players
    order by coins desc, level desc, created_at asc
    limit least(greatest(coalesce(p_limit, 25), 1), 100)
  ) ranked;
$$;

create or replace function public.admin_check_pin(p_admin_pin text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_pin text;
begin
  select value #>> '{}'
  into v_pin
  from public.admin_settings
  where key = 'admin_pin';

  return coalesce(v_pin, '') <> '' and p_admin_pin = v_pin;
end;
$$;

create or replace function public.admin_grant_coins(
  p_admin_pin text,
  p_telegram_id bigint,
  p_amount numeric
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_player public.players;
begin
  if not public.admin_check_pin(p_admin_pin) then
    return jsonb_build_object('ok', false, 'message', 'Wrong admin PIN');
  end if;

  update public.players
  set coins = greatest(0, coins + p_amount)
  where telegram_id = p_telegram_id
  returning * into v_player;

  if not found then
    return jsonb_build_object('ok', false, 'message', 'Player not found');
  end if;

  insert into public.game_actions (telegram_id, action_type, amount)
  values (p_telegram_id, 'admin_grant', p_amount);

  return public.player_payload(v_player, true, 'Admin balance updated', p_amount, false);
end;
$$;

create or replace function public.admin_reset_player(
  p_admin_pin text,
  p_telegram_id bigint
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_player public.players;
begin
  if not public.admin_check_pin(p_admin_pin) then
    return jsonb_build_object('ok', false, 'message', 'Wrong admin PIN');
  end if;

  update public.players
  set
    coins = 0,
    energy = 100,
    max_energy = 100,
    level = 1,
    xp = 0,
    tap_power = 1,
    stamina_level = 1,
    focus_level = 1,
    luck_level = 1,
    passive_income_level = 1,
    last_energy_at = now(),
    last_daily_bonus_on = null
  where telegram_id = p_telegram_id
  returning * into v_player;

  if not found then
    return jsonb_build_object('ok', false, 'message', 'Player not found');
  end if;

  insert into public.game_actions (telegram_id, action_type, amount)
  values (p_telegram_id, 'admin_reset', 0);

  return public.player_payload(v_player, true, 'Player reset', 0, false);
end;
$$;

grant execute on function public.next_level_xp(integer) to anon, authenticated;
grant execute on function public.upgrade_cost(text, integer) to anon, authenticated;
grant execute on function public.get_or_create_player(bigint, text, text) to anon, authenticated;
grant execute on function public.tap_work(bigint, text, text) to anon, authenticated;
grant execute on function public.buy_upgrade(bigint, text) to anon, authenticated;
grant execute on function public.claim_daily_bonus(bigint) to anon, authenticated;
grant execute on function public.get_leaderboard(integer) to anon, authenticated;
grant execute on function public.admin_grant_coins(text, bigint, numeric) to anon, authenticated;
grant execute on function public.admin_reset_player(text, bigint) to anon, authenticated;
