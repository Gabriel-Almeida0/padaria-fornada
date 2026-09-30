'use client'

import { useId, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { CircleAlert } from 'lucide-react'
import type { CampoPedido, DadosPedido, ErrosPedido, InstanteLoja, LinhaSacola, Pagamento, Quando } from '@/lib/tipos'
import { LIMITES, OUTRO_BAIRRO, resumo as calcularResumo, validarPedido } from '@/lib/pedido'
import { horariosDisponiveis, formatarHora, type DiaDisponivel } from '@/lib/funcionamento'
import { formatarBRL } from '@/lib/dinheiro'
import { loja } from '@/content/loja'
import { Botao } from '@/components/ui/Botao'
import { IconeChevron, IconeWhatsApp } from '@/components/ui/Icone'
import { ResumoValores } from './ResumoValores'
import { textosSacola as t } from '@/content/textosSacola'

type Props = {
  dados: DadosPedido
  mudar: (parcial: Partial<DadosPedido>) => void
  linhas: LinhaSacola[]
  agora: InstanteLoja
  /** chamado só com o pedido válido, já com o "quando" normalizado */
  aoEnviar: (dados: DadosPedido) => void
}

/** Ordem de foco quando há erros (ordem visual do formulário). */
const ORDEM: CampoPedido[] = [
  'nome',
  'modo',
  'bairroId',
  'endereco',
  'complemento',
  'quando',
  'pagamento',
  'trocoPara',
  'observacoes',
  'mensagemCartao',
]

/**
 * "Assim que possível" pode deixar de existir (encomenda, fora do horário) e um horário escolhido pode
 * sair da lista ao trocar retirada/entrega. Em vez de corrigir o estado num efeito, o formulário
 * trabalha sempre com o "quando" normalizado; `minutos: -1` = dia escolhido, horário ainda não.
 */
function normalizarQuando(q: Quando, disp: { asap: boolean; dias: DiaDisponivel[] }): Quando {
  const primeiro = disp.dias[0]?.data ?? ''
  if (q.tipo === 'asap') return disp.asap ? q : { tipo: 'agendado', data: primeiro, minutos: -1 }
  const dia = disp.dias.find((d) => d.data === q.data)
  if (!dia) return { tipo: 'agendado', data: primeiro, minutos: -1 }
  if (q.minutos !== -1 && !dia.slots.includes(q.minutos)) return { ...q, minutos: -1 }
  return q
}

/** "50", "50,5", "R$ 1.050,00" → centavos. Vazio → null. Inválido → NaN. */
function lerReais(texto: string): number | null {
  const limpo = texto.replace(/R\$/gi, '').replace(/\s/g, '')
  if (!limpo) return null
  if (!/^\d{1,3}(\.\d{3})*(,\d{1,2})?$|^\d+(,\d{1,2})?$/.test(limpo)) return Number.NaN
  return Math.round(Number(limpo.replace(/\./g, '').replace(',', '.')) * 100)
}

const rotulo = 'mb-2 block text-sm font-semibold text-casca'
const campo =
  'block min-h-12 w-full rounded-botao border-[1.5px] border-linha bg-papel px-4 text-base text-casca placeholder:text-cinza-forno transition-colors duration-200 ease-marca hover:border-casca focus-visible:border-casca aria-invalid:border-erro'
const cartao =
  'group flex cursor-pointer items-start gap-3 rounded-botao border-[1.5px] border-linha bg-papel p-4 transition-colors duration-200 ease-marca hover:border-casca has-checked:border-casca has-checked:bg-trigo/40 has-focus-visible:outline-3 has-focus-visible:outline-offset-2 has-focus-visible:outline-brasa data-erro:border-erro'
const chip =
  'flex min-h-12 cursor-pointer items-center justify-center rounded-botao border-[1.5px] border-linha bg-papel px-3 text-center text-sm font-semibold text-casca transition-colors duration-200 ease-marca hover:border-casca has-checked:border-casca has-checked:bg-casca has-checked:text-miolo has-focus-visible:outline-3 has-focus-visible:outline-offset-2 has-focus-visible:outline-brasa data-erro:border-erro'

function Bolinha() {
  return (
    <span
      aria-hidden="true"
      className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border-[1.5px] border-casca bg-papel"
    >
      <span className="size-2.5 scale-0 rounded-full bg-casca transition-transform duration-200 ease-marca group-has-checked:scale-100" />
    </span>
  )
}

function Erro({ id, texto }: { id: string; texto?: string }) {
  if (!texto) return null
  return (
    <p id={id} className="mt-2 flex items-start gap-1.5 text-sm font-semibold text-erro">
      <CircleAlert size={18} strokeWidth={1.75} aria-hidden="true" className="mt-px shrink-0" />
      {texto}
    </p>
  )
}

function Opcional() {
  return <span className="font-normal text-cinza-forno"> {t.opcional}</span>
}

function Grupo({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`flex flex-col gap-5 ${className}`}>{children}</div>
}

/** Liga ids de dica/erro/contador num `aria-describedby` só com o que existe. */
const descrito = (...ids: (string | false | undefined)[]) => ids.filter(Boolean).join(' ') || undefined

export function FormPedido({ dados, mudar, linhas, agora, aoEnviar }: Props) {
  const id = useId()
  const ids = (c: string) => `${id}-${c}`
  const idErro = (c: string) => `${id}-${c}-erro`
  const formRef = useRef<HTMLFormElement>(null)

  const [tocados, setTocados] = useState<Set<CampoPedido>>(() => new Set())
  const [tentouEnviar, setTentouEnviar] = useState(false)
  const [trocoTexto, setTrocoTexto] = useState(() =>
    dados.trocoPara !== null ? formatarBRL(dados.trocoPara).replace(/R\$\s?/, '') : '',
  )

  const r = calcularResumo(linhas, dados, loja)
  const disp = horariosDisponiveis({ agora, loja, modo: dados.modo, temEncomenda: r.temEncomenda })
  const quando = normalizarQuando(dados.quando, disp)
  const efetivos: DadosPedido = {
    ...dados,
    quando,
    mensagemCartao: r.temEncomenda ? dados.mensagemCartao : '',
    trocoPara: dados.pagamento === 'dinheiro' ? dados.trocoPara : null,
  }

  const erros: ErrosPedido = validarPedido(efetivos, linhas, agora, loja)
  const trocoLido = lerReais(trocoTexto)
  if (dados.pagamento === 'dinheiro' && Number.isNaN(trocoLido)) erros.trocoPara = t.trocoInvalido
  const errosVisiveis: ErrosPedido = {}
  for (const c of ORDEM) {
    if (erros[c] && (tentouEnviar || tocados.has(c))) errosVisiveis[c] = erros[c]
  }
  const qtdErros = ORDEM.filter((c) => erros[c]).length

  const tocar = (c: CampoPedido) =>
    setTocados((s) => {
      if (s.has(c)) return s
      const novo = new Set(s)
      novo.add(c)
      return novo
    })

  const invalido = (c: CampoPedido) => (errosVisiveis[c] ? true : undefined)
  const diaAtual = quando.tipo === 'agendado' ? disp.dias.find((d) => d.data === quando.data) : undefined
  const usarSelectDeDia = disp.dias.length > 4

  const aoSubmeter = (e: FormEvent) => {
    e.preventDefault()
    setTentouEnviar(true)
    const primeiro = ORDEM.find((c) => erros[c])
    if (primeiro) {
      const alvo =
        formRef.current?.querySelector<HTMLElement>(`[data-campo="${primeiro}"]:checked`) ??
        formRef.current?.querySelector<HTMLElement>(`[data-campo="${primeiro}"]`)
      alvo?.focus()
      alvo?.scrollIntoView({ block: 'center' })
      return
    }
    aoEnviar(efetivos)
  }

  const contador = (n: number, max: number, idc: string) => (
    <p id={idc} className={`mt-1.5 text-right text-xs tabular-nums ${n > max ? 'font-semibold text-erro' : 'text-cinza-forno'}`}>
      {t.contador(n, max)}
    </p>
  )

  return (
    <form
      ref={formRef}
      noValidate
      aria-label={t.formAria}
      onSubmit={aoSubmeter}
      className="flex min-h-0 flex-1 flex-col"
    >
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pt-5 pb-8 md:px-6">
        <Grupo className="gap-8">
          {/* Nome */}
          <div>
            <label htmlFor={ids('nome')} className={rotulo}>
              {t.nome}
            </label>
            <input
              id={ids('nome')}
              data-campo="nome"
              type="text"
              autoComplete="name"
              autoCapitalize="words"
              enterKeyHint="next"
              className={campo}
              value={dados.nome}
              onChange={(e) => mudar({ nome: e.target.value })}
              onBlur={() => tocar('nome')}
              aria-invalid={invalido('nome')}
              aria-describedby={descrito(errosVisiveis.nome && idErro('nome'))}
            />
            <Erro id={idErro('nome')} texto={errosVisiveis.nome} />
          </div>

          {/* Retirada ou entrega */}
          <fieldset aria-describedby={descrito(errosVisiveis.modo && idErro('modo'))}>
            <legend className={rotulo}>{t.modoLegenda}</legend>
            <div className="grid gap-3">
              {(
                [
                  ['retirada', t.retirada, t.retiradaDetalhe],
                  ['entrega', t.entregaOpcao, t.entregaDetalhe],
                ] as const
              ).map(([valor, titulo, detalhe]) => (
                <label key={valor} className={cartao} data-erro={dados.modo === valor && errosVisiveis.modo ? '' : undefined}>
                  <input
                    type="radio"
                    name={ids('modo')}
                    value={valor}
                    data-campo="modo"
                    className="sr-only"
                    checked={dados.modo === valor}
                    onChange={() => {
                      mudar({ modo: valor })
                      tocar('modo')
                    }}
                  />
                  <Bolinha />
                  <span className="flex flex-col gap-0.5">
                    <span className="font-semibold">{titulo}</span>
                    <span className="legenda">{detalhe}</span>
                  </span>
                </label>
              ))}
            </div>
            {errosVisiveis.modo ? (
              <Erro id={idErro('modo')} texto={errosVisiveis.modo} />
            ) : (
              dados.modo === 'entrega' &&
              r.faltaParaMinimo > 0 && (
                <p className="mt-3 rounded-botao bg-trigo/60 px-4 py-3 text-sm text-casca" role="note">
                  {t.faltam(r.faltaParaMinimo)}
                </p>
              )
            )}
          </fieldset>

          {/* Endereço (só entrega) */}
          {dados.modo === 'entrega' && (
            <Grupo>
              <div>
                <label htmlFor={ids('bairro')} className={rotulo}>
                  {t.bairro}
                </label>
                <div className="relative">
                  <select
                    id={ids('bairro')}
                    data-campo="bairroId"
                    className={`${campo} appearance-none pr-11`}
                    value={dados.bairroId}
                    onChange={(e) => {
                      mudar({ bairroId: e.target.value })
                      tocar('bairroId')
                    }}
                    onBlur={() => tocar('bairroId')}
                    aria-invalid={invalido('bairroId')}
                    aria-describedby={descrito(
                      errosVisiveis.bairroId && idErro('bairroId'),
                      dados.bairroId === OUTRO_BAIRRO && ids('bairro-outro'),
                    )}
                  >
                    <option value="" disabled>
                      {t.bairroPlaceholder}
                    </option>
                    {loja.bairros.map((b) => (
                      <option key={b.id} value={b.id}>
                        {t.bairroOpcao(b.nome, b.taxa)}
                      </option>
                    ))}
                    <option value={OUTRO_BAIRRO}>{t.outroBairro}</option>
                  </select>
                  <IconeChevron size={20} className="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2" />
                </div>
                <Erro id={idErro('bairroId')} texto={errosVisiveis.bairroId} />
                {dados.bairroId === OUTRO_BAIRRO && (
                  <p id={ids('bairro-outro')} className="mt-2 legenda">
                    {t.outroBairroAviso}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor={ids('endereco')} className={rotulo}>
                  {t.endereco}
                </label>
                <input
                  id={ids('endereco')}
                  data-campo="endereco"
                  type="text"
                  autoComplete="address-line1"
                  placeholder={t.enderecoDica}
                  className={campo}
                  value={dados.endereco}
                  onChange={(e) => mudar({ endereco: e.target.value })}
                  onBlur={() => tocar('endereco')}
                  aria-invalid={invalido('endereco')}
                  aria-describedby={descrito(errosVisiveis.endereco && idErro('endereco'))}
                />
                <Erro id={idErro('endereco')} texto={errosVisiveis.endereco} />
              </div>

              <div>
                <label htmlFor={ids('complemento')} className={rotulo}>
                  {t.complemento}
                  <Opcional />
                </label>
                <input
                  id={ids('complemento')}
                  data-campo="complemento"
                  type="text"
                  autoComplete="address-line2"
                  placeholder={t.complementoDica}
                  className={campo}
                  value={dados.complemento}
                  onChange={(e) => mudar({ complemento: e.target.value })}
                  onBlur={() => tocar('complemento')}
                  aria-invalid={invalido('complemento')}
                  aria-describedby={descrito(errosVisiveis.complemento && idErro('complemento'))}
                />
                <Erro id={idErro('complemento')} texto={errosVisiveis.complemento} />
              </div>
            </Grupo>
          )}

          {/* Quando */}
          <fieldset aria-describedby={descrito(errosVisiveis.quando && idErro('quando'), ids('quando-dica'))}>
            <legend className={rotulo}>{t.quandoLegenda}</legend>
            <p id={ids('quando-dica')} className="-mt-1 mb-3 legenda">
              {r.temEncomenda && disp.dias[0]
                ? t.encomendaAviso(disp.dias[0].rotulo)
                : !disp.asap
                  ? t.foraDoHorario
                  : t.asapDetalhe(loja.preparoMin[dados.modo])}
            </p>

            {disp.asap && (
              <div className="mb-4 grid gap-3 sm:grid-cols-2">
                <label className={cartao}>
                  <input
                    type="radio"
                    name={ids('quando-tipo')}
                    className="sr-only"
                    checked={quando.tipo === 'asap'}
                    onChange={() => mudar({ quando: { tipo: 'asap' } })}
                  />
                  <Bolinha />
                  <span className="font-semibold">{t.asap}</span>
                </label>
                <label className={cartao}>
                  <input
                    type="radio"
                    name={ids('quando-tipo')}
                    className="sr-only"
                    checked={quando.tipo === 'agendado'}
                    onChange={() =>
                      mudar({ quando: { tipo: 'agendado', data: disp.dias[0]?.data ?? '', minutos: -1 } })
                    }
                  />
                  <Bolinha />
                  <span className="flex flex-col gap-0.5">
                    <span className="font-semibold">{t.agendar}</span>
                    <span className="legenda">{t.agendarDetalhe}</span>
                  </span>
                </label>
              </div>
            )}

            {disp.dias.length === 0 && <p className="legenda">{t.semHorarios}</p>}

            {quando.tipo === 'agendado' && disp.dias.length > 0 && (
              <div className="grid gap-4">
                {usarSelectDeDia ? (
                  <div>
                    <label htmlFor={ids('dia')} className={rotulo}>
                      {t.dia}
                    </label>
                    <div className="relative">
                      <select
                        id={ids('dia')}
                        className={`${campo} appearance-none pr-11`}
                        value={quando.data}
                        onChange={(e) => mudar({ quando: { tipo: 'agendado', data: e.target.value, minutos: -1 } })}
                      >
                        {disp.dias.map((d) => (
                          <option key={d.data} value={d.data}>
                            {d.rotulo}
                          </option>
                        ))}
                      </select>
                      <IconeChevron size={20} className="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2" />
                    </div>
                  </div>
                ) : (
                  <div role="radiogroup" aria-label={t.dia} className="grid grid-cols-3 gap-2">
                    {disp.dias.map((d) => (
                      <label key={d.data} className={chip}>
                        <input
                          type="radio"
                          name={ids('dia')}
                          className="sr-only"
                          value={d.data}
                          checked={quando.data === d.data}
                          onChange={() => mudar({ quando: { tipo: 'agendado', data: d.data, minutos: -1 } })}
                        />
                        <span className="first-letter:uppercase">{d.rotulo}</span>
                      </label>
                    ))}
                  </div>
                )}

                <div>
                  <label htmlFor={ids('horario')} className={rotulo}>
                    {t.horario}
                  </label>
                  <div className="relative">
                    <select
                      id={ids('horario')}
                      data-campo="quando"
                      className={`${campo} appearance-none pr-11 tabular-nums`}
                      value={quando.minutos}
                      onChange={(e) => {
                        mudar({ quando: { tipo: 'agendado', data: quando.data, minutos: Number(e.target.value) } })
                        tocar('quando')
                      }}
                      onBlur={() => tocar('quando')}
                      aria-invalid={invalido('quando')}
                      aria-describedby={descrito(errosVisiveis.quando && idErro('quando'))}
                    >
                      <option value={-1} disabled>
                        {t.horarioPlaceholder}
                      </option>
                      {(diaAtual?.slots ?? []).map((m) => (
                        <option key={m} value={m}>
                          {formatarHora(m)}
                        </option>
                      ))}
                    </select>
                    <IconeChevron size={20} className="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2" />
                  </div>
                </div>
              </div>
            )}
            <Erro id={idErro('quando')} texto={errosVisiveis.quando} />
          </fieldset>

          {/* Pagamento */}
          <fieldset aria-describedby={descrito(errosVisiveis.pagamento && idErro('pagamento'), ids('pag-dica'))}>
            <legend className={rotulo}>{t.pagamentoLegenda}</legend>
            <p id={ids('pag-dica')} className="-mt-1 mb-3 legenda">
              {t.pagamentoDetalhe}
            </p>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  ['pix', t.pix],
                  ['cartao', t.cartao(dados.modo)],
                  ['dinheiro', t.dinheiro],
                ] as [Pagamento, string][]
              ).map(([valor, texto]) => (
                <label key={valor} className={chip} data-erro={errosVisiveis.pagamento ? '' : undefined}>
                  <input
                    type="radio"
                    name={ids('pagamento')}
                    value={valor}
                    data-campo="pagamento"
                    className="sr-only"
                    checked={dados.pagamento === valor}
                    onChange={() => {
                      mudar({ pagamento: valor })
                      tocar('pagamento')
                    }}
                  />
                  {texto}
                </label>
              ))}
            </div>
            <Erro id={idErro('pagamento')} texto={errosVisiveis.pagamento} />

            {dados.pagamento === 'dinheiro' && (
              <div className="mt-4">
                <label htmlFor={ids('troco')} className={rotulo}>
                  {t.troco}
                  <Opcional />
                </label>
                <div className="relative">
                  <span aria-hidden="true" className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-cinza-forno">
                    R$
                  </span>
                  <input
                    id={ids('troco')}
                    data-campo="trocoPara"
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    placeholder="0,00"
                    className={`${campo} pl-11 tabular-nums`}
                    value={trocoTexto}
                    onChange={(e) => {
                      setTrocoTexto(e.target.value)
                      const v = lerReais(e.target.value)
                      mudar({ trocoPara: v === null || Number.isNaN(v) ? null : v })
                    }}
                    onBlur={() => tocar('trocoPara')}
                    aria-invalid={invalido('trocoPara')}
                    aria-describedby={descrito(errosVisiveis.trocoPara && idErro('trocoPara'), ids('troco-dica'))}
                  />
                </div>
                <p id={ids('troco-dica')} className="mt-1.5 legenda">
                  {t.trocoDica}
                </p>
                <Erro id={idErro('trocoPara')} texto={errosVisiveis.trocoPara} />
              </div>
            )}
          </fieldset>

          {/* Mensagem do cartão (só com encomenda) */}
          {r.temEncomenda && (
            <div>
              <label htmlFor={ids('cartao')} className={rotulo}>
                {t.mensagemCartao}
                <Opcional />
              </label>
              <textarea
                id={ids('cartao')}
                data-campo="mensagemCartao"
                rows={3}
                placeholder={t.mensagemCartaoDica}
                className={`${campo} resize-y py-3 leading-snug`}
                value={dados.mensagemCartao}
                onChange={(e) => mudar({ mensagemCartao: e.target.value })}
                onBlur={() => tocar('mensagemCartao')}
                aria-invalid={invalido('mensagemCartao')}
                aria-describedby={descrito(errosVisiveis.mensagemCartao && idErro('mensagemCartao'), ids('cartao-cont'))}
              />
              {contador(dados.mensagemCartao.trim().length, LIMITES.mensagemCartaoMax, ids('cartao-cont'))}
              <Erro id={idErro('mensagemCartao')} texto={errosVisiveis.mensagemCartao} />
            </div>
          )}

          {/* Observações */}
          <div>
            <label htmlFor={ids('obs')} className={rotulo}>
              {t.observacoes}
              <Opcional />
            </label>
            <textarea
              id={ids('obs')}
              data-campo="observacoes"
              rows={3}
              placeholder={t.observacoesDica}
              className={`${campo} resize-y py-3 leading-snug`}
              value={dados.observacoes}
              onChange={(e) => mudar({ observacoes: e.target.value })}
              onBlur={() => tocar('observacoes')}
              aria-invalid={invalido('observacoes')}
              aria-describedby={descrito(errosVisiveis.observacoes && idErro('observacoes'), ids('obs-cont'))}
            />
            {contador(dados.observacoes.trim().length, LIMITES.observacoesMax, ids('obs-cont'))}
            <Erro id={idErro('observacoes')} texto={errosVisiveis.observacoes} />
          </div>

          {/* Lembrar */}
          <label className="flex min-h-12 cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              className="mt-0.5 size-5 shrink-0 accent-casca"
              checked={dados.lembrarDados}
              onChange={(e) => mudar({ lembrarDados: e.target.checked })}
              aria-describedby={ids('lembrar-dica')}
            />
            <span className="flex flex-col gap-0.5">
              <span className="text-sm font-semibold">{t.lembrar}</span>
              <span id={ids('lembrar-dica')} className="legenda">
                {t.lembrarDetalhe}
              </span>
            </span>
          </label>
        </Grupo>
      </div>

      <div className="border-t border-linha/40 bg-papel px-5 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] md:px-6">
        <ResumoValores resumo={r} dados={dados} className="mb-4" />
        <p aria-live="polite" className="empty:hidden mb-3 text-sm font-semibold text-erro">
          {tentouEnviar && qtdErros > 0 ? t.corrigir(qtdErros) : ''}
        </p>
        <Botao type="submit" variante="whatsapp" larguraTotal>
          <IconeWhatsApp size={22} />
          {t.enviar}
        </Botao>
      </div>
    </form>
  )
}
