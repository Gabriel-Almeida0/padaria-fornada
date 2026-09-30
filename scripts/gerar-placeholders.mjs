#!/usr/bin/env node
// Gera os placeholders das imagens do manifesto (scripts/manifesto-imagens.json) em
// public/images/<arquivo>, com exatamente as dimensões do manifesto.
//
// Uso:
//   npm run placeholders             # cria só os arquivos que ainda não existem
//   npm run placeholders -- --force  # regenera todos (sobrescreve as fotos finais!)
//
// As cores abaixo espelham os tokens de src/app/globals.css (trigo, casca, brasa, mel,
// cinza-forno). Este script não é componente, então os hex aqui não violam a regra de tokens.

import { readFile, mkdir, access } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import sharp from 'sharp'

const cor = {
  trigo: '#EFDDB5',
  miolo: '#FBF6EC',
  casca: '#3B2418',
  brasa: '#B83A12',
  mel: '#E0A43A',
  cinzaForno: '#6B5B50',
}

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const destino = path.join(raiz, 'public', 'images')
const force = process.argv.includes('--force')

const manifesto = JSON.parse(
  await readFile(path.join(raiz, 'scripts', 'manifesto-imagens.json'), 'utf8'),
)

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

// tamanho de fonte que cabe na largura (estimativa: 0,55 em por caractere)
const caber = (texto, largura, maximo) => Math.min(maximo, (largura * 0.86) / (String(texto).length * 0.55))

function svg({ arquivo, largura: w, altura: h, uso }) {
  const base = Math.min(w, h)
  const t1 = Math.round(caber(arquivo, w, base * 0.07))
  const t2 = Math.round(base * 0.045)
  const t3 = Math.round(caber(uso, w, base * 0.034))
  const faixa = Math.round(base * 0.12)
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <rect width="${w}" height="${h}" fill="${cor.trigo}"/>
  <g transform="translate(${w / 2} ${h * 0.46}) rotate(-8)">
    <rect x="${-w * 1.5}" y="${-faixa / 2}" width="${w * 3}" height="${faixa}" fill="${cor.mel}" opacity=".55"/>
  </g>
  <circle cx="${w / 2}" cy="${h * 0.46}" r="${base * 0.16}" fill="${cor.miolo}" stroke="${cor.brasa}" stroke-width="${Math.max(2, base * 0.008)}"/>
  <g font-family="Helvetica, Arial, sans-serif" text-anchor="middle">
    <text x="${w / 2}" y="${h * 0.14}" font-size="${t2}" font-weight="700" letter-spacing="${t2 * 0.12}" fill="${cor.brasa}">FORNADA · PLACEHOLDER</text>
    <text x="${w / 2}" y="${h * 0.76}" font-size="${t1}" font-weight="700" fill="${cor.casca}">${esc(arquivo)}</text>
    <text x="${w / 2}" y="${h * 0.76 + t1 * 1.3}" font-size="${t2}" fill="${cor.casca}">${w}×${h}</text>
    <text x="${w / 2}" y="${h * 0.76 + t1 * 1.3 + t2 * 1.7}" font-size="${t3}" fill="${cor.cinzaForno}">${esc(uso)}</text>
  </g>
</svg>`
}

async function existe(p) {
  try {
    await access(p)
    return true
  } catch {
    return false
  }
}

let criadas = 0
let puladas = 0
for (const item of manifesto) {
  const saida = path.join(destino, item.arquivo)
  if (!force && (await existe(saida))) {
    console.log(`= ${item.arquivo} já existe (use --force para regenerar)`)
    puladas++
    continue
  }
  await mkdir(path.dirname(saida), { recursive: true })
  await sharp(Buffer.from(svg(item)))
    .resize(item.largura, item.altura)
    .jpeg({ quality: 80, mozjpeg: true })
    .toFile(saida)
  console.log(`+ ${item.arquivo} ${item.largura}×${item.altura}`)
  criadas++
}
console.log(`\n${criadas} criada(s), ${puladas} pulada(s).`)
