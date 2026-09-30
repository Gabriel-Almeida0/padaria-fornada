import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  formatarHora,
  horariosDisponiveis,
  instanteNaLoja,
  rotuloDia,
  statusAgora,
} from './funcionamento.ts'
import { loja } from '../content/loja.ts'
import type { DiaSemana, InstanteLoja, Loja } from './tipos.ts'

// Outubro de 2026: 03 = sábado, 04 = domingo, 05 = segunda.
const em = (data: string, diaSemana: DiaSemana, h: number, m = 0): InstanteLoja => ({
  data,
  diaSemana,
  minutos: h * 60 + m,
})
const SEG = (h: number, m = 0) => em('2026-10-05', 1, h, m)

test('formatarHora', () => {
  assert.equal(formatarHora(450), '07:30')
  assert.equal(formatarHora(1170), '19:30')
  assert.equal(formatarHora(0), '00:00')
})

test('status: segunda 6h59 abre hoje às 7h', () => {
  assert.deepEqual(statusAgora(SEG(6, 59), loja), { aberto: false, texto: 'Abre hoje às 7h' })
})

test('status: segunda 10h aberto, fecha às 20h', () => {
  assert.deepEqual(statusAgora(SEG(10), loja), { aberto: true, texto: 'Aberto agora · fecha às 20h' })
})

test('status: sábado 20h01 fechado, abre amanhã (domingo) às 7h', () => {
  assert.deepEqual(statusAgora(em('2026-10-03', 6, 20, 1), loja), {
    aberto: false,
    texto: 'Fechado · abre amanhã às 7h',
  })
})

test('status: domingo 13h fecha; a próxima abertura é segunda (amanhã) às 7h', () => {
  assert.deepEqual(statusAgora(em('2026-10-04', 0, 13), loja), {
    aberto: false,
    texto: 'Fechado · abre amanhã às 7h',
  })
})

test('status: com um dia fechado no meio, cita o dia da semana', () => {
  const fechaSegunda: Loja = { ...loja, horarios: { ...loja.horarios, 1: null } }
  assert.deepEqual(statusAgora(em('2026-10-04', 0, 14), fechaSegunda), {
    aberto: false,
    texto: 'Fechado · abre terça às 7h',
  })
})

test('asap: disponível até fecha - 30 min - preparo; indisponível 1 min depois', () => {
  // retirada: preparo 20 min; segunda fecha 20h => último slot 19:30
  const ok = horariosDisponiveis({ agora: SEG(19, 10), loja, modo: 'retirada', temEncomenda: false })
  assert.equal(ok.asap, true)
  assert.deepEqual(ok.dias[0], { data: '2026-10-05', rotulo: 'hoje', slots: [1170] })

  const tarde = horariosDisponiveis({ agora: SEG(19, 11), loja, modo: 'retirada', temEncomenda: false })
  assert.equal(tarde.asap, false)
  assert.equal(tarde.dias[0].rotulo, 'amanhã', 'hoje sem slots some da lista')

  // entrega: preparo 40 min
  assert.equal(horariosDisponiveis({ agora: SEG(18, 50), loja, modo: 'entrega', temEncomenda: false }).asap, true)
  assert.equal(horariosDisponiveis({ agora: SEG(18, 51), loja, modo: 'entrega', temEncomenda: false }).asap, false)
})

test('asap indisponível com a loja fechada', () => {
  assert.equal(horariosDisponiveis({ agora: SEG(6, 30), loja, modo: 'retirada', temEncomenda: false }).asap, false)
})

test('slots arredondados para :00/:30 e 3 dias corridos', () => {
  const r = horariosDisponiveis({ agora: SEG(10, 5), loja, modo: 'entrega', temEncomenda: false })
  assert.equal(r.dias.length, 3)
  assert.equal(r.dias[0].slots[0], 11 * 60) // 10:05 + 40 = 10:45 -> 11:00
  assert.equal(r.dias[0].slots.at(-1), 19 * 60 + 30)
  assert.equal(r.dias[1].slots[0], 8 * 60) // 7:00 + 40 = 7:40 -> 8:00
  assert.ok(r.dias.every((d) => d.slots.every((s) => s % 30 === 0)))
  assert.deepEqual(r.dias.map((d) => d.rotulo), ['hoje', 'amanhã', 'quarta-feira, 07/10'])
})

test('domingo curto: último slot 12:30', () => {
  const r = horariosDisponiveis({ agora: em('2026-10-03', 6, 21), loja, modo: 'retirada', temEncomenda: false })
  assert.equal(r.dias[0].data, '2026-10-04')
  assert.equal(r.dias[0].slots[0], 450)
  assert.equal(r.dias[0].slots.at(-1), 750)
})

test('encomenda: começa em agora + 48 h, sem asap, até 14 dias', () => {
  // quinta 01/10 15:10 -> sábado 03/10 15:10 -> primeiro slot 15:30
  const r = horariosDisponiveis({ agora: em('2026-10-01', 4, 15, 10), loja, modo: 'retirada', temEncomenda: true })
  assert.equal(r.asap, false)
  assert.equal(r.dias[0].data, '2026-10-03')
  assert.equal(r.dias[0].rotulo, 'sábado, 03/10')
  assert.equal(r.dias[0].slots[0], 15 * 60 + 30)
  assert.equal(r.dias.at(-1)?.data, '2026-10-15')
})

test('encomenda que cai no domingo curto respeita o fechamento às 13h', () => {
  // sexta 02/10 12:00 -> domingo 04/10 12:00 -> só 12:00 e 12:30
  const r = horariosDisponiveis({ agora: em('2026-10-02', 5, 12), loja, modo: 'retirada', temEncomenda: true })
  assert.deepEqual(r.dias[0], { data: '2026-10-04', rotulo: 'domingo, 04/10', slots: [720, 750] })
  // domingo 04/10 14:00 -> terça 06/10 14:00
  const r2 = horariosDisponiveis({ agora: em('2026-10-04', 0, 14), loja, modo: 'entrega', temEncomenda: true })
  assert.equal(r2.dias[0].data, '2026-10-06')
  assert.equal(r2.dias[0].slots[0], 14 * 60)
})

test('instanteNaLoja: virada de dia em UTC vs São Paulo', () => {
  // 04/10 02:30 UTC = 03/10 23:30 em São Paulo (UTC-3), sábado
  assert.deepEqual(instanteNaLoja(new Date('2026-10-04T02:30:00Z'), 'America/Sao_Paulo'), {
    data: '2026-10-03',
    diaSemana: 6,
    minutos: 23 * 60 + 30,
  })
  // meia-noite local
  assert.deepEqual(instanteNaLoja(new Date('2026-10-05T03:00:00Z'), 'America/Sao_Paulo'), {
    data: '2026-10-05',
    diaSemana: 1,
    minutos: 0,
  })
})

test('rotuloDia', () => {
  const agora = em('2026-10-01', 4, 9)
  assert.equal(rotuloDia('2026-10-01', agora), 'hoje')
  assert.equal(rotuloDia('2026-10-02', agora), 'amanhã')
  assert.equal(rotuloDia('2026-10-03', agora), 'sábado, 03/10')
  assert.equal(rotuloDia('2026-10-05', agora), 'segunda-feira, 05/10')
})
