import { Container } from '@/components/ui/Container'
import { TituloSecao } from '@/components/ui/TituloSecao'
import { classesBotao } from '@/components/ui/Botao'
import { IconeSeta, IconeWhatsApp } from '@/components/ui/Icone'
import { CardProduto } from '@/components/produto/CardProduto'
import { categorias, produtosDaCategoria } from '@/content/cardapio'
import { loja } from '@/content/loja'
import { textos } from '@/content/textos'
import { linkWhatsApp } from '@/lib/mensagem'
import { BarraCategorias } from './cardapio/BarraCategorias'

const t = textos.cardapio

/** Cardápio completo (US2, FR-006/007). Encomendas têm seção própria; aqui só o chip e o link final. */
export function Cardapio() {
  const ordenadas = [...categorias].sort((a, b) => a.ordem - b.ordem)
  const doCardapio = ordenadas.filter((c) => c.id !== 'encomendas')
  const encomendas = ordenadas.find((c) => c.id === 'encomendas')
  const itensBarra = ordenadas.map((c) => ({ nome: c.nome, ancora: c.ancora }))
  const whatsapp = linkWhatsApp(loja.whatsapp, textos.whatsapp.mensagemDuvida)

  return (
    <section id="cardapio" aria-labelledby="titulo-cardapio" className="bg-miolo pt-(--sec-y) pb-(--sec-y)">
      <Container>
        <TituloSecao id="titulo-cardapio" nivel={2} kicker={t.kicker} titulo={t.titulo} destaque={t.destaque}>
          <p>{t.apoio}</p>
        </TituloSecao>
        <noscript>
          <a
            href={whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className={classesBotao({ variante: 'whatsapp', className: 'mt-6' })}
          >
            <IconeWhatsApp size={20} />
            {t.semJs}
          </a>
        </noscript>
      </Container>

      {/* filha direta da seção: assim o sticky vale por todo o cardápio */}
      <BarraCategorias itens={itensBarra} rotulo={t.categorias} className="mt-8 md:mt-10" />

      <Container>
        {doCardapio.map((categoria) => {
          const idTitulo = `titulo-${categoria.ancora}`
          return (
            <section
              key={categoria.id}
              id={categoria.ancora}
              aria-labelledby={idTitulo}
              className="pt-8 md:pt-14"
            >
              <h3
                id={idTitulo}
                className="flex items-center gap-4 font-display text-[1.625rem] leading-tight font-medium tracking-[-0.01em] md:text-[2rem]"
              >
                {categoria.nome}
                <span aria-hidden="true" className="h-px flex-1 bg-linha/40" />
              </h3>
              <ul className="mt-2 divide-y divide-linha/30 md:mt-8 md:grid md:grid-cols-3 md:gap-x-6 md:gap-y-12 md:divide-y-0 lg:grid-cols-4">
                {produtosDaCategoria(categoria.id).map((produto) => (
                  <li key={produto.id}>
                    {/* uma variante por faixa de largura; a escondida sai da árvore de acessibilidade */}
                    <div className="md:hidden">
                      <CardProduto produto={produto} variante="lista" nivel={4} />
                    </div>
                    <div className="hidden h-full md:block">
                      <CardProduto
                        produto={produto}
                        variante="vertical"
                        nivel={4}
                        sizes="(min-width: 70rem) 250px, (min-width: 64rem) 22vw, 30vw"
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )
        })}

        {encomendas && (
          <p className="mt-12 border-t border-linha/40 pt-8 md:mt-16">
            <a href={`#${encomendas.ancora}`} className={classesBotao({ variante: 'secundario' })}>
              {t.linkEncomendas.replace(/\s*→\s*$/, '')}
              <IconeSeta size={20} />
            </a>
          </p>
        )}
      </Container>
    </section>
  )
}
