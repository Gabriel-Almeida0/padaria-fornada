import { formatarBRL, valorDecimal } from '@/lib/dinheiro'
import { textos } from '@/content/textos'

type Props = {
  centavos: number
  aPartirDe?: boolean
  className?: string
}

/** Preço em R$ numa linha só, com números tabulares. */
export function Preco({ centavos, aPartirDe = false, className = '' }: Props) {
  return (
    <span className={`inline-flex items-baseline gap-1.5 ${className}`}>
      {aPartirDe && <span className="legenda">{textos.sacola.aPartirDe}</span>}
      <data value={valorDecimal(centavos)} className="preco">
        {formatarBRL(centavos)}
      </data>
    </span>
  )
}
