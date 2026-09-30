import { Container } from '@/components/ui/Container'
import { TituloSecao } from '@/components/ui/TituloSecao'
import { Preco } from '@/components/ui/Preco'
import { Botao } from '@/components/ui/Botao'
import { IconeRelogio, IconeSacola, IconeWhatsApp } from '@/components/ui/Icone'
import { loja } from '@/content/loja'
import { textos } from '@/content/textos'
import { linkWhatsApp } from '@/lib/mensagem'

const t = textos.entrega


/**
 * Entrega e retirada (#entrega, fundo casca, texto miolo, foco mel via `.bg-casca :focus-visible`).
 * Bairros em <table> (bairro, taxa, tempo), pedido mínimo, retirada sem taxa e saída pelo WhatsApp.
 */
export function Entrega() {
  const whatsapp = linkWhatsApp(loja.whatsapp, textos.whatsapp.mensagemDuvida)

  return (
    <section id="entrega" aria-labelledby="titulo-entrega" className="bg-casca py-(--sec-y) text-miolo">
      <Container className="grid gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="flex flex-col gap-10 lg:col-span-5">
          <TituloSecao
            id="titulo-entrega"
            nivel={2}
            kicker={t.kicker}
            titulo={t.titulo}
            destaque={t.destaque}
            sobreEscuro
          >
            <p>{t.apoio}</p>
          </TituloSecao>

          <dl className="grid border-t border-miolo/25 sm:grid-cols-2 sm:gap-x-8 lg:grid-cols-1">
            <div className="flex flex-col gap-2 border-b border-miolo/25 py-5">
              <dt className="text-sm font-semibold tracking-[0.02em] text-miolo/85">{t.minimo}</dt>
              <dd>
                <Preco centavos={loja.pedidoMinimoEntrega} className="[&_.preco]:text-[1.75rem]" />
              </dd>
            </div>
            <div className="flex flex-col gap-2 border-b border-miolo/25 py-5">
              <dt className="flex items-center gap-2 text-sm font-semibold tracking-[0.02em] text-miolo/85">
                <IconeSacola size={18} className="text-mel" />
                {t.retirada}
              </dt>
              <dd className="texto text-miolo">{t.retiradaDetalhe}</dd>
            </div>
          </dl>
        </div>

        <div className="flex flex-col gap-10 lg:col-span-7 lg:pt-2">
          <table className="w-full border-collapse text-left">
            <caption className="sr-only">{t.bairrosAtendidos}</caption>
            <thead>
              <tr className="border-b border-miolo/40 text-xs font-semibold tracking-[0.08em] text-mel uppercase">
                <th scope="col" className="py-3 pr-3 font-semibold">
                  {t.rotuloBairro}
                </th>
                <th scope="col" className="px-3 py-3 text-right font-semibold">
                  {t.rotuloTaxa}
                </th>
                <th scope="col" className="py-3 pl-3 text-right font-semibold">
                  {t.rotuloTempo}
                </th>
              </tr>
            </thead>
            <tbody>
              {loja.bairros.map((b) => (
                <tr key={b.id} className="border-b border-miolo/15">
                  <th
                    scope="row"
                    className="py-4 pr-3 font-display text-lg font-medium sm:text-2xl display-soft"
                  >
                    {b.nome}
                  </th>
                  <td className="px-3 py-4 text-right">
                    <Preco centavos={b.taxa} />
                  </td>
                  <td className="py-4 pl-3 text-right whitespace-nowrap tabular-nums text-miolo/85">
                    <span className="inline-flex items-center gap-1.5">
                      <IconeRelogio size={16} className="hidden text-mel sm:block" />
                      {t.minutos(b.tempoMin)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="texto max-w-sm text-miolo">{t.outroBairro}</p>
            <Botao
              href={whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              variante="whatsapp"
              className="shrink-0"
            >
              <IconeWhatsApp size={20} />
              {textos.whatsapp.falarComPadaria}
            </Botao>
          </div>
        </div>
      </Container>
    </section>
  )
}
