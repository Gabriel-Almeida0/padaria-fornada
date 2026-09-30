'use client'

import { useSyncExternalStore } from 'react'
import type { DiaSemana } from '@/lib/tipos'
import { formatarHoraCurta, instanteNaLoja, nomeDia, statusAgora } from '@/lib/funcionamento'
import { loja } from '@/content/loja'
import { textos } from '@/content/textos'

const t = textos.ondeEstamos

// Semana começando na segunda, como se lê num cartaz de padaria.
const ORDEM: DiaSemana[] = [1, 2, 3, 4, 5, 6, 0]

const intervalo = (abre: number, fecha: number) => t.intervalo(formatarHoraCurta(abre), formatarHoraCurta(fecha))

type Agora = { dia: DiaSemana; aberto: boolean; texto: string }

// Snapshot como string (estável entre chamadas); relê a cada 30 s para virar o dia/status sozinho.
function lerAgora(): string {
  const agora = instanteNaLoja(new Date(), loja.fuso)
  const s = statusAgora(agora, loja)
  return `${agora.diaSemana}|${s.aberto ? 1 : 0}|${s.texto}`
}

function assinar(avisar: () => void) {
  const id = window.setInterval(avisar, 30_000)
  return () => window.clearInterval(id)
}

function decodificar(s: string | null): Agora | null {
  if (!s) return null
  const [dia, aberto, texto] = s.split('|')
  return { dia: Number(dia) as DiaSemana, aberto: aberto === '1', texto }
}

/**
 * Horários dos 7 dias em <dl>. No servidor (e na hidratação) nada é marcado, porque o "hoje"
 * depende do relógio de quem visita: `getServerSnapshot` devolve null e só depois o cliente
 * marca o dia com `aria-current="date"`. Sem mismatch de hidratação.
 */
export function HojeDestaque({ className = '' }: { className?: string }) {
  const agora = decodificar(useSyncExternalStore(assinar, lerAgora, () => null))

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      <p className="flex min-h-6 items-center gap-2 text-sm font-semibold" aria-live="off">
        {agora && (
          <>
            <span
              aria-hidden="true"
              className={`size-2.5 rounded-pill ${agora.aberto ? 'bg-alecrim' : 'bg-brasa'}`}
            />
            {agora.texto}
          </>
        )}
      </p>
      <dl className="flex flex-col">
        {ORDEM.map((dia) => {
          const exp = loja.horarios[dia]
          const hoje = agora?.dia === dia
          return (
            <div
              key={dia}
              aria-current={hoje ? 'date' : undefined}
              className={`-mx-3 flex items-baseline justify-between gap-4 border-b border-casca/10 px-3 py-2.5 last:border-b-0 ${
                hoje ? 'rounded-card bg-trigo font-semibold' : ''
              }`}
            >
              <dt className="flex items-center gap-2 capitalize">
                {nomeDia(dia)}
                {hoje && (
                  <span className="rounded-pill bg-casca px-2 py-0.5 text-xs font-semibold text-miolo normal-case">
                    {t.hoje}
                  </span>
                )}
              </dt>
              <dd className={`tabular-nums ${exp ? '' : 'text-cinza-forno'}`}>
                {exp ? intervalo(exp.abre, exp.fecha) : t.fechado}
              </dd>
            </div>
          )
        })}
      </dl>
    </div>
  )
}
