-- Limite de uso do assistente com IA (por aparelho e global, por dia).
-- Guarda só um hash do IP (nunca o IP em si) e apaga registros com mais de 7 dias.

create table if not exists public.ai_usage (
  key   text    not null,          -- hash SHA-256 do IP, ou '__global__'
  day   date    not null,          -- dia no fuso America/Sao_Paulo
  count integer not null default 0,
  primary key (key, day)
);

alter table public.ai_usage enable row level security;
-- Sem políticas: nenhum acesso pela API pública; só a função (service_role) usa.

create or replace function public.ai_consume(p_key text, p_limit integer, p_global_limit integer)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_day    date := (now() at time zone 'America/Sao_Paulo')::date;
  v_user   integer;
  v_global integer;
begin
  delete from ai_usage where day < v_day - 7;

  select count into v_user from ai_usage where key = p_key and day = v_day;
  if coalesce(v_user, 0) >= p_limit then
    return -1;                       -- limite do aparelho atingido
  end if;

  insert into ai_usage (key, day, count) values ('__global__', v_day, 1)
  on conflict (key, day) do update set count = ai_usage.count + 1
  returning count into v_global;
  if v_global > p_global_limit then
    return -2;                       -- limite global do dia atingido
  end if;

  insert into ai_usage (key, day, count) values (p_key, v_day, 1)
  on conflict (key, day) do update set count = ai_usage.count + 1
  returning count into v_user;

  return greatest(p_limit - v_user, 0);  -- mensagens restantes hoje
end;
$$;

revoke all on function public.ai_consume(text, integer, integer) from public, anon, authenticated;
grant execute on function public.ai_consume(text, integer, integer) to service_role;
