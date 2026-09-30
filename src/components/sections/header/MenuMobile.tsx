'use client'

import { useId, useRef, useState } from 'react'
import { linkWhatsApp } from '@/lib/mensagem'
import { Botao } from '@/components/ui/Botao'
import { IconeFechar, IconeMenu, IconeWhatsApp } from '@/components/ui/Icone'
import { Logo } from '@/components/ui/Logo'
import { loja } from '@/content/loja'
import { textos } from '@/content/textos'
import { StatusFuncionamento } from './StatusFuncionamento'

const t = textos.header

/**
 * Menu do mobile (abaixo de `lg`): `<dialog>` modal nativo (foco preso e resto da página inerte),
 * Esc fecha, foco volta ao hambúrguer, scroll do body travado e fecha ao tocar num link.
 */
export function MenuMobile({ className = '' }: { className?: string }) {
  const [aberto, setAberto] = useState(false)
  const dialogo = useRef<HTMLDialogElement>(null)
  const gatilho = useRef<HTMLButtonElement>(null)
  const id = useId()
  const idPainel = `menu-${id}`
  const idTitulo = `menu-titulo-${id}`

  function abrir() {
    const d = dialogo.current
    if (!d || d.open) return
    document.documentElement.style.overflow = 'hidden'
    d.showModal()
    setAberto(true)
  }

  function fechar() {
    dialogo.current?.close()
  }

  // Evento `close` do <dialog>: cobre Esc, o botão fechar e o toque num link.
  function aoFechar() {
    document.documentElement.style.overflow = ''
    setAberto(false)
    gatilho.current?.focus()
  }

  return (
    <div className={className}>
      <button
        ref={gatilho}
        type="button"
        onClick={abrir}
        aria-expanded={aberto}
        aria-controls={idPainel}
        aria-label={t.abrirMenu}
        className="inline-flex size-11 items-center justify-center rounded-botao text-casca transition-colors duration-200 ease-marca hover:bg-trigo"
      >
        <IconeMenu size={24} />
      </button>

      <dialog
        ref={dialogo}
        id={idPainel}
        aria-labelledby={idTitulo}
        onClose={aoFechar}
        className="m-0 h-dvh max-h-none w-full max-w-none bg-miolo p-0 text-casca backdrop:bg-casca/40 open:animar-surgir"
      >
        <div className="flex min-h-full flex-col">
          <div className="flex h-(--header-h) shrink-0 items-center justify-between border-b border-casca/10 px-5 md:px-8">
            <Logo />
            <h2 id={idTitulo} className="sr-only">
              {t.menu}
            </h2>
            <button
              type="button"
              onClick={fechar}
              aria-label={t.fecharMenu}
              className="-mr-2 inline-flex size-11 items-center justify-center rounded-botao hover:bg-trigo"
            >
              <IconeFechar size={24} />
            </button>
          </div>

          <nav aria-labelledby={idTitulo} className="px-5 pt-4 md:px-8">
            <ul className="flex flex-col">
              {textos.navegacao.map((item) => (
                <li key={item.href} className="border-b border-casca/10">
                  <a
                    href={item.href}
                    onClick={fechar}
                    className="flex min-h-16 items-center font-display text-[1.75rem] leading-none font-medium tracking-[-0.01em] transition-colors hover:text-brasa"
                  >
                    {item.rotulo}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="mt-auto flex flex-col gap-5 px-5 pt-10 pb-[max(2rem,env(safe-area-inset-bottom))] md:px-8">
            <StatusFuncionamento />
            <Botao
              variante="whatsapp"
              larguraTotal
              href={linkWhatsApp(loja.whatsapp, textos.whatsapp.mensagemDuvida)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <IconeWhatsApp size={20} />
              {t.falarNoWhatsApp}
            </Botao>
          </div>
        </div>
      </dialog>
    </div>
  )
}
