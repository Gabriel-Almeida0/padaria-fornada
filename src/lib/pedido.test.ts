import { test } from 'node:test'
import assert from 'node:assert/strict'
import { dadosIniciais, montarLinhas, resumo, validarPedido } from './pedido.ts'
import { produtos } from '../content/cardapio.ts'
import { loja } from '../content/loja.ts'
import type { DadosPedido, InstanteLoja, ItemSacola } from './tipos.ts'

// segunda 05/10/2026, 10h: loja aberta
const agora: InstanteLoja = { data: '2026-10-05', diaSemana: 1, minutos: 600 }

const itens = (...xs: [string, string | null, number][]): ItemSacola[] =>
  xs.map(([produtoId, variacaoId, quantidade]) => ({ produtoId, variacaoId, quantidade }))

const valido: DadosPedido = { ...dadosIniciais, nome: 'Mariana', pagamento: 'pix' }

test('montarLinhas usa o preço atual do cardápio e ignora o que não existe', () => {
  const linhas = montarLinhas(
    itens(['pao-fermentacao-natural', null, 2], ['bolo-laranja', 'm', 1], ['sumiu', null, 1], ['bolo-laranja', null, 1]),
    produtos,
  )
  assert.deepEqual(
    linhas.map((l) => [l.chave, l.precoUnitario, l.total, l.variacao?.nome ?? null]),
    [
      ['pao-fermentacao-natural:-', 1800, 3600, null],
      ['bolo-laranja:m', 7800, 7800, 'M'],
    ],
  )
})

test('resumo: retirada sem taxa; entrega com taxa do bairro; outro bairro a combinar', () => {
  const linhas = montarLinhas(itens(['croissant', null, 2], ['bolo-laranja', 'p', 1]), produtos)
  assert.deepEqual(resumo(linhas, { modo: 'retirada', bairroId: '' }, loja), {
    quantidade: 3, subtotal: 8000, taxa: 0, total: 8000, faltaParaMinimo: 0, temEncomenda: true,
  })
  assert.deepEqual(resumo(linhas, { modo: 'entrega', bairroId: 'recanto-azul' }, loja), {
    quantidade: 3, subtotal: 8000, taxa: 1200, total: 9200, faltaParaMinimo: 0, temEncomenda: true,
  })
  const outro = resumo(linhas, { modo: 'entrega', bairroId: 'outro' }, loja)
  assert.equal(outro.taxa, null)
  assert.equal(outro.total, 8000)
})

test('resumo: falta para o mínimo só na entrega com bairro cadastrado', () => {
  const cafe = montarLinhas(itens(['cafe-coado', null, 1]), produtos)
  assert.equal(resumo(cafe, { modo: 'entrega', bairroId: 'vila-serena' }, loja).faltaParaMinimo, 3300)
  assert.equal(resumo(cafe, { modo: 'entrega', bairroId: 'outro' }, loja).faltaParaMinimo, 0)
  assert.equal(resumo(cafe, { modo: 'retirada', bairroId: '' }, loja).faltaParaMinimo, 0)
})

const linhasPadrao = montarLinhas(itens(['croissant', null, 4]), produtos) // R$ 44,00

test('pedido válido devolve objeto vazio', () => {
  assert.deepEqual(validarPedido(valido, linhasPadrao, agora, loja), {})
})

test('sacola vazia é inválida', () => {
  assert.equal(validarPedido(valido, [], agora, loja).itens, 'Sua sacola está vazia')
})

test('nome: obrigatório, 2 a 60 caracteres (com trim)', () => {
  assert.equal(validarPedido({ ...valido, nome: '  ' }, linhasPadrao, agora, loja).nome, 'Conta pra gente seu nome')
  assert.equal(validarPedido({ ...valido, nome: ' A ' }, linhasPadrao, agora, loja).nome, 'Conta pra gente seu nome')
  assert.equal(validarPedido({ ...valido, nome: 'Al' }, linhasPadrao, agora, loja).nome, undefined)
  assert.equal(validarPedido({ ...valido, nome: 'a'.repeat(61) }, linhasPadrao, agora, loja).nome, 'Use no máximo 60 caracteres')
})

test('entrega: bairro, endereço 5–120 e complemento ≤ 60', () => {
  const e = validarPedido({ ...valido, modo: 'entrega' }, linhasPadrao, agora, loja)
  assert.equal(e.bairroId, 'Escolha o bairro')
  assert.equal(e.endereco, 'Informe rua e número')
  const base = { ...valido, modo: 'entrega' as const, bairroId: 'vila-serena', endereco: 'Rua A, 1' }
  assert.deepEqual(validarPedido(base, linhasPadrao, agora, loja), {})
  assert.equal(validarPedido({ ...base, endereco: 'x'.repeat(121) }, linhasPadrao, agora, loja).endereco, 'Use no máximo 120 caracteres')
  assert.equal(validarPedido({ ...base, complemento: 'x'.repeat(61) }, linhasPadrao, agora, loja).complemento, 'Use no máximo 60 caracteres')
  assert.equal(validarPedido({ ...base, bairroId: 'bairro-inventado' }, linhasPadrao, agora, loja).bairroId, 'Escolha o bairro')
})

test('mínimo de entrega (R$ 40) só para bairro cadastrado', () => {
  const cafe = montarLinhas(itens(['cafe-coado', null, 1]), produtos)
  const base = { ...valido, modo: 'entrega' as const, bairroId: 'vila-serena', endereco: 'Rua A, 1' }
  assert.equal(
    validarPedido(base, cafe, agora, loja).modo?.replace(/ /g, ' '),
    'Faltam R$ 33,00 para entrega; retirada está liberada',
  )
  assert.equal(validarPedido({ ...base, bairroId: 'outro' }, cafe, agora, loja).modo, undefined)
  assert.deepEqual(validarPedido({ ...valido }, cafe, agora, loja), {}, 'retirada continua liberada')
})

test('pagamento obrigatório e troco ≥ total', () => {
  assert.equal(validarPedido({ ...valido, pagamento: null }, linhasPadrao, agora, loja).pagamento, 'Escolha a forma de pagamento')
  const dinheiro = { ...valido, pagamento: 'dinheiro' as const }
  assert.deepEqual(validarPedido({ ...dinheiro, trocoPara: null }, linhasPadrao, agora, loja), {})
  assert.deepEqual(validarPedido({ ...dinheiro, trocoPara: 4400 }, linhasPadrao, agora, loja), {})
  assert.equal(validarPedido({ ...dinheiro, trocoPara: 4399 }, linhasPadrao, agora, loja).trocoPara, 'O troco precisa ser maior que o total')
})

test('observações ≤ 300 e mensagem do cartão ≤ 200 só com encomenda', () => {
  assert.equal(validarPedido({ ...valido, observacoes: 'x'.repeat(301) }, linhasPadrao, agora, loja).observacoes, 'Use no máximo 300 caracteres')
  assert.equal(validarPedido({ ...valido, observacoes: 'x'.repeat(300) }, linhasPadrao, agora, loja).observacoes, undefined)
  const longa = 'x'.repeat(201)
  assert.equal(validarPedido({ ...valido, mensagemCartao: longa }, linhasPadrao, agora, loja).mensagemCartao, undefined)
  const bolo = montarLinhas(itens(['bolo-laranja', 'p', 1]), produtos)
  const agendado = { ...valido, quando: { tipo: 'agendado' as const, data: '2026-10-08', minutos: 600 } }
  assert.equal(validarPedido({ ...agendado, mensagemCartao: longa }, bolo, agora, loja).mensagemCartao, 'Use no máximo 200 caracteres')
  assert.deepEqual(validarPedido({ ...agendado, mensagemCartao: 'x'.repeat(200) }, bolo, agora, loja), {})
})

test('quando: asap só se disponível; agendado precisa estar em horariosDisponiveis', () => {
  const erro = 'Escolha um horário disponível'
  const fechado: InstanteLoja = { data: '2026-10-05', diaSemana: 1, minutos: 21 * 60 }
  assert.equal(validarPedido(valido, linhasPadrao, fechado, loja).quando, erro)
  const ag = (data: string, minutos: number) => ({ ...valido, quando: { tipo: 'agendado' as const, data, minutos } })
  assert.equal(validarPedido(ag('2026-10-06', 450), linhasPadrao, agora, loja).quando, undefined)
  assert.equal(validarPedido(ag('2026-10-06', 455), linhasPadrao, agora, loja).quando, erro, 'fora da grade de 30 min')
  assert.equal(validarPedido(ag('2026-10-05', 600), linhasPadrao, agora, loja).quando, erro, 'antes de agora + preparo')
  assert.equal(validarPedido(ag('2026-10-20', 600), linhasPadrao, agora, loja).quando, erro, 'além de 3 dias')
  // com encomenda: asap some e a data precisa respeitar 48 h
  const bolo = montarLinhas(itens(['bolo-laranja', 'p', 1]), produtos)
  assert.equal(validarPedido(valido, bolo, agora, loja).quando, erro)
  assert.equal(validarPedido(ag('2026-10-06', 600), bolo, agora, loja).quando, erro)
  assert.equal(validarPedido(ag('2026-10-07', 600), bolo, agora, loja).quando, undefined)
})
