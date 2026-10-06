import type { ReactNode } from 'react'
import { linkWhatsApp } from '@/lib/mensagem'
import { Container } from '@/components/ui/Container'
import { IconeLocal, IconeTelefone, IconeWhatsApp } from '@/components/ui/Icone'
import { Logo } from '@/components/ui/Logo'
import { loja } from '@/content/loja'
import { textos } from '@/content/textos'

const t = textos.rodape
const link =
  'inline-flex min-h-11 min-w-11 items-center gap-2.5 rounded-botao text-miolo/85 transition-colors hover:text-miolo hover:underline hover:decoration-mel hover:underline-offset-4'

function Coluna({ titulo, id, children }: { titulo: string; id: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <h2 id={id} className="kicker text-mel">
        {titulo}
      </h2>
      {children}
    </div>
  )
}

/** Rodapé em casca com texto miolo; foco em mel (regra `.bg-casca :focus-visible`). */
export function Rodape() {
  const e = loja.endereco
  const telefone = `+${loja.whatsapp}`
  return (
    <footer className="bg-casca pt-16 pb-8 text-miolo md:pt-20">
      <Container>
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          <div className="flex flex-col gap-4 sm:col-span-2 lg:col-span-4">
            <Logo tamanho="lg" />
            <p className="max-w-xs text-miolo/80">{t.frase}</p>
          </div>

          <div className="lg:col-span-2">
            <Coluna titulo={t.navegacao} id="rodape-navegacao">
              <nav aria-labelledby="rodape-navegacao">
                <ul className="flex flex-col">
                  {textos.navegacao.map((item) => (
                    <li key={item.href}>
                      <a href={item.href} className={link}>
                        {item.rotulo}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </Coluna>
          </div>

          <div className="lg:col-span-3">
            <Coluna titulo={t.contato} id="rodape-contato">
              <ul className="flex flex-col">
                <li>
                  <a
                    href={linkWhatsApp(loja.whatsapp, textos.whatsapp.mensagemDuvida)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={link}
                  >
                    <IconeWhatsApp size={20} className="shrink-0 text-mel" />
                    {textos.whatsapp.falarComPadaria}
                  </a>
                </li>
                <li>
                  <a href={`tel:${telefone}`} className={link}>
                    <IconeTelefone size={20} className="shrink-0 text-mel" />
                    <span className="tabular-nums">{loja.whatsappExibicao}</span>
                  </a>
                </li>
                <li>
                  <a href={loja.mapaUrl} target="_blank" rel="noopener noreferrer" className={`${link} py-2`}>
                    <IconeLocal size={20} className="shrink-0 self-start text-mel" />
                    <address className="not-italic">
                      {e.rua}, {e.numero}
                      <br />
                      {e.bairro}, {e.cidade} · {e.uf}
                    </address>
                  </a>
                </li>
              </ul>
            </Coluna>
          </div>

          <div className="flex flex-col gap-10 lg:col-span-3">
            <Coluna titulo={t.horarios} id="rodape-horarios">
              <ul className="flex flex-col gap-1 text-miolo/85">
                {textos.header.resumoHorario.split(' · ').map((linha) => (
                  <li key={linha}>{linha}</li>
                ))}
              </ul>
            </Coluna>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-miolo/15 pt-6 text-sm text-miolo/75 md:flex-row md:items-center md:justify-between">
          <p>
            © {new Date().getFullYear()} {t.direitos}
          </p>
          <p className="font-medium text-miolo">{t.aviso}</p>
        </div>
      </Container>
    </footer>
  )
}
