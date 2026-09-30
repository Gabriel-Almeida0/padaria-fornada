import Image from 'next/image'
import { imagem } from '@/content/imagens'

type Props = {
  /** chave do manifesto (scripts/manifesto-imagens.json) */
  chave: string
  /** `sizes` do next/image: obrigatório para o navegador escolher o tamanho certo */
  sizes: string
  /** só a imagem do hero (LCP) deve ser prioritária: usa `preload` (o `priority` foi depreciado no Next 16) */
  prioridade?: boolean
  /** sobrescreve o alt do manifesto; use "" para imagem decorativa */
  alt?: string
  className?: string
}

/** Foto do manifesto com width/height/alt corretos; cantos de 2px. */
export function Foto({ chave, sizes, prioridade = false, alt, className = '' }: Props) {
  const img = imagem(chave)
  return (
    <Image
      src={img.src}
      width={img.width}
      height={img.height}
      alt={alt ?? img.alt}
      sizes={sizes}
      preload={prioridade}
      fetchPriority={prioridade ? 'high' : undefined}
      className={`h-auto w-full rounded-card bg-trigo object-cover ${className}`}
    />
  )
}
