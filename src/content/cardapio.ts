// Cardápio da Fornada (fictício). Fonte: data-model.md. Preços em centavos.
// Importado pelos testes: caminho relativo com .ts, sem alias.
import type { Categoria, Produto, SeloId } from '../lib/tipos.ts'

export const categorias: Categoria[] = [
  { id: 'paes', nome: 'Pães', ancora: 'cat-paes', ordem: 1 },
  { id: 'doces', nome: 'Folhados e doces', ancora: 'cat-doces', ordem: 2 },
  { id: 'salgados', nome: 'Salgados', ancora: 'cat-salgados', ordem: 3 },
  { id: 'bebidas', nome: 'Bebidas', ancora: 'cat-bebidas', ordem: 4 },
  { id: 'encomendas', nome: 'Encomendas', ancora: 'encomendas', ordem: 5 },
]

export const rotulosSelo: Record<SeloId, string> = {
  'fermentacao-natural': 'Fermentação natural',
  vegano: 'Vegano',
  'sem-lactose': 'Sem lactose',
  novo: 'Novo',
}

export const produtos: Produto[] = [
  // Pães
  {
    id: 'pao-fermentacao-natural',
    categoria: 'paes',
    nome: 'Pão de fermentação natural',
    descricao: 'Casca grossa que estala, miolo úmido e aquele azedinho de 36 horas de fermentação lenta. Rende a semana.',
    preco: 1800,
    imagem: 'produto-pao-fermentacao-natural',
    selos: ['fermentacao-natural', 'vegano'],
    encomenda: false,
    destaque: true,
  },
  {
    id: 'baguete',
    categoria: 'paes',
    nome: 'Baguete da casa',
    descricao: 'Comprida, fina e crocante do bico ao fim. Vai bem com manteiga, queijo ou só com a mão mesmo.',
    preco: 900,
    imagem: 'produto-baguete',
    selos: ['fermentacao-natural', 'vegano'],
    encomenda: false,
    destaque: false,
  },
  {
    id: 'pao-frances',
    categoria: 'paes',
    nome: 'Pão francês — 6 un.',
    descricao: 'O de todo dia, do jeito certo: casquinha fina, miolo leve. Sai do forno de hora em hora.',
    preco: 700,
    imagem: 'produto-pao-frances',
    encomenda: false,
    destaque: false,
  },
  {
    id: 'focaccia-alecrim',
    categoria: 'paes',
    nome: 'Focaccia de alecrim e sal grosso',
    descricao: 'Massa alta e aerada, bastante azeite, alecrim fresco da horta e flor de sal por cima.',
    preco: 2200,
    imagem: 'produto-focaccia-alecrim',
    selos: ['vegano', 'sem-lactose'],
    encomenda: false,
    destaque: false,
  },
  {
    id: 'pao-de-queijo',
    categoria: 'paes',
    nome: 'Pão de queijo — 6 un.',
    descricao: 'Polvilho azedo e queijo meia-cura de Minas. Por fora sequinho, por dentro puxa.',
    preco: 1400,
    imagem: 'produto-pao-de-queijo',
    encomenda: false,
    destaque: true,
  },

  // Folhados e doces
  {
    id: 'croissant',
    categoria: 'doces',
    nome: 'Croissant de manteiga',
    descricao: 'Três dias de laminação e manteiga de verdade. Faz farelo na roupa, e é assim que tem que ser.',
    preco: 1100,
    imagem: 'produto-croissant',
    encomenda: false,
    destaque: true,
  },
  {
    id: 'pain-au-chocolat',
    categoria: 'doces',
    nome: 'Pain au chocolat',
    descricao: 'A massa do croissant enrolada em duas barras de chocolate 55%. Melhor ainda morno.',
    preco: 1300,
    imagem: 'produto-pain-au-chocolat',
    encomenda: false,
    destaque: false,
  },
  {
    id: 'rolinho-canela',
    categoria: 'doces',
    nome: 'Rolinho de canela',
    descricao: 'Massa macia, recheio de canela com açúcar mascavo e uma cobertura leve de cream cheese.',
    preco: 1200,
    imagem: 'produto-rolinho-canela',
    selos: ['novo'],
    encomenda: false,
    destaque: true,
  },
  {
    id: 'sonho-baunilha',
    categoria: 'doces',
    nome: 'Sonho de creme de baunilha',
    descricao: 'Frito na hora certa, passado no açúcar e recheado até a borda com creme de fava de baunilha.',
    preco: 900,
    imagem: 'produto-sonho-baunilha',
    encomenda: false,
    destaque: false,
  },
  {
    id: 'brownie',
    categoria: 'doces',
    nome: 'Brownie de chocolate meio amargo',
    descricao: 'Casquinha brilhante em cima e centro denso, quase cremoso. Um pedaço generoso.',
    preco: 1000,
    imagem: 'produto-brownie',
    encomenda: false,
    destaque: false,
  },

  // Salgados
  {
    id: 'quiche-alho-poro',
    categoria: 'salgados',
    nome: 'Quiche de alho-poró',
    descricao: 'Massa amanteigada e recheio cremoso de alho-poró refogado devagar, com um toque de noz-moscada.',
    preco: 1600,
    imagem: 'produto-quiche-alho-poro',
    encomenda: false,
    destaque: false,
  },
  {
    id: 'sanduiche-pernil',
    categoria: 'salgados',
    nome: 'Sanduíche de pernil',
    descricao: 'Pernil assado por 8 horas, desfiado, com vinagrete da casa no nosso pão de fermentação natural.',
    preco: 2800,
    imagem: 'produto-sanduiche-pernil',
    selos: ['fermentacao-natural', 'sem-lactose'],
    encomenda: false,
    destaque: true,
  },
  {
    id: 'misto-quente',
    categoria: 'salgados',
    nome: 'Misto quente na chapa',
    descricao: 'Presunto, bastante queijo e pão de forma da casa, tostado na manteiga até dourar dos dois lados.',
    preco: 1500,
    imagem: 'produto-misto-quente',
    encomenda: false,
    destaque: false,
  },
  {
    id: 'empada-palmito',
    categoria: 'salgados',
    nome: 'Empada de palmito',
    descricao: 'Massa que desmancha e recheio de palmito com azeitona e cheiro-verde. Cabe na mão.',
    preco: 1000,
    imagem: 'produto-empada-palmito',
    encomenda: false,
    destaque: false,
  },

  // Bebidas
  {
    id: 'cafe-coado',
    categoria: 'bebidas',
    nome: 'Café coado',
    descricao: 'Grão do sul de Minas, torra média, passado no filtro de pano. Xícara de 200 ml.',
    preco: 700,
    imagem: 'produto-cafe-coado',
    selos: ['vegano', 'sem-lactose'],
    encomenda: false,
    destaque: false,
  },
  {
    id: 'cappuccino',
    categoria: 'bebidas',
    nome: 'Cappuccino',
    descricao: 'Espresso duplo com leite vaporizado e espuma fina. Sem chocolate em pó, sem canela, só café e leite.',
    preco: 1200,
    imagem: 'produto-cappuccino',
    encomenda: false,
    destaque: false,
  },
  {
    id: 'suco-laranja',
    categoria: 'bebidas',
    nome: 'Suco de laranja',
    descricao: 'Laranja-pera espremida na hora, sem açúcar e sem gelo, a não ser que você peça. Copo de 300 ml.',
    preco: 1100,
    imagem: 'produto-suco-laranja',
    selos: ['vegano', 'sem-lactose'],
    encomenda: false,
    destaque: false,
  },
  {
    id: 'chocolate-quente',
    categoria: 'bebidas',
    nome: 'Chocolate quente',
    descricao: 'Chocolate 55% derretido no leite, encorpado de colher. Para os dias de garoa.',
    preco: 1300,
    imagem: 'produto-chocolate-quente',
    encomenda: false,
    destaque: false,
  },

  // Encomendas (48 h de antecedência)
  {
    id: 'bolo-laranja',
    categoria: 'encomendas',
    nome: 'Bolo de laranja com calda',
    descricao: 'Massa fofinha com raspas e calda de laranja por cima. P serve 8, M serve 15, G serve 25 pessoas.',
    variacoes: [
      { id: 'p', nome: 'P', preco: 5800 },
      { id: 'm', nome: 'M', preco: 7800 },
      { id: 'g', nome: 'G', preco: 10800 },
    ],
    imagem: 'produto-bolo-laranja',
    encomenda: true,
    destaque: true,
  },
  {
    id: 'bolo-chocolate',
    categoria: 'encomendas',
    nome: 'Bolo de chocolate com brigadeiro',
    descricao: 'Massa úmida de cacau, recheio e cobertura de brigadeiro mole. P serve 8, M serve 15, G serve 25.',
    variacoes: [
      { id: 'p', nome: 'P', preco: 6800 },
      { id: 'm', nome: 'M', preco: 9200 },
      { id: 'g', nome: 'G', preco: 12800 },
    ],
    imagem: 'produto-bolo-chocolate',
    encomenda: true,
    destaque: false,
  },
  {
    id: 'cesta-cafe-manha',
    categoria: 'encomendas',
    nome: 'Cesta café da manhã',
    descricao: 'Pães, folhados, geleia da casa, frutas, suco e café. Chega pronta para abrir e sentar à mesa.',
    variacoes: [
      { id: 'individual', nome: 'Individual', preco: 14900 },
      { id: 'para-dois', nome: 'Para dois', preco: 22900 },
    ],
    imagem: 'produto-cesta-cafe-manha',
    encomenda: true,
    destaque: false,
  },
  {
    id: 'cesta-da-tarde',
    categoria: 'encomendas',
    nome: 'Cesta da tarde',
    descricao: 'Bolo inteiro pequeno, biscoitos amanteigados, pão de queijo, chá e café. Serve bem duas pessoas.',
    variacoes: [{ id: 'unica', nome: 'Única', preco: 18900 }],
    imagem: 'produto-cesta-da-tarde',
    encomenda: true,
    destaque: false,
  },
]

export function produtoPorId(id: string): Produto | undefined {
  return produtos.find((p) => p.id === id)
}

export function produtosDaCategoria(categoria: Categoria['id']): Produto[] {
  return produtos.filter((p) => p.categoria === categoria)
}

export const destaques: Produto[] = produtos.filter((p) => p.destaque)
