// URL pública do site. No build da VPS vem de NEXT_PUBLIC_SITE_URL; o padrão é o domínio no ar.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://fornada.zyphex.site').replace(/\/+$/, '')
