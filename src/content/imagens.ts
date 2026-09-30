// Imagens do manifesto (scripts/manifesto-imagens.json é a fonte única de caminho, tamanho e alt).
// Trocar o arquivo em public/images/ pela foto final não exige mudança de código.
import manifesto from '../../scripts/manifesto-imagens.json'

export type ItemManifesto = {
  chave: string
  arquivo: string
  largura: number
  altura: number
  uso: string
  alt: string
}

export type Imagem = { src: string; width: number; height: number; alt: string }

const porChave = new Map((manifesto as ItemManifesto[]).map((i) => [i.chave, i]))

/** `imagem('hero')` → `{ src: '/images/hero.jpg', width: 1200, height: 1500, alt }`. */
export function imagem(chave: string): Imagem {
  const item = porChave.get(chave)
  if (!item) throw new Error(`Imagem "${chave}" não está em scripts/manifesto-imagens.json`)
  return { src: `/images/${item.arquivo}`, width: item.largura, height: item.altura, alt: item.alt }
}

export const itensManifesto = manifesto as ItemManifesto[]
