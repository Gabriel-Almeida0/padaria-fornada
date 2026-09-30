import { Botao } from '@/components/ui/Botao'
import { Container } from '@/components/ui/Container'
import { Foto } from '@/components/ui/Foto'
import { IconeSeta } from '@/components/ui/Icone'
import { TituloSecao } from '@/components/ui/TituloSecao'
import { textos } from '@/content/textos'
import { StatusFuncionamento } from './header/StatusFuncionamento'

const t = textos.hero

/** Primeira dobra: split 6/6 (texto/foto) no desktop (5/7 quebrava o h1 em 3 linhas); no mobile a foto vem depois do texto. */
export function Hero() {
  return (
    <section id="inicio" aria-labelledby="hero-titulo" className="pt-8 pb-(--sec-y) sm:pt-12 lg:pt-10">
      <Container className="grid items-center gap-10 lg:grid-cols-12 lg:gap-10">
        <div className="flex flex-col gap-8 lg:col-span-6 lg:py-8 lg:pr-6 xl:pr-10">
          <TituloSecao id="hero-titulo" nivel={1} kicker={t.kicker} titulo={t.titulo} destaque={t.destaque}>
            <p className="max-w-[34rem]">{t.apoio}</p>
          </TituloSecao>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Botao href="#cardapio" className="sm:px-7">
              {t.ctaPrincipal}
              <IconeSeta size={20} />
            </Botao>
            <Botao href="#encomendas" variante="secundario">
              {t.ctaSecundario}
            </Botao>
          </div>

          <StatusFuncionamento className="border-t border-casca/10 pt-5" />
        </div>

        <div className="lg:col-span-6">
          <Foto
            chave="hero"
            prioridade
            sizes="(min-width: 80rem) 540px, (min-width: 64rem) 48vw, 100vw"
            className="aspect-[4/3] sm:aspect-[16/11] lg:aspect-[4/5] lg:max-h-[calc(100svh-var(--header-h)-5rem)] lg:min-h-[32rem]"
          />
        </div>
      </Container>
    </section>
  )
}
