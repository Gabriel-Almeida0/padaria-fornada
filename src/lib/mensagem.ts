// Mensagem do pedido e link do WhatsApp (contracts/mensagem-whatsapp.md).
import type { DadosPedido, InstanteLoja, LinhaSacola, Loja } from './tipos.ts'
import { formatarBRLTexto as brl } from './dinheiro.ts'
import { formatarHora, rotuloDia } from './funcionamento.ts'
import { OUTRO_BAIRRO, resumo } from './pedido.ts'

/** Tira espaços das pontas e junta linhas internas com " / " (uma mensagem, uma linha por campo). */
function umaLinha(texto: string): string {
  return texto
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .join(' / ')
}

export function montarMensagem(entrada: {
  linhas: LinhaSacola[]
  dados: DadosPedido
  loja: Loja
  agora: InstanteLoja
}): string {
  const { linhas, dados, loja, agora } = entrada
  const r = resumo(linhas, dados, loja)
  const outroBairro = dados.modo === 'entrega' && dados.bairroId === OUTRO_BAIRRO
  const bairro = loja.bairros.find((b) => b.id === dados.bairroId)

  const out: string[] = [`Olá, ${loja.nome}! Quero fazer um pedido 🥖`, '']

  for (const l of linhas) {
    const variacao = l.variacao ? ` (${l.variacao.nome})` : ''
    out.push(`${l.quantidade}× ${l.produto.nome}${variacao} — ${brl(l.total)}`)
  }

  out.push('', `Subtotal: ${brl(r.subtotal)}`)
  if (dados.modo === 'entrega') {
    if (outroBairro) out.push('Entrega: a combinar')
    else if (bairro) out.push(`Entrega (${bairro.nome}): ${brl(bairro.taxa)}`)
  }
  out.push(outroBairro ? `Total: ${brl(r.total)} + entrega a combinar` : `Total: ${brl(r.total)}`, '')

  if (dados.modo === 'retirada') {
    const e = loja.endereco
    out.push(`Retirada na loja: ${e.rua}, ${e.numero} — ${e.bairro}`)
  } else {
    const complemento = umaLinha(dados.complemento)
    const nomeBairro = outroBairro ? 'outro bairro' : bairro?.nome ?? ''
    out.push(
      `Entrega: ${umaLinha(dados.endereco)}${complemento ? `, ${complemento}` : ''}${nomeBairro ? ` — ${nomeBairro}` : ''}`,
    )
  }

  const q = dados.quando
  out.push(
    q.tipo === 'asap'
      ? 'Quando: assim que possível'
      : `Quando: ${rotuloDia(q.data, agora)}, às ${formatarHora(q.minutos)}`,
  )

  if (dados.pagamento === 'pix') out.push('Pagamento: Pix')
  else if (dados.pagamento === 'cartao') out.push(`Pagamento: cartão na ${dados.modo}`)
  else if (dados.pagamento === 'dinheiro') {
    const troco = dados.trocoPara !== null ? `, troco para ${brl(dados.trocoPara)}` : ''
    out.push(`Pagamento: dinheiro${troco}`)
  }

  const cartao = umaLinha(dados.mensagemCartao)
  if (r.temEncomenda && cartao) out.push(`Mensagem do cartão: "${cartao}"`)

  const obs = umaLinha(dados.observacoes)
  if (obs) out.push(`Observações: ${obs}`)

  out.push('', `Nome: ${umaLinha(dados.nome)}`)

  return out.map((l) => l.trimEnd()).join('\n')
}

/** `https://wa.me/<numero>?text=<texto codificado>`. O número precisa ser só dígitos. */
export function linkWhatsApp(numero: string, texto: string): string {
  if (!/^\d+$/.test(numero)) {
    throw new Error(`Número de WhatsApp inválido: use só dígitos (recebido "${numero}")`)
  }
  return `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`
}
