import { Header } from '@/components/sections/Header'
import { Hero } from '@/components/sections/Hero'
import { Queridinhos } from '@/components/sections/Queridinhos'
import { Cardapio } from '@/components/sections/Cardapio'
import { Encomendas } from '@/components/sections/Encomendas'
import { Entrega } from '@/components/sections/Entrega'
import { Sobre } from '@/components/sections/Sobre'
import { OndeEstamos } from '@/components/sections/OndeEstamos'
import { Rodape } from '@/components/sections/Rodape'
import { loja } from '@/content/loja'
import { textos } from '@/content/textos'

const DIAS_SCHEMA = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const hora = (min: number) =>
  `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Bakery',
  name: loja.marca,
  description: textos.meta.descricao,
  image: '/images/og.jpg',
  telephone: `+${loja.whatsapp}`,
  priceRange: '$',
  servesCuisine: 'Padaria',
  address: {
    '@type': 'PostalAddress',
    streetAddress: `${loja.endereco.rua}, ${loja.endereco.numero}`,
    addressLocality: loja.endereco.cidade,
    addressRegion: loja.endereco.uf,
    postalCode: loja.endereco.cep,
    addressCountry: 'BR',
  },
  openingHoursSpecification: Object.entries(loja.horarios)
    .filter(([, h]) => h !== null)
    .map(([dia, h]) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: DIAS_SCHEMA[Number(dia)],
      opens: hora(h!.abre),
      closes: hora(h!.fecha),
    })),
}

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
      <Header />
      <main id="conteudo">
        <Hero />
        <Queridinhos />
        <Cardapio />
        <Encomendas />
        <Entrega />
        <Sobre />
        <OndeEstamos />
      </main>
      <Rodape />
    </>
  )
}
