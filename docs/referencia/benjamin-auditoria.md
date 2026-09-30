# Auditoria de UX e design: benjaminpadaria.com.br

> Referência de estilo para o site da **Fornada** (padaria fictícia, pedidos pelo WhatsApp).
> Coleta em 29/09/2026 com Playwright (Chromium), em 1440×900 e 390×844. Os números vêm de `getComputedStyle`, `performance` e `document.fonts`. Quando algo não foi medido, o texto diz isso.
> Só navegação e leitura: nenhum formulário foi enviado e não houve login.

---

## (a) Números extraídos

### Tipografia

O site usa **duas famílias próprias**, servidas localmente como `.otf` (`/wp-content/themes/benjamin/assets/fonts/`). **Não usa Google Fonts.**

- **Mackay** (serifada de display, suave e de contraste médio, com arestas arredondadas) nos arquivos Regular, Medium e Bold.
- **Gopher** (sans geométrica de formas redondas) nos arquivos Regular e Bold.
- Fontes baixadas na home: cerca de **382 KB** em .otf, sem woff2.
- `Gopher-Bold` é referenciada no CSS mas **não aparece em `document.fonts`**. Os nomes dos depoimentos caem para Times (ver o print `benjamin-1440-depoimentos.png`).

| Elemento | Família | Tamanho desktop | Tamanho mobile | Peso | line-height | letter-spacing | Cor |
|---|---|---|---|---|---|---|---|
| Título do hero ("Croissant", h2) | Mackay-Medium | 64px | 32px | 500 | normal | normal | #7F554E |
| h2 de seção | Mackay-Medium | 40px | 32px | 500 | 44–64px | normal | #7F554E ou #1E1E1E |
| h2 de destaque (faixa "Tradição") | Mackay-Medium | 64px | 32px | 500 | 64px (1.0) | normal | #F4EED3 sobre #7F554E |
| Palavra da marca dentro do h2 (`.super-title-logo`) | Mackay-Bold | igual ao h2 | igual | 500 | igual | normal | #7F554E + estrela laranja |
| h1 das páginas internas | Mackay-Regular | 40px | — | — | — | normal | #F4EED3 sobre foto |
| h3 de card de produto | Gopher | 22px | — | 500 | normal | normal | #7F554E |
| Parágrafo do hero | Gopher-Regular | 16px | 16px | 400 | normal | normal | #1E1E1E |
| Descrição de card | Gopher-Regular | 14px | 14px | 400 | 18.2px (1.3) | normal | #1E1E1E |
| Texto de apoio de seção | Gopher | 18px | — | 400 | — | normal | #1E1E1E |
| Link do menu | Gopher-Regular | 14px | 16px (menu aberto) | 400 | normal | normal | #7F554E |
| CTA do tipo link ("Mais produtos", "Ver todas unidades") | Gopher-Regular | 14px | 14px | 500 | normal | normal | #7F554E, com sublinhado de 1px deslocado |
| Preço no Cardápio | Gopher | 20px | — | 500 | — | — | #1E1E1E |
| Preço na página do produto | Gopher-Regular | 24px | 24px | 400 | — | — | **#9EBBAB** |
| "Peça no ifood" | Gopher | 12px | 12px | 700 | — | — | #FF632C |
| Rodapé | Gopher-Regular | 14px | 14px | 400 | normal | — | #FFFFFF / #F4EED3 sobre #7F554E |

Letter-spacing é sempre `normal`: nenhum texto usa tracking.

### Paleta medida

| Papel | Hex | Onde aparece |
|---|---|---|
| Marrom cacau (primária) | **#7F554E** | títulos, links do menu, faixa "Tradição", rodapé, sombra do header |
| Creme | **#F4EED3** | fundo das seções Unidades e Instagram, texto sobre o marrom |
| Laranja (a "estrelinha" e os CTAs) | **#FF632C** | estrela do logo e dos títulos, setas ativas, "Peça no ifood", botão "Quero encomendar" |
| Verde sálvia | **#9EBBAB** | ícones de categoria (23 ocorrências em SVG), preço na página do produto, botão "Enviar" |
| Caramelo | **#C59274** | fundo da "Linha do tempo" (A Padaria) |
| Quase-preto | **#1E1E1E** | texto corrido |
| Borda bege | #D2CCB1 | bordas dos cards de categoria |
| Branco | #FFFFFF | fundo base, header |
| Resíduos do Bootstrap | #212529, #007BFF | cor herdada de body e `a` (não aparecem na tela porque são sobrescritas) |

### Contraste WCAG dos pares reais

| Par | Razão | Veredito |
|---|---|---|
| #7F554E sobre #FFFFFF (títulos, menu) | 6.34 | passa AA |
| #F4EED3 sobre #7F554E (faixa Tradição, rodapé) | 5.44 | passa AA |
| #1E1E1E sobre #F4EED3 | 14.30 | passa AAA |
| **#FF632C sobre #FFFFFF ("Peça no ifood", 12px, bold)** | **2.97** | **reprova** (texto pequeno pede 4.5) |
| **#F4EED3 sobre #FF632C (botão "Quero encomendar", 16px)** | **2.55** | **reprova** |
| **#9EBBAB sobre #FFFFFF (preço do produto, "Enviar")** | **2.07** | **reprova** |
| **#F4EED3 sobre #C59274 (texto de 14px na Linha do tempo)** | **2.33** | **reprova** |
| **#7F554E sobre #C59274 (h3 da Linha do tempo)** | **2.34** | **reprova** |
| **#E6E8EC sobre #FFFFFF (borda dos inputs do Fale Conosco)** | **1.23** | **reprova** (componente pede 3:1) |
| #95A1BB sobre #FFFFFF (texto do select) | 2.59 | reprova |
| #F4EED3 sobre #FFFFFF (ícone de usuário no menu mobile) | 1.17 | praticamente invisível |

### Layout, espaçamento e componentes

| Item | Valor medido |
|---|---|
| Largura máxima do conteúdo | **1140px** (`.container-custom`); carrosséis vazam até a borda direita (sangria de 1283px) |
| Gutter lateral no mobile | 16px |
| Header | **72px** no desktop, **68px** no mobile, `position: fixed`, fundo branco, `box-shadow: 0 0 15px rgba(127,85,78,.15)`. Não muda ao rolar (mesma altura e classe em scrollY=1500) |
| Hero da home | 507px no desktop, 596px no mobile |
| Padding vertical das seções | 100px (Queridinhos). As outras seções usam alturas de 500 a 750px, com respiro parecido |
| Altura das seções da home (desktop) | Hero 507, Queridinhos 809, Tradição 551, Categorias 738, Unidades 500, Cestas 723, Depoimentos 752, Instagram 723 |
| Altura total da home | 5838px no desktop, 6727px no mobile |
| Card de produto (Queridinhos) | imagem de 338×474 (retrato, cerca de 5:7), **raio 0**, gap de 34px, `slidesPerView: 2.5` |
| Card do Cardápio (desktop) | 258px de largura, imagem de 258×361, 3 por linha, sidebar de filtros à esquerda |
| Tile de categoria | 268×140, borda de 1px #D2CCB1, raio 0 (no mobile: fundo #7F554E com ícone branco) |
| Card de unidade | 185×378, foto com véu rosado e nome em branco embaixo |
| Raios | quase tudo com **0**; 6px nos cards de depoimento; 24px na moldura dos depoimentos; 50% nos avatares |
| Sombras | só a do header e uma cinza de 5px no badge do reCAPTCHA |
| CTA padrão | "botão-link": texto de 14px + linha de 1px embaixo (a linha é laranja ou marrom), padding de 8px 0 |
| Setas de carrossel | linhas finas e compridas (64×14px): cinza quando desativada, laranja quando ativa |

### Carrosséis (Swiper)

| Carrossel | Autoplay | Loop | Setas | Paginação |
|---|---|---|---|---|
| Hero | **sim, 5000ms**, sem pausa ao passar o mouse, com **1 slide só** | sim | não | não |
| Queridinhos | não | não | sim (desktop) | não |
| Unidades | **sim, 2500ms** (pausa no hover) | sim | **não** | não |
| Cestas | não | não | sim | não |
| Depoimentos | **sim, 2500ms** (pausa no hover) | não | **não** | não |

Todos aceitam arrastar (`allowTouchMove: true`). Nenhum tem botão de pausa.

### Peso e performance (home, cache morno; valores de `encodedBodySize`)

| Métrica | Desktop | Mobile |
|---|---|---|
| Total baixado | **~6,4 MB** (89 requisições) | **~6,1 MB** (78 requisições) |
| Imagens | ~5,3 MB | ~5,0 MB |
| Imagem do hero | `Banner_desktop-1-scaled.png`, **2,9 MB**, PNG de 2560×930, `alt=""` | `Banner_mobile.png`, **4,2 MB**, PNG |
| Outras imagens pesadas | JPGs de produto com 442, 463 e 780 KB | — |
| JS | ~583 KB (reCAPTCHA sozinho: 348 KB, carregado em todas as páginas) | idem |
| Terceiros | GTM, Facebook Pixel, Hotjar, Microsoft Clarity, DoubleClick, reCAPTCHA | idem |
| LCP | 1992ms (a imagem do hero) | 624ms (cache morno, então não serve como número de 1ª visita) |
| CLS | 0.046 | não medido |
| TTFB / DCL / load | 766 / 1250 / 2173ms | load 800ms (cache) |

Só 12 das 47 imagens usam webp.

---

## (b) Estrutura

### Home (ordem e papel de cada seção)

1. **Header fixo**: logo à esquerda, um divisor vertical, 6 links de menu e um ícone de "colaborador" à direita. No mobile vira hambúrguer, e o menu abre como uma tela branca.
2. **Hero de 1 produto** ("Croissant"): foto grande, título serifado marrom, duas linhas de texto e o link "Mais produtos". O banner inteiro é um `<a href="/menu">`.
3. **Os queridinhos da [marca]**: título em duas linhas, com o nome da marca em bold, cor e estrela. Carrossel de 7 produtos em retrato (foto, nome e descrição) **sem preço**.
4. **Tradição**: split 50/50 com foto do balcão e bloco marrom com título creme, subtítulo e o link "Conheça nossa história".
5. **Nossas categorias**: grid 3×2 de tiles com ícone de linha e nome, mais uma foto vertical à direita. Todos os 6 tiles apontam para `href="menu"`, sem âncora.
6. **Encontre a [marca] mais próxima**: fundo creme, texto e link à esquerda, carrossel automático de fotos das lojas à direita.
7. **Cestas especiais**: carrossel de cestas com o título à direita (layout espelhado em relação aos Queridinhos).
8. **Depoimentos**: título centralizado e cards brancos sobre uma moldura bege arredondada, em autoplay.
9. **Instagram**: grid de 4×3 posts com o título "Acompanhe [marca] nas redes" e os ícones sociais.
10. **Rodapé marrom**: logo creme, texto institucional (sobre vagas), colunas Cardápio / Sobre nós / Contato (só e-mail) e uma barra com copyright.

O ritmo alterna fundos: branco, branco, marrom, branco, creme, branco, branco, creme, marrom. A "assinatura" visual é o nome da marca em bold com a estrelinha laranja dentro de cada título.

### Páginas internas

| Página | Estrutura | Como o cliente chega a um produto ou pedido |
|---|---|---|
| **Cardápio** (`/menu`) | Banner com h1 sobre foto. No desktop tem sidebar com busca e 12 categorias e um grid de 3 colunas; no mobile a barra de categorias vira rolagem horizontal, com a busca embaixo, fixas no topo. 100 produtos, **páginas de 25.064px (desktop) e 26.394px (mobile)** | Cada card tem nome, preço, "Peça no ifood" e "Peça na loja" |
| **Produto** (`/menu/slug`) | Foto, h1, preço (em verde claro), "*Valor válido apenas para loja física", "Mais informações", categoria e os botões "Pedir no Ifood" e "Peça na loja" | "Peça na loja" leva a `/unidades`. "Pedir no Ifood" abre a lista genérica da rede no iFood |
| **A Padaria** | Split com foto e manifesto em 3 parágrafos, números (37 anos, +115.000 pães), "Linha do tempo" em carrossel sobre caramelo, e depois os mesmos blocos da home (unidades, depoimentos, Instagram) | — |
| **Unidades** | **Iframe** de `lojas.benjaminpadaria.com.br` (1425×2240, sem `title`) com outra identidade: Roboto, verde-escuro, cantos arredondados e um segundo logo. Tem busca por região, "Usar minha localização" e cards com endereço, distância, "Unidade Aberta", um botão laranja **só com ícone** (rota) e "Mais informações" | O horário não aparece no card |
| **Cestas** | Mesmo layout do Cardápio, com uma única categoria no filtro ("Cestas"). Preços em **R$** (no Cardápio aparece **$**). Uma das cestas mostra "R$ Consulte" | "Peça no Ifood" e "Peça na loja" |
| **Encomendas** | Hero escuro com "Quero encomendar" (âncora para a própria página), "Veja alguns dos nossos produtos", "Encomendar é fácil" com 2 banners (Empresa e Pessoa Física), vantagens, depoimentos | **Os dois banners dão 404** (`/encomendas/encomendas-empresa` e `/encomendas/encomendas-pessoa-fisica`) |
| **Fale Conosco** | Formulário (assunto, nome, e-mail, mensagem) à esquerda e foto à direita | Só formulário e e-mail. Não há telefone nem WhatsApp |

**Caminho de pedido hoje (medido):**
- Delivery: Home → Cardápio (1) → "Peça no ifood" (2) → página intermediária "Você será redirecionado em 3..2..1" → lista genérica da rede no iFood, onde a pessoa escolhe a loja e **procura o produto de novo**. O preço do site não vale no iFood ("Valor válido apenas para loja física").
- Retirada: produto → "Peça na loja" → `/unidades`. Não há como reservar ou pedir; a pessoa só vê o endereço.
- Encomenda: Encomendas → "Quero encomendar" (rola a página) → Empresa ou Pessoa Física → **404**. **Não existe caminho funcional para encomendar.**

---

## (c) Pontos fortes (estilo a manter em espírito)

1. **Contraste de pares tipográficos**: uma serifada de display suave e calorosa nos títulos com uma sans geométrica redonda no texto. Dá cara de "padaria artesanal moderna" sem parecer rústico demais.
2. **Paleta curta e quente**: um marrom escuro como âncora, um creme como segundo fundo, **um único acento vivo** usado com parcimônia e um verde frio só em ícones. Fica gostoso sem virar parque de diversões.
3. **Fotografia protagonista**: fotos de produto grandes em proporção retrato (cerca de 5:7), com luz natural, superfícies de madeira e pedra, sem molduras nem raios. A foto faz o trabalho de vender.
4. **Assinatura tipográfica nos títulos**: títulos em duas linhas em que uma palavra-chave muda de peso e cor e ganha um pequeno ornamento. Isso vira identidade.
5. **Ritmo de seções por cor de fundo** (branco, creme, marrom), com muito respiro vertical (cerca de 100px) e largura de 1140px. Página calma e editorial.
6. **Layouts assimétricos**: título e texto numa coluna estreita à esquerda e carrossel "sangrando" para a direita. Splits 50/50 de foto e bloco de cor.
7. **Cantos retos e ausência de sombras**: estética de papel e impressão, limpa.
8. **Ícones de linha fina** em uma cor só para as categorias.
9. **Header enxuto** (72px, branco, sombra quase imperceptível tingida com a cor da marca).
10. **Página 404 com personalidade** (ilustrações em selo postal que levam ao Cardápio, às Cestas e às Unidades).

---

## (d) Pontos fracos de UX e design

| # | Problema | Evidência | Sev. | Como a Fornada resolve |
|---|---|---|---|---|
| 1 | **Não dá para pedir pelo site; o fluxo de encomenda está quebrado** | Os banners Empresa e Pessoa Física levam a 404 (`benjamin-1440-encomendas-pf-404.png`). "Quero encomendar" só rola até `#order-ease` | alta | O fluxo inteiro é **carrinho → revisão → WhatsApp com mensagem pronta**. Nenhum CTA de pedido leva a uma página vazia. Ter teste e2e em cada CTA |
| 2 | **Delivery joga a pessoa para fora e ela recomeça do zero** | "Peça no ifood" → `/redirecionamento-ifood` → contagem de 3 s → lista genérica da rede no iFood. "Peça na loja" → `/unidades` | alta | "Adicionar" coloca o item no carrinho na mesma tela. Um botão flutuante "Ver pedido (n) · R$ X" leva ao resumo e ao WhatsApp em no máximo 3 toques depois de escolher |
| 3 | **Nenhum WhatsApp nem telefone no site** | 0 links `wa.me` ou `tel:` na home e no Fale Conosco. O contato é só um e-mail | alta | WhatsApp no header, no rodapé, no card de produto e no carrinho. Telefone clicável |
| 4 | **Preço ausente na vitrine e inconsistente no catálogo** | A home mostra 0 preços. O Cardápio usa "$10,00" e as Cestas "R$ 140,00". Na página do produto o preço é #9EBBAB (2.07:1) com a nota "*válido apenas para loja física" | alta | Preço em R$, formatado com `Intl.NumberFormat('pt-BR')`, em todo card, inclusive nos destaques da home, e com contraste ≥ 4.5 |
| 5 | **Horário, endereço e área de entrega difíceis de achar** | A home não tem nenhum horário nem endereço (regex medido). Os cards de Unidades mostram endereço mas não o horário, e ficam num iframe | alta | Faixa "Aberto hoje até 19h · Retirada ou entrega" no topo da home. Rodapé com endereço, horários por dia e bairros atendidos, com taxa |
| 6 | **Contraste reprovado em elementos de ação** | "Peça no ifood" #FF632C sobre branco: 2.97 (12px). Botão creme sobre laranja: 2.55. "Enviar" #9EBBAB: 2.07. Borda dos inputs #E6E8EC: 1.23. Linha do tempo: 2.33 e 2.34 | alta | Um acento escuro o bastante para texto branco (≥ 4.5), bordas de campo ≥ 3:1 e verificação automática de contraste nos tokens |
| 7 | **Alvos de toque pequenos no mobile** | 39 elementos clicáveis com menos de 44px, por exemplo setas de carrossel de 64×14, ícones sociais de 14×14, "Quero encomendar" com 34px de altura, "Peça na loja" com 31px, links do rodapé com 18px e o ícone de usuário com 18×18 | média | Todo alvo com no mínimo 44×44 (botões de 48px), com espaço de 8px entre alvos |
| 8 | **CTAs principais parecem texto, não botão** | "Mais produtos", "Ver todas unidades" e "Conheça nossa história" são texto de 14px com uma linha de 1px. "Mais produtos" é uma `<div>` dentro do link do banner. Os banners Empresa e Pessoa Física não têm nenhuma dica de que são clicáveis | média | Um botão primário sólido por tela ("Montar meu pedido"). O estilo "link sublinhado" fica só para ações secundárias |
| 9 | **Carrosséis automáticos sem controle** | Unidades e Depoimentos com autoplay a cada 2500 ms, sem setas nem pausa. O hero roda autoplay e loop com 1 slide só | média | Nada de autoplay. Carrossel só onde ajuda (destaques), com setas ≥ 44px, rolagem nativa com scroll-snap e indicador. `prefers-reduced-motion` respeitado |
| 10 | **Hierarquia de headings quebrada** | Home **sem h1**. Cardápio e Cestas com **2 h1 iguais**. h3 vazios nos depoimentos. O subtítulo da seção é h3 e vem antes dos itens | média | Um h1 por página, h2 por seção e h3 por card. Subtítulo em `<p>` |
| 11 | **Imagens sem texto alternativo** | 11 de 47 `<img>` na home com alt vazio, incluindo o hero (`alt=""`). **As fotos dos produtos do Cardápio são `background-image`**, sem alt nenhum | média | `<img>` com alt descritivo ("Pão de fermentação natural fatiado") e alt vazio só nas imagens decorativas |
| 12 | **Página pesada: hero em PNG de 3 a 4 MB** | Home com ~6,4 MB. Hero desktop em PNG de 2,9 MB e mobile em PNG de 4,2 MB. LCP de 1992 ms com cache morno. Só 12 de 47 imagens em webp. .otf em vez de woff2 | média | AVIF ou WebP com `srcset`, hero ≤ 200 KB, `fetchpriority="high"` no LCP, lazy loading no resto, fontes woff2 com subset. Meta: < 1 MB na primeira dobra e LCP < 2,5 s em 4G |
| 13 | **reCAPTCHA e 5 rastreadores em todas as páginas** | reCAPTCHA (348 KB) carregado na home. O badge fixo cobre conteúdo no mobile, por exemplo a nota de preço em `benjamin-390-produto.png`. GTM, FB Pixel, Hotjar, Clarity e DoubleClick | média | Sem formulário, sem captcha. Analytics leve (1 script, sem cookies) carregado depois da interação |
| 14 | **Links quebrados ou enganosos** | Os 6 tiles de categoria vão para `menu` sem âncora (a pessoa cai no topo do cardápio). Os cards de unidade na home têm `cursor:pointer` mas nenhum link | média | Cada categoria leva para `/cardapio#categoria` com rolagem até a seção. Nada com cara de clicável sem ser clicável |
| 15 | **HTML inválido: link dentro de link** | Em `/menu`, cada `a.item` contém `a.link-item` ("Peça no ifood") | média | O card é um `<article>`. Nome e foto levam ao detalhe e "Adicionar" é um `<button>` separado |
| 16 | **Cardápio cansativo no mobile** | 26.394px de altura. O header, a barra de categorias e a busca fixos ocupam ~230px (27% de uma tela de 844px) | média | Barra de categorias fixa com no máximo 56px e busca dentro de um ícone. No mobile, cards em lista (foto 88px + nome + preço + botão "+") para caber mais itens por tela (estimativa, não medido) |
| 17 | **Foco de teclado genérico e sem "pular para o conteúdo"** | O foco é o outline padrão do navegador (`auto 1px #005FCC`) e o plugin do Instagram zera o outline (`outline: 0`). Não há skip link. O hambúrguer é uma `<div>` sem `aria-label` nem `aria-expanded`. O ícone de usuário é um link sem nome acessível | média | `:focus-visible` com anel de 3px no acento e offset de 2px, skip link, `<button aria-expanded>` no menu e `aria-label` em todo ícone |
| 18 | **Identidade quebrada em Unidades** | Iframe com Roboto, verde-escuro, raios de 16px e logo repetido. A distância aparece como "1731.80KM" sem localização. O botão de rota é só um ícone | média | Unidades (ou "Onde estamos") nativo, com a mesma tipografia, horário, link "Como chegar" com texto e distância só depois de a pessoa permitir a localização |
| 19 | **Fonte faltando** | `Gopher-Bold` não carrega e os nomes dos depoimentos saem em Times | baixa | Fontes do Google com `display=swap` e fallback métrico parecido (`size-adjust`) |
| 20 | **Textos e microcópia descuidados** | "Todos as cestas", "R$ Consulte", preço quebrando em 2 linhas ("R$ / 140,00"), "Mais informações" vazio na página do produto | baixa | Revisão de texto, preço com `white-space: nowrap` e nenhum rótulo sem conteúdo |
| 21 | **Menu com link interno de funcionário em destaque** | O ícone de usuário no header leva para `colaborador.../login` | baixa | O header só tem o que interessa ao cliente: Cardápio, Encomendas, Onde estamos e o carrinho |
| 22 | **Rolagem horizontal** | Não houve: `scrollWidth` 375 com `innerWidth` 390 (a diferença é a barra de rolagem) nas páginas testadas | — | Manter assim, testando em 360px |

---

## (e) Diretrizes de estilo da Fornada (sistema visual original)

> **Regra de originalidade.** Nada do Benjamin pode ser reutilizado: **nenhum texto, slogan, título ("queridinhos", "Tradição…"), logo, estrela ou ornamento, foto, ilustração ou selo, ícone, nome de produto ou cesta, depoimento ou nome de unidade.** Também não usar as fontes Mackay ou Gopher nem os hex #7F554E, #F4EED3, #FF632C, #9EBBAB e #C59274. Aproveitamos só **princípios**: serifada calorosa com sans limpa, paleta curta e quente com um acento, foto grande, respiro editorial e cantos retos. Todas as fotos da Fornada são próprias, geradas ou de banco com licença, e os textos são escritos do zero.

### Paleta própria (tema "forno a lenha")

| Token | Hex | Uso | Contraste verificado |
|---|---|---|---|
| `--casca` | **#3B2418** | títulos, texto forte, rodapé | 13.43 sobre `--miolo` |
| `--miolo` | **#FBF6EC** | fundo base (off-white de farinha) | — |
| `--trigo` | **#EFDDB5** | fundo de seção alternada e cards de destaque | `--casca` sobre ele: 10.80 |
| `--brasa` | **#B83A12** | acento e CTA primário ("Adicionar", "Ver pedido") | branco sobre ele: **5.75**; ele sobre `--miolo`: 5.34 |
| `--brasa-escura` | #962E0C | hover e pressed do CTA | — |
| `--alecrim` | **#1F6B47** | botão "Enviar pelo WhatsApp", status "Aberto agora" | branco sobre ele: **6.46** |
| `--mel` | **#E0A43A** | ornamento, selo "novo", sublinhado decorativo (nunca texto sobre claro) | sobre `--casca`: 6.57 |
| `--cinza-forno` | #6B5B50 | texto secundário, legendas | 6.02 sobre `--miolo`; 4.84 sobre `--trigo` |
| `--linha` | #8F7A66 | borda de input e divisores funcionais | 3.79 sobre `--miolo` (≥ 3:1) |

Regras de uso:
- `--brasa` como **texto** só sobre `--miolo` ou branco. Sobre `--trigo` dá 4.29, então lá só em texto grande (≥ 24px ou ≥ 19px bold).
- Não usar o verde oficial do WhatsApp (#25D366) com texto branco, porque dá 1.98:1. O ícone do WhatsApp pode ser branco sobre `--alecrim`.
- Um acento por tela: `--brasa` é a ação e `--mel` só enfeita.

### Tipografia (Google Fonts)

| Papel | Fonte | Por quê |
|---|---|---|
| Display e títulos | **Fraunces** (variável; eixo `SOFT` 50–100, `opsz` automático, pesos 500–600) | Serifada "fofa" e calorosa, com personalidade de forno artesanal. É diferente da Mackay mas tem o mesmo espírito |
| Texto e UI | **Figtree** (400, 500, 600, 700) | Sans geométrica e amigável, muito legível em 14–16px, com números tabulares para preço |

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght,SOFT@9..144,500..600,50..100&family=Figtree:wght@400;500;600;700&display=swap" rel="stylesheet">
```

Escala (mobile → desktop, com `clamp`):

| Nível | Fonte | Tamanho | line-height | tracking |
|---|---|---|---|---|
| h1 | Fraunces 600, SOFT 100 | 36 → 64px | 1.05 | -0.02em |
| h2 | Fraunces 500 | 28 → 44px | 1.1 | -0.01em |
| h3 (card) | Figtree 600 | 17 → 20px | 1.3 | 0 |
| corpo | Figtree 400 | 16 → 17px | 1.55 | 0 |
| legenda | Figtree 500 | 14px | 1.4 | 0 |
| preço | Figtree 700, `font-variant-numeric: tabular-nums` | 18 → 20px | 1 | 0 |
| botão | Figtree 600 | 16px | 1 | 0.01em |
| etiqueta ou kicker | Figtree 600, caixa alta | 12px | 1 | 0.08em |

Assinatura própria da Fornada: no lugar da "palavra em bold + estrela", usar **uma palavra do título em Fraunces itálico, com um sublinhado ondulado em `--mel`**, como uma "marca de fermentação". Por exemplo: "Pão *de verdade*, saindo agora".

### Layout e componentes

- **Container**: `max-width: 1120px`, gutter de 20px no mobile e 32px no desktop. Seções com `padding-block: clamp(56px, 8vw, 112px)`.
- **Ritmo de fundo**: `--miolo` → `--trigo` → `--miolo` → `--casca` (rodapé). No máximo uma faixa escura antes do rodapé.
- **Grid**: 12 colunas no desktop, 4 no mobile. Splits 5/7 (texto/foto) em vez de 50/50.
- **Cantos**: 2px em cards e imagens (quase reto, estética de papel) e 999px só em chips e contador do carrinho. Botões com 4px.
- **Sombras**: nenhuma em cards. Só o header ao rolar (`0 1px 0 rgba(59,36,24,.08)`) e o painel do carrinho (`0 -8px 24px rgba(59,36,24,.12)`).
- **Header**: 64px, fundo `--miolo`. Logo em texto (Fraunces), Cardápio, Encomendas, Onde estamos, botão do WhatsApp e ícone do carrinho com contador. No mobile, hambúrguer em `<button aria-expanded>` e o carrinho sempre visível.
- **Card de produto**: foto 4:5 com `<img alt>`, nome, 1 linha de descrição, preço em R$ e um botão "Adicionar" de 48px de altura (vira o seletor − 1 + depois de adicionar). No mobile o cardápio usa uma lista compacta.
- **Barra de pedido fixa (mobile)**: aparece quando o carrinho tem item, com 56px, "Ver pedido · 3 itens · R$ 42,00" em `--brasa`.
- **Checkout WhatsApp**: nome, retirada ou entrega (com bairro e taxa), horário desejado e observação, depois "Enviar pelo WhatsApp" (`--alecrim`), que abre `https://wa.me/55DDDNUMERO?text=` com a mensagem codificada (itens, quantidades, subtotal, taxa, total, modo e horário).
- **Informação útil sempre à mão**: faixa de status ("Aberto agora · fecha às 19h" ou "Fechado · abre amanhã às 6h"), endereço com "Como chegar" e horário por dia no rodapé.
- **Foco**: `:focus-visible { outline: 3px solid var(--brasa); outline-offset: 2px; }` e skip link.
- **Movimento**: fade ou subida de no máximo 12px e 200ms. Sem autoplay. Tudo desligado com `prefers-reduced-motion`.
- **Ícones**: linha de 1.5px em uma cor (`--casca`), de um set aberto (Lucide ou Phosphor). Nenhum ícone copiado.
- **Imagens**: AVIF ou WebP com `srcset`, hero ≤ 200 KB, `fetchpriority="high"` na do LCP e `loading="lazy"` no resto.
- **Alvos**: no mínimo 44×44, e botões primários com 48px.

---

## Arquivos de print salvos

Pasta: `/Users/gabrielalmeidasantosmelo/projetos/padaria-fornada/docs/referencia/`

**Desktop 1440×900**
- `benjamin-1440-home-topo.png`: header e hero
- `benjamin-1440-home-full.png`: home inteira (algumas seções aparecem vazias por causa da animação AOS)
- `benjamin-1440-queridinhos.png`: carrossel de destaques, sem preço
- `benjamin-1440-tradicao.png`: split com foto e bloco marrom
- `benjamin-1440-categorias.png`: tiles de categoria
- `benjamin-1440-unidades-home.png`: carrossel de lojas na home
- `benjamin-1440-cestas-home.png`: carrossel de cestas
- `benjamin-1440-depoimentos.png`: depoimentos, com o nome saindo em Times
- `benjamin-1440-instagram.png`: grid do Instagram
- `benjamin-1440-footer.png`: rodapé
- `benjamin-1440-foco-teclado.png`: foco padrão do navegador em "Cestas"
- `benjamin-1440-cardapio.png`: sidebar e grid com "$" e "Peça no ifood"
- `benjamin-1440-padaria-topo.png`, `benjamin-1440-padaria-linhadotempo.png`: A Padaria, com a linha do tempo de baixo contraste
- `benjamin-1440-unidades.png`, `benjamin-1440-unidades-cards.png`: iframe com outra identidade e "1731.80KM"
- `benjamin-1440-cestas.png`: preços em R$ quebrando linha
- `benjamin-1440-encomendas-topo.png`, `benjamin-1440-encomendas-escolha.png`: Encomendas
- `benjamin-1440-encomendas-pf-404.png`: **404 do fluxo de encomenda**
- `benjamin-1440-fale-conosco.png`: formulário com bordas e botão de baixo contraste

**Mobile 390×844**
- `benjamin-390-home-topo.png`, `benjamin-390-home-full.png`
- `benjamin-390-menu-aberto.png`: menu mobile, com o ícone de usuário quase invisível
- `benjamin-390-queridinhos.png`, `benjamin-390-categorias.png`, `benjamin-390-unidades-home.png`
- `benjamin-390-cardapio-topo.png`, `benjamin-390-cardapio-produtos.png`: barra fixa ocupando ~27% da tela
- `benjamin-390-produto.png`: página de produto, com o preço em verde claro e o badge do reCAPTCHA cobrindo a nota
- `benjamin-390-encomendas.png`
- `benjamin-390-unidades.png`
