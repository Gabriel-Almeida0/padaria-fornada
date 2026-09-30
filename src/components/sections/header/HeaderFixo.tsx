'use client'

import { useEffect, useRef, type ReactNode } from 'react'

/** `<header>` sticky que ganha a sombra `--shadow-header` depois que a página rola. */
export function HeaderFixo({ className = '', children }: { className?: string; children: ReactNode }) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const atualizar = () => el.toggleAttribute('data-rolou', window.scrollY > 4)
    atualizar()
    window.addEventListener('scroll', atualizar, { passive: true })
    return () => window.removeEventListener('scroll', atualizar)
  }, [])

  return (
    <header
      ref={ref}
      className={`sticky top-0 z-40 bg-miolo transition-shadow duration-200 ease-marca data-rolou:shadow-header ${className}`}
    >
      {children}
    </header>
  )
}
