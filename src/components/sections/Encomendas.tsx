import { Container } from '@/components/ui/Container'
import { TituloSecao } from '@/components/ui/TituloSecao'
import { Foto } from '@/components/ui/Foto'
import { Botao } from '@/components/ui/Botao'
import { IconeWhatsApp } from '@/components/ui/Icone'
import { CardProduto } from '@/components/produto/CardProduto'
import { produtosDaCategoria } from '@/content/cardapio'
import { loja } from '@/content/loja'
import { textos } from '@/content/textos'
import { linkWhatsApp } from '@/lib/mensagem'

const t = textos.encomendas


/**
 * Encomendas (#encomendas, fundo trigo): foto 16:10 ao lado das regras (48 h, 3 passos) e os
 * 4 produtos de encomenda com variações. Sobre trigo, texto pequeno em brasa-escura (brasa só
 * passa AA em texto grande neste fundo).
 */
export function Encomendas() {
  const produtos = produtosDaCategoria('encomendas')
  const whatsapp = linkWhatsApp(loja.whatsapp, textos.whatsapp.mensagemDuvida)

  return (
    <section id="encomendas" aria-labelledby="titulo-encomendas" className="bg-trigo py-(--sec-y)">
      <Container className="flex flex-col gap-14 lg:gap-20">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-center lg:gap-12">
          <div className="flex flex-col gap-10 lg:col-span-5">
            <TituloSecao
              id="titulo-encomendas"
              nivel={2}
              kicker={t.kicker}
              titulo={t.titulo}
              destaque={t.destaque}
              className="[&>.texto]:text-casca"
            >
              <p>{t.apoio}</p>
            </TituloSecao>

            <div className="flex flex-col gap-5">
              <h3 className="kicker text-brasa-escura">{t.comoFunciona}</h3>
              <ol className="flex flex-col">
                {t.passos.map((passo, i) => (
                  <li
                    key={passo.titulo}
                    className="grid grid-cols-[2.75rem_minmax(0,1fr)] gap-x-4 border-t border-casca/15 py-4 last:border-b"
                  >
                    <span
                      aria-hidden="true"
                      className="font-display-italico text-3xl leading-none text-brasa-escura italic display-soft"
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <div className="flex flex-col gap-1">
                      <p className="titulo-3">{passo.titulo}</p>
                      <p className="texto text-casca/85">{passo.texto}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          <div className="lg:col-span-7">
            <Foto
              chave="encomendas"
              sizes="(min-width: 80rem) 640px, (min-width: 64rem) 56vw, 100vw"
              className="aspect-[16/10]"
            />
          </div>
        </div>

        <ul className="grid gap-x-8 md:grid-cols-2 md:gap-y-12 lg:grid-cols-4">
          {produtos.map((produto) => (
            <li key={produto.id} className="border-t border-casca/15 first:border-t-0 md:border-t-0">
              <CardProduto produto={produto} variante="lista" className="md:hidden" />
              <CardProduto
                produto={produto}
                sizes="(min-width: 80rem) 256px, (min-width: 64rem) 22vw, 45vw"
                className="hidden md:flex"
              />
            </li>
          ))}
        </ul>

        <div className="flex flex-col gap-4 border-t border-casca/25 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="texto max-w-xl font-medium">{t.prazoCurto}</p>
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
      </Container>
    </section>
  )
}
