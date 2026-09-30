# Data Model: Fornada Padaria

Tudo é conteúdo estático tipado em `src/content/` ou estado do navegador. Valores monetários em
**centavos inteiros**. Tipos declarados em `src/lib/tipos.ts` (sem `enum`, ver research R3).

## Conteúdo (build time)

### Loja (`src/content/loja.ts`)

| Campo | Tipo | Valor / regra |
|---|---|---|
| `nome` | string | "Fornada" (marca "Fornada Padaria") |
| `whatsapp` | string (só dígitos) | `5511900000000` (fictício) |
| `whatsappExibicao` | string | "(11) 90000-0000" |
| `endereco` | `{ rua, numero, bairro, cidade, uf, cep }` | Rua do Fermento, 212 — Vila Serena, São Paulo/SP |
| `mapaUrl` | string | busca do Google Maps pelo endereço fictício |
| `instagram` | string | `@fornada.padaria` (fictício) |
| `fuso` | string | `America/Sao_Paulo` |
| `horarios` | `Record<0..6, { abre: minutos, fecha: minutos } \| null>` | seg–sáb 420–1200 (7h–20h); dom 420–780 (7h–13h) |
| `preparoMin` | `{ retirada: 20, entrega: 40 }` | minutos |
| `encomendaAntecedenciaH` | number | 48 |
| `encomendaJanelaDias` | number | 14 |
| `pedidoMinimoEntrega` | centavos | 4000 |
| `bairros` | `Bairro[]` | ver abaixo |

### Bairro

| Campo | Tipo | Regra |
|---|---|---|
| `id` | string slug | único |
| `nome` | string | |
| `taxa` | centavos | 500–1200 |
| `tempoMin` | number | minutos médios |

Valores: Vila Serena (500, 25), Jardim das Flores (700, 35), Alto do Moinho (800, 40),
Parque dos Ipês (1000, 45), Recanto Azul (1200, 55). Mais a opção fixa "Outro bairro"
(`id: 'outro'`, sem taxa, entrega combinada no WhatsApp) tratada na UI e na mensagem.

### Categoria (`src/content/cardapio.ts`)

| Campo | Tipo | Regra |
|---|---|---|
| `id` | string | `paes`, `doces`, `salgados`, `bebidas`, `encomendas` |
| `nome` | string | "Pães", "Folhados e doces", "Salgados", "Bebidas", "Encomendas" |
| `ancora` | string | `cat-<id>`; a seção Encomendas usa âncora própria `#encomendas` |
| `ordem` | number | 1–5 |

### Produto

| Campo | Tipo | Regra |
|---|---|---|
| `id` | string slug | único, estável (é o que vai para o storage) |
| `categoria` | Categoria.id | |
| `nome` | string | ≤ 40 caracteres |
| `descricao` | string | ≤ 120 caracteres |
| `preco` | centavos | obrigatório se não houver `variacoes` |
| `variacoes` | `{ id, nome, preco }[]` opcional | se presente, o preço mostrado é "a partir de" até escolher |
| `imagem` | chave do manifesto | ex.: `produto-croissant` |
| `selos` | `('fermentacao-natural' \| 'vegano' \| 'sem-lactose' \| 'novo')[]` | opcional |
| `encomenda` | boolean | true = exige data com 48h |
| `destaque` | boolean | true = aparece em "Os mais pedidos" (4 a 6 produtos) |

Cardápio inicial (22 itens):

- **Pães**: Pão de fermentação natural (1800), Baguete da casa (900), Pão francês — 6 un. (700),
  Focaccia de alecrim e sal grosso (2200), Pão de queijo — 6 un. (1400).
- **Folhados e doces**: Croissant de manteiga (1100), Pain au chocolat (1300), Rolinho de canela
  (1200), Sonho de creme de baunilha (900), Brownie de chocolate meio amargo (1000).
- **Salgados**: Quiche de alho-poró (1600), Sanduíche de pernil no pão de fermentação (2800),
  Misto quente na chapa (1500), Empada de palmito (1000).
- **Bebidas**: Café coado (700), Cappuccino (1200), Suco de laranja (1100), Chocolate quente (1300).
- **Encomendas**: Bolo de laranja com calda — P/M/G (5800/7800/10800), Bolo de chocolate com
  brigadeiro — P/M/G (6800/9200/12800), Cesta café da manhã — Individual/Para dois (14900/22900),
  Cesta da tarde — Única (18900).

Destaques: croissant, fermentação natural, pão de queijo, rolinho de canela, sanduíche de pernil,
bolo de laranja.

## Estado do navegador

### ItemSacola

| Campo | Tipo | Regra |
|---|---|---|
| `produtoId` | string | deve existir no cardápio (senão é descartado na reconciliação) |
| `variacaoId` | string \| null | obrigatório se o produto tem variações |
| `quantidade` | inteiro | 1–20 |

Chave de linha: `produtoId + ':' + (variacaoId ?? '-')`. Adicionar o mesmo produto+variação soma
quantidade (limitada a 20).

### Sacola (reducer em `src/lib/sacola.ts`)

Estado: `{ itens: ItemSacola[], removidoRecente: { item, indice } | null }`.

| Ação | Efeito |
|---|---|
| `adicionar(produtoId, variacaoId?)` | +1 na linha ou cria com 1; limite 20 |
| `definirQuantidade(chave, n)` | n ≤ 0 remove (guarda em `removidoRecente`); n > 20 vira 20 |
| `remover(chave)` | remove e guarda em `removidoRecente` |
| `desfazer()` | reinsere `removidoRecente` na posição original |
| `limpar()` | esvazia |
| `carregar(itens)` | substitui (usado na hidratação, já reconciliado) |

Derivados (funções puras em `src/lib/pedido.ts`): `linhas` (item + produto + preço unitário +
total da linha), `quantidadeTotal`, `subtotal`, `temEncomenda`, `taxa(dados)`, `total(dados)`,
`faltaParaMinimo(dados)`.

### DadosPedido (formulário)

| Campo | Tipo | Validação (mensagem) |
|---|---|---|
| `nome` | string | obrigatório, 2–60 caracteres ("Conta pra gente seu nome") |
| `modo` | `'retirada' \| 'entrega'` | obrigatório, padrão `retirada` |
| `bairroId` | string | obrigatório se entrega ("Escolha o bairro") |
| `endereco` | string | obrigatório se entrega, 5–120 ("Informe rua e número") |
| `complemento` | string | opcional, ≤ 60 |
| `quando` | `{ tipo: 'asap' } \| { tipo: 'agendado', data: 'AAAA-MM-DD', minutos: number }` | `asap` só se disponível (R11); agendado deve estar na lista de `horariosDisponiveis` ("Escolha um horário disponível") |
| `pagamento` | `'pix' \| 'cartao' \| 'dinheiro'` | obrigatório |
| `trocoPara` | centavos \| null | se dinheiro e informado, ≥ total ("O troco precisa ser maior que o total") |
| `observacoes` | string | ≤ 300 |
| `mensagemCartao` | string | só com encomenda, ≤ 200 |
| `lembrarDados` | boolean | padrão false; se true salva nome, modo, bairro, endereço, complemento em `fornada:dados:v1` |

Regras cruzadas: entrega em bairro com taxa exige `subtotal >= pedidoMinimoEntrega`
("Faltam R$ X para entrega; retirada está liberada"). Sacola vazia não envia.

Validação: `validarPedido(dados, linhas, agora, loja) → Record<campo, mensagem>`
(objeto vazio = válido), em `src/lib/pedido.ts`.

## Imagens (`scripts/manifesto-imagens.json`)

`{ chave, arquivo, largura, altura, uso, alt }[]`. Arquivos em `public/images/`.

| Chave / arquivo | Tamanho | Uso |
|---|---|---|
| `hero` → `hero.jpg` | 1200 × 1500 (4:5) | Hero, foto principal |
| `sobre` → `sobre.jpg` | 1200 × 1500 (4:5) | Sobre (split 5/7) |
| `encomendas` → `encomendas.jpg` | 1600 × 1000 (16:10) | Abertura da seção Encomendas |
| `fachada` → `fachada.jpg` | 1200 × 900 (4:3) | Onde estamos |
| `og` → `og.jpg` | 1200 × 630 | Open Graph (não aparece na página) |
| `produto-<id>` → `produtos/<id>.jpg` | 800 × 1000 (4:5) | 22 cards de produto |
