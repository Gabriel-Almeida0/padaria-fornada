// Derivados da sacola e validação do pedido (data-model: DadosPedido e regras cruzadas).
import type {
  DadosPedido,
  ErrosPedido,
  InstanteLoja,
  ItemSacola,
  LinhaSacola,
  Loja,
  Produto,
} from './tipos.ts'
import { chaveItem } from './sacola.ts'
import { formatarBRL } from './dinheiro.ts'
import { horariosDisponiveis } from './funcionamento.ts'

export const OUTRO_BAIRRO = 'outro'

export const LIMITES = {
  nomeMin: 2,
  nomeMax: 60,
  enderecoMin: 5,
  enderecoMax: 120,
  complementoMax: 60,
  observacoesMax: 300,
  mensagemCartaoMax: 200,
} as const

export const dadosIniciais: DadosPedido = {
  nome: '',
  modo: 'retirada',
  bairroId: '',
  endereco: '',
  complemento: '',
  quando: { tipo: 'asap' },
  pagamento: null,
  trocoPara: null,
  observacoes: '',
  mensagemCartao: '',
  lembrarDados: false,
}

export function montarLinhas(itens: ItemSacola[], produtos: Produto[]): LinhaSacola[] {
  const porId = new Map(produtos.map((p) => [p.id, p]))
  const linhas: LinhaSacola[] = []
  for (const item of itens) {
    const produto = porId.get(item.produtoId)
    if (!produto) continue
    const variacao = item.variacaoId
      ? produto.variacoes?.find((v) => v.id === item.variacaoId) ?? null
      : null
    if (produto.variacoes?.length && !variacao) continue
    const precoUnitario = variacao?.preco ?? produto.preco ?? 0
    linhas.push({
      chave: chaveItem(item.produtoId, item.variacaoId),
      produto,
      variacao,
      quantidade: item.quantidade,
      precoUnitario,
      total: precoUnitario * item.quantidade,
    })
  }
  return linhas
}

export type Resumo = {
  quantidade: number
  subtotal: number
  /** centavos; `null` = entrega a combinar ("Outro bairro") */
  taxa: number | null
  total: number
  /** centavos que faltam para o pedido mínimo de entrega (0 se não se aplica) */
  faltaParaMinimo: number
  temEncomenda: boolean
}

export function resumo(
  linhas: LinhaSacola[],
  dados: Pick<DadosPedido, 'modo' | 'bairroId'>,
  loja: Loja,
): Resumo {
  const quantidade = linhas.reduce((s, l) => s + l.quantidade, 0)
  const subtotal = linhas.reduce((s, l) => s + l.total, 0)
  const temEncomenda = linhas.some((l) => l.produto.encomenda)

  let taxa: number | null = 0
  let faltaParaMinimo = 0
  if (dados.modo === 'entrega') {
    if (dados.bairroId === OUTRO_BAIRRO) {
      taxa = null
    } else {
      taxa = loja.bairros.find((b) => b.id === dados.bairroId)?.taxa ?? 0
      faltaParaMinimo = Math.max(0, loja.pedidoMinimoEntrega - subtotal)
    }
  }
  return { quantidade, subtotal, taxa, total: subtotal + (taxa ?? 0), faltaParaMinimo, temEncomenda }
}

const maximo = (n: number) => `Use no máximo ${n} caracteres`

/** Objeto vazio = válido. Mensagens em português, para aparecer ao lado de cada campo. */
export function validarPedido(
  dados: DadosPedido,
  linhas: LinhaSacola[],
  agora: InstanteLoja,
  loja: Loja,
): ErrosPedido {
  const erros: ErrosPedido = {}
  const r = resumo(linhas, dados, loja)

  if (linhas.length === 0) erros.itens = 'Sua sacola está vazia'

  const nome = dados.nome.trim()
  if (nome.length < LIMITES.nomeMin) erros.nome = 'Conta pra gente seu nome'
  else if (nome.length > LIMITES.nomeMax) erros.nome = maximo(LIMITES.nomeMax)

  if (dados.modo === 'entrega') {
    const bairroValido =
      dados.bairroId === OUTRO_BAIRRO || loja.bairros.some((b) => b.id === dados.bairroId)
    if (!bairroValido) erros.bairroId = 'Escolha o bairro'

    const endereco = dados.endereco.trim()
    if (endereco.length < LIMITES.enderecoMin) erros.endereco = 'Informe rua e número'
    else if (endereco.length > LIMITES.enderecoMax) erros.endereco = maximo(LIMITES.enderecoMax)

    if (dados.complemento.trim().length > LIMITES.complementoMax) {
      erros.complemento = maximo(LIMITES.complementoMax)
    }

    if (bairroValido && dados.bairroId !== OUTRO_BAIRRO && r.faltaParaMinimo > 0 && linhas.length) {
      erros.modo = `Faltam ${formatarBRL(r.faltaParaMinimo)} para entrega; retirada está liberada`
    }
  }

  const disp = horariosDisponiveis({ agora, loja, modo: dados.modo, temEncomenda: r.temEncomenda })
  const q = dados.quando
  const quandoValido =
    q.tipo === 'asap'
      ? disp.asap
      : disp.dias.some((d) => d.data === q.data && d.slots.includes(q.minutos))
  if (!quandoValido) erros.quando = 'Escolha um horário disponível'

  if (!dados.pagamento) erros.pagamento = 'Escolha a forma de pagamento'
  else if (dados.pagamento === 'dinheiro' && dados.trocoPara !== null && dados.trocoPara < r.total) {
    erros.trocoPara = 'O troco precisa ser maior que o total'
  }

  if (dados.observacoes.trim().length > LIMITES.observacoesMax) {
    erros.observacoes = maximo(LIMITES.observacoesMax)
  }
  if (r.temEncomenda && dados.mensagemCartao.trim().length > LIMITES.mensagemCartaoMax) {
    erros.mensagemCartao = maximo(LIMITES.mensagemCartaoMax)
  }

  return erros
}
