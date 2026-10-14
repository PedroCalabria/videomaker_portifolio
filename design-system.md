# design-system.md — Concreto (exportado do artifact do usuário)

Concreto é o sistema do portfólio de uma pessoa editora de vídeo: **preciso · industrial · confiante**. Engenharia exibida com contenção — muito vazio, pouca cor, linhas finas de 1px, anotações técnicas e um único ponto de laranja que comanda o olhar. A linguagem é editorial técnica; o vocabulário visual vem da ilha de edição (timecode, enquadramento, trilho de timeline).

## Voz e conteúdo

- Português do Brasil, primeira pessoa do singular, frases curtas e concretas: "Edito filmes, campanhas e documentários." Nada de superlativos ("o melhor", "incrível") nem exclamações.
- Títulos display sempre em **caixa-alta**, 2–3 linhas, com a última linha em outra cor: `CORTES QUE / CONTAM / HISTÓRIAS.`
- Labels, botões, índices e metadados em mono, caixa-alta via CSS — escreva o texto em caixa normal no código ("Ver trabalhos").
- Botões começam com verbo: "Ver trabalhos", "Assistir showreel", "Baixar CV", "Falar comigo".
- Termos de ofício ficam como o mercado usa: showreel, color grading, motion, master, timeline.
- Sem emoji. Números de estatística são reais e verificáveis; os da amostra são ilustrativos.

## Elementos de assinatura (use com consistência)

- **Índice de seção** `/ 01`, `/ 02` com o número em `accent-strong` → `SectionIndex`.
- **Rótulos entre colchetes** `[ PROJETO EM DESTAQUE ]`, contadores `[ 02 ]` → `Bracket`.
- **Leituras técnicas** em mono micro: timecode `TC 00:01:24:12`, duração, specs `24 FPS · 4K · 2.39:1`, coordenadas da cidade `8.0476° S  34.8770° W` → `Readout`.
- **Cruzetas `+`** nos cantos de cards, **cantos de enquadramento** sobre vídeo e **mira ⌖** como marcador → `Crosshair`.
- **Grid aparente**: colunas e blocos divididos por linhas de 1px `line`.
- **Canto chanfrado a 45°** (`chamfer`, 40px) em painéis de hero, no player e em blocos de destaque → `ChamferPanel`, classe `chamfer`.

## Cor

- Neutros de concreto e grafite + **um único acento**: `accent` (Signal Orange). Não crie outros acentos.
- O acento ocupa no máximo **5–8% da tela**: uma linha de título, um CTA, um detalhe gráfico. Use `Button variant="accent"` uma vez por viewport.
- `accent` sobre `bg` claro dá 2,78:1: use-o só em preenchimentos e títulos ≥ 48px. Texto laranja pequeno é sempre `accent-strong` (4,6:1 claro · 7,6:1 escuro). Evite `accent-strong` pequeno sobre `surface-alt` (4,15:1).
- Texto sobre laranja é `on-accent` (preto, 5,9:1). Branco sobre laranja só em texto grande e bold.
- Texto: `text` (principal), `text-2` (secundário e labels mono), `text-muted` (só a linha apagada de títulos display e marcas decorativas).
- Linhas: `line` para o grid aparente e divisórias; `line-strong` para bordas de controles.
- **Ritmo:** alterne seções claras e faixas `inverse` — hero claro → faixa de stats escura → trabalhos claros → footer escuro. Todo bloco `inverse` leva a classe `cc-inverse`, que remapeia `text`, `text-2`, `line`, `primary`, `accent-strong`, `success` e `danger` para os tokens `on-inverse`, `line-inverse`, `accent-on-inverse`… Os componentes funcionam dentro dele sem ajustes.
- **Vídeo:** quadro, letterbox e chips de timecode usam `frame` (quase preto nos dois temas) com `on-frame` / `on-frame-2`.
- **Feedback** é discreto e nunca compete com o laranja: `success` (ardósia) e `danger` (carmim), sempre com a palavra `[ OK ]` / `[ ERRO ]`.
- **Tema escuro:** mesmos nomes de token, ativado por `[data-theme="dark"]` no `<html>`.

## Tipografia

- Três famílias: **Inter Tight** 500/600 (`font-display`) para títulos; **Inter** 400/500 (`font-body`) para corpo; **JetBrains Mono** 400 (`font-mono`) para tudo que é utilitário — botões, nav, índices, timecodes, preços, coordenadas.
- Escala: `display-xl` (hero) · `display-l` (abertura de seção) · `h1` (títulos de seção, números de stats) · `h2` · `h3` (títulos de card) · `h4` · `body-l` · `body` · `body-s` · `label` (12px, tracking .12em) · `micro` (10px, tracking .16em).
- Display é fluido: os componentes usam `fs-display-xl`, `fs-display-l`, `fs-h1`, `fs-h2` (clamp); a tabela de estilos mostra o teto desktop.
- Display: caixa-alta, entrelinha .92–1.05, tracking negativo. Nunca mais de uma linha colorida por título.
- Medida máxima de texto corrido: `measure` (52ch). Parágrafo sob título: classe `cc-lead` (`body-l` em `text-2`).

## Espaço e grid

- Base 4px, ritmo 8px: `space-0-5` (4) · `space-1` (8) · `space-1-5` (12) · `space-2` (16) · `space-3` (24) · `space-4` (32) · `space-6` (48) · `space-8` (64) · `space-12` (96) · `space-16` (128) · `space-20` (160).
- Grid de 12 colunas (`cc-grid`), `gutter` 24px, margem lateral `margin` (48 / 24 / 16px), container `container` 1440px (`cc-container`).
- Seções: `cc-section` aplica `section-y-lg` 128px · `section-y-md` 96px (≤ 1023px) · `section-y-sm` 64px (≤ 640px).
- Cards: padding 24–32px (`space-3`/`space-4`). Controles: altura `control-h` 48px, padding lateral 16–24px.
- Muito espaço negativo: na dúvida, aumente o respiro em vez de adicionar elementos.

## Raio, chanfro e sombra

- O sistema é anguloso. `radius-0` é o padrão para botões, inputs, selects, tags, faixas e o player.
- `radius-sm` (4px) só em miniaturas; `radius-md` (12px) em painéis e cards de destaque; `radius-full` só em botões de ícone circulares.
- `chamfer` (40px, faixa 32–48px) corta um canto a 45° via `clip-path` — painéis de hero, player e blocos de destaque. Não combine chanfro com borda.
- Sombras quase não existem: `shadow-none` por padrão; `shadow-float` só para um card em foco num carrossel ou elementos flutuantes (no escuro vira borda de 1px + brilho interno). Profundidade vem de contraste e linhas.
- Foco de teclado: `focus-ring` — 2px na cor da página + 2px sólidos (`accent-strong` no claro para atingir 3:1, `accent` no escuro).

## Fotografia e vídeo

- Stills e posters em P&B ou dessaturados, alto contraste: concreto, metal, arquitetura, luz dura, rostos em contraluz.
- O **único elemento colorido permitido na imagem é laranja** — uma luz, um cabo, um figurino. Gradue os stills para isso antes de publicar.
- Proporções: 16:9 por padrão; 2.39:1 para trechos de cinema; 4:5 ou 9:16 para conteúdo de redes (`ProjectCard ratio`).
- Todo vídeo vive num quadro `frame` com HUD em mono: rótulo entre colchetes, specs, timecode, barra de progresso de 1px.

## Iconografia

- Não há biblioteca de ícones de marca: o sistema traz um conjunto mínimo próprio (`Icon`) — traço 1.5px, pontas quadradas, grid 24px: setas, `+`, fechar, menu, chevron, play, pause, mira.
- Ícones herdam `currentColor`. Use-os quase só em botões; o resto da sinalização é tipográfica (`+`, `/`, `[ ]`).
- Redes sociais aparecem como siglas em texto ("Vimeo", "IG", "YT", "IN"), nunca como logotipos.
- **Sem logotipo:** este sistema não recebeu marca. O nome da pessoa é composto em Inter Tight 600 caixa-alta (ver `Nav` e `Footer`).

## Movimento

Mecânico e preciso — como uma máquina, nunca elástico. Sem spring, bounce ou rotação.

- Curvas (em `bundle.css`): `--ease-out` `cubic-bezier(.22,1,.36,1)` para entradas; `--ease-inout` `cubic-bezier(.65,0,.35,1)` para mudanças de estado.
- Durações: `--dur-micro` 150ms · `--dur-ui` 300ms · `--dur-reveal` 600ms · `--dur-hero` 900ms · `--stagger` 80ms.
- Entradas (via `Reveal`, `DisplayTitle`, `StatStrip`, `Readout`): títulos por máscara linha a linha com stagger 80ms; divisórias desenhadas com `scaleX` em 800ms **antes** do conteúdo; imagens com `clip-path` + `scale(1.08 → 1)` em 900ms; stats contando por 1.2s; labels mono com scramble de 300ms; grupos de cards com stagger 100ms e 24px.
- Scroll: dispara a 20% do viewport, uma vez. Índice de seção sticky (`SectionIndex sticky`). Barra lateral de progresso (`ScrollProgress fixed`). Parallax do still do hero a 0.85x, máximo 60px: `el.style.transform = 'translateY(' + Math.max(-60, Math.min(60, rect.top * -0.15)) + 'px)'` num listener de scroll passivo.
- Hover: setas deslocam 4px; preenchimento de botão varre da esquerda (300ms); card: still `scale(1.04)` e borda `accent`.
- `prefers-reduced-motion: reduce`: sem deslocamentos nem escalas; só opacidade em 200ms (já tratado no `bundle.css`).

## Usando no código

- Carregue `tokens.css`, `components/bundle.css`, React 18 e `components/bundle.js`; os componentes ficam em `window.Concreto` (`Concreto.Button`, `Concreto.ShowreelPlayer`…). Tipos e props em `components/index.d.ts`.
- Classes utilitárias do bundle: `cc-section`, `cc-container`, `cc-grid`, `cc-measure`, `cc-lead`, `cc-t-label`, `cc-t-micro`, `cc-inverse`, `chamfer` / `cc-chamfer--tr|tl|br|bl`.
- A página de amostra `PortfolioHome` mostra a ordem recomendada da home: Nav → hero (título + showreel) → faixa de stats → trabalhos → processo → CTA laranja chanfrado → footer.

## Acessibilidade

- Contraste verificado nos dois temas para todo par de texto anotado nos tokens. Três pares do brief ficam abaixo do piso e estão mantidos com aviso: `accent` em `bg` claro (2,78:1 — só ≥ 48px/preenchimento), `text-muted` em `bg` claro (2,85:1 — só display ≥ 36px, de preferência ≥ 48px) e `accent-strong` em `surface-alt` claro (4,15:1 — não use para texto pequeno).
- Estados nunca dependem só de cor: erro e sucesso levam `[ ERRO ]` / `[ OK ]`; item ativo da nav tem `aria-current`.
- Todo botão de ícone exige `label`. Readouts embaralhados expõem o texto final para leitores de tela.


## Tokens de cor (claro / escuro)

| token | claro | escuro | uso |
|---|---|---|---|
| `bg` | #EDECE9 | #0B0B0B | Fundo da página. Seções claras alternam com faixas `inverse` para dar ritmo. |
| `surface` | #F6F5F2 | #151515 | Cards, painéis, campos de formulário — um degrau acima de `bg`. |
| `surface-alt` | #E2E1DD | #1E1E1E | Faixas alternativas, tags sólidas, fundo de miniatura. Evite texto `accent-strong` pequeno aqui (4,15:1 no claro). |
| `inverse` | #0D0D0D | #F2F1EE | Bloco invertido: faixa de estatísticas, footer, painéis de contraste. Sempre com a classe `cc-inverse` para remapear o texto. |
| `primary` | #0D0D0D | #F2F1EE | CTA principal e texto forte. O rótulo sobre ele usa `bg` (16:1). |
| `secondary` | #3A3A38 | #C9C8C4 | Grafite: ícones, hover neutro, blocos secundários. Como texto, legível em `bg`, `surface` e `surface-alt` (≥ 8:1). |
| `accent` | #FF4F1A | #FF5A26 | Signal Orange, o ÚNICO acento: um CTA, uma linha de título, um detalhe gráfico por tela (≤ 5–8%). Em `bg` claro dá 2,78:1 — só preenchimentos e títulos ≥ 48px; abaixo do piso de 3:1, mantido do brief. No escuro, 6,3:1. |
| `accent-strong` | #C2380A | #FF7A4D | Texto laranja pequeno (índices, links, rótulos) em `bg` e `surface`: 4,6:1 no claro, 7,6:1 no escuro. |
| `on-accent` | #0D0D0D | #0B0B0B | Texto e ícones sobre preenchimento `accent` (5,9:1 claro · 6,3:1 escuro). Branco sobre laranja só em texto grande e bold. |
| `text` | #0D0D0D | #F2F1EE | Texto principal em `bg`, `surface` e `surface-alt` (≥ 14:1 nos dois temas). |
| `text-2` | #5C5C5A | #A3A3A0 | Texto secundário, labels mono e metadados em `bg`, `surface` e `surface-alt` (≥ 5,1:1). |
| `text-muted` | #8C8C89 | #6E6E6B | Última linha apagada de títulos display (≥ 36px) e cruzetas decorativas. Nunca em texto corrido. Claro em `bg`: 2,85:1 — valor do brief, abaixo do piso de 3:1; prefira `surface` (3,1:1) ou use tamanhos ≥ 48px. |
| `line` | #CFCDC8 | #2A2A2A | Linhas finas de 1px: grid aparente, divisórias, borda de cards. Decorativa — não serve como borda de controle. |
| `line-strong` | #7E7E7B | #6E6E6B | Borda de inputs e controles que precisam ser percebidos (≥ 3,4:1 em `bg` e `surface`). Adição ao brief: `line` fica em 1,3:1. |
| `on-inverse` | #F2F1EE | #0D0D0D | Texto principal dentro de blocos `inverse` (aplicado pela classe `cc-inverse`). |
| `on-inverse-2` | #A3A3A0 | #5C5C5A | Texto secundário e labels mono em `inverse` (7,7:1 claro · 5,9:1 escuro). |
| `on-inverse-muted` | #6E6E6B | #858582 | Linha apagada de títulos e bordas de campo dentro de `inverse` (≥ 3,3:1). |
| `line-inverse` | #2A2A2A | #CFCDC8 | Divisórias de 1px dentro de `inverse` (colunas de stats, footer). |
| `accent-on-inverse` | #FF5A26 | #C2380A | Texto laranja pequeno sobre `inverse` ou `primary` — contador do CTA da nav, links do footer (6,2:1 claro · 4,8:1 escuro). |
| `frame` | #0D0D0D | #050505 | Quadro de vídeo: letterbox do player, fundo de miniaturas, chips de timecode. Sempre quase preto, nos dois temas. |
| `on-frame` | #F2F1EE | #F2F1EE | Texto do HUD sobre `frame` (17:1). |
| `on-frame-2` | #A3A3A0 | #A3A3A0 | Timecode e labels secundários sobre `frame` (7,7:1). |
| `frame-line` | #3A3A38 | #3A3A38 | Trilho da barra de progresso e marcas de enquadramento sobre `frame`. |
| `success` | #35566B | #8DB3C9 | Feedback de sucesso, discreto (ardósia, fora do eixo vermelho–verde). Sempre com a palavra `[ OK ]`. ≥ 6,6:1 em `bg`/`surface`. |
| `danger` | #A12D3A | #EE8A8F | Feedback de erro, discreto (carmim, longe do laranja). Sempre com a palavra `[ ERRO ]`. ≥ 6:1 em `bg`/`surface`. |
| `success-on-inverse` | #8DB3C9 | #35566B | `success` dentro de blocos `inverse` (aplicado por `cc-inverse`). |
| `danger-on-inverse` | #EE8A8F | #A12D3A | `danger` dentro de blocos `inverse` (aplicado por `cc-inverse`). |

## Estilos de texto (tokens)

- `display-xl` (display): 128px / 0.92 / 500 / tracking -0.03em — Título do hero. Fluido: `fs-display-xl` = clamp(56px, 8vw, 128px). Caixa-alta.
- `display-l` (display): 88px / 0.95 / 500 / tracking -0.025em — Abertura de seção. Fluido: `fs-display-l` = clamp(44px, 6vw, 88px).
- `h1` (display): 64px / 1.0 / 500 / tracking -0.02em — Títulos de seção e números de estatística. Fluido: `fs-h1` = clamp(36px, 4.5vw, 64px).
- `h2` (display): 44px / 1.05 / 500 / tracking -0.015em — Subseções. Fluido: `fs-h2` = clamp(28px, 3.2vw, 44px).
- `h3` (display): 24px / 1.15 / 500 / tracking -0.01em — Títulos de card. Caixa normal.
- `h4` (display): 18px / 1.25 / 600 / tracking 0em — Itens de lista, nomes em créditos.
- `body-l` (body): 18px / 1.55 / 400 / tracking 0 — Parágrafo de destaque sob títulos.
- `body` (body): 16px / 1.6 / 400 / tracking 0 — Texto corrido.
- `body-s` (body): 14px / 1.5 / 400 / tracking 0 — Descrições de card, links do footer.
- `label` (mono): 12px / 1.3 / 400 / tracking 0.12em — Botões, navegação, rótulos.
- `micro` (mono): 10px / 1.3 / 400 / tracking 0.16em — Índices, timecodes, coordenadas, metadados.

## fluid

- `fs-display-xl`: clamp(56px, 8vw, 128px)
- `fs-display-l`: clamp(44px, 6vw, 88px)
- `fs-h1`: clamp(36px, 4.5vw, 64px)
- `fs-h2`: clamp(28px, 3.2vw, 44px)

## layout

- `container`: 1440px
- `gutter`: 24px
- `margin`: clamp(16px, 4vw, 48px)
- `section-y-lg`: 128px
- `section-y-md`: 96px
- `section-y-sm`: 64px
- `control-h`: 48px
- `measure`: 52ch

## radius

- `radius-0`: 0px
- `radius-sm`: 4px
- `radius-md`: 12px
- `radius-full`: 999px
- `chamfer`: 40px

## spacing

- `space-0-5`: 4px
- `space-1`: 8px
- `space-1-5`: 12px
- `space-2`: 16px
- `space-3`: 24px
- `space-4`: 32px
- `space-6`: 48px
- `space-8`: 64px
- `space-12`: 96px
- `space-16`: 128px
- `space-20`: 160px