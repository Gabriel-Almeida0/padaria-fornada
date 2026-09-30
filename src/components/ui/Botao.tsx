import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react'

export type VarianteBotao = 'primario' | 'secundario' | 'whatsapp' | 'texto'
export type TamanhoBotao = 'md' | 'sm'

type Comum = {
  variante?: VarianteBotao
  /** md = 48px (primário/CTA); sm = 44px (mínimo de alvo de toque) */
  tamanho?: TamanhoBotao
  larguraTotal?: boolean
  className?: string
  children: ReactNode
}

type ComoLink = Comum & AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }
type ComoBotao = Comum & ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined }

export type BotaoProps = ComoLink | ComoBotao

const base =
  'inline-flex items-center justify-center gap-2 rounded-botao font-sans text-base font-semibold leading-none tracking-[0.01em] text-center transition-colors duration-200 ease-marca select-none disabled:cursor-not-allowed disabled:opacity-60 aria-disabled:cursor-not-allowed aria-disabled:opacity-60'

const variantes: Record<VarianteBotao, string> = {
  primario: 'bg-brasa text-papel hover:bg-brasa-escura active:bg-brasa-escura',
  secundario: 'btn-secundario border-[1.5px] border-casca text-casca bg-transparent hover:bg-trigo active:bg-trigo',
  whatsapp: 'bg-whatsapp text-papel hover:bg-alecrim-escuro active:bg-alecrim-escuro',
  texto: 'text-brasa underline underline-offset-4 decoration-1 hover:decoration-2',
}

const tamanhos: Record<TamanhoBotao, string> = {
  md: 'min-h-12 px-6',
  sm: 'min-h-11 px-4',
}

export function classesBotao({
  variante = 'primario',
  tamanho = 'md',
  larguraTotal = false,
  className = '',
}: Omit<Comum, 'children'>): string {
  const t = variante === 'texto' ? (tamanho === 'md' ? 'min-h-12 px-2' : 'min-h-11 px-2') : tamanhos[tamanho]
  return `${base} ${variantes[variante]} ${t} ${larguraTotal ? 'w-full' : ''} ${className}`
}

/** Botão da marca. Com `href` vira `<a>`; sem, `<button type="button">`. */
export function Botao(props: BotaoProps) {
  const { variante, tamanho, larguraTotal, className, children, ...resto } = props
  const classes = classesBotao({ variante, tamanho, larguraTotal, className })
  if (typeof resto.href === 'string') {
    return (
      <a className={classes} {...(resto as AnchorHTMLAttributes<HTMLAnchorElement>)}>
        {children}
      </a>
    )
  }
  const { type = 'button', ...botao } = resto as ButtonHTMLAttributes<HTMLButtonElement>
  return (
    <button type={type} className={classes} {...botao}>
      {children}
    </button>
  )
}
