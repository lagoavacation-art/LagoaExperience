# Lagoa Experience - Manual de Deploy (Estático)

Este projeto foi convertido para uma aplicação **Vite SPA (Static Site)** pronta para ser hospedada em serviços como **Netlify** ou **Vercel**.

## Requisitos
- Node.js instalado
- Conta no Supabase (configurações já inclusas no código)

## Passo a Passo para Deploy

### Opção 1: Netlify (Manual ou GitHub)

1. **Build Local**:
   - Execute `npm install`
   - Execute `npm run build`
   - Arraste a pasta `dist` gerada para o painel da Netlify.

2. **Via Conexão GitHub**:
   - Build Command: `npm run build`
   - Publish Directory: `dist`
   - Adicione as Variáveis de Ambiente no painel (Site Settings -> Env Vars):
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_PUBLISHABLE_KEY`

---

### Opção 2: Vercel (GitHub/GitLab)

1. Suba o projeto para um repositório Git.
2. No painel da Vercel, clique em "New Project".
3. Selecione o repositório.
4. **Configurações de Build**:
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. **Environment Variables**:
   - Adicione `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY`.
6. Clique em "Deploy".

---

## Estrutura de Links Após Publicação

Após o deploy, sua URL pública seguirá este padrão de roteamento (HashRouter):

- **Login Recepção**: `https://sua-url.netlify.app/#/recepcao/login`
- **Dashboard**: `https://sua-url.netlify.app/#/recepcao/dashboard`
- **Link do Cliente**: `https://sua-url.netlify.app/#/cliente/token-do-cliente`

## Notas
- O uso de `HashRouter` garante que o roteamento funcione perfeitamente sem necessidade de configurações extras de redirecionamento (`_redirects` ou `vercel.json`).
