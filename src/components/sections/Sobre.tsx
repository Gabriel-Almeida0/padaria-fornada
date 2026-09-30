import { Container } from '@/components/ui/Container'
import { TituloSecao } from '@/components/ui/TituloSecao'
import { Foto } from '@/components/ui/Foto'
import { textos } from '@/content/textos'

const t = textos.sobre

/**
 * Sobre (#sobre, fundo miolo): split 7/5 com a história em 3 parágrafos e a foto 4:5.
 * Os números são da Fornada (inventados), em <dl>: rótulo no <dt>, número no <dd> mostrado antes.
 */
export function Sobre() {
  return (
    <section id="sobre" aria-labelledby="titulo-sobre" className="bg-miolo py-(--sec-y)">
      <Container className="grid gap-12 md:grid-cols-12 md:items-center md:gap-10 lg:gap-16">
        <div className="flex flex-col gap-10 md:col-span-7 lg:pr-6">
          <TituloSecao id="titulo-sobre" nivel={2} kicker={t.kicker} titulo={t.titulo} destaque={t.destaque} />

          <div className="texto flex max-w-[36rem] flex-col gap-5 text-casca/90">
            {t.paragrafos.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>

          <dl className="grid grid-cols-3 gap-4 border-t border-linha pt-8 sm:gap-8">
            {t.numeros.map((n) => (
              <div key={n.rotulo} className="flex flex-col-reverse justify-end gap-2">
                <dt className="legenda">{n.rotulo}</dt>
                <dd className="font-display text-[clamp(2rem,4.5vw,3.25rem)] leading-none font-medium tracking-[-0.02em] text-brasa display-soft">
                  {n.valor}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="relative md:col-span-5">
          <div aria-hidden="true" className="absolute -bottom-5 -left-5 hidden h-3/5 w-3/5 rounded-card bg-trigo md:block" />
          <Foto chave="sobre" sizes="(min-width: 80rem) 440px, (min-width: 48rem) 40vw, 100vw" className="relative aspect-[4/5]" />
        </div>
      </Container>
    </section>
  )
}
