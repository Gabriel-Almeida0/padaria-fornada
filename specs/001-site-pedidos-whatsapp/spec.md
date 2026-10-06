# Feature Specification: Site da Fornada Padaria com pedido pelo WhatsApp

**Feature Branch**: `001-site-pedidos-whatsapp`

**Created**: 2026-09-29

**Status**: Draft

**Input**: User description: "Site one-page da Fornada Padaria (fictícia, portfólio) inspirado no estilo
de uma padaria real de referência: hero de produto, 'queridinhos', cardápio por categoria com preço e botão de
adicionar, sacola lateral, dados do pedido (nome, retirada ou entrega, endereço, horário, forma de
pagamento na entrega, observações) e botão que abre o WhatsApp com o pedido formatado. Também
encomendas (bolos/cestas com antecedência), sobre a padaria, horários/endereço, rodapé. Deve corrigir
os pontos fracos de UX/design da referência listados em docs/referencia/auditoria-referencia.md (fora do repositório público)."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Montar um pedido e mandar pelo WhatsApp (Priority: P1)

Uma cliente abre o site no celular, vê o cardápio com foto, nome e preço de cada item, adiciona
dois pães e um café, ajusta a quantidade, informa nome, se vai retirar ou receber, o horário e a
forma de pagamento, e toca em "Enviar pedido pelo WhatsApp". O WhatsApp abre com a mensagem
pronta: itens, quantidades, subtotal, taxa, total e os dados dela. Ela só precisa tocar em enviar.

**Why this priority**: é a razão de existir do site. Sem isso, é só uma vitrine igual à referência.

**Independent Test**: com o site aberto em 390px, adicionar 3 itens diferentes, alterar uma
quantidade, remover um item, preencher os dados e conferir que o link gerado abre o WhatsApp com
o texto exato esperado (itens, valores e dados).

**Acceptance Scenarios**:

1. **Given** a sacola vazia, **When** a cliente toca em "Adicionar" num produto, **Then** o item
   entra com quantidade 1, o contador da sacola sobe e há um aviso breve e acessível de que foi
   adicionado, sem tirar a cliente do lugar em que ela estava no cardápio.
2. **Given** um item na sacola, **When** ela usa + e −, **Then** a quantidade e os totais mudam na
   hora; chegar a zero remove o item, com opção de desfazer por alguns segundos.
3. **Given** itens na sacola, **When** ela abre a sacola, **Then** vê cada item com quantidade,
   preço unitário e subtotal, a taxa de entrega (se houver) e o total.
4. **Given** a sacola preenchida e os dados obrigatórios faltando, **When** ela toca em enviar,
   **Then** o envio não acontece e cada campo com problema mostra a mensagem ao lado dele, com o
   foco levado ao primeiro campo com erro.
5. **Given** tudo preenchido, **When** ela toca em enviar, **Then** o WhatsApp da padaria abre
   (nova aba no computador, app no celular) com a mensagem do pedido formatada e legível.
6. **Given** que ela fechou a aba sem enviar, **When** volta ao site no mesmo aparelho, **Then** a
   sacola continua com os itens.

---

### User Story 2 - Encontrar rápido o que quer e saber se dá para pedir agora (Priority: P1)

Um cliente quer saber, em segundos, o que a padaria vende, quanto custa, se está aberta agora,
até que horas e se entrega no bairro dele.

**Why this priority**: na referência, cardápio, preço, horário e entrega estão espalhados em
páginas separadas; resolver isso é o principal ganho de UX.

**Independent Test**: sem rolar mais que uma tela, o visitante vê o status "aberto/fechado" com o
horário de hoje; em até 2 toques chega a qualquer categoria do cardápio; a área de entrega e a
taxa estão visíveis antes de ele preencher o pedido.

**Acceptance Scenarios**:

1. **Given** a página inicial, **When** ela carrega, **Then** o topo mostra o nome da padaria, uma
   chamada principal clara ("Fazer pedido") e o status de funcionamento do momento
   ("Aberto agora · fecha às 20h" ou "Fechado · abre amanhã às 7h").
2. **Given** o cardápio, **When** o cliente toca numa categoria na barra de categorias, **Then** a
   página vai até ela e a barra continua visível e indica a categoria atual enquanto ele rola.
3. **Given** qualquer produto, **When** ele aparece na tela, **Then** mostra foto, nome, descrição
   curta, preço em reais e o botão de adicionar; nunca "consulte o preço".
4. **Given** a seção de entrega, **When** o cliente lê, **Then** encontra os bairros atendidos, a
   taxa, o pedido mínimo para entrega e o tempo médio.

---

### User Story 3 - Encomendar bolo ou cesta com antecedência (Priority: P2)

Uma pessoa quer um bolo de aniversário para sábado ou uma cesta de café da manhã para presente.
Ela escolhe o produto, o tamanho, a data (respeitando a antecedência mínima), escreve a mensagem
do cartão e manda pelo WhatsApp.

**Why this priority**: encomenda tem ticket maior e é um fluxo comum de padaria, mas depende do
fluxo do P1.

**Independent Test**: adicionar um bolo escolhendo o tamanho; o formulário passa a exigir uma data
de retirada/entrega a partir do mínimo de antecedência; datas anteriores são recusadas com
mensagem clara; a mensagem do WhatsApp traz tamanho, data e texto do cartão.

**Acceptance Scenarios**:

1. **Given** um produto de encomenda com tamanhos, **When** a pessoa toca em adicionar, **Then**
   escolhe o tamanho antes (o preço muda com o tamanho) e o item entra na sacola com o tamanho.
2. **Given** um item de encomenda na sacola, **When** ela preenche os dados, **Then** o horário
   "assim que possível" deixa de existir e é exigida uma data igual ou posterior à antecedência
   mínima, dentro dos dias de funcionamento.
3. **Given** uma cesta de presente, **When** ela preenche, **Then** pode escrever uma mensagem de
   cartão (até 200 caracteres) que vai na mensagem do pedido.

---

### User Story 4 - Conhecer a padaria e achar como chegar (Priority: P3)

Um visitante quer conhecer a história, ver fotos do lugar, achar endereço, horários da semana,
telefone e redes sociais.

**Why this priority**: dá credibilidade e completa a peça de portfólio, mas não bloqueia pedidos.

**Independent Test**: a seção "Sobre" e a seção "Onde estamos" existem, com endereço, horários
dos 7 dias, link para abrir no mapa e contato; o rodapé repete o essencial e avisa que é projeto
fictício.

**Acceptance Scenarios**:

1. **Given** a seção "Onde estamos", **When** o visitante lê, **Then** encontra endereço, horários por
   dia da semana (com o dia de hoje destacado), link "Abrir no mapa" e o WhatsApp.
2. **Given** o rodapé, **When** o visitante chega ao fim, **Then** vê navegação, contato, redes e o
   aviso "Projeto fictício de portfólio".

---

### Edge Cases

- **Fora do horário**: o site continua aceitando pedido, mas o horário "assim que possível" some;
  a pessoa escolhe um horário a partir da próxima abertura, e o status avisa isso no topo.
- **Entrega abaixo do pedido mínimo**: a opção entrega mostra quanto falta para o mínimo e não
  deixa enviar até atingir (retirada continua liberada).
- **Bairro fora da área**: o cliente escolhe o bairro numa lista; se o bairro dele não estiver lá,
  há a opção "Outro bairro" que avisa que a entrega será combinada pelo WhatsApp e não soma taxa.
- **Sacola vazia**: o botão de enviar fica indisponível e a sacola sugere os mais pedidos.
- **Quantidade máxima**: cada item vai até 20 unidades; acima disso, aviso para falar direto no
  WhatsApp.
- **Storage indisponível** (aba anônima, bloqueio): a sacola funciona normalmente, só não é lembrada.
- **Dados salvos inválidos** (produto que saiu do cardápio, preço mudado): ao carregar, itens que
  não existem mais são descartados e os preços são sempre os atuais do cardápio.
- **Texto com caracteres especiais** (acentos, emoji, &, #, quebra de linha nas observações): a
  mensagem chega íntegra no WhatsApp.
- **Troco**: pagamento em dinheiro pede "troco para quanto?" e rejeita valor menor que o total.
- **Telas estreitas (360px) e zoom de 200%**: nada corta nem gera rolagem horizontal.
- **Sem JavaScript**: o cardápio, preços, horários e contato continuam legíveis; um link direto
  "Pedir pelo WhatsApp" (sem sacola) continua funcionando.

## Requirements *(mandatory)*

### Functional Requirements

**Topo e navegação**

- **FR-001**: O topo DEVE ficar visível ao rolar, com logo, links para as seções (Cardápio,
  Encomendas, Entrega, Sobre, Onde estamos) e o botão da sacola com a quantidade de itens.
- **FR-002**: O topo DEVE mostrar o status de funcionamento calculado pelo horário local da padaria
  (aberto/fechado, quando fecha ou quando abre).
- **FR-003**: No mobile, os links DEVEM ficar num menu que abre e fecha com botão identificado, e o
  botão da sacola DEVE continuar visível fora do menu.

**Hero e vitrine**

- **FR-004**: A primeira dobra DEVE ter um título curto, uma frase de apoio, um botão principal
  "Fazer pedido" (leva ao cardápio) e um secundário "Encomendar bolo ou cesta", com uma foto de
  produto em destaque. Sem carrossel automático.
- **FR-005**: DEVE haver uma seção "Os mais pedidos" com 4 a 6 produtos mais pedidos, cada um
  já com preço e botão de adicionar.

**Cardápio**

- **FR-006**: O cardápio DEVE ser organizado em categorias (Pães, Folhados e doces, Salgados,
  Bebidas, Encomendas), com uma barra de categorias que fica fixa sob o topo e indica a categoria
  visível.
- **FR-007**: Cada produto DEVE exibir foto, nome, descrição de até 120 caracteres, preço em reais
  e, quando houver, selos informativos (ex.: "fermentação natural", "vegano", "sem lactose").
- **FR-008**: Produtos com variações (tamanho de bolo) DEVEM exigir a escolha antes de entrar na
  sacola; o preço mostrado DEVE refletir a variação escolhida.
- **FR-009**: O botão de adicionar DEVE virar um controle de quantidade (− n +) depois do primeiro
  toque, no próprio card.

**Sacola**

- **FR-010**: A sacola DEVE abrir como painel lateral (tela cheia no mobile), listando itens,
  variações, quantidades editáveis, subtotal, taxa de entrega e total.
- **FR-011**: No mobile, enquanto houver itens, DEVE existir uma barra fixa no rodapé com
  quantidade de itens, total e "Ver sacola".
- **FR-012**: Remover um item DEVE oferecer "desfazer" por pelo menos 5 segundos.
- **FR-013**: A sacola DEVE ser lembrada no mesmo aparelho entre visitas, reconciliada com o
  cardápio atual ao carregar.
- **FR-014**: Todas as mudanças na sacola DEVEM ser anunciadas para leitores de tela.

**Dados do pedido e envio**

- **FR-015**: O formulário DEVE pedir: nome (obrigatório); modo (retirada ou entrega); para entrega,
  bairro (lista), endereço e complemento; quando (assim que possível ou horário agendado em
  intervalos de 30 min dentro do funcionamento); pagamento (Pix, cartão na entrega/retirada,
  dinheiro com troco); observações (opcional, até 300 caracteres).
- **FR-016**: Validação DEVE acontecer ao sair do campo e ao tentar enviar, com mensagens em
  português ao lado do campo, e foco no primeiro erro.
- **FR-017**: O botão de envio DEVE gerar a mensagem do pedido no formato definido abaixo e abrir o
  WhatsApp da padaria com ela.
- **FR-018**: A mensagem DEVE conter: saudação, lista de itens (quantidade × nome [variação] — valor),
  subtotal, taxa, total, modo, endereço (se entrega), quando, pagamento (e troco), observações,
  mensagem do cartão (se houver) e nome.
- **FR-019**: Depois de abrir o WhatsApp, o site DEVE mostrar uma confirmação ("Seu pedido foi
  aberto no WhatsApp; é só tocar em enviar lá") com opções "Esvaziar sacola" e "Voltar ao
  cardápio". A sacola NÃO é esvaziada automaticamente, porque o site não sabe se a pessoa enviou.
- **FR-020**: Os dados pessoais preenchidos (nome, endereço) PODEM ser lembrados no aparelho só se
  a pessoa marcar "Lembrar meus dados", desmarcado por padrão.

**Encomendas, entrega, sobre e visita**

- **FR-021**: A seção Encomendas DEVE explicar a antecedência mínima (48 h), mostrar bolos e cestas
  com tamanhos e preços, e permitir adicionar à sacola.
- **FR-022**: Com item de encomenda na sacola, o "quando" DEVE exigir data e horário a partir da
  antecedência mínima e aceitar mensagem de cartão (até 200 caracteres).
- **FR-023**: A seção Entrega DEVE listar bairros atendidos com taxa, pedido mínimo e tempo médio.
- **FR-024**: A seção Sobre DEVE contar a história em até 3 parágrafos curtos com foto.
- **FR-025**: A seção "Onde estamos" DEVE ter endereço, horários dos 7 dias com o dia atual destacado, link
  para abrir no mapa e botão de WhatsApp.
- **FR-026**: O rodapé DEVE ter navegação, contato, redes e o aviso de projeto fictício.
- **FR-027**: DEVE haver um botão de WhatsApp direto ("Falar com a padaria") para dúvidas, separado
  do envio de pedido.

**Qualidade transversal (correção dos pontos fracos da referência)**

- **FR-028**: Toda a jornada de pedido DEVE funcionar só com teclado e com leitor de tela.
- **FR-029**: Texto e controles DEVEM atingir contraste AA; alvos de toque no mobile ≥ 44×44 px.
- **FR-030**: Nenhuma largura entre 360 e 1440 px pode gerar rolagem horizontal.
- **FR-031**: Os CTAs principais DEVEM parecer botões (preenchidos, rótulo explícito), não links
  finos sem contorno.
- **FR-032**: Cada ponto fraco listado na auditoria da referência DEVE estar mapeado na seção
  "Rastreabilidade" abaixo.

### Formato da mensagem (referência para teste)

```text
Olá, Fornada! Quero fazer um pedido 🥖

2× Pão de fermentação natural — R$ 36,00
1× Bolo de laranja com calda (M) — R$ 78,00

Subtotal: R$ 114,00
Entrega (Vila Serena): R$ 5,00
Total: R$ 119,00

Entrega: Rua das Acácias, 120, ap. 32 — Vila Serena
Quando: sábado, 03/10, às 09:30
Pagamento: Pix
Mensagem do cartão: "Feliz aniversário, Lu!"
Observações: sem cobertura de coco

Nome: Mariana
```

### Key Entities

- **Categoria**: nome, âncora, ordem.
- **Produto**: identificador estável, categoria, nome, descrição curta, preço em centavos, foto
  (arquivo do manifesto + texto alternativo), selos, se é encomenda, variações opcionais
  (nome + preço).
- **Item da sacola**: produto, variação escolhida, quantidade (1–20).
- **Dados do pedido**: nome, modo, bairro, endereço, complemento, quando (asap ou data/hora),
  pagamento, troco para, observações, mensagem do cartão, lembrar dados.
- **Bairro atendido**: nome, taxa em centavos, tempo médio.
- **Funcionamento**: horários por dia da semana, fuso da padaria, antecedência de encomenda,
  pedido mínimo de entrega.

## Rastreabilidade dos pontos fracos da referência

Preenchida a partir de `docs/referencia/auditoria-referencia.md` (fora do repositório público), seção (d). Cada linha liga um
problema medido na referência ao requisito que o resolve.

| # | Problema na referência (sev.) | Requisito(s) |
|---|---|---|
| 1 | Não dá para pedir; encomenda cai em 404 (alta) | FR-010–FR-019, FR-021–FR-022; SC-001 |
| 2 | Delivery joga para o iFood e a pessoa recomeça (alta) | FR-009, FR-011, FR-017; SC-001 |
| 3 | Nenhum WhatsApp nem telefone (alta) | FR-017, FR-025, FR-027 |
| 4 | Sem preço na vitrine; "$" vs "R$"; preço com contraste 2,07 (alta) | FR-005, FR-007, FR-029; SC-003 |
| 5 | Horário, endereço e área de entrega escondidos (alta) | FR-002, FR-023, FR-025; SC-003 |
| 6 | Contraste reprovado em botões e bordas de campo (alta) | FR-029, FR-031 |
| 7 | 39 alvos de toque < 44 px no mobile (média) | FR-029 |
| 8 | CTAs principais parecem texto (média) | FR-004, FR-031 |
| 9 | Carrosséis automáticos sem controle (média) | FR-004 (sem carrossel automático); constituição III |
| 10 | Home sem h1, páginas com dois h1 (média) | FR-028; constituição III |
| 11 | Fotos de produto sem texto alternativo (média) | FR-007; constituição III |
| 12 | Página de ~6,4 MB, hero PNG de 3–4 MB (média) | SC-006; constituição IV |
| 13 | reCAPTCHA e 5 rastreadores (média) | Não há formulário para servidor nem analytics (constituição I e VII) |
| 14 | Categorias levam ao topo do cardápio, sem âncora (média) | FR-006; SC-002 |
| 15 | Link dentro de link nos cards (média) | FR-009, FR-028 |
| 16 | Cardápio de 26 mil px e 230 px de barras fixas no mobile (média) | FR-006 (barra de categorias enxuta), lista compacta no mobile |
| 17 | Foco padrão, sem skip link, menu sem rótulo (média) | FR-003, FR-028; constituição III |
| 18 | "Unidades" num iframe com outra identidade (média) | FR-025 (seção nativa, mesma identidade) |
| 19 | Fonte que não carrega e cai em Times (baixa) | constituição IV (fontes self-hosted) |
| 20 | Microcópia descuidada, preço quebrando linha (baixa) | FR-007 (preço sempre em uma linha) |
| 21 | Link de login de funcionário no header (baixa) | FR-001 (só itens para o cliente) |
| 22 | Sem rolagem horizontal na referência | FR-030 (manter, testando em 360 px) |

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Uma pessoa que nunca viu o site consegue, no celular, montar um pedido de 3 itens e
  abrir o WhatsApp com ele em menos de 90 segundos.
- **SC-002**: Qualquer categoria do cardápio fica a no máximo 2 toques a partir do topo da página.
- **SC-003**: Status de funcionamento, preço de cada produto e taxa de entrega aparecem sem que a
  pessoa precise sair da página ou abrir outro documento.
- **SC-004**: 100% das mensagens geradas nos testes batem, caractere por caractere, com o esperado
  (valores, acentos e emoji íntegros).
- **SC-005**: Zero rolagem horizontal entre 360 e 1440 px; zero erros no console.
- **SC-006**: Auditoria automática de acessibilidade sem violações sérias; nota de
  acessibilidade ≥ 95, desempenho ≥ 90, boas práticas ≥ 95 e SEO ≥ 95 no celular.
- **SC-007**: Todos os pontos fracos de severidade alta da auditoria estão resolvidos e
  verificáveis por print ou medida.

## Assumptions

- A Fornada é fictícia: fica em "Vila Serena", São Paulo/SP (bairro inventado), funciona de
  segunda a sábado das 7h às 20h e domingo das 7h às 13h, fuso America/Sao_Paulo.
- WhatsApp fictício com número claramente de teste; entrega em 5 bairros inventados com taxas
  entre R$ 5 e R$ 12; pedido mínimo para entrega de R$ 40; tempo médio de 40 min.
- Encomendas pedem 48 h de antecedência; bolos têm tamanhos P, M e G.
- Pagamento é sempre na entrega/retirada ou Pix combinado no WhatsApp; o site não cobra nada.
- O cardápio tem entre 20 e 28 produtos; preços plausíveis para padaria de bairro em SP.
- Uma única página; sem conta de usuário, cupom, programa de fidelidade ou múltiplas lojas.
- Fotos finais serão geradas por IA pelo dono do projeto a partir dos prompts em
  `docs/prompts-imagens.md`; até lá, placeholders com as dimensões finais.
- Público principal no celular; o layout é pensado primeiro para 390 px.
