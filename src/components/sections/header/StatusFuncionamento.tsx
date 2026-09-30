'use client'

import { useSyncExternalStore } from 'react'
import { instanteNaLoja, statusAgora } from '@/lib/funcionamento'
import { IconeRelogio } from '@/components/ui/Icone'
import { loja } from '@/content/loja'
import { textos } from '@/content/textos'

type Props = {
  /**
   * completo: "Aberto agora · fecha às 20h" (hero, menu, header desktop).
   * curto: só a primeira parte ("Aberto agora"), para o header no mobile; o resto fica para leitor de tela.
   */
  variante?: 'completo' | 'curto'
  /** fundo escuro: texto miolo */
  sobreEscuro?: boolean
  className?: string
}

// Relógio compartilhado: o status muda no máximo uma vez por minuto.
// useSyncExternalStore com snapshot de servidor `null` = HTML do servidor mostra o resumo fixo e o
// cliente troca pelo status real logo após hidratar, sem mismatch.
const ouvintes = new Set<() => void>()
let intervalo: number | undefined

function assinar(avisar: () => void) {
  ouvintes.add(avisar)
  if (intervalo === undefined) {
    intervalo = window.setInterval(() => ouvintes.forEach((f) => f()), 30_000)
  }
  return () => {
    ouvintes.delete(avisar)
    if (ouvintes.size === 0 && intervalo !== undefined) {
      window.clearInterval(intervalo)
      intervalo = undefined
    }
  }
}

/** "1|Aberto agora · fecha às 20h" — string para o snapshot ser estável entre leituras. */
function lerStatus(): string {
  const s = statusAgora(instanteNaLoja(new Date(), loja.fuso), loja)
  return `${s.aberto ? 1 : 0}|${s.texto}`
}

const semStatus = () => null

function separar(texto: string): [string, string] {
  const i = texto.indexOf(' · ')
  return i === -1 ? [texto, ''] : [texto.slice(0, i), texto.slice(i + 3)]
}

/** Status de funcionamento no horário da loja (America/Sao_Paulo), atualizado a cada minuto. */
export function StatusFuncionamento({ variante = 'completo', sobreEscuro = false, className = '' }: Props) {
  const snapshot = useSyncExternalStore(assinar, lerStatus, semStatus)
  const corTexto = sobreEscuro ? 'text-miolo' : 'text-casca'

  // Servidor e primeira pintura: resumo fixo dos horários.
  if (snapshot === null) {
    const resumo = textos.header.resumoHorario
    return (
      <p className={`inline-flex items-center gap-2 text-sm font-medium ${corTexto} ${className}`}>
        <IconeRelogio size={16} className="shrink-0" />
        {variante === 'curto' ? <span className="sr-only">{resumo}</span> : <span>{resumo}</span>}
      </p>
    )
  }

  const aberto = snapshot.startsWith('1')
  const texto = snapshot.slice(2)
  const [principal, resto] = separar(texto)
  const ponto = aberto
    ? 'bg-alecrim ring-4 ring-alecrim/15'
    : sobreEscuro
      ? 'bg-miolo/60'
      : 'bg-cinza-forno/70'

  return (
    <p className={`inline-flex items-center gap-2 text-sm font-medium ${corTexto} ${className}`}>
      <span aria-hidden="true" className={`size-2 shrink-0 rounded-pill ${ponto}`} />
      {variante === 'curto' ? (
        <span>
          <span className={aberto && !sobreEscuro ? 'font-semibold text-alecrim' : 'font-semibold'}>{principal}</span>
          {resto && <span className="sr-only"> · {resto}</span>}
        </span>
      ) : (
        <span>
          <span className={aberto && !sobreEscuro ? 'font-semibold text-alecrim' : 'font-semibold'}>{principal}</span>
          {resto && <span className={sobreEscuro ? 'text-miolo/80' : 'text-cinza-forno'}> · {resto}</span>}
        </span>
      )}
    </p>
  )
}
