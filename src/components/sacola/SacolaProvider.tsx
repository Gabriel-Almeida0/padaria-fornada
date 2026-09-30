'use client'

import { useCallback, useEffect, useMemo, useReducer, useRef, useState, type ReactNode } from 'react'
import { estadoInicial, reconciliar, reduzirSacola, QUANTIDADE_MAXIMA } from '@/lib/sacola'
import { montarLinhas, resumo as calcularResumo } from '@/lib/pedido'
import { formatarBRL } from '@/lib/dinheiro'
import { CHAVE_SACOLA, gravar, ler } from '@/lib/armazenamento'
import type { AcaoSacola, DadosPedido, EstadoSacola, ItemSacola, Produto } from '@/lib/tipos'
import { produtos } from '@/content/cardapio'
import { loja } from '@/content/loja'
import { textos } from '@/content/textos'
import { ContextoSacola, useSacola, type AvisoSacola, type SacolaContexto } from './useSacola'

const t = textos.sacola
const DURACAO_AVISO = 3000
const DURACAO_DESFAZER = 6000

function nomeDoItem(item: Pick<ItemSacola, 'produtoId' | 'variacaoId'>): string {
  const produto = produtos.find((p) => p.id === item.produtoId)
  if (!produto) return ''
  const variacao = produto.variacoes?.find((v) => v.id === item.variacaoId)
  return variacao && produto.variacoes!.length > 1 ? `${produto.nome} (${variacao.nome})` : produto.nome
}

function resumoFalado(estado: EstadoSacola, lista: Produto[]): string {
  const linhas = montarLinhas(estado.itens, lista)
  const qtd = linhas.reduce((s, l) => s + l.quantidade, 0)
  const subtotal = linhas.reduce((s, l) => s + l.total, 0)
  return `${t.itens(qtd)}, ${formatarBRL(subtotal)}`
}

const chaveDe = (i: ItemSacola) => `${i.produtoId}:${i.variacaoId ?? '-'}`

/** Estado do Provider = estado puro da sacola + se o localStorage já foi lido ('carregar'). */
type EstadoProvider = EstadoSacola & { hidratado: boolean }

function reduzirProvider(estado: EstadoProvider, acao: AcaoSacola): EstadoProvider {
  const sacola = reduzirSacola(estado, acao)
  const hidratado = estado.hidratado || acao.tipo === 'carregar'
  if (sacola === estado && hidratado === estado.hidratado) return estado
  return { itens: sacola.itens, removidoRecente: sacola.removidoRecente, hidratado }
}

const estadoInicialProvider: EstadoProvider = { ...estadoInicial, hidratado: false }

export function SacolaProvider({ children }: { children: ReactNode }) {
  const [estado, dispatch] = useReducer(reduzirProvider, estadoInicialProvider)
  const { hidratado } = estado
  const [aberta, setAberta] = useState(false)
  const [aviso, setAviso] = useState<AvisoSacola | null>(null)
  const gatilhoRef = useRef<HTMLElement | null>(null)
  const contadorAviso = useRef(0)

  // Hidratação: servidor e primeira renderização do cliente começam vazios (research R6).
  useEffect(() => {
    dispatch({ tipo: 'carregar', itens: reconciliar(ler<unknown>(CHAVE_SACOLA), produtos) })
  }, [])

  useEffect(() => {
    if (hidratado) gravar(CHAVE_SACOLA, estado.itens)
  }, [estado.itens, hidratado])

  const avisar = useCallback((texto: string, desfazerNome: string | null = null) => {
    contadorAviso.current += 1
    setAviso({ id: contadorAviso.current, texto, desfazerNome })
  }, [])

  const fecharAviso = useCallback(() => setAviso(null), [])

  const executar = useCallback(
    (acao: AcaoSacola) => {
      const depois = reduzirSacola(estado, acao)
      dispatch(acao)
      return depois
    },
    [estado],
  )

  const adicionar = useCallback(
    (produtoId: string, variacaoId: string | null = null) => {
      const acao: AcaoSacola = { tipo: 'adicionar', produtoId, variacaoId }
      const depois = reduzirSacola(estado, acao)
      if (depois === estado) {
        avisar(t.avisoLimite)
        return
      }
      executar(acao)
      const nome = nomeDoItem({ produtoId, variacaoId })
      const linha = depois.itens.find((i) => chaveDe(i) === `${produtoId}:${variacaoId ?? '-'}`)
      const resumo = resumoFalado(depois, produtos)
      avisar(
        linha && linha.quantidade > 1
          ? t.avisoQuantidade(nome, t.unidades(linha.quantidade), resumo)
          : t.avisoAdicionado(nome, resumo),
      )
    },
    [estado, executar, avisar],
  )

  const remover = useCallback(
    (chave: string) => {
      const item = estado.itens.find((i) => chaveDe(i) === chave)
      if (!item) return
      executar({ tipo: 'remover', chave })
      const nome = nomeDoItem(item)
      avisar(t.avisoRemovido(nome), nome)
    },
    [estado, executar, avisar],
  )

  const definirQuantidade = useCallback(
    (chave: string, quantidade: number) => {
      const item = estado.itens.find((i) => chaveDe(i) === chave)
      if (!item) return
      if (quantidade <= 0) {
        remover(chave)
        return
      }
      if (quantidade > QUANTIDADE_MAXIMA && item.quantidade >= QUANTIDADE_MAXIMA) {
        avisar(t.avisoLimite)
        return
      }
      const depois = executar({ tipo: 'definirQuantidade', chave, quantidade })
      const novo = depois.itens.find((i) => chaveDe(i) === chave)
      if (!novo) return
      avisar(t.avisoQuantidade(nomeDoItem(item), t.unidades(novo.quantidade), resumoFalado(depois, produtos)))
    },
    [estado, executar, avisar, remover],
  )

  const desfazer = useCallback(() => {
    const r = estado.removidoRecente
    if (!r) return
    executar({ tipo: 'desfazer' })
    avisar(t.avisoDevolvido(nomeDoItem(r.item)))
  }, [estado, executar, avisar])

  const limpar = useCallback(() => {
    executar({ tipo: 'limpar' })
    avisar(t.avisoVazia)
  }, [executar, avisar])

  const abrir = useCallback((gatilho?: HTMLElement | null) => {
    gatilhoRef.current =
      gatilho ?? (typeof document !== 'undefined' ? (document.activeElement as HTMLElement | null) : null)
    setAberta(true)
  }, [])

  const fechar = useCallback(() => {
    setAberta(false)
    const gatilho = gatilhoRef.current
    if (gatilho) requestAnimationFrame(() => gatilho.focus())
  }, [])

  const linhas = useMemo(() => montarLinhas(estado.itens, produtos), [estado.itens])
  const quantidadeTotal = useMemo(() => linhas.reduce((s, l) => s + l.quantidade, 0), [linhas])
  const resumo = useCallback(
    (dados: Pick<DadosPedido, 'modo' | 'bairroId'>) => calcularResumo(linhas, dados, loja),
    [linhas],
  )

  const valor: SacolaContexto = {
    itens: estado.itens,
    linhas,
    quantidadeTotal,
    hidratado,
    resumo,
    adicionar,
    definirQuantidade,
    remover,
    desfazer,
    limpar,
    aberta,
    abrir,
    fechar,
    aviso,
    fecharAviso,
  }

  return (
    <ContextoSacola.Provider value={valor}>
      {children}
      {/* Com a gaveta aberta (<dialog> modal) o resto da página fica inerte:
          a GavetaSacola monta o seu próprio <AvisosSacola /> lá dentro. */}
      {!aberta && <AvisosSacola />}
    </ContextoSacola.Provider>
  )
}

/**
 * Região aria-live (polite) + toast visual dos avisos da sacola.
 * Montado pelo Provider quando a gaveta está fechada (flutuante, acima da BarraSacolaMobile);
 * a GavetaSacola monta outro dentro do <dialog> (embutido no fluxo, sem cobrir os controles).
 */
export function AvisosSacola({ variante = 'flutuante' }: { variante?: 'flutuante' | 'embutido' } = {}) {
  const { aviso, desfazer, fecharAviso, quantidadeTotal } = useSacola()
  const [focado, setFocado] = useState(false)

  useEffect(() => {
    if (!aviso || focado) return
    const ms = aviso.desfazerNome ? DURACAO_DESFAZER : DURACAO_AVISO
    const id = window.setTimeout(fecharAviso, ms)
    return () => window.clearTimeout(id)
  }, [aviso, focado, fecharAviso])

  return (
    <>
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {aviso && <p key={aviso.id}>{aviso.texto}</p>}
      </div>
      {aviso && (
        <div
          key={aviso.id}
          className={`sobre-escuro animar-surgir flex items-center gap-3 rounded-botao bg-casca py-2 pr-2 pl-4 text-miolo shadow-gaveta ${
            variante === 'embutido'
              ? 'mx-5 mb-3 md:mx-6'
              : // abaixo de md, com itens, a BarraSacolaMobile (56px + safe area) ocupa o rodapé: o toast fica 12px acima dela
                `fixed inset-x-4 z-50 mx-auto max-w-md md:bottom-6 ${
                  quantidadeTotal > 0
                    ? 'bottom-[calc(68px+env(safe-area-inset-bottom))]'
                    : 'bottom-[calc(16px+env(safe-area-inset-bottom))]'
                }`
          }`}
          onFocus={() => setFocado(true)}
          onBlur={() => setFocado(false)}
        >
          <p aria-hidden="true" className="flex-1 py-2 text-sm leading-snug">
            {aviso.texto}
          </p>
          {aviso.desfazerNome && (
            <button
              type="button"
              onClick={() => {
                setFocado(false)
                desfazer()
              }}
              aria-label={t.desfazerAria(aviso.desfazerNome)}
              className="min-h-11 shrink-0 rounded-botao px-3 font-semibold text-mel underline underline-offset-4 hover:bg-casca/80"
            >
              {t.desfazer}
            </button>
          )}
        </div>
      )}
    </>
  )
}
