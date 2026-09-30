import type { SeloId } from '@/lib/tipos'
import { rotulosSelo } from '@/content/cardapio'

/** Chip informativo do produto ("Fermentação natural", "Vegano", "Novo"…). */
export function Selo({ selo, className = '' }: { selo: SeloId; className?: string }) {
  const estilo =
    selo === 'novo' ? 'bg-mel text-casca border-mel' : 'bg-transparent text-casca border-linha'
  return (
    <span
      className={`inline-flex items-center rounded-pill border px-2.5 py-1 text-xs font-semibold leading-none ${estilo} ${className}`}
    >
      {rotulosSelo[selo]}
    </span>
  )
}
