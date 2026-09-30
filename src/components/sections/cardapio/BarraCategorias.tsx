'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

export type ItemBarra = { nome: string; ancora: string }

type Props = {
  itens: ItemBarra[]
  /** nome acessível da navegação */
  rotulo: string
  className?: string
}

/** Lê uma variável de layout em px (ex.: `--header-h: 64px`), com valor de reserva. */
function pxDaVariavel(nome: string, reserva: number): number {
  const v = parseFloat(getComputedStyle(document.documentElement).getPropertyValue(nome))
  return Number.isFinite(v) ? v : reserva
}

function semMovimento(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Barra de categorias do cardápio (research R9): sticky logo abaixo do header, 56px, chips que são
 * âncoras reais (`#cat-*`, funcionam sem JS). Com JS, um IntersectionObserver marca a categoria
 * visível com `aria-current="true"` e traz o chip ativo para a vista dentro da própria barra.
 */
export function BarraCategorias({ itens, rotulo, className = '' }: Props) {
  const [ativa, setAtiva] = useState<string | null>(null)
  const lista = useRef<HTMLUListElement>(null)
  const visiveis = useRef(new Set<string>())
  /** depois de um clique, a rolagem suave passa por outras seções: não pisca o chip no caminho */
  const travadaAte = useRef(0)

  const recalcular = useCallback(() => {
    if (performance.now() < travadaAte.current) return
    // a primeira (na ordem do cardápio) que está na faixa de leitura, logo abaixo das barras
    const primeira = itens.find((i) => visiveis.current.has(i.ancora))
    if (primeira) setAtiva(primeira.ancora)
  }, [itens])

  useEffect(() => {
    const alvos = itens
      .map((i) => document.getElementById(i.ancora))
      .filter((el): el is HTMLElement => el !== null)
    if (alvos.length === 0 || !('IntersectionObserver' in window)) return

    const topo = pxDaVariavel('--header-h', 64) + pxDaVariavel('--cats-h', 56)
    const vistas = visiveis.current
    const observador = new IntersectionObserver(
      (entradas) => {
        for (const e of entradas) {
          if (e.isIntersecting) vistas.add(e.target.id)
          else vistas.delete(e.target.id)
        }
        recalcular()
      },
      // faixa de leitura: de logo abaixo das barras fixas até 55% da tela. A folga de 24px é maior
      // que o scroll-margin extra (8px), então ao pular para #cat-x a seção anterior já saiu da faixa
      { rootMargin: `-${topo + 24}px 0px -45% 0px`, threshold: 0 },
    )
    alvos.forEach((el) => observador.observe(el))

    const soltar = () => {
      travadaAte.current = 0
      recalcular()
    }
    window.addEventListener('scrollend', soltar)
    return () => {
      observador.disconnect()
      vistas.clear()
      window.removeEventListener('scrollend', soltar)
    }
  }, [itens, recalcular])

  // leva o chip ativo para a vista rolando só a barra (scrollIntoView rolaria a página também)
  useEffect(() => {
    const ul = lista.current
    if (!ul || !ativa) return
    const chip = ul.querySelector<HTMLElement>(`a[href="#${ativa}"]`)
    if (!chip) return
    const esquerda = chip.offsetLeft - (ul.clientWidth - chip.offsetWidth) / 2
    ul.scrollTo({ left: Math.max(0, esquerda), behavior: semMovimento() ? 'auto' : 'smooth' })
  }, [ativa])

  const aoClicar = (ancora: string, instante: number) => {
    // `timeStamp` do evento está na mesma base de `performance.now()`
    travadaAte.current = instante + 1200
    setAtiva(ancora)
  }

  return (
    <nav
      aria-label={rotulo}
      className={`sticky top-(--header-h) z-30 h-(--cats-h) border-b border-linha/30 bg-miolo/95 backdrop-blur-sm ${className}`}
    >
      <div className="mx-auto h-full w-full max-w-(--maxw) md:px-8">
        <ul
          ref={lista}
          className="flex h-full snap-x snap-mandatory scroll-px-5 items-center gap-2 overflow-x-auto overscroll-x-contain px-5 [scrollbar-width:none] md:-mx-1 md:scroll-px-1 md:px-1 [&::-webkit-scrollbar]:hidden"
        >
          {itens.map((item) => {
            const atual = item.ancora === ativa
            return (
              <li key={item.ancora} className="shrink-0 snap-start">
                <a
                  href={`#${item.ancora}`}
                  aria-current={atual ? 'true' : undefined}
                  onClick={(e) => aoClicar(item.ancora, e.timeStamp)}
                  className={`inline-flex min-h-11 items-center rounded-pill border-[1.5px] px-4 text-[0.9375rem] leading-none font-semibold whitespace-nowrap transition-colors duration-200 ease-marca ${
                    atual
                      ? 'border-casca bg-casca text-miolo'
                      : 'border-linha/60 text-casca hover:border-casca hover:bg-trigo'
                  }`}
                >
                  {item.nome}
                </a>
              </li>
            )
          })}
        </ul>
      </div>
    </nav>
  )
}
