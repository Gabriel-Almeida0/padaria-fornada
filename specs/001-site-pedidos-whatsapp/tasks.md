# Tasks: Site da Fornada Padaria com pedido pelo WhatsApp

**Input**: `specs/001-site-pedidos-whatsapp/` (plan, spec, research, data-model, contracts, quickstart)
**Tests**: exigidos pela constituição (I) para a lógica pura em `src/lib/`; a UI é verificada no
navegador (quickstart).

Formato: `- [ ] Txxx [P?] [USn?] descrição com caminho`. **Bloco** = dono exclusivo dos arquivos
(plano, "Estratégia de paralelismo"). Todo caminho é relativo à raiz do repositório.

Regras para quem implementa (valem para todas as tarefas):
- Ler `AGENTS.md` e o guia do Next indicado no plano antes de usar `next/font`, `next/image` ou
  `metadata`.
- Nenhum hex solto em componente; usar tokens. Nenhum texto da referência.
- Módulos em `src/lib/` e `src/content/{loja,cardapio,textos}.ts` importam com caminho relativo e
  extensão `.ts`; sem `enum`/`namespace`/`@/` (research R3). Componentes usam `@/`.
- Não fazer `git commit`.

---

## Phase 1: Setup

- [X] T001 Instalar `lucide-react` (dependência) e `sharp` (devDependency) e adicionar scripts `"test": "node --test src/lib/*.test.ts"` e `"placeholders": "node scripts/gerar-placeholders.mjs"` em `package.json`
- [X] T002 Adicionar `"allowImportingTsExtensions": true` em `tsconfig.json` e confirmar que `npm run build` continua passando
- [X] T003 Apagar o conteúdo de exemplo do create-next-app (`public/*.svg` de exemplo, estilos e JSX de demo em `src/app/page.tsx`) e criar `docs/verificacao/.gitkeep`

---

## Phase 2: Foundational (bloqueia tudo; 1 agente, sequencial)

**Lógica pura + testes**

- [X] T004 Criar `src/lib/tipos.ts` com todos os tipos do data-model (Loja, Bairro, Categoria, Produto com `variacoes?: { id, nome, preco }[]`, ItemSacola com `quantidade` 1–20, LinhaSacola, DadosPedido, Quando `{ tipo: 'asap' } | { tipo: 'agendado', data: 'AAAA-MM-DD', minutos }`, InstanteLoja, ErrosPedido, EstadoSacola, AcaoSacola)
- [X] T005 Criar `src/content/loja.ts` (dados fictícios do data-model: WhatsApp `5511900000000`, Rua do Fermento, 212 — Vila Serena, horários seg–sáb 420–1200 e dom 420–780, `preparoMin` 20/40, antecedência 48 h, janela 14 dias, mínimo 4000, 5 bairros com taxas 500/700/800/1000/1200)
- [X] T006 Criar `src/content/cardapio.ts` com as 5 categorias e os 22 produtos do data-model (nome ≤ 40, descrição ≤ 120 escrita do zero, preço em centavos, `imagem: 'produto-<id>'`, selos, `encomenda`, `destaque` nos 6 listados)
- [X] T007 [P] Criar `src/lib/dinheiro.ts` + `src/lib/dinheiro.test.ts` (`formatarBRL`, `formatarBRLTexto`; testes: 0, 700, 1800, 10800, 123456, NBSP vs espaço)
- [X] T008 [P] Criar `src/lib/armazenamento.ts` (`ler`, `gravar`, `apagar` com try/catch; JSON inválido → null; sem `window` → no-op)
- [X] T009 Criar `src/lib/funcionamento.ts` + `src/lib/funcionamento.test.ts` conforme contrato (`instanteNaLoja`, `statusAgora`, `horariosDisponiveis`, `formatarHora`, `rotuloDia`) e research R5/R11; testes: seg 6h59 (abre hoje às 7h), seg 10h (aberto, fecha às 20h), sáb 20h01 (abre amanhã/domingo às 7h), dom 13h (abre segunda), asap indisponível a menos de 30 min + preparo do fechamento, encomenda começa em +48 h e respeita domingo curto, slots arredondados para :00/:30, virada de dia em UTC vs São Paulo
- [X] T010 Criar `src/lib/sacola.ts` + `src/lib/sacola.test.ts` (`estadoInicial`, `reduzirSacola`, `chaveItem`, `reconciliar`); testes: somar mesma linha, limite 20, quantidade 0 remove, desfazer volta na posição, variação distinta = linha distinta, `reconciliar` com lixo (`null`, string, produto inexistente, variação inválida, quantidade 99 → 20, quantidade 0 → descarta)
- [X] T011 Criar `src/lib/pedido.ts` + `src/lib/pedido.test.ts` (`montarLinhas`, `resumo`, `validarPedido`, `dadosIniciais`) com as regras do data-model verbatim: nome "obrigatório, 2–60 caracteres", endereço "obrigatório se entrega, 5–120", complemento "≤ 60", observações "≤ 300", mensagem do cartão "só com encomenda, ≤ 200", troco "≥ total", mínimo de entrega 4000 só para bairro cadastrado, "outro bairro" sem taxa, sacola vazia inválida, horário agendado precisa estar em `horariosDisponiveis`
- [X] T012 Criar `src/lib/mensagem.ts` + `src/lib/mensagem.test.ts` cumprindo `contracts/mensagem-whatsapp.md` e os casos M1–M7 (M1 idêntico ao bloco da spec)
- [X] T013 Rodar `npm test` e deixar tudo verde

**Visual e base**

- [X] T014 Reescrever `src/app/globals.css` com os tokens, `:root` de layout, utilitários tipográficos (`titulo-1`, `titulo-2`, `titulo-3`, `kicker`, `texto`, `legenda`, `preco`, `destaque`), foco visível, `scroll-margin-top` para âncoras, `prefers-reduced-motion`, `color-scheme: light` (plano, "Sistema visual")
- [X] T015 Reescrever `src/app/layout.tsx`: Fraunces (`axes: ['SOFT','opsz']`, normal+itálico) e Figtree via `next/font/google` com `variable`, `lang="pt-BR"`, link "Pular para o conteúdo" → `#conteudo`, `SacolaProvider` envolvendo `children`, metadata básica (title, description)
- [X] T016 Criar `scripts/manifesto-imagens.json` (27 entradas do data-model com `chave`, `arquivo`, `largura`, `altura`, `uso`, `alt` em português) e `scripts/gerar-placeholders.mjs` (sharp; cores dos tokens; escreve nome e tamanho; não sobrescreve sem `--force`); rodar e gerar `public/images/**`
- [X] T017 Criar `src/content/imagens.ts` (importa o manifesto e exporta `imagem(chave)` → `{ src, width, height, alt }`, lançando erro se a chave não existir) e `src/content/textos.ts` (textos do hero, queridinhos, encomendas, entrega, sobre, onde estamos, rodapé — escritos do zero, português do Brasil)
- [X] T018 [P] Criar `src/components/ui/{Container,Botao,TituloSecao,Preco,Selo,Foto,Icone,Logo}.tsx` conforme `contracts/lib-e-componentes.md` (Botao com alvos ≥ 44px e primário 48px; `Foto` com `preload` só quando `prioridade`; `Logo` = "Fornada" em Fraunces + símbolo SVG próprio de espiga; `IconeWhatsApp` SVG próprio)
- [X] T019 Criar `src/components/sacola/{SacolaProvider.tsx,useSacola.ts}` (Context + `useReducer(reduzirSacola)`, hidratação em `useEffect` com `reconciliar`, persistência `fornada:sacola:v1`, `aberta/abrir(gatilho)/fechar` guardando o elemento gatilho, região `role="status" aria-live="polite"`, toast visual de 3 s e "Desfazer" de 6 s na remoção)
- [X] T020 Criar `src/components/sacola/{ControleQuantidade,AdicionarAoPedido}.tsx` (botão "Adicionar" 48px que vira `− n +` no próprio lugar; produto com variações mostra rádios em chips com preço e só adiciona com uma escolhida; `aria-label` "Diminuir/Aumentar {nome}"; anúncio via Provider)
- [X] T021 Criar `src/components/produto/CardProduto.tsx` com variantes `vertical` (foto 4:5, nome h3, descrição, selos, preço, AdicionarAoPedido) e `lista` (foto 88px + texto + preço + controle, para mobile); `<article>` sem link aninhado
- [X] T022 Criar `src/app/page.tsx` provisório com `<main id="conteudo">` e um `CardProduto` de teste; `npm run lint && npm test && npm run build` verdes

**Checkpoint**: fundação pronta; blocos A–E podem começar em paralelo.

---

## Phase 3: User Story 1 — Montar o pedido e mandar pelo WhatsApp (P1) 🎯 MVP · Bloco C

**Goal**: sacola completa, dados do pedido e abertura do WhatsApp.
**Independent Test**: quickstart passos 3–10.

- [X] T023 [P] [US1] Criar `src/components/sacola/GavetaSacola.tsx`: `<dialog>` com `showModal()`, lateral direita 440px no desktop e tela cheia no mobile, `aria-labelledby`, trava de scroll do body, foco devolvido ao gatilho no `close`, Esc; passo "Sua sacola" (linhas com foto 64px, nome, variação, `ControleQuantidade`, total da linha, remover; subtotal/taxa/total; estado vazio sugerindo 3 destaques) e botão "Continuar"
- [X] T024 [P] [US1] Criar `src/components/sacola/FormPedido.tsx`: campos do data-model (nome; retirada/entrega em rádios grandes; bairro em `<select>` com taxa no rótulo + "Outro bairro"; endereço; complemento; quando = "assim que possível" ou dia em chips + horário em `<select>` vindos de `horariosDisponiveis`; pagamento Pix/cartão/dinheiro; troco; observações com contador 300; mensagem do cartão com contador 200 só com encomenda; "Lembrar meus dados" desmarcado), validação no blur e no envio com `validarPedido`, mensagens com `aria-describedby` e `aria-invalid`, foco no primeiro erro, aviso "Faltam R$ X para entrega", botão "Enviar pedido pelo WhatsApp" (`alecrim`, 48px), "Voltar à sacola"
- [X] T025 [US1] Criar `src/components/sacola/Confirmacao.tsx` e ligar o envio: `montarMensagem` + `linkWhatsApp` + `window.open(url,'_blank','noopener,noreferrer')`; se retornar `null`, mostrar o link como botão; tela "Seu pedido foi aberto no WhatsApp; é só tocar em enviar lá" com "Esvaziar sacola" e "Voltar ao cardápio"; persistir dados só se "Lembrar" (`fornada:dados:v1`)
- [X] T026 [P] [US1] Criar `src/components/sacola/BarraSacolaMobile.tsx`: fixa no rodapé abaixo de `md`, 56px + `env(safe-area-inset-bottom)`, só com itens, "Ver sacola · n itens · R$ X" em `brasa`; adicionar `padding-bottom` ao `body` quando visível para não cobrir o rodapé
- [X] T027 [US1] Montar `GavetaSacola` e `BarraSacolaMobile` dentro do `SacolaProvider` em `src/app/layout.tsx` (única edição do Bloco C fora da pasta `sacola/`)
- [X] T028 [US1] Verificar no navegador os passos 3–10 do quickstart em 390 e 1440 e salvar prints em `docs/verificacao/{390|1440}-sacola-*.png`

---

## Phase 4: User Story 2 — Encontrar rápido e saber se dá para pedir agora (P1) · Blocos A e B

**Goal**: topo com status, hero, queridinhos, cardápio navegável, rodapé.
**Independent Test**: quickstart passos 1–2 e 11.

- [X] T029 [P] [US2] Bloco A: criar `src/components/sections/header/StatusFuncionamento.tsx` (client; SSR mostra resumo fixo; `useEffect` troca por `statusAgora`; ponto verde `alecrim` quando aberto; atualiza a cada minuto)
- [X] T030 [P] [US2] Bloco A: criar `src/components/sections/header/BotaoSacola.tsx` (ícone + contador pílula, `aria-label` "Abrir sacola, n itens", 44×44, chama `abrir(evento.currentTarget)`)
- [X] T031 [P] [US2] Bloco A: criar `src/components/sections/header/MenuMobile.tsx` (`<button aria-expanded aria-controls>`, painel `<dialog>` com links grandes, WhatsApp e status; Esc; foco volta; fecha ao clicar num link)
- [X] T032 [US2] Bloco A: criar `src/components/sections/Header.tsx` (sticky 64px, `miolo`, sombra `--shadow-header` ao rolar; logo; nav Cardápio, Encomendas, Entrega, Sobre, Onde estamos; botão "Falar no WhatsApp" secundário; BotaoSacola; abaixo de `lg` só logo + status curto + sacola + hambúrguer)
- [X] T033 [P] [US2] Bloco A: criar `src/components/sections/Hero.tsx` (split 5/7; kicker; `h1` único "Pão *de verdade*, saindo agora" com `destaque`; apoio; "Fazer pedido" → `#cardapio` primário; "Encomendar bolo ou cesta" → `#encomendas` secundário; status; foto `hero` com prioridade e `sizes`; mobile: foto abaixo do texto)
- [X] T034 [P] [US2] Bloco A: criar `src/components/sections/Queridinhos.tsx` (fundo `trigo`; título com destaque; 6 `CardProduto vertical` dos `destaque`; desktop grid 3 colunas; mobile trilho horizontal com `scroll-snap` e dica visual do próximo card, sem autoplay; `aria-roledescription` não necessário, é lista `<ul>`)
- [X] T035 [P] [US2] Bloco A: criar `src/components/sections/Rodape.tsx` (`casca`, texto `miolo`, colunas: marca + frase, navegação, contato com WhatsApp/telefone/endereço, horários resumidos, Instagram; linha com © e "Projeto fictício de portfólio — Fornada não é uma padaria real"; foco `mel`)
- [X] T036 [P] [US2] Bloco B: criar `src/components/sections/cardapio/BarraCategorias.tsx` (client; sticky em `top: var(--header-h)`, altura ≤ 56px, chips-âncora `#cat-*` com alvo 44px, rolagem horizontal com snap no mobile, `IntersectionObserver` marca a ativa com `aria-current="true"` e rola o chip ativo para a vista)
- [X] T037 [US2] Bloco B: criar `src/components/sections/Cardapio.tsx` (`#cardapio`, h2, BarraCategorias, uma `<section aria-labelledby>` por categoria exceto encomendas com `id="cat-<id>"`; desktop grid de `CardProduto vertical` 3–4 colunas; abaixo de `md` `CardProduto lista`; link final "Bolos e cestas por encomenda →" para `#encomendas`; `<noscript>` com link direto do WhatsApp)
- [X] T038 [US2] Verificar passos 1–2 e 11 do quickstart (360/390/1440), sem scroll horizontal, alvos ≥ 44px, prints `docs/verificacao/{390|1440}-{hero,queridinhos,cardapio,rodape}.png`

---

## Phase 5: User Story 3 — Encomendar bolo ou cesta (P2) · Bloco D

**Goal**: seção de encomendas funcional e regras de 48h.
**Independent Test**: quickstart passos 5–6.

- [X] T039 [P] [US3] Criar `src/components/sections/Encomendas.tsx` (`#encomendas`, fundo `trigo`, foto `encomendas` 16:10, "Como funciona" em 3 passos numerados — escolha, data com 48 h, confirme no WhatsApp —, 4 `CardProduto vertical` com variações, nota "Pedidos com menos de 48 h? Fale com a gente" com link WhatsApp)
- [X] T040 [US3] Conferir com o Bloco C que o formulário exige data ≥ 48 h e mensagem do cartão com item de encomenda (sem editar arquivos do C; registrar divergência na entrega)

---

## Phase 6: User Story 4 — Conhecer e achar a padaria (P3) · Bloco D

**Goal**: entrega, sobre e onde estamos.
**Independent Test**: seções visíveis com dados completos; quickstart passo 11.

- [X] T041 [P] [US4] Criar `src/components/sections/Entrega.tsx` (`#entrega`, fundo `casca`, texto `miolo`; tabela/lista de bairros com taxa e tempo; pedido mínimo; retirada sem taxa com tempo de preparo; nota "Seu bairro não está aqui? Combine pelo WhatsApp")
- [X] T042 [P] [US4] Criar `src/components/sections/Sobre.tsx` (`#sobre`, split 7/5, h2 com destaque, 3 parágrafos curtos, foto `sobre`, 3 números próprios e inventados)
- [X] T043 [P] [US4] Criar `src/components/sections/OndeEstamos.tsx` + `src/components/sections/onde-estamos/HojeDestaque.tsx` (client pequeno que marca o dia atual com `aria-current="date"`); endereço, horários dos 7 dias em `<dl>`, "Como chegar" (abre mapa em nova aba, com texto), WhatsApp e telefone `tel:`, foto `fachada`
- [X] T044 [US4] Prints `docs/verificacao/{390|1440}-{encomendas,entrega,sobre,onde-estamos}.png` e checagem de scroll horizontal

---

## Phase 7: Prompts das imagens · Bloco E (paralelo a tudo depois do T016)

- [X] T045 [P] Criar `docs/prompts-imagens.md` no formato do Dom Tomás: como usar (tamanho exato, JPEG sRGB q80, ≤ 250 KB, mesmo nome, limpar `.next/cache/images`, não usar `--force`), tabela rápida, proporção por ferramenta (Midjourney, ChatGPT, Flux), bloco de estilo comum (luz natural lateral, madeira clara e pedra, paleta da marca, sem texto/logos), consistência entre fotos, e uma seção por imagem do manifesto com arquivo, tamanho, onde aparece, o que o corte exige, prompt em inglês, negative prompt e intenção em português — 27 imagens

---

## Phase 8: Integração, polimento e verificação (sequencial)

- [X] T046 Montar `src/app/page.tsx` final na ordem do plano (Header fora do `<main>`; Hero, Queridinhos, Cardápio, Encomendas, Entrega, Sobre, OndeEstamos dentro de `<main id="conteudo">`; Rodapé)
- [X] T047 Completar metadata em `src/app/layout.tsx` (`metadataBase`, description, Open Graph com `og.jpg`, `themeColor` via `viewport`) e JSON-LD `Bakery` sanitizado; criar `src/app/icon.svg` com o símbolo da marca
- [X] T048 Rodar `npm run lint && npm test && npm run build`
- [X] T049 Quickstart completo (passos 1–12) em 360/390/1440, incluindo teclado e storage bloqueado; corrigir o que falhar
- [X] T050 Lighthouse mobile em build de produção (`docs/verificacao/lighthouse.json`) e ajustar até as metas
- [X] T051 Revisão final de originalidade: nenhum texto, nome de seção ("queridinhos da [marca]", "Tradição"), cor, fonte ou imagem da referência; atualizar `README.md` do projeto (o que é, como rodar, como trocar imagens)

---

## Dependencies & Execution Order

- Setup (T001–T003) → Fundação (T004–T022, sequencial exceto os `[P]` internos) → blocos.
- Depois do T022: **Bloco A** (T029–T035, T038), **Bloco B** (T036–T037), **Bloco C** (T023–T028),
  **Bloco D** (T039–T044) e **Bloco E** (T045, pode começar logo após T016) rodam em paralelo.
  Nenhum bloco edita arquivo de outro; o único arquivo compartilhado (`layout.tsx`) só é editado
  pelo C (T027) na fase paralela e pela integração depois.
- Integração (T046–T051) só depois de todos os blocos.

## Parallel Example

```text
Agente A: T029 T030 T031 → T032 → T033 T034 T035 → T038
Agente B: T036 → T037
Agente C: T023 T024 T026 → T025 → T027 → T028
Agente D: T039 T041 T042 T043 → T040 → T044
Agente E: T045
```

## Implementation Strategy

- **MVP** = Fundação + US1 (Bloco C) + Cardápio (Bloco B): já dá para pedir pelo WhatsApp.
- Incremento 2 = US2 completa (Bloco A). Incremento 3 = US3/US4 (Bloco D). Por fim, integração,
  verificação e prompts.
