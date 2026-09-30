import type { DadosPedido } from '@/lib/tipos'
import type { Resumo } from '@/lib/pedido'
import { OUTRO_BAIRRO } from '@/lib/pedido'
import { formatarBRL, valorDecimal } from '@/lib/dinheiro'
import { loja } from '@/content/loja'
import { textosSacola as t } from '@/content/textosSacola'

type Props = {
  resumo: Resumo
  dados: Pick<DadosPedido, 'modo' | 'bairroId'>
  className?: string
}

/** Subtotal, retirada/entrega e total, em `<dl>` com números tabulares. */
export function ResumoValores({ resumo, dados, className = '' }: Props) {
  const bairro = loja.bairros.find((b) => b.id === dados.bairroId)
  let rotuloEntrega: string = t.retiradaGratis
  let valorEntrega: string = t.gratis
  if (dados.modo === 'entrega') {
    if (dados.bairroId === OUTRO_BAIRRO) {
      rotuloEntrega = t.entrega
      valorEntrega = t.aCombinar
    } else if (bairro) {
      rotuloEntrega = t.entregaBairro(bairro.nome)
      valorEntrega = formatarBRL(bairro.taxa)
    } else {
      rotuloEntrega = t.entrega
      valorEntrega = t.escolhaBairro
    }
  }

  return (
    <dl className={`grid grid-cols-[1fr_auto] gap-x-4 gap-y-1.5 text-sm ${className}`}>
      <dt className="text-cinza-forno">{t.subtotal}</dt>
      <dd className="text-right tabular-nums">
        <data value={valorDecimal(resumo.subtotal)}>{formatarBRL(resumo.subtotal)}</data>
      </dd>
      <dt className="text-cinza-forno">{rotuloEntrega}</dt>
      <dd className="text-right tabular-nums">{valorEntrega}</dd>
      <dt className="mt-1 text-base font-semibold">{t.total}</dt>
      <dd className="preco mt-1 text-right">
        <data value={valorDecimal(resumo.total)}>{formatarBRL(resumo.total)}</data>
        {resumo.taxa === null && (
          <span className="ml-1 text-sm font-medium text-cinza-forno">{t.totalMaisEntrega}</span>
        )}
      </dd>
    </dl>
  )
}
