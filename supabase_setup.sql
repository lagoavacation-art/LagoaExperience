-- 1. Tabela Principal
CREATE TABLE IF NOT EXISTS public.clientes_apresentacao (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    nome_casal text NOT NULL,
    telefone text,
    cidade_estado text,
    profissao text,
    possui_casa_propria text,
    renda numeric,
    carro text,
    status_civil text,
    email text,
    valor_pago numeric,
    tipo_pensao text,
    data_checkin_hotel date,
    data_checkout_hotel date,
    numero_reserva text UNIQUE,
    hotel_hospedagem text,
    sala_apresentacao text NOT NULL,
    data_apresentacao date NOT NULL,
    hora_apresentacao time NOT NULL,
    status_apresentacao text NOT NULL DEFAULT 'aguardando_checkin',
    horario_checkin_apresentacao timestamptz,
    horario_checkout_apresentacao timestamptz,
    duracao_total_minutos integer,
    token_cliente text UNIQUE NOT NULL,
    criado_em timestamptz DEFAULT now(),
    atualizado_em timestamptz DEFAULT now()
);

-- 2. View Pública (dados não sensíveis)
CREATE OR REPLACE VIEW public.cliente_apresentacao_publica AS
SELECT 
    token_cliente,
    nome_casal,
    sala_apresentacao,
    data_apresentacao,
    hora_apresentacao,
    status_apresentacao,
    horario_checkin_apresentacao
FROM public.clientes_apresentacao;

-- 3. Permissões
GRANT SELECT ON public.cliente_apresentacao_publica TO anon;
GRANT SELECT ON public.cliente_apresentacao_publica TO authenticated;

-- 4. Dado de Teste
INSERT INTO public.clientes_apresentacao (
    nome_casal,
    sala_apresentacao,
    data_apresentacao,
    hora_apresentacao,
    status_apresentacao,
    token_cliente
) VALUES (
    'RAYENE / MARCELO',
    'Sala Lagoa Quente',
    '2024-08-14',
    '12:00:00',
    'aguardando_checkin',
    'token-exemplo-406317'
) ON CONFLICT (token_cliente) DO UPDATE SET
    nome_casal = EXCLUDED.nome_casal,
    sala_apresentacao = EXCLUDED.sala_apresentacao,
    data_apresentacao = EXCLUDED.data_apresentacao,
    hora_apresentacao = EXCLUDED.hora_apresentacao;

-- 5. Teste de Retorno
SELECT * FROM public.cliente_apresentacao_publica WHERE token_cliente = 'token-exemplo-406317';
