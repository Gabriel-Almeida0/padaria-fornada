# Prompts das imagens — Fornada Padaria

Este documento serve para gerar as **27 imagens finais** do site numa IA de imagem e trocar os
placeholders sem mexer em código. Cada seção traz: arquivo, tamanho, onde aparece, o que o corte
exige, um **prompt em inglês** pronto para colar, um **negative prompt** e uma linha em português
explicando a intenção.

Fonte das dimensões e dos textos alternativos: `scripts/manifesto-imagens.json`. Se este documento
e o JSON divergirem, vale o JSON. A foto de cada produto tem que **bater com a descrição do
cardápio** (`src/content/cardapio.ts`) e com o `alt` do manifesto: se o texto diz "calda de laranja
por cima", a foto mostra a calda por cima.

---

## 1. Como usar

1. Gere a imagem com o prompt da seção. Se a ferramenta não guarda contexto entre gerações, cole o
   **bloco de estilo comum** (abaixo) no fim do prompt — os prompts de produto já trazem o essencial
   dele, mas repetir não atrapalha.
2. Recorte e redimensione para o **tamanho exato em pixels** da tabela (não só a proporção).
3. Exporte em **JPEG, sRGB, qualidade ≈ 80**, com peso **até 250 KB** (os cards de produto costumam
   ficar entre 90 e 180 KB). O **`hero.jpg` tem teto de 200 KB**, porque é a maior imagem da
   primeira dobra (LCP); se passar, desça a qualidade para 72–76. Sem EXIF de GPS, sem perfil de cor
   exótico (Display P3, Adobe RGB → converta para sRGB).
4. Salve em `public/images/` **com o mesmo nome e a mesma pasta** do placeholder, substituindo o
   arquivo. Os produtos ficam em `public/images/produtos/<id>.jpg`. Nenhuma linha de código muda: o
   componente lê largura, altura e alt do manifesto, então não há salto de layout.
5. Apague a pasta `.next/cache/images` (ou pare e suba de novo o `npm run dev`) e recarregue a
   página — senão o otimizador do Next continua servindo a versão antiga em cache.
6. **Não rode `npm run placeholders -- --force`** depois de trocar: o `--force` sobrescreve as suas
   fotos com placeholders. O `npm run placeholders` normal pula arquivos que já existem, então é
   seguro.

**Atalho para recortar e exportar** (o projeto já tem o `sharp` instalado). Rode na raiz do
projeto, trocando entrada, largura, altura e saída:

```bash
node -e "require('sharp')('gerada.png').resize(800, 1000, { fit: 'cover', position: 'centre' }).jpeg({ quality: 80, mozjpeg: true }).toFile('public/images/produtos/croissant.jpg').then(i => console.log(i.width + 'x' + i.height, Math.round(i.size / 1024) + ' KB'))"
```

O `sharp` já converte para sRGB e remove os metadados. Se o peso passar do teto, repita com
`quality: 74`.

### Tabela rápida

| # | Arquivo (em `public/images/`) | Tamanho (px) | Proporção | Onde aparece |
|---|---|---|---|---|
| 1 | `hero.jpg` | 1200 × 1500 | 4:5 | Hero, coluna da foto ao lado do título (mobile: abaixo do texto) |
| 2 | `sobre.jpg` | 1200 × 1500 | 4:5 | Sobre, coluna da foto ao lado dos parágrafos |
| 3 | `encomendas.jpg` | 1600 × 1000 | 16:10 | Abertura da seção Encomendas |
| 4 | `fachada.jpg` | 1200 × 900 | 4:3 | Onde estamos |
| 5 | `og.jpg` | 1200 × 630 | 1.91:1 | Prévia de link (WhatsApp, redes). Não aparece na página |
| 6–27 | `produtos/<id>.jpg` (22 arquivos) | 800 × 1000 | 4:5 | Cards de produto: vitrine "Os mais pedidos", cardápio e encomendas |

### Proporção por ferramenta

| Proporção | Midjourney | ChatGPT / DALL·E | Flux / Stable Diffusion (gerar e depois ampliar) |
|---|---|---|---|
| 4:5 (hero, sobre, 22 produtos) | `--ar 4:5` | pedir "vertical" (1024×1536) e recortar para 4:5 | 896 × 1120 e ampliar 2× |
| 16:10 (encomendas) | `--ar 16:10` | horizontal (1536×1024) e recortar para 16:10 | 1280 × 800 e ampliar 2× |
| 4:3 (fachada) | `--ar 4:3` | horizontal (1536×1024) e recortar para 4:3 | 1152 × 864 e ampliar |
| 1.91:1 (og) | `--ar 191:100` | horizontal (1536×1024) e recortar para 1200×630 | 1344 × 704 e recortar |

- **Midjourney**: acrescente `--style raw --v 7` (ou a versão atual) para um visual fotográfico e
  menos "ilustrado"; o negative prompt vai em `--no ...` (só os termos, separados por vírgula).
  Depois de acertar a primeira foto de produto, use-a como referência de estilo (`--sref <url>`) em
  todas as outras — é o jeito mais fácil de manter o mesmo set.
- **ChatGPT / DALL·E**: não há campo de negative prompt — cole "Avoid: ..." com os termos no fim do
  prompt. Gere todos os produtos na **mesma conversa** e comece cada pedido com "Same set, same
  light and same props as the previous photos".
- **Flux**: costuma ignorar negative prompt; mantenha "no text, no logos, no labels" dentro do
  próprio prompt. Fixe a seed entre os produtos e, se tiver, use Flux Redux/Kontext com a primeira
  foto boa como referência.
- Se a ferramenta gerar menor que o tamanho final, amplie com um upscaler (2×) e só então recorte.

### Consistência entre as imagens

- **Um só set fotográfico para os 22 produtos**: a mesma **bancada comprida de madeira clara de
  freijó** (veio reto, tom mel-claro, levemente enfarinhada), a mesma **parede de reboco/cal creme**
  desfocada ao fundo, a mesma **luz natural de janela vinda da esquerda**, difusa, de manhã, com
  sombras suaves caindo para a direita. Cor fiel, sem filtro, sem granulação pesada.
- **Um só ângulo**: câmera a **~40° de altura** (a "vista de quem está em pé na bancada"), lente
  50 mm, foco nítido no produto e fundo suave. **Exceções top-down (90°)**, porque o produto se lê
  melhor de cima: **focaccia** (assadeira com as covinhas) e **cappuccino** (a espuma). Nenhuma
  outra foto muda de ângulo.
- **Uma só paleta de props**, sempre pouca coisa e só o que o produto pede: pratos, xícaras e
  tigelas de **cerâmica/grés creme** fosca, **linho cru** (guardanapo cor de aveia, sem estampa),
  **papel manteiga liso** (sem estampa), uma **pedra clara** ocasional, e no máximo um detalhe de cor
  da marca por foto (um raminho de alecrim, uma laranja, um pote de mel). Nada de marcas, rótulos,
  texto, embalagens com logo, talheres com gravação.
- **O mesmo pão em todo lugar**: o pão de fermentação natural da casa é sempre *a round sourdough
  boule with a deep golden-mahogany crust, one cross-shaped score opened into raised crispy edges,
  a light dusting of flour*. Ele aparece no hero, no card dele, na og e cortado em fatias no
  sanduíche de pernil. O **bolo de laranja** do card é o mesmo da foto de Encomendas, e a **cesta de
  café da manhã** também.
- **A mesma padaria** no hero, no sobre, nas encomendas e na fachada: bancada de freijó, parede
  creme, luz de manhã, um toque de terracota (o toldo, uma cerâmica).
- **Pessoas**: no máximo **mãos e antebraços** (só no `sobre.jpg`). **Nenhum rosto** em nenhuma
  imagem — evita cara de banco de imagem e qualquer problema de semelhança com gente real. Quando
  as mãos aparecem, use a descrição fixa: *a woman baker's hands and forearms, light-brown skin,
  short natural unpainted nails, no rings or jewelry, sleeves of an off-white linen shirt rolled up,
  an oat-colored raw linen apron dusted with flour*.
- Não use nomes de pessoas reais, de marcas nem "no estilo de" fotógrafos.

### O que não copiar da referência

A referência (`docs/referencia/auditoria-referencia.md` (fora do repositório público), item (c) 3) vale só como **princípio**: foto
de produto grande, retrato, luz natural, madeira e pedra, sem molduras. Nada de recriar as fotos
deles. Em especial, **evite**: cesta de vime cheia de croissants com potinhos de geleia e colherinhas
de madeira; moedor de café manual de madeira; papel com estampa de estrelinhas verdes; guardanapo
verde; tábua de bambu; fundo de pedra bege texturizada ocupando tudo; croissant recheado de geleia
sobre papel estampado. A Fornada tem bancada de freijó, parede creme e linho cru — é outro set.

### Bloco de estilo comum (acrescentar a todo prompt)

```
natural-light food photography for a small artisan neighborhood bakery in São Paulo, Brazil, soft diffused morning daylight from a large window on the left, gentle soft shadows falling to the right, a long light-toned freijó wood workbench with straight grain and a faint dusting of flour, a warm cream lime-plaster wall softly out of focus in the background, props limited to matte cream stoneware, raw undyed linen and plain unprinted parchment paper, warm natural palette of deep crust brown #3B2418, cream #FBF6EC and wheat #EFDDB5 with small touches of terracotta #B83A12, rosemary green #1F6B47 and honey #E0A43A, true-to-life colors, realistic textures, crisp focus on the food, 50mm lens, no text, no letters, no logos, no labels, no packaging, no watermark
```

### Negative prompt comum

```
text, letters, words, typography, logo, brand name, label, packaging, price tag, signage, watermark, signature, frame, border, collage, cartoon, illustration, 3d render, CGI, plastic-looking food, oversaturated, HDR, harsh flash, cold blue light, dark moody background, cluttered props, star-pattern paper, green napkin, coffee grinder, bamboo board, human face, extra fingers, deformed hands, blurry, low resolution, jpeg artifacts
```

---

## 2. As imagens da página

### Imagem 1 — Hero — `hero.jpg`

- **Arquivo**: `public/images/hero.jpg` — **1200 × 1500 px (4:5)**, peso **≤ 200 KB**.
- **Onde aparece**: hero da home (fundo `miolo`), split 5/7: no desktop o título "Pão *de verdade*,
  saindo agora", o apoio e os botões ficam **na coluna ao lado**, não sobre a foto; no celular a
  foto vem **abaixo do texto**, na largura toda. É a imagem carregada com prioridade (LCP).
- **Corte**: nenhum texto fica por cima, então a foto pode ser **cheia**, sem área vazia reservada.
  A proporção é a mesma em todas as telas; cantos de 2 px. Mantenha o pão no centro, levemente
  abaixo do meio, com respiro de ~10% em volta; o fundo da parte de cima pode ser a parede creme e
  a janela desfocadas.
- **Intenção (pt-BR)**: o cheiro de pão saindo do forno — o pão da casa, casca aberta e dourada,
  ainda soltando vapor na bancada enfarinhada, antes de qualquer texto.

**Prompt**

```
Vertical 4:5 food photograph inside a small artisan bakery at early morning. A freshly baked round sourdough boule with a deep golden-mahogany crust, one cross-shaped score opened into raised crispy edges, a light dusting of flour, resting on a long light-toned freijó wood workbench generously dusted with flour, faint wisps of steam rising from the crust. Behind it, softly out of focus: a second loaf, a round cane proofing basket, a folded raw linen cloth and a warm cream lime-plaster wall with a tall window on the left. Soft diffused morning daylight from the window on the left, gentle shadows falling to the right, warm and calm. Camera at about 40 degrees, the loaf centered slightly below the middle with generous breathing room. 50mm lens, f/2.8, shallow depth of field. Natural-light food photography, warm palette of crust brown, cream and wheat with a tiny terracotta accent, true-to-life colors, realistic texture, no people, no text, no logos, no labels, no watermark.
```

**Negative prompt**

```
text, logo, label, watermark, people, hands, face, burnt crust, pale underbaked bread, sliced bread, butter knife, jam jars, croissant basket, coffee grinder, cold light, dark moody background, oversaturated, cartoon, 3d render
```

---

### Imagem 2 — Sobre — `sobre.jpg`

- **Arquivo**: `public/images/sobre.jpg` — **1200 × 1500 px (4:5)**
- **Onde aparece**: seção "Sobre a Fornada — Uma padaria que acorda antes da rua" (fundo `miolo`),
  split 7/5: a foto fica numa coluna ao lado dos três parágrafos e dos números ("36 h", "5h"…). No
  celular vem em largura cheia.
- **Corte**: 4:5 fixo, sem texto por cima. **Enquadramento do peito para baixo** — o rosto fica
  fora do quadro (nada de queixo cortado pela metade: corte na altura dos ombros/peito). Mãos e
  massa no centro, ~10% de respiro.
- **Intenção (pt-BR)**: o trabalho de madrugada — as mãos da padeira modelando a massa na mesma
  bancada comprida do texto ("um forno, uma bancada comprida e um fermento que veio de casa").

**Prompt**

```
Vertical 4:5 photograph of a baker shaping bread dough on a long light-toned freijó wood workbench covered in flour, framed from the chest down so no face is visible. A woman baker's hands and forearms, light-brown skin, short natural unpainted nails, no rings or jewelry, sleeves of an off-white linen shirt rolled up, an oat-colored raw linen apron dusted with flour; her hands cup and tuck a smooth round ball of dough, flour on her fingers and on the apron. Beside the dough: a metal bench scraper and a small pile of flour; in the soft-focus background, a few round cane proofing baskets and a warm cream lime-plaster wall. Soft diffused early-morning daylight from a window on the left, gentle shadows to the right. Camera at about 40 degrees, hands and dough centered with breathing room. 50mm lens, f/2.8. Natural-light documentary food photography, warm palette of crust brown, cream and wheat, true-to-life skin and flour texture, realistic, fictional person, no face, no text, no logos, no watermark.
```

**Negative prompt**

```
face, head, eyes, smile, portrait, chef hat, gloves, rings, painted nails, tattoos with letters, extra fingers, deformed hands, fused fingers, text, logo, embroidered brand on apron, watermark, messy kitchen, stainless industrial kitchen, cold light, cartoon, 3d render
```

---

### Imagem 3 — Encomendas — `encomendas.jpg`

- **Arquivo**: `public/images/encomendas.jpg` — **1600 × 1000 px (16:10)**
- **Onde aparece**: abertura da seção "Encomendas — Bolo para a festa, cesta para presentear" (fundo
  `trigo`), antes do "Como funciona" e dos 4 cards de encomenda.
- **Corte**: 16:10, sem texto por cima. Em telas estreitas a foto encolhe inteira (não há recorte
  lateral previsto), mas mantenha bolo e cesta nos **80% centrais** para garantir. Evite muito creme
  nas bordas, porque a seção já tem fundo trigo — a foto precisa se destacar dele (a madeira mais
  quente e as sombras resolvem).
- **Consistência**: o bolo é **o mesmo do card `bolo-laranja`** e a cesta é **a mesma do card
  `cesta-cafe-manha`**.
- **Intenção (pt-BR)**: a mesa da ocasião — o bolo de laranja com calda brilhando, a cesta de café
  da manhã e as xícaras, como se a família estivesse para sentar.

**Prompt**

```
Horizontal 16:10 photograph of a set breakfast table for a small celebration at home, seen at about 40 degrees. On a light-toned freijó wood table with a raw undyed linen runner: in the center-left, a round orange cake on a matte cream stoneware cake stand, its top covered in a glossy orange syrup glaze that drips down the sides, thin strips of orange zest on top; in the center-right, a woven wicker hamper lined with raw linen holding a small sourdough loaf, two butter croissants, a plain glass jar of homemade apricot jam with a linen cloth lid and no label, a small bunch of grapes and a tangerine, and a small glass bottle of orange juice with no label; in front, two cream stoneware cups of black coffee on saucers and a few cake plates. Soft diffused morning daylight from a window on the left, gentle shadows to the right, warm cream lime-plaster wall softly out of focus behind. Main subjects within the central 80 percent of the frame. 35mm lens, f/4. Natural-light food photography, warm palette of crust brown, cream, wheat and orange with a tiny terracotta accent, true-to-life colors, realistic, no people, no text, no logos, no labels, no watermark.
```

**Negative prompt**

```
text, letters, happy birthday sign, candles with numbers, balloons, logo, label on jar, branded bottle, watermark, people, hands, faces, croissants piled in a basket with jam ramekins, coffee grinder, star-pattern paper, green napkin, cluttered table, plastic tableware, cold light, cartoon, 3d render
```

---

### Imagem 4 — Fachada — `fachada.jpg`

- **Arquivo**: `public/images/fachada.jpg` — **1200 × 900 px (4:3)**
- **Onde aparece**: seção "Onde estamos" (fundo `trigo`), junto do endereço (Rua do Fermento, 212,
  Vila Serena — fictício), dos horários e do "Como chegar".
- **Corte**: 4:3, sem texto por cima. Loja no centro, com a esquina e um pouco de rua visíveis;
  nada importante a menos de 5% das bordas.
- **Letreiro**: IA de imagem **costuma errar letras** (troca, duplica ou inventa caracteres). O
  recomendado é **gerar sem texto nenhum** (o prompt abaixo pede uma faixa lisa acima do toldo) e,
  se quiser o nome, **aplicar "FORNADA" depois** num editor (Figma, Canva, Photopea), em Fraunces
  600, cor casca `#3B2418` ou creme, como se fosse pintado na faixa. Também é perfeitamente aceitável
  **ficar sem letreiro** — o site já diz o nome em volta. Se tentar gerar com texto, confira letra por
  letra antes de usar.
- **Intenção (pt-BR)**: a padaria de esquina do bairro — reconhecível na rua, com toldo terracota,
  vitrine de pães e um banco na calçada para quem espera o pão.

**Prompt (sem texto — recomendado)**

```
Horizontal 4:3 street photograph of a small artisan bakery on a street corner in a quiet, tree-lined residential neighborhood of São Paulo, Brazil, early morning. A two-story corner building with warm cream lime-plaster walls, the bakery on the ground floor with a large shop window framed in dark brown wood showing loaves of bread and pastries on wooden shelves, a glass door, and a straight terracotta-colored canvas awning over the window. Above the awning, a plain smooth cream band on the wall, completely blank. A simple wooden bench on the sidewalk under the window, a potted rosemary plant by the door. Leafy street trees casting soft dappled shadows, low houses and a few plants in the background, a clean concrete sidewalk. Soft warm morning sunlight coming from the left. Eye-level view from across the street at a slight diagonal to show the corner, the shop centered with some street around it. 35mm lens, f/5.6. Natural documentary architecture photography, warm palette of cream, wood brown and terracotta #B83A12 with green leaves, true-to-life colors, realistic, no people, no cars in front, no text, no letters, no sign, no logos, no graffiti, no watermark.
```

**Negative prompt**

```
text, letters, words, sign with writing, neon sign, logo, brand name, graffiti, street numbers, license plates, posters, people, faces, crowded street, parked cars blocking the shop, shopping mall, high-rise towers dominating, night, rain, cold blue light, European old-town cobblestones, Paris café awning stripes, cartoon, 3d render
```

**Variante com letreiro pintado (só se a ferramenta escrever bem)** — troque "a plain smooth cream
band on the wall, completely blank" por:

```
a smooth cream band on the wall with the single word "FORNADA" hand-painted in large dark brown serif capital letters, centered
```

E tire `text, letters, words, sign with writing` do negative prompt. Confira a grafia.

---

### Imagem 5 — Prévia de compartilhamento — `og.jpg`

- **Arquivo**: `public/images/og.jpg` — **1200 × 630 px (1.91:1)**
- **Onde aparece**: não aparece na página; é a imagem que o WhatsApp, Instagram, LinkedIn e X
  mostram quando alguém compartilha o link (Open Graph).
- **Corte**: deixe a **faixa esquerda (~45%) calma** — madeira e parede creme lisas, sem objetos —
  para aplicar o nome depois. Os produtos ficam do **centro para a direita**: algumas plataformas
  (inclusive o WhatsApp em certas telas) recortam a prévia num **quadrado central**, e aí o que
  precisa aparecer é pão, não parede vazia.
- **Título**: IA erra letras. Gere **sem texto** e escreva num editor, na área calma da esquerda:
  "Fornada" em Fraunces 600, cor casca `#3B2418`, e embaixo "Padaria de bairro · Vila Serena" em
  Figtree 500, cor cinza-forno `#6B5B50`. Nada de texto em `mel` (não tem contraste sobre claro).
- **Intenção (pt-BR)**: um cartão de visita que diz "padaria artesanal, luz de manhã, pão de verdade"
  na miniatura do WhatsApp.

**Prompt**

```
Wide 1.91:1 banner food photograph. The left 45 percent of the frame is a calm, clean area of light-toned freijó wood workbench and a warm cream lime-plaster wall, completely empty to leave room for a title. From the center to the right: a round sourdough boule with a deep golden-mahogany crust and one cross-shaped score opened into raised crispy edges, a butter croissant with visible layers, a few golden cheese breads (pão de queijo) and a cinnamon roll with a light white glaze, arranged loosely on the flour-dusted wood with a folded raw linen cloth and a sprig of rosemary. Soft diffused morning daylight from a window on the left, gentle shadows to the right. Camera at about 40 degrees, 50mm lens, f/4. Natural-light food photography, warm palette of crust brown, cream and wheat with small touches of terracotta, rosemary green and honey, true-to-life colors, realistic, no people, no text, no letters, no logos, no watermark.
```

**Negative prompt**

```
text, letters, typography, logo, watermark, objects on the left side, clutter, crumbs everywhere, people, hands, faces, croissant basket with jam ramekins, coffee grinder, star-pattern paper, green napkin, dark background, cold light, cartoon, 3d render
```

---

## 3. Os 22 cards de produto — regras comuns

- **Arquivos**: `public/images/produtos/<id>.jpg` — **800 × 1000 px (4:5)** cada, peso até 250 KB
  (o normal é 90–180 KB).
- **Onde aparecem**: no card vertical (vitrine "Os mais pedidos", grade do cardápio no desktop e
  cards de Encomendas), a foto é 4:5 com cantos de 2 px, largura toda do card. **No celular, o
  cardápio vira lista compacta com uma miniatura de 88 px de largura** — nesse tamanho só sobrevive
  o miolo da imagem.
- **O que o corte exige**: **produto centralizado, com margem de respiro de ~15% em volta**, e
  **inteiro e legível num corte quadrado central** (o quadrado 800 × 800 no meio da foto). Pense na
  miniatura de 88 px: se o produto encostar na borda, sair do quadrado central ou ficar pequeno
  demais no meio de muita bancada, vira uma mancha marrom. Props só nas bordas e desfocados.
- **Set único**: todos na mesma bancada de freijó, mesma parede creme ao fundo, mesma luz de janela
  à esquerda, câmera a ~40° — exceto **focaccia** e **cappuccino**, que são **top-down (90°)**.
- Todo prompt de produto termina com a mesma frase de enquadramento e estilo, já incluída abaixo.
- **Destaques** (também aparecem em "Os mais pedidos", a primeira vitrine da home): pão de
  fermentação natural, pão de queijo, croissant, rolinho de canela, sanduíche de pernil e bolo de
  laranja. Capriche nesses seis primeiro.

---

### Imagem 6 — Pão de fermentação natural — `produtos/pao-fermentacao-natural.jpg`

- **Arquivo**: `public/images/produtos/pao-fermentacao-natural.jpg` — **800 × 1000 px (4:5)**
- **Onde aparece**: card de produto (categoria Pães) e vitrine "Os mais pedidos" (destaque).
- **Corte**: pão redondo inteiro dentro do quadrado central, corte em cruz virado para a câmera.
- **Intenção (pt-BR)**: o pão da casa — casca grossa que estala, bem dourada, com o corte em cruz
  aberto. O mesmo pão do hero.

```
Vertical 4:5 food photograph of a single round sourdough boule with a deep golden-mahogany thick crust, one cross-shaped score opened into raised crispy edges, a light dusting of flour, sitting on a light-toned freijó wood workbench lightly dusted with flour. A folded raw linen cloth softly out of focus at the edge. Camera at about 40 degrees. The product centered with generous breathing room, about 15 percent margin on every side, fully readable inside the central square of the frame. Soft diffused morning daylight from a window on the left, gentle shadows to the right, warm cream lime-plaster wall out of focus behind. 50mm lens, f/2.8. Natural-light food photography, warm palette of crust brown, cream and wheat, true-to-life colors, realistic texture, no text, no logos, no labels, no watermark.
```

Negative: comum + `sliced loaf, bread knife, pale crust, burnt crust, oval loaf, seeds on top`

---

### Imagem 7 — Baguete da casa — `produtos/baguete.jpg`

- **Arquivo**: `public/images/produtos/baguete.jpg` — **800 × 1000 px (4:5)**
- **Onde aparece**: card de produto (categoria Pães).
- **Corte**: baguete é comprida e o quadro é vertical — deite as duas **na diagonal**, com a
  baguete partida mostrando o miolo **bem no centro**; as pontas podem sair do quadro, o miolo
  aberto não.
- **Intenção (pt-BR)**: comprida, fina e crocante do bico ao fim — e o miolo aberto provando.

```
Vertical 4:5 food photograph of two long thin crusty baguettes lying diagonally across a light-toned freijó wood workbench lightly dusted with flour; one baguette is broken in half by hand, the torn ends in the center of the frame showing an open airy crumb and a crackly golden crust with sharp ears from the scoring. A few crumbs of crust around. Camera at about 40 degrees. The broken ends centered with generous breathing room, the key detail fully readable inside the central square of the frame; the far tips may run off the edges. Soft diffused morning daylight from a window on the left, gentle shadows to the right, warm cream lime-plaster wall out of focus behind. 50mm lens, f/2.8. Natural-light food photography, warm palette of crust brown, cream and wheat, true-to-life colors, realistic texture, no text, no logos, no paper bag with print, no watermark.
```

Negative: comum + `paper bag with logo, sliced baguette, sandwich, butter, cheese board, pale soft crust`

---

### Imagem 8 — Pão francês (6 un.) — `produtos/pao-frances.jpg`

- **Arquivo**: `public/images/produtos/pao-frances.jpg` — **800 × 1000 px (4:5)**
- **Onde aparece**: card de produto (categoria Pães).
- **Corte**: a cesta inteira dentro do quadrado central; os seis pães contáveis.
- **Intenção (pt-BR)**: o pão de todo dia, do jeito certo — seis pães franceses dourados, com a
  pestana aberta, numa cesta de palha forrada com pano.

```
Vertical 4:5 food photograph of exactly six Brazilian French rolls (pão francês), small oval rolls with thin crackly golden crust and a single open split along the top, piled in a shallow round woven straw basket lined with a plain off-white cotton cloth, on a light-toned freijó wood workbench. Camera at about 40 degrees. The basket centered with generous breathing room, about 15 percent margin on every side, fully readable inside the central square of the frame. Soft diffused morning daylight from a window on the left, gentle shadows to the right, warm cream lime-plaster wall out of focus behind. 50mm lens, f/2.8. Natural-light food photography, warm palette of crust brown, cream and wheat, true-to-life colors, realistic texture, no text, no logos, no labels, no watermark.
```

Negative: comum + `baguettes, hamburger buns, dinner rolls with seeds, croissants, wicker picnic hamper, checkered cloth, plastic bag`

---

### Imagem 9 — Focaccia de alecrim e sal grosso — `produtos/focaccia-alecrim.jpg`

- **Arquivo**: `public/images/produtos/focaccia-alecrim.jpg` — **800 × 1000 px (4:5)**
- **Onde aparece**: card de produto (categoria Pães).
- **Corte**: **top-down (90°)**. A assadeira pode passar das bordas, mas no centro do quadro tem
  que ficar um trecho com covinhas, alecrim, azeite brilhando e sal grosso — é o que a miniatura
  mostra. Opcional: um pedaço já cortado e levemente deslocado no centro, mostrando a altura.
- **Intenção (pt-BR)**: massa alta e aerada, bastante azeite, alecrim fresco e flor de sal por cima,
  vista de cima na assadeira.

```
Top-down overhead 4:5 food photograph (camera at 90 degrees) of a tall, airy focaccia in a dark rectangular baking pan, golden top with deep finger dimples, glistening pools of olive oil, sprigs of fresh rosemary pressed into the dough and flakes of coarse sea salt. One square piece cut and slightly pulled away in the center to show the thick, open, airy crumb. The pan sits on a light-toned freijó wood workbench, a small cream stoneware dish of olive oil and a sprig of rosemary at the edge. The dimpled center fully readable inside the central square of the frame, breathing room around the key detail. Soft diffused morning daylight from the left, gentle shadows to the right. Natural-light food photography, warm palette of golden crust, cream and rosemary green #1F6B47, true-to-life colors, realistic texture, no text, no logos, no labels, no watermark.
```

Negative: comum + `pizza, tomatoes, olives, cheese, thin flat bread, burnt edges, angled view`

---

### Imagem 10 — Pão de queijo (6 un.) — `produtos/pao-de-queijo.jpg`

- **Arquivo**: `public/images/produtos/pao-de-queijo.jpg` — **800 × 1000 px (4:5)**
- **Onde aparece**: card de produto (categoria Pães) e vitrine "Os mais pedidos" (destaque).
- **Corte**: os seis pães num grupo compacto no centro; o que está aberto, com o queijo puxando,
  **na frente e no meio**.
- **Intenção (pt-BR)**: por fora sequinho, por dentro puxa — seis pães de queijo dourados, um aberto
  com o miolo elástico esticando.

```
Vertical 4:5 food photograph of exactly six small round Brazilian cheese breads (pão de queijo) with a dry, crackly golden crust, grouped in a shallow matte cream stoneware bowl on a light-toned freijó wood workbench; in front, one of them torn open by hand, the soft, chewy, stretchy cheesy interior pulling in strings between the two halves, a little steam. Camera at about 40 degrees. The bowl and the torn bread centered with generous breathing room, about 15 percent margin on every side, fully readable inside the central square of the frame. Soft diffused morning daylight from a window on the left, gentle shadows to the right, warm cream lime-plaster wall out of focus behind. 50mm lens, f/2.8. Natural-light food photography, warm palette of golden crust, cream and wheat, true-to-life colors, realistic texture, no text, no logos, no labels, no watermark.
```

Negative: comum + `gougères with herbs, dinner rolls, bread slices, melted cheese on top, burnt, flat cookies`

---

### Imagem 11 — Croissant de manteiga — `produtos/croissant.jpg`

- **Arquivo**: `public/images/produtos/croissant.jpg` — **800 × 1000 px (4:5)**
- **Onde aparece**: card de produto (categoria Folhados e doces) e vitrine "Os mais pedidos"
  (destaque).
- **Corte**: **um croissant só**, inteiro, no centro, sobre papel manteiga liso. Nada de cesta.
- **Intenção (pt-BR)**: três dias de laminação — camadas bem visíveis, casca que vira farelo.

```
Vertical 4:5 food photograph of a single all-butter croissant with deeply defined flaky layers and a glossy deep golden crust, a few flakes of crumb around it, resting on a sheet of plain unprinted parchment paper on a light-toned freijó wood workbench. Camera at about 40 degrees, the croissant seen at a three-quarter angle so the laminated layers on the side are visible. The croissant centered with generous breathing room, about 15 percent margin on every side, fully readable inside the central square of the frame. Soft diffused morning daylight from a window on the left, gentle shadows to the right, warm cream lime-plaster wall out of focus behind. 50mm lens, f/2.8. Natural-light food photography, warm palette of golden crust, cream and wheat, true-to-life colors, realistic texture, no text, no logos, no labels, no watermark.
```

Negative: comum + `basket of croissants, jam, filled croissant, jam ramekins, wooden spoons, star-pattern paper, green napkin, coffee grinder, crescent-shaped bread roll`

---

### Imagem 12 — Pain au chocolat — `produtos/pain-au-chocolat.jpg`

- **Arquivo**: `public/images/produtos/pain-au-chocolat.jpg` — **800 × 1000 px (4:5)**
- **Onde aparece**: card de produto (categoria Folhados e doces).
- **Corte**: as duas metades no centro, com o corte virado para a câmera — as duas barras de
  chocolate derretido precisam aparecer na miniatura.
- **Intenção (pt-BR)**: a massa do croissant enrolada em duas barras de chocolate — cortada ao meio,
  ainda morna, chocolate brilhando nas camadas.

```
Vertical 4:5 food photograph of a rectangular pain au chocolat cut in half, the two halves slightly apart with the cut sides facing the camera, showing flaky laminated layers and two lines of glossy melted dark chocolate oozing between them, on a sheet of plain unprinted parchment paper on a light-toned freijó wood workbench. Camera at about 40 degrees. The cut halves centered with generous breathing room, about 15 percent margin on every side, fully readable inside the central square of the frame. Soft diffused morning daylight from a window on the left, gentle shadows to the right, warm cream lime-plaster wall out of focus behind. 50mm lens, f/2.8. Natural-light food photography, warm palette of golden crust, dark chocolate brown, cream and wheat, true-to-life colors, realistic texture, no text, no logos, no labels, no watermark.
```

Negative: comum + `chocolate croissant crescent shape, powdered sugar, chocolate drizzle on top, nutella jar, whole uncut pastry`

---

### Imagem 13 — Rolinho de canela — `produtos/rolinho-canela.jpg`

- **Arquivo**: `public/images/produtos/rolinho-canela.jpg` — **800 × 1000 px (4:5)**
- **Onde aparece**: card de produto (categoria Folhados e doces, selo "Novo") e vitrine "Os mais
  pedidos" (destaque).
- **Corte**: um rolinho, com a espiral visível de cima, no centro.
- **Intenção (pt-BR)**: massa macia em espiral, canela com açúcar mascavo e uma cobertura **leve** de
  cream cheese escorrendo — não um bolo de glacê.

```
Vertical 4:5 food photograph of a single soft cinnamon roll with a clearly visible spiral of brown-sugar cinnamon filling, topped with a light, thin white cream cheese glaze that drips down its sides, on a small matte cream stoneware plate on a light-toned freijó wood workbench. Camera at about 40 degrees so the spiral on top is readable. The roll centered with generous breathing room, about 15 percent margin on every side, fully readable inside the central square of the frame. Soft diffused morning daylight from a window on the left, gentle shadows to the right, warm cream lime-plaster wall out of focus behind. 50mm lens, f/2.8. Natural-light food photography, warm palette of golden brown, cinnamon, cream and wheat, true-to-life colors, realistic texture, no text, no logos, no labels, no watermark.
```

Negative: comum + `thick heavy frosting covering everything, pecans, raisins, sprinkles, baking pan of many rolls, cinnamon sticks pile`

---

### Imagem 14 — Sonho de creme de baunilha — `produtos/sonho-baunilha.jpg`

- **Arquivo**: `public/images/produtos/sonho-baunilha.jpg` — **800 × 1000 px (4:5)**
- **Onde aparece**: card de produto (categoria Folhados e doces).
- **Corte**: o sonho com a abertura virada para a câmera, o creme visível no centro.
- **Intenção (pt-BR)**: frito na hora certa, passado no açúcar e recheado **até a borda** com creme de
  baunilha com pontinhos da fava.

```
Vertical 4:5 food photograph of a Brazilian sonho, a round golden fried brioche doughnut rolled in granulated sugar, split open on the side and generously filled to the edge with thick pale-yellow vanilla custard with tiny black vanilla bean specks, the filling facing the camera, on a small matte cream stoneware plate on a light-toned freijó wood workbench, a few sugar crystals around. Camera at about 40 degrees. The doughnut centered with generous breathing room, about 15 percent margin on every side, fully readable inside the central square of the frame. Soft diffused morning daylight from a window on the left, gentle shadows to the right, warm cream lime-plaster wall out of focus behind. 50mm lens, f/2.8. Natural-light food photography, warm palette of golden brown, vanilla cream and wheat, true-to-life colors, realistic texture, no text, no logos, no labels, no watermark.
```

Negative: comum + `ring doughnut with hole, glazed doughnut, icing, sprinkles, jelly filling, whipped cream, powdered sugar cloud`

---

### Imagem 15 — Brownie de chocolate meio amargo — `produtos/brownie.jpg`

- **Arquivo**: `public/images/produtos/brownie.jpg` — **800 × 1000 px (4:5)**
- **Onde aparece**: card de produto (categoria Folhados e doces).
- **Corte**: um pedaço quadrado, generoso, no centro; a casquinha brilhante de cima e a lateral densa
  visíveis.
- **Intenção (pt-BR)**: casquinha brilhante rachada em cima e centro denso, quase cremoso — um pedaço
  generoso.

```
Vertical 4:5 food photograph of one generous square piece of dark chocolate brownie with a shiny, paper-thin crackled top crust and a dense, fudgy, almost creamy interior visible on the cut side, a few crumbs around, on a sheet of plain unprinted parchment paper on a light-toned freijó wood workbench. Camera at about 40 degrees so both the crackled top and the fudgy side are readable. The brownie centered with generous breathing room, about 15 percent margin on every side, fully readable inside the central square of the frame. Soft diffused morning daylight from a window on the left, gentle shadows to the right, warm cream lime-plaster wall out of focus behind. 50mm lens, f/2.8. Natural-light food photography, warm palette of dark chocolate brown, cream and wheat, true-to-life colors, realistic texture, no text, no logos, no labels, no watermark.
```

Negative: comum + `walnuts, frosting, ice cream, chocolate sauce drizzle, stack of brownies, cakey dry texture`

---

### Imagem 16 — Quiche de alho-poró — `produtos/quiche-alho-poro.jpg`

- **Arquivo**: `public/images/produtos/quiche-alho-poro.jpg` — **800 × 1000 px (4:5)**
- **Onde aparece**: card de produto (categoria Salgados).
- **Corte**: uma fatia, com a ponta apontando para a câmera e o recheio de lado visível, no centro.
- **Intenção (pt-BR)**: massa amanteigada e dourada, recheio cremoso de alho-poró refogado devagar.

```
Vertical 4:5 food photograph of one slice of leek quiche with a buttery, golden, fluted shortcrust and a creamy set custard filling full of soft sautéed pale-green leek rings, lightly golden on top, the cut side facing the camera, on a matte cream stoneware plate on a light-toned freijó wood workbench, a raw linen napkin at the edge. Camera at about 40 degrees. The slice centered with generous breathing room, about 15 percent margin on every side, fully readable inside the central square of the frame. Soft diffused morning daylight from a window on the left, gentle shadows to the right, warm cream lime-plaster wall out of focus behind. 50mm lens, f/2.8. Natural-light food photography, warm palette of golden crust, cream and soft green, true-to-life colors, realistic texture, no text, no logos, no labels, no watermark.
```

Negative: comum + `bacon, spinach, tomato, broccoli, runny egg, salad on the plate, whole quiche`

---

### Imagem 17 — Sanduíche de pernil — `produtos/sanduiche-pernil.jpg`

- **Arquivo**: `public/images/produtos/sanduiche-pernil.jpg` — **800 × 1000 px (4:5)**
- **Onde aparece**: card de produto (categoria Salgados) e vitrine "Os mais pedidos" (destaque).
- **Corte**: sanduíche no centro, de lado, com o recheio (pernil desfiado + vinagrete) visível entre
  as fatias.
- **Consistência**: o pão é **fatia do pão de fermentação natural da casa** (casca escura, miolo
  aberto), não pão de hambúrguer nem baguete.
- **Intenção (pt-BR)**: pernil assado por 8 horas, desfiado, com vinagrete da casa no nosso pão.

```
Vertical 4:5 food photograph of a hearty sandwich made with two thick slices of rustic sourdough bread with a dark golden crust and open crumb, filled with juicy slow-roasted shredded pork and a fresh Brazilian vinaigrette salsa of diced tomato, onion, green bell pepper and parsley, the filling clearly visible from the side, on a sheet of plain unprinted parchment paper on a light-toned freijó wood workbench. Camera at about 40 degrees. The sandwich centered with generous breathing room, about 15 percent margin on every side, fully readable inside the central square of the frame. Soft diffused morning daylight from a window on the left, gentle shadows to the right, warm cream lime-plaster wall out of focus behind. 50mm lens, f/2.8. Natural-light food photography, warm palette of crust brown, roasted pork, tomato red and parsley green, true-to-life colors, realistic texture, no text, no logos, no labels, no watermark.
```

Negative: comum + `hamburger bun, baguette, cheese, lettuce, mayonnaise, french fries, toothpick flag, sauce bottles`

---

### Imagem 18 — Misto quente na chapa — `produtos/misto-quente.jpg`

- **Arquivo**: `public/images/produtos/misto-quente.jpg` — **800 × 1000 px (4:5)**
- **Onde aparece**: card de produto (categoria Salgados).
- **Corte**: as duas metades cortadas na diagonal, uma apoiada na outra, com o queijo escorrendo no
  centro.
- **Intenção (pt-BR)**: presunto, bastante queijo e pão de forma da casa tostado na manteiga dos dois
  lados — cortado na diagonal, queijo derretendo.

```
Vertical 4:5 food photograph of a Brazilian grilled ham and cheese sandwich (misto quente) made with thick slices of homemade white sandwich bread toasted in butter until evenly golden on both sides, cut diagonally into two triangles, one half leaning on the other, melted cheese stretching and dripping from the cut edge, a thin layer of ham visible, on a matte cream stoneware plate on a light-toned freijó wood workbench. Camera at about 40 degrees. The sandwich centered with generous breathing room, about 15 percent margin on every side, fully readable inside the central square of the frame. Soft diffused morning daylight from a window on the left, gentle shadows to the right, warm cream lime-plaster wall out of focus behind. 50mm lens, f/2.8. Natural-light food photography, warm palette of golden toast, melted cheese and cream, true-to-life colors, realistic texture, no text, no logos, no labels, no watermark.
```

Negative: comum + `grill marks, burnt toast, lettuce, tomato, fried egg, fries, ketchup, panini press lines`

---

### Imagem 19 — Empada de palmito — `produtos/empada-palmito.jpg`

- **Arquivo**: `public/images/produtos/empada-palmito.jpg` — **800 × 1000 px (4:5)**
- **Onde aparece**: card de produto (categoria Salgados).
- **Corte**: a empada é pequena — ela precisa ocupar bem o quadrado central (mais perto que os outros
  produtos), senão some na miniatura.
- **Intenção (pt-BR)**: massa que desmancha, dourada, com a tampa levemente quebrada deixando ver o
  palmito com azeitona e cheiro-verde. Cabe na mão.

```
Vertical 4:5 close food photograph of one small Brazilian empada, a round fluted shortcrust pie with a crumbly golden-brown pastry, its top crust slightly cracked open revealing a creamy filling of hearts of palm pieces, a slice of green olive and chopped parsley and chives, a few pastry crumbs around, on a small matte cream stoneware plate on a light-toned freijó wood workbench. Camera at about 40 degrees, fairly close so the small pie fills the central square of the frame. Product centered with breathing room, about 12 percent margin on every side. Soft diffused morning daylight from a window on the left, gentle shadows to the right, warm cream lime-plaster wall out of focus behind. 50mm lens, f/2.8. Natural-light food photography, warm palette of golden pastry, cream and herb green, true-to-life colors, realistic texture, no text, no logos, no labels, no watermark.
```

Negative: comum + `large pie, quiche, muffin, cupcake, meat pie, egg wash shine like plastic, many empadas on a tray`

---

### Imagem 20 — Café coado — `produtos/cafe-coado.jpg`

- **Arquivo**: `public/images/produtos/cafe-coado.jpg` — **800 × 1000 px (4:5)**
- **Onde aparece**: card de produto (categoria Bebidas).
- **Corte**: a xícara no centro e na frente; o coador de pano ao lado, um pouco atrás, **dentro** do
  quadrado central (ele é o que diferencia este card do cappuccino).
- **Intenção (pt-BR)**: café passado no filtro de pano, do jeito de casa — a xícara ao lado do coador.

```
Vertical 4:5 photograph of a matte cream stoneware cup of black filtered coffee on a saucer, a thin golden crema ring on the dark surface and a wisp of steam, next to a traditional Brazilian cloth coffee filter (coador de pano) hanging on a small wooden stand, the cloth stained light brown, a few drops falling into a cream stoneware pot below. On a light-toned freijó wood workbench. Camera at about 40 degrees. The cup in front and the cloth filter slightly behind, both centered with generous breathing room, fully readable inside the central square of the frame. Soft diffused morning daylight from a window on the left, gentle shadows to the right, warm cream lime-plaster wall out of focus behind. 50mm lens, f/2.8. Natural-light food photography, warm palette of coffee brown, cream and wood, true-to-life colors, realistic, no text, no logos, no labels, no watermark.
```

Negative: comum + `espresso machine, latte art, milk, paper filter, pour-over glass carafe brand, coffee beans scattered, coffee grinder, cookies`

---

### Imagem 21 — Cappuccino — `produtos/cappuccino.jpg`

- **Arquivo**: `public/images/produtos/cappuccino.jpg` — **800 × 1000 px (4:5)**
- **Onde aparece**: card de produto (categoria Bebidas).
- **Corte**: **top-down (90°)** — a xícara vista de cima, redonda, no centro exato; a espuma lisa é o
  assunto.
- **Intenção (pt-BR)**: espresso duplo com leite vaporizado e espuma fina — **sem chocolate em pó, sem
  canela**, só café e leite.

```
Top-down overhead 4:5 photograph (camera at 90 degrees) of a cappuccino in a matte cream porcelain cup on a matching saucer, a smooth, glossy, fine-textured milk microfoam surface with a thin brown espresso rim around the edge and a simple small heart shape, a small plain spoon on the saucer, on a light-toned freijó wood workbench, a corner of raw linen napkin at the edge. The cup exactly in the center with generous breathing room, about 15 percent margin on every side, fully readable inside the central square of the frame. Soft diffused morning daylight from the left, gentle shadows to the right. Natural-light food photography, warm palette of milky cream, coffee brown and wood, true-to-life colors, realistic, no cocoa powder, no cinnamon, no text, no logos, no labels, no watermark.
```

Negative: comum + `cocoa powder dusting, cinnamon, chocolate shavings, whipped cream, tall glass, elaborate latte art rosetta, coffee beans scattered, biscuits, angled view`

---

### Imagem 22 — Suco de laranja — `produtos/suco-laranja.jpg`

- **Arquivo**: `public/images/produtos/suco-laranja.jpg` — **800 × 1000 px (4:5)**
- **Onde aparece**: card de produto (categoria Bebidas).
- **Corte**: copo e meia laranja lado a lado no centro; o copo é alto, então deixe respiro em cima.
- **Intenção (pt-BR)**: laranja-pera espremida na hora, **sem gelo e sem canudo** — o copo ao lado da
  meia laranja cortada.

```
Vertical 4:5 food photograph of a simple clear glass (about 300 ml) filled with freshly squeezed orange juice, opaque and slightly pulpy with a thin layer of foam on top, no ice, no straw, next to half of a juicy Brazilian pera orange cut side up showing bright segments, and a whole orange partly behind, on a light-toned freijó wood workbench. Camera at about 40 degrees. The glass and the orange half centered with generous breathing room, about 15 percent margin on every side, fully readable inside the central square of the frame. Soft diffused morning daylight from a window on the left making the juice glow, gentle shadows to the right, warm cream lime-plaster wall out of focus behind. 50mm lens, f/2.8. Natural-light food photography, warm palette of orange, cream and wood, true-to-life colors, realistic, no text, no logos, no labels, no watermark.
```

Negative: comum + `ice cubes, straw, mint leaves, cocktail glass, juice carton, juicer machine, lemon, grapefruit, neon orange color`

---

### Imagem 23 — Chocolate quente — `produtos/chocolate-quente.jpg`

- **Arquivo**: `public/images/produtos/chocolate-quente.jpg` — **800 × 1000 px (4:5)**
- **Onde aparece**: card de produto (categoria Bebidas).
- **Corte**: caneca no centro, a colher apoiada na borda à vista (é ela que mostra que é espesso).
- **Intenção (pt-BR)**: chocolate 55% derretido no leite, encorpado de colher — para os dias de garoa.

```
Vertical 4:5 food photograph of a matte cream stoneware mug filled with thick, glossy, spoon-coating hot chocolate, a small spoon resting on the rim with a thick layer of chocolate on it, a drip on the side of the mug, a few small pieces of dark chocolate on the wood beside it, on a light-toned freijó wood workbench, a folded raw linen napkin at the edge. Camera at about 40 degrees so the thick surface is visible. The mug centered with generous breathing room, about 15 percent margin on every side, fully readable inside the central square of the frame. Soft diffused grey rainy-morning daylight from a window on the left, gentle shadows to the right, warm cream lime-plaster wall out of focus behind. 50mm lens, f/2.8. Natural-light food photography, warm palette of dark chocolate brown, cream and wood, true-to-life colors, realistic, no text, no logos, no labels, no watermark.
```

Negative: comum + `marshmallows, whipped cream, candy cane, cinnamon stick, christmas decorations, thin watery cocoa, glass mug`

---

### Imagem 24 — Bolo de laranja com calda — `produtos/bolo-laranja.jpg`

- **Arquivo**: `public/images/produtos/bolo-laranja.jpg` — **800 × 1000 px (4:5)**
- **Onde aparece**: card de encomenda (seção Encomendas, com tamanhos P/M/G) e vitrine "Os mais
  pedidos" (destaque).
- **Corte**: o bolo inteiro no quadrado central; a calda brilhando por cima e escorrendo pela lateral
  precisa ser a primeira coisa que se vê.
- **Consistência**: **o mesmo bolo** da foto `encomendas.jpg` (mesma forma, mesma calda, mesmo
  suporte creme).
- **Intenção (pt-BR)**: massa fofinha com raspas e **calda de laranja por cima** — brilhante,
  escorrendo, com raspas.

```
Vertical 4:5 food photograph of a whole round homemade orange cake on a matte cream stoneware cake stand, its top covered in a glossy translucent orange syrup glaze that drips down the sides, thin strips of fresh orange zest scattered on top, soft fluffy golden crumb hinted at the edges, half an orange beside the stand, on a light-toned freijó wood workbench. Camera at about 40 degrees so the shiny top and the drips on the side are both visible. The cake centered with generous breathing room, about 15 percent margin on every side, fully readable inside the central square of the frame. Soft diffused morning daylight from a window on the left making the glaze shine, gentle shadows to the right, warm cream lime-plaster wall out of focus behind. 50mm lens, f/2.8. Natural-light food photography, warm palette of orange, golden crumb, cream and wood, true-to-life colors, realistic texture, no text, no logos, no labels, no watermark.
```

Negative: comum + `white frosting, buttercream, candied orange slices covering the cake, chocolate, layer cake, candles, birthday topper with letters, bundt cake with deep ridges`

---

### Imagem 25 — Bolo de chocolate com brigadeiro — `produtos/bolo-chocolate.jpg`

- **Arquivo**: `public/images/produtos/bolo-chocolate.jpg` — **800 × 1000 px (4:5)**
- **Onde aparece**: card de encomenda (seção Encomendas, com tamanhos P/M/G).
- **Corte**: o bolo no centro com a **fatia retirada virada para a câmera**, mostrando massa úmida e
  recheio de brigadeiro; a fatia pode estar num pratinho na frente, dentro do quadrado central.
- **Intenção (pt-BR)**: massa úmida de cacau, recheio e cobertura de brigadeiro mole com granulado —
  bolo de aniversário brasileiro, de verdade.

```
Vertical 4:5 food photograph of a whole round Brazilian chocolate cake completely covered in soft, glossy brigadeiro frosting and chocolate sprinkles, on a matte cream stoneware cake stand, with one slice removed so the gap faces the camera showing moist dark cocoa sponge layers and a thick soft brigadeiro filling; the removed slice on a small cream plate in front with a plain fork. On a light-toned freijó wood workbench. Camera at about 40 degrees. The cake and slice centered with generous breathing room, about 15 percent margin on every side, fully readable inside the central square of the frame. Soft diffused morning daylight from a window on the left, gentle shadows to the right, warm cream lime-plaster wall out of focus behind. 50mm lens, f/2.8. Natural-light food photography, warm palette of chocolate brown, cream and wood, true-to-life colors, realistic texture, no text, no logos, no labels, no watermark.
```

Negative: comum + `colorful sprinkles, rainbow sprinkles, strawberries, whipped cream, drip cake with candies, candles, cake topper with letters, fondant, mirror glaze`

---

### Imagem 26 — Cesta café da manhã — `produtos/cesta-cafe-manha.jpg`

- **Arquivo**: `public/images/produtos/cesta-cafe-manha.jpg` — **800 × 1000 px (4:5)**
- **Onde aparece**: card de encomenda (seção Encomendas, variações Individual e Para dois).
- **Corte**: a cesta inteira no quadrado central, vista a ~40° para dentro dela, com os itens
  reconhecíveis. É a mesma cesta da foto `encomendas.jpg`.
- **Cuidado**: é aqui que mais se corre o risco de parecer a referência. **Não** faça cesta só de
  croissants com potinhos de geleia e colherinhas; a geleia vem **num pote de vidro fechado, sem
  rótulo**, e a cesta tem de tudo um pouco.
- **Intenção (pt-BR)**: pães, folhados, geleia da casa, frutas, suco e café — chega pronta para abrir
  e sentar à mesa.

```
Vertical 4:5 food photograph of a woven wicker hamper lined with raw undyed linen, seen at about 40 degrees into the basket, holding a small round sourdough boule, two butter croissants, a pain au chocolat, a plain glass jar of homemade apricot jam with a raw linen cloth lid tied with cotton twine and no label, a small bunch of green grapes, a tangerine and a slice of papaya, a small glass bottle of orange juice with no label, and a small cream stoneware jar of coffee; on a light-toned freijó wood workbench. The hamper centered with generous breathing room, about 12 percent margin on every side, fully readable inside the central square of the frame. Soft diffused morning daylight from a window on the left, gentle shadows to the right, warm cream lime-plaster wall out of focus behind. 50mm lens, f/4. Natural-light food photography, warm palette of crust brown, cream, wheat and fruit orange, true-to-life colors, realistic, no text, no logos, no labels, no ribbon with writing, no watermark.
```

Negative: comum + `jam ramekins with wooden spoons, basket full of croissants only, coffee grinder, cellophane wrap, big satin bow, greeting card with text, branded bottles, star-pattern paper, green napkin`

---

### Imagem 27 — Cesta da tarde — `produtos/cesta-da-tarde.jpg`

- **Arquivo**: `public/images/produtos/cesta-da-tarde.jpg` — **800 × 1000 px (4:5)**
- **Onde aparece**: card de encomenda (seção Encomendas, variação única).
- **Corte**: a cesta inteira no quadrado central; o bolinho inteiro é o item de maior destaque.
- **Diferença para a cesta da manhã**: outra cesta (bandeja rasa de **palha**, não vime alto), e luz
  do mesmo set com um toque mais quente de fim de tarde — sem mudar de lado nem de bancada.
- **Intenção (pt-BR)**: bolo inteiro pequeno, biscoitos amanteigados, pão de queijo, chá e café —
  serve bem duas pessoas.

```
Vertical 4:5 food photograph of a shallow woven natural straw tray basket lined with raw undyed linen, seen at about 40 degrees, holding a small whole round cornmeal cake (bolo de fubá) with a golden top, a small stack of round butter cookies, four small cheese breads (pão de queijo), a small cotton pouch of loose-leaf tea tied with twine, a small plain cream stoneware jar of ground coffee, and two empty cream stoneware cups; on a light-toned freijó wood workbench. The basket centered with generous breathing room, about 12 percent margin on every side, the small cake fully readable inside the central square of the frame. Soft diffused daylight from a window on the left with a slightly warmer late-afternoon tone, gentle shadows to the right, warm cream lime-plaster wall out of focus behind. 50mm lens, f/4. Natural-light food photography, warm palette of golden crumb, cream, wheat and wood, true-to-life colors, realistic, no text, no logos, no labels, no tea bag tags, no watermark.
```

Negative: comum + `tea bags with branded tags, tea tin with label, wicker picnic hamper, cellophane wrap, satin bow, macarons, cupcakes, greeting card with text, coffee grinder`

---

## 4. Checklist antes de trocar

- [ ] Tamanho exato em pixels da tabela (não só a proporção).
- [ ] JPEG sRGB, qualidade ≈ 80, **até 250 KB**; **`hero.jpg` até 200 KB**.
- [ ] Nenhum texto, logo, rótulo, embalagem ou marca d'água (o nome na `og.jpg` e na fachada, se
      houver, foi aplicado num editor e conferido).
- [ ] Nenhum rosto; só as mãos da padeira no `sobre.jpg`.
- [ ] Os 22 produtos no mesmo set: bancada de freijó, parede creme, luz da esquerda, ~40° (focaccia
      e cappuccino top-down).
- [ ] Em cada card, o produto inteiro e legível no quadrado central (teste: reduza para 88 px de
      largura e veja se ainda dá para saber o que é).
- [ ] A foto bate com a descrição do cardápio e com o `alt` do manifesto (calda por cima, seis pães,
      queijo puxando, sem canela no cappuccino…).
- [ ] Nada que lembre as fotos da referência (cesta de croissant com geleias, moedor, papel de
      estrelinhas, guardanapo verde).
- [ ] Nome e pasta idênticos (`public/images/…`, produtos em `public/images/produtos/`).
- [ ] `.next/cache/images` apagado e página recarregada.
- [ ] Nada de `npm run placeholders -- --force`.
