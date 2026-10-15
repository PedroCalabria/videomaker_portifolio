# Portfólio Flávio Calábria

Site de portfólio para captação e edição de vídeo (foco em reels, com suporte a 9:16, 16:9, 4:5 e 1:1).
React 18 + GSAP/ScrollTrigger, design system "Concreto".

Produção: **Vercel** (site + rotas `/api`) · **Supabase** (projetos, login, capas) · **Bunny Stream** (vídeos).
Os vídeos também podem ser links do YouTube/Vimeo; os dois modos convivem projeto a projeto.

## Rodar

```bash
npm install
npm run dev        # só o site; sem variáveis de ambiente usa dados de demonstração (localStorage)
npx vercel dev     # site + rotas /api, lendo o .env.local (precisa da CLI da Vercel)
npm run build      # gera dist/
```

Área do dono: `/#/admin`.

## Deploy, passo a passo

### 1. Supabase (banco, login, capas)

1. Crie um projeto em supabase.com (região São Paulo, se disponível).
2. **SQL Editor** → cole `supabase/schema.sql` → Run. Cria as tabelas, as regras de acesso e o bucket `posters`.
3. (Opcional) Rode `supabase/seed.sql` para o site abrir com os projetos de demonstração.
4. **Authentication → Providers → Email**: deixe ativo e **desligue "Allow new users to sign up"** (só o Flávio entra).
5. **Authentication → Users → Add user**: crie o usuário do Flávio com e-mail e senha.
6. No SQL Editor, libere esse usuário como dono:
   ```sql
   insert into public.admins (user_id) select id from auth.users where email = 'email-do-flavio@exemplo.com';
   ```
7. **Project Settings → API**: copie `URL`, `anon public` e `service_role` (esta é secreta).

### 2. Bunny Stream (vídeos)

1. Crie a conta em bunny.net (14 dias grátis) → **Stream → Add Video Library**.
2. Na biblioteca:
   - **Encoding**: resoluções 360p, 480p, 720p e 1080p (4K só se precisar; aumenta o armazenamento).
   - **Player**: cor principal `#FF4F1A`; desligue o botão de download.
   - **Security**:
     - *Allowed domains*: o domínio do portfólio (ex.: `flaviocalabria.com.br`) e o domínio `*.vercel.app` do projeto enquanto testa.
     - Ative **Embed view token authentication**.
     - Ative o bloqueio de acesso direto aos arquivos.
   - **API**: copie o *Library ID* e a *API Key*.
   - **Security**: copie a *Token authentication key* (é diferente da API Key).

### 3. Vercel (site + rotas)

1. Suba esta pasta para um repositório no GitHub e importe na Vercel (detecta Vite sozinha).
2. **Settings → Environment Variables**: cadastre as variáveis do `.env.example`.
   - `VITE_*` vão para o navegador (são públicas por natureza).
   - `SUPABASE_SERVICE_ROLE_KEY`, `BUNNY_API_KEY` e `BUNNY_TOKEN_KEY` ficam só no servidor. **Nunca** com prefixo `VITE_`.
3. Deploy. Depois, aponte o domínio próprio em **Settings → Domains** e inclua-o nos *Allowed domains* do Bunny.

### 4. Primeiro acesso

1. Abra `https://seu-dominio/#/admin` e entre com o e-mail e a senha do Flávio.
2. **Adicionar projeto** → em cada formato, **Enviar vídeo**: o arquivo vai direto do navegador ao Bunny,
   com barra de progresso; depois o Bunny processa (a área do dono acompanha e preenche a duração sozinha).
   Se não houver capa enviada, um quadro do próprio vídeo vira a capa.
3. Ou cole um link do YouTube/Vimeo no campo "Ou link do vídeo".

> Primeiro teste real: suba um vídeo curto e confira se o status chega a "[ OK ] Vídeo no Bunny Stream".
> A rota `api/videos/status.js` considera pronto quando o Bunny devolve status 4 **ou** progresso 100%;
> se a API mudar a numeração, ajuste as constantes no topo desse arquivo.

## Estrutura

```
api/                      rotas de servidor (Vercel Functions, Node 18+, sem dependências)
  _lib.js                 assinaturas do Bunny, checagem de dono no Supabase, utilitários
  videos/create.js        POST   cria o vídeo no Bunny e devolve a assinatura do upload (só dono)
  videos/embed.js         GET    link do player com token que expira em 1 h (público, só vídeos publicados)
  videos/status.js        GET    progresso do processamento (só dono)
  videos/delete.js        DELETE remove o vídeo do Bunny (só dono)
supabase/
  schema.sql              tabelas, regras de acesso (RLS) e bucket de capas
  seed.sql                projetos de demonstração (opcional)
src/
  App.jsx                 rotas (#/admin) e montagem das seções
  sections/               Header (nav, hero), Testimonials, Work (projetos + modal), Offers, Closing
  admin/Admin.jsx         área do dono: login, criar, editar, ordenar, remover, enviar vídeos
  components/ui.jsx       primitivos do design system; useMediaSrc resolve o vídeo de cada formato
  lib/store.js            escolhe a camada de dados (veja abaixo)
  lib/store-supabase.js   produção: Supabase + Bunny via /api
  lib/supabase-lite.js    cliente mínimo do Supabase (auth, REST, storage) via fetch
  lib/tus.js              upload TUS em blocos com progresso e nova tentativa
  lib/motion.js           animações GSAP; simplificadas em telas ≤ 640px
  data/content.js         textos, planos, pacotes, FAQ, depoimentos extras, número de WhatsApp
scripts/test_api.mjs      testes das rotas com Supabase e Bunny simulados (node scripts/test_api.mjs)
```

## Dados

Todo o site fala só com o store (`src/lib/store.js`), que escolhe sozinho:

| onde roda | store | dados |
|---|---|---|
| artifact do Claude | `artifact` | banco e arquivos do artifact |
| Vercel com `NEXT_PUBLIC_SUPABASE_*` | `supabase` | Supabase + Bunny |
| sem configuração | `local` | demonstração + localStorage |

Cada formato de vídeo de um projeto guarda **um** destes: `bunnyId` (Bunny Stream), `videoUrl` (link) ou `videoAsset` (arquivo do artifact).

## Segurança dos vídeos

- O link do player expira em 1 h e só abre nos domínios liberados no Bunny; copiado e aberto fora do site, não toca.
- A rota de embed só assina vídeos que estão em algum projeto publicado; prévias de vídeos ainda não salvos exigem login do dono.
- Limite: o que o navegador toca pode ser gravado da tela. Isso dificulta o compartilhamento, não impede cópia.

## Agendamento

O botão "Agendar pelo WhatsApp" abre o WhatsApp com nome, interesse e mensagem já escritos.
Troque `WHATSAPP` em `src/data/content.js` pelo número real.

## Conteúdo de demonstração

Preços, números, clientes, depoimentos e capas são fictícios. Substitua antes de publicar.
