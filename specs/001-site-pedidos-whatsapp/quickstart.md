# Quickstart: validar o site da Fornada

## Pré-requisitos

- Node 22.23+ (roda os testes `.ts` direto, research R3).
- `npm install` na raiz de `padaria-fornada`.
- Placeholders gerados: `npm run placeholders` (pula arquivos que já existem).

## Portões automáticos

```bash
npm run lint      # sem erros
npm test          # node --test src/lib/*.test.ts, todos verdes (inclui M1–M7 do contrato da mensagem)
npm run build     # typecheck + build sem erros nem warnings de next/image/next/font
```

## Roteiro no navegador (Playwright, `npm run dev` ou `npm run build && npm start`)

Viewports: 390×844 e 1440×900 (e uma checagem em 360×740).

1. **Topo**: status de funcionamento aparece após carregar; botão "Fazer pedido" leva a `#cardapio`.
2. **Categorias**: tocar em "Bebidas" rola até `#cat-bebidas`; a barra fica fixa e marca "Bebidas".
3. **Adicionar**: em 3 produtos, "Adicionar"; o botão vira `− 1 +`; o contador do header mostra 3;
   a barra inferior (390px) mostra "Ver sacola · 3 itens · R$ X"; a região `role=status` anuncia.
4. **Quantidade**: `+` duas vezes num item → 3; `−` até 0 num outro → some e o toast oferece
   "Desfazer"; desfazer devolve.
5. **Variação**: no bolo de laranja escolher "M"; preço do card muda; adicionar; a sacola mostra
   "Bolo de laranja com calda (M)".
6. **Formulário**: abrir sacola → "Continuar"; tentar enviar vazio → erros ao lado dos campos e foco
   no primeiro. Com bolo na sacola, "assim que possível" não aparece e os dias começam em +48h.
7. **Entrega**: escolher entrega + Vila Serena com subtotal < R$ 40 (só um café) → aviso "Faltam R$ …".
8. **Envio**: preencher tudo e enviar. Interceptar `window.open` (ou ler o `href` do plano B) e
   comparar o texto decodificado com o formato do contrato. Tela de confirmação aparece; sacola
   continua até tocar "Esvaziar sacola".
9. **Persistência**: recarregar a página → sacola mantida. Com `localStorage` bloqueado (aba
   anônima com storage lançando erro, simulado sobrescrevendo `Storage.prototype.setItem`) → o
   fluxo inteiro funciona sem erro no console.
10. **Teclado**: repetir 3→8 só com Tab/Shift+Tab/Enter/Espaço/Esc; foco sempre visível; Esc fecha a
    gaveta e o foco volta ao botão da sacola.
11. **Layout**: `document.documentElement.scrollWidth <= innerWidth` em 360, 390, 768, 1024, 1440.
    Console sem erros. Todos os alvos interativos ≥ 44×44 em 390 (script que mede
    `getBoundingClientRect` de `a, button, input, select, textarea, [role=radio]`).
12. **Screenshots**: salvar em `docs/verificacao/` (`{390|1440}-{secao}.png`) e comparar o clima
    com `docs/referencia/benjamin-*.png`.

## Lighthouse (mobile, build de produção)

```bash
npm run build && npm start &
npx lighthouse http://localhost:3000 --preset=perf --form-factor=mobile --quiet --chrome-flags="--headless" --output=json --output-path=docs/verificacao/lighthouse.json
```

Metas: Performance ≥ 90, Acessibilidade ≥ 95, Boas práticas ≥ 95, SEO ≥ 95.
