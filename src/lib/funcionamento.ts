// Horário de funcionamento. Tudo em "minutos do dia" + data 'AAAA-MM-DD' no fuso da loja;
// `agora` sempre entra como parâmetro (research R5 e R11).
import type { DiaSemana, Expediente, InstanteLoja, Loja, Modo } from './tipos.ts'

const DIAS_CURTOS = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado']
const DIAS_EXTENSO = [
  'domingo',
  'segunda-feira',
  'terça-feira',
  'quarta-feira',
  'quinta-feira',
  'sexta-feira',
  'sábado',
]
const WEEKDAY_EN: Record<string, DiaSemana> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }

const formatadores = new Map<string, Intl.DateTimeFormat>()

function formatadorDoFuso(fuso: string): Intl.DateTimeFormat {
  let f = formatadores.get(fuso)
  if (!f) {
    f = new Intl.DateTimeFormat('en-CA', {
      timeZone: fuso,
      hourCycle: 'h23',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      weekday: 'short',
    })
    formatadores.set(fuso, f)
  }
  return f
}

/** Converte um instante absoluto em data/dia/minutos no fuso da loja. */
export function instanteNaLoja(data: Date, fuso: string): InstanteLoja {
  const partes: Record<string, string> = {}
  for (const p of formatadorDoFuso(fuso).formatToParts(data)) partes[p.type] = p.value
  const hora = Number(partes.hour) % 24
  return {
    data: `${partes.year}-${partes.month}-${partes.day}`,
    diaSemana: WEEKDAY_EN[partes.weekday],
    minutos: hora * 60 + Number(partes.minute),
  }
}

// ---- datas 'AAAA-MM-DD' sem fuso (aritmética em UTC puro) ----

function paraUTC(data: string): number {
  const [a, m, d] = data.split('-').map(Number)
  return Date.UTC(a, m - 1, d)
}

function deUTC(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10)
}

const DIA_MS = 86_400_000

export function somarDias(data: string, dias: number): string {
  return deUTC(paraUTC(data) + dias * DIA_MS)
}

export function diaSemanaDe(data: string): DiaSemana {
  return new Date(paraUTC(data)).getUTCDay() as DiaSemana
}

function diferencaDias(de: string, ate: string): number {
  return Math.round((paraUTC(ate) - paraUTC(de)) / DIA_MS)
}

// ---- formatação ----

/** 450 → "07:30" */
export function formatarHora(minutos: number): string {
  const h = Math.floor(minutos / 60)
  const m = minutos % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

/** 1200 → "20h"; 450 → "7h30". Para textos corridos ("fecha às 20h"). */
export function formatarHoraCurta(minutos: number): string {
  const h = Math.floor(minutos / 60)
  const m = minutos % 60
  return m === 0 ? `${h}h` : `${h}h${String(m).padStart(2, '0')}`
}

/** "hoje" | "amanhã" | "sábado, 03/10" */
export function rotuloDia(data: string, agora: InstanteLoja): string {
  const dif = diferencaDias(agora.data, data)
  if (dif === 0) return 'hoje'
  if (dif === 1) return 'amanhã'
  const [, m, d] = data.split('-')
  return `${DIAS_EXTENSO[diaSemanaDe(data)]}, ${d}/${m}`
}

/** Nome curto do dia ("segunda", "sábado"), para textos de status e tabelas de horário. */
export function nomeDia(dia: DiaSemana): string {
  return DIAS_CURTOS[dia]
}

// ---- status ----

function expedienteDe(loja: Loja, dia: number): Expediente {
  return loja.horarios[(((dia % 7) + 7) % 7) as DiaSemana]
}

export function estaAberto(agora: InstanteLoja, loja: Loja): boolean {
  const hoje = expedienteDe(loja, agora.diaSemana)
  return !!hoje && agora.minutos >= hoje.abre && agora.minutos < hoje.fecha
}

export function statusAgora(agora: InstanteLoja, loja: Loja): { aberto: boolean; texto: string } {
  const hoje = expedienteDe(loja, agora.diaSemana)
  if (hoje && agora.minutos >= hoje.abre && agora.minutos < hoje.fecha) {
    return { aberto: true, texto: `Aberto agora · fecha às ${formatarHoraCurta(hoje.fecha)}` }
  }
  if (hoje && agora.minutos < hoje.abre) {
    return { aberto: false, texto: `Abre hoje às ${formatarHoraCurta(hoje.abre)}` }
  }
  for (let i = 1; i <= 7; i++) {
    const dia = expedienteDe(loja, agora.diaSemana + i)
    if (!dia) continue
    const quando = i === 1 ? 'amanhã' : nomeDia(((agora.diaSemana + i) % 7) as DiaSemana)
    return { aberto: false, texto: `Fechado · abre ${quando} às ${formatarHoraCurta(dia.abre)}` }
  }
  return { aberto: false, texto: 'Fechado' }
}

// ---- horários agendáveis ----

const teto30 = (m: number) => Math.ceil(m / 30) * 30

export type DiaDisponivel = { data: string; rotulo: string; slots: number[] }

export function horariosDisponiveis(p: {
  agora: InstanteLoja
  loja: Loja
  modo: Modo
  temEncomenda: boolean
}): { asap: boolean; dias: DiaDisponivel[] } {
  const { agora, loja, modo, temEncomenda } = p
  const preparo = loja.preparoMin[modo]

  const slotsDoDia = (data: string, minimo: number): number[] => {
    const exp = expedienteDe(loja, diaSemanaDe(data))
    if (!exp) return []
    const inicio = Math.max(teto30(exp.abre + preparo), teto30(minimo))
    const slots: number[] = []
    for (let m = inicio; m <= exp.fecha - 30; m += 30) slots.push(m)
    return slots
  }

  const dias: DiaDisponivel[] = []
  const incluir = (offset: number, minimo: number) => {
    const data = somarDias(agora.data, offset)
    const slots = slotsDoDia(data, minimo)
    if (slots.length) dias.push({ data, rotulo: rotuloDia(data, agora), slots })
  }

  if (temEncomenda) {
    // a partir de agora + antecedência (48 h), até a janela de encomenda (14 dias corridos)
    const inicio = agora.minutos + loja.encomendaAntecedenciaH * 60
    const primeiroDia = Math.floor(inicio / 1440)
    for (let d = primeiroDia; d <= loja.encomendaJanelaDias; d++) {
      incluir(d, d === primeiroDia ? inicio % 1440 : 0)
    }
    return { asap: false, dias }
  }

  for (let d = 0; d < 3; d++) incluir(d, d === 0 ? agora.minutos + preparo : 0)

  const hoje = expedienteDe(loja, agora.diaSemana)
  const asap =
    !!hoje && estaAberto(agora, loja) && agora.minutos + preparo <= hoje.fecha - 30
  return { asap, dias }
}
