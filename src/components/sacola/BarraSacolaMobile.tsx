'use client'

import { formatarBRL } from '@/lib/dinheiro'
import { textos } from '@/content/textos'
import { IconeSacola } from '@/components/ui/Icone'
import { useSacola } from './useSacola'
import { textosSacola as t } from '@/content/textosSacola'

/**
 * Barra fixa no rodapé abaixo de `md`, só com itens na sacola (FR-011).
 * 56px + safe area; um espaçador do mesmo tamanho no fim da página impede que ela cubra o rodapé.
 */
export function BarraSacolaMobile() {
  const { quantidadeTotal, linhas, abrir } = useSacola()
  if (quantidadeTotal === 0) return null

  const subtotal = linhas.reduce((s, l) => s + l.total, 0)
  const itens = textos.sacola.itens(quantidadeTotal)
  const valor = formatarBRL(subtotal)

  return (
    <>
      <div aria-hidden="true" className="h-[calc(56px+env(safe-area-inset-bottom))] md:hidden" />
      <div className="animar-surgir fixed inset-x-0 bottom-0 z-40 md:hidden">
        <button
          type="button"
          onClick={(e) => abrir(e.currentTarget)}
          aria-label={t.barraAria(itens, valor)}
          className="flex h-[calc(56px+env(safe-area-inset-bottom))] w-full items-center justify-between gap-3 bg-brasa px-5 pb-[env(safe-area-inset-bottom)] text-papel shadow-gaveta transition-colors duration-200 ease-marca hover:bg-brasa-escura active:bg-brasa-escura focus-visible:outline-mel focus-visible:-outline-offset-[6px]"
        >
          <span className="flex items-center gap-2.5 font-semibold">
            <span className="relative">
              <IconeSacola size={22} />
            </span>
            {t.verSacola}
          </span>
          <span className="flex items-center gap-2 text-[0.9375rem] tabular-nums">
            <span>{itens}</span>
            <span aria-hidden="true" className="opacity-70">
              ·
            </span>
            <span className="font-bold">{valor}</span>
          </span>
        </button>
      </div>
    </>
  )
}
