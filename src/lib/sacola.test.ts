import { test } from 'node:test'
import assert from 'node:assert/strict'
import { chaveItem, estadoInicial, reconciliar, reduzirSacola } from './sacola.ts'
import { produtos } from '../content/cardapio.ts'
import type { AcaoSacola, EstadoSacola } from './tipos.ts'

const aplicar = (acoes: AcaoSacola[], estado: EstadoSacola = estadoInicial) =>
  acoes.reduce(reduzirSacola, estado)

test('adicionar o mesmo produto soma na mesma linha', () => {
  const e = aplicar([
    { tipo: 'adicionar', produtoId: 'croissant' },
    { tipo: 'adicionar', produtoId: 'croissant' },
  ])
  assert.deepEqual(e.itens, [{ produtoId: 'croissant', variacaoId: null, quantidade: 2 }])
})

test('limite de 20 por linha', () => {
  const acoes: AcaoSacola[] = Array.from({ length: 25 }, () => ({ tipo: 'adicionar', produtoId: 'croissant' }))
  assert.equal(aplicar(acoes).itens[0].quantidade, 20)
  const e = aplicar([
    { tipo: 'adicionar', produtoId: 'croissant' },
    { tipo: 'definirQuantidade', chave: chaveItem('croissant', null), quantidade: 99 },
  ])
  assert.equal(e.itens[0].quantidade, 20)
})

test('quantidade 0 remove e guarda para desfazer', () => {
  const e = aplicar([
    { tipo: 'adicionar', produtoId: 'croissant' },
    { tipo: 'definirQuantidade', chave: 'croissant:-', quantidade: 0 },
  ])
  assert.deepEqual(e.itens, [])
  assert.deepEqual(e.removidoRecente, { item: { produtoId: 'croissant', variacaoId: null, quantidade: 1 }, indice: 0 })
})

test('desfazer devolve o item na posição original', () => {
  const e = aplicar([
    { tipo: 'adicionar', produtoId: 'croissant' },
    { tipo: 'adicionar', produtoId: 'baguete' },
    { tipo: 'adicionar', produtoId: 'cafe-coado' },
    { tipo: 'remover', chave: 'baguete:-' },
    { tipo: 'desfazer' },
  ])
  assert.deepEqual(e.itens.map((i) => i.produtoId), ['croissant', 'baguete', 'cafe-coado'])
  assert.equal(e.removidoRecente, null)
  assert.equal(reduzirSacola(e, { tipo: 'desfazer' }), e, 'desfazer sem nada removido não muda')
})

test('variação distinta vira linha distinta', () => {
  const e = aplicar([
    { tipo: 'adicionar', produtoId: 'bolo-laranja', variacaoId: 'p' },
    { tipo: 'adicionar', produtoId: 'bolo-laranja', variacaoId: 'm' },
    { tipo: 'adicionar', produtoId: 'bolo-laranja', variacaoId: 'm' },
  ])
  assert.deepEqual(
    e.itens.map((i) => [chaveItem(i.produtoId, i.variacaoId), i.quantidade]),
    [['bolo-laranja:p', 1], ['bolo-laranja:m', 2]],
  )
})

test('limpar e carregar', () => {
  const cheio = aplicar([{ tipo: 'adicionar', produtoId: 'croissant' }])
  assert.deepEqual(reduzirSacola(cheio, { tipo: 'limpar' }), estadoInicial)
  const itens = [{ produtoId: 'baguete', variacaoId: null, quantidade: 3 }]
  assert.deepEqual(reduzirSacola(cheio, { tipo: 'carregar', itens }).itens, itens)
})

test('reconciliar aceita lixo e devolve só o que é válido', () => {
  assert.deepEqual(reconciliar(null, produtos), [])
  assert.deepEqual(reconciliar('abc', produtos), [])
  assert.deepEqual(reconciliar({ itens: [] }, produtos), [])
  const r = reconciliar(
    [
      null,
      'croissant',
      { produtoId: 'nao-existe', variacaoId: null, quantidade: 1 },
      { produtoId: 'bolo-laranja', variacaoId: 'gigante', quantidade: 1 },
      { produtoId: 'bolo-laranja', variacaoId: null, quantidade: 1 },
      { produtoId: 'baguete', variacaoId: 'm', quantidade: 1 },
      { produtoId: 'croissant', variacaoId: null, quantidade: 99 },
      { produtoId: 'cafe-coado', variacaoId: null, quantidade: 0 },
      { produtoId: 'suco-laranja', quantidade: '2' },
      { produtoId: 'bolo-laranja', variacaoId: 'g', quantidade: 2.7 },
      { produtoId: 'pao-frances', quantidade: 3 },
      { produtoId: 'pao-frances', variacaoId: null, quantidade: 2 },
    ],
    produtos,
  )
  assert.deepEqual(r, [
    { produtoId: 'croissant', variacaoId: null, quantidade: 20 },
    { produtoId: 'bolo-laranja', variacaoId: 'g', quantidade: 2 },
    { produtoId: 'pao-frances', variacaoId: null, quantidade: 5 },
  ])
})
