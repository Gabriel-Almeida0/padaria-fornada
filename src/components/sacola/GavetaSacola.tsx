'use client'

import { useEffect, useId, useRef, useState, type MouseEvent } from 'react'
import { ArrowLeft } from 'lucide-react'
import type { DadosPedido, InstanteLoja, LinhaSacola } from '@/lib/tipos'
import { dadosIniciais, OUTRO_BAIRRO } from '@/lib/pedido'
import { instanteNaLoja } from '@/lib/funcionamento'
import { montarMensagem, linkWhatsApp } from '@/lib/mensagem'
import { formatarBRL } from '@/lib/dinheiro'
import { apagar, CHAVE_DADOS, gravar, ler } from '@/lib/armazenamento'
import { loja } from '@/content/loja'
import { destaques } from '@/content/cardapio'
import { Botao } from '@/components/ui/Botao'
import { Foto } from '@/components/ui/Foto'
import { Preco } from '@/components/ui/Preco'
import { IconeFechar, IconeLixeira, IconeSacola, IconeSeta } from '@/components/ui/Icone'
import { AdicionarAoPedido } from './AdicionarAoPedido'
import { Confirmacao } from './Confirmacao'
import { ControleQuantidade } from './ControleQuantidade'
import { FormPedido } from './FormPedido'
import { ResumoValores } from './ResumoValores'
import { AvisosSacola } from './SacolaProvider'
import { useSacola } from './useSacola'
import { textosSacola as t } from '@/content/textosSacola'

type Passo = 'sacola' | 'dados' | 'confirmacao'
type Envio = { url: string; texto: string; bloqueado: boolean }
type DadosLembrados = Pick<DadosPedido, 'nome' | 'modo' | 'bairroId' | 'endereco' | 'complemento'>

/** Lê `fornada:dados:v1` aceitando lixo: só campos com o tipo certo entram. */
function dadosLembrados(): Partial<DadosPedido> {
  const bruto = ler<unknown>(CHAVE_DADOS)
  if (!bruto || typeof bruto !== 'object') return {}
  const o = bruto as Record<string, unknown>
  const r: Partial<DadosPedido> = {}
  if (typeof o.nome === 'string') r.nome = o.nome.slice(0, 60)
  if (o.modo === 'retirada' || o.modo === 'entrega') r.modo = o.modo
  if (typeof o.bairroId === 'string' && (o.bairroId === OUTRO_BAIRRO || loja.bairros.some((b) => b.id === o.bairroId))) {
    r.bairroId = o.bairroId
  }
  if (typeof o.endereco === 'string') r.endereco = o.endereco.slice(0, 120)
  if (typeof o.complemento === 'string') r.complemento = o.complemento.slice(0, 60)
  return Object.keys(r).length ? { ...r, lembrarDados: true } : {}
}

const nomeDaLinha = (l: LinhaSacola) =>
  l.variacao && (l.produto.variacoes?.length ?? 0) > 1 ? `${l.produto.nome} (${l.variacao.nome})` : l.produto.nome

const botaoIcone =
  'inline-flex size-11 shrink-0 items-center justify-center rounded-botao text-casca transition-colors duration-200 ease-marca hover:bg-trigo active:bg-trigo'

/**
 * Gaveta da sacola: `<dialog>` modal (showModal) em 3 passos — sacola → dados → confirmação.
 * Lateral de 440px no desktop, tela cheia no mobile. Fundo inerte, Esc e foco preso vêm do <dialog>;
 * aqui: trava de scroll, foco no título a cada passo e `fechar()` (que devolve o foco ao gatilho).
 */
export function GavetaSacola() {
  const { aberta, fechar, linhas, resumo, limpar, remover, aviso, fecharAviso } = useSacola()
  const dialogo = useRef<HTMLDialogElement>(null)
  const titulo = useRef<HTMLHeadingElement>(null)
  const idTitulo = useId()

  const [passo, setPasso] = useState<Passo>('sacola')
  const [dados, setDados] = useState<DadosPedido>(dadosIniciais)
  const [agora, setAgora] = useState<InstanteLoja | null>(null)
  const [envio, setEnvio] = useState<Envio | null>(null)
  const leuDadosLembrados = useRef(false)
  const avisoRef = useRef(aviso)
  useEffect(() => {
    avisoRef.current = aviso
  }, [aviso])

  // Abre/fecha o <dialog> conforme o Provider e põe o foco no título do passo.
  useEffect(() => {
    const d = dialogo.current
    if (!d) return
    if (aberta) {
      if (!d.open) d.showModal()
      titulo.current?.focus()
      // o aviso de "adicionado" já foi visto na página; dentro da gaveta só fica o que dá para desfazer
      if (avisoRef.current && !avisoRef.current.desfazerNome) fecharAviso()
    } else if (d.open) {
      d.close()
    }
  }, [aberta, passo, fecharAviso])

  // Trava o scroll da página enquanto a gaveta está aberta.
  useEffect(() => {
    if (!aberta) return
    const html = document.documentElement
    const barra = window.innerWidth - html.clientWidth
    const antes = { overflow: html.style.overflow, padding: document.body.style.paddingRight }
    html.style.overflow = 'hidden'
    if (barra > 0) document.body.style.paddingRight = `${barra}px`
    return () => {
      html.style.overflow = antes.overflow
      document.body.style.paddingRight = antes.padding
    }
  }, [aberta])

  // Remover/zerar um item tira o botão focado do DOM: o foco volta ao título, dentro da gaveta.
  const qtdLinhas = linhas.length
  useEffect(() => {
    const d = dialogo.current
    if (!d?.open) return
    const ativo = document.activeElement
    if (!ativo || ativo === document.body || !d.contains(ativo)) titulo.current?.focus()
  }, [qtdLinhas])

  // Horários dependem do relógio: atualiza a cada minuto enquanto o formulário está aberto.
  useEffect(() => {
    if (!aberta || passo !== 'dados') return
    const id = window.setInterval(() => setAgora(instanteNaLoja(new Date(), loja.fuso)), 60_000)
    return () => window.clearInterval(id)
  }, [aberta, passo])

  const aoFecharDialogo = () => {
    setPasso('sacola')
    if (aberta) fechar() // Esc ou form[method=dialog]: avisa o Provider (que devolve o foco)
  }

  const aoClicarFundo = (e: MouseEvent<HTMLDialogElement>) => {
    if (e.target === e.currentTarget) fechar()
  }

  const irParaDados = () => {
    if (!leuDadosLembrados.current) {
      leuDadosLembrados.current = true
      const lembrados = dadosLembrados()
      setDados((d) => ({ ...d, ...lembrados }))
    }
    setAgora(instanteNaLoja(new Date(), loja.fuso))
    setPasso('dados')
  }

  const mudar = (parcial: Partial<DadosPedido>) => setDados((d) => ({ ...d, ...parcial }))

  const enviar = (efetivos: DadosPedido) => {
    if (!agora) return
    const texto = montarMensagem({ linhas, dados: efetivos, loja, agora })
    const url = linkWhatsApp(loja.whatsapp, texto)
    if (efetivos.lembrarDados) {
      const { nome, modo, bairroId, endereco, complemento } = efetivos
      gravar(CHAVE_DADOS, { nome, modo, bairroId, endereco, complemento } satisfies DadosLembrados)
    } else {
      apagar(CHAVE_DADOS)
    }
    setDados(efetivos)
    const janela = window.open(url, '_blank', 'noopener,noreferrer')
    setEnvio({ url, texto, bloqueado: !janela })
    setPasso('confirmacao')
  }

  const esvaziar = () => {
    limpar()
    setEnvio(null)
    setDados((d) => ({ ...d, quando: { tipo: 'asap' }, observacoes: '', mensagemCartao: '', trocoPara: null }))
    fechar()
  }

  const tituloPasso = passo === 'sacola' ? t.passoSacola : passo === 'dados' ? t.passoDados : t.passoConfirmacao
  const resumoAtual = resumo(dados)
  const sugestoes = destaques.filter((p) => !p.variacoes?.length).slice(0, 3)

  return (
    <dialog
      ref={dialogo}
      aria-labelledby={idTitulo}
      onClose={aoFecharDialogo}
      onClick={aoClicarFundo}
      className="fixed inset-y-0 right-0 left-auto m-0 ml-auto h-dvh max-h-none w-full max-w-none overflow-hidden bg-papel p-0 text-casca shadow-gaveta backdrop:bg-casca/45 md:max-w-[440px] starting:open:translate-x-6 starting:open:opacity-0 open:translate-x-0 open:opacity-100 transition-[translate,opacity] duration-200 ease-marca"
    >
      <div className="flex h-full flex-col">
        {/* Cabeçalho */}
        <header className="flex min-h-16 shrink-0 items-center gap-1 border-b border-linha/40 px-3 md:px-4">
          {passo === 'dados' && (
            <button type="button" className={botaoIcone} aria-label={t.voltarSacola} onClick={() => setPasso('sacola')}>
              <ArrowLeft size={22} strokeWidth={1.5} aria-hidden="true" />
            </button>
          )}
          <div className={`flex min-w-0 flex-1 flex-col gap-1 py-2 ${passo === 'dados' ? 'pl-1' : 'pl-2'}`}>
            {passo !== 'confirmacao' && (
              <p className="kicker" aria-hidden="true">
                {t.etapa(passo === 'sacola' ? 1 : 2)}
              </p>
            )}
            <h2
              id={idTitulo}
              ref={titulo}
              tabIndex={-1}
              className="font-display text-2xl leading-tight font-medium tracking-[-0.01em] outline-none"
            >
              {tituloPasso}
            </h2>
          </div>
          <button type="button" className={botaoIcone} aria-label={t.fechar} onClick={fechar}>
            <IconeFechar size={24} />
          </button>
        </header>

        {aberta && passo !== 'sacola' && <AvisosSacola variante="embutido" />}

        {/* Passo 1: sacola */}
        {passo === 'sacola' &&
          (linhas.length === 0 ? (
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pt-5 pb-8">
              {aberta && <AvisosSacola variante="embutido" />}
              <div className="flex flex-col items-start gap-3 px-5 pt-3 md:px-6">
                <span aria-hidden="true" className="grid size-14 place-items-center rounded-full bg-trigo">
                  <IconeSacola size={26} />
                </span>
                <p className="font-display text-xl font-medium">{t.vaziaTitulo}</p>
                <p className="legenda text-base">{t.vaziaTexto}</p>
              </div>
              <ul className="mx-5 mt-6 divide-y divide-linha/30 border-y border-linha/30 md:mx-6">
                {sugestoes.map((p) => (
                  <li key={p.id} className="grid grid-cols-[64px_minmax(0,1fr)] gap-4 py-4">
                    <Foto chave={p.imagem} sizes="64px" alt="" />
                    <div className="flex min-w-0 flex-col gap-2">
                      <div className="flex items-baseline justify-between gap-3">
                        <p className="font-semibold leading-snug">{p.nome}</p>
                        {p.preco !== undefined && <Preco centavos={p.preco} className="text-base" />}
                      </div>
                      <AdicionarAoPedido produto={p} compacto />
                    </div>
                  </li>
                ))}
              </ul>
              <div className="px-5 md:px-6">
                <Botao variante="secundario" larguraTotal className="mt-6" onClick={fechar}>
                  {t.continuarEscolhendo}
                </Botao>
              </div>
            </div>
          ) : (
            <>
              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 md:px-6">
                <ul aria-label={t.listaAria} className="divide-y divide-linha/30">
                  {linhas.map((l) => {
                    const nome = nomeDaLinha(l)
                    const temTamanho = l.variacao && (l.produto.variacoes?.length ?? 0) > 1
                    return (
                      <li key={l.chave} className="grid grid-cols-[64px_minmax(0,1fr)] gap-4 py-5">
                        <Foto chave={l.produto.imagem} sizes="64px" alt="" />
                        <div className="flex min-w-0 flex-col gap-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="font-semibold leading-snug">{l.produto.nome}</p>
                              <p className="mt-0.5 legenda">
                                {temTamanho && <span className="text-casca">{t.tamanho(l.variacao!.nome)} · </span>}
                                {t.cada(formatarBRL(l.precoUnitario))}
                              </p>
                            </div>
                            <button
                              type="button"
                              className={`${botaoIcone} -mt-2 -mr-2 text-cinza-forno hover:text-casca`}
                              aria-label={t.removerAria(nome)}
                              onClick={() => remover(l.chave)}
                            >
                              <IconeLixeira size={20} />
                            </button>
                          </div>
                          <div className="flex items-center justify-between gap-3">
                            <ControleQuantidade chave={l.chave} nome={nome} quantidade={l.quantidade} tamanho="sm" />
                            <Preco centavos={l.total} />
                          </div>
                        </div>
                      </li>
                    )
                  })}
                </ul>
                <div className="pt-1 pb-6">
                  <Botao variante="texto" tamanho="sm" onClick={fechar} className="-ml-2">
                    {t.continuarEscolhendo}
                  </Botao>
                </div>
              </div>

              {aberta && <AvisosSacola variante="embutido" />}

              <div className="shrink-0 border-t border-linha/40 bg-papel px-5 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] md:px-6">
                <ResumoValores resumo={resumoAtual} dados={dados} />
                <p className="mt-2 mb-4 legenda">{t.proximoPasso}</p>
                <Botao variante="primario" larguraTotal onClick={irParaDados}>
                  {t.continuar}
                  <IconeSeta size={20} />
                </Botao>
              </div>
            </>
          ))}

        {/* Passo 2: dados */}
        {passo === 'dados' && agora && (
          <FormPedido dados={dados} mudar={mudar} linhas={linhas} agora={agora} aoEnviar={enviar} />
        )}

        {/* Passo 3: confirmação */}
        {passo === 'confirmacao' && envio && (
          <Confirmacao
            url={envio.url}
            texto={envio.texto}
            bloqueado={envio.bloqueado}
            aoVoltarCardapio={fechar}
            aoEditar={irParaDados}
            aoEsvaziar={esvaziar}
          />
        )}
      </div>
    </dialog>
  )
}
