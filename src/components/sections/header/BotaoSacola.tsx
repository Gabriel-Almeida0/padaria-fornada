'use client'

import { IconeSacola } from '@/components/ui/Icone'
import { useSacola } from '@/components/sacola/useSacola'
import { textos } from '@/content/textos'

/** Ícone da sacola com contador; 44×44; abre a gaveta guardando o gatilho para devolver o foco. */
export function BotaoSacola({ className = '' }: { className?: string }) {
  const { quantidadeTotal, hidratado, abrir } = useSacola()
  const n = hidratado ? quantidadeTotal : 0
  return (
    <button
      type="button"
      onClick={(e) => abrir(e.currentTarget)}
      aria-label={`${textos.sacola.abrir}, ${textos.sacola.itens(n)}`}
      className={`relative inline-flex size-11 shrink-0 items-center justify-center rounded-botao text-casca transition-colors duration-200 ease-marca hover:bg-trigo ${className}`}
    >
      <IconeSacola size={24} />
      {n > 0 && (
        <span
          aria-hidden="true"
          className="absolute top-0.5 right-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-pill bg-brasa px-1.5 text-[11px] leading-none font-bold text-papel tabular-nums ring-2 ring-miolo"
        >
          {n > 99 ? '99+' : n}
        </span>
      )}
    </button>
  )
}
