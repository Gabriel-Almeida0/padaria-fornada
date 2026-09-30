# Contrato: mensagem do pedido e link do WhatsApp

Funções em `src/lib/mensagem.ts`. Testes em `src/lib/mensagem.test.ts` DEVEM cobrir todos os
casos abaixo, comparando texto exato.

```ts
montarMensagem(entrada: {
  linhas: LinhaSacola[]          // já com produto, variação, quantidade e totais (pedido.ts)
  dados: DadosPedido
  loja: Loja
  agora: InstanteLoja            // para escrever "hoje"/"amanhã"
}): string

linkWhatsApp(numero: string, texto: string): string
// => `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`
// numero: só dígitos; lança erro se tiver outro caractere.
```

## Regras de formato

1. Linha 1: `Olá, Fornada! Quero fazer um pedido 🥖`, depois linha em branco.
2. Uma linha por item: `{qtd}× {nome}{ (variação) se houver} — {total da linha}`. O "×" é U+00D7
   e o travessão é U+2014, com espaço comum dos dois lados.
3. Linha em branco, depois `Subtotal: R$ X`.
4. Se entrega com bairro cadastrado: `Entrega ({bairro}): R$ X`. Se "Outro bairro":
   `Entrega: a combinar`. Retirada: nenhuma linha de taxa.
5. `Total: R$ X` (com "outro bairro", o total é o subtotal e a linha vira
   `Total: R$ X + entrega a combinar`). Linha em branco.
6. Modo:
   - Retirada: `Retirada na loja: {rua}, {numero} — {bairro da loja}`
   - Entrega: `Entrega: {endereco}{, complemento} — {bairro}`
7. Quando:
   - asap: `Quando: assim que possível`
   - agendado hoje: `Quando: hoje, às HH:MM`
   - amanhã: `Quando: amanhã, às HH:MM`
   - outro dia: `Quando: {dia da semana por extenso}, DD/MM, às HH:MM`
8. `Pagamento: Pix` | `Pagamento: cartão na {entrega|retirada}` |
   `Pagamento: dinheiro` + `, troco para R$ X` quando informado.
9. `Mensagem do cartão: "{texto}"` só se houver encomenda e texto não vazio.
10. `Observações: {texto}` só se não vazio; quebras de linha internas viram ` / `.
11. Linha em branco, `Nome: {nome}`.
12. Valores com `formatarBRL` e o NBSP trocado por espaço comum. Espaços nas pontas de campos de
    texto são removidos (`trim`). Sem linha em branco dupla, sem espaço no fim de linha.

## Casos de teste obrigatórios

| # | Cenário | Verifica |
|---|---|---|
| M1 | Exemplo completo da spec (2 itens, entrega Vila Serena, agendado sábado 03/10/2026 09:30 com `agora` = quarta 30/09/2026 15:00, Pix, cartão, obs.) | texto idêntico ao bloco da spec |
| M2 | Retirada, asap, cartão, 1 item sem variação | sem linha de taxa, "cartão na retirada" |
| M3 | Entrega "outro bairro", dinheiro com troco | "Entrega: a combinar", total com "+ entrega a combinar", troco |
| M4 | Observação com acento, emoji, `&`, `#`, `?` e quebra de linha | texto íntegro; quebra vira " / " |
| M5 | `linkWhatsApp` com o texto de M4 | `decodeURIComponent` do parâmetro devolve o texto original; `&`/`#`/`?` codificados |
| M6 | Nome com espaços nas pontas | `trim` aplicado |
| M7 | Número com máscara `(11) 9...` | lança erro |

Nota: o M1 usa o cardápio e a loja reais (bolo M R$ 78,00, taxa da Vila Serena R$ 5,00); o bloco
da spec foi alinhado a esses valores e a data corrigida para sábado 03/10/2026.
