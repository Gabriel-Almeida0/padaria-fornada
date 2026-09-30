#!/usr/bin/env node
/**
 * Gera as imagens do site com o Nano Banana (Gemini) a partir de scripts/prompts-imagens.json
 * (extraído de docs/prompts-imagens.md) e salva cada uma em public/images/ já no tamanho exato do
 * manifesto (JPEG q82). Os originais ficam em docs/imagens-geradas/.
 *
 * Uso:
 *   npm run gerar-imagens                         → só as que ainda são placeholder
 *   npm run gerar-imagens -- hero produto-brownie  → só essas (sobrescreve)
 *   npm run gerar-imagens -- --todas              → todas
 *
 * Chave em nanobanana.env (GEMINI_API_KEY=...), fora do git. Modelo em GEMINI_IMAGE_MODEL
 * (padrão gemini-3.1-flash-image-preview, o Nano Banana 2).
 * Resolução por imagem: campo "resolucao" no JSON (só o hero, que é o LCP, vai em 2K); o resto
 * em 1K, que cobre o maior tamanho em que aparecem em tela retina.
 *
 * Consistência: uma imagem com "referencias" só é gerada depois delas; a foto de referência vai
 * junto no pedido para o modelo manter a mesma bancada, luz e o mesmo pão.
 */
import { readFile, writeFile, stat, rm, mkdir } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const raiz = path.resolve(import.meta.dirname, '..')
const pastaImagens = path.join(raiz, 'public/images')
const pastaOriginais = path.join(raiz, 'docs/imagens-geradas')

// Placeholders do gerar-placeholders.mjs têm ~15–45 KB; uma foto de verdade passa de 60 KB.
const LIMITE_PLACEHOLDER = 55 * 1024

// Proporção do Gemini mais próxima de cada tamanho final (o resto é recorte central).
function proporcaoGemini(largura, altura) {
  const r = largura / altura
  const opcoes = { '4:5': 0.8, '3:4': 0.75, '4:3': 4 / 3, '3:2': 1.5, '16:9': 16 / 9, '1:1': 1 }
  return Object.entries(opcoes).sort((a, b) => Math.abs(a[1] - r) - Math.abs(b[1] - r))[0][0]
}

async function lerEnv() {
  let texto
  try {
    texto = await readFile(path.join(raiz, 'nanobanana.env'), 'utf8')
  } catch {
    throw new Error('Não achei nanobanana.env na raiz do projeto.')
  }
  const env = {}
  for (const linha of texto.split('\n')) {
    const m = linha.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/)
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '')
  }
  if (!env.GEMINI_API_KEY) throw new Error('Preencha GEMINI_API_KEY em nanobanana.env.')
  return env
}

async function ehPlaceholder(arquivo) {
  try {
    return (await stat(arquivo)).size < LIMITE_PLACEHOLDER
  } catch {
    return true
  }
}

async function gerar({ chave, modelo, prompt, proporcao, tamanho, referencias }) {
  const partes = [{ text: prompt }]
  for (const ref of referencias) {
    const dados = await readFile(path.join(pastaImagens, ref))
    partes.push({ inlineData: { mimeType: 'image/jpeg', data: dados.toString('base64') } })
  }
  const resposta = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent`,
    {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-goog-api-key': chave },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: partes }],
        generationConfig: {
          responseModalities: ['IMAGE'],
          imageConfig: { aspectRatio: proporcao, ...(tamanho && { imageSize: tamanho }) },
        },
      }),
    },
  )
  const json = await resposta.json()
  if (!resposta.ok) throw new Error(`${resposta.status}: ${json.error?.message ?? JSON.stringify(json)}`)
  const parte = json.candidates?.[0]?.content?.parts?.find((p) => p.inlineData?.data)
  if (!parte) {
    const motivo = json.candidates?.[0]?.finishReason ?? json.promptFeedback?.blockReason ?? 'sem imagem'
    throw new Error(`o modelo não devolveu imagem (${motivo})`)
  }
  return Buffer.from(parte.inlineData.data, 'base64')
}

async function main() {
  const args = process.argv.slice(2)
  const todas = args.includes('--todas')
  const escolhidas = args.filter((a) => !a.startsWith('--'))

  const env = await lerEnv()
  const modelo = env.GEMINI_IMAGE_MODEL || 'gemini-3.1-flash-image-preview'
  const aceitaTamanho = !modelo.startsWith('gemini-2.5')
  const tamanhoPadrao = env.GEMINI_IMAGE_SIZE || '1K'
  const manifesto = JSON.parse(await readFile(path.join(raiz, 'scripts/manifesto-imagens.json'), 'utf8'))
  const { estilo, imagens } = JSON.parse(await readFile(path.join(raiz, 'scripts/prompts-imagens.json'), 'utf8'))

  const desconhecidas = escolhidas.filter((c) => !manifesto.some((m) => m.chave === c))
  if (desconhecidas.length) throw new Error(`Imagem desconhecida: ${desconhecidas.join(', ')}`)

  const pendentes = []
  for (const item of manifesto) {
    const destino = path.join(pastaImagens, item.arquivo)
    if (escolhidas.length ? escolhidas.includes(item.chave) : todas || (await ehPlaceholder(destino))) {
      pendentes.push({ ...item, destino })
    }
  }
  if (!pendentes.length) {
    console.log('Nada a gerar: todas já são fotos de verdade. Passe nomes ou --todas para refazer.')
    return
  }

  // Ordena para que cada imagem venha depois das suas referências.
  const arquivosPendentes = new Set(pendentes.map((p) => p.arquivo))
  const feitos = new Set()
  const fila = []
  while (fila.length < pendentes.length) {
    const prontos = pendentes.filter(
      (p) =>
        !feitos.has(p.arquivo) &&
        (imagens[p.chave].referencias ?? []).every((r) => feitos.has(r) || !arquivosPendentes.has(r)),
    )
    if (!prontos.length) throw new Error('Referências em ciclo em prompts-imagens.json.')
    for (const p of prontos) {
      fila.push(p)
      feitos.add(p.arquivo)
    }
  }

  await mkdir(pastaOriginais, { recursive: true })
  console.log(`Modelo ${modelo} — gerando ${fila.length}: ${fila.map((f) => f.chave).join(', ')}\n`)
  let falhas = 0
  const falharam = new Set()
  for (const item of fila) {
    const p = imagens[item.chave]
    const referencias = p.referencias ?? []
    if (referencias.some((r) => falharam.has(r))) {
      falhas++
      console.log(`• ${item.chave} … pulada (a referência falhou)`)
      continue
    }
    const tamanho = aceitaTamanho ? (p.resolucao ?? tamanhoPadrao) : undefined
    const partes = [p.prompt, `Style: ${estilo}.`, `Avoid: ${p.negativo}.`]
    if (referencias.length) {
      partes.push(
        'The attached photo(s) come from the same bakery photo shoot: keep the same freijó wood workbench, cream plaster wall, window light from the left, props and color grading; if the same bread, cake or basket appears, keep it identical. Do not copy the composition.',
      )
    }
    process.stdout.write(`• ${item.chave}${tamanho ? ` [${tamanho}]` : ''} … `)
    try {
      const bruta = await gerar({
        chave: env.GEMINI_API_KEY,
        modelo,
        prompt: partes.join('\n\n'),
        proporcao: proporcaoGemini(item.largura, item.altura),
        tamanho,
        referencias,
      })
      await mkdir(path.dirname(path.join(pastaOriginais, item.arquivo)), { recursive: true })
      await writeFile(path.join(pastaOriginais, item.arquivo.replace(/\.jpg$/, '.png')), bruta)
      await sharp(bruta)
        .resize(item.largura, item.altura, { fit: 'cover' })
        .jpeg({ quality: 82, mozjpeg: true })
        .toFile(item.destino)
      const kb = Math.round((await stat(item.destino)).size / 1024)
      console.log(`ok (${item.largura}×${item.altura}, ${kb} KB)`)
    } catch (erro) {
      falhas++
      falharam.add(item.arquivo)
      console.log(`falhou — ${erro.message}`)
    }
  }

  // O otimizador do Next guarda a versão antiga em cache.
  await rm(path.join(raiz, '.next/dev/cache/images'), { recursive: true, force: true })
  await rm(path.join(raiz, '.next/cache/images'), { recursive: true, force: true })
  console.log(`\nPronto. Originais em docs/imagens-geradas/. Recarregue o site.${falhas ? ` ${falhas} falharam.` : ''}`)
  if (falhas) process.exitCode = 1
}

main().catch((erro) => {
  console.error(`Erro: ${erro.message}`)
  process.exit(1)
})
