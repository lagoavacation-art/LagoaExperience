# Configuração do Banco de Dados Supabase

O erro "Could not find the table 'public.clientes_apresentacao' in the schema cache" indica que a tabela ainda não foi criada no seu projeto Supabase.

### Como resolver:

1. Acesse o [Dashboard do Supabase](https://app.supabase.com/).
2. Selecione o seu projeto (**Lagoa Experience**).
3. Vá no menu lateral em **SQL Editor**.
4. Clique em **New Query**.
5. Copie e cole o conteúdo abaixo e clique em **Run**:

```sql
-- Criar Tabela de Clientes
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

-- Habilitar RLS
ALTER TABLE public.clientes_apresentacao ENABLE ROW LEVEL SECURITY;

-- Política de Acesso Público (Leitura/Escrita) para simplificar
CREATE POLICY "Permitir tudo" ON public.clientes_apresentacao FOR ALL USING (true) WITH CHECK (true);

-- View Pública (opcional)
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

GRANT ALL ON public.clientes_apresentacao TO anon;
GRANT ALL ON public.clientes_apresentacao TO authenticated;
GRANT ALL ON public.cliente_apresentacao_publica TO anon;
GRANT ALL ON public.cliente_apresentacao_publica TO authenticated;
```

6. Após rodar o comando, a aplicação voltará a salvar os dados normalmente.
