// localStorage só como conveniência: tudo em try/catch, e sem `window` vira no-op.

function storage(): Storage | null {
  try {
    if (typeof window === 'undefined') return null
    return window.localStorage
  } catch {
    return null
  }
}

/** Lê e faz JSON.parse. Storage indisponível, chave ausente ou JSON inválido => null. */
export function ler<T>(chave: string): T | null {
  try {
    const bruto = storage()?.getItem(chave)
    if (bruto == null) return null
    return JSON.parse(bruto) as T
  } catch {
    return null
  }
}

export function gravar(chave: string, valor: unknown): void {
  try {
    storage()?.setItem(chave, JSON.stringify(valor))
  } catch {
    // storage cheio ou bloqueado: o site segue funcionando sem lembrar
  }
}

export function apagar(chave: string): void {
  try {
    storage()?.removeItem(chave)
  } catch {
    // idem
  }
}

export const CHAVE_SACOLA = 'fornada:sacola:v1'
export const CHAVE_DADOS = 'fornada:dados:v1'
