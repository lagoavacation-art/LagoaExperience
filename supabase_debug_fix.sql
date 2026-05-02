-- SOLUÇÃO PARA ERROS DE SALVAMENTO (RLS / PERMISSÕES)
-- Execute este script no SQL Editor do seu projeto Supabase

-- 1. Habilitar extensão pgcrypto para UUIDs
create extension if not exists pgcrypto;

-- 2. Garantir que a tabela existe com todos os campos necessários
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
  status_apresentacao text not null default 'aguardando_checkin' check (status_apresentacao in ('aguardando_checkin', 'em_apresentacao', 'finalizado')),
  horario_checkin_apresentacao timestamptz,
  horario_checkout_apresentacao timestamptz,
  duracao_total_minutos integer,
  token_cliente text unique not null,
  avaliacao_nota integer check (avaliacao_nota >= 1 and avaliacao_nota <= 5),
  avaliacao_comentario text,
  avaliacao_criada_em timestamptz,
  criado_em timestamptz default now(),
  atualizado_em timestamptz default now()
);

-- 3. Habilitar RLS
alter table public.clientes_apresentacao enable row level security;

-- 4. Criar Policies para o papel 'anon' (Uso operacional sem Supabase Auth)
-- IMPORTANTE: Como o sistema usa PIN login local, as chamadas chegam como 'anon' no Supabase.

drop policy if exists "recepcao_anon_select_clientes" on public.clientes_apresentacao;
drop policy if exists "recepcao_anon_insert_clientes" on public.clientes_apresentacao;
drop policy if exists "recepcao_anon_update_clientes" on public.clientes_apresentacao;
drop policy if exists "recepcao_anon_delete_clientes" on public.clientes_apresentacao;

create policy "recepcao_anon_select_clientes"
on public.clientes_apresentacao
for select
to anon
using (true);

create policy "recepcao_anon_insert_clientes"
on public.clientes_apresentacao
for insert
to anon
with check (true);

create policy "recepcao_anon_update_clientes"
on public.clientes_apresentacao
for update
to anon
using (true)
with check (true);

create policy "recepcao_anon_delete_clientes"
on public.clientes_apresentacao
for delete
to anon
using (true);

-- 5. View Pública (Segura)
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

-- 6. Função Segura para Avaliação (RPC)
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
  v_cliente public.clientes_apresentacao;
begin
  -- Buscar cliente pelo token
  select * into v_cliente
  from public.clientes_apresentacao
  where token_cliente = p_token_cliente;

  if not found then
    return json_build_object('success', false, 'message', 'Cliente não encontrado');
  end if;

  -- Validar status
  if v_cliente.status_apresentacao <> 'finalizado' then
    return json_build_object('success', false, 'message', 'Avaliação disponível somente após finalização');
  end if;

  -- Validar nota
  if p_nota < 1 or p_nota > 5 then
    return json_build_object('success', false, 'message', 'Nota deve ser entre 1 e 5');
  end if;

  -- Validar comentário
  if p_comentario is not null and length(p_comentario) > 1000 then
    return json_build_object('success', false, 'message', 'Comentário muito longo (máx 1000 caracteres)');
  end if;

  -- Atualizar apenas campos de avaliação
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

-- 7. Grants Finais
grant select, insert, update, delete on public.clientes_apresentacao to anon;
grant select on public.cliente_apresentacao_publica to anon;
grant execute on function public.registrar_avaliacao_cliente(text, integer, text) to anon;

-- 8. Inserir Cliente de Teste Atualizado
insert into public.clientes_apresentacao (
  nome_casal,
  token_cliente,
  sala_apresentacao,
  data_apresentacao,
  hora_apresentacao,
  status_apresentacao
)
values (
  'RAYENE / MARCELO (TESTE)',
  'token-exemplo-406317',
  'Sala Lagoa Quente',
  '2026-05-02',
  '12:00',
  'aguardando_checkin'
)
on conflict (token_cliente)
do update set
  nome_casal = excluded.nome_casal,
  sala_apresentacao = excluded.sala_apresentacao,
  status_apresentacao = excluded.status_apresentacao,
  atualizado_em = now();
