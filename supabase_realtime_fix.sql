-- HABILITAR REALTIME PARA A TABELA CLIENTES_APRESENTACAO
-- Execute este script no SQL Editor do Supabase

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'clientes_apresentacao'
  ) then
    alter publication supabase_realtime add table public.clientes_apresentacao;
  end if;
end $$;

-- Identidade de réplica Full permite que o payload contenha todos os dados em updates/deletes
alter table public.clientes_apresentacao replica identity full;

-- Notificar recarregamento do schema
notify pgrst, 'reload schema';
