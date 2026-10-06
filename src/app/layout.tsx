import type { Metadata, Viewport } from 'next'
import { Figtree, Fraunces } from 'next/font/google'
import { SacolaProvider } from '@/components/sacola/SacolaProvider'
import { GavetaSacola } from '@/components/sacola/GavetaSacola'
import { BarraSacolaMobile } from '@/components/sacola/BarraSacolaMobile'
import { textos } from '@/content/textos'
import { SITE_URL } from '@/content/site'
import './globals.css'

// Fontes self-hosted via next/font (research R1). As duas são variáveis: `weight` omitido.
const fraunces = Fraunces({
  subsets: ['latin'],
  axes: ['SOFT'],
  variable: '--font-fraunces',
  display: 'swap',
})

// O itálico só aparece na palavra de destaque dos títulos: arquivo separado e sem preload, para
// não disputar banda com a foto do hero (LCP).
const frauncesItalico = Fraunces({
  subsets: ['latin'],
  axes: ['SOFT'],
  style: 'italic',
  variable: '--font-fraunces-italico',
  display: 'swap',
  preload: false,
})

const figtree = Figtree({
  subsets: ['latin'],
  variable: '--font-figtree',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  alternates: { canonical: '/' },
  title: textos.meta.titulo,
  description: textos.meta.descricao,
  openGraph: {
    type: 'website',
    url: '/',
    locale: 'pt_BR',
    siteName: 'Fornada Padaria',
    title: textos.meta.titulo,
    description: textos.meta.descricao,
    images: [{ url: '/images/og.jpg', width: 1200, height: 630, alt: 'Pães e folhados da Fornada sobre a bancada' }],
  },
}

export const viewport: Viewport = {
  themeColor: '#FBF6EC',
  colorScheme: 'light',
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="pt-BR" className={`${fraunces.variable} ${frauncesItalico.variable} ${figtree.variable}`}>
      <body className="min-h-dvh bg-miolo font-sans text-casca antialiased">
        <a
          href="#conteudo"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:inline-flex focus:min-h-12 focus:items-center focus:rounded-botao focus:bg-casca focus:px-5 focus:font-semibold focus:text-miolo"
        >
          {textos.acessibilidade.pularParaConteudo}
        </a>
        <SacolaProvider>
          {children}
          <BarraSacolaMobile />
          <GavetaSacola />
        </SacolaProvider>
      </body>
    </html>
  )
}
