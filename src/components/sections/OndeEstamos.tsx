import { Container } from '@/components/ui/Container'
import { TituloSecao } from '@/components/ui/TituloSecao'
import { Foto } from '@/components/ui/Foto'
import { Botao } from '@/components/ui/Botao'
import { IconeLocal, IconeRelogio, IconeTelefone, IconeWhatsApp } from '@/components/ui/Icone'
import { loja } from '@/content/loja'
import { textos } from '@/content/textos'
import { linkWhatsApp } from '@/lib/mensagem'
import { HojeDestaque } from './onde-estamos/HojeDestaque'

const t = textos.ondeEstamos
const e = loja.endereco

/**
 * Onde estamos (#onde-estamos, fundo trigo): seção nativa com a mesma identidade do site
 * (resposta aos pontos fracos 5 e 18). Foto da fachada, endereço, "Como chegar" com texto,
 * WhatsApp, telefone e os horários dos 7 dias com o dia de hoje marcado no cliente.
 */
export function OndeEstamos() {
  const whatsapp = linkWhatsApp(loja.whatsapp, textos.whatsapp.mensagemDuvida)

  return (
    <section id="onde-estamos" aria-labelledby="titulo-onde-estamos" className="bg-trigo py-(--sec-y)">
      <Container className="grid gap-10 lg:grid-cols-12 lg:gap-x-12 lg:gap-y-14">
        <TituloSecao
          id="titulo-onde-estamos"
          nivel={2}
          kicker={t.kicker}
          titulo={t.titulo}
          destaque={t.destaque}
          className="lg:col-span-12"
        />

        <div className="flex flex-col gap-8 lg:col-span-7">
          <Foto
            chave="fachada"
            sizes="(min-width: 80rem) 620px, (min-width: 64rem) 55vw, 100vw"
            className="aspect-[4/3]"
          />

          <div className="grid gap-8 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
            <div className="flex flex-col gap-3">
              <h3 className="kicker flex items-center gap-2 text-brasa-escura">
                <IconeLocal size={16} />
                {t.endereco}
              </h3>
              <address className="font-display text-2xl leading-snug not-italic display-soft">
                {e.rua}, {e.numero}
                <br />
                {e.bairro}, {e.cidade} · {e.uf}
              </address>
            </div>
            <Botao
              href={loja.mapaUrl}
              target="_blank"
              rel="noopener noreferrer"
              variante="secundario"
              className="self-start sm:self-auto"
            >
              <IconeLocal size={20} />
              {t.comoChegar}
              <span className="sr-only"> ({t.comoChegarDetalhe})</span>
            </Botao>
          </div>
        </div>

        <div className="flex flex-col gap-6 lg:col-span-5">
          <div className="flex flex-col gap-5 rounded-card bg-miolo p-6 sm:p-8">
            <h3 className="kicker flex items-center gap-2 text-brasa">
              <IconeRelogio size={16} />
              {t.horarios}
            </h3>
            <HojeDestaque />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
            <Botao
              href={whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              variante="whatsapp"
              className="whitespace-nowrap sm:flex-1"
            >
              <IconeWhatsApp size={20} />
              {textos.whatsapp.falarComPadaria}
            </Botao>
            <Botao href={`tel:+${loja.whatsapp}`} variante="secundario" className="whitespace-nowrap sm:flex-1">
              <IconeTelefone size={20} />
              <span className="sr-only">{t.telefone}: </span>
              {loja.whatsappExibicao}
            </Botao>
          </div>
        </div>
      </Container>
    </section>
  )
}
