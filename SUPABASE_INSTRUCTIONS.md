# Guia de Configuração Supabase - Lagoa Experience

Para garantir que o sistema funcione perfeitamente com salvamento, exclusão, avaliação e atualização em tempo real, siga as etapas abaixo:

## ETAPA 1: Criar/Corrigir as Tabelas e Funções

1. Acesse o [Dashboard do Supabase](https://app.supabase.com/).
2. Vá em **SQL Editor** -> **New Query**.
3. Copie o conteúdo do arquivo `supabase_final_fix.sql` (disponível na raiz do projeto) e clique em **Run**.
   - Isso criará as tabelas `clientes_apresentacao`, `logs_acoes`, a view pública e a função de avaliação.

## ETAPA 2: Habilitar Atualização em Tempo Real (Realtime)

1. No **SQL Editor**, clique em **New Query**.
2. Copie o conteúdo do arquivo `supabase_realtime_fix.sql` e clique em **Run**.
   - Isso adicionará a tabela de clientes à publicação do Realtime e permitirá que o dashboard e a tela do cliente atualizem sozinhos.

## ETAPA 3: Verificar Variáveis de Ambiente

Certifique-se de que o arquivo `.env` (ou as variáveis na Vercel) contém as chaves corretas:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

---

## O que foi corrigido:
- **Realtime:** O sistema agora escuta mudanças no banco e atualiza a UI instantaneamente.
- **Exclusão:** Botão de exclusão agora remove os dados do Supabase permanentemente.
- **Avaliação:** O cliente agora envia nota e comentário via função segura (RPC) após o check-out.
- **Login:** Padronizado para `recepcao` / `123456`.
- **Integridade:** Payload de salvamento mapeado campo a campo para evitar erros de cache de schema.
