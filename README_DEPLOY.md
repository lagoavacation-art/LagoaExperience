# Lagoa Experience - Manual de Deploy (GitHub + Vercel)

Este projeto está configurado para uma integração nativa entre **GitHub** e **Vercel**.

## Configuração Automática (Recomendado)

1. **GitHub**:
   - Suba este código para o seu repositório: `https://github.com/lagoavacation-art/LagoaExperience.git`

2. **Vercel**:
   - Importe o repositório do GitHub.
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Adicione as Variáveis de Ambiente:
     - `VITE_SUPABASE_URL`: `https://gkhphchabrrxvastrkyp.supabase.co`
     - `VITE_SUPABASE_PUBLISHABLE_KEY`: `sb_publishable_kasq7letpyPu4RNhIQZWhQ_Mcx4rIxS`

## Estrutura de Rotas (HashRouter)

A aplicação utiliza `HashRouter`, o que garante que as rotas funcionem diretamente na Vercel sem necessidade de redirecionamentos complexos:

- **Login**: `https://lagoa-experience.vercel.app/#/recepcao/login`
- **Dashboard**: `https://lagoa-experience.vercel.app/#/recepcao/dashboard`
- **Cliente**: `https://lagoa-experience.vercel.app/#/cliente/TOKEN`

## Notas Técnicas
- O projeto é puramente estático.
- Não requer Docker, Express ou Cloud Run.
- Toda alteração na branch `main` disparará um deploy automático na Vercel.
