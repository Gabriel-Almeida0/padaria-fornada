import { test } from 'node:test'
import assert from 'node:assert/strict'
import { formatarBRL, formatarBRLTexto, valorDecimal } from './dinheiro.ts'

const semNbsp = (s: string) => s.replace(/ /g, ' ')

test('formata centavos em reais', () => {
  assert.equal(semNbsp(formatarBRL(0)), 'R$ 0,00')
  assert.equal(semNbsp(formatarBRL(700)), 'R$ 7,00')
  assert.equal(semNbsp(formatarBRL(1800)), 'R$ 18,00')
  assert.equal(semNbsp(formatarBRL(10800)), 'R$ 108,00')
  assert.equal(semNbsp(formatarBRL(123456)), 'R$ 1.234,56')
})

test('formatarBRL usa NBSP e formatarBRLTexto usa espaço comum', () => {
  assert.equal(formatarBRL(1800), 'R$ 18,00')
  assert.equal(formatarBRLTexto(1800), 'R$ 18,00')
  assert.ok(!formatarBRLTexto(123456).includes(' '))
})

test('soma em centavos não sofre com ponto flutuante', () => {
  assert.equal(formatarBRLTexto(10 + 20), 'R$ 0,30')
})

test('valorDecimal para <data value>', () => {
  assert.equal(valorDecimal(1800), '18.00')
  assert.equal(valorDecimal(5), '0.05')
})
