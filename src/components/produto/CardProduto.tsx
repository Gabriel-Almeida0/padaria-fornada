import type { Produto } from '@/lib/tipos'
import { Foto } from '@/components/ui/Foto'
import { Preco } from '@/components/ui/Preco'
import { Selo } from '@/components/ui/Selo'
import { AdicionarAoPedido } from '@/components/sacola/AdicionarAoPedido'

type Props = {
  produto: Produto
  /** vertical = vitrine/grade (foto 4:5); lista = linha compacta do cardápio no mobile (foto 88px) */
  variante?: 'vertical' | 'lista'
  /** nível do título do card (h3 por padrão, sob o h2 da seção) */
  nivel?: 3 | 4
  /** `sizes` da foto na variante vertical, conforme a grade da seção */
  sizes?: string
  className?: string
}

/**
 * Card de produto: `<article>` sem link aninhado; a única ação é o `AdicionarAoPedido` (client).
 * Produto com variações mostra o preço dentro do AdicionarAoPedido (muda com o tamanho escolhido).
 */
export function CardProduto({
  produto,
  variante = 'vertical',
  nivel = 3,
  sizes = '(min-width: 64rem) 260px, (min-width: 48rem) 33vw, 80vw',
  className = '',
}: Props) {
  const Titulo = nivel === 3 ? 'h3' : 'h4'
  const temVariacao = !!produto.variacoes?.length
  const selos = produto.selos?.length ? (
    <ul className="flex flex-wrap gap-1.5" aria-label="Características">
      {produto.selos.map((s) => (
        <li key={s}>
          <Selo selo={s} />
        </li>
      ))}
    </ul>
  ) : null

  if (variante === 'lista') {
    return (
      <article className={`grid grid-cols-[88px_minmax(0,1fr)] gap-x-4 py-4 ${className}`}>
        <Foto chave={produto.imagem} sizes="88px" className="w-[88px]" />
        <div className="flex min-w-0 flex-col gap-1.5">
          <Titulo className="titulo-3">{produto.nome}</Titulo>
          <p className="legenda line-clamp-2">{produto.descricao}</p>
          {selos}
          <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
            {!temVariacao && produto.preco !== undefined && <Preco centavos={produto.preco} />}
            <AdicionarAoPedido produto={produto} compacto={!temVariacao} className={temVariacao ? 'w-full' : ''} />
          </div>
        </div>
      </article>
    )
  }

  return (
    <article className={`flex h-full flex-col gap-4 ${className}`}>
      <Foto chave={produto.imagem} sizes={sizes} />
      <div className="flex flex-col gap-2">
        <Titulo className="titulo-3">{produto.nome}</Titulo>
        <p className="legenda">{produto.descricao}</p>
        {selos}
      </div>
      <div className="mt-auto flex flex-col gap-3">
        {!temVariacao && produto.preco !== undefined && <Preco centavos={produto.preco} />}
        <AdicionarAoPedido produto={produto} />
      </div>
    </article>
  )
}
