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
import { SITE_URL } from '@/content/site'

// Só o WebSite: a Fornada é fictícia, então não publicamos dados de negócio local (Bakery,
// endereço, telefone, horário) que o Google poderia indexar como uma padaria real.
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: loja.marca,
  url: `${SITE_URL}/`,
  description: textos.meta.descricao,
  inLanguage: 'pt-BR',
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
