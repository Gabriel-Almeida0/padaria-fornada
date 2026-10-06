<!--
Sync Impact Report
- Versão: (template sem versão) → 1.0.0
- Princípios definidos (novos, a partir do template):
  I. Estático, pedido só pelo WhatsApp
  II. Inspirado na referência, sem cópia, corrigindo os pontos fracos
  III. Acessibilidade e responsividade não negociáveis
  IV. Performance e SEO
  V. Conteúdo como dado, seções isoladas (paralelismo)
  VI. Verificação visual obrigatória
  VII. Simplicidade e versão real do Next.js
- Seções adicionadas: "Restrições de Stack e Conteúdo", "Fluxo de Desenvolvimento e Portões de Qualidade"
- Seções removidas: nenhuma
- Templates dependentes: plan-template.md, spec-template.md, tasks-template.md ✅ sem alteração
  (leem este arquivo em tempo de execução)
- TODOs: nenhum
-->

# Fornada Padaria — Constituição

## Core Principles

### I. Estático, pedido só pelo WhatsApp

O site é de uma padaria fictícia, peça de portfólio, publicada como site estático.

- NÃO DEVE existir backend, banco de dados, rota de API, pagamento online, login nem envio de
  formulário para servidor.
- O pedido é montado no navegador (sacola) e finalizado abrindo
  `https://wa.me/<numero>?text=<mensagem>` com a mensagem do pedido URL-encoded, em nova aba, com
  `rel="noopener noreferrer"`.
- A montagem da mensagem DEVE ser uma função pura em `src/lib/` (entrada: itens + dados do
  cliente; saída: texto), coberta por teste. Nenhum componente monta URL de WhatsApp na mão.
- A sacola PODE ser lembrada em `localStorage` só como conveniência: toda leitura/escrita em
  `try/catch`, e o site DEVE funcionar igual se o storage falhar ou vier vazio.
- Preços exibidos DEVEM somar corretamente em centavos (inteiros), nunca em ponto flutuante.

Racional: o valor está no design e na experiência de pedido, não em infraestrutura.

### II. Inspirado na referência, sem cópia, corrigindo os pontos fracos

- O sistema visual DEVE seguir a seção (e) de `docs/referencia/auditoria-referencia.md` (fora do repositório público): o espírito
  de uma padaria real de referência (serifa marcante nos títulos, muito respiro, fotografia de produto como
  protagonista, paleta quente e contida), com paleta e fontes próprias.
- Cada ponto fraco da seção (d) da auditoria DEVE ter uma resposta rastreável na spec (requisito
  ou decisão explícita de não tratar).
- Cores, fontes, raios, sombras e espaçamentos DEVEM sair de tokens (`@theme` em `globals.css`);
  hexadecimais soltos em componentes são proibidos (inclusive o verde do WhatsApp: token
  `--whatsapp`).
- NENHUM texto, logo, foto, ícone, nome de produto exclusivo ou mockup da referência pode ser
  reutilizado. Nome, endereço, telefone, textos e imagens são inventados para a Fornada.

Racional: demonstrar domínio de um estilo e capacidade de melhorar UX, não clonar uma marca.

### III. Acessibilidade e responsividade não negociáveis

- O layout DEVE funcionar de 360px a 1440px sem scroll horizontal (`scrollWidth <= innerWidth`).
- Contraste WCAG 2.1 AA: 4,5:1 texto normal, 3:1 texto grande e componentes de interface.
- Alvos de toque ≥ 44×44px no mobile (botões +/−, fechar, abrir sacola).
- Foco visível em todo elemento interativo; toda a jornada (escolher produto → sacola → enviar)
  DEVE ser possível só com teclado.
- Semântica: um único `h1`, headings sem saltos, landmarks, link "Pular para o conteúdo".
- Gaveta da sacola e menu mobile: `role="dialog"`/`aria-modal`, foco preso enquanto abertos,
  Esc fecha, foco volta ao gatilho, scroll do body travado.
- Mudanças na sacola DEVEM ser anunciadas por uma região `aria-live="polite"`.
- Toda imagem de conteúdo tem `alt` descritivo em português; decorativas usam `alt=""`.
- Animações respeitam `prefers-reduced-motion`. Carrossel automático é proibido.

### IV. Performance e SEO

- Imagens via `next/image` com dimensões ou `fill` + `sizes`; só a imagem do hero é prioritária.
- Fontes via `next/font/google`, nunca `<link>` para fonts.googleapis.com.
- JavaScript de cliente mínimo: sacola, menu mobile e controles de quantidade são Client
  Components; o resto é Server Component.
- `metadata` completa (title, description, Open Graph, `metadataBase`, `lang="pt-BR"`) e JSON-LD
  `Bakery` sanitizado.
- Meta de Lighthouse mobile (build de produção): Performance ≥ 90, Acessibilidade ≥ 95,
  Boas Práticas ≥ 95, SEO ≥ 95.

### V. Conteúdo como dado, seções isoladas

- Todo texto e dado (produtos, categorias, preços, horários, endereço, WhatsApp, taxas, imagens)
  DEVE morar em `src/content/`, tipado. Componentes não contêm strings de negócio literais.
- Cada seção fica em arquivo próprio em `src/components/sections/`, dependendo só de
  `src/components/ui/`, `src/lib/` e `src/content/`. Seções NÃO importam umas às outras.
- Só a tarefa de integração edita `src/app/page.tsx`. Isso permite agentes em paralelo sem
  conflito de arquivos.
- Imagens seguem o manifesto (`scripts/manifesto-imagens.json`, caminhos fixos em
  `public/images/`); trocar placeholder pela imagem final não exige mudança de código.

### VI. Verificação visual obrigatória

- Nenhuma seção está pronta sem screenshot via Playwright em 390px e 1440px.
- O fluxo completo de pedido DEVE ser exercitado no navegador (adicionar, alterar quantidade,
  remover, preencher dados, conferir o texto gerado) antes de fechar a entrega.
- `npm run lint`, os testes e `npm run build` DEVEM passar antes de fechar qualquer bloco.
- Checagem de scroll horizontal e console sem erros faz parte da verificação.

### VII. Simplicidade e versão real do Next.js

- Next.js 16.3.7 tem mudanças que quebram APIs. Antes de usar `next/font`, `next/image`,
  `metadata` ou outra API do framework, quem implementa DEVE ler o guia em
  `node_modules/next/dist/docs/` e seguir o que está lá, não a memória.
- Sem bibliotecas de UI pesadas, de estado global nem de animação. Permitido: `lucide-react`
  para ícones. Estado da sacola com React (Context + reducer).
- YAGNI: nada de CMS, i18n, tema escuro alternável, analytics, cupom ou múltiplas lojas.

## Restrições de Stack e Conteúdo

- Stack: Next.js 16.3.7 (App Router, `src/`), React 19, TypeScript estrito, Tailwind CSS v4
  (tokens via `@theme` em `src/app/globals.css`), ESLint (`eslint-config-next`). Testes da
  lógica pura com o runner nativo do Node (`node --test`), sem dependência extra.
- Fontes: definidas na seção (e) da auditoria e fixadas no `plan.md`.
- Idioma: todo conteúdo e documentação em português do Brasil. Preços em BRL (`Intl.NumberFormat`).
- Dados fictícios: "Fornada Padaria"; telefone e endereço claramente fictícios. O rodapé DEVE
  dizer que é um projeto fictício de portfólio.
- Imagens finais serão geradas por IA pelo dono do projeto a partir de `docs/prompts-imagens.md`;
  até lá, placeholders gerados por script ocupam os mesmos caminhos.

## Fluxo de Desenvolvimento e Portões de Qualidade

1. Fundação (tokens, fontes, layout, conteúdo, lógica da sacola e da mensagem, componentes base,
   placeholders) é sequencial e precede qualquer seção.
2. Seções são implementadas em blocos paralelos `[P]`, cada um dono exclusivo dos seus arquivos.
3. Integração: `page.tsx` monta as seções na ordem do plano.
4. Portões: lint → testes → build → Playwright (390 e 1440, fluxo de pedido, sem scroll
   horizontal, console limpo) → Lighthouse → revisão de acessibilidade.
5. Commits são feitos pelo dono do projeto; agentes não fazem `git commit`.

## Governance

- Esta constituição prevalece sobre preferências individuais de implementação. Qualquer violação
  DEVE ser justificada na tabela "Complexity Tracking" do plano.
- Emendas: editar este arquivo com Sync Impact Report, incrementar versão semântica (MAJOR para
  remoção/redefinição de princípio, MINOR para princípio/seção nova, PATCH para redação) e
  atualizar a data de emenda.
- Revisão de conformidade: o "Constitution Check" do `plan.md` e a verificação final DEVEM citar
  cada princípio aplicável.
- Orientação de runtime para agentes: `AGENTS.md` / `CLAUDE.md` na raiz.

**Version**: 1.0.0 | **Ratified**: 2026-09-29 | **Last Amended**: 2026-09-29
