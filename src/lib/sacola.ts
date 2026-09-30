// Reducer puro da sacola (research R6). Preço nunca entra aqui: sempre vem do cardápio.
import type { AcaoSacola, EstadoSacola, ItemSacola, Produto } from './tipos.ts'

export const QUANTIDADE_MAXIMA = 20

export const estadoInicial: EstadoSacola = { itens: [], removidoRecente: null }

export function chaveItem(produtoId: string, variacaoId: string | null): string {
  return `${produtoId}:${variacaoId ?? '-'}`
}

const chaveDe = (item: ItemSacola) => chaveItem(item.produtoId, item.variacaoId)
const limitar = (n: number) => Math.min(QUANTIDADE_MAXIMA, n)

function removerNoIndice(estado: EstadoSacola, indice: number): EstadoSacola {
  const item = estado.itens[indice]
  return {
    itens: estado.itens.filter((_, i) => i !== indice),
    removidoRecente: { item, indice },
  }
}

export function reduzirSacola(estado: EstadoSacola, acao: AcaoSacola): EstadoSacola {
  switch (acao.tipo) {
    case 'adicionar': {
      const variacaoId = acao.variacaoId ?? null
      const chave = chaveItem(acao.produtoId, variacaoId)
      const indice = estado.itens.findIndex((i) => chaveDe(i) === chave)
      if (indice === -1) {
        return {
          ...estado,
          itens: [...estado.itens, { produtoId: acao.produtoId, variacaoId, quantidade: 1 }],
        }
      }
      const atual = estado.itens[indice]
      if (atual.quantidade >= QUANTIDADE_MAXIMA) return estado
      return {
        ...estado,
        itens: estado.itens.map((item, i) =>
          i === indice ? { ...item, quantidade: limitar(item.quantidade + 1) } : item,
        ),
      }
    }
    case 'definirQuantidade': {
      const indice = estado.itens.findIndex((i) => chaveDe(i) === acao.chave)
      if (indice === -1) return estado
      const n = Math.floor(acao.quantidade)
      if (!(n > 0)) return removerNoIndice(estado, indice)
      const quantidade = limitar(n)
      if (estado.itens[indice].quantidade === quantidade) return estado
      return {
        ...estado,
        itens: estado.itens.map((item, i) => (i === indice ? { ...item, quantidade } : item)),
      }
    }
    case 'remover': {
      const indice = estado.itens.findIndex((i) => chaveDe(i) === acao.chave)
      if (indice === -1) return estado
      return removerNoIndice(estado, indice)
    }
    case 'desfazer': {
      const r = estado.removidoRecente
      if (!r) return estado
      const chave = chaveDe(r.item)
      // se a pessoa já adicionou o mesmo item de novo, soma em vez de duplicar a linha
      if (estado.itens.some((i) => chaveDe(i) === chave)) {
        return {
          itens: estado.itens.map((i) =>
            chaveDe(i) === chave ? { ...i, quantidade: limitar(i.quantidade + r.item.quantidade) } : i,
          ),
          removidoRecente: null,
        }
      }
      const itens = [...estado.itens]
      itens.splice(Math.min(r.indice, itens.length), 0, r.item)
      return { itens, removidoRecente: null }
    }
    case 'limpar':
      return estadoInicial
    case 'carregar':
      return { itens: acao.itens, removidoRecente: null }
  }
}

/**
 * Recebe qualquer coisa (vinda do localStorage) e devolve só itens válidos para o cardápio atual:
 * produto existente, variação válida (obrigatória se o produto tem variações), quantidade 1–20,
 * linhas repetidas somadas.
 */
export function reconciliar(itens: unknown, produtos: Produto[]): ItemSacola[] {
  if (!Array.isArray(itens)) return []
  const porId = new Map(produtos.map((p) => [p.id, p]))
  const saida: ItemSacola[] = []
  for (const bruto of itens) {
    if (!bruto || typeof bruto !== 'object') continue
    const { produtoId, variacaoId, quantidade } = bruto as Record<string, unknown>
    if (typeof produtoId !== 'string') continue
    const produto = porId.get(produtoId)
    if (!produto) continue

    let variacao: string | null = null
    if (produto.variacoes?.length) {
      if (typeof variacaoId !== 'string') continue
      if (!produto.variacoes.some((v) => v.id === variacaoId)) continue
      variacao = variacaoId
    } else if (variacaoId != null) {
      continue
    }

    if (typeof quantidade !== 'number' || !Number.isFinite(quantidade)) continue
    const n = Math.floor(quantidade)
    if (n < 1) continue

    const chave = chaveItem(produtoId, variacao)
    const existente = saida.find((i) => chaveDe(i) === chave)
    if (existente) existente.quantidade = limitar(existente.quantidade + n)
    else saida.push({ produtoId, variacaoId: variacao, quantidade: limitar(n) })
  }
  return saida
}
