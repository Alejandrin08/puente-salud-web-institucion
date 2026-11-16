const MENORES = new Set(['de', 'del', 'la', 'las', 'los', 'el', 'y', 'en', 'a'])
const SIGLAS = new Set(['umf', 'imss', 'issste', 'ssa', 'cmct', 'dif', 'i.a.p', 'a.c.'])

/** «CENTRO DE SALUD SAN JOSÉ» -> «Centro de Salud San José». */
export function nombrePropio(texto: string): string {
  return texto
    .toLowerCase()
    .split(/\s+/)
    .map((w, i) => {
      if (SIGLAS.has(w)) return w.toUpperCase()
      if (i > 0 && MENORES.has(w)) return w
      return w.charAt(0).toUpperCase() + w.slice(1)
    })
    .join(' ')
}

function aFecha(iso: string): Date {
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number)
  return new Date(y, m - 1, d)
}

/** «jueves 19 de noviembre» */
export function fechaLarga(iso: string): string {
  return new Intl.DateTimeFormat('es-MX', { weekday: 'long', day: 'numeric', month: 'long' }).format(aFecha(iso))
}

/** «19 nov 2026» */
export function fechaCorta(iso: string): string {
  return new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })
    .format(aFecha(iso))
    .replace('.', '')
}

export function hora(h: string | null | undefined): string {
  return h ? h.slice(0, 5) : ''
}

export function distancia(km: number | null | undefined): string {
  if (km == null) return ''
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`
}
