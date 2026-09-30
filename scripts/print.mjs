// Uso: node scripts/print.mjs <caminho> <saida.png> [largura=390] [altura=844] [fullPage=1]
// Tira screenshot do dev server compartilhado (porta 3200) com um Chrome headless próprio,
// para vários agentes poderem conferir o visual ao mesmo tempo. Também imprime scrollWidth,
// erros de console e alvos interativos menores que 44px.
import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)
const { chromium } = require('/Users/gabrielalmeidasantosmelo/projetos/pbn/node_modules/playwright')

const [caminho = '/', saida = 'docs/verificacao/print.png', w = '390', h = '844', full = '1'] = process.argv.slice(2)
const browser = await chromium.launch({ channel: 'chrome', headless: true })
const page = await browser.newPage({ viewport: { width: +w, height: +h }, deviceScaleFactor: 1 })
const erros = []
page.on('console', (m) => m.type() === 'error' && erros.push(m.text()))
page.on('pageerror', (e) => erros.push(String(e)))
await page.goto('http://localhost:' + (process.env.PORTA || 3200) + '' + caminho, { waitUntil: 'networkidle' })
await page.waitForTimeout(400)
// rola a página inteira para disparar as imagens lazy antes do print de página cheia
if (full === '1') {
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += innerHeight / 2) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 120)) }
    scrollTo(0, 0)
  })
  await page.waitForTimeout(800)
}
const info = await page.evaluate(() => {
  const pequenos = [...document.querySelectorAll('a, button, input, select, textarea, [role=radio], summary')]
    .filter((el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 && (r.width < 44 || r.height < 44) && getComputedStyle(el).visibility !== 'hidden' })
    .map((el) => `${el.tagName.toLowerCase()} "${(el.getAttribute('aria-label') || el.textContent || '').trim().slice(0, 30)}" ${Math.round(el.getBoundingClientRect().width)}x${Math.round(el.getBoundingClientRect().height)}`)
  return { scrollWidth: document.documentElement.scrollWidth, innerWidth: innerWidth, pequenos }
})
await page.screenshot({ path: saida, fullPage: full === '1' })
console.log(JSON.stringify({ ...info, erros }, null, 2))
await browser.close()
