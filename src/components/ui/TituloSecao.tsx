import type { ReactNode } from 'react'

type Props = {
  kicker?: string
  titulo: string
  /** trecho do título em Fraunces itálico com sublinhado ondulado mel (a assinatura da marca) */
  destaque?: string
  nivel: 1 | 2
  /** id do heading (use em aria-labelledby da seção) */
  id: string
  /** fundo casca: kicker em mel em vez de brasa */
  sobreEscuro?: boolean
  alinhamento?: 'esquerda' | 'centro'
  className?: string
  children?: ReactNode
}

function comDestaque(titulo: string, destaque?: string): ReactNode {
  if (!destaque) return titulo
  const i = titulo.indexOf(destaque)
  if (i === -1) {
    return (
      <>
        {titulo} <em className="destaque">{destaque}</em>
      </>
    )
  }
  return (
    <>
      {titulo.slice(0, i)}
      <em className="destaque">{destaque}</em>
      {titulo.slice(i + destaque.length)}
    </>
  )
}

/** Kicker + h1/h2 com a palavra-assinatura. `children` vira o parágrafo de apoio. */
export function TituloSecao({
  kicker,
  titulo,
  destaque,
  nivel,
  id,
  sobreEscuro = false,
  alinhamento = 'esquerda',
  className = '',
  children,
}: Props) {
  const Heading = nivel === 1 ? 'h1' : 'h2'
  const centro = alinhamento === 'centro' ? 'text-center mx-auto items-center' : ''
  return (
    <div className={`flex max-w-2xl flex-col gap-4 ${centro} ${className}`}>
      {kicker && <p className={`kicker ${sobreEscuro ? 'text-mel' : ''}`}>{kicker}</p>}
      <Heading id={id} className={nivel === 1 ? 'titulo-1' : 'titulo-2'}>
        {comDestaque(titulo, destaque)}
      </Heading>
      {children && (
        <div className={`texto ${sobreEscuro ? 'text-miolo' : 'text-cinza-forno'}`}>{children}</div>
      )}
    </div>
  )
}
