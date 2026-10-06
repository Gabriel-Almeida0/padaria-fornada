// E2E do fluxo de pedido (quickstart passos 3–11) contra http://localhost:3200/ (npm run build && npx next start -p 3200).
// Uso: node scripts/e2e-pedido.mjs [--prints]
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const BASE = `http://localhost:${process.env.PORTA || 3200}/`
const DOCS = fileURLToPath(new URL('../docs/verificacao', import.meta.url))
const PRINTS = process.argv.includes('--prints')
// quarta, 30/09/2026, 15:00 em São Paulo (mesmo "agora" do caso M1)
const AGORA = new Date('2026-09-30T15:00:00-03:00')

const resultados = []
let falhou = false
function ok(passo, cond, detalhe = '') {
  resultados.push(`${cond ? 'OK ' : 'FALHOU'} [${passo}] ${detalhe}`)
  if (!cond) falhou = true
}

const browser = await chromium.launch({ channel: process.env.PW_CHANNEL || 'chrome', headless: true })

async function novaPagina({ width = 390, height = 844, bloquearStorage = false } = {}) {
  const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1 })
  const page = await ctx.newPage()
  const erros = []
  page.on('console', (m) => m.type() === 'error' && erros.push(m.text()))
  page.on('pageerror', (e) => erros.push(String(e)))
  await page.clock.install({ time: AGORA })
  if (bloquearStorage) {
    await page.addInitScript(() => {
      const lanca = () => {
        throw new DOMException('bloqueado', 'SecurityError')
      }
      Storage.prototype.setItem = lanca
      Storage.prototype.getItem = lanca
      Storage.prototype.removeItem = lanca
    })
  }
  await page.addInitScript(() => {
    window.__abertos = []
    window.open = (u, alvo, features) => {
      window.__abertos.push({ u, alvo, features })
      return null
    }
  })
  await page.goto(BASE, { waitUntil: 'networkidle' })
  await page.waitForTimeout(300)
  return { ctx, page, erros }
}

const area = (page) => page.locator('#cardapio, #encomendas')
const btnAdicionar = (page, nome) => area(page).getByRole('button', { name: `Adicionar ${nome} à sacola` })
const contador = async (page) =>
  Number((await page.locator('header').getByRole('button', { name: /^Abrir sacola/ }).getAttribute('aria-label')).match(/(\d+) ite/)[1])
const dialogo = (page) => page.locator('dialog:not([id^=menu-])')
const titulo = (page) => dialogo(page).locator('h2')
const focoInfo = (page) =>
  page.evaluate(() => {
    const a = document.activeElement
    return {
      tag: a?.tagName,
      label: a?.getAttribute('aria-label') ?? '',
      texto: (a?.textContent ?? '').trim().slice(0, 60),
      id: a?.id,
      testid: a?.getAttribute('data-testid'),
      name: a?.getAttribute('name'),
      value: a?.value,
      visivel: a ? a.matches(':focus-visible') : false,
    }
  })

async function printAlto(page, arquivo, largura, altura = 844) {
  if (!PRINTS) return
  // a gaveta é fixa: para caber o formulário inteiro, aumenta a altura da janela só para o print
  const alto = await dialogo(page).evaluate((d) => {
    const rolavel = [...d.querySelectorAll('div')].find((el) => el.scrollHeight > el.clientHeight + 2 && getComputedStyle(el).overflowY === 'auto')
    return rolavel ? d.clientHeight + rolavel.scrollHeight - rolavel.clientHeight : d.clientHeight
  })
  await page.setViewportSize({ width: largura, height: Math.max(altura, alto) })
  await page.waitForTimeout(250)
  await page.screenshot({ path: `${DOCS}/${arquivo}` })
  await page.setViewportSize({ width: largura, height: altura })
  await page.waitForTimeout(150)
}
async function print(page, arquivo) {
  if (!PRINTS) return
  await page.waitForTimeout(250)
  await page.screenshot({ path: `${DOCS}/${arquivo}` })
}

async function semScrollHorizontal(page, passo) {
  const r = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: innerWidth }))
  ok(passo, r.sw <= r.iw, `sem scroll horizontal (${r.sw} <= ${r.iw})`)
}

async function alvosPequenosNaGaveta(page, passo) {
  const pequenos = await dialogo(page).evaluate((d) =>
    [...d.querySelectorAll('a, button, input:not(.sr-only), select, textarea, summary, label:has(> input.sr-only)')]
      .filter((el) => {
        const r = el.getBoundingClientRect()
        return r.width > 0 && r.height > 0 && (r.width < 44 || r.height < 44)
      })
      .map((el) => `${el.tagName} "${(el.getAttribute('aria-label') || el.textContent || '').trim().slice(0, 25)}" ${Math.round(el.getBoundingClientRect().width)}x${Math.round(el.getBoundingClientRect().height)}`),
  )
  // o checkbox "lembrar" é 20px, mas o <label> inteiro (≥ 48px) é o alvo
  const reais = pequenos.filter((p) => !p.startsWith('INPUT ""'))
  ok(passo, reais.length === 0, `alvos ≥ 44px na gaveta ${reais.length ? JSON.stringify(reais) : ''}`)
}

// ---------------------------------------------------------------- fluxo principal (390)
{
  const { ctx, page, erros } = await novaPagina()

  // Passo 3: adicionar
  await btnAdicionar(page, 'Croissant de manteiga').click()
  await btnAdicionar(page, 'Pão de fermentação natural').click()
  await btnAdicionar(page, 'Café coado').click()
  ok('3', (await area(page).getByRole('group', { name: 'Quantidade de Croissant de manteiga' }).count()) === 1, 'botão virou − n +')
  ok('3', (await contador(page)) === 3, 'contador = 3')
  const barra = page.getByRole('button', { name: /^Ver sacola:/ })
  ok('3', (await barra.getAttribute('aria-label')).replace(/\u00a0/g, ' ') === 'Ver sacola: 3 itens, R$ 36,00', `barra mobile: ${await barra.getAttribute('aria-label')}`)
  ok('3', /Café coado/.test(await page.locator('[role=status]').first().textContent()), 'região role=status anunciou')
  await print(page, 'c-390-barra.png')

  // toast acima da barra (espera a animação de 200ms)
  await page.waitForTimeout(350)
  const [rToast, rBarra] = await Promise.all([
    page.locator('.animar-surgir.fixed.inset-x-4').boundingBox(),
    barra.boundingBox(),
  ])
  ok('3', rToast && rToast.y + rToast.height <= rBarra.y - 8, `toast não cobre a barra (toast até ${rToast && Math.round(rToast.y + rToast.height)}, barra em ${Math.round(rBarra.y)})`)

  // Passo 4: quantidade e desfazer
  await area(page).getByRole('button', { name: 'Aumentar Croissant de manteiga' }).click()
  await area(page).getByRole('button', { name: 'Aumentar Croissant de manteiga' }).click()
  ok('4', (await contador(page)) === 5, 'croissant em 3 (total 5)')
  await area(page).getByRole('button', { name: 'Diminuir Café coado' }).click()
  ok('4', (await btnAdicionar(page, 'Café coado').count()) === 1, 'café zerado some da sacola')
  const desfazer = page.getByRole('button', { name: 'Desfazer a remoção de Café coado' })
  ok('4', await desfazer.isVisible(), 'toast oferece Desfazer')
  await desfazer.click()
  ok('4', (await contador(page)) === 5, 'desfazer devolveu o café')

  // Passo 5: variação
  await area(page).locator('label', { hasText: /^MR\$/ }).first().click()
  const cardBolo = area(page).locator('article', { hasText: 'Bolo de laranja com calda' })
  ok('5', (await cardBolo.locator('data.preco').first().textContent()).includes('78,00'), 'preço do card mudou para R$ 78,00')
  await btnAdicionar(page, 'Bolo de laranja com calda (M)').click()

  // abre pela barra
  await barra.click()
  await page.waitForTimeout(250)
  ok('5', await dialogo(page).evaluate((d) => d.open && d.matches(':modal')), 'gaveta abriu como modal')
  ok('5', (await dialogo(page).getByText('Tamanho M').count()) === 1, 'sacola mostra "Tamanho M" no bolo')
  ok('5', (await dialogo(page).getByRole('group', { name: 'Quantidade de Bolo de laranja com calda (M)' }).count()) === 1, 'linha do bolo (M)')
  ok('5', (await focoInfo(page)).tag === 'H2', 'foco no título "Sua sacola"')
  ok('5', await page.evaluate(() => getComputedStyle(document.documentElement).overflow === 'hidden'), 'scroll da página travado')
  const rotulo = await dialogo(page).getAttribute('aria-labelledby')
  ok('5', (await page.locator(`[id="${rotulo}"]`).textContent()) === 'Sua sacola', 'aria-labelledby aponta para o título')
  await alvosPequenosNaGaveta(page, '5')
  await printAlto(page, 'c-390-sacola.png', 390)

  // Passo 6: formulário vazio
  await dialogo(page).getByRole('button', { name: 'Continuar', exact: true }).click()
  ok('6', (await titulo(page).textContent()) === 'Seus dados' && (await focoInfo(page)).tag === 'H2', 'passo 2 com foco no título')
  ok('6', (await dialogo(page).getByText('Assim que possível').count()) === 0, 'com bolo, "assim que possível" não aparece')
  const primeiroDia = await dialogo(page).getByLabel('Dia', { exact: true }).locator('option').first().textContent()
  ok('6', primeiroDia === 'sexta-feira, 02/10', `primeiro dia = +48h (${primeiroDia})`)
  ok('6', (await dialogo(page).getByLabel('Mensagem do cartão').count()) === 1, 'mensagem do cartão aparece com encomenda')
  await dialogo(page).getByRole('button', { name: 'Enviar pedido pelo WhatsApp' }).click()
  const f6 = await focoInfo(page)
  const nome = dialogo(page).getByLabel('Seu nome')
  ok('6', f6.tag === 'INPUT' && f6.id === (await nome.getAttribute('id')), 'foco no primeiro erro (nome)')
  ok('6', (await nome.getAttribute('aria-invalid')) === 'true', 'aria-invalid no nome')
  const desc = await nome.getAttribute('aria-describedby')
  ok('6', desc && (await page.locator(`[id="${desc}"]`).textContent()) === 'Conta pra gente seu nome', 'aria-describedby → mensagem ao lado')
  ok('6', (await dialogo(page).getByText('Escolha a forma de pagamento').count()) === 1, 'erro de pagamento')
  ok('6', (await dialogo(page).getByText('Escolha um horário disponível').count()) === 1, 'erro de horário')
  ok('6', (await page.evaluate(() => window.__abertos.length)) === 0, 'não abriu o WhatsApp com erro')
  await printAlto(page, 'c-390-dados-erros.png', 390)

  // Passo 8: montar o pedido M1 — volta à sacola, tira croissant e café, pão ×2
  await dialogo(page).getByRole('button', { name: 'Voltar à sacola' }).click()
  ok('8', (await titulo(page).textContent()) === 'Sua sacola', 'voltar à sacola')
  await dialogo(page).getByRole('button', { name: 'Remover Croissant de manteiga da sacola' }).click()
  ok('8', (await focoInfo(page)).tag === 'H2', 'foco volta ao título após remover')
  ok('8', await dialogo(page).getByRole('button', { name: 'Desfazer a remoção de Croissant de manteiga' }).isVisible(), 'desfazer dentro da gaveta')
  await dialogo(page).getByRole('button', { name: 'Remover Café coado da sacola' }).click()
  await dialogo(page).getByRole('button', { name: 'Aumentar Pão de fermentação natural' }).click()
  await dialogo(page).getByRole('button', { name: 'Continuar', exact: true }).click()

  const d = dialogo(page)
  await d.getByLabel('Seu nome').fill('Mariana')
  await d.getByLabel('Seu nome').blur()
  await d.locator('label', { hasText: 'Receber em casa' }).click()
  await d.getByLabel('Bairro', { exact: true }).selectOption('vila-serena')
  await d.getByLabel('Rua e número').fill('Rua das Acácias, 120')
  await d.getByLabel('Complemento', { exact: false }).fill('ap. 32')
  await d.getByLabel('Dia', { exact: true }).selectOption('2026-10-03')
  await d.getByLabel('Horário', { exact: true }).selectOption('570')
  await d.locator('label', { hasText: /^Pix$/ }).click()
  await d.getByLabel('Mensagem do cartão').fill('Feliz aniversário, Lu!')
  await d.getByLabel('Observações').fill('sem cobertura de coco')
  await d.locator('label', { hasText: 'Lembrar meus dados' }).click()
  ok('8', (await d.getByText('Total').last().locator('xpath=following-sibling::dd[1]').textContent()).includes('119,00'), 'total com taxa = R$ 119,00')
  await printAlto(page, 'c-390-dados.png', 390)
  await d.getByRole('button', { name: 'Enviar pedido pelo WhatsApp' }).click()

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
  const abertos = await page.evaluate(() => window.__abertos)
  ok('8', abertos.length === 1, 'window.open chamado 1 vez')
  const aberto = abertos[0] ?? {}
  const url = new URL(aberto.u ?? 'https://x')
  ok('8', url.origin + url.pathname === 'https://wa.me/5511900000000', `link wa.me (${url.origin}${url.pathname})`)
  ok('8', aberto.alvo === '_blank' && aberto.features === 'noopener,noreferrer', `nova aba com noopener,noreferrer (${aberto.alvo}, ${aberto.features})`)
  const recebido = url.searchParams.get('text')
  ok('8', recebido === esperado, 'texto decodificado idêntico ao M1 da spec')
  if (recebido !== esperado) console.log('--- recebido ---\n' + recebido + '\n--- esperado ---\n' + esperado)
  ok('8', (await titulo(page).textContent()) === 'Pedido pronto' && (await focoInfo(page)).tag === 'H2', 'confirmação com foco no título')
  ok('8', (await d.getByText('Seu pedido foi aberto no WhatsApp; é só tocar em enviar lá.').count()) === 1, 'texto da confirmação')
  const planoB = d.getByRole('link', { name: 'Abrir o pedido no WhatsApp' })
  ok('8', (await planoB.getAttribute('href')) === aberto.u && (await planoB.getAttribute('target')) === '_blank' && /noopener/.test(await planoB.getAttribute('rel')), 'plano B: link com o mesmo href (window.open → null)')
  ok('8', (await contador(page)) === 3, 'sacola NÃO se esvaziou sozinha')
  const salvos = await page.evaluate(() => localStorage.getItem('fornada:dados:v1'))
  ok('8', salvos && JSON.parse(salvos).nome === 'Mariana' && !('observacoes' in JSON.parse(salvos)), '"Lembrar" salvou só nome/endereço')
  await alvosPequenosNaGaveta(page, '8')
  await printAlto(page, 'c-390-confirmacao.png', 390)

  // Passo 9: persistência
  await page.reload({ waitUntil: 'networkidle' })
  await page.waitForTimeout(300)
  ok('9', (await contador(page)) === 3, 'sacola mantida após recarregar')
  await page.locator('header').getByRole('button', { name: /^Abrir sacola/ }).click()
  await dialogo(page).getByRole('button', { name: 'Continuar', exact: true }).click()
  ok('9', (await dialogo(page).getByLabel('Seu nome').inputValue()) === 'Mariana', 'dados lembrados preenchidos')
  ok('9', await dialogo(page).getByLabel('Lembrar meus dados').isChecked(), '"Lembrar" continua marcado')
  // fecha pelo X: foco volta ao gatilho
  await dialogo(page).getByRole('button', { name: 'Fechar sacola' }).click()
  await page.waitForTimeout(150)
  ok('10', (await focoInfo(page)).label.startsWith('Abrir sacola'), 'X devolve foco ao gatilho')
  ok('9', await page.evaluate(() => getComputedStyle(document.documentElement).overflow !== 'hidden'), 'scroll destravado ao fechar')

  // Esvaziar pela confirmação
  await page.locator('header').getByRole('button', { name: /^Abrir sacola/ }).click()
  await dialogo(page).getByRole('button', { name: 'Continuar', exact: true }).click()
  await dialogo(page).locator('label', { hasText: 'Receber em casa' }).waitFor()
  await dialogo(page).getByLabel('Dia', { exact: true }).selectOption('2026-10-03')
  await dialogo(page).getByLabel('Horário', { exact: true }).selectOption('570')
  await dialogo(page).locator('label', { hasText: /^Pix$/ }).click()
  await dialogo(page).getByRole('button', { name: 'Enviar pedido pelo WhatsApp' }).click()
  await dialogo(page).getByRole('button', { name: 'Esvaziar sacola' }).click()
  await page.waitForTimeout(200)
  ok('8', (await contador(page)) === 0 && !(await dialogo(page).evaluate((x) => x.open)), '"Esvaziar sacola" esvazia e fecha')
  ok('8', (await page.getByRole('button', { name: /^Ver sacola:/ }).count()) === 0, 'barra some sem itens')

  // Passo 7: mínimo de entrega (só um café)
  await btnAdicionar(page, 'Café coado').click()
  await page.locator('header').getByRole('button', { name: /^Abrir sacola/ }).click()
  await printAlto(page, 'c-390-sacola-1item.png', 390)
  await dialogo(page).getByRole('button', { name: 'Continuar', exact: true }).click()
  ok('7', (await dialogo(page).getByText('Assim que possível').count()) === 1, 'sem encomenda e aberto: "assim que possível" existe')
  const antes7 = await page.evaluate(() => window.__abertos.length)
  await dialogo(page).getByLabel('Bairro', { exact: true }).selectOption('vila-serena')
  ok('7', (await dialogo(page).getByText(/Faltam R\$\s33,00 para o pedido mínimo/).count()) === 1, 'aviso "Faltam R$ 33,00"')
  await dialogo(page).locator('label', { hasText: /^Pix$/ }).click()
  await dialogo(page).getByRole('button', { name: 'Enviar pedido pelo WhatsApp' }).click()
  const f7 = await focoInfo(page)
  ok('7', f7.tag === 'INPUT' && f7.value === 'entrega', 'foco no modo (primeiro erro)')
  ok('7', (await dialogo(page).getByText(/Faltam R\$\s33,00 para entrega; retirada está liberada/).count()) === 1, 'erro de mínimo ao enviar')
  ok('7', (await page.evaluate(() => window.__abertos.length)) === antes7, 'não enviou abaixo do mínimo')
  await dialogo(page).getByLabel('Bairro', { exact: true }).selectOption('outro')
  ok('7', (await dialogo(page).getByText('A entrega no seu bairro será combinada').count()) === 1, '"Outro bairro" avisa combinar')
  ok('7', (await dialogo(page).getByText('+ entrega').count()) === 1, 'total "+ entrega" com outro bairro')
  await dialogo(page).locator('label', { hasText: 'Retirar na loja' }).click()
  await dialogo(page).getByRole('button', { name: 'Enviar pedido pelo WhatsApp' }).click()
  ok('7', (await page.evaluate(() => window.__abertos.length)) === antes7 + 1, 'retirada liberada abaixo do mínimo')

  // Esc devolve o foco (passo 10, parte 1)
  await page.keyboard.press('Escape')
  await page.waitForTimeout(150)
  ok('10', !(await dialogo(page).evaluate((x) => x.open)) && (await focoInfo(page)).label.startsWith('Abrir sacola'), 'Esc fecha e devolve foco ao gatilho')
  await semScrollHorizontal(page, '11')
  ok('console', erros.length === 0, `sem erros de console (390) ${erros.join(' | ')}`)
  await ctx.close()
}

// ---------------------------------------------------------------- storage bloqueado
{
  const { ctx, page, erros } = await novaPagina({ bloquearStorage: true })
  await btnAdicionar(page, 'Croissant de manteiga').click()
  await btnAdicionar(page, 'Pão de fermentação natural').click()
  await page.getByRole('button', { name: /^Ver sacola:/ }).click()
  await dialogo(page).getByRole('button', { name: 'Continuar', exact: true }).click()
  await dialogo(page).getByLabel('Seu nome').fill('  Rui  ')
  await dialogo(page).locator('label', { hasText: /^Dinheiro$/ }).click()
  await dialogo(page).getByLabel('Troco para quanto?').fill('20')
  await dialogo(page).getByLabel('Troco para quanto?').blur()
  ok('9b', (await dialogo(page).getByText('O troco precisa ser maior que o total').count()) === 1, 'troco menor que o total é recusado')
  await dialogo(page).getByLabel('Troco para quanto?').fill('50,00')
  await dialogo(page).locator('label', { hasText: 'Lembrar meus dados' }).click()
  await dialogo(page).getByRole('button', { name: 'Enviar pedido pelo WhatsApp' }).click()
  const txt = new URL((await page.evaluate(() => window.__abertos[0]?.u)) ?? 'https://x').searchParams.get('text') ?? ''
  ok('9b', txt.includes('Pagamento: dinheiro, troco para R$ 50,00') && txt.endsWith('Nome: Rui') && txt.includes('Quando: assim que possível'), 'storage bloqueado: pedido enviado normalmente')
  ok('9b', erros.length === 0, `storage bloqueado: console limpo ${erros.join(' | ')}`)
  await ctx.close()
}

// ---------------------------------------------------------------- teclado (1440)
{
  const { ctx, page, erros } = await novaPagina({ width: 1440, height: 900 })
  const tabAte = async (pred, max = 60, tecla = 'Tab') => {
    for (let i = 0; i < max; i++) {
      await page.keyboard.press(tecla)
      const f = await focoInfo(page)
      if (pred(f)) return f
    }
    return null
  }
  let f = await tabAte((x) => x.label === 'Adicionar Croissant de manteiga à sacola')
  ok('10', !!f && f.visivel, 'Tab chega ao "Adicionar" com foco visível')
  await page.keyboard.press('Enter')
  f = await focoInfo(page)
  ok('10', f.label === 'Aumentar Croissant de manteiga', 'foco foi para o "+"')
  await page.keyboard.press('Enter')
  f = await tabAte((x) => x.label === 'Adicionar Café coado à sacola')
  await page.keyboard.press('Space')
  // variação por teclado: rádio M do bolo
  f = await tabAte((x) => x.tag === 'INPUT' && x.value === 'p')
  await page.keyboard.press('ArrowRight')
  f = await focoInfo(page)
  ok('10', f.value === 'm', 'setas escolhem o tamanho M')
  f = await tabAte((x) => x.label === 'Adicionar Bolo de laranja com calda (M) à sacola')
  await page.keyboard.press('Enter')
  ok('10', (await contador(page)) === 4, 'teclado: 4 itens na sacola')
  f = await tabAte((x) => x.label.startsWith('Abrir sacola'), 80, 'Shift+Tab')
  ok('10', !!f, 'Shift+Tab até o botão da sacola')
  await page.keyboard.press('Enter')
  await page.waitForTimeout(250)
  ok('10', (await focoInfo(page)).tag === 'H2', 'gaveta abre com foco no título')
  await printAlto(page, 'c-1440-sacola.png', 1440, 900)
  f = await tabAte((x) => x.texto.startsWith('Continuar') && !x.texto.includes('escolhendo'))
  ok('10', !!f && f.visivel, 'Tab até "Continuar" (foco preso na gaveta)')
  await page.keyboard.press('Enter')
  ok('10', (await titulo(page).textContent()) === 'Seus dados', 'passo 2 por teclado')
  await page.keyboard.press('Tab')
  f = await focoInfo(page)
  ok('10', f.tag === 'BUTTON' && f.label === 'Fechar sacola' || f.tag === 'INPUT', `Tab depois do título: ${f.label || f.tag}`)
  // preenche nome
  await dialogo(page).getByLabel('Seu nome').focus()
  await page.keyboard.type('Ana Lu')
  f = await tabAte((x) => x.tag === 'SELECT' && /dia/.test(x.id ?? ''))
  ok('10', !!f, 'chega ao select de dia')
  await page.keyboard.press('Tab')
  f = await focoInfo(page)
  ok('10', f.tag === 'SELECT', 'select de horário')
  await page.keyboard.type('1') // busca por digitação no <select> fechado: primeiro horário que começa com "1"
  ok('10', /^1\d:\d\d$/.test(await page.evaluate(() => document.activeElement.selectedOptions[0].textContent)), 'horário escolhido por teclado')
  f = await tabAte((x) => x.tag === 'INPUT' && x.value === 'pix')
  await page.keyboard.press('Space')
  await printAlto(page, 'c-1440-dados.png', 1440, 900)
  f = await tabAte((x) => x.texto === 'Enviar pedido pelo WhatsApp')
  ok('10', !!f && f.visivel, 'Tab até "Enviar"')
  await page.keyboard.press('Enter')
  await page.waitForTimeout(200)
  const n = await page.evaluate(() => window.__abertos.length)
  if (n !== 1) console.log('erros visíveis:', await dialogo(page).locator('p.text-erro').allTextContents(), await focoInfo(page))
  ok('10', n === 1, 'envio só com teclado')
  ok('10', (await titulo(page).textContent()) === 'Pedido pronto', 'confirmação por teclado')
  await printAlto(page, 'c-1440-confirmacao.png', 1440, 900)
  await page.keyboard.press('Escape')
  await page.waitForTimeout(200)
  f = await focoInfo(page)
  ok('10', f.label.startsWith('Abrir sacola'), 'Esc fecha e o foco volta ao botão da sacola')
  await semScrollHorizontal(page, '11')
  ok('console', erros.length === 0, `sem erros de console (1440) ${erros.join(' | ')}`)
  await ctx.close()
}

// ---------------------------------------------------------------- 360 e vazio
{
  const { ctx, page, erros } = await novaPagina({ width: 360, height: 740 })
  await page.locator('header').getByRole('button', { name: /^Abrir sacola/ }).click()
  await page.waitForTimeout(200)
  ok('vazia', (await dialogo(page).getByText('Sua sacola está vazia').count()) === 1, 'estado vazio')
  ok('vazia', (await dialogo(page).getByRole('button', { name: 'Continuar', exact: true }).count()) === 0, 'sem "Continuar" com sacola vazia')
  await printAlto(page, 'c-360-vazia.png', 360, 740)
  await dialogo(page).getByRole('button', { name: /^Adicionar .* à sacola$/ }).first().click()
  ok('vazia', (await dialogo(page).locator('ul[aria-label="Itens na sacola"] li').count()) === 1, 'sugestão entra na sacola')
  await alvosPequenosNaGaveta(page, '360')
  await semScrollHorizontal(page, '360')
  ok('console', erros.length === 0, `sem erros de console (360) ${erros.join(' | ')}`)
  await ctx.close()
}

// ---------------------------------------------------- carrossel no celular (auditoria FOR-03)
// Adicionar pelos cards do meio do trilho não pode alargar a página nem esconder "Ver sacola".
for (const width of [360, 390]) {
  const ctx = await browser.newContext({ viewport: { width, height: 800 }, isMobile: true, hasTouch: true })
  const page = await ctx.newPage()
  await page.clock.install({ time: AGORA })
  await page.goto(BASE, { waitUntil: 'networkidle' })
  const cards = page.locator('#mais-pedidos ul').first().locator(':scope > li')
  for (let i = 1; i < (await cards.count()); i++) {
    const botao = cards.nth(i).getByRole('button', { name: /^Adicionar .* à sacola$/ })
    if (!(await botao.count())) continue
    await botao.first().scrollIntoViewIfNeeded()
    await botao.first().click()
    await page.waitForTimeout(150)
    const [vw, sw] = await page.evaluate(() => [innerWidth, document.documentElement.scrollWidth])
    ok('FOR-03', sw <= width && vw === width, `${width}px, card ${i + 1}: scrollWidth ${sw}`)
  }
  ok('FOR-03', await page.getByText(/ver sacola/i).first().isVisible(), `${width}px: "Ver sacola" visível`)
  await ctx.close()
}

await browser.close()
console.log(resultados.join('\n'))
console.log(falhou ? '\nRESULTADO: FALHOU' : '\nRESULTADO: TUDO OK')
process.exit(falhou ? 1 : 0)
