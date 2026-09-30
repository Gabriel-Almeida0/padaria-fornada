import type { LucideIcon, LucideProps } from 'lucide-react'
import {
  ArrowRight,
  Check,
  ChevronDown,
  Clock,
  MapPin,
  Menu,
  Minus,
  Phone,
  Plus,
  ShoppingBag,
  Trash2,
  X,
} from 'lucide-react'
import type { SVGProps } from 'react'

/** Ícones Lucide com traço de 1.5px e `aria-hidden` por padrão (dê nome no botão, não no ícone). */
function comTraco(Icone: LucideIcon, nome: string) {
  function IconeFornada(props: LucideProps) {
    return <Icone strokeWidth={1.5} aria-hidden="true" focusable="false" {...props} />
  }
  IconeFornada.displayName = nome
  return IconeFornada
}

export const IconeSeta = comTraco(ArrowRight, 'IconeSeta')
export const IconeCheck = comTraco(Check, 'IconeCheck')
export const IconeChevron = comTraco(ChevronDown, 'IconeChevron')
export const IconeRelogio = comTraco(Clock, 'IconeRelogio')
export const IconeLocal = comTraco(MapPin, 'IconeLocal')
export const IconeMenu = comTraco(Menu, 'IconeMenu')
export const IconeMenos = comTraco(Minus, 'IconeMenos')
export const IconeTelefone = comTraco(Phone, 'IconeTelefone')
export const IconeMais = comTraco(Plus, 'IconeMais')
export const IconeSacola = comTraco(ShoppingBag, 'IconeSacola')
export const IconeLixeira = comTraco(Trash2, 'IconeLixeira')
export const IconeFechar = comTraco(X, 'IconeFechar')

type SvgProps = SVGProps<SVGSVGElement> & { size?: number | string }

/** Balão de conversa com fone: desenho próprio, sem a marca oficial do WhatsApp. */
export function IconeWhatsApp({ size = 24, ...props }: SvgProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path d="M4.2 19.8l1.1-3.6A8.3 8.3 0 1 1 8 18.8z" />
      <path d="M9.2 8.3c.2-.4.5-.5.8-.5h.4c.2 0 .4.1.5.4l.6 1.4c.1.2 0 .5-.1.7l-.5.6c.6 1.2 1.6 2.2 2.8 2.8l.6-.5c.2-.2.5-.2.7-.1l1.4.6c.3.1.4.3.4.5v.4c0 .3-.1.6-.5.8-.6.4-1.4.5-2.1.3a7.7 7.7 0 0 1-4.7-4.7c-.2-.7-.1-1.5.3-2.1z" />
    </svg>
  )
}

/** Câmera simples (Lucide v1 não traz ícones de marca). Desenho próprio. */
export function IconeInstagram({ size = 24, ...props }: SvgProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="3.8" />
      <circle cx="17" cy="7" r="0.6" fill="currentColor" />
    </svg>
  )
}
