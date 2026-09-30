'use client'

import { IconeMais, IconeMenos } from '@/components/ui/Icone'
import { QUANTIDADE_MAXIMA } from '@/lib/sacola'
import { textos } from '@/content/textos'
import { useSacola } from './useSacola'

type Props = {
  /** chave da linha (`chaveItem(produtoId, variacaoId)`) */
  chave: string
  /** nome falado nos rótulos ("Diminuir Croissant de manteiga") */
  nome: string
  quantidade: number
  /** md = 48px (card, mesma altura do "Adicionar"); sm = 44px (gaveta) */
  tamanho?: 'md' | 'sm'
  className?: string
}

const t = textos.sacola

/** `− n +`. Chegar a zero remove o item (com "Desfazer" no aviso). */
export function ControleQuantidade({ chave, nome, quantidade, tamanho = 'md', className = '' }: Props) {
  const { definirQuantidade } = useSacola()
  const alvo = tamanho === 'md' ? 'size-12' : 'size-11'
  const botao = `${alvo} inline-flex shrink-0 items-center justify-center rounded-botao text-casca transition-colors duration-200 ease-marca hover:bg-trigo active:bg-trigo`
  const noLimite = quantidade >= QUANTIDADE_MAXIMA

  return (
    <div
      role="group"
      aria-label={t.quantidadeAria(nome)}
      className={`inline-flex items-center justify-between rounded-botao border-[1.5px] border-casca bg-papel ${className}`}
    >
      <button
        type="button"
        className={botao}
        aria-label={t.diminuirAria(nome)}
        onClick={() => definirQuantidade(chave, quantidade - 1)}
      >
        <IconeMenos size={20} />
      </button>
      <span className="min-w-8 px-1 text-center text-base font-semibold tabular-nums" aria-hidden="true">
        {quantidade}
      </span>
      <span className="sr-only">{t.unidades(quantidade)}</span>
      <button
        type="button"
        className={botao}
        aria-label={t.aumentarAria(nome)}
        data-foco="mais"
        aria-disabled={noLimite || undefined}
        onClick={() => definirQuantidade(chave, quantidade + 1)}
      >
        <IconeMais size={20} />
      </button>
    </div>
  )
}
