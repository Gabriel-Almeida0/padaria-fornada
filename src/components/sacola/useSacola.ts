'use client'

import { createContext, useContext } from 'react'
import type { DadosPedido, ItemSacola, LinhaSacola } from '@/lib/tipos'
import type { Resumo } from '@/lib/pedido'

export type AvisoSacola = {
  /** muda a cada aviso, para reanunciar textos iguais */
  id: number
  texto: string
  /** nome do item removido quando dá para desfazer */
  desfazerNome: string | null
}

export type SacolaContexto = {
  itens: ItemSacola[]
  linhas: LinhaSacola[]
  /** soma das quantidades */
  quantidadeTotal: number
  /** true depois de ler o localStorage (antes disso a sacola aparece vazia, igual ao HTML do servidor) */
  hidratado: boolean
  resumo: (dados: Pick<DadosPedido, 'modo' | 'bairroId'>) => Resumo
  adicionar: (produtoId: string, variacaoId?: string | null) => void
  definirQuantidade: (chave: string, quantidade: number) => void
  remover: (chave: string) => void
  desfazer: () => void
  limpar: () => void
  aberta: boolean
  /** abre a gaveta e guarda o gatilho para devolver o foco no `fechar` */
  abrir: (gatilho?: HTMLElement | null) => void
  /** fecha a gaveta e devolve o foco ao gatilho */
  fechar: () => void
  /** aviso atual (anunciado na região aria-live e mostrado no toast) */
  aviso: AvisoSacola | null
  fecharAviso: () => void
}

export const ContextoSacola = createContext<SacolaContexto | null>(null)

export function useSacola(): SacolaContexto {
  const ctx = useContext(ContextoSacola)
  if (!ctx) throw new Error('useSacola precisa estar dentro de <SacolaProvider>')
  return ctx
}
