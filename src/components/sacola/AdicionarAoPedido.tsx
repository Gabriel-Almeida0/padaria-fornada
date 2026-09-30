'use client'

import { useEffect, useId, useRef, useState } from 'react'
import type { Produto } from '@/lib/tipos'
import { chaveItem } from '@/lib/sacola'
import { formatarBRL } from '@/lib/dinheiro'
import { Botao } from '@/components/ui/Botao'
import { Preco } from '@/components/ui/Preco'
import { IconeMais } from '@/components/ui/Icone'
import { textos } from '@/content/textos'
import { ControleQuantidade } from './ControleQuantidade'
import { useSacola } from './useSacola'

type Props = {
  produto: Produto
  /** lista compacta (mobile): botão sem largura total */
  compacto?: boolean
  className?: string
}

const t = textos.sacola

/**
 * Sem variação: "Adicionar" (48px) que vira `− n +` no mesmo lugar.
 * Com variação: preço ("a partir de" até escolher), chips de tamanho e o botão; o controle aparece
 * para o tamanho escolhido que já estiver na sacola.
 */
export function AdicionarAoPedido({ produto, compacto = false, className = '' }: Props) {
  const variacoes = produto.variacoes ?? []
  if (variacoes.length === 0) {
    return <SemVariacao produto={produto} compacto={compacto} className={className} />
  }
  return <ComVariacao produto={produto} compacto={compacto} className={className} />
}

/**
 * Quando o botão "Adicionar" vira `− n +` (ou volta), o elemento focado some do DOM.
 * Se a troca veio de um clique/tecla aqui dentro, o foco vai para o equivalente: "+" ou "Adicionar".
 */
function useFocoNoLugar(quantidade: number) {
  const emSacola = quantidade > 0
  const wrapper = useRef<HTMLDivElement>(null)
  const interagiu = useRef(false)
  const anterior = useRef(emSacola)
  useEffect(() => {
    const mudou = anterior.current !== emSacola
    anterior.current = emSacola
    const veioDaqui = interagiu.current
    interagiu.current = false
    if (!mudou || !veioDaqui) return
    const alvo = emSacola ? '[data-foco="mais"]' : '[data-foco="adicionar"]'
    wrapper.current?.querySelector<HTMLElement>(alvo)?.focus()
  }, [emSacola, quantidade])
  const marcar = () => {
    interagiu.current = true
  }
  return { wrapper, marcar }
}

function SemVariacao({ produto, compacto, className }: Required<Props>) {
  const { itens, adicionar } = useSacola()
  const chave = chaveItem(produto.id, null)
  const quantidade = itens.find((i) => chaveItem(i.produtoId, i.variacaoId) === chave)?.quantidade ?? 0
  const largura = compacto ? 'w-36' : 'w-full'
  const { wrapper, marcar } = useFocoNoLugar(quantidade)

  return (
    <div ref={wrapper} onClickCapture={marcar} className={`${largura} ${className}`}>
      {quantidade > 0 ? (
        <ControleQuantidade chave={chave} nome={produto.nome} quantidade={quantidade} className="w-full" />
      ) : (
        <Botao
          variante="primario"
          larguraTotal
          data-foco="adicionar"
          aria-label={t.adicionarAria(produto.nome)}
          onClick={() => adicionar(produto.id, null)}
        >
          <IconeMais size={20} />
          {t.adicionar}
        </Botao>
      )}
    </div>
  )
}

function ComVariacao({ produto, compacto, className }: Required<Props>) {
  const variacoes = produto.variacoes!
  const unica = variacoes.length === 1
  const { itens, adicionar } = useSacola()
  const [escolhida, setEscolhida] = useState<string | null>(unica ? variacoes[0].id : null)
  const [erro, setErro] = useState(false)
  const nomeGrupo = useId()
  const idErro = useId()
  const primeiroRadio = useRef<HTMLInputElement>(null)

  const variacao = variacoes.find((v) => v.id === escolhida) ?? null
  const menorPreco = Math.min(...variacoes.map((v) => v.preco))
  const chave = escolhida ? chaveItem(produto.id, escolhida) : null
  const quantidade = chave
    ? itens.find((i) => chaveItem(i.produtoId, i.variacaoId) === chave)?.quantidade ?? 0
    : 0
  const nomeFalado = variacao && !unica ? `${produto.nome} (${variacao.nome})` : produto.nome
  const largura = compacto ? 'w-36' : 'w-full'
  const { wrapper, marcar } = useFocoNoLugar(quantidade)

  const aoAdicionar = () => {
    if (!escolhida) {
      setErro(true)
      primeiroRadio.current?.focus()
      return
    }
    adicionar(produto.id, escolhida)
  }

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      <Preco centavos={variacao?.preco ?? menorPreco} aPartirDe={!variacao} />

      {!unica && (
        <fieldset aria-describedby={erro ? idErro : undefined}>
          <legend className="legenda mb-2">{t.tamanho}</legend>
          <div className="flex flex-wrap gap-2">
            {variacoes.map((v, i) => (
              <label key={v.id} className="relative">
                <input
                  ref={i === 0 ? primeiroRadio : undefined}
                  type="radio"
                  name={nomeGrupo}
                  value={v.id}
                  checked={escolhida === v.id}
                  onChange={() => {
                    setEscolhida(v.id)
                    setErro(false)
                  }}
                  className="peer sr-only"
                />
                <span className="inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-pill border-[1.5px] border-linha bg-papel px-3.5 text-sm font-semibold text-casca transition-colors duration-200 ease-marca peer-checked:border-casca peer-checked:bg-casca peer-checked:text-miolo peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brasa hover:border-casca">
                  {v.nome}
                  <span className="font-medium tabular-nums">{formatarBRL(v.preco)}</span>
                </span>
              </label>
            ))}
          </div>
          {erro && (
            <p id={idErro} className="mt-2 text-sm font-semibold text-erro">
              {t.escolhaTamanho}
            </p>
          )}
        </fieldset>
      )}

      <div ref={wrapper} onClickCapture={marcar} className={largura}>
        {quantidade > 0 && chave ? (
          <ControleQuantidade chave={chave} nome={nomeFalado} quantidade={quantidade} className="w-full" />
        ) : (
          <Botao
            variante="primario"
            larguraTotal
            data-foco="adicionar"
            aria-label={t.adicionarAria(nomeFalado)}
            onClick={aoAdicionar}
          >
            <IconeMais size={20} />
            {t.adicionar}
          </Botao>
        )}
      </div>
    </div>
  )
}
