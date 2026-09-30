# Fornada Padaria

Site de uma padaria **fictícia**, feito como peça de portfólio. A pessoa monta o pedido no
cardápio, revisa na sacola, preenche nome, retirada ou entrega, horário e pagamento, e o site abre
o WhatsApp da padaria com a mensagem pronta. Não há backend: tudo roda no navegador.

O estilo foi inspirado no site do Benjamin a Padaria, **sem copiar** textos, cores, fontes nem
imagens. Os 22 pontos fracos de UX e design medidos nele estão em
`docs/referencia/benjamin-auditoria.md` e cada um foi ligado a um requisito na spec.

## Stack

Next.js 16 (App Router, página estática), React 19, TypeScript, Tailwind CSS 4, `lucide-react`.
Fontes Fraunces e Figtree via `next/font`. A lógica do pedido (dinheiro em centavos, sacola,
horários no fuso de São Paulo, validação e texto do WhatsApp) fica em `src/lib/`, testada com
`node --test`.

## Rodar

```bash
npm install
npm run placeholders   # gera as imagens provisórias (pula as que já existem)
npm run dev            # http://localhost:3000
npm test               # 48 testes da lógica
npm run lint
npm run build
```

Teste de ponta a ponta do fluxo de pedido (usa Playwright + Google Chrome instalado):

```bash
npm run build && npx next start -p 3200
node scripts/e2e-pedido.mjs
```

`scripts/print.mjs <caminho> <saida.png> [largura] [altura]` tira prints do servidor na porta 3200
e mostra scroll horizontal, erros de console e alvos de toque menores que 44 px.

## Imagens

As 27 fotos foram geradas com o Nano Banana 2 (`npm run gerar-imagens`, chave em
`nanobanana.env`, fora do git; originais em `docs/imagens-geradas/`). O hero sai em 2K e o resto em
1K. O script gera primeiro o pão da casa e usa a foto como referência nas outras, para manter o
mesmo cenário. Para refazer uma: `npm run gerar-imagens -- produto-brownie`.

Antes das fotos, eram placeholders. Os prompts para gerar as finais, com tamanho, corte e peso de cada
uma, estão em `docs/prompts-imagens.md`. Basta salvar o arquivo final com o mesmo nome em
`public/images/` (produtos em `public/images/produtos/`); nenhum código muda.

## Onde está o quê

| Pasta | Conteúdo |
|---|---|
| `src/content/` | textos, cardápio, dados da loja, manifesto das imagens |
| `src/lib/` | lógica pura + testes |
| `src/components/sections/` | uma seção da página por arquivo |
| `src/components/sacola/` | sacola, formulário do pedido e confirmação |
| `specs/001-site-pedidos-whatsapp/` | spec, plano, pesquisa, contratos e tarefas (speckit) |
| `docs/referencia/` | auditoria do site de referência e prints |
| `docs/verificacao/` | prints e relatório do Lighthouse do site pronto |

Número de WhatsApp, endereço e bairros são inventados; para usar de verdade, troque em
`src/content/loja.ts`.
