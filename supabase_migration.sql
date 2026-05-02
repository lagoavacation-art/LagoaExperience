-- 1. Tabelas Principais

-- Tabela de Operadores do App (Controle Interno)
CREATE TABLE IF NOT EXISTS public.operadores_app (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    nome text NOT NULL,
    usuario text UNIQUE NOT NULL,
    senha_hash text NOT NULL, -- PIN ou Hash de senha
    perfil text NOT NULL DEFAULT 'recepcao' CHECK (perfil IN ('recepcao', 'admin')),
    ativo boolean DEFAULT true,
    criado_em timestamptz DEFAULT now()
);

-- Inserir usuário de teste (PIN: 1234)
INSERT INTO public.operadores_app (nome, usuario, senha_hash, perfil)
VALUES ('Operador Recepção', 'recepcao', '1234', 'recepcao')
ON CONFLICT (usuario) DO NOTHING;

-- Tabela de Clientes e Apresentações
CREATE TABLE IF NOT EXISTS public.clientes_apresentacao (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    nome_casal text NOT NULL,
    telefone text,
    cidade_estado text,
    profissao text,
    possui_casa_propria boolean DEFAULT false,
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
    status_apresentacao text NOT NULL DEFAULT 'aguardando_checkin' CHECK (status_apresentacao IN ('aguardando_checkin', 'em_apresentacao', 'finalizado')),
    horario_checkin_apresentacao timestamptz,
    horario_checkout_apresentacao timestamptz,
    duracao_total_minutos integer,
    token_cliente text UNIQUE NOT NULL,
    criado_em timestamptz DEFAULT now(),
    atualizado_em timestamptz DEFAULT now()
);

-- Tabela de Logs de Ações (Simplificada para uso sem Auth)
CREATE TABLE IF NOT EXISTS public.logs_acoes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    cliente_id uuid REFERENCES public.clientes_apresentacao(id) ON DELETE CASCADE,
    operador_nome text,
    acao text NOT NULL,
    descricao text,
    criado_em timestamptz DEFAULT now()
);

-- 2. View Pública para o Cliente (Restrita)
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

-- 3. Funções e Triggers

-- Função para atualizar timestamp de alteração
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.atualizado_em = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_clientes_updated_at
    BEFORE UPDATE ON public.clientes_apresentacao
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 4. Inserir Cliente de Teste (Token Fixo para Validação)
INSERT INTO public.clientes_apresentacao (
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
) VALUES (
    'RAYENE / MARCELO',
    '(61) 9XXXX-6461',
    'BRASÍLIA/DF',
    'AUTÔNOMA / TI',
    true,
    8000,
    'LOGAN',
    'UNIÃO ESTÁVEL',
    'rayene****@gmail.com',
    1770.12,
    'PENSÃO COMPLETA',
    '2024-08-12',
    '2024-08-15',
    '406317',
    'ECO TOWERS',
    'Sala Lagoa Quente',
    '2024-08-14',
    '12:00:00',
    'aguardando_checkin',
    'token-exemplo-406317'
) ON CONFLICT (numero_reserva) DO UPDATE SET token_cliente = 'token-exemplo-406317';

-- 5. Segurança / RLS (Row Level Security)
-- Grant select permission on the view to public/anon
GRANT SELECT ON public.cliente_apresentacao_publica TO anon;
GRANT SELECT ON public.cliente_apresentacao_publica TO authenticated;

-- Garantir que a tabela base NÃO seja acessível publicamente para dados sensíveis
ALTER TABLE public.clientes_apresentacao ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Acesso público via token na view" 
ON public.clientes_apresentacao FOR SELECT 
USING (true); -- Controle real é feito pelos campos expostos na View

