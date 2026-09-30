import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { linkWhatsApp, montarMensagem } from './mensagem.ts'
import { dadosIniciais, montarLinhas } from './pedido.ts'
import { loja } from '../content/loja.ts'
import { produtos } from '../content/cardapio.ts'
import type { DadosPedido, InstanteLoja } from './tipos.ts'

// quarta 30/09/2026, 15:00 em São Paulo. O sábado 03/10 fica a 3 dias (nem "hoje" nem "amanhã")
// e respeita as 48 h da encomenda.
const agora: InstanteLoja = { data: '2026-09-30', diaSemana: 3, minutos: 15 * 60 }

/** Bloco "Formato da mensagem" da spec, lido do próprio arquivo: o teste quebra se a spec mudar. */
function blocoDaSpec(): string {
  const spec = readFileSync(
    new URL('../../specs/001-site-pedidos-whatsapp/spec.md', import.meta.url),
    'utf8',
  )
  const m = spec.match(/### Formato da mensagem[^\n]*\n\n```text\n([\s\S]*?)\n```/)
  assert.ok(m, 'bloco "Formato da mensagem" não encontrado na spec')
  return m[1]
}

test('M1: exemplo completo da spec, caractere por caractere', () => {
  // usa o cardápio e a loja reais: o bloco da spec reflete os dados de verdade
  const linhas = montarLinhas(
    [
      { produtoId: 'pao-fermentacao-natural', variacaoId: null, quantidade: 2 },
      { produtoId: 'bolo-laranja', variacaoId: 'm', quantidade: 1 },
    ],
    produtos,
  )
  const dados: DadosPedido = {
    ...dadosIniciais,
    nome: 'Mariana',
    modo: 'entrega',
    bairroId: 'vila-serena',
    endereco: 'Rua das Acácias, 120',
    complemento: 'ap. 32',
    quando: { tipo: 'agendado', data: '2026-10-03', minutos: 9 * 60 + 30 },
    pagamento: 'pix',
    observacoes: 'sem cobertura de coco',
    mensagemCartao: 'Feliz aniversário, Lu!',
  }
  const esperado = [
    'Olá, Fornada! Quero fazer um pedido 🥖',
    '',
    '2× Pão de fermentação natural — R$ 36,00',
    '1× Bolo de laranja com calda (M) — R$ 78,00',
    '',
    'Subtotal: R$ 114,00',
    'Entrega (Vila Serena): R$ 5,00',
    'Total: R$ 119,00',
    '',
    'Entrega: Rua das Acácias, 120, ap. 32 — Vila Serena',
    'Quando: sábado, 03/10, às 09:30',
    'Pagamento: Pix',
    'Mensagem do cartão: "Feliz aniversário, Lu!"',
    'Observações: sem cobertura de coco',
    '',
    'Nome: Mariana',
  ].join('\n')
  const texto = montarMensagem({ linhas, dados, loja, agora })
  assert.equal(texto, esperado)
  assert.equal(texto, blocoDaSpec())
  assert.ok(!texto.includes(' '), 'sem NBSP na mensagem')
})

const croissant = montarLinhas([{ produtoId: 'croissant', variacaoId: null, quantidade: 1 }], produtos)

test('M2: retirada, asap, cartão, 1 item sem variação', () => {
  const texto = montarMensagem({
    linhas: croissant,
    dados: { ...dadosIniciais, nome: 'João', pagamento: 'cartao' },
    loja,
    agora,
  })
  assert.equal(
    texto,
    [
      'Olá, Fornada! Quero fazer um pedido 🥖',
      '',
      '1× Croissant de manteiga — R$ 11,00',
      '',
      'Subtotal: R$ 11,00',
      'Total: R$ 11,00',
      '',
      'Retirada na loja: Rua do Fermento, 212 — Vila Serena',
      'Quando: assim que possível',
      'Pagamento: cartão na retirada',
      '',
      'Nome: João',
    ].join('\n'),
  )
})

test('M3: entrega em outro bairro, dinheiro com troco', () => {
  const linhas = montarLinhas(
    [
      { produtoId: 'croissant', variacaoId: null, quantidade: 3 },
      { produtoId: 'cafe-coado', variacaoId: null, quantidade: 2 },
    ],
    produtos,
  )
  const texto = montarMensagem({
    linhas,
    dados: {
      ...dadosIniciais,
      nome: 'Rita',
      modo: 'entrega',
      bairroId: 'outro',
      endereco: 'Av. Central, 900',
      quando: { tipo: 'agendado', data: '2026-10-01', minutos: 8 * 60 },
      pagamento: 'dinheiro',
      trocoPara: 5000,
    },
    loja,
    agora,
  })
  assert.equal(
    texto,
    [
      'Olá, Fornada! Quero fazer um pedido 🥖',
      '',
      '3× Croissant de manteiga — R$ 33,00',
      '2× Café coado — R$ 14,00',
      '',
      'Subtotal: R$ 47,00',
      'Entrega: a combinar',
      'Total: R$ 47,00 + entrega a combinar',
      '',
      'Entrega: Av. Central, 900 — outro bairro',
      'Quando: amanhã, às 08:00',
      'Pagamento: dinheiro, troco para R$ 50,00',
      '',
      'Nome: Rita',
    ].join('\n'),
  )
})

const obsEspecial = 'Sem açúcar, por favor 😊\nTocar o interfone #12 & chamar a Zé?  '

test('M4: observação com acento, emoji, &, #, ? e quebra de linha', () => {
  const texto = montarMensagem({
    linhas: croissant,
    dados: { ...dadosIniciais, nome: 'Zé', pagamento: 'pix', observacoes: obsEspecial },
    loja,
    agora,
  })
  assert.ok(
    texto.includes('\nObservações: Sem açúcar, por favor 😊 / Tocar o interfone #12 & chamar a Zé?\n'),
    texto,
  )
  assert.ok(!/ \n/.test(texto) && !/\n\n\n/.test(texto), 'sem espaço no fim de linha nem linha em branco dupla')
})

test('M4b: mensagem do cartão só aparece com encomenda', () => {
  const texto = montarMensagem({
    linhas: croissant,
    dados: { ...dadosIniciais, nome: 'Ana', pagamento: 'pix', mensagemCartao: 'Parabéns!' },
    loja,
    agora,
  })
  assert.ok(!texto.includes('Mensagem do cartão'))
})

test('M5: linkWhatsApp codifica e decodifica o texto íntegro', () => {
  const texto = montarMensagem({
    linhas: croissant,
    dados: { ...dadosIniciais, nome: 'Zé', pagamento: 'pix', observacoes: obsEspecial },
    loja,
    agora,
  })
  const url = linkWhatsApp('5511900000000', texto)
  assert.ok(url.startsWith('https://wa.me/5511900000000?text='))
  const parametro = url.slice(url.indexOf('?text=') + 6)
  assert.ok(!/[&#?\s]/.test(parametro), '&, #, ? e espaços codificados')
  assert.ok(parametro.includes('%0A'), 'quebra de linha vira %0A')
  assert.equal(decodeURIComponent(parametro), texto)
  assert.equal(new URL(url).searchParams.get('text'), texto)
})

test('M6: nome com espaços nas pontas', () => {
  const texto = montarMensagem({
    linhas: croissant,
    dados: { ...dadosIniciais, nome: '   Mariana  ', pagamento: 'pix' },
    loja,
    agora,
  })
  assert.ok(texto.endsWith('\nNome: Mariana'))
})

test('M7: número com máscara lança erro', () => {
  assert.throws(() => linkWhatsApp('(11) 90000-0000', 'oi'), /só dígitos/)
  assert.throws(() => linkWhatsApp('+5511900000000', 'oi'))
  assert.throws(() => linkWhatsApp('', 'oi'))
})
