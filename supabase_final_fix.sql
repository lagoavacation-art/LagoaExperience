-- SOLUÇÃO DEFINITIVA PARA BANCO DE DADOS LAGOA EXPERIENCE
-- Execute este script no SQL Editor do Supabase (Aperte em "New Query", cole e "Run")

-- 1. Extensões
create extension if not exists pgcrypto;

-- 2. Tabela Principal (Clientes)
create table if not exists public.clientes_apresentacao (
  id uuid primary key default gen_random_uuid(),
  nome_casal text not null,
  telefone text,
  cidade_estado text,
  profissao text,
  possui_casa_propria text,
  renda text,
  carro text,
  status_civil text,
  email text,
  valor_pago text,
  tipo_pensao text,
  data_checkin_hotel text,
  data_checkout_hotel text,
  numero_reserva text unique,
  hotel_hospedagem text,
  sala_apresentacao text not null,
  data_apresentacao text not null,
  hora_apresentacao text not null,
  status_apresentacao text not null default 'aguardando_checkin',
  horario_checkin_apresentacao timestamptz,
  horario_checkout_apresentacao timestamptz,
  duracao_total_minutos integer,
  token_cliente text unique not null,
  avaliacao_nota integer,
  avaliacao_comentario text,
  avaliacao_criada_em timestamptz,
  criado_em timestamptz default now(),
  atualizado_em timestamptz default now()
);

-- 3. Tabela de Logs de Auditoria
create table if not exists public.logs_acoes (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid references public.clientes_apresentacao(id) on delete cascade,
  operador_nome text,
  acao text not null,
  descricao text,
  criado_em timestamptz default now()
);

-- 4. View Pública para a Experiência do Cliente
drop view if exists public.cliente_apresentacao_publica;
create view public.cliente_apresentacao_publica as
select
  token_cliente,
  nome_casal,
  sala_apresentacao,
  data_apresentacao,
  hora_apresentacao,
  status_apresentacao,
  horario_checkin_apresentacao,
  avaliacao_nota,
  avaliacao_comentario
from public.clientes_apresentacao;

-- 5. Habilitar Segurança (RLS)
alter table public.clientes_apresentacao enable row level security;
alter table public.logs_acoes enable row level security;

-- 6. Policies para 'anon' (Uso operacional sem Supabase Auth)
drop policy if exists "anon_select_clientes" on public.clientes_apresentacao;
drop policy if exists "anon_insert_clientes" on public.clientes_apresentacao;
drop policy if exists "anon_update_clientes" on public.clientes_apresentacao;
drop policy if exists "anon_delete_clientes" on public.clientes_apresentacao;

create policy "anon_select_clientes" on public.clientes_apresentacao for select to anon using (true);
create policy "anon_insert_clientes" on public.clientes_apresentacao for insert to anon with check (true);
create policy "anon_update_clientes" on public.clientes_apresentacao for update to anon using (true) with check (true);
create policy "anon_delete_clientes" on public.clientes_apresentacao for delete to anon using (true);

drop policy if exists "anon_select_logs" on public.logs_acoes;
drop policy if exists "anon_insert_logs" on public.logs_acoes;

create policy "anon_select_logs" on public.logs_acoes for select to anon using (true);
create policy "anon_insert_logs" on public.logs_acoes for insert to anon with check (true);

-- 7. Função de Avaliação Segura (RPC)
create or replace function public.registrar_avaliacao_cliente(
  p_token_cliente text,
  p_nota integer,
  p_comentario text
)
returns json
language plpgsql
security definer
as $$
declare
  v_status text;
begin
  select status_apresentacao
  into v_status
  from public.clientes_apresentacao
  where token_cliente = p_token_cliente;

  if v_status is null then
    return json_build_object('success', false, 'message', 'Cliente não encontrado');
  end if;

  if v_status <> 'finalizado' then
    return json_build_object('success', false, 'message', 'Avaliação disponível somente após finalização da apresentação');
  end if;

  if p_nota < 1 or p_nota > 5 then
    return json_build_object('success', false, 'message', 'Nota deve ser entre 1 e 5');
  end if;

  if p_comentario is not null and length(p_comentario) > 1000 then
    return json_build_object('success', false, 'message', 'Comentário muito longo (max 1000)');
  end if;

  update public.clientes_apresentacao
  set
    avaliacao_nota = p_nota,
    avaliacao_comentario = p_comentario,
    avaliacao_criada_em = now(),
    atualizado_em = now()
  where token_cliente = p_token_cliente;

  return json_build_object('success', true, 'message', 'Avaliação registrada com sucesso');
end;
$$;

-- 8. Permissões de Acesso (Grants)
grant select, insert, update, delete on public.clientes_apresentacao to anon;
grant select, insert on public.logs_acoes to anon;
grant select on public.cliente_apresentacao_publica to anon;
grant execute on function public.registrar_avaliacao_cliente(text, integer, text) to anon;

-- 9. Cliente de Teste para Validação Inicial
insert into public.clientes_apresentacao (
  nome_casal,
  telefone,
  cidade_estado,
  profissao,
  possui_casa_propria,
  renda,
  carro,
  status_civil,
  email,
  valor_pago,
  tipo_pensao,
  data_checkin_hotel,
  data_checkout_hotel,
  numero_reserva,
  hotel_hospedagem,
  sala_apresentacao,
  data_apresentacao,
  hora_apresentacao,
  status_apresentacao,
  token_cliente
)
values (
  'RAYENE / MARCELO',
  '(61) 9XXXX-6461',
  'BRASÍLIA/DF',
  'AUTÔNOMA / TI',
  'SIM',
  '8000',
  'LOGAN',
  'UNIÃO ESTÁVEL',
  'rayene****@gmail.com',
  '1770,12',
  'PENSÃO COMPLETA',
  '12/08/2024',
  '15/08/2024',
  '406317',
  'ECO TOWERS',
  'Sala Lagoa Quente - Parque',
  '14/08/2024',
  '12:00',
  'aguardando_checkin',
  'token-exemplo-406317'
)
on conflict (token_cliente)
do update set
  nome_casal = excluded.nome_casal,
  sala_apresentacao = excluded.sala_apresentacao,
  data_apresentacao = excluded.data_apresentacao,
  hora_apresentacao = excluded.hora_apresentacao,
  status_apresentacao = excluded.status_apresentacao,
  atualizado_em = now();

-- 10. Atualização do Cache do PostgREST
notify pgrst, 'reload schema';
