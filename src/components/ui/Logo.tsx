import { loja } from '@/content/loja'

type Props = {
  className?: string
  /** tamanho do texto; o símbolo acompanha (em) */
  tamanho?: 'md' | 'lg'
}

/** Espiga estilizada: desenho próprio da Fornada. Cor do traço = currentColor, grãos em mel. */
export function SimboloEspiga({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 32" className={className} aria-hidden="true" focusable="false">
      <path d="M12 31V9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" fill="none" />
      <g className="fill-mel">
        <ellipse cx="12" cy="5" rx="2.6" ry="4.2" />
        <ellipse cx="8.2" cy="11.5" rx="2.4" ry="4" transform="rotate(-32 8.2 11.5)" />
        <ellipse cx="15.8" cy="11.5" rx="2.4" ry="4" transform="rotate(32 15.8 11.5)" />
        <ellipse cx="8.2" cy="18" rx="2.4" ry="4" transform="rotate(-32 8.2 18)" />
        <ellipse cx="15.8" cy="18" rx="2.4" ry="4" transform="rotate(32 15.8 18)" />
      </g>
    </svg>
  )
}

/** "Fornada" em Fraunces + símbolo. Coloque dentro de um link quando for navegável. */
export function Logo({ className = '', tamanho = 'md' }: Props) {
  const texto = tamanho === 'lg' ? 'text-4xl' : 'text-2xl'
  return (
    <span className={`inline-flex items-center gap-1.5 ${texto} ${className}`}>
      <SimboloEspiga className="h-[1.15em] w-auto shrink-0" />
      <span className="font-display font-semibold leading-none tracking-[-0.01em] display-soft">
        {loja.nome}
      </span>
    </span>
  )
}
