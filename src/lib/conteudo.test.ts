// Sanidade do conteúdo tipado (data-model): limites de texto, preços e chaves de imagem.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { categorias, destaques, produtos } from '../content/cardapio.ts'
import { loja } from '../content/loja.ts'

const manifesto = JSON.parse(
  readFileSync(new URL('../../scripts/manifesto-imagens.json', import.meta.url), 'utf8'),
) as { chave: string; arquivo: string; largura: number; altura: number; alt: string }[]

test('cardápio: 22 produtos, ids únicos, 6 destaques', () => {
  assert.equal(produtos.length, 22)
  assert.equal(new Set(produtos.map((p) => p.id)).size, 22)
  assert.equal(destaques.length, 6)
  assert.deepEqual(categorias.map((c) => c.id), ['paes', 'doces', 'salgados', 'bebidas', 'encomendas'])
})

test('produto: nome ≤ 40, descrição ≤ 120, preço em centavos inteiros', () => {
  for (const p of produtos) {
    assert.ok(p.nome.length <= 40, `${p.id}: nome com ${p.nome.length}`)
    assert.ok(p.descricao.length <= 120, `${p.id}: descrição com ${p.descricao.length}`)
    const precos = p.variacoes?.map((v) => v.preco) ?? [p.preco]
    assert.ok(precos.length > 0)
    for (const preco of precos) assert.ok(Number.isInteger(preco) && (preco as number) > 0, p.id)
    assert.equal(p.encomenda, p.categoria === 'encomendas', p.id)
  }
})

test('loja: 5 bairros com taxa entre R$ 5 e R$ 12', () => {
  assert.equal(loja.bairros.length, 5)
  for (const b of loja.bairros) assert.ok(b.taxa >= 500 && b.taxa <= 1200)
})

test('manifesto: 27 imagens, todas as do cardápio presentes, alt preenchido', () => {
  assert.equal(manifesto.length, 27)
  const chaves = new Set(manifesto.map((m) => m.chave))
  for (const p of produtos) assert.ok(chaves.has(p.imagem), `falta ${p.imagem}`)
  for (const c of ['hero', 'sobre', 'encomendas', 'fachada', 'og']) assert.ok(chaves.has(c), c)
  for (const m of manifesto) assert.ok(m.alt.trim().length > 0, m.chave)
})
