# Pendências e desvios registrados na verificação

- **LCP simulado 3,5–4,2 s** no Lighthouse mobile com as fotos finais (meta do plano: < 2,5 s).
  Performance oscila entre 84 e 91 de uma rodada para outra (meta ≥ 90); Acessibilidade, Boas
  práticas e SEO 100; 733 KB no total. O que pesa é a simulação de 4G lento carregando JS do Next
  e a fonte antes da foto do hero.
- **Âncora "Os mais pedidos"** é `#mais-pedidos` (arquivo continua `sections/Queridinhos.tsx`).
- **Hero 6/6** no desktop em vez de 5/7 (com 5/7 o h1 quebrava em 3 linhas).
- **Cardápio renderiza cada produto nas duas variantes** (grade no desktop, lista no mobile) e o
  CSS esconde uma; o HTML fica maior, mas a escondida sai da árvore de acessibilidade e a imagem
  lazy não é baixada.
- **Plano B do WhatsApp sempre visível** na confirmação: com `noopener`, `window.open` sempre
  devolve `null`, então não dá para detectar bloqueio.
- **`themeColor`** no `layout.tsx` é hex porque a API de viewport pede string (não é componente).
- `scripts/print.mjs` e `scripts/e2e-pedido.mjs` usam o Playwright instalado em `~/projetos/pbn`;
  para rodar em outra máquina, instale `playwright` como devDependency e troque o `require`.
