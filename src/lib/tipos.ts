// Tipos do domínio da Fornada. Só tipos: sem enum/namespace (roda no Node com type stripping).
// Dinheiro sempre em centavos inteiros; horário sempre em minutos do dia no fuso da loja.

export type DiaSemana = 0 | 1 | 2 | 3 | 4 | 5 | 6 // 0 = domingo

/** Janela de funcionamento de um dia, em minutos do dia (420 = 7h). `null` = fechado. */
export type Expediente = { abre: number; fecha: number } | null

export type Endereco = {
  rua: string
  numero: string
  bairro: string
  cidade: string
  uf: string
  cep: string
}

export type Bairro = {
  id: string
  nome: string
  /** centavos */
  taxa: number
  /** tempo médio de entrega, em minutos */
  tempoMin: number
}

export type Modo = 'retirada' | 'entrega'

export type Loja = {
  nome: string
  marca: string
  /** só dígitos, com DDI e DDD */
  whatsapp: string
  whatsappExibicao: string
  endereco: Endereco
  mapaUrl: string
  instagram: string
  instagramUrl: string
  fuso: string
  horarios: Record<DiaSemana, Expediente>
  preparoMin: Record<Modo, number>
  encomendaAntecedenciaH: number
  encomendaJanelaDias: number
  /** centavos */
  pedidoMinimoEntrega: number
  bairros: Bairro[]
}

export type CategoriaId = 'paes' | 'doces' | 'salgados' | 'bebidas' | 'encomendas'

export type Categoria = {
  id: CategoriaId
  nome: string
  ancora: string
  ordem: number
}

export type SeloId = 'fermentacao-natural' | 'vegano' | 'sem-lactose' | 'novo'

export type Variacao = {
  id: string
  nome: string
  /** centavos */
  preco: number
}

export type Produto = {
  id: string
  categoria: CategoriaId
  nome: string
  descricao: string
  /** centavos; obrigatório quando não há variações */
  preco?: number
  variacoes?: Variacao[]
  /** chave do manifesto de imagens, ex.: 'produto-croissant' */
  imagem: string
  selos?: SeloId[]
  encomenda: boolean
  destaque: boolean
}

export type ItemSacola = {
  produtoId: string
  variacaoId: string | null
  /** inteiro de 1 a 20 */
  quantidade: number
}

export type LinhaSacola = {
  chave: string
  produto: Produto
  variacao: Variacao | null
  quantidade: number
  /** centavos */
  precoUnitario: number
  /** centavos */
  total: number
}

export type Pagamento = 'pix' | 'cartao' | 'dinheiro'

export type Quando =
  | { tipo: 'asap' }
  | { tipo: 'agendado'; data: string; minutos: number } // data 'AAAA-MM-DD'

export type DadosPedido = {
  nome: string
  modo: Modo
  /** id de um Bairro, 'outro' ou '' (não escolhido) */
  bairroId: string
  endereco: string
  complemento: string
  quando: Quando
  pagamento: Pagamento | null
  /** centavos */
  trocoPara: number | null
  observacoes: string
  mensagemCartao: string
  lembrarDados: boolean
}

/** Instante "na loja": data e minutos no fuso da padaria, sem Date com fuso local. */
export type InstanteLoja = {
  data: string // 'AAAA-MM-DD'
  diaSemana: DiaSemana
  minutos: number // 0–1439
}

export type CampoPedido = keyof DadosPedido | 'itens'

/** Objeto vazio = pedido válido. */
export type ErrosPedido = Partial<Record<CampoPedido, string>>

export type EstadoSacola = {
  itens: ItemSacola[]
  removidoRecente: { item: ItemSacola; indice: number } | null
}

export type AcaoSacola =
  | { tipo: 'adicionar'; produtoId: string; variacaoId?: string | null }
  | { tipo: 'definirQuantidade'; chave: string; quantidade: number }
  | { tipo: 'remover'; chave: string }
  | { tipo: 'desfazer' }
  | { tipo: 'limpar' }
  | { tipo: 'carregar'; itens: ItemSacola[] }
