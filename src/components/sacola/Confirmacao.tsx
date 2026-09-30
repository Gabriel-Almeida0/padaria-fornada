'use client'

import { Check } from 'lucide-react'
import { Botao } from '@/components/ui/Botao'
import { IconeWhatsApp } from '@/components/ui/Icone'
import { textosSacola as t } from '@/content/textosSacola'

type Props = {
  /** link wa.me já montado por `linkWhatsApp` */
  url: string
  /** texto da mensagem, para a pessoa conferir */
  texto: string
  /** `window.open` devolveu null (bloqueado ou `noopener`): o link vira o botão principal */
  bloqueado: boolean
  aoVoltarCardapio: () => void
  aoEditar: () => void
  aoEsvaziar: () => void
}

/**
 * Tela depois de abrir o WhatsApp. A sacola NÃO é esvaziada sozinha (FR-019): o site não sabe
 * se a pessoa tocou em enviar lá.
 */
export function Confirmacao({ url, texto, bloqueado, aoVoltarCardapio, aoEditar, aoEsvaziar }: Props) {
  const linkWhatsApp = (
    <Botao
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      variante={bloqueado ? 'whatsapp' : 'secundario'}
      larguraTotal
    >
      <IconeWhatsApp size={22} />
      {t.abrirWhatsApp}
    </Botao>
  )

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pt-6 pb-8 md:px-6">
        <div className="flex flex-col items-start gap-4">
          <span aria-hidden="true" className="grid size-14 place-items-center rounded-full bg-alecrim text-papel">
            <Check size={30} strokeWidth={2} />
          </span>
          <p className="texto text-lg font-semibold">{t.confirmacaoTexto}</p>
          <p className="legenda">{t.confirmacaoDetalhe}</p>
        </div>

        <div className="mt-6 rounded-botao border-[1.5px] border-linha/60 bg-miolo p-4">
          <p className="font-semibold">{t.bloqueadoTitulo}</p>
          <p className="mt-1 mb-4 legenda">{t.bloqueadoTexto}</p>
          {linkWhatsApp}
        </div>

        <details className="group mt-6 rounded-botao border-[1.5px] border-linha/60">
          <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-4 font-semibold [&::-webkit-details-marker]:hidden">
            {t.verMensagem}
            <span aria-hidden="true" className="text-xl leading-none transition-transform duration-200 group-open:rotate-45">
              +
            </span>
          </summary>
          <pre className="border-t border-linha/40 px-4 py-4 font-sans text-sm leading-relaxed whitespace-pre-wrap break-words text-casca">
            {texto}
          </pre>
        </details>

        <p className="mt-6 legenda">{t.esvaziarDetalhe}</p>
      </div>

      <div className="flex flex-col gap-3 border-t border-linha/40 bg-papel px-5 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] md:px-6">
        <Botao variante="primario" larguraTotal onClick={aoVoltarCardapio}>
          {t.voltarCardapio}
        </Botao>
        <div className="grid grid-cols-2 gap-3">
          <Botao variante="secundario" tamanho="sm" larguraTotal onClick={aoEditar}>
            {t.editarPedido}
          </Botao>
          <Botao variante="secundario" tamanho="sm" larguraTotal onClick={aoEsvaziar}>
            {t.esvaziar}
          </Botao>
        </div>
      </div>
    </div>
  )
}
