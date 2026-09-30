// Dinheiro em centavos inteiros. Uma única instância de Intl para todo o site.

const formatador = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

/** "R$ 18,00", com o NBSP (U+00A0) que o Intl gera entre "R$" e o número. Para a interface. */
export function formatarBRL(centavos: number): string {
  return formatador.format(Math.round(centavos) / 100)
}

/** Igual a `formatarBRL`, mas com espaço comum. Para a mensagem do WhatsApp. */
export function formatarBRLTexto(centavos: number): string {
  return formatarBRL(centavos).replace(/ /g, ' ')
}

/** Valor para o atributo `value` de `<data>`: "18.00". */
export function valorDecimal(centavos: number): string {
  return (Math.round(centavos) / 100).toFixed(2)
}
