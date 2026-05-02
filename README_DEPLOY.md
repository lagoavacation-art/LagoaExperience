# Lagoa Experience - Manual de Integração (GitHub + Vercel)

Este projeto está configurado para uma integração nativa entre **GitHub** e **Vercel**. Toda alteração enviada para o GitHub disparará um deploy automático na Vercel.

## Configuração Obrigatória no GitHub

1. Certifique-se de que o código está na branch `main` do repositório:
   `https://github.com/lagoavacation-art/LagoaExperience.git`

## Configuração na Vercel

### 1. Importar Projeto
- No dashboard da Vercel, clique em **"New Project"**.
- Conecte sua conta do GitHub e importe o repositório `LagoaExperience`.

### 2. Configurações de Build
- **Framework Preset**: `Vite`
- **Root Directory**: `./`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 3. Variáveis de Ambiente (CRÍTICO)
No menu **Environment Variables**, adicione as seguintes chaves com os valores abaixo:

| Chave | Valor |
| :--- | :--- |
| `VITE_SUPABASE_URL` | `https://gkhphchabrrxvastrkyp.supabase.co` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | `sb_publishable_kasq7letpyPu4RNhIQZWhQ_Mcx4rIxS` |

### 4. Deploy
Clique em **"Deploy"**. A Vercel criará o build e fornecerá a URL pública.

## Estrutura de Rotas (HashRouter)

A aplicação utiliza `HashRouter`, o que garante que as rotas funcionem diretamente na Vercel sem necessidade de configurações no `vercel.json`:

- **Login**: `https://lagoa-experience.vercel.app/#/recepcao/login`
- **Dashboard**: `https://lagoa-experience.vercel.app/#/recepcao/dashboard`
- **Cadastro**: `https://lagoa-experience.vercel.app/#/recepcao/cadastro`
- **Cliente**: `https://lagoa-experience.vercel.app/#/cliente/TOKEN`

---

## Manutenção e Atualização

Para atualizar o site, basta fazer um push para a branch `main`:
1. `git add .`
2. `git commit -m "Descricão da alteracão"`
3. `git push origin main`

A Vercel detectará o push e fará o redeploy automaticamente em segundos.
