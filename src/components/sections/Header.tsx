import { linkWhatsApp } from '@/lib/mensagem'
import { Botao } from '@/components/ui/Botao'
import { Container } from '@/components/ui/Container'
import { IconeWhatsApp } from '@/components/ui/Icone'
import { Logo } from '@/components/ui/Logo'
import { loja } from '@/content/loja'
import { textos } from '@/content/textos'
import { BotaoSacola } from './header/BotaoSacola'
import { HeaderFixo } from './header/HeaderFixo'
import { MenuMobile } from './header/MenuMobile'
import { StatusFuncionamento } from './header/StatusFuncionamento'

/**
 * Topo fixo de 64px. Desktop (≥ lg): logo, navegação, status, WhatsApp e sacola.
 * Abaixo de lg: logo, status curto, sacola e hambúrguer (a sacola fica sempre fora do menu).
 */
export function Header() {
  const whatsapp = linkWhatsApp(loja.whatsapp, textos.whatsapp.mensagemDuvida)
  return (
    <HeaderFixo>
      <Container className="flex h-(--header-h) items-center gap-3 lg:gap-8">
        <a
          href="#inicio"
          aria-label={loja.marca}
          className="-ml-1 inline-flex min-h-11 shrink-0 items-center rounded-botao px-1 text-casca"
        >
          <Logo className="text-[1.375rem] sm:text-2xl" />
        </a>

        <nav aria-label={textos.rodape.navegacao} className="hidden lg:block">
          <ul className="flex items-center xl:gap-1">
            {textos.navegacao.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-botao px-2.5 whitespace-nowrap text-[0.9375rem] font-medium text-casca decoration-mel decoration-2 underline-offset-8 transition-colors hover:underline"
                >
                  {item.rotulo}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-1 sm:gap-3">
          <div className="mr-1 whitespace-nowrap lg:mr-0">
            <StatusFuncionamento variante="curto" />
          </div>
          <div className="hidden lg:block">
            <Botao
              variante="secundario"
              tamanho="sm"
              href={whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={textos.header.falarNoWhatsApp}
              className="whitespace-nowrap max-xl:w-11 max-xl:px-0"
            >
              <IconeWhatsApp size={20} />
              <span className="hidden xl:inline">{textos.header.falarNoWhatsApp}</span>
            </Botao>
          </div>
          <BotaoSacola />
          <div className="-mr-2 lg:hidden">
            <MenuMobile />
          </div>
        </div>
      </Container>
    </HeaderFixo>
  )
}
