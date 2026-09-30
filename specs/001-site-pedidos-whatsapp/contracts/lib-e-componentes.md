# Contrato: módulos de `src/lib/` e fronteiras de componentes

Este arquivo é a "API interna" que permite agentes trabalharem em paralelo. Quem implementa uma
seção NÃO muda assinaturas daqui; se precisar, avisa na entrega.

## `src/lib/` (puro, testável com `node --test`, imports relativos com `.ts`)

```ts
// tipos.ts — só tipos (Loja, Bairro, Categoria, Produto, Variacao, ItemSacola, LinhaSacola,
//            DadosPedido, Quando, InstanteLoja, ErrosPedido, EstadoSacola, AcaoSacola)

// dinheiro.ts
formatarBRL(centavos: number): string            // "R$ 18,00" (com NBSP, como o Intl gera)
formatarBRLTexto(centavos: number): string       // idem com espaço comum (mensagem)

// funcionamento.ts
instanteNaLoja(data: Date, fuso: string): InstanteLoja   // { data:'AAAA-MM-DD', diaSemana, minutos }
statusAgora(agora: InstanteLoja, loja: Loja): { aberto: boolean; texto: string }
  // "Aberto agora · fecha às 20h" | "Fechado · abre amanhã às 7h" | "Fechado · abre segunda às 7h"
  // | "Abre hoje às 7h"
horariosDisponiveis(p: { agora: InstanteLoja; loja: Loja; modo: 'retirada'|'entrega';
  temEncomenda: boolean }): { asap: boolean; dias: { data: string; rotulo: string;
  slots: number[] }[] }
formatarHora(minutos: number): string            // "07:30"
rotuloDia(data: string, agora: InstanteLoja): string  // "hoje" | "amanhã" | "sábado, 03/10"

// sacola.ts
estadoInicial: EstadoSacola
reduzirSacola(estado: EstadoSacola, acao: AcaoSacola): EstadoSacola
chaveItem(produtoId: string, variacaoId: string | null): string
reconciliar(itens: unknown, produtos: Produto[]): ItemSacola[]   // aceita lixo, devolve válido

// pedido.ts
montarLinhas(itens: ItemSacola[], produtos: Produto[]): LinhaSacola[]
resumo(linhas: LinhaSacola[], dados: Pick<DadosPedido,'modo'|'bairroId'>, loja: Loja):
  { quantidade: number; subtotal: number; taxa: number | null; total: number;
    faltaParaMinimo: number; temEncomenda: boolean }
validarPedido(dados: DadosPedido, linhas: LinhaSacola[], agora: InstanteLoja, loja: Loja): ErrosPedido
dadosIniciais: DadosPedido

// mensagem.ts — ver mensagem-whatsapp.md

// armazenamento.ts
ler<T>(chave: string): T | null       // try/catch, JSON inválido => null
gravar(chave: string, valor: unknown): void
apagar(chave: string): void
```

Testes: `dinheiro.test.ts`, `funcionamento.test.ts`, `sacola.test.ts`, `pedido.test.ts`,
`mensagem.test.ts`.

## Componentes compartilhados (fundação, donos: tarefa de fundação)

| Arquivo | Tipo | Contrato |
|---|---|---|
| `components/ui/Container.tsx` | server | `max-w-[1120px]` + gutters |
| `components/ui/Botao.tsx` | server | `variante: 'primario' \| 'secundario' \| 'whatsapp' \| 'texto'`, `tamanho`, como `<a>` ou `<button>` |
| `components/ui/TituloSecao.tsx` | server | `kicker?`, `titulo`, `destaque?` (palavra em itálico com sublinhado ondulado mel), `nivel: 1 \| 2`, `id` |
| `components/ui/Preco.tsx` | server | centavos → `<data value>` com `tabular-nums` e `nowrap`; `aPartirDe?` |
| `components/ui/Selo.tsx` | server | chip dos selos |
| `components/ui/Foto.tsx` | server | `chave` do manifesto → `next/image` com width/height/alt; `prioridade?`, `sizes` |
| `components/ui/Icone.tsx` | server | reexporta ícones `lucide-react` usados (1.5px) + `IconeWhatsApp` (SVG próprio) |
| `components/sacola/SacolaProvider.tsx` | client | Context: `{ itens, linhas, resumo(dados), adicionar, definirQuantidade, remover, desfazer, limpar, aberta, abrir(gatilho?), fechar }` + região `aria-live` + toast |
| `components/sacola/useSacola.ts` | client | hook do Context |
| `components/sacola/AdicionarAoPedido.tsx` | client | props `produto`; sem variação: botão "Adicionar" 48px que vira `− n +`; com variação: grupo de rádios (chips) + botão |
| `components/sacola/ControleQuantidade.tsx` | client | `− n +` com alvos 44×44, `aria-label` "Diminuir/Aumentar {nome}" |

## Seções (uma por arquivo, donos exclusivos por bloco)

| Arquivo | Âncora | Cliente? | Depende de |
|---|---|---|---|
| `sections/Header.tsx` (+ `sections/header/MenuMobile.tsx`, `StatusFuncionamento.tsx`, `BotaoSacola.tsx`) | — | parcial | ui, sacola, lib/funcionamento |
| `sections/Hero.tsx` | `#inicio` | não | ui |
| `sections/Queridinhos.tsx` | `#queridinhos` | não | ui, sacola, produto/CardProduto |
| `sections/Cardapio.tsx` (+ `sections/cardapio/BarraCategorias.tsx`) | `#cardapio`, `#cat-*` | barra sim | ui, sacola, produto/CardProduto |
| `sections/Encomendas.tsx` | `#encomendas` | não | ui, sacola, produto/CardProduto |
| `sections/Entrega.tsx` | `#entrega` | não | ui |
| `sections/Sobre.tsx` | `#sobre` | não | ui |
| `sections/OndeEstamos.tsx` | `#onde-estamos` | não (dia atual destacado por client pequeno `HojeDestaque`) | ui, lib |
| `sections/Rodape.tsx` | — | não | ui |
| `sacola/GavetaSacola.tsx` (+ `sacola/FormPedido.tsx`, `sacola/Confirmacao.tsx`) | — | sim | lib, sacola |
| `sacola/BarraSacolaMobile.tsx` | — | sim | sacola |

`CardProduto` (fundação; variantes `vertical` para vitrine e `lista` compacta no mobile) fica em `src/components/produto/CardProduto.tsx` (não dentro de uma seção)
para Queridinhos, Cardápio e Encomendas o usarem sem que uma seção importe outra.

## Adições da fundação (compatíveis; nenhuma assinatura acima mudou)

- `useSacola()` também expõe `quantidadeTotal`, `hidratado` (true depois de ler o localStorage),
  `aviso` (`{ id, texto, desfazerNome }`) e `fecharAviso()`. `fechar()` já devolve o foco ao gatilho
  passado em `abrir(gatilho)`.
- `SacolaProvider.tsx` exporta `AvisosSacola` (região `role="status"` + toast com "Desfazer").
  O Provider só o monta com a gaveta FECHADA, porque o `<dialog>` modal deixa o resto da página
  inerte. **A GavetaSacola (Bloco C) DEVE montar `<AvisosSacola />` dentro do `<dialog>`** e chamar
  `fechar()` no evento `close` (Esc).
- `ControleQuantidade` props: `{ chave, nome, quantidade, tamanho?: 'md'|'sm', className? }`
  (md = 48px, sm = 44px).
- `AdicionarAoPedido` props: `{ produto, compacto?, className? }`. Com variações, ele mesmo mostra
  o `Preco` ("a partir de" até escolher). Variação única (Cesta da tarde, "Única") já vem escolhida.
- `CardProduto` props: `{ produto, variante?: 'vertical'|'lista', nivel?: 3|4, sizes?, className? }`.
- `Botao`: além de `variante` e `tamanho`, `larguraTotal?`; `classesBotao()` exportado para quem
  precisa do estilo em outro elemento.
- `Foto` props: `{ chave, sizes, prioridade?, alt?, className? }` (`prioridade` → `preload`).
- `TituloSecao`: além do contrato, `sobreEscuro?` (kicker em mel) e `children` (parágrafo de apoio).
- Icone: `IconeWhatsApp` e `IconeInstagram` próprios (Lucide v1 não tem ícones de marca).
- `lib/`: `pedido.ts` exporta `OUTRO_BAIRRO`, `LIMITES` e o tipo `Resumo`; `funcionamento.ts`
  exporta também `formatarHoraCurta`, `nomeDia`, `estaAberto`, `somarDias`, `diaSemanaDe`;
  `dinheiro.ts` exporta `valorDecimal`; `armazenamento.ts` exporta `CHAVE_SACOLA` e `CHAVE_DADOS`.
- Token extra: `--color-whatsapp` (= alecrim), exigido pela constituição II.
