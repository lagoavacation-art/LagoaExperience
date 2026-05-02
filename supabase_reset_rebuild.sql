-- BACKUP ATUAL (Caso as tabelas já existam)
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'clientes_apresentacao') THEN
        CREATE TABLE IF NOT EXISTS public.clientes_apresentacao_backup_20260502 AS SELECT * FROM public.clientes_apresentacao;
    END IF;
    
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'logs_acoes') THEN
        CREATE TABLE IF NOT EXISTS public.logs_acoes_backup_20260502 AS SELECT * FROM public.logs_acoes;
    END IF;
END $$;

-- LIMPAR DADOS ANTIGOS
TRUNCATE TABLE public.logs_acoes RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.clientes_apresentacao RESTART IDENTITY CASCADE;

-- DROP VIEW SE EXISTIR PARA RECONSTRUIR
DROP VIEW IF EXISTS public.cliente_apresentacao_publica;

-- TABELA PRINCIPAL: clientes_apresentacao
CREATE TABLE IF NOT EXISTS public.clientes_apresentacao (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    nome_casal text NOT NULL,
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
    numero_reserva text UNIQUE,
    hotel_hospedagem text,
    sala_apresentacao text NOT NULL,
    data_apresentacao text NOT NULL,
    hora_apresentacao text NOT NULL,
    status_apresentacao text NOT NULL DEFAULT 'aguardando_checkin' CHECK (status_apresentacao IN ('aguardando_checkin', 'em_apresentacao', 'finalizado')),
    horario_checkin_apresentacao timestamptz,
    horario_checkout_apresentacao timestamptz,
    duracao_total_minutos integer,
    token_cliente text UNIQUE NOT NULL,
    
    -- Avaliacao
    avaliacao_nota integer CHECK (avaliacao_nota >= 1 AND avaliacao_nota <= 5),
    avaliacao_comentario text,
    avaliacao_criada_em timestamptz,
    
    criado_em timestamptz DEFAULT now(),
    atualizado_em timestamptz DEFAULT now()
);

-- TABELA DE LOGS
CREATE TABLE IF NOT EXISTS public.logs_acoes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    cliente_id uuid REFERENCES public.clientes_apresentacao(id) ON DELETE CASCADE,
    operador_nome text,
    acao text NOT NULL,
    descricao text,
    criado_em timestamptz DEFAULT now()
);

-- VIEW PÚBLICA (Segura)
CREATE OR REPLACE VIEW public.cliente_apresentacao_publica AS
SELECT 
    token_cliente,
    nome_casal,
    sala_apresentacao,
    data_apresentacao,
    hora_apresentacao,
    status_apresentacao,
    horario_checkin_apresentacao,
    avaliacao_nota,
    avaliacao_comentario
FROM public.clientes_apresentacao;

-- HABILITAR RLS (Segurança)
ALTER TABLE public.clientes_apresentacao ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logs_acoes ENABLE ROW LEVEL SECURITY;

-- POLICIES
CREATE POLICY "Acesso total adm" ON public.clientes_apresentacao FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso total logs" ON public.logs_acoes FOR ALL USING (true) WITH CHECK (true);

-- GRANTS
GRANT ALL ON public.clientes_apresentacao TO anon, authenticated;
GRANT ALL ON public.logs_acoes TO anon, authenticated;
GRANT SELECT ON public.cliente_apresentacao_publica TO anon, authenticated;

-- FUNÇÃO SEGURA PARA AVALIAÇÃO (RPC)
CREATE OR REPLACE FUNCTION public.registrar_avaliacao_cliente(
  p_token_cliente text,
  p_nota integer,
  p_comentario text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_cliente_id uuid;
    v_status text;
BEGIN
    -- Validar nota
    IF p_nota < 1 OR p_nota > 5 THEN
        RETURN json_build_object('success', false, 'message', 'Nota deve ser entre 1 e 5');
    END IF;

    -- Buscar cliente e status
    SELECT id, status_apresentacao INTO v_cliente_id, v_status
    FROM public.clientes_apresentacao
    WHERE token_cliente = p_token_cliente;

    IF v_cliente_id IS NULL THEN
        RETURN json_build_object('success', false, 'message', 'Cliente não encontrado');
    END IF;

    IF v_status != 'finalizado' THEN
        RETURN json_build_object('success', false, 'message', 'Avaliação permitida apenas após checkout');
    END IF;

    -- Atualizar avaliação
    UPDATE public.clientes_apresentacao
    SET 
        avaliacao_nota = p_nota,
        avaliacao_comentario = LEFT(p_comentario, 1000),
        avaliacao_criada_em = now(),
        atualizado_em = now()
    WHERE id = v_cliente_id;

    RETURN json_build_object('success', true, 'message', 'Avaliação registrada com sucesso');
END;
$$;

GRANT EXECUTE ON FUNCTION public.registrar_avaliacao_cliente TO anon, authenticated;

-- INSERIR CLIENTE DE TESTE
INSERT INTO public.clientes_apresentacao (
    nome_casal, 
    token_cliente, 
    sala_apresentacao, 
    data_apresentacao, 
    hora_apresentacao, 
    status_apresentacao
) VALUES (
    'Casal Exemplo Teste', 
    'token-exemplo-406317', 
    'Sala Lagoa Quente - Parque', 
    '2026-05-02', 
    '15:00', 
    'aguardando_checkin'
) ON CONFLICT (token_cliente) DO NOTHING;
