# Implementation Plan: Site da Fornada Padaria com pedido pelo WhatsApp

**Branch**: `001-site-pedidos-whatsapp` | **Date**: 2026-09-29 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-site-pedidos-whatsapp/spec.md`

## Summary

Site one-page estático de uma padaria fictícia. Estilo inspirado no Benjamin a Padaria (serifa
calorosa, foto de produto protagonista, paleta quente e curta, cantos retos, muito respiro), com
sistema visual próprio (Fraunces + Figtree; casca, miolo, trigo, brasa, alecrim, mel). O coração é
o pedido: cardápio com preço → sacola (gaveta `<dialog>`) → dados do pedido → WhatsApp com a
mensagem pronta. A lógica (dinheiro em centavos, sacola, horários com fuso, validação, mensagem) é
TypeScript puro em `src/lib/`, testado com `node --test`. Os 22 pontos fracos da auditoria estão
rastreados na spec. Fundação sequencial; depois, blocos de seções em paralelo, cada um dono dos
seus arquivos.

## ⚠️ Leitura obrigatória antes de codar (Next.js 16.3.7)

`AGENTS.md`: "This is NOT the Next.js you know". Ler em `node_modules/next/dist/docs/`:

| Assunto | Arquivo |
|---|---|
| Fontes | `01-app/03-api-reference/02-components/font.md` (`axes`, `variable`, "With Tailwind CSS") |
| Imagens | `01-app/03-api-reference/02-components/image.md` (`preload`; `priority` está depreciado) |
| Metadata | `01-app/03-api-reference/04-functions/generate-metadata.md` |
| JSON-LD | `01-app/02-guides/json-ld.md` |

## Technical Context

**Language/Version**: TypeScript 5 (strict), React 19.2.8, Node 22.23.

**Primary Dependencies**: Next.js 16.3.7 (App Router, `src/`), Tailwind CSS v4, `lucide-react`
(a adicionar). Dev: `sharp` (placeholders). Sem libs de UI, estado ou animação.

**Storage**: `localStorage` só como conveniência (sacola `fornada:sacola:v1`, dados opcionais
`fornada:dados:v1`), com try/catch (research R6).

**Testing**: `node --test src/lib/*.test.ts` (type stripping, research R3); ESLint; `next build`;
Playwright MCP (390/1440/360) seguindo [quickstart.md](./quickstart.md); Lighthouse mobile.

**Target Platform**: navegadores modernos (últimas 2 versões, iOS Safari 16+), 360 → 1440px+.

**Project Type**: web, one-page estática (rota única `/`).

**Performance Goals**: Lighthouse mobile ≥ 90 / 95 / 95 / 95; LCP < 2,5 s; CLS < 0,05; primeira
dobra < 1 MB.

**Constraints**: sem backend; WCAG 2.1 AA; alvos ≥ 44px; sem scroll horizontal; sem autoplay;
`prefers-reduced-motion`; nada do Benjamin reutilizado.

**Scale/Scope**: 1 página, 9 seções, 22 produtos, ~27 imagens, ~35 componentes, 5 módulos de lógica.

## Sistema visual

Fonte: `docs/referencia/benjamin-auditoria.md` seção (e). Resumo normativo:

### Tokens (`src/app/globals.css`)

```css
@theme {
  --color-casca: #3B2418;   --color-miolo: #FBF6EC;  --color-trigo: #EFDDB5;
  --color-brasa: #B83A12;   --color-brasa-escura: #962E0C;
  --color-alecrim: #1F6B47; --color-alecrim-escuro: #185839;
  --color-mel: #E0A43A;     --color-cinza-forno: #6B5B50; --color-linha: #8F7A66;
  --color-papel: #FFFFFF;   --color-erro: #B3261E;
  --radius-card: 2px; --radius-botao: 4px; --radius-pill: 999px;
  --shadow-header: 0 1px 0 rgb(59 36 24 / .08);
  --shadow-gaveta: 0 -8px 24px rgb(59 36 24 / .12);
  --ease-marca: cubic-bezier(.22,.61,.36,1);
  --breakpoint-*: initial; --breakpoint-sm: 36rem; --breakpoint-md: 48rem;
  --breakpoint-lg: 64rem; --breakpoint-xl: 80rem;
}
@theme inline { --font-display: var(--font-fraunces); --font-sans: var(--font-figtree); }
```

Mais variáveis de layout em `:root`: `--header-h: 64px; --cats-h: 56px; --maxw: 1120px;
--sec-y: clamp(56px, 8vw, 112px)`. Sem tema escuro (constituição VII: YAGNI); `color-scheme: light`.

Regras de cor: `brasa` como texto só sobre miolo/papel (sobre trigo só texto grande); `mel` nunca é
texto sobre claro; botão WhatsApp em `alecrim` com texto branco (6,46:1); bordas de campo em
`linha` (3,79:1); erro `#B3261E` sobre miolo (≥ 5,9:1 — conferir na verificação).

### Tipografia (utilitários `@utility`)

| Utilitário | Uso | Valor |
|---|---|---|
| `titulo-1` | h1 | Fraunces 600, SOFT 100, `clamp(2.25rem, 5.5vw, 4rem)`, lh 1.05, ls -0.02em |
| `titulo-2` | h2 | Fraunces 500, `clamp(1.75rem, 3.6vw, 2.75rem)`, lh 1.1, ls -0.01em |
| `titulo-3` | h3 card | Figtree 600, `clamp(1.0625rem, 1.4vw, 1.25rem)`, lh 1.3 |
| `kicker` | acima do título | Figtree 600, 12px, uppercase, ls 0.08em, cor brasa |
| `texto` | corpo | Figtree 400, 16→17px, lh 1.55 |
| `legenda` | descrição curta | Figtree 500, 14px, lh 1.4, cinza-forno |
| `preco` | preços | Figtree 700, 18→20px, `tabular-nums`, `nowrap` |
| `destaque` | palavra-assinatura | Fraunces itálico + `text-decoration: underline wavy var(--color-mel) 2px; text-underline-offset: .18em` |

### Layout e componentes

- Container 1120px; gutter 20px (mobile) / 32px (≥ md). Seções `padding-block: var(--sec-y)`.
- Ritmo de fundos: miolo → trigo → miolo … → casca (rodapé). Uma faixa escura no máximo antes do
  rodapé (a seção Entrega pode usar casca com texto miolo).
- Cantos 2px em cards e fotos, 4px em botões, pílula só em chips e contador. Sem sombra em cards.
- Botões: altura 48px (primário), 44px mínimo em qualquer controle. Primário `brasa` com texto
  branco; hover `brasa-escura`; secundário borda 1.5px `casca`; WhatsApp `alecrim` + ícone.
- Foco: `:focus-visible { outline: 3px solid var(--color-brasa); outline-offset: 2px }`; sobre casca
  o anel é `mel`.
- Movimento: fade/subida ≤ 12px em 200ms; nenhum autoplay; tudo desliga em reduced motion.
- Ícones Lucide com `strokeWidth={1.5}`; logo "Fornada" em texto Fraunces + um pequeno símbolo
  SVG próprio (espiga estilizada), nada do Benjamin.

### Ordem das seções (`page.tsx`) e fundos

| # | Seção | Âncora | Fundo | Notas |
|---|---|---|---|---|
| 1 | Header (sticky 64px) | — | miolo | logo, nav, status, WhatsApp, sacola |
| 2 | Hero | `#inicio` | miolo | split 5/7: h1 "Pão *de verdade*, saindo agora", apoio, 2 CTAs, foto 4:5; status repetido sob os CTAs |
| 3 | Os mais pedidos | `#queridinhos` | trigo | 6 cards; mobile = rolagem horizontal com scroll-snap (sem autoplay) |
| 4 | Cardápio | `#cardapio` | miolo | barra de categorias sticky; desktop grid 3–4 col.; mobile lista compacta |
| 5 | Encomendas | `#encomendas` | trigo | foto 16:10, regras (48h, como funciona em 3 passos), 4 produtos com variações |
| 6 | Entrega e retirada | `#entrega` | casca | bairros + taxas, mínimo, tempo, retirada grátis |
| 7 | Sobre | `#sobre` | miolo | split 7/5 com foto 4:5 e 3 parágrafos |
| 8 | Onde estamos | `#onde-estamos` | trigo | endereço, horários 7 dias com hoje destacado, mapa (link), WhatsApp |
| 9 | Rodapé | — | casca | nav, contato, redes, aviso fictício |
| — | GavetaSacola + BarraSacolaMobile + Toast | — | papel | globais, montados pelo layout via Provider |

## Constitution Check

*GATE: antes da Fase 0 e revisto após a Fase 1.*

| Princípio | Como o plano cumpre | Status |
|---|---|---|
| I. Estático, pedido só pelo WhatsApp | Sem rotas de API; `montarMensagem`/`linkWhatsApp` puros e testados; storage com try/catch; centavos | ✅ |
| II. Inspirado sem cópia | Tokens e fontes próprios da seção (e); rastreabilidade dos 22 pontos na spec; textos e imagens inventados | ✅ |
| III. Acessibilidade | `<dialog>` nativo, foco, aria-live, alvos 48/44px, sem autoplay, headings 1 h1 | ✅ |
| IV. Performance/SEO | `next/font`, `next/image` com `preload` só no hero, metadata + JSON-LD `Bakery` | ✅ |
| V. Conteúdo como dado, seções isoladas | `src/content/*`, uma seção por arquivo, `CardProduto` em `components/produto` compartilhado, só a integração edita `page.tsx` | ✅ |
| VI. Verificação visual | quickstart com 390/1440/360, fluxo de pedido e Lighthouse | ✅ |
| VII. Simplicidade / Next real | Context + reducer, sem libs; docs do Next lidos (research R1, R2, R13) | ✅ |

Pós-design: nenhum desvio. Exceção registrada abaixo (imports `.ts` com extensão).

## Project Structure

### Documentation (this feature)

```text
specs/001-site-pedidos-whatsapp/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── mensagem-whatsapp.md
│   └── lib-e-componentes.md
├── checklists/requirements.md
└── tasks.md
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── layout.tsx            # fontes, metadata, JSON-LD, SacolaProvider, skip link, globais da sacola
│   ├── page.tsx              # só a integração edita
│   ├── globals.css           # tokens, utilitários, base
│   └── icon.svg              # favicon (símbolo próprio)
├── content/
│   ├── loja.ts  cardapio.ts  textos.ts  imagens.ts
├── lib/
│   ├── tipos.ts  dinheiro.ts  funcionamento.ts  sacola.ts  pedido.ts  mensagem.ts  armazenamento.ts
│   └── *.test.ts
└── components/
    ├── ui/        Container Botao TituloSecao Preco Selo Foto Icone Logo
    ├── produto/   CardProduto
    ├── sacola/    SacolaProvider useSacola AdicionarAoPedido ControleQuantidade
    │              GavetaSacola FormPedido Confirmacao BarraSacolaMobile
    └── sections/  Header (+ header/) Hero Queridinhos Cardapio (+ cardapio/) Encomendas
                   Entrega Sobre OndeEstamos Rodape
scripts/
├── manifesto-imagens.json
└── gerar-placeholders.mjs
public/images/ (+ produtos/)
docs/
├── referencia/ (auditoria + prints do Benjamin)
├── verificacao/ (prints e relatórios da Fornada)
└── prompts-imagens.md
```

**Structure Decision**: projeto único Next.js (App Router), rota única. Lógica pura isolada em
`src/lib/` para teste sem framework; UI dividida em fundação compartilhada + seções independentes.

## Estratégia de paralelismo (para `/speckit-tasks` e `/speckit-implement`)

1. **Fundação (sequencial, 1 agente)**: deps, tsconfig, tokens, fontes, layout, conteúdo, `src/lib`
   com testes, manifesto + placeholders, componentes `ui/`, `produto/CardProduto`, Provider e
   controles da sacola, `page.tsx` provisório.
2. **Blocos paralelos** (donos exclusivos):
   - **A**: Header (+ menu mobile, status, botão sacola), Hero, Queridinhos, Rodapé.
   - **B**: Cardápio + BarraCategorias.
   - **C**: GavetaSacola, FormPedido, Confirmacao, BarraSacolaMobile.
   - **D**: Encomendas, Entrega, Sobre, OndeEstamos.
   - **E**: `docs/prompts-imagens.md` (só docs; lê o manifesto).
3. **Integração e verificação (sequencial)**: `page.tsx` final, metadata/JSON-LD, quickstart
   completo, Lighthouse, correções.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|---|---|---|
| Imports com extensão `.ts` e `allowImportingTsExtensions` em `src/lib` e `src/content` | `node --test` precisa resolver os arquivos sem bundler | Vitest/Jest adicionaria dependência (constituição VII) |
