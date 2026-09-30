import { CardProduto } from '@/components/produto/CardProduto'
import { Container } from '@/components/ui/Container'
import { TituloSecao } from '@/components/ui/TituloSecao'
import { produtos } from '@/content/cardapio'
import { textos } from '@/content/textos'

const t = textos.queridinhos

/**
 * "Os mais pedidos" (âncora #mais-pedidos): os 6 produtos com `destaque`.
 * Desktop: grade de 3 colunas. Mobile: trilho horizontal com scroll-snap; o próximo card aparece
 * pela metade como dica de que dá para rolar. Sem autoplay.
 */
export function Queridinhos() {
  const destaques = produtos.filter((p) => p.destaque).slice(0, 6)
  return (
    <section id="mais-pedidos" aria-labelledby="mais-pedidos-titulo" className="bg-trigo py-(--sec-y)">
      <Container>
        <TituloSecao id="mais-pedidos-titulo" nivel={2} kicker={t.kicker} titulo={t.titulo} destaque={t.destaque}>
          <p>{t.apoio}</p>
        </TituloSecao>
      </Container>

      <Container className="mt-10 max-md:px-0 md:mt-14">
        <ul
          className="flex snap-x snap-mandatory scroll-px-5 gap-4 overflow-x-auto overscroll-x-contain px-5 pb-4 [scrollbar-width:thin] md:grid md:snap-none md:grid-cols-3 md:gap-x-6 md:gap-y-14 md:overflow-visible md:px-0 md:pb-0 lg:gap-x-8"
        >
          {destaques.map((produto) => (
            <li key={produto.id} className="w-[78%] max-w-80 shrink-0 snap-start md:w-auto md:max-w-none">
              <CardProduto
                produto={produto}
                sizes="(min-width: 80rem) 340px, (min-width: 48rem) 30vw, 78vw"
              />
            </li>
          ))}
        </ul>
      </Container>
    </section>
  )
}
