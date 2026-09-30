# Research: Site da Fornada Padaria com pedido pelo WhatsApp

Decisões técnicas da Fase 0. Nenhum `NEEDS CLARIFICATION` ficou em aberto.

## R1. Fontes (Fraunces + Figtree) com `next/font/google`

- **Decision** (revista na verificação): duas chamadas da Fraunces com `axes: ['SOFT']` — normal
  (`--font-fraunces`, com preload) e itálico (`--font-fraunces-italico`, `preload: false`, usada só
  pela palavra de destaque). Com `opsz` e os dois estilos pré-carregados eram 264 KB de fonte
  disputando banda com a foto do hero; o Lighthouse mobile subiu de 84 para 91. Mais
  `Figtree({ subsets: ['latin'], variable: '--font-figtree', display: 'swap' })`. As duas são
  variáveis (conferido em `next/dist/compiled/@next/font/dist/google/font-data.json`: Fraunces tem
  eixos SOFT, WONK, opsz e wght; Figtree tem wght 300–900), então `weight` fica omitido. No
  `globals.css`, `@theme inline { --font-display: var(--font-fraunces); --font-sans: var(--font-figtree); }`.
  O eixo SOFT é ligado por `font-variation-settings: "SOFT" 100` só no h1 (utilitário `display-soft`).
- **Rationale**: self-hosted, sem `<link>` externo (constituição IV), e resolve o ponto fraco 19
  (fonte que não carrega). O itálico é necessário para a assinatura (palavra em itálico com
  sublinhado ondulado).
- **Alternatives**: `<link>` do Google Fonts como na auditoria (proibido); fonte estática com pesos
  fixos (perde o eixo SOFT).
- **Fonte**: `node_modules/next/dist/docs/01-app/03-api-reference/02-components/font.md`
  (seções `axes`, `variable`, "With Tailwind CSS").

## R2. Imagens no Next 16

- **Decision**: `next/image` com `width`/`height` lidos do manifesto; só o hero usa
  `preload` (substituto de `priority`, depreciado no 16) ou `fetchPriority="high"` +
  `loading="eager"`. Com `fill`, sempre `sizes`. `images.qualities` fica no padrão `[75]`.
- **Rationale**: resolve o ponto fraco 12 (hero PNG de 3–4 MB). O otimizador entrega AVIF/WebP.
- **Fonte**: `.../02-components/image.md` (linhas sobre `preload` e `priority`).

## R3. Testes da lógica pura sem dependência

- **Decision**: Node 22.23 roda TypeScript por *type stripping* (`process.features.typescript ===
  'strip'`). Os módulos de `src/lib/` e `src/content/` usados pelos testes importam uns aos outros
  com extensão `.ts` explícita e caminho relativo; `tsconfig.json` ganha
  `"allowImportingTsExtensions": true` (permitido porque `noEmit: true`). Script:
  `"test": "node --test src/lib/*.test.ts"`. Proibido nesses módulos: `enum`, `namespace`,
  parameter properties e o alias `@/` (o Node não resolve).
- **Rationale**: a constituição exige teste da montagem da mensagem, sem trazer Jest/Vitest.
- **Alternatives**: Vitest (dependência extra, YAGNI); testar só no navegador (não cobre fuso,
  centavos e bordas).

## R4. Dinheiro

- **Decision**: todos os preços em centavos inteiros (`number`). Formatação por um único
  `Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })`. O separador entre "R$" e o
  número é um NBSP (U+00A0) no Node e no navegador; os testes normalizam para espaço comum antes de
  comparar, e a mensagem do WhatsApp troca NBSP por espaço comum.
- **Rationale**: evita 0,1 + 0,2 e o "$" vs "R$" da referência (ponto 4).

## R5. Fuso e status de funcionamento

- **Decision**: a hora "da padaria" vem de `Intl.DateTimeFormat('en-CA', { timeZone:
  'America/Sao_Paulo', hourCycle: 'h23', year, month, day, hour, minute, weekday })` e vira
  `{ data: 'AAAA-MM-DD', diaSemana: 0–6, minutos: 0–1439 }`. Toda regra (aberto/fechado, horários
  disponíveis) trabalha em "minutos do dia" + data, sem objetos `Date` com fuso local.
  `agora` sempre entra como parâmetro (testável).
- **Hidratação**: o status depende da hora do visitante e o site é estático, então o componente
  de status é Client Component que no servidor renderiza o resumo fixo ("Seg a sáb, 7h às 20h ·
  Dom, 7h às 13h") e troca pelo status real em `useEffect`. Sem `suppressHydrationWarning`.
- **Alternatives**: calcular no build (congelaria o status); lib de datas (YAGNI).

## R6. Estado da sacola

- **Decision**: `useReducer` com reducer puro em `src/lib/sacola.ts` + Context em
  `src/components/sacola/SacolaProvider.tsx`. Persistência em `localStorage` (chave
  `fornada:sacola:v1`) por `src/lib/armazenamento.ts` (try/catch em tudo; JSON inválido = sacola
  vazia). Ao hidratar, `reconciliar(itens, cardapio)` descarta produtos/variações que não existem e
  limita quantidade a 1–20. Preço NUNCA é salvo; sempre lido do cardápio.
- **Hidratação**: o Provider começa vazio e carrega o storage em `useEffect` (primeira renderização
  do servidor e do cliente iguais).
- **Rationale**: constituição VII (sem lib de estado), I (storage só conveniência).

## R7. Gaveta da sacola e menu mobile

- **Decision**: elemento nativo `<dialog>` aberto com `showModal()`: dá fundo inerte, Esc e
  `::backdrop` de graça. Complementos: travar scroll do `body` enquanto aberto, devolver o foco ao
  gatilho no `close`, `aria-labelledby` no título. A gaveta tem 2 passos internos ("Sua sacola" →
  "Seus dados") com o foco movido para o título do passo a cada troca.
- **Rationale**: menos código e menos bugs que um focus-trap manual; resolve o ponto 17.
- **Alternatives**: portal + focus trap próprio; biblioteca (proibida).

## R8. Anúncios para leitor de tela

- **Decision**: uma única região `<div role="status" aria-live="polite">` no Provider; o reducer não
  sabe dela — o Provider escreve a frase ("Croissant adicionado. 3 itens, R$ 34,00.") depois de cada
  ação. O mesmo texto aparece num toast visual de 3 s (com botão "Desfazer" quando for remoção,
  por 6 s).

## R9. Barra de categorias com indicação da atual

- **Decision**: `position: sticky` logo abaixo do header (top = altura do header, 64px), altura
  máxima 56px, rolagem horizontal com `scroll-snap` no mobile. Categoria ativa por
  `IntersectionObserver` com `rootMargin` compensando header + barra; links são âncoras reais
  (`#cat-paes`) e as seções têm `scroll-margin-top` = 64 + 56 + 8px. Com JS desligado os links
  continuam funcionando.
- **Rationale**: pontos 14 e 16 (categoria sem âncora; 230px de barras fixas).

## R10. Link do WhatsApp

- **Decision**: `https://wa.me/<numeroSóDígitos>?text=<encodeURIComponent(texto)>`. Quebras de linha
  viram `%0A` pelo próprio `encodeURIComponent`. Emoji só no cabeçalho da mensagem (🥖). Aberto com
  `window.open(url, '_blank', 'noopener,noreferrer')`; se o navegador bloquear (retorno `null`), a
  tela de confirmação mostra o link clicável como plano B.
- **Rationale**: FR-017/019, SC-004.

## R11. Horários agendáveis

- **Decision**: função pura `horariosDisponiveis({ agora, funcionamento, modo, temEncomenda })`
  devolve dias (até 3 dias corridos; com encomenda, de agora + 48h até 14 dias) e, por dia, slots
  de 30 min entre `abre + preparo` e `fecha - 30min`, a partir de `agora + preparo` (retirada 20 min,
  entrega 40 min), arredondando para cima. "Assim que possível" só existe se a padaria está aberta,
  sem encomenda, e `agora + preparo <= fecha - 30min`.

## R12. Placeholders e manifesto

- **Decision**: igual ao Dom Tomás: `scripts/manifesto-imagens.json` é a fonte de verdade
  (arquivo, largura, altura, uso, alt); `scripts/gerar-placeholders.mjs` com `sharp`
  (devDependency) gera JPEG com as dimensões exatas, nas cores dos tokens, com nome e tamanho
  escritos. `src/content/imagens.ts` importa o JSON (`resolveJsonModule`) para dar
  `width/height/alt` ao `next/image`.
- **Rationale**: trocar placeholder por foto final sem mudar código (constituição V).

## R13. Metadata e JSON-LD

- **Decision**: `metadata` no `layout.tsx` com `metadataBase` (`https://fornada.example`),
  Open Graph com `og.jpg` 1200×630; JSON-LD `Bakery` com endereço, telefone, `openingHoursSpecification`
  e `priceRange`, serializado com `.replace(/</g, '\\u003c')`.
- **Fonte**: `01-app/02-guides/json-ld.md`.
